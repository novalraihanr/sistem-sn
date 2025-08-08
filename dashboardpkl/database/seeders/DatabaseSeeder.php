<?php

namespace Database\Seeders;

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
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'Test User',
             'password' => bcrypt('password'), // You might want to use a proper password hash
            ]
        );

        $this->call(VendorPartSeeder::class);
        $this->call(UnitPartSeeder::class);
        $this->call(InventoriSeeder::class);
    }
}
