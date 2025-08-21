<?php

namespace App\Http\Controllers;

use App\Models\Part;
use App\Models\Vendor;
use App\Models\KategoriPart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\HistoryUsersController;

class VendorPartController extends Controller
{
    public function getVendorParts(int $id)
    {
        $vendor = Vendor::with(['parts' => function($query) {
            $query->select('part.id_part', 'part.nama_part', 'part.id_kategori_part')->withPivot('harga_part', 'harga_sebelumnya_part', 'merk_part', 'satuan_part');
        }])->findOrFail($id);

        $parts = $vendor->parts->map(function ($part) {
            $part->load('kategoriPart');
            return $part;
        });

        return response()->json($parts);
    }

    public function searchVendorParts(int $id, string $partName)
    {
        $vendor = Vendor::findOrFail($id);

        $parts = $vendor->parts()
            ->where('part.nama_part', 'like', '%' . $partName . '%')
            ->withPivot('harga_part', 'merk_part', 'satuan_part')
            ->with('kategoriPart')
            ->get();

        return response()->json($parts);
    }

    public function getPartVendors(int $id)
    {
        $part = Part::with(['vendors' => function($query) {
            $query->withPivot('harga_part', 'harga_sebelumnya_part', 'merk_part', 'satuan_part', 'created_at');
        }])->findOrFail($id);

        // Sort vendors by harga_part in ascending order
        $sortedVendors = $part->vendors->sortBy('pivot.harga_part')->values()->all();

        return response()->json($sortedVendors);
    }

