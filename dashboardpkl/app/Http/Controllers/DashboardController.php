<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Vendor;
use App\Models\Unit;

class DashboardController extends Controller
{
    public function vendors()
    {
        return Inertia::render('Dashboard/Vendors');
    }

    public function parts()
    {
        return Inertia::render('Dashboard/Parts');
    }

    public function units()
    {
        return Inertia::render('Dashboard/Units');
    }

    public function transactions()
    {
        return Inertia::render('Dashboard/Transactions');
    }

    public function newMultiTransaction()
    {
        return Inertia::render('Dashboard/NewMultiTransaction');
    }

    public function vendorParts($vendorId)
    {
        $vendor = \App\Models\Vendor::find($vendorId);
        if (!$vendor) {
            abort(404);
        }
        return Inertia::render('Dashboard/VendorPartsPage', [
            'vendor' => $vendor,
        ]);
    }

    public function transactionDetails($transactionId)
    {
        $transaction = \App\Models\Transaksi::with([
            'transaksivendor.vendorPart.vendor',
            'transaksivendor.vendorPart.part',
        ])->find($transactionId);

        if (!$transaction) {
            abort(404);
        }

        return Inertia::render('Dashboard/TransactionDetails', [
            'transaction' => $transaction,
        ]);
    }

    public function unitParts($unitId)
    {
        $unit = \App\Models\Unit::find($unitId);
        if (!$unit) {
            abort(404);
        }
        return Inertia::render('Dashboard/UnitPartsPage', [
            'unit' => $unit,
        ]);
    }

    public function bestPartPrices()
    {
        return Inertia::render('Dashboard/BestPartPrices');
    }

    public function vendorDetails($vendorId)
    {
        $vendor = \App\Models\Vendor::with(['parts' => function($query) {
            $query->withPivot('harga_part', 'merk_part', 'harga_sebelumnya_part');
        }])->find($vendorId);
        if (!$vendor) {
            abort(404);
        }
        return Inertia::render('Dashboard/VendorDetailsPage', [
            'vendor' => $vendor,
        ]);
    }
}
