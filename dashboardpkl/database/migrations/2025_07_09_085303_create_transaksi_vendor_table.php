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
        Schema::create('transaksi_vendor', function (Blueprint $table) {
            $table->id('id_transaksivendor');
            $table->unsignedBigInteger('id_transaksi');
            $table->unsignedBigInteger('id_vendorpart');
            $table->double('harga_part_saat_ini')->nullable(true);
            $table->integer('jumlah');
            $table->double('total_harga');
            $table->timestamps();

            $table->foreign('id_transaksi')->references('id_transaksi')->on('transaksi')->onDelete('cascade');
            $table->foreign('id_vendorpart')->references('id_vendorpart')->on('vendor_part')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi_vendor');
    }
};
