<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Unit;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin',
            'role' => 'admin',
            'email' => 'admin@sncargo.com',
        ]);

        Unit::factory(5)->create();

        $this->call([
            PartSeeder::class,
            InventoriSeeder::class,
            UnitPartSeeder::class,
            VendorPartSeeder::class,
        ]);
    }
}
