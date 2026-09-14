<?php

namespace Database\Seeders;

use App\Models\Inventori;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InventoriSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Inventori::factory(15)->create();
    }
}