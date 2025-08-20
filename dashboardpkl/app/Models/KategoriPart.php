<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KategoriPart extends Model
{
    use HasFactory;
    protected $table = 'kategori_part';
    protected $primaryKey = 'id_kategori_part';
    protected $fillable = ['nama_kategori'];

    public function parts(): HasMany
    {
        return $this->hasMany(Part::class, 'id_kategori_part');
    }
}