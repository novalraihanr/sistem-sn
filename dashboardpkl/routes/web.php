<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Dashboard Routes
    Route::get('dashboard/vendors', [DashboardController::class, 'vendors'])->name('dashboard.vendors');
    Route::get('dashboard/parts', [DashboardController::class, 'parts'])->name('dashboard.parts');
    Route::get('dashboard/units', [DashboardController::class, 'units'])->name('dashboard.units');
    Route::get('dashboard/transactions', [DashboardController::class, 'transactions'])->name('dashboard.transactions');
    Route::get('dashboard/transactions/new-multi', [DashboardController::class, 'newMultiTransaction'])->name('dashboard.transactions.new-multi');
    Route::get('dashboard/vendors/{vendor}/parts', [DashboardController::class, 'vendorParts'])->name('dashboard.vendor.parts');
    Route::get('dashboard/transactions/{transaction}', [DashboardController::class, 'transactionDetails'])->name('dashboard.transactions.details');
    Route::get('dashboard/units/{unit}/parts', [DashboardController::class, 'unitParts'])->name('dashboard.unit.parts');
    Route::get('dashboard/best-part-prices', [DashboardController::class, 'bestPartPrices'])->name('dashboard.best-part-prices');
    Route::get('dashboard/vendors/{vendor}', [DashboardController::class, 'vendorDetails'])->name('dashboard.vendor.details');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
