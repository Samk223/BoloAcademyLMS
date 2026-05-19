<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'student_name',
        'rating',
        'comment',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
