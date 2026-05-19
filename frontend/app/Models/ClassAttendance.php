<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassAttendance extends Model
{
    protected $fillable = [
        'class_id',
        'student_id',
        'joined_at',
        'last_ping_at',
        'is_banned'
    ];

    public function class()
    {
        return $this->belongsTo(CourseClass::class, 'class_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }}
