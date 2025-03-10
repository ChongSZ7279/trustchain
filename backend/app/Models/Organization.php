<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Organization extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'logo',
        'category',
        'description',
        'objectives',
        'representative_id',
        'statutory_declaration',
        'verified_document',
        'wallet_address',
        'register_address',
        'gmail',
        'phone_number',
        'website',
        'facebook',
        'instagram',
        'others',
        'password'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function representative()
    {
        return $this->belongsTo(User::class, 'representative_id', 'ic_number');
    }
} 