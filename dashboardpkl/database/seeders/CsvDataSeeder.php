<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\KategoriInv;
use App\Models\Inventori;
use App\Models\StokIn;
use App\Models\StokOut;
use App\Models\KategoriPart;
use App\Models\Part;
use App\Models\Vendor;
use App\Models\VendorPart;
use League\Csv\Reader;
use Illuminate\Support\Facades\DB;

class CsvDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            // Process kategori_inv.csv
            $kategoriInvCsvPath = database_path('csv/kategori_inv.csv');
            if (file_exists($kategoriInvCsvPath)) {
                $csv = Reader::createFromPath($kategoriInvCsvPath, 'r');
                $csv->setHeaderOffset(0);
                foreach ($csv->getRecords() as $record) {
                    // id_kategori from CSV is ignored as it's an auto-incrementing primary key
                    KategoriInv::firstOrCreate(
                        ['nama_kategori' => $record['nama_kategori']]
                    );
                }
                $this->command->info('KategoriInv data imported.');
            } else {
                $this->command->warn('kategori_inv.csv not found in csv/ folder. Skipping KategoriInv import.');
            }

            // Process inventori.csv
            $inventoriCsvPath = database_path('csv/inventori.csv');
            if (file_exists($inventoriCsvPath)) {
                $csv = Reader::createFromPath($inventoriCsvPath, 'r');
                $csv->setHeaderOffset(0);
                foreach ($csv->getRecords() as $record) {
                    $namaKategoriFromCsv = trim($record['nama_kategori']); // Trim whitespace
                    $this->command->info("Looking up KategoriInv for nama_kategori: '" . $namaKategoriFromCsv . "' (Length: " . strlen($namaKategoriFromCsv) . ")");

                    $kategoriInv = KategoriInv::where('nama_kategori', $namaKategoriFromCsv)->first();

                    if ($kategoriInv) {
                        $this->command->info("Found KategoriInv with ID: " . $kategoriInv->id_kategori . ", Name: '" . $kategoriInv->nama_kategori . "' (Length: " . strlen($kategoriInv->nama_kategori) . ")");
                        $this->command->info("Comparison (CSV === DB): " . (int)($namaKategoriFromCsv === $kategoriInv->nama_kategori));
                        // id_produk from CSV is ignored as it's an auto-incrementing primary key
                        Inventori::firstOrCreate(
                            ['nama_produk' => $record['nama_produk']],
                            [
                                'id_kategori' => $kategoriInv->id_kategori, // Using database-generated id from KategoriInv
                                'stok_awal' => $record['stok_awal'],
                                'stok_akhir' => $record['stok_akhir'],
                                'stok_in' => $record['stok_in'],
                                'stok_out' => $record['stok_out'],
                                'produk_satuan' => $record['produk_satuan'],
                                'produk_minimum_stok' => $record['produk_minimum_stok'],
                                'produk_status' => $record['produk_status'],
                                'bulan_sekarang' => $record['bulan_sekarang'],
                            ]
                        );
                    } else {
                        $this->command->warn("KategoriInv '" . $namaKategoriFromCsv . "' not found for product '" . $record['nama_produk'] . "'. Skipping Inventori record.");
                    }
                }
                $this->command->info('Inventori data imported.');
            } else {
                $this->command->warn('inventori.csv not found in csv/ folder. Skipping Inventori import.');
            }

            // Process stok_in.csv
            $stokInCsvPath = database_path('csv/stok_in.csv');
            if (file_exists($stokInCsvPath)) {
                $csv = Reader::createFromPath($stokInCsvPath, 'r');
                $csv->setHeaderOffset(0);
                foreach ($csv->getRecords() as $record) {
                    // Use id_produk directly from CSV

                        // id_stokin from CSV is ignored as it's an auto-incrementing primary key
                        StokIn::create([
                            'id_produk' => $record['id_produk'], // Using id_produk from Inventori model
                            'stokin_kuantitas' => $record['stokin_kuantitas'],
                            'stokin_nopomo' => $record['stokin_nopomo'],
                            'stokin_digunakan' => $record['stokin_digunakan'],
                            'stokin_harga_produk' => $record['stokin_harga_produk'],
                            'stokin_harga_total' => $record['stokin_harga_total'],
                            'stokin_tanggal' => $record['stokin_tanggal'],
                        ]);
                }
                $this->command->info('StokIn data imported.');
            } else {
                $this->command->warn('stok_in.csv not found in csv/ folder. Skipping StokIn import.');
            }

            // Process stok_out.csv
            $stokOutCsvPath = database_path('csv/stok_out.csv');
            if (file_exists($stokOutCsvPath)) {
                $csv = Reader::createFromPath($stokOutCsvPath, 'r');
                $csv->setHeaderOffset(0);
                foreach ($csv->getRecords() as $record) {

                        // id_stokout from CSV is ignored as it's an auto-incrementing primary key
                        StokOut::create([
                            'id_produk' => $record['id_produk'], // Using id_produk from Inventori model
                            'stokout_kuantitas' => $record['stokout_kuantitas'],
                            'stokout_digunakan' => $record['stokout_digunakan'],
                            'stokout_divisi' => $record['stokout_divisi'],
                            'stokout_keterangan' => $record['stokout_keterangan'],
                            'stokin_tanggal' => $record['stokin_tanggal'],
                        ]);
                }
                $this->command->info('StokOut data imported.');
            } else {
                $this->command->warn('stok_out.csv not found in csv/ folder. Skipping StokOut import.');
            }

            // Process kategori_part.csv
            $kategoriPartCsvPath = database_path('csv/kategori_part.csv');
            if (file_exists($kategoriPartCsvPath)) {
                $csv = Reader::createFromPath($kategoriPartCsvPath, 'r');
                $csv->setHeaderOffset(0);
                foreach ($csv->getRecords() as $record) {
                    KategoriPart::updateOrCreate(
                        ['id_kategori_part' => $record['id_kategori_part']],
                        ['nama_kategori' => $record['nama_kategori']]
                    );
                }
                $this->command->info('KategoriPart data imported.');
            } else {
                $this->command->warn('kategori_part.csv not found. Skipping KategoriPart import.');
            }

            // Process part.csv
            $partCsvPath = database_path('csv/part.csv');
            if (file_exists($partCsvPath)) {
                $csv = Reader::createFromPath($partCsvPath, 'r');
                $csv->setHeaderOffset(0);
                foreach ($csv->getRecords() as $record) {
                    Part::updateOrCreate(
                        ['id_part' => $record['id_part']],
                        [
                            'id_kategori_part' => $record['id_kategori_part'],
                            'nama_part' => $record['nama_part'],
                        ]
                    );
                }
                $this->command->info('Part data imported.');
            } else {
                $this->command->warn('part.csv not found. Skipping Part import.');
            }

            // Process vendor.csv
            $vendorCsvPath = database_path('csv/vendor.csv');
            if (file_exists($vendorCsvPath)) {
                $csv = Reader::createFromPath($vendorCsvPath, 'r');
                $csv->setHeaderOffset(0);
                foreach ($csv->getRecords() as $record) {
                    Vendor::updateOrCreate(
                        ['id_vendor' => $record['id_vendor']],
                        [
                            'nama_vendor' => $record['nama_vendor'],
                            'alamat_vendor' => $record['alamat_vendor'],
                            'kontak_vendor' => $record['kontak_vendor'],
                            'createdby' => $record['created_by'],
                            'updatedby' => $record['updated_by']
                        ]
                    );
                }
                $this->command->info('Vendor data imported.');
            } else {
                $this->command->warn('vendor.csv not found. Skipping Vendor import.');
            }

            // Process vendor_part.csv
            $vendorPartCsvPath = database_path('csv/vendor_part.csv');
            if (file_exists($vendorPartCsvPath)) {
                $csv = Reader::createFromPath($vendorPartCsvPath, 'r');
                $csv->setHeaderOffset(0);
                foreach ($csv->getRecords() as $record) {
                    VendorPart::updateOrCreate(
                        ['id_vendorpart' => $record['id_vendorpart']],
                        [
                            'id_part' => $record['id_part'],
                            'id_vendor' => $record['id_vendor'],
                            'harga_part' => $record['harga_part'],
                            'harga_sebelumnya_part' => $record['harga_sebelumnya_part'],
                            'merk_part' => $record['merk_part'],
                            'satuan_part' => $record['satuan_part'],
                        ]
                    );
                }
                $this->command->info('VendorPart data imported.');
            } else {
                $this->command->warn('vendor_part.csv not found. Skipping VendorPart import.');
            }

            $this->command->info('All CSV data import attempts completed.');
        });
    }
}
