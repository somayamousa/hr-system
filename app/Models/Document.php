<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'employee_id', 'title', 'type', 'file_path', 'file_name',
        'file_size', 'mime_type', 'expiry_date', 'notes', 'uploaded_by',
    ];

    protected $casts = ['expiry_date' => 'date'];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
