<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Charity extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'name',
        'category',
        'description',
        'objective',
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

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get the users that follow this charity.
     */
    public function followers()
    {
        return $this->belongsToMany(User::class, 'charity_followers', 'charity_id', 'user_ic')
            ->withTimestamps();
    }

    /**
     * Get the donations for this charity.
     */
    public function donations()
    {
        return $this->hasMany(Donation::class, 'cause_id');
    }

    /**
     * Get the follower count for this charity.
     */
    public function getFollowerCountAttribute()
    {
        return $this->followers()->count();
    }
} 