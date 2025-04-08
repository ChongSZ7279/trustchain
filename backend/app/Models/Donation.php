<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'transaction_hash',
        'amount',
        'currency_type',
        'cause_id',
        'status',
        'smart_contract_data',
        'donor_message',
        'is_anonymous',
        'task_proof',
        'verification_notes',
        'verified_at',
        'completed_at'
    ];

    protected $casts = [
        'smart_contract_data' => 'array',
        'task_proof' => 'array',
        'is_anonymous' => 'boolean',
        'amount' => 'decimal:8',
        'verified_at' => 'datetime',
        'completed_at' => 'datetime'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'ic_number');
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_hash', 'transaction_hash');
    }

    public function charity()
    {
        return $this->belongsTo(Charity::class, 'cause_id');
    }

    public function impactMetrics()
    {
        return $this->hasOne(DonationImpactMetric::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    // Status check methods
    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isConfirmed()
    {
        return $this->status === 'confirmed';
    }

    public function isVerified()
    {
        return $this->status === 'verified';
    }

    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    // Status update methods
    public function confirm()
    {
        $this->update(['status' => 'confirmed']);
    }

    public function verify($proof, $notes = null)
    {
        $this->update([
            'status' => 'verified',
            'task_proof' => $proof,
            'verification_notes' => $notes,
            'verified_at' => now()
        ]);
    }

    public function complete()
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now()
        ]);
    }

    // Methods
    public function updateStatus($status)
    {
        $this->update(['status' => $status]);
    }

    public function getFormattedAmount()
    {
        return number_format($this->amount, 8) . ' ' . strtoupper($this->currency_type);
    }

    public function canBeVerified()
    {
        return $this->status === 'confirmed';
    }

    public function canBeCompleted()
    {
        return $this->status === 'verified';
    }

    public function canBeModified()
    {
        return in_array($this->status, ['pending', 'confirmed']);
    }

    public function getBlockExplorerUrlAttribute()
    {
        if ($this->transaction_hash) {
            // Update to use Sepolia block explorer
            return 'https://sepolia.etherscan.io/tx/' . $this->transaction_hash;
        }
        return null;
    }
}
