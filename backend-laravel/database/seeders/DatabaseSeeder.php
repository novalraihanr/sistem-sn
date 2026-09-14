<?php

namespace Database\Seeders;

use App\Models\Inventori;
use App\Models\User;
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
            'email' => 'admin@gmail.com',
            'password' => 'password'
        ]);


        $this->call([
            /* CsvDataSeeder::class, */
            PartSeeder::class,
            VendorPartSeeder::class,
            InventoriSeeder::class
        ]);
    }
}
