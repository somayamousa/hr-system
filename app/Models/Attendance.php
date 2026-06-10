<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'employee_id', 'date', 'check_in', 'check_out',
        'work_minutes', 'status', 'notes', 'recorded_by',
    ];

    protected $casts = ['date' => 'date'];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function getWorkHoursAttribute(): ?string
    {
        if (! $this->work_minutes) return null;
        $h = intdiv($this->work_minutes, 60);
        $m = $this->work_minutes % 60;
        return "{$h}:{$m}";
    }
}
