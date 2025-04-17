<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'ic_number';
    protected $keyType = 'string';
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'ic_number',
        'name',
        'password',
        'profile_picture',
        'front_ic_picture',
        'back_ic_picture',
        'phone_number',
        'gmail',
        'wallet_address',
        'is_admin',
        'frame_color_code'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function organizations()
    {
        return $this->hasMany(Organization::class, 'representative_id', 'ic_number');
    }

    /**
     * Get the organizations that the user follows.
     */
    public function followedOrganizations()
    {
        return $this->belongsToMany(Organization::class, 'organization_followers', 'user_ic', 'organization_id')
            ->withTimestamps();
    }

    /**
     * Get the charities that the user follows.
     */
    public function followedCharities()
    {
        return $this->belongsToMany(Charity::class, 'charity_followers', 'user_ic', 'charity_id')
            ->withTimestamps();
    }
}
