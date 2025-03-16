<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrganizationFollower extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_ic',
        'organization_id',
    ];

    /**
     * Get the user that follows the organization.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_ic', 'ic_number');
    }

    /**
     * Get the organization that is being followed.
     */
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }
}
