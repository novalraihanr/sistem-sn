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
        Schema::create('stok_in', function (Blueprint $table) {
            $table->id("id_stokin");
            $table->unsignedBigInteger("id_produk");
            $table->integer("stokin_kuantitas");
            $table->string("stokin_spesifikasi")->nullable(true);
            $table->string("stokin_nopomo");
            $table->string("stokin_digunakan");
            $table->integer("stokin_harga_produk");
            $table->integer("stokin_harga_total");
            $table->date("stokin_tanggal");
            $table->timestamps();


            $table->foreign('id_produk')->references('id_produk')->on('inventori');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stok_in');
    }
};
