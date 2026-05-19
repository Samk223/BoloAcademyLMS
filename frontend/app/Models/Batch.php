<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Batch extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'curriculum_name',
        'schedule_details',
        'teacher_id',
        'capacity',
        'seats_reserved'
    ];

    /**
     * Get the teacher/mentor assigned to this batch.
     */
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Get all students enrolled in this batch.
     */
    public function students()
    {
        return $this->hasMany(Student::class, 'batch_id');
    }
}
