<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentAssignment extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = ['student_id', 'teacher_id', 'title', 'task', 'status', 'submitted_at'];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
