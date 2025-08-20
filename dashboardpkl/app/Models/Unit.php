<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Unit extends Model
{
    use HasFactory;
    
    protected $table = 'unit';
    protected $primaryKey = 'id_unit';
    protected $fillable = ['nama_unit'];

    public function parts(): BelongsToMany
    {
        return $this->belongsToMany(Part::class, 'unit_part', 'id_unit', 'id_part')
            ->using(UnitPart::class)
            ->withPivot('stok');
    }
}