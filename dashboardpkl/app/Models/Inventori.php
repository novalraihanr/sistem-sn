<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventori extends Model
{
    use HasFactory;

    protected $table = 'inventori';
    protected $primaryKey = 'id_produk';
    protected $fillable = [
        'id_kategori',
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

    public function kategoriInv(): BelongsTo
    {
        return $this->belongsTo(KategoriInv::class, 'id_kategori', 'id_kategori');
    }
}
