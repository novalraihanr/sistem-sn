<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ $title ?? 'Laporan Inventory' }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,700&family=Plus+Jakarta+Sans:wght@600;700&display=swap"
      rel="stylesheet"
    />
    <style>
      /* 1. Theme & Variables */
      :root {
        --brand-color: #027C4B;
        --text-dark: #1a202c;
        --text-light: #4a5568;
        --border-color: #e2e8f0;
        --bg-light-gray: #f7fafc;
      }

      /* 2. CSS Reset & Base */
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { -webkit-text-size-adjust: 100%; font-family: "Roboto", sans-serif; line-height: 1.5; }
      body { background-color: #fff; color: var(--text-dark); min-height: 100vh; display: flex; flex-direction: column; }
      h2 { font-family: "Plus Jakarta Sans", sans-serif; }
      table { border-collapse: collapse; }

      /* 3. Layout & Document Structure */
      .report-container { padding: 2rem; }
      .report-header {
        padding-bottom: 1rem;
        border-bottom: 2px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .report-header .logo {
        font-family: "Plus Jakarta Sans", sans-serif;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--brand-color);
      }
      .report-header .logo span { font-weight: 400; }

      .report-title {
        font-size: 1.75rem;
        font-weight: 700;
        text-align: center;
        margin: 2.5rem 0;
      }

      .metadata-grid {
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: 0.5rem 1rem;
        margin-bottom: 2.5rem;
      }
      .metadata-grid dt { font-weight: 600; color: var(--text-light); }
      .metadata-grid dd { font-weight: 400; }

      .signature-section { margin-top: 3rem; }
      .signature-section .date-line { font-size: 1rem; font-weight: 600; margin-bottom: 8rem; text-align: right; }
      .signature-grid {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .signature-grid > div {
        text-align: center;
        width: 20%; /* Assign a width to each signature block */
      }
      .signature-grid .name { font-weight: 700; font-family: "Plus Jakarta Sans", sans-serif; }
      .signature-grid .title { font-style: italic; color: var(--text-light); }

      .report-footer {
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        font-size: 0.75rem;
        color: #718096;
      }
      .report-footer .generated-text { font-style: italic; }
      .report-footer .page-number { color: var(--brand-color); }
      .report-footer .page-number span { font-weight: 700; }

      /* 4. Table Styles (Unchanged as requested) */
      table { width: 100%; table-layout: auto; font-size: 0.875rem; text-align: left; }
      table thead {
        background-color: var(--brand-color);
        color: white;
        text-align: center;
      }
      table th, table td {
        border: 1px solid var(--border-color);
        padding: 0.75rem 1rem;
        text-align: center;
      }
      table tbody tr:nth-child(even) { background-color: var(--bg-light-gray); }

      /* 5. Print Styles */
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .report-footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 1rem 2rem; background-color: white; }
        main { margin-bottom: 100px; }
      }
    </style>
</head>
<body>

    <header class="report-header report-container">
      <div class="logo">SN<span>Cargo</span></div>
    </header>

    <main class="report-container">
      <h2 class="report-title">
        {{ $heading ?? 'Laporan Divisi Administrasi Umum' }}
      </h2>

      <dl class="metadata-grid">
        <dt>Bagian</dt>
        <dd>: {{ $bagian ?? 'Alat Tulis Kantor' }}</dd>
        <dt>Laporan</dt>
        <dd>: {{ $laporan ?? 'Laporan Penggunaan Inventaris ATK' }}</dd>
        <dt>Tanggal</dt>
        <dd>: {{ $tanggal ?? now()->format('d F Y') }}</dd>
        <dt>Pengguna</dt>
        <dd>: {{ $pengguna ?? 'System' }}</dd>
      </dl>

      <!-- TABEL -->
      <section>
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

      <section class="signature-section">
        <p class="date-line">Sidoarjo, {{ $tanggal ?? now()->format('d F Y') }}</p>
        <div class="signature-grid">
          <div>
            <p class="name">RIZKI OKTAVIAN</p>
            <p class="title">Adm. Umum</p>
          </div>
          <div>
            <p class="name">DANI ANWAR</p>
            <p class="title">Adm. Umum</p>
          </div>
          <div>
            <p class="name">FIRMAN A.</p>
            <p class="title">Koordinator Umum</p>
          </div>
          <div>
            <p class="name">BENNY A.</p>
            <p class="title">KADIV. UMUM</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="report-footer report-container">
      <p class="generated-text">
        *Dokumen ini dihasilkan otomatis oleh sistem inventory | Generated on {{ $generatedTimestamp ?? now()->format('d-m-Y H:i A') }}
      </p>
      <p class="page-number">
        <span>Halaman {{ $currentPage ?? 1 }}</span> dari {{ $totalPages ?? 1 }}
      </p>
    </footer>

</body>
</html>
