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
        'cover_image_path',
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

    public function charities()
    {
        return $this->hasMany(Charity::class);
    }

    /**
     * Get the users that follow this organization.
     */
    public function followers()
    {
        return $this->belongsToMany(User::class, 'organization_followers', 'organization_id', 'user_ic')
            ->withTimestamps();
    }

    /**
     * Get the follower count for this organization.
     */
    public function getFollowerCountAttribute()
    {
        return $this->followers()->count();
    }
} 