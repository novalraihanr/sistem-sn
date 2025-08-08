<?php

namespace App\Http\Controllers;

use App\Models\Part;
use App\Models\VendorPart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PartController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $part = Part::get();
        return response()->json($part);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_part' => 'required|string|max:255',
        ]);

        $user = Auth::user();

        // Find the part by name or create it if it doesn't exist.
        $part = Part::firstOrCreate(
            ['nama_part' => $request->nama_part],
            ['createdby' => $user->name]
        );

        // Determine the correct status code
        $statusCode = $part->wasRecentlyCreated ? 201 : 200;

        return response()->json($part, $statusCode);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $part = Part::findOrFail($id);
        return response()->json($part);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'nama_part' => 'required|string|max:255',
            'harga_part' => 'required|integer',
            'merk_part' => 'required|string|max:255',
        ]);

        $user = Auth::user();
        $part = Part::findOrFail($id);

        $part->update([
            'nama_part' => $request->nama_part,
            'harga_part' => $request->harga_part,
            'merk_part' => $request->merk_part,
            'updatedby' => $user->name,
        ]);

        return response()->json($part);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $part = Part::findOrFail($id);
        $part->delete();

        return response()->json(null, 204);
    }

    public function getBestPrices()
    {
        $parts = Part::with(['vendors' => function($query) {
            $query->select('vendor.id_vendor', 'vendor.nama_vendor')
                  ->withPivot('harga_part', 'created_at');
        }])->get();

        $bestPrices = [];

        foreach ($parts as $part) {
            $bestPriceVendor = null;
            $minPrice = PHP_FLOAT_MAX;

            foreach ($part->vendors as $vendor) {
                if ($vendor->pivot->harga_part < $minPrice) {
                    $minPrice = $vendor->pivot->harga_part;
                    $bestPriceVendor = $vendor;
                }
            }

            if ($bestPriceVendor) {
                $bestPrices[] = [
                    'part_id' => $part->id_part,
                    'part_name' => $part->nama_part,
                    'vendor_id' => $bestPriceVendor->id_vendor,
                    'vendor_name' => $bestPriceVendor->nama_vendor,
                    'harga_part' => $minPrice,
                    'timestamp' => $bestPriceVendor->pivot->created_at,
                ];
            }
        }

        return response()->json($bestPrices);
    }
}
