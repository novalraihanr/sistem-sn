<?php

namespace Database\Seeders;

use App\Models\KategoriPart;
use App\Models\Part;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        KategoriPart::factory(5)->create()->each(function ($kategori) {
            Part::factory(3)->create(['id_kategori_part' => $kategori->id_kategori_part]);
        });
    }
}
