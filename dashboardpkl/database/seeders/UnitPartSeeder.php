<?php

namespace Database\Seeders;

use App\Models\Unit;
use App\Models\Part;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UnitPartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $parts = Part::all();

        if ($parts->count() < 2) {
            // Create dummy parts if not enough exist
            Part::factory()->count(2 - $parts->count())->create();
            $parts = Part::all();
        }

        for ($i = 1; $i <= 5; $i++) {
            $unit = Unit::create([
                'nama_unit' => 'Unit ' . $i,
            ]);

            // Attach 2 random parts to each unit with a default stok
            $unit->parts()->attach([$parts->random()->id_part => ['stok' => 10], $parts->random()->id_part => ['stok' => 10]]);
        }
    }
}
