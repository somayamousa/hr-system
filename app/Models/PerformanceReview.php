<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PerformanceReview extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'employee_id', 'reviewer_id', 'review_year', 'period',
        'overall_score', 'strengths', 'improvements', 'goals',
        'comments', 'status', 'submitted_at', 'acknowledged_at',
    ];

    protected $casts = [
        'overall_score' => 'decimal:2',
        'submitted_at' => 'datetime',
        'acknowledged_at' => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function scores()
    {
        return $this->hasMany(ReviewScore::class);
    }
}
