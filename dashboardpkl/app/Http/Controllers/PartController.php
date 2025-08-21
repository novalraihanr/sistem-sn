<?php

namespace App\Http\Controllers;

use App\Models\Part;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\HistoryUsersController;

class PartController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $part = Part::with('kategoriPart')->get();
        return response()->json($part);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_part' => 'required|string|max:255',
            'id_kategori_part' => 'required|exists:kategori_part,id_kategori_part',
            'id_part' => 'nullable|string|max:255',
        ]);

        $user = Auth::user();

        $part = Part::firstOrCreate(
            [
                'nama_part' => $request->nama_part,
                'id_kategori_part' => $request->id_kategori_part,
                'id_part' => $request->id_part,
            ]
        );

        if ($part->wasRecentlyCreated) {
            HistoryUsersController::record("{$user->name} telah menambahkan part baru: {$part->nama_part}");
        }

        $statusCode = $part->wasRecentlyCreated ? 201 : 200;

        return response()->json($part, $statusCode);
    }

    /**
     * Display the specified resource.
     */
    public function show(Part $part)
    {
        return response()->json(Part::with('kategoriPart', 'vendors')->find($part->id_part));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Part $part)
    {
        $request->validate([
            'nama_part' => 'sometimes|string|max:255',
            'id_kategori_part' => 'sometimes|exists:kategori_part,id_kategori_part',
            'id_part' => 'sometimes|string|max:255',
        ]);

        $user = Auth::user();
        $oldName = $part->nama_part;

        $updateData = $request->only(['nama_part', 'id_kategori_part', 'id_part']);

        $part->update($updateData);

        HistoryUsersController::record("{$user->name} telah mengupdate part: {$oldName} menjadi {$part->nama_part}");

        return response()->json($part);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Part $part)
    {
        $user = Auth::user();
        HistoryUsersController::record("{$user->name} telah menghapus part: {$part->nama_part}");
        $part->delete();

        return response()->json(null, 204);
    }

    public function getBestPrices()
    {
        $bestPrices = DB::query()
            ->fromSub(function ($query) {
                $query->select(
                    'vp.id_part',
                    'p.nama_part',
                    'v.id_vendor',
                    'v.nama_vendor',
                    'vp.harga_part',
                    'vp.created_at',
                    'vp.updated_at',
                    DB::raw('ROW_NUMBER() OVER (PARTITION BY vp.id_part ORDER BY vp.harga_part ASC, vp.updated_at DESC) as rn')
                )
                ->from('vendor_part as vp')
                ->join('part as p', 'vp.id_part', '=', 'p.id_part')
                ->join('vendor as v', 'vp.id_vendor', '=', 'v.id_vendor');
            }, 'best_prices_ranked')
            ->where('rn', 1)
            ->orderBy('nama_part')
            ->get();

        return response()->json($bestPrices);
    }
}
