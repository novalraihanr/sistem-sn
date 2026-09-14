<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaksi extends Model
{
    protected $table = 'transaksi';
    protected $primaryKey = 'id_transaksi';
    protected $fillable = ['total'];


    public function transaksivendor(): HasMany
    {
        return $this->hasMany(TransaksiVendor::class, 'id_transaksi', 'id_transaksi');
    }
}
