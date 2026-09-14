<?php

namespace Database\Factories;

use App\Models\KategoriPart;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Part>
 */
class PartFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            /* 'id_part' => fake()->uuid(), */
            'nama_part' => fake()->randomElement(['Engine Block', 'Cylinder Head', 'Crankshaft', 'Piston', 'Spark Plug', 'Brake Pad', 'Oil Filter', 'Air Filter', 'Excavator Bucket', 'Bulldozer Blade', 'Concrete Mixer', 'Welding Machine', 'Safety Helmet', 'Work Gloves']),
            'id_kategori_part' => KategoriPart::factory(),
        ];
    }
}
