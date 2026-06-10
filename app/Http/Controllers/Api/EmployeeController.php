<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::with(['department', 'activeContract'])
            ->when($request->search, fn($q) => $q->where(function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('employee_number', 'like', "%{$request->search}%");
            }))
            ->when($request->department_id, fn($q) => $q->where('department_id', $request->department_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->employment_type, fn($q) => $q->where('employment_type', $request->employment_type));

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees',
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female',
            'national_id' => 'nullable|string|unique:employees',
            'nationality' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'hire_date' => 'required|date',
            'employment_type' => 'required|in:full_time,part_time,contract,intern',
            'status' => 'required|in:active,inactive,terminated,on_leave',
            'job_title' => 'required|string|max:255',
            'position' => 'nullable|string|max:255',
            'basic_salary' => 'required|numeric|min:0',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $validated['employee_number'] = $this->generateEmployeeNumber();

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('employees/photos', 'public');
        }

        $employee = Employee::create($validated);

        return response()->json($employee->load('department'), 201);
    }

    public function show(Employee $employee)
    {
        return response()->json($employee->load(['department', 'contracts', 'documents']));
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => "sometimes|email|unique:employees,email,{$employee->id}",
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female',
            'national_id' => "nullable|string|unique:employees,national_id,{$employee->id}",
            'nationality' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'hire_date' => 'sometimes|date',
            'employment_type' => 'sometimes|in:full_time,part_time,contract,intern',
            'status' => 'sometimes|in:active,inactive,terminated,on_leave',
            'job_title' => 'sometimes|string|max:255',
            'position' => 'nullable|string|max:255',
            'basic_salary' => 'sometimes|numeric|min:0',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        if ($request->hasFile('photo')) {
            if ($employee->photo) {
                Storage::disk('public')->delete($employee->photo);
            }
            $validated['photo'] = $request->file('photo')->store('employees/photos', 'public');
        }

        $employee->update($validated);

        return response()->json($employee->load('department'));
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();

        return response()->json(['message' => 'تم حذف الموظف بنجاح']);
    }

    private function generateEmployeeNumber(): string
    {
        $last = Employee::withTrashed()->max('id') ?? 0;
        return 'EMP-' . str_pad($last + 1, 5, '0', STR_PAD_LEFT);
    }
}
