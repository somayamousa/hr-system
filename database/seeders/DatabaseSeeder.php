<?php

namespace Database\Seeders;

use App\Models\Department;
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
    }
}
