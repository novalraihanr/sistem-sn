<?php

namespace Database\Seeders;

use App\Models\Part;
use App\Models\Vendor;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class VendorPartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create specific parts if they don't exist
        $partNames = ['bolt', 'mechanical', 'electrical'];
        $specificParts = collect();
        foreach ($partNames as $name) {
            $specificParts->push(Part::firstOrCreate(['nama_part' => $name]));
        }

        Vendor::factory()->count(5)->create()->each(function ($vendor) use ($specificParts) {
            // Attach 2 random parts from the specific parts list to each vendor
            $partsToAttach = $specificParts->random(2);

            foreach ($partsToAttach as $part) {
                $vendor->parts()->attach($part->getKey(), [
                    'harga_part' => rand(10000, 100000),
                    'merk_part' => 'Merk ' . rand(1, 100),
                    'createdby' => 'system'
                ]);
            }
        });
    }
}
