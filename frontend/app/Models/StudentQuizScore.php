<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentQuizScore extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = ['student_id', 'teacher_id', 'quiz_name', 'score', 'taken_at'];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
