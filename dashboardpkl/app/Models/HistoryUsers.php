<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class HistoryUsers extends Model
{
    use HasFactory;
    protected $table = 'history_users';
    protected $primaryKey = 'id_history';
    protected $fillable = [
        'id_user',
        'nama_user',
        'keterangan',
        'tanggal',
        'jam'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }
}
