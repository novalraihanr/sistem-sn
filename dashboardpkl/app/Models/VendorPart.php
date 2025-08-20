<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorPart extends Pivot
{
    protected $table = 'vendor_part';
    protected $primaryKey = 'id_vendorpart';
    public $incrementing = true; // Since you have a primary key

    protected $fillable = ['id_part', 'id_vendor', 'harga_part', 'harga_sebelumnya_part', 'merk_part', 'satuan_part', 'updatedby', 'createdby'];

    /**
     * Get the vendor that owns the part.
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class, 'id_vendor');
    }

    /**
     * Get the part that belongs to the vendor.
     */
    public function part(): BelongsTo
    {
        return $this->belongsTo(Part::class, 'id_part');
    }

    /**
     * Get the vendor transactions for this vendor-part relationship.
     */
    public function transaksivendor(): HasMany
    {
        return $this->hasMany(TransaksiVendor::class, 'id_vendorpart', 'id_vendorpart');
    }
}
