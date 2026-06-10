<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes;

    // employee_number excluded from fillable — generated internally only
    protected $fillable = [
        'first_name', 'last_name', 'email', 'phone',
        'date_of_birth', 'gender', 'national_id', 'nationality', 'address',
        'emergency_contact_name', 'emergency_contact_phone', 'photo',
        'hire_date', 'employment_type', 'status', 'job_title', 'position',
        'basic_salary', 'department_id', 'user_id',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'hire_date' => 'date',
        'basic_salary' => 'decimal:2',
    ];

    public const SENSITIVE_FIELDS = ['basic_salary', 'national_id', 'date_of_birth', 'emergency_contact_phone'];

    public function toSafeArray(): array
    {
        return $this->makeHidden(self::SENSITIVE_FIELDS)->toArray();
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function activeContract()
    {
        return $this->hasOne(Contract::class)->where('status', 'active')->latest();
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
