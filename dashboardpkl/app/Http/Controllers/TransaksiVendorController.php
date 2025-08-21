<?php

namespace App\Http\Controllers;

use App\Models\TransaksiVendor;
use App\Models\VendorPart;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\HistoryUsersController;

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
                'harga_part_saat_ini' => $vendorPart->harga_part,
                'jumlah' => $validated['jumlah'],
                'total_harga' => $validated['total_harga'],
                'createdby' => auth()->id(),
            ]);

            $user = Auth::user();
            if ($user) {
                HistoryUsersController::record("{$user->name} telah membuat transaksi vendor baru untuk part: {$vendorPart->part->nama_part} dari vendor: {$vendorPart->vendor->nama_vendor}");
            }

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

            $user = Auth::user();
            if ($user) {
                HistoryUsersController::record("{$user->name} telah mengupdate transaksi vendor: {$transaksiVendor->id_transaksi_vendor}");
            }

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
            $user = Auth::user();
            if ($user) {
                HistoryUsersController::record("{$user->name} telah menghapus transaksi vendor: {$transaksiVendor->id_transaksi_vendor}");
            }
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
            'items.*.part_id' => 'required|string|exists:part,id_part',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.total_harga' => 'required|numeric|min:0',
            'items.*.merk_part' => 'required|string|max:255',
            'items.*.harga_part' => 'required|numeric|min:0',
            'overall_total' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            $user = Auth::user();
            $userId = $user ? $user->id : null;

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
                    ]
                );

                // Create TransaksiVendor record for each item
                TransaksiVendor::create([
                    'id_transaksi' => $transaksi->id_transaksi,
                    'id_vendorpart' => $vendorPart->id_vendorpart,
                    'harga_part_saat_ini' => $item['harga_part'],
                    'jumlah' => $item['jumlah'],
                    'total_harga' => $item['total_harga'],
                ]);
            }
            
            if ($user) {
                HistoryUsersController::record("{$user->name} telah membuat transaksi multi-part baru dengan total: {$transaksi->total}");
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

    public function show($id)
    {
        try {
            $transaksi = Transaksi::with([
                'transaksivendor.vendorPart.vendor',
                'transaksivendor.vendorPart.part.kategoriPart',
            ])->findOrFail($id);

            return response()->json($transaksi);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred while fetching transaction details.', 'error' => $e->getMessage()], 500);
        }
    }

    public function getRecentTransactions()
    {
        $recentTransactions = TransaksiVendor::with(['vendorPart.vendor', 'vendorPart.part'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json($recentTransactions);
    }
}