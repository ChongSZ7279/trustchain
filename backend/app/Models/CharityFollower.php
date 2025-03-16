<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CharityFollower extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_ic',
        'charity_id',
    ];

    /**
     * Get the user that follows the charity.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_ic', 'ic_number');
    }

    /**
     * Get the charity that is being followed.
     */
    public function charity()
    {
        return $this->belongsTo(Charity::class);
    }
} 