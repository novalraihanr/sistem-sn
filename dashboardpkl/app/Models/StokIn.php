<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StokIn extends Model
{
    use HasFactory;

    protected $table = 'stok_in';
    protected $primaryKey = 'id_stokin';
    protected $fillable = [
        'id_produk',
        'stokin_kuantitas',
        'stokin_spesifikasi',
        'stokin_nopomo',
        'stokin_digunakan',
        'stokin_harga_produk',
        'stokin_harga_total',
        'stokin_tanggal',
    ];

    public function inventori(): BelongsTo
    {
        return $this->belongsTo(Inventori::class, 'id_produk', 'id_produk');
    }
}
