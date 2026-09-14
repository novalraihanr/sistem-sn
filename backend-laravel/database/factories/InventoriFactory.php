<?php

namespace Database\Factories;

use App\Models\KategoriInv;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Inventori>
 */
class InventoriFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $stok_awal = fake()->numberBetween(50, 200);
        $stok_in = fake()->numberBetween(10, 50);
        $stok_out = fake()->numberBetween(5, 30);
        $stok_akhir = $stok_awal + $stok_in - $stok_out;
        $produk_minimum_stok = fake()->numberBetween(10, 20);

        return [
            'id_kategori' => KategoriInv::factory(),
            'nama_produk' => fake()->randomElement(['Pen', 'Notebook', 'Stapler', 'Paper', 'Printer Ink', 'Desk Chair', 'Monitor', 'Keyboard', 'Mouse', 'Whiteboard', 'Markers', 'Folders', 'Envelopes', 'Coffee', 'Sugar']),
            'stok_awal' => $stok_awal,
            'stok_akhir' => $stok_akhir,
            'stok_in' => $stok_in,
            'stok_out' => $stok_out,
            'produk_satuan' => fake()->randomElement(['Pcs', 'Unit', 'Box']),
            'produk_minimum_stok' => $produk_minimum_stok,
            
            'produk_status' => ($stok_akhir <= $produk_minimum_stok * 0.2) ? 'Need Order' : (($stok_akhir <= $produk_minimum_stok) ? 'By Order' : 'Cukup'),
            'bulan_sekarang' => now()->startOfMonth()->toDateString(),
        ];
    }
}
