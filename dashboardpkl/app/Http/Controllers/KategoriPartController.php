<?php

namespace App\Http\Controllers;

use App\Models\KategoriPart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\HistoryUsersController;

class KategoriPartController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $kategoriPart = KategoriPart::with('parts')->get();
        return response()->json($kategoriPart);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_kategori' => 'required|string|max:255',
        ]);

        $kategoriPart = KategoriPart::create($request->all());

        $user = Auth::user();
        if ($user) {
            HistoryUsersController::record("{$user->name} telah menambahkan kategori part baru: {$kategoriPart->nama_kategori}");
        }

        return response()->json($kategoriPart->load('parts'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(KategoriPart $kategoriPart)
    {
        return response()->json($kategoriPart->load('parts'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, KategoriPart $kategoriPart)
    {
        $request->validate([
            'nama_kategori' => 'required|string|max:255',
        ]);

        $oldName = $kategoriPart->nama_kategori;
        $kategoriPart->update($request->all());

        $user = Auth::user();
        if ($user) {
            HistoryUsersController::record("{$user->name} telah mengupdate kategori part: {$oldName} menjadi {$kategoriPart->nama_kategori}");
        }

        return response()->json($kategoriPart);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(KategoriPart $kategoriPart)
    {
        $user = Auth::user();
        if ($user) {
            HistoryUsersController::record("{$user->name} telah menghapus kategori part: {$kategoriPart->nama_kategori}");
        }

        $kategoriPart->delete();

        return response()->json(null, 204);
    }

    public function getParts(KategoriPart $kategoriPart)
    {
        $parts = $kategoriPart->parts()->with('vendors')->get();

        $result = [];
        foreach ($parts as $part) {
            if ($part->vendors->isNotEmpty()) {
                foreach ($part->vendors as $vendor) {
                    $result[] = [
                        'id_part' => $part->id_part,
                        'id_kategori_part' => $part->id_kategori_part,
                        'nama_part' => $part->nama_part,
                        'merk_part' => $vendor->pivot->merk_part,
                        'harga_part' => $vendor->pivot->harga_part,
                        'id_vendor' => $vendor->id_vendor,
                        'nama_vendor' => $vendor->nama_vendor,
                    ];
                }
            } else {
                $result[] = [
                    'id_part' => $part->id_part,
                    'id_kategori_part' => $part->id_kategori_part,
                    'nama_part' => $part->nama_part,
                    'merk_part' => null,
                    'harga_part' => null,
                    'nama_vendor' => null,
                ];
            }
        }

        return response()->json($result);
    }

    public function firstOrCreate(Request $request)
    {
        $request->validate([
            'nama_kategori' => 'required|string|max:255',
        ]);

        $kategoriPart = KategoriPart::firstOrCreate(
            ['nama_kategori' => $request->nama_kategori]
        );

        $user = Auth::user();
        if ($user && $kategoriPart->wasRecentlyCreated) {
            HistoryUsersController::record("{$user->name} telah menambahkan kategori part baru: {$kategoriPart->nama_kategori}");
        }

        return response()->json($kategoriPart->load('parts'), $kategoriPart->wasRecentlyCreated ? 201 : 200);
    }

    public function searchByName($name)
    {
        $kategoriPart = KategoriPart::where('nama_kategori', 'like', '%' . $name . '%')->get();
        return response()->json($kategoriPart);
    }
}