    /**
     * Create a new Vendor and/or Part and attach them with full pivot data.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            // Vendor fields
            'nama_vendor' => 'required|string|max:255',
            'alamat_vendor' => 'nullable|string',
            'kontak_vendor' => 'nullable|string',

            // Part fields
            'nama_part' => 'required|string|max:255',

            // Pivot fields
            'harga_part' => 'required|numeric|min:0',
            'harga_sebelumnya_part' => 'nullable|numeric|min:0',
            'merk_part' => 'required|string|max:255',
            'satuan_part' => 'required|string|max:255',
        ]);

        DB::beginTransaction();

        try {
            $user = Auth::user();
            $userId = $user ? $user->id : null;

            // Find or create the vendor
            $vendor = Vendor::firstOrCreate(
                ['nama_vendor' => $validated['nama_vendor']],
                [
                    'alamat_vendor' => $validated['alamat_vendor'] ?? null,
                    'kontak_vendor' => $validated['kontak_vendor'] ?? null,
                    'createdby' => $userId,
                    'updatedby' => $userId,
                ]
            );

            // Find or create the part
            $part = Part::firstOrCreate(
                ['nama_part' => $validated['nama_part']]
            );

            // Prepare the pivot data
            $pivotData = [
                'harga_part' => $validated['harga_part'],
                'harga_sebelumnya_part' => $validated['harga_sebelumnya_part'] ?? null,
                'merk_part' => $validated['merk_part'],
                'satuan_part' => $validated['satuan_part'],
            ];

            // Attach the part to the vendor with the pivot data
            $vendor->parts()->syncWithoutDetaching([$part->id => $pivotData]);

            if ($user) {
                HistoryUsersController::record("{$user->name} telah menautkan part {$part->nama_part} ke vendor {$vendor->nama_vendor}");
            }

            DB::commit();

            // Eager load the created relationship for the response
            $vendor->load('parts');

            return response()->json([
                'message' => 'Successfully linked vendor and part with details.',
                'vendor' => $vendor,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'An error occurred while linking vendor and part.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update pivot table data for a vendor-part relationship.
     */
    public function update(Request $request, int $vendorId, string $partId)
    {
        $validated = $request->validate([
            'nama_part' => 'sometimes|string|max:255',
            'kategori_name' => 'sometimes|string|max:255',
            'id_part' => 'sometimes|string|max:255',
            'harga_part' => 'sometimes|numeric|min:0',
            'merk_part' => 'sometimes|string|max:255',
            'satuan_part' => 'sometimes|string|max:255',
            'harga_sebelumnya_part' => 'sometimes|numeric|min:0',
        ]);

        if (empty($validated)) {
            return response()->json(['message' => 'No data provided for update.'], 400);
        }

        try {
            $vendor = Vendor::findOrFail($vendorId);
            $part = Part::findOrFail($partId);

            // Update Part attributes
            if (isset($validated['nama_part'])) {
                $part->nama_part = $validated['nama_part'];
            }
            if (isset($validated['id_part'])) {
                $part->id_part = $validated['id_part'];
            }
            if (isset($validated['kategori_name'])) {
                $kategoriPart = KategoriPart::firstOrCreate(['nama_kategori' => $validated['kategori_name']]);
                $part->id_kategori_part = $kategoriPart->id_kategori_part;
            }
            $part->save();

            // Find the existing pivot record
            $existingPivot = $vendor->parts()->where('vendor_part.id_part', $partId)->first();

            if (!$existingPivot) {
                // If pivot record doesn't exist, return a 404.
                // The frontend will then attempt to create it.
                return response()->json(['message' => 'Vendor-part relationship not found.'], 404);
            }

            $pivot = $existingPivot->pivot; // Now it's safe to access pivot

            $updateData = $validated;

            if (isset($validated['harga_part']) && $validated['harga_part'] != $pivot->harga_part) {
                $updateData['harga_sebelumnya_part'] = $pivot->harga_part;
            }

            $vendor->parts()->updateExistingPivot($partId, $updateData);

            $user = Auth::user();
            if ($user) {
                HistoryUsersController::record("{$user->name} telah mengupdate data part {$part->nama_part} pada vendor {$vendor->nama_vendor}");
            }

            $updatedPivot = $vendor->parts()->find($partId)->pivot;

            return response()->json([
                'message' => 'Pivot data updated successfully.',
                'data' => $updatedPivot,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred while updating pivot data.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Attach a part to a vendor with pivot data.
     */
    public function addPartToVendor(Request $request, int $vendorId)
    {
        $validated = $request->validate([
            'id_part' => 'required|exists:part,id_part',
            'harga_part' => 'required|numeric|min:0',
            'merk_part' => 'required|string|max:255',
            'satuan_part' => 'required|string|max:255',
        ]);

        DB::beginTransaction();

        try {
            $user = Auth::user();
            $userId = $user ? $user->id : null;
            $vendor = Vendor::findOrFail($vendorId);
            $part = Part::findOrFail($validated['id_part']);
            $partId = $validated['id_part'];

            $pivotData = [
                'harga_part' => $validated['harga_part'],
                'merk_part' => $validated['merk_part'],
                'satuan_part' => $validated['satuan_part'],
            ];

            // Check if the relationship already exists
            $existingPivot = $vendor->parts()->where('vendor_part.id_part', $partId)->first();

            if ($existingPivot) {
                // If relationship exists, set current harga_part as harga_sebelumnya_part
                $pivotData['harga_sebelumnya_part'] = $existingPivot->pivot->harga_part;
            }

            // Use syncWithoutDetaching to attach or update the part to the vendor with the pivot data
            $vendor->parts()->syncWithoutDetaching([$partId => $pivotData]);

            if ($user) {
                HistoryUsersController::record("{$user->name} telah menambahkan part {$part->nama_part} ke vendor {$vendor->nama_vendor}");
            }

            DB::commit();

            return response()->json([
                'message' => 'Successfully added/updated part to vendor.',
                'vendor' => $vendor->load('parts'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'An error occurred while adding/updating the part.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Detach a part from a vendor and then delete the part.
     */
        public function destroy(int $vendorId, string $partId)
    {
        DB::beginTransaction();
        try {
            $vendor = Vendor::findOrFail($vendorId);
            $part = Part::findOrFail($partId);

            // Detach the part from the vendor.
            $result = $vendor->parts()->detach($partId);

            if ($result) {
                $user = Auth::user();
                if ($user) {
                    HistoryUsersController::record("{$user->name} telah menghapus part {$part->nama_part} dari vendor {$vendor->nama_vendor}");
                }
                DB::commit();
                return response()->json(['message' => 'Part detached from vendor successfully.']);
            }

            DB::rollBack();

            return response()->json(['message' => 'Part not associated with this vendor.'], 404);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'An error occurred while detaching part.', 'error' => $e->getMessage()], 500);
        }
    }
}
