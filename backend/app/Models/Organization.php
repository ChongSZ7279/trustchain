<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Organization extends Authenticatable
{
    use HasFactory, HasApiTokens, Notifiable;

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
        'password',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
    ];

    public function representative()
    {
        return $this->belongsTo(User::class, 'representative_id', 'ic_number');
    }
} 