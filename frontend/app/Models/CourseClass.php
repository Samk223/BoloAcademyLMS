<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseClass extends Model
{
    protected $table = 'classes';

    protected $fillable = [
        'teacher_id',
        'title',
        'description',
        'scheduled_at',
        'duration',
        'status',
        'meeting_link',
        'grade',
        'student_ids',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'student_ids' => 'array',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
