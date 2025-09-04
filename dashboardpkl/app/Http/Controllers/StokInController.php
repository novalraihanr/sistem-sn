<?php

namespace App\Http\Controllers;

use App\Models\StokIn;
use App\Models\Inventori;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\HistoryUsersController;

class StokInController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $stokIn = StokIn::with('inventori.kategoriInv')->get();
        return response()->json($stokIn);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'nama_produk' => 'required|string|max:255',
            'nama_kategori' => 'required|string|max:255',
            'stokin_kuantitas' => 'required|integer|min:1',
            'stokin_spesifikasi' => 'nullable|string|max:255',
            'stokin_nopomo' => 'required|string|max:255',
            'stokin_harga_produk' => 'required|integer|min:0',
            'stokin_tanggal' => 'required|date',
            'produk_satuan' => 'required|string|max:255',
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
                'bulan_sekarang' => now()->toDateString(),
            ]
        );

        $stokin_harga_total = $validated['stokin_kuantitas'] * $validated['stokin_harga_produk'];

        $stokIn = StokIn::create([
            'id_produk' => $inventori->id_produk,
            'stokin_kuantitas' => $validated['stokin_kuantitas'],
            'stokin_spesifikasi' => $validated['stokin_spesifikasi'],
            'stokin_nopomo' => $validated['stokin_nopomo'],
            'stokin_digunakan' => $user->name,
            'stokin_harga_produk' => $validated['stokin_harga_produk'],
            'stokin_harga_total' => $stokin_harga_total,
            'stokin_tanggal' => $validated['stokin_tanggal'],
        ]);

        HistoryUsersController::record("{$user->name} telah menambahkan stok masuk untuk produk: {$inventori->nama_produk} sebanyak {$stokIn->stokin_kuantitas}");

        // Update inventori stok
        $inventori->stok_in += $validated['stokin_kuantitas'];
        $this->updateInventoriStok($inventori);

        return response()->json($stokIn, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $stokIn = StokIn::with('inventori.kategoriInv')->findOrFail($id);
        return response()->json($stokIn);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $stokIn = StokIn::findOrFail($id);
        $inventori = $stokIn->inventori;

        $oldKuantitas = $stokIn->stokin_kuantitas;

        $validated = $request->validate([
            'id_produk' => 'sometimes|required|exists:inventori,id_produk',
            'nama_produk' => 'sometimes|required|string|max:255', // Added for updating inventori nama_produk
            'stokin_kuantitas' => 'sometimes|required|integer|min:1',
            'stokin_nopomo' => 'sometimes|required|string|max:255',
            'stokin_harga_produk' => 'sometimes|required|integer|min:0',
            'stokin_tanggal' => 'sometimes|required|date',
        ]);

        $stokIn->update($validated);

        $user = Auth::user();
        if ($user) {
            HistoryUsersController::record("{$user->name} telah mengupdate stok masuk untuk produk: {$inventori->nama_produk}");
        }

        // Update inventori nama_produk if provided
        if (isset($validated['nama_produk'])) {
            $inventori->nama_produk = $validated['nama_produk'];
            $inventori->save();
        }

        // Adjust inventori stok
        $inventori->stok_in = $inventori->stok_in - $oldKuantitas + $stokIn->stokin_kuantitas;
        $this->updateInventoriStok($inventori);

        return response()->json($stokIn);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $stokIn = StokIn::findOrFail($id);
        $inventori = $stokIn->inventori;

        $user = Auth::user();
        if ($user) {
            HistoryUsersController::record("{$user->name} telah menghapus stok masuk untuk produk: {$inventori->nama_produk} sebanyak {$stokIn->stokin_kuantitas}");
        }

        // Revert stok changes
        $inventori->stok_in -= $stokIn->stokin_kuantitas;
        $this->updateInventoriStok($inventori);

        $stokIn->delete();

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
        } elseif ($inventori->stok_akhir == 0) {
            $inventori->produk_status = 'By Order';
        }

        $inventori->save();
    }

    public function getSummary()
    {
        $totalKategori = \App\Models\KategoriInv::count();
        $totalProduk = Inventori::count();
        $totalStokIn = StokIn::sum('stokin_kuantitas');
        $totalHarga = StokIn::sum('stokin_harga_total');

        $latestUpdate = StokIn::max('updated_at');

        return response()->json([
            'total_kategori' => $totalKategori,
            'total_produk' => $totalProduk,
            'total_stok_in' => $totalStokIn,
            'total_harga' => $totalHarga,
            'latest_update' => $latestUpdate ? $latestUpdate : null,
        ]);
    }
}
