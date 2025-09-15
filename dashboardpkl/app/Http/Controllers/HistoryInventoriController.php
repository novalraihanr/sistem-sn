<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Inventori;
use App\Models\HistoryInventori;

class HistoryInventoriController extends Controller
{
    /**
     * Archives inventory records from previous months into the history table.
     */
    public function archiveOldInventori()
    {
        DB::beginTransaction();

        try {
            // Get the first day of the current month.
            $startOfCurrentMonth = Carbon::now()->startOfMonth();

            // Find inventory records where 'bulan_sekarang' is before the current month.
            $recordsToArchive = Inventori::with('kategoriInv')
                ->where('bulan_sekarang', '<', $startOfCurrentMonth)
                ->get();

            $archivedCount = 0;

            foreach ($recordsToArchive as $inventori) {
                // Check if a history record for this product name and month already exists.
                $bulanInventori = Carbon::parse($inventori->bulan_sekarang);
                $alreadyExists = HistoryInventori::where('nama_produk', $inventori->nama_produk)
                                                   ->whereYear('bulan_sekarang', $bulanInventori->year)
                                                   ->whereMonth('bulan_sekarang', $bulanInventori->month)
                                                   ->exists();

                if (!$alreadyExists) {
                    // Create the history record without specifying id_produk, allowing it to auto-increment.
                    HistoryInventori::create([
                        'nama_produk' => $inventori->nama_produk,
                        'kategori' => $inventori->kategoriInv->nama_kategori, // Get name from relation
                        'spesifikasi' => $inventori->spesifikasi,
                        'stok_awal' => $inventori->stok_awal,
                        'stok_akhir' => $inventori->stok_akhir,
                        'stok_in' => $inventori->stok_in,
                        'stok_out' => $inventori->stok_out,
                        'produk_satuan' => $inventori->produk_satuan,
                        'produk_minimum_stok' => $inventori->produk_minimum_stok,
                        'produk_status' => $inventori->produk_status,
                        'bulan_sekarang' => $inventori->bulan_sekarang,
                    ]);
                    $archivedCount++;
                }
            }

            Inventori::query()->update(['bulan_sekarang' => Carbon::now()]);

            DB::commit();

            return response()->json([
                'message' => 'Inventory archiving process completed successfully.',
                'archived_records' => $archivedCount,
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'An error occurred during the archiving process.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getUniqueYears()
    {
        $years = HistoryInventori::selectRaw('YEAR(bulan_sekarang) as year')
                                    ->distinct()
                                    ->orderBy('year', 'desc')
                                    ->pluck('year');

        return response()->json($years);
    }

    public function getDataByYear($year)
    {
        $data = HistoryInventori::whereYear('bulan_sekarang', $year)->get();
        return response()->json($data);
    }
}