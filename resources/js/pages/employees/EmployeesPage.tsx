import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye, Trash2, Filter } from "lucide-react";
import api from "../../lib/axios";
import { formatDate, statusColors, statusLabels } from "../../lib/utils";
import EmployeeForm from "./EmployeeForm";

export default function EmployeesPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["employees", search, statusFilter, page],
        queryFn: () =>
            api.get("/employees", { params: { search, status: statusFilter, page, per_page: 10 } }).then((r) => r.data),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/employees/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }),
    });

    const employees = data?.data ?? [];
    const meta = data?.meta ?? {};

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">الموظفون</h1>
                    <p className="mt-1 text-sm text-slate-500">إدارة بيانات الموظفين في المؤسسة</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary">
                    <Plus size={18} />
                    إضافة موظف
                </button>
            </div>

            {/* Filters */}
            <div className="card flex flex-wrap gap-3 p-4">
                <div className="relative min-w-48 flex-1">
                    <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم أو البريد أو الرقم..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="input pr-10"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="input w-auto"
                >
                    <option value="">كل الحالات</option>
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    <option value="terminated">منتهي الخدمة</option>
                    <option value="on_leave">في إجازة</option>
                </select>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-400">جاري التحميل...</div>
                ) : employees.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">لا يوجد موظفون</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50/80">
                            <tr>
                                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">الموظف</th>
                                <th className="hidden px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">القسم</th>
                                <th className="hidden px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 lg:table-cell">المسمى الوظيفي</th>
                                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">الحالة</th>
                                <th className="hidden px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 lg:table-cell">تاريخ التوظيف</th>
                                <th className="px-4 py-3.5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employees.map((emp: any) => (
                                <tr key={emp.id} className="transition-colors hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                                                {(emp.first_name || "؟").charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-medium text-slate-900">{emp.first_name} {emp.last_name}</div>
                                                <div className="truncate text-xs text-slate-500">{emp.employee_number} • {emp.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{emp.department?.name ?? "-"}</td>
                                    <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">{emp.job_title}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[emp.status] ?? ""}`}>
                                            {statusLabels[emp.status] ?? emp.status}
                                        </span>
                                    </td>
                                    <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">{formatDate(emp.hire_date)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => navigate(`/employees/${emp.id}`)}
                                                className="rounded-lg p-2 text-brand-600 transition-colors hover:bg-brand-50"
                                                title="عرض"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => confirm("هل أنت متأكد؟") && deleteMutation.mutate(emp.id)}
                                                className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                                                title="حذف"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {meta.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                        <span className="text-sm text-slate-500">
                            {meta.from}-{meta.to} من {meta.total} موظف
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
                            >
                                السابق
                            </button>
                            <button
                                disabled={page >= meta.last_page}
                                onClick={() => setPage(p => p + 1)}
                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Employee Modal */}
            {showForm && <EmployeeForm onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ["employees"] }); }} />}
        </div>
    );
}
