<?php

namespace App\Http\Controllers;

use App\Models\Inventori;
use App\Models\Vendor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\HistoryUsersController;
use App\Http\Controllers\HistoryInventoriController;
use Illuminate\Support\Facades\Cache;

class InventoriController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $inventori = Inventori::with('kategoriInv')->get();
        return response()->json($inventori);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:255',
            'nama_produk' => 'required|string|max:255',
            'stok_awal' => 'required|integer|min:0',
            'produk_satuan' => 'required|string|max:255',
            'produk_minimum_stok' => 'required|integer|min:0',
            'spesifikasi' => 'required|string|max:255',
        ]);

        // Find or create the KategoriInv
        $kategori = \App\Models\KategoriInv::firstOrCreate(
            ['nama_kategori' => $validated['nama_kategori']]
        );

        $inventori = Inventori::create([
            'id_kategori' => $kategori->id_kategori,
            'nama_produk' => $validated['nama_produk'],
            'stok_awal' => $validated['stok_awal'],
            'stok_akhir' => $validated['stok_awal'], // Initial stok_akhir is stok_awal
            'stok_in' => 0,
            'stok_out' => 0,
            'produk_satuan' => $validated['produk_satuan'],
            'produk_minimum_stok' => $validated['produk_minimum_stok'],
            'spesifikasi' => $validated['spesifikasi'],
            'bulan_sekarang' => now()->toDateString(),
        ]);

        $user = Auth::user();
        if ($user) {
            HistoryUsersController::record("{$user->name} telah menambahkan inventori baru: {$inventori->nama_produk}");
        }

        $this->updateProdukStatus($inventori);

        return response()->json($inventori, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $inventori = Inventori::with('kategoriInv')->findOrFail($id);
        return response()->json($inventori);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $inventori = Inventori::findOrFail($id);
        $oldName = $inventori->nama_produk;

        $validated = $request->validate([
            'nama_kategori' => 'sometimes|required|string|max:255',
            'nama_produk' => 'sometimes|required|string|max:255',
            'stok_awal' => 'sometimes|required|integer|min:0',
            'produk_satuan' => 'sometimes|required|string|max:255',
            'produk_minimum_stok' => 'sometimes|required|integer|min:0',
            'spesifikasi' => 'sometimes|string|max:255',
        ]);

        // Find or create the KategoriInv if nama_kategori is provided
        if (isset($validated['nama_kategori'])) {
            $kategori = \App\Models\KategoriInv::firstOrCreate(
                ['nama_kategori' => $validated['nama_kategori']]
            );
            $inventori->id_kategori = $kategori->id_kategori;
        }

        $inventori->fill($validated);

        // Always recalculate stok_akhir to ensure consistency
        $inventori->stok_akhir = $inventori->stok_awal + $inventori->stok_in - $inventori->stok_out;

        // Update produk_status based on the new stok_akhir
        if ($inventori->stok_akhir <= $inventori->produk_minimum_stok + 2) {
            $inventori->produk_status = 'Need Order';
        } elseif ($inventori->stok_akhir > $inventori->produk_minimum_stok) {
            $inventori->produk_status = 'Cukup';
        } else {
            $inventori->produk_status = 'By Order';
        }

        $inventori->save(); // Save all changes at once

        $user = Auth::user();
        if ($user) {
            HistoryUsersController::record("{$user->name} telah mengupdate inventori: {$oldName}");
        }

        return response()->json($inventori);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $inventori = Inventori::findOrFail($id);
        $user = Auth::user();
        if ($user) {
            HistoryUsersController::record("{$user->name} telah menghapus inventori: {$inventori->nama_produk}");
        }
        $inventori->delete();

        return response()->json(null, 204);
    }

    public function updateAllProdukStatus()
    {
        $inventoriItems = Inventori::all();

        foreach ($inventoriItems as $inventori) {
            $this->updateProdukStatus($inventori);
        }

        return response()->json(['message' => 'All inventori produk statuses updated successfully.']);
    }

    public function getCounts()
    {
        $inventoriCount = Inventori::count();
        $kategoriCount = \App\Models\KategoriInv::count();
        $supplierCount = Vendor::count();
        $latestUpdate = Inventori::max('updated_at');

        return response()->json([
            'total_produk' => $inventoriCount,
            'total_kategori' => $kategoriCount,
            'total_supplier' => $supplierCount,
            'latest_update' => $latestUpdate ? $latestUpdate : null,
        ]);
    }

    public function searchByName(Request $request)
    {
        $request->validate([
            'nama_produk' => 'required|string|max:255',
        ]);

        $inventori = Inventori::where('nama_produk', 'like', '%' . $request->nama_produk . '%')
                                ->with('kategoriInv')
                                ->get();

        if ($inventori->isNotEmpty()) {
            return response()->json($inventori);
        } else {
            return response()->json([]);
        }
    }

    public function getMonthlyStockData(Request $request)
    {
        $query = Inventori::query();

        if ($request->has('nama_produk') && $request->nama_produk !== 'Parts') {
            $query->where('nama_produk', $request->nama_produk);
        }

        $inventoriId = $query->value('id_produk'); // Get the id_produk for the selected product

        if (!$inventoriId) {
            // If no product found, return empty monthly data
            $monthlyData = [];
            for ($i = 1; $i <= 12; $i++) {
                $monthlyData[$i] = [
                    'month' => $i,
                    'total_stok_in' => 0,
                    'total_stok_out' => 0,
                ];
            }
            return response()->json(array_values($monthlyData));
        }

        $stokIn = DB::table('stok_in')
            ->selectRaw('MONTH(stokin_tanggal) as month, SUM(stokin_kuantitas) as total_stok_in')
            ->where('id_produk', $inventoriId)
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $stokOut = DB::table('stok_out')
            ->selectRaw('MONTH(stokin_tanggal) as month, SUM(stokout_kuantitas) as total_stok_out')
            ->where('id_produk', $inventoriId)
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $monthlyData = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthlyData[$i] = [
                'month' => $i,
                'total_stok_in' => (int) ($stokIn[$i]->total_stok_in ?? 0),
                'total_stok_out' => (int) ($stokOut[$i]->total_stok_out ?? 0),
            ];
        }

        return response()->json(array_values($monthlyData));
    }

    public function getAllProductNames()
    {
        $productNames = Inventori::distinct()->pluck('nama_produk');
        return response()->json($productNames);
    }

    public function getLowStockAlerts()
    {
        $lowStockInventori = Inventori::whereIn('produk_status', ['Need Order', 'By Order', 'Cukup'])
            ->orderByRaw("
                CASE
                    WHEN produk_status = 'Need Order' THEN 1
                    WHEN produk_status = 'By Order' THEN 2
                    WHEN produk_status = 'Cukup' THEN 3
                    ELSE 4
                END
            ")
            ->limit(5)
            ->get();

        return response()->json($lowStockInventori);
    }

    public function getInventorySummary()
    {
        $totalStokAkhir = Inventori::sum('stok_akhir');
        $totalStokIn = Inventori::sum('stok_in');
        $totalStokOut = Inventori::sum('stok_out');

        return response()->json([
            'total_stok_akhir' => $totalStokAkhir,
            'total_stok_in' => $totalStokIn,
            'total_stok_out' => $totalStokOut,
        ]);
    }

    public function triggerArchive()
    {
        $today = Carbon::today()->toDateString();
        $lastRun = Cache::get('archive_inventori_last_run');

        if ($lastRun === $today) {
            return response()->json(['message' => 'Inventory archiving has already been run today.'], 200);
        }

        $historyController = new HistoryInventoriController();
        $response = $historyController->archiveOldInventori();

        if ($response->getStatusCode() === 200) {
            // Cache for 24 hours (1440 minutes)
            Cache::put('archive_inventori_last_run', $today, 1440);
        }

        return $response;
    }
}
