<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Curriculum extends Model
{
    protected $table = 'curricula';

    protected $fillable = [
        'title',
        'duration',
        'description',
        'syllabus',
        'objectives',
        'outcomes',
        'certification',
        'dates',
        'milestones',
        'engagement',
        'is_archived',
    ];

    protected $casts = [
        'syllabus' => 'array',
        'objectives' => 'array',
        'outcomes' => 'array',
        'milestones' => 'array',
        'engagement' => 'integer',
        'is_archived' => 'boolean',
    ];
}
