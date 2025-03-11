<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_ic',
        'charity_id',
        'task_id',
        'amount',
        'type',
        'status',
        'transaction_hash',
        'contract_address',
        'message',
        'anonymous',
    ];

    /**
     * Get the user that made the transaction.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_ic', 'ic_number');
    }

    /**
     * Get the charity associated with the transaction.
     */
    public function charity(): BelongsTo
    {
        return $this->belongsTo(Charity::class);
    }

    /**
     * Get the task associated with the transaction.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}
