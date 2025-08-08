<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StokOut extends Model
{
    use HasFactory;

    protected $table = 'stok_out';
    protected $primaryKey = 'id_stokout';
    protected $fillable = [
        'id_produk',
        'stokout_kuantitas',
        'stokout_spesifikasi',
        'stokout_digunakan',
        'stokout_divisi',
        'stokout_keterangan',
        'stokin_tanggal',
    ];

    public function inventori(): BelongsTo
    {
        return $this->belongsTo(Inventori::class, 'id_produk', 'id_produk');
    }
}