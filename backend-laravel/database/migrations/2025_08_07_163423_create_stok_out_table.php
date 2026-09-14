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
        Schema::create('stok_out', function (Blueprint $table) {
            $table->id("id_stokout");
            $table->unsignedBigInteger("id_produk");
            $table->integer("stokout_kuantitas");
            $table->string("stokout_digunakan");
            $table->string("stokout_divisi");
            $table->string("stokout_keterangan");
            $table->date("stokin_tanggal");
            $table->timestamps();

            $table->foreign('id_produk')->references('id_produk')->on('inventori')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stok_out');
    }
};
