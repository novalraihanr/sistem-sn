<?php

namespace Database\Seeders;

use App\Models\Part;
use App\Models\Vendor;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class VendorPartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $parts = Part::all();
        $users = User::all();
        Vendor::factory(10)->create();
        $vendors = Vendor::all();

        foreach ($vendors as $vendor) {
            $partsToAttach = $parts->random(rand(5, 10));
            foreach ($partsToAttach as $part) {
                $vendor->parts()->attach($part->id_part, [
                    'harga_part' => rand(10000, 1000000),
                    'merk_part' => fake()->company(),
                    'satuan_part' => fake()->randomElement(['Pcs', 'Unit', 'Box']),
                    'createdby' => $users->random()->name,
                ]);
            }
        }
    }
}