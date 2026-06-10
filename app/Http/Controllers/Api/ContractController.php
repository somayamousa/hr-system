<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Employee;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    public function index(Request $request)
    {
        $query = Contract::with('employee')
            ->when($request->employee_id, fn($q) => $q->where('employee_id', $request->employee_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status));

        return response()->json($query->latest()->paginate($request->per_page ?? 15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'type' => 'required|in:permanent,fixed_term,part_time,internship,freelance',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'salary' => 'required|numeric|min:0',
            'currency' => 'string|max:3',
            'working_hours_per_week' => 'integer|min:1|max:168',
            'vacation_days_per_year' => 'integer|min:0',
            'terms' => 'nullable|string',
            'status' => 'in:draft,active,expired,terminated',
            'signed_date' => 'nullable|date',
        ]);

        $validated['contract_number'] = $this->generateContractNumber();

        $contract = Contract::create($validated);

        return response()->json($contract->load('employee'), 201);
    }

    public function show(Contract $contract)
    {
        return response()->json($contract->load('employee'));
    }

    public function update(Request $request, Contract $contract)
    {
        $validated = $request->validate([
            'type' => 'sometimes|in:permanent,fixed_term,part_time,internship,freelance',
            'start_date' => 'sometimes|date',
            'end_date' => 'nullable|date',
            'salary' => 'sometimes|numeric|min:0',
            'currency' => 'string|max:3',
            'working_hours_per_week' => 'integer|min:1|max:168',
            'vacation_days_per_year' => 'integer|min:0',
            'terms' => 'nullable|string',
            'status' => 'sometimes|in:draft,active,expired,terminated',
            'signed_date' => 'nullable|date',
        ]);

        $contract->update($validated);

        return response()->json($contract->load('employee'));
    }

    public function destroy(Contract $contract)
    {
        $contract->delete();

        return response()->json(['message' => 'تم حذف العقد بنجاح']);
    }

    private function generateContractNumber(): string
    {
        $last = Contract::withTrashed()->max('id') ?? 0;
        return 'CON-' . date('Y') . '-' . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
    }
}
