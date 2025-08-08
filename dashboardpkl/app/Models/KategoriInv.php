<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KategoriInv extends Model
{
    use HasFactory;
    protected $table = 'kategori_inv';
    protected $primaryKey = 'id_kategori';
    protected $fillable = ['nama_kategori'];

    public function inventori(): HasMany
    {
        return $this->hasMany(Inventori::class, 'id_kategori', 'id_kategori');
    }
}
