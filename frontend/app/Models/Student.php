<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'user_id',
        'batch_id',
        'name',
        'grade',
        'attendance',
        'progress',
        'streak',
        'last_login_at',
        'classes_taken',
        'avatar',
        'color',
        'package_name',
        'fee_status',
        'parent_name',
        'parent_phone'
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function batch()
    {
        return $this->belongsTo(Batch::class, 'batch_id');
    }

    /**
     * Get the exact datetime when the 7-day trial period expires.
     */
    public function trialEndsAt()
    {
        return $this->created_at ? $this->created_at->addDays(7) : now()->addDays(7);
    }

    /**
     * Get the number of remaining trial days.
     */
    public function daysRemaining(): int
    {
        if ($this->fee_status === 'Paid') {
            return 0;
        }
        $diff = now()->diffInDays($this->trialEndsAt(), false);
        return $diff > 0 ? (int) $diff : 0;
    }

    /**
     * Determine if the student's trial has expired and payment is still pending.
     */
    public function isTrialExpired(): bool
    {
        return $this->fee_status === 'Pending' && now()->gt($this->trialEndsAt());
    }
}
