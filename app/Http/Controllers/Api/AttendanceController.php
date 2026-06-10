<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Attendance::with('employee.department')
            ->when($request->employee_id, fn($q) => $q->where('employee_id', $request->employee_id))
            ->when($request->date, fn($q) => $q->whereDate('date', $request->date))
            ->when($request->month, fn($q) => $q->whereMonth('date', $request->month))
            ->when($request->year, fn($q) => $q->whereYear('date', $request->year))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderBy('date', 'desc');

        return response()->json($query->paginate($request->per_page ?? 30));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date'        => 'required|date',
            'check_in'    => 'nullable|date_format:H:i',
            'check_out'   => 'nullable|date_format:H:i|after:check_in',
            'status'      => 'required|in:present,absent,late,half_day,on_leave,holiday',
            'notes'       => 'nullable|string',
        ]);

        $validated['recorded_by'] = $request->user()->id;
        $validated['work_minutes'] = $this->calcMinutes($validated['check_in'] ?? null, $validated['check_out'] ?? null);

        $attendance = Attendance::updateOrCreate(
            ['employee_id' => $validated['employee_id'], 'date' => $validated['date']],
            $validated
        );

        return response()->json($attendance->load('employee'), 201);
    }

    // bulk: record attendance for all active employees for a given date
    public function bulk(Request $request)
    {
        $request->validate([
            'date'    => 'required|date',
            'records' => 'required|array',
            'records.*.employee_id' => 'required|exists:employees,id',
            'records.*.status'      => 'required|in:present,absent,late,half_day,on_leave,holiday',
            'records.*.check_in'    => 'nullable|date_format:H:i',
            'records.*.check_out'   => 'nullable|date_format:H:i',
            'records.*.notes'       => 'nullable|string',
        ]);

        $saved = [];
        foreach ($request->records as $rec) {
            $rec['date']         = $request->date;
            $rec['recorded_by']  = $request->user()->id;
            $rec['work_minutes'] = $this->calcMinutes($rec['check_in'] ?? null, $rec['check_out'] ?? null);

            $saved[] = Attendance::updateOrCreate(
                ['employee_id' => $rec['employee_id'], 'date' => $rec['date']],
                $rec
            );
        }

        return response()->json(['message' => 'تم التسجيل بنجاح', 'count' => count($saved)]);
    }

    public function show(Attendance $attendance)
    {
        return response()->json($attendance->load('employee'));
    }

    public function update(Request $request, Attendance $attendance)
    {
        $validated = $request->validate([
            'check_in'  => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i|after:check_in',
            'status'    => 'sometimes|in:present,absent,late,half_day,on_leave,holiday',
            'notes'     => 'nullable|string',
        ]);

        $validated['work_minutes'] = $this->calcMinutes(
            $validated['check_in'] ?? $attendance->check_in,
            $validated['check_out'] ?? $attendance->check_out
        );

        $attendance->update($validated);

        return response()->json($attendance->load('employee'));
    }

    public function destroy(Attendance $attendance)
    {
        $attendance->delete();
        return response()->json(['message' => 'تم الحذف بنجاح']);
    }

    // summary stats for a month
    public function summary(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'month'       => 'required|integer|between:1,12',
            'year'        => 'required|integer',
        ]);

        $records = Attendance::where('employee_id', $request->employee_id)
            ->whereMonth('date', $request->month)
            ->whereYear('date', $request->year)
            ->get();

        return response()->json([
            'present'   => $records->where('status', 'present')->count(),
            'absent'    => $records->where('status', 'absent')->count(),
            'late'      => $records->where('status', 'late')->count(),
            'half_day'  => $records->where('status', 'half_day')->count(),
            'on_leave'  => $records->where('status', 'on_leave')->count(),
            'total_work_minutes' => $records->sum('work_minutes'),
            'records'   => $records,
        ]);
    }

    private function calcMinutes(?string $in, ?string $out): ?int
    {
        if (! $in || ! $out) return null;
        $start = Carbon::createFromFormat('H:i', $in);
        $end   = Carbon::createFromFormat('H:i', $out);
        return max(0, $start->diffInMinutes($end));
    }
}
