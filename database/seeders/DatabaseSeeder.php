<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\LeaveType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::create(['name' => 'admin']);
        $hrRole = Role::create(['name' => 'hr']);
        Role::create(['name' => 'employee']);

        $admin = User::create([
            'name' => 'مدير النظام',
            'email' => 'admin@hr-system.com',
            'password' => Hash::make('password'),
        ]);
        $admin->assignRole($adminRole);

        $hr = User::create([
            'name' => 'موظف HR',
            'email' => 'hr@hr-system.com',
            'password' => Hash::make('password'),
        ]);
        $hr->assignRole($hrRole);

        $departments = [
            ['name' => 'الموارد البشرية', 'code' => 'HR'],
            ['name' => 'تقنية المعلومات', 'code' => 'IT'],
            ['name' => 'المالية والمحاسبة', 'code' => 'FIN'],
            ['name' => 'المبيعات والتسويق', 'code' => 'SALES'],
            ['name' => 'العمليات', 'code' => 'OPS'],
        ];

        foreach ($departments as $dept) {
            Department::create($dept);
        }

        $leaveTypes = [
            ['name' => 'Annual Leave',    'name_ar' => 'إجازة سنوية',     'max_days_per_year' => 21, 'is_paid' => true,  'requires_approval' => true,  'color' => '#3B82F6'],
            ['name' => 'Sick Leave',      'name_ar' => 'إجازة مرضية',     'max_days_per_year' => 14, 'is_paid' => true,  'requires_approval' => false, 'color' => '#EF4444'],
            ['name' => 'Emergency Leave', 'name_ar' => 'إجازة طارئة',     'max_days_per_year' => 3,  'is_paid' => true,  'requires_approval' => true,  'color' => '#F59E0B'],
            ['name' => 'Unpaid Leave',    'name_ar' => 'إجازة بدون راتب', 'max_days_per_year' => 30, 'is_paid' => false, 'requires_approval' => true,  'color' => '#6B7280'],
            ['name' => 'Maternity Leave', 'name_ar' => 'إجازة أمومة',     'max_days_per_year' => 70, 'is_paid' => true,  'requires_approval' => true,  'color' => '#EC4899'],
        ];

        foreach ($leaveTypes as $lt) {
            LeaveType::create($lt);
        }
    }
}
