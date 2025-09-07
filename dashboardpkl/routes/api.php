<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HistoryUsersController;
use App\Http\Controllers\InventoriController;
use App\Http\Controllers\PartController;
use App\Http\Controllers\StokInController;
use App\Http\Controllers\StokOutController;
use App\Http\Controllers\TransaksiController;
use App\Http\Controllers\TransaksiVendorController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UnitPartController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\VendorPartController;
use App\Http\Controllers\ReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/report/inventory/{year}/download', [ReportController::class, 'downloadInventoryReport']);

    Route::apiResource('vendor', VendorController::class);
    Route::get('vendor/search/{name}', [VendorController::class, 'searchByName']);
    Route::get('part/best-prices', [PartController::class, 'getBestPrices']);
    Route::get('part/search/{name}', [PartController::class, 'searchByName']);
    Route::get('/part/all-prices', [App\Http\Controllers\PartController::class, 'getAllPricesForPart']);
    Route::apiResource('part', PartController::class);
    Route::apiResource('unit', UnitController::class);
    Route::apiResource('transaksi', TransaksiController::class);
    Route::put('transaksi/{id}/update-total', [TransaksiController::class, 'updateTotal']);
    Route::post('transaksi/{transaksi}/items', [TransaksiVendorController::class, 'addItems']);

    // Vendor-Part Routes
    Route::post('vendor-part/createnew', [VendorPartController::class, 'store']);
    Route::put('vendor-part/changeharga/{vendorId}/{partId}', [VendorPartController::class, 'update']);
    Route::post('vendor-part/{vendorId}/part', [VendorPartController::class, 'addPartToVendor']);
    Route::delete('vendor-part/{vendorId}/{partId}', [VendorPartController::class, 'destroy']);
    Route::get('vendor-part/{id}/parts', [VendorPartController::class, 'getVendorParts']);
    Route::get('vendor/{id}/parts/search/{partName}', [VendorPartController::class, 'searchVendorParts']);
    Route::get('vendor-part/search-merks', [App\Http\Controllers\VendorPartController::class, 'searchMerks']);

    // Transaksi Vendor Routes
    Route::apiResource('transaksi-vendor', TransaksiVendorController::class);
    Route::post('transaksi-vendor/multi', [TransaksiVendorController::class, 'storeMulti']);
    Route::get('transaksi-vendor/{id}', [TransaksiVendorController::class, 'show']);
    Route::get('transaksi-vendor/recent/vendor', [TransaksiVendorController::class, 'getRecentTransactions']);

    Route::get('vendor/{id}/parts', [VendorController::class, 'getVendorParts']);
    Route::post('vendor/{id}/parts', [VendorPartController::class, 'addPartToVendor']);
    Route::get('part/{id}/vendors', [VendorPartController::class, 'getPartVendors']);

    // Units Route
    Route::post('unit-part', [UnitPartController::class, 'store']);
    Route::put('unit-part/{unitId}/{partId}', [UnitPartController::class, 'update']);
    Route::delete('unit-part/{unitId}/{partId}', [UnitPartController::class, 'destroy']);
    Route::get('unit/{id}/parts', [UnitController::class, 'getUnitParts']);

    Route::get('inventori/counts', [InventoriController::class, 'getCounts']);
    Route::get('inventori/find-by-name', [InventoriController::class, 'searchByName']);
    Route::get('inventori/monthly-stock-data', [InventoriController::class, 'getMonthlyStockData']);
    Route::get('inventori/product-names', [InventoriController::class, 'getAllProductNames']);
    Route::get('inventori/low-stock-alerts', [InventoriController::class, 'getLowStockAlerts']);
    Route::get('inventori/summary', [InventoriController::class, 'getInventorySummary']);
    Route::apiResource('inventori', InventoriController::class);

    Route::get('stok-in/summary', [StokInController::class, 'getSummary']);
    Route::get('/stok-in/monthly-data', [StokInController::class, 'getMonthlyData']);
    Route::get('/stok-in/years', [StokInController::class, 'getStokInYears']);
    Route::apiResource('stok-in', StokInController::class);

    Route::get('stok-out/summary', [StokOutController::class, 'getSummary']);
    Route::get('/stok-out/monthly-data', [StokOutController::class, 'getMonthlyData']);
    Route::get('/stok-out/years', [StokOutController::class, 'getStokOutYears']);
    Route::apiResource('stok-out', StokOutController::class);

    Route::get('kategori-part/{kategoriPart}/parts', [\App\Http\Controllers\KategoriPartController::class, 'getParts']);
    Route::get('kategori-part/search/{name}', [\App\Http\Controllers\KategoriPartController::class, 'searchByName']);
    Route::post('kategori-part/first-or-create', [\App\Http\Controllers\KategoriPartController::class, 'firstOrCreate']);
    Route::apiResource('kategori-part', \App\Http\Controllers\KategoriPartController::class);

    Route::apiResource('users', UsersController::class);

    Route::apiResource('historyusers', HistoryUsersController::class);
    Route::get('history-users/user/{id}', [HistoryUsersController::class, 'getHistoryByUser']);

    Route::post('inventori/archive', [\App\Http\Controllers\HistoryInventoriController::class, 'archiveOldInventori']);
    Route::post('inventori/trigger-archive', [InventoriController::class, 'triggerArchive']);
    Route::get('history-inventori/years', [\App\Http\Controllers\HistoryInventoriController::class, 'getUniqueYears']);
    Route::get('history-inventori/{year}', [\App\Http\Controllers\HistoryInventoriController::class, 'getDataByYear']);
});


