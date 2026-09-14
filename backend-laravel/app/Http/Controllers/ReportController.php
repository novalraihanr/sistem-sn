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
    public function downloadInventoryReport(Request $request, $year)
    {
        // Validate that the year is a 4-digit number
        if (!preg_match('/^\d{4}$/', $year)) {
            return response()->json(['message' => 'Invalid year format.'], 400);
        }

        // Get month from request, if provided
        $month = $request->query('month');

        // Start building the query
        $query = HistoryInventori::whereYear('bulan_sekarang', $year);

        // Add month filter if a valid month is provided
        if ($month && is_numeric($month) && $month >= 1 && $month <= 12) {
            $query->whereMonth('bulan_sekarang', $month);
        }

        $items = $query->get();

        

        // Prepare data for the view
        $user = Auth::user();
        $monthName = '';
        if ($month) {
            $monthName = ' Bulan ' . Carbon::create()->month((int)$month)->translatedFormat('F');
        }

        $jakartaTime = Carbon::now('Asia/Jakarta');
        $data = [
            'title' => 'Laporan Inventory Tahun ' . $year . $monthName,
            'bagian' => 'Alat Tulis Kantor', // This can be made dynamic if needed
            'laporan' => 'Laporan Penggunaan Inventaris ATK Tahun ' . $year . $monthName,
            'tanggal' => $jakartaTime->translatedFormat('d F Y'),
            'pengguna' => $user ? $user->name : 'System',
            'items' => $items,
            'generatedTimestamp' => $jakartaTime->format('d-m-Y H:i A'),
            'currentPage' => 1,
            'totalPages' => 1, // Pagination in PDF is complex, setting to 1 for now
        ];

        // Enable PHP for page number script execution
        Pdf::setOption(['isPhpEnabled' => true]);

        // Load the view and pass the data
        $pdf = Pdf::loadView('report', $data);

        // Set paper size and orientation
        $pdf->setPaper('a4', 'landscape');

        // Generate a filename
        $monthStr = $month ? '-bulan-' . $month : '';
        $filename = 'sn-inventory-report-' . $year . $monthStr . '.pdf';

        // Download the PDF
        return $pdf->download($filename);
    }
}
