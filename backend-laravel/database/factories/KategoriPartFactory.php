<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\KategoriPart>
 */
class KategoriPartFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nama_kategori' => fake()->randomElement(['Engine Parts', 'Body Parts', 'Electrical', 'Tools', 'Heavy Equipment', 'Safety Gear']),
        ];
    }
}
