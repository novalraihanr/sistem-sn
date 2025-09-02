<?php

namespace App\Http\Controllers;

use App\Models\HistoryInventori;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Generate and download a PDF report for inventory data of a specific year.
     *
     * @param int $year
     * @return \Illuminate\Http\Response
     */
    public function downloadInventoryReport($year)
    {
        // Validate that the year is a 4-digit number
        if (!preg_match('/^\d{4}$/', $year)) {
            return response()->json(['message' => 'Invalid year format.'], 400);
        }

        // Fetch data from HistoryInventori for the given year
        $items = HistoryInventori::whereYear('bulan_sekarang', $year)->get();

        if ($items->isEmpty()) {
            // Or return a view indicating no data was found
            return back()->with('error', 'No inventory history found for the year ' . $year);
        }

        // Prepare data for the view
        $user = Auth::user();
        $data = [
            'title' => 'Laporan Inventory Tahun ' . $year,
            'bagian' => 'Alat Tulis Kantor', // This can be made dynamic if needed
            'laporan' => 'Laporan Penggunaan Inventaris ATK Tahun ' . $year,
            'tanggal' => Carbon::now()->translatedFormat('d F Y'),
            'pengguna' => $user ? $user->name : 'System',
            'items' => $items,
            'generatedTimestamp' => Carbon::now()->format('d-m-Y H:i A'),
            'currentPage' => 1,
            'totalPages' => 1, // Pagination in PDF is complex, setting to 1 for now
        ];

        // Load the view and pass the data
        $pdf = Pdf::loadView('report', $data);

        // Set paper size and orientation
        $pdf->setPaper('a4', 'landscape');

        // Generate a filename
        $filename = 'sn-inventory-report-' . $year . '.pdf';

        // Download the PDF
        return $pdf->download($filename);
    }
}
