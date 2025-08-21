<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Vendor extends Model
{
    use HasFactory;
    protected $table = 'vendor';
    protected $primaryKey = 'id_vendor';
    protected $fillable = ['nama_vendor', 'alamat_vendor', 'kontak_vendor', 'createdby', 'updatedby'];

    public function parts(): BelongsToMany
    {
        return $this->belongsToMany(Part::class, 'vendor_part', 'id_vendor', 'id_part')
            ->using(VendorPart::class)
            ->withPivot('harga_part', 'merk_part', 'satuan_part');
    }
}
