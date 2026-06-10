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
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">الموظفون</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    <Plus size={16} />
                    إضافة موظف
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-48">
                    <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم أو البريد أو الرقم..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full border border-gray-300 rounded-lg pr-9 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">كل الحالات</option>
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    <option value="terminated">منتهي الخدمة</option>
                    <option value="on_leave">في إجازة</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-500">جاري التحميل...</div>
                ) : employees.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">لا يوجد موظفون</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-right px-4 py-3 text-gray-600 font-medium">الموظف</th>
                                <th className="text-right px-4 py-3 text-gray-600 font-medium hidden md:table-cell">القسم</th>
                                <th className="text-right px-4 py-3 text-gray-600 font-medium hidden lg:table-cell">المسمى الوظيفي</th>
                                <th className="text-right px-4 py-3 text-gray-600 font-medium">الحالة</th>
                                <th className="text-right px-4 py-3 text-gray-600 font-medium hidden lg:table-cell">تاريخ التوظيف</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {employees.map((emp: any) => (
                                <tr key={emp.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">{emp.first_name} {emp.last_name}</div>
                                        <div className="text-gray-500 text-xs">{emp.employee_number} • {emp.email}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{emp.department?.name ?? "-"}</td>
                                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{emp.job_title}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[emp.status] ?? ""}`}>
                                            {statusLabels[emp.status] ?? emp.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{formatDate(emp.hire_date)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 justify-end">
                                            <button
                                                onClick={() => navigate(`/employees/${emp.id}`)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <Eye size={15} />
                                            </button>
                                            <button
                                                onClick={() => confirm("هل أنت متأكد؟") && deleteMutation.mutate(emp.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={15} />
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
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <span className="text-sm text-gray-600">
                            {meta.from}-{meta.to} من {meta.total} موظف
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1 border rounded text-sm disabled:opacity-40 hover:bg-gray-50"
                            >
                                السابق
                            </button>
                            <button
                                disabled={page >= meta.last_page}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 border rounded text-sm disabled:opacity-40 hover:bg-gray-50"
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
