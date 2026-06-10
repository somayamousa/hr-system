<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveType;
use Illuminate\Http\Request;

class LeaveTypeController extends Controller
{
    public function index()
    {
        return response()->json(LeaveType::where('is_active', true)->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'                => 'required|string|max:100',
            'name_ar'             => 'required|string|max:100',
            'max_days_per_year'   => 'integer|min:0',
            'is_paid'             => 'boolean',
            'requires_approval'   => 'boolean',
            'color'               => 'string|max:7',
            'is_active'           => 'boolean',
        ]);

        return response()->json(LeaveType::create($validated), 201);
    }

    public function show(LeaveType $leaveType)
    {
        return response()->json($leaveType);
    }

    public function update(Request $request, LeaveType $leaveType)
    {
        $validated = $request->validate([
            'name'              => 'sometimes|string|max:100',
            'name_ar'           => 'sometimes|string|max:100',
            'max_days_per_year' => 'integer|min:0',
            'is_paid'           => 'boolean',
            'requires_approval' => 'boolean',
            'color'             => 'string|max:7',
            'is_active'         => 'boolean',
        ]);

        $leaveType->update($validated);
        return response()->json($leaveType);
    }

    public function destroy(LeaveType $leaveType)
    {
        $leaveType->delete();
        return response()->json(['message' => 'تم الحذف']);
    }
}
