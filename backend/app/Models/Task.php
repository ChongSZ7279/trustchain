<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'charity_id',
        'name',
        'description',
        'fund_targeted',
        'status',
        'proof',
    ];

    protected $casts = [
        'fund_targeted' => 'decimal:2',
    ];

    public function charity()
    {
        return $this->belongsTo(Charity::class);
    }
} 