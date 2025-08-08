<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransaksiVendor extends Model
{
    protected $table = 'transaksi_vendor';
    protected $primaryKey = 'id_transaksivendor';
    protected $fillable = ['id_transaksi', 'id_vendorpart', 'jumlah', 'total_harga'];

    public function transaksi(): BelongsTo
    {
        return $this->belongsTo(Transaksi::class, 'id_transaksi', 'id_transaksi');
    }

    public function vendorPart(): BelongsTo
    {
        return $this->belongsTo(VendorPart::class, 'id_vendorpart', 'id_vendorpart');
    }
}
