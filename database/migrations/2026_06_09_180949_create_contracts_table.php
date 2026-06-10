<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('contract_number')->unique();
            $table->enum('type', ['permanent', 'fixed_term', 'part_time', 'internship', 'freelance'])->default('permanent');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->decimal('salary', 12, 2);
            $table->string('currency', 3)->default('ILS');
            $table->integer('working_hours_per_week')->default(40);
            $table->integer('vacation_days_per_year')->default(14);
            $table->text('terms')->nullable();
            $table->string('file_path')->nullable();
            $table->enum('status', ['draft', 'active', 'expired', 'terminated'])->default('active');
            $table->date('signed_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
