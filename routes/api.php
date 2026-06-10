<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\LeaveRequestController;
use App\Http\Controllers\Api\LeaveTypeController;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

// #8 — rate limit: max 10 login attempts per minute per IP
RateLimiter::for('login', function (Request $request) {
    return \Illuminate\Cache\RateLimiting\Limit::perMinute(10)->by($request->ip());
});

Route::middleware('throttle:login')->post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // #4 — admin/hr only: write operations on employees, departments, contracts, documents
    Route::middleware('role:admin|hr')->group(function () {
        Route::apiResource('employees', EmployeeController::class)->except(['index', 'show']);
        Route::apiResource('departments', DepartmentController::class)->except(['index', 'show']);
        Route::apiResource('contracts', ContractController::class)->except(['index', 'show']);
        Route::apiResource('documents', DocumentController::class)->except(['index', 'show']);
        Route::post('attendance/bulk', [AttendanceController::class, 'bulk']);
        Route::apiResource('attendance', AttendanceController::class)->except(['index', 'show']);
        Route::post('leave-requests/{leaveRequest}/approve', [LeaveRequestController::class, 'approve']);
        Route::post('leave-requests/{leaveRequest}/reject', [LeaveRequestController::class, 'reject']);
        Route::apiResource('leave-types', LeaveTypeController::class)->except(['index', 'show']);
    });

    // read access for all authenticated users
    Route::get('employees', [EmployeeController::class, 'index']);
    Route::get('employees/{employee}', [EmployeeController::class, 'show']);
    Route::get('departments', [DepartmentController::class, 'index']);
    Route::get('departments/{department}', [DepartmentController::class, 'show']);
    Route::get('leave-types', [LeaveTypeController::class, 'index']);
    Route::get('leave-types/{leaveType}', [LeaveTypeController::class, 'show']);

    // #5 — IDOR fix: scoped to authenticated user's employee record for non-admins
    Route::get('contracts', [ContractController::class, 'index']);
    Route::get('contracts/{contract}', [ContractController::class, 'show']);
    Route::get('documents', [DocumentController::class, 'index']);
    Route::get('documents/{document}', [DocumentController::class, 'show']);
    Route::get('documents/{document}/download', [DocumentController::class, 'download']);

    Route::get('attendance/summary', [AttendanceController::class, 'summary']);
    Route::get('attendance', [AttendanceController::class, 'index']);
    Route::get('attendance/{attendance}', [AttendanceController::class, 'show']);

    Route::get('leave-requests/balance', [LeaveRequestController::class, 'balance']);
    Route::apiResource('leave-requests', LeaveRequestController::class)->except(['destroy']);
    Route::middleware('role:admin|hr')->delete('leave-requests/{leaveRequest}', [LeaveRequestController::class, 'destroy']);
});
