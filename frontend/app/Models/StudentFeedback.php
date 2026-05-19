<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentFeedback extends Model
{
    protected $table = 'student_feedbacks';

    protected $fillable = [
        'student_id',
        'teacher_id',
        'content',
        'type',
        'is_visible'
    ];
}
