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
        Schema::create('part', function (Blueprint $table) {
            $table->string('id_part')->primary();
            $table->unsignedBigInteger('id_kategori_part');
            $table->string('nama_part');
            $table->timestamps();

            $table->foreign('id_kategori_part')->references('id_kategori_part')->on('kategori_part')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('part');
    }
};
