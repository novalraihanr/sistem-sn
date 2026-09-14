<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UnitPart extends Pivot
{
    protected $table = 'unit_part';
    protected $primaryKey = 'id_unitpart';
    public $incrementing = true;

    protected $fillable = ['id_unit', 'id_part', 'stok'];

    /**
     * Get the unit associated with this entry.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'id_unit');
    }

    /**
     * Get the part associated with this entry.
     */
    public function part(): BelongsTo
    {
        return $this->belongsTo(Part::class, 'id_part');
    }
}
