<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'description',
        'objectives',
        'representative_id',
        'wallet_address',
        'register_address',
        'gmail',
        'phone_number',
        'website',
        'facebook',
        'instagram',
        'others',
        'logo',
        'statutory_declaration',
        'verified_document',
        'is_verified',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
    ];

    public function representative()
    {
        return $this->belongsTo(User::class, 'representative_id', 'ic_number');
    }
} 