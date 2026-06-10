<?php

namespace Database\Seeders;

use App\Models\LeaveType;
use Illuminate\Database\Seeder;

class LeaveTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Annual Leave',    'name_ar' => 'إجازة سنوية',     'max_days_per_year' => 21, 'is_paid' => true,  'requires_approval' => true,  'color' => '#3B82F6'],
            ['name' => 'Sick Leave',      'name_ar' => 'إجازة مرضية',     'max_days_per_year' => 14, 'is_paid' => true,  'requires_approval' => false, 'color' => '#EF4444'],
            ['name' => 'Emergency Leave', 'name_ar' => 'إجازة طارئة',     'max_days_per_year' => 3,  'is_paid' => true,  'requires_approval' => true,  'color' => '#F59E0B'],
            ['name' => 'Unpaid Leave',    'name_ar' => 'إجازة بدون راتب', 'max_days_per_year' => 30, 'is_paid' => false, 'requires_approval' => true,  'color' => '#6B7280'],
            ['name' => 'Maternity Leave', 'name_ar' => 'إجازة أمومة',     'max_days_per_year' => 70, 'is_paid' => true,  'requires_approval' => true,  'color' => '#EC4899'],
        ];

        foreach ($types as $type) {
            LeaveType::firstOrCreate(['name' => $type['name']], $type);
        }
    }
}
