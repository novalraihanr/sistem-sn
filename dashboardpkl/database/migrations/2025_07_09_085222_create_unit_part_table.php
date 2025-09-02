<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('unit_part', function (Blueprint $table) {
            $table->id('id_unitpart');
            $table->unsignedBigInteger('id_unit');
            $table->unsignedBigInteger('id_part');
            $table->integer('stok');
            $table->timestamps();

            $table->foreign('id_unit')->references('id_unit')->on('unit')->onDelete('cascade');
            $table->foreign('id_part')->references('id_part')->on('part')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unit_part');
    }
};
