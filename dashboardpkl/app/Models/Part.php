<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Part extends Model
{
    use HasFactory;
    protected $table = 'part';
    protected $primaryKey = 'id_part';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_part',
        'nama_part',
        'id_kategori_part'
    ];

    public function kategoriPart(): BelongsTo
    {
        return $this->belongsTo(KategoriPart::class, 'id_kategori_part');
    }

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