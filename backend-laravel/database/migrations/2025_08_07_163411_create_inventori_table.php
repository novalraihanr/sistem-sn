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
        Schema::create('inventori', function (Blueprint $table) {
            $table->id("id_produk");
            $table->string("nama_produk");
            $table->unsignedBigInteger("id_kategori");
            $table->string("spesifikasi")->default('-');
            $table->integer("stok_awal");
            $table->integer("stok_akhir");
            $table->integer("stok_in");
            $table->integer("stok_out");
            $table->string("produk_satuan");
            $table->integer("produk_minimum_stok");
            $table->enum("produk_status", ["Cukup", "By Order", "Need Order"]);
            $table->date("bulan_sekarang");
            $table->timestamps();

            $table->foreign('id_kategori')->references('id_kategori')->on('kategori_inv')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventori');
    }
};
