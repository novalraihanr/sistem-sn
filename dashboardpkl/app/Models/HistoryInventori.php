<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HistoryInventori extends Model
{
    use HasFactory;

    protected $table = 'history_inventori';
    protected $primaryKey = 'id_produk';
    public $timestamps = false;
    protected $fillable = [
        'kategori',
        'nama_produk',
        'stok_awal',
        'stok_akhir',
        'stok_in',
        'stok_out',
        'produk_satuan',
        'produk_minimum_stok',
        'produk_status',
        'bulan_sekarang',
    ];
}
