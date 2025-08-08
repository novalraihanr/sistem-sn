<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\KategoriInv;
use App\Models\Inventori;
use App\Models\StokIn;
use App\Models\StokOut;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class InventoriSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        DB::transaction(function () use ($faker) {
            // Create 3 KategoriInv
            $kategoriIds = [];
            for ($i = 0; $i < 3; $i++) {
                $kategori = KategoriInv::create([
                    'nama_kategori' => $faker->unique()->word() . ' Kategori',
                ]);
                $kategoriIds[] = $kategori->id_kategori;
            }

            // Create 3 Inventori items, each assigned to a KategoriInv
            foreach ($kategoriIds as $kategoriId) {
                $stokAwal = $faker->numberBetween(50, 200);
                $produkMinimumStok = $faker->numberBetween(5, 20);

                $inventori = Inventori::create([
                    'id_kategori' => $kategoriId,
                    'nama_produk' => $faker->unique()->word() . ' Produk',
                    'stok_awal' => $stokAwal,
                    'stok_akhir' => $stokAwal, // Will be updated by stok in/out
                    'stok_in' => 0,
                    'stok_out' => 0,
                    'produk_satuan' => $faker->randomElement(['Pcs', 'Unit', 'Box', 'Liter']),
                    'produk_minimum_stok' => $produkMinimumStok,
                    'produk_status' => 'Cukup', // Will be updated by stok in/out
                    'bulan_sekarang' => now()->toDateString(),
                ]);

                // Create 2 or 3 StokIn records for each Inventori
                $numStokIn = $faker->numberBetween(2, 3);
                for ($j = 0; $j < $numStokIn; $j++) {
                    $kuantitasIn = $faker->numberBetween(5, 30);
                    $hargaProdukIn = $faker->numberBetween(10000, 100000);
                    StokIn::create([
                        'id_produk' => $inventori->id_produk,
                        'stokin_kuantitas' => $kuantitasIn,
                        'stokin_spesifikasi' => $faker->sentence(3),
                        'stokin_nopomo' => $faker->unique()->bothify('PO####'),
                        'stokin_digunakan' => $faker->company(),
                        'stokin_harga_produk' => $hargaProdukIn,
                        'stokin_harga_total' => $kuantitasIn * $hargaProdukIn,
                        'stokin_tanggal' => $faker->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
                    ]);
                    $inventori->stok_in += $kuantitasIn;
                }

                // Create 2 or 3 StokOut records for each Inventori
                $numStokOut = $faker->numberBetween(2, 3);
                for ($k = 0; $k < $numStokOut; $k++) {
                    $kuantitasOut = $faker->numberBetween(1, 15);
                    StokOut::create([
                        'id_produk' => $inventori->id_produk,
                        'stokout_kuantitas' => $kuantitasOut,
                        'stokout_spesifikasi' => $faker->sentence(3),
                        'stokout_digunakan' => $faker->company(),
                        'stokout_divisi' => $faker->randomElement(['Produksi', 'Gudang', 'Penjualan']),
                        'stokout_keterangan' => $faker->sentence(4),
                        'stokin_tanggal' => $faker->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
                    ]);
                    $inventori->stok_out += $kuantitasOut;
                }

                // Update inventori stok_akhir and produk_status based on the logic
                if ($inventori->stok_in == 0) {
                    $inventori->stok_akhir = $inventori->stok_awal - $inventori->stok_out;
                } else {
                    $inventori->stok_akhir = $inventori->stok_in - $inventori->stok_out;
                }

                $threshold20Percent = $inventori->produk_minimum_stok * 0.2;
                if ($inventori->stok_akhir > $inventori->produk_minimum_stok) {
                    $inventori->produk_status = 'Cukup';
                } else if ($inventori->stok_akhir <= $threshold20Percent) {
                    $inventori->produk_status = 'Need Order';
                } else {
                    $inventori->produk_status = 'By Order';
                }
                $inventori->save();
            }
        });
    }
}
