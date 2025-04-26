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
        'pictures_count',
        'verification_status',
        'milestone_status',
        'funds_released'
    ];

    protected $casts = [
        'fund_targeted' => 'decimal:2',
        'funds_released' => 'boolean',
        'pictures_count' => 'integer'
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_VERIFIED = 'verified';

    // Verification requirements
    const REQUIRED_PICTURES = 5;
    const REQUIRED_PROOF = 1;

    public function charity()
    {
        return $this->belongsTo(Charity::class);
    }

    /**
     * Get the pictures for the task.
     */
    public function pictures()
    {
        return $this->hasMany(TaskPicture::class);
    }

    /**
     * Get the pictures for the task (alias for pictures).
     */
    public function taskPictures()
    {
        return $this->hasMany(TaskPicture::class);
    }

    public function verificationComplete()
    {
        return $this->pictures()->count() >= self::REQUIRED_PICTURES && $this->proof !== null;
    }

    public function canReleaseFunds()
    {
        return $this->verificationComplete() && 
               $this->status === self::STATUS_VERIFIED && 
               !$this->funds_released;
    }

    /**
     * Get the transactions associated with this task.
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}