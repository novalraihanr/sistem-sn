<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\HistoryUsersController;

class VendorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $vendor = Vendor::get();
        return response()->json($vendor);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_vendor' => 'required|string|max:255',
            'alamat_vendor' => 'required|string|max:255',
            'kontak_vendor' => 'required|string|max:255',
        ]);

        $user = Auth::user();

        $vendor = Vendor::firstOrCreate(
            ['nama_vendor' => $request->nama_vendor],
            [
                'alamat_vendor' => $request->alamat_vendor,
                'kontak_vendor' => $request->kontak_vendor,
                'createdby' => $user->name,
            ]
        );

        if ($vendor->wasRecentlyCreated) {
            HistoryUsersController::record("{$user->name} telah menambahkan vendor baru: {$vendor->nama_vendor}");
        }

        return response()->json($vendor, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $vendor = Vendor::findOrFail($id);
        return response()->json($vendor);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id)
    {
        $request->validate([
            'nama_vendor' => 'required|string|max:255',
            'alamat_vendor' => 'required|string|max:255',
            'kontak_vendor' => 'required|string|max:255',
        ]);

        $user = Auth::user();
        $vendor = Vendor::findOrFail($id);
        $oldName = $vendor->nama_vendor;

        $vendor->update([
            'nama_vendor' => $request->nama_vendor,
            'alamat_vendor' => $request->alamat_vendor,
            'kontak_vendor' => $request->kontak_vendor,
            'updatedby' => $user->name,
        ]);

        HistoryUsersController::record("{$user->name} telah mengupdate vendor: {$oldName} menjadi {$vendor->nama_vendor}");

        return response()->json($vendor);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $vendor = Vendor::findOrFail($id);
        $user = Auth::user();
        HistoryUsersController::record("{$user->name} telah menghapus vendor: {$vendor->nama_vendor}");
        $vendor->delete();

        return response()->json(null, 204);
    }

    public function getVendorParts(int $vendorId)
    {
        $vendor = Vendor::with(['parts' => function($query) {
            $query->withPivot('harga_part', 'merk_part', 'harga_sebelumnya_part');
        }])->findOrFail($vendorId);
        return response()->json($vendor->parts);
    }
}