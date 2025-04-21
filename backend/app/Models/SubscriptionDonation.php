<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionDonation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'organization_id',
        'amount',
        'currency_type',
        'frequency',
        'status',
        'payment_method',
        'stripe_subscription_id',
        'stripe_customer_id',
        'donor_message',
        'is_anonymous',
        'last_payment_date',
        'next_payment_date',
        'cancelled_at',
    ];

    protected $casts = [
        'amount' => 'float',
        'is_anonymous' => 'boolean',
        'last_payment_date' => 'datetime',
        'next_payment_date' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    /**
     * Get the user that owns this subscription.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'ic_number');
    }

    /**
     * Get the organization that receives the subscription donation.
     */
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get all donations generated from this subscription.
     */
    public function donations()
    {
        return $this->hasMany(Donation::class, 'subscription_id');
    }

    /**
     * Check if the subscription is active.
     */
    public function isActive()
    {
        return $this->status === 'active';
    }

    /**
     * Calculate the next payment date based on frequency.
     */
    public function calculateNextPaymentDate()
    {
        $lastPayment = $this->last_payment_date ?? $this->created_at;
        
        switch ($this->frequency) {
            case 'weekly':
                return $lastPayment->addWeek();
            case 'monthly':
                return $lastPayment->addMonth();
            case 'quarterly':
                return $lastPayment->addMonths(3);
            case 'yearly':
                return $lastPayment->addYear();
            default:
                return $lastPayment->addMonth();
        }
    }

    /**
     * Pause the subscription.
     */
    public function pause()
    {
        $this->status = 'paused';
        $this->save();
        return $this;
    }

    /**
     * Resume the subscription.
     */
    public function resume()
    {
        $this->status = 'active';
        $this->next_payment_date = $this->calculateNextPaymentDate();
        $this->save();
        return $this;
    }

    /**
     * Cancel the subscription.
     */
    public function cancel()
    {
        $this->status = 'cancelled';
        $this->cancelled_at = now();
        $this->save();
        return $this;
    }
} 