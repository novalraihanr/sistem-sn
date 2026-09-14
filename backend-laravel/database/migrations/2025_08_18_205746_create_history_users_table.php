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
        Schema::create('history_users', function (Blueprint $table) {
            $table->id("id_history");
            $table->unsignedBigInteger('id_user')->nullable(true);
            $table->string("nama_user");
            $table->string('keterangan');
            $table->date('tanggal');
            $table->time('jam');
            $table->timestamps();

            $table->foreign('id_user')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('history_users');
    }
};
