<?php

namespace App\Http\Controllers;

use App\Models\StokOut;
use App\Models\Inventori;
use App\Http\Controllers\HistoryUsersController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class StokOutController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $stokOut = StokOut::with('inventori.kategoriInv')->get();
        return response()->json($stokOut);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_produk' => 'required|string|max:255',
            'nama_kategori' => 'required|string|max:255',
            'stokout_kuantitas' => 'required|integer|min:1',
            'stokout_spesifikasi' => 'nullable|string|max:255',
            'stokout_digunakan' => 'required|string|max:255',
            'stokout_divisi' => 'required|string|max:255',
            'stokout_keterangan' => 'required|string|max:255',
            'stokin_tanggal' => 'required|date',
            'produk_satuan' => 'required|string|max:255',
            'produk_minimum_stok' => 'required|integer|min:0',
        ]);

        // Find or create the KategoriInv
        $kategori = \App\Models\KategoriInv::firstOrCreate(
            ['nama_kategori' => $validated['nama_kategori']]
        );

        // Find or create the Inventori item
        $inventori = Inventori::firstOrCreate(
            ['nama_produk' => $validated['nama_produk']],
            [
                'id_kategori' => $kategori->id_kategori,
                'stok_awal' => 0, // Initial stok_awal for newly created product
                'stok_akhir' => 0,
                'stok_in' => 0,
                'stok_out' => 0,
                'produk_satuan' => $validated['produk_satuan'],
                'produk_minimum_stok' => $validated['produk_minimum_stok'],
                'bulan_sekarang' => now()->toDateString(),
            ]
        );

        // Check if there's enough stock before creating stok-out
        $potentialStokAkhir = ($inventori->stok_awal + $inventori->stok_in) - ($inventori->stok_out + $validated['stokout_kuantitas']);
        if ($potentialStokAkhir < 0) {
            return response()->json(['message' => 'Stok tidak cukup untuk melakukan pengeluaran ini.'], 400);
        }

        $stokOut = StokOut::create([
            'id_produk' => $inventori->id_produk,
            'stokout_kuantitas' => $validated['stokout_kuantitas'],
            'stokout_spesifikasi' => $validated['stokout_spesifikasi'],
            'stokout_digunakan' => $validated['stokout_digunakan'],
            'stokout_divisi' => $validated['stokout_divisi'],
            'stokout_keterangan' => $validated['stokout_keterangan'],
            'stokin_tanggal' => $validated['stokin_tanggal'],
        ]);

        $user = Auth::user();
        if ($user) {
            HistoryUsersController::record("{$user->name} telah menambahkan stok keluar untuk produk: {$inventori->nama_produk} sebanyak {$stokOut->stokout_kuantitas}");
        }

        // Update inventori stok
        $inventori->stok_out += $validated['stokout_kuantitas'];
        $this->updateInventoriStok($inventori);

        return response()->json($stokOut, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $stokOut = StokOut::with('inventori.kategoriInv')->findOrFail($id);
        return response()->json($stokOut);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $stokOut = StokOut::findOrFail($id);
        $inventori = $stokOut->inventori;

        $oldKuantitas = $stokOut->stokout_kuantitas;

        $validated = $request->validate([
            'id_produk' => 'sometimes|required|exists:inventori,id_produk',
            'stokout_kuantitas' => 'sometimes|required|integer|min:1',
            'stokout_digunakan' => 'sometimes|required|string|max:255',
            'stokout_divisi' => 'sometimes|required|string|max:255',
            'stokout_keterangan' => 'sometimes|required|string|max:255',
            'stokin_tanggal' => 'sometimes|required|date',
        ]);

        $stokOut->update($validated);

        $user = Auth::user();
        if ($user) {
            HistoryUsersController::record("{$user->name} telah mengupdate stok keluar untuk produk: {$inventori->nama_produk}");
        }

        // Adjust inventori stok
        $inventori->stok_out = $inventori->stok_out - $oldKuantitas + $stokOut->stokout_kuantitas;

        // Check if there's enough stock after the update
        $potentialStokAkhir = $inventori->stok_awal + $inventori->stok_in - $inventori->stok_out;
        if ($potentialStokAkhir < 0) {
            // Revert the change before failing
            $inventori->stok_out = $inventori->stok_out + $oldKuantitas - $stokOut->stokout_kuantitas;
            return response()->json(['message' => 'Stok tidak cukup setelah perubahan kuantitas pengeluaran.'], 400);
        }

        $this->updateInventoriStok($inventori);

        return response()->json($stokOut);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $stokOut = StokOut::findOrFail($id);
        $inventori = $stokOut->inventori;

        $user = Auth::user();
        if ($user) {
            HistoryUsersController::record("{$user->name} telah menghapus stok keluar untuk produk: {$inventori->nama_produk} sebanyak {$stokOut->stokout_kuantitas}");
        }

        // Revert stok changes
        $inventori->stok_out -= $stokOut->stokout_kuantitas;
        $this->updateInventoriStok($inventori);

        $stokOut->delete();

        return response()->json(null, 204);
    }

    /**
     * Helper function to update inventori stok_akhir and produk_status.
     */
    protected function updateInventoriStok(Inventori $inventori)
    {
        // Correctly calculate stok_akhir
        $inventori->stok_akhir = $inventori->stok_awal + $inventori->stok_in - $inventori->stok_out;

        // Update produk_status based on the new stok_akhir
        if ($inventori->stok_akhir <= $inventori->produk_minimum_stok + 2) {
            $inventori->produk_status = 'Need Order';
        } elseif ($inventori->stok_akhir > $inventori->produk_minimum_stok) {
            $inventori->produk_status = 'Cukup';
        } else {
            $inventori->produk_status = 'By Order';
        }

        $inventori->save();
    }

    public function getSummary()
    {
        $totalKategori = \App\Models\KategoriInv::count();
        $totalProduk = Inventori::count();
        $totalKuantitas = StokOut::sum('stokout_kuantitas');
        $latestUpdate = StokOut::max('updated_at');

        return response()->json([
            'total_kategori' => $totalKategori,
            'total_produk' => $totalProduk,
            'total_kuantitas' => $totalKuantitas,
            'latest_update' => $latestUpdate ? $latestUpdate : null,
        ]);
    }

    public function getStokOutYears()
    {
        $years = StokOut::selectRaw('YEAR(stokin_tanggal) as year')
            ->whereNotNull('stokin_tanggal')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year');
        return response()->json($years);
    }

    public function getMonthlyData(Request $request)
    {
        $query = StokOut::query();
        $year = $request->input('tahun');
        $productName = $request->input('nama_produk');

        if ($year && $year != 'Semua Tahun') {
            $query->whereYear('stokin_tanggal', $year);
        }

        if ($productName && $productName != 'Semua Produk') {
            $query->whereHas('inventori', function ($q) use ($productName) {
                $q->where('nama_produk', $productName);
            });
        }

        $data = $query->selectRaw('MONTH(stokin_tanggal) as month, SUM(stokout_kuantitas) as total_stok_out')
            ->groupBy('month')
            ->get();

        return response()->json($data);
    }
}
