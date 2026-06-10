<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = LeaveRequest::with(['employee.department', 'leaveType', 'approver'])
            ->when($request->employee_id, fn($q) => $q->where('employee_id', $request->employee_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->year, fn($q) => $q->whereYear('start_date', $request->year))
            ->latest();

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id'   => 'required|exists:employees,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date'    => 'required|date',
            'end_date'      => 'required|date|after_or_equal:start_date',
            'reason'        => 'nullable|string',
        ]);

        $start = Carbon::parse($validated['start_date']);
        $end   = Carbon::parse($validated['end_date']);
        $validated['total_days'] = $start->diffInDays($end) + 1;
        $validated['status'] = 'pending';

        $leave = LeaveRequest::create($validated);

        return response()->json($leave->load(['employee', 'leaveType']), 201);
    }

    public function show(LeaveRequest $leaveRequest)
    {
        return response()->json($leaveRequest->load(['employee', 'leaveType', 'approver']));
    }

    public function update(Request $request, LeaveRequest $leaveRequest)
    {
        $request->validate([
            'start_date' => 'sometimes|date',
            'end_date'   => 'sometimes|date|after_or_equal:start_date',
            'reason'     => 'nullable|string',
        ]);

        if ($leaveRequest->status !== 'pending') {
            return response()->json(['message' => 'لا يمكن تعديل طلب غير معلق'], 422);
        }

        $data = $request->only(['start_date', 'end_date', 'reason']);
        if (isset($data['start_date'], $data['end_date'])) {
            $data['total_days'] = Carbon::parse($data['start_date'])->diffInDays(Carbon::parse($data['end_date'])) + 1;
        }

        $leaveRequest->update($data);
        return response()->json($leaveRequest->load(['employee', 'leaveType']));
    }

    public function destroy(LeaveRequest $leaveRequest)
    {
        $leaveRequest->delete();
        return response()->json(['message' => 'تم الحذف']);
    }

    public function approve(Request $request, LeaveRequest $leaveRequest)
    {
        if ($leaveRequest->status !== 'pending') {
            return response()->json(['message' => 'الطلب ليس في حالة انتظار'], 422);
        }

        $leaveRequest->update([
            'status'      => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return response()->json($leaveRequest->load(['employee', 'leaveType', 'approver']));
    }

    public function reject(Request $request, LeaveRequest $leaveRequest)
    {
        $request->validate(['rejection_reason' => 'required|string']);

        if ($leaveRequest->status !== 'pending') {
            return response()->json(['message' => 'الطلب ليس في حالة انتظار'], 422);
        }

        $leaveRequest->update([
            'status'           => 'rejected',
            'approved_by'      => $request->user()->id,
            'approved_at'      => now(),
            'rejection_reason' => $request->rejection_reason,
        ]);

        return response()->json($leaveRequest->load(['employee', 'leaveType']));
    }

    // balance: how many days used vs allowed this year
    public function balance(Request $request)
    {
        $request->validate(['employee_id' => 'required|exists:employees,id']);

        $year = $request->year ?? now()->year;

        $used = LeaveRequest::where('employee_id', $request->employee_id)
            ->where('status', 'approved')
            ->whereYear('start_date', $year)
            ->with('leaveType')
            ->get()
            ->groupBy('leave_type_id')
            ->map(fn($group) => [
                'leave_type'  => $group->first()->leaveType,
                'used_days'   => $group->sum('total_days'),
                'allowed_days'=> $group->first()->leaveType->max_days_per_year,
                'remaining'   => max(0, $group->first()->leaveType->max_days_per_year - $group->sum('total_days')),
            ])
            ->values();

        return response()->json($used);
    }
}
