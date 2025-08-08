<?php

namespace App\Http\Controllers;

use App\Models\TransaksiVendor;
use App\Models\VendorPart;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransaksiVendorController extends Controller
{
    /**
     * Retrieve all vendor transactions with their related data.
     */
    public function index()
    {
        try {
            $transaksiVendors = TransaksiVendor::with([
                'transaksi', // Loads the main transaction details
                'vendorPart.vendor', // Loads the vendor through the vendorPart relationship
                'vendorPart.part', // Loads the part through the vendorPart relationship
            ])->get();

            return response()->json($transaksiVendors);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred while fetching vendor transactions.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a new vendor transaction.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|integer|exists:vendor,id_vendor',
            'part_id' => 'required|integer|exists:part,id_part',
            'jumlah' => 'required|integer|min:1',
            'total_harga' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            // Find the vendor_part record
            $vendorPart = VendorPart::where('id_vendor', $validated['vendor_id'])
                                    ->where('id_part', $validated['part_id'])
                                    ->firstOrFail();

            // Create a new Transaksi record
            $transaksi = Transaksi::create([
                'total' => $validated['total_harga'],
                'createdby' => auth()->id(),
            ]);

            // Create the TransaksiVendor record
            $transaksiVendor = TransaksiVendor::create([
                'id_transaksi' => $transaksi->id_transaksi,
                'id_vendorpart' => $vendorPart->id_vendorpart,
                'jumlah' => $validated['jumlah'],
                'total_harga' => $validated['total_harga'],
                'createdby' => auth()->id(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Vendor transaction created successfully.',
                'data' => $transaksiVendor,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'An error occurred while creating the transaction.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update an existing vendor transaction.
     */
    public function update(Request $request, TransaksiVendor $transaksiVendor)
    {
        $validated = $request->validate([
            'id_transaksi' => 'sometimes|required|integer|exists:transaksi,id_transaksi',
            'id_vendorpart' => 'sometimes|required|integer|exists:vendor_part,id_vendorpart',
            'jumlah' => 'sometimes|required|integer|min:1',
            'total_harga' => 'sometimes|required|numeric|min:0',
        ]);

        try {
            $transaksiVendor->update($validated);

            return response()->json([
                'message' => 'Vendor transaction updated successfully.',
                'data' => $transaksiVendor,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred while updating the transaction.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a vendor transaction.
     */
    public function destroy(TransaksiVendor $transaksiVendor)
    {
        try {
            $transaksiVendor->delete();

            return response()->json(['message' => 'Vendor transaction deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred while deleting the transaction.', 'error' => $e->getMessage()], 500);
        }
    }

    public function storeMulti(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|integer|exists:vendor,id_vendor',
            'items' => 'required|array|min:1',
            'items.*.part_id' => 'required|integer|exists:part,id_part',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.total_harga' => 'required|numeric|min:0',
            'items.*.merk_part' => 'required|string|max:255',
            'items.*.harga_part' => 'required|numeric|min:0',
            'overall_total' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            $userId = auth()->id();

            // Create a single Transaksi record for the entire multi-part transaction
            $transaksi = Transaksi::create([
                'total' => $validated['overall_total'],
                'createdby' => $userId,
            ]);

            foreach ($validated['items'] as $item) {
                // Find the vendor_part record
                $vendorPart = VendorPart::updateOrCreate(
                    [
                        'id_vendor' => $validated['vendor_id'],
                        'id_part' => $item['part_id'],
                    ],
                    [
                        'merk_part' => $item['merk_part'],
                        'harga_part' => $item['harga_part'],
                        'createdby' => $userId,
                        'updatedby' => $userId,
                    ]
                );

                // Create TransaksiVendor record for each item
                TransaksiVendor::create([
                    'id_transaksi' => $transaksi->id_transaksi,
                    'id_vendorpart' => $vendorPart->id_vendorpart,
                    'jumlah' => $item['jumlah'],
                    'total_harga' => $item['total_harga'],
                    'createdby' => $userId,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Multi-part transaction created successfully.',
                'transaksi_id' => $transaksi->id_transaksi,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'An error occurred while creating the multi-part transaction.', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(int $id)
    {
        try {
            $transaksi = Transaksi::with([
                'transaksivendor.vendorPart.vendor',
                'transaksivendor.vendorPart.part',
            ])->findOrFail($id);

            return response()->json($transaksi);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred while fetching transaction details.', 'error' => $e->getMessage()], 500);
        }
    }
}
