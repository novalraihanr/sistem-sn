<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Part extends Model
{
    use HasFactory;
    protected $table = 'part';
    protected $primaryKey = 'id_part';
    protected $fillable = ['nama_part'];

    public function units(): BelongsToMany
    {
        return $this->belongsToMany(Unit::class, 'unit_part', 'id_part', 'id_unit')
            ->using(UnitPart::class)
            ->withPivot('stok');
    }

    public function vendors(): BelongsToMany
    {
        return $this->belongsToMany(Vendor::class, 'vendor_part', 'id_part', 'id_vendor')
            ->using(VendorPart::class)
            ->withPivot('harga_part', 'merk_part');
    }
}
