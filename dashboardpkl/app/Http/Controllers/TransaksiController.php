<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use App\Models\TransaksiVendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\HistoryUsersController;

class TransaksiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Transaksi::with('transaksivendor.vendorPart.vendor');

        if ($request->has('month') && $request->month !== 'all') {
            $query->whereMonth('created_at', $request->month);
        }

        $transaksi = $query->get();
        return response()->json($transaksi);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'total' => 'required|numeric',
        ]);

        $transaksi = Transaksi::create($request->all());

        $user = Auth::user();
        if ($user) {
            HistoryUsersController::record("{$user->name} telah membuat transaksi baru dengan total: {$transaksi->total}");
        }

        return response()->json($transaksi, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $transaksi = Transaksi::findOrFail($id);
        return response()->json($transaksi);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'total' => 'required|numeric',
        ]);

        $transaksi = Transaksi::findOrFail($id);
        $oldTotal = $transaksi->total;
        $transaksi->update($request->all());

        $user = Auth::user();
        if ($user) {
            HistoryUsersController::record("{$user->name} telah mengupdate transaksi: {$id} dari total {$oldTotal} menjadi {$transaksi->total}");
        }

        return response()->json($transaksi);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $transaksi = Transaksi::findOrFail($id);
        $user = Auth::user();
        if ($user) {
            HistoryUsersController::record("{$user->name} telah menghapus transaksi: {$id}");
        }

        // Delete all associated TransaksiVendor records first
        $transaksi->transaksivendor()->delete();
        $transaksi->delete();

        return response()->json(null, 204);
    }

    /**
     * Recalculate and update the total for a specific transaction based on its vendor transactions.
     */
    public function updateTotal(string $id)
    {
        try {
            $transaksi = Transaksi::findOrFail($id);

            // Calculate the sum from the related vendor transactions
            $newTotal = TransaksiVendor::where('id_transaksi', $id)->sum('total_harga');

            // Update the total on the transaction model
            $transaksi->total = $newTotal;
            $transaksi->save();

            return response()->json([
                'message' => 'Transaction total updated successfully.',
                'data' => $transaksi,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred while updating the transaction total.', 'error' => $e->getMessage()], 500);
        }
    }
}