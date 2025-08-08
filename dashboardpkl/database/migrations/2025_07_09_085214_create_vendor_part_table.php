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
        Schema::create('vendor_part', function (Blueprint $table) {
            $table->id('id_vendorpart');
            $table->unsignedBigInteger('id_part');
            $table->unsignedBigInteger('id_vendor');
            $table->double('harga_part');
            $table->double('harga_sebelumnya_part')->nullable(true);
            $table->string('merk_part');
            $table->string('updatedby')->nullable(true);
            $table->string('createdby');
            $table->timestamps();

            $table->foreign('id_part')->references('id_part')->on('part');
            $table->foreign('id_vendor')->references('id_vendor')->on('vendor');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_part');
    }
};
