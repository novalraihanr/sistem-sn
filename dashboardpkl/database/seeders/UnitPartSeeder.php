<?php

namespace Database\Seeders;

use App\Models\Part;
use App\Models\Unit;
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
        $units = Unit::all();

        foreach ($units as $unit) {
            $partsToAttach = $parts->random(rand(2, 5));
            foreach ($partsToAttach as $part) {
                $unit->parts()->attach($part->id_part, ['stok' => rand(10, 100)]);
            }
        }
    }
}