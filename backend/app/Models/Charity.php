<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Charity extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'category',
        'description',
        'fund_targeted',
        'fund_received',
        'picture_path',
        'verified_document',
        'is_verified'
    ];

    protected $casts = [
        'fund_targeted' => 'decimal:2',
        'fund_received' => 'decimal:2',
        'is_verified' => 'boolean',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }
} 