<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{ $title ?? 'Laporan Inventory' }}</title>
  <style>
    :root {
      --brand-color: #027C4B;
      --text-dark: #1a202c;
      --text-light: #4a5568;
      --border-color: #e2e8f0;
      --bg-light-gray: #f7fafc;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      /* gunakan font aman */
      color: var(--text-dark);
      background-color: #fff;
      font-size: 12px;
    }

    .report-container {
      padding: 1.5rem;
      max-width: 100%;
    }

    .report-title {
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      margin: 1.5rem 0;
    }

    .report-header table,
    .report-header td {
      border: none !important;
    }

    td span {
      font-weight: lighter;
    }

    /* Metadata */
    .metadata-grid {
      width: 100%;
      margin-bottom: 1.5rem;
    }

    .metadata-grid td {
      padding: 4px 6px;
      vertical-align: top;
    }

    .metadata-grid td:first-child {
      font-weight: bold;
      color: var(--text-light);
      width: 120px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }

    thead {
      background-color: var(--brand-color);
      color: #fff;
    }

    th,
    td {
      border: 1px solid var(--border-color);
      padding: 6px 8px;
    }

    .metadata-grid,
    .metadata-grid tr,
    .metadata-grid td {
      border: none !important;
    }


    /* Signature */
    .signature-section {
      margin-top: 2rem;
      font-size: 12px;
      page-break-inside: avoid;
      break-inside: avoid;
      page-break-before: auto;
      page-break-after: auto;
    }

    .date-line {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 3rem;
      text-align: left;
    }

    .signature-table {
      width: 100%;
      text-align: center;
    }

    .signature-table td {
      padding: 0 10px;
      vertical-align: top;
      border: none !important;
    }

    .signature-table .name {
      font-weight: bold;
      font-style: italic;
      margin-top: 60px;
    }

    .signature-table .title {
      font-style: italic;
      color: var(--text-light);
    }

    .report-footer {
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
      font-size: 10px;
      color: #718096;
      margin-top: 2rem;
      width: 100%;
      display: table;
    }

    .report-footer p {
      display: table-cell;
      width: 50%;
    }

    .page-number {
      text-align: right;
      color: var(--brand-color);
    }

    .page-number span {
      font-weight: bold;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .report-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: #fff;
        padding: 8px 12px;
      }

      main {
        margin-bottom: 100px;
      }
    }
  </style>
</head>

<body>

  <!-- Header pakai table biar stabil -->
  <header class="report-header report-container">
    <table class="">
      <tr>
        <td style="font-size:16px; font-weight:bold; color:var(--brand-color); white-space:nowrap;">
          SN <span>Cargo</span>
        </td>
        <td style="border:none; width:100%; vertical-align:middle;">
          <div style="border-top:1px solid #000; width:100%;"></div>
        </td>
      </tr>
    </table>
  </header>

  <main class="report-container">
    <h2 class="report-title">
      {{ $heading ?? 'Laporan Divisi Administrasi Umum' }}
    </h2>

    <!-- Metadata pakai table -->
    <table class="metadata-grid">
      <tr>
        <td>Bagian</td>
        <td>: {{ $bagian ?? 'Alat Tulis Kantor' }}</td>
      </tr>
      <tr>
        <td>Laporan</td>
        <td>: {{ $laporan ?? 'Laporan Penggunaan Inventaris ATK' }}</td>
      </tr>
      <tr>
        <td>Tanggal</td>
        <td>: {{ $tanggal ?? now()->format('d F Y') }}</td>
      </tr>
      <tr>
        <td>Pengguna</td>
        <td>: {{ $pengguna ?? 'System' }}</td>
      </tr>
    </table>

    <!-- Table Data -->
    <section class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Nama Barang</th>
            <th>Spesifikasi</th>
            <th>Stok Awal</th>
            <th>Masuk</th>
            <th>Keluar</th>
            <th>Stok Akhir</th>
            <th>Satuan</th>
            <th>Minimum Stok</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          @forelse ($items as $item)
            <tr>
              <td>{{ $loop->iteration }}</td>
              <td>{{ $item->nama_produk ?? ($item->nama_barang ?? 'N/A') }}</td>
              <td>{{ $item->spesifikasi ?? 'N/A' }}</td>
              <td>{{ $item->stok_awal ?? 'N/A' }}</td>
              <td>{{ $item->stok_in ?? ($item->masuk ?? 'N/A') }}</td>
              <td>{{ $item->stok_out ?? ($item->keluar ?? 'N/A') }}</td>
              <td>{{ $item->stok_akhir ?? 'N/A' }}</td>
              <td>{{ $item->produk_satuan ?? ($item->satuan ?? 'N/A') }}</td>
              <td>{{ $item->produk_minimum_stok ?? ($item->minimum_stok ?? 'N/A') }}</td>
              <td>{{ $item->produk_status ?? ($item->status ?? 'N/A') }}</td>
            </tr>
          @empty
            <tr>
              <td colspan="10">Tidak ada data untuk ditampilkan.</td>
            </tr>
          @endforelse
        </tbody>
      </table>
    </section>

    <!-- Signature -->
    <section class="signature-section">
      <p class="date-line">Sidoarjo, {{ $tanggal ?? now()->format('d F Y') }}</p>
      <table class="signature-table">
        <tr>
          <td>
            <p class="name">RIZKI OKTAVIAN</p>
            <p class="title">Adm. Umum</p>
          </td>
          <td>
            <p class="name">DANI ANWAR</p>
            <p class="title">Adm. Umum</p>
          </td>
          <td>
            <p class="name">FIRMAN A.</p>
            <p class="title">Koordinator Umum</p>
          </td>
          <td>
            <p class="name">BENNY A.</p>
            <p class="title">KADIV. UMUM</p>
          </td>
        </tr>
      </table>
    </section>
  </main>

  <!-- Footer -->
  <footer class="report-footer report-container">
    <p class="generated-text">
      *Dokumen ini dihasilkan otomatis oleh sistem inventory | Generated on
      {{ $generatedTimestamp ?? now()->format('d-m-Y H:i A') }}
    </p>
    <p class="page-number">
      <span>Halaman {{ $currentPage ?? 1 }}</span> dari {{ $totalPages ?? 1 }}
    </p>
  </footer>

</body>

</html>