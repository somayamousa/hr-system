import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Check, X, ChevronDown } from "lucide-react";
import api from "../lib/axios";
import { formatDate } from "../lib/utils";

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
    pending: "قيد الانتظار",
    approved: "موافق عليه",
    rejected: "مرفوض",
};

export default function LeaveRequestsPage() {
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [rejectId, setRejectId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [form, setForm] = useState({ employee_id: "", leave_type_id: "", start_date: "", end_date: "", reason: "" });
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["leave-requests", statusFilter, page],
        queryFn: () => api.get("/leave-requests", { params: { status: statusFilter || undefined, page, per_page: 15 } }).then((r) => r.data),
    });

    const { data: employees = [] } = useQuery({
        queryKey: ["employees-all"],
        queryFn: () => api.get("/employees", { params: { per_page: 999 } }).then((r) => r.data.data),
    });

    const { data: leaveTypes = [] } = useQuery({
        queryKey: ["leave-types"],
        queryFn: () => api.get("/leave-types").then((r) => r.data),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post("/leave-requests", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
            setShowForm(false);
            setForm({ employee_id: "", leave_type_id: "", start_date: "", end_date: "", reason: "" });
        },
    });

    const approveMutation = useMutation({
        mutationFn: (id: number) => api.post(`/leave-requests/${id}/approve`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leave-requests"] }),
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: number; reason: string }) =>
            api.post(`/leave-requests/${id}/reject`, { rejection_reason: reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
            setRejectId(null);
            setRejectReason("");
        },
    });

    const requests = data?.data ?? [];
    const meta = data?.meta ?? {};

    const cls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">طلبات الإجازة</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                    <Plus size={16} /> طلب إجازة
                </button>
            </div>

            {/* Filter */}
            <div className="flex gap-3">
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">كل الحالات</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="approved">موافق عليه</option>
                    <option value="rejected">مرفوض</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-500">جاري التحميل...</div>
                ) : requests.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">لا توجد طلبات</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-right px-4 py-3 text-gray-600 font-medium">الموظف</th>
                                <th className="text-right px-4 py-3 text-gray-600 font-medium hidden md:table-cell">نوع الإجازة</th>
                                <th className="text-right px-4 py-3 text-gray-600 font-medium">من</th>
                                <th className="text-right px-4 py-3 text-gray-600 font-medium">إلى</th>
                                <th className="text-right px-4 py-3 text-gray-600 font-medium hidden sm:table-cell">الأيام</th>
                                <th className="text-right px-4 py-3 text-gray-600 font-medium">الحالة</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.map((req: any) => (
                                <tr key={req.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">{req.employee?.first_name} {req.employee?.last_name}</div>
                                        <div className="text-xs text-gray-500">{req.employee?.department?.name}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{req.leave_type?.name_ar ?? req.leave_type?.name}</td>
                                    <td className="px-4 py-3 text-gray-600">{formatDate(req.start_date)}</td>
                                    <td className="px-4 py-3 text-gray-600">{formatDate(req.end_date)}</td>
                                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{req.total_days} يوم</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[req.status] ?? "bg-gray-100 text-gray-800"}`}>
                                            {statusLabels[req.status] ?? req.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {req.status === "pending" && (
                                            <div className="flex gap-1 justify-end">
                                                <button
                                                    onClick={() => approveMutation.mutate(req.id)}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                                    title="موافقة"
                                                >
                                                    <Check size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setRejectId(req.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                    title="رفض"
                                                >
                                                    <X size={15} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {meta.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <span className="text-sm text-gray-600">{meta.from}-{meta.to} من {meta.total}</span>
                        <div className="flex gap-2">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40 hover:bg-gray-50">السابق</button>
                            <button disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40 hover:bg-gray-50">التالي</button>
                        </div>
                    </div>
                )}
            </div>

            {/* New Request Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" dir="rtl">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-lg font-bold mb-4">طلب إجازة جديد</h2>
                        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">الموظف *</label>
                                <select required className={cls} value={form.employee_id} onChange={(e) => setForm(f => ({ ...f, employee_id: e.target.value }))}>
                                    <option value="">اختر موظف</option>
                                    {employees.map((emp: any) => (
                                        <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">نوع الإجازة *</label>
                                <select required className={cls} value={form.leave_type_id} onChange={(e) => setForm(f => ({ ...f, leave_type_id: e.target.value }))}>
                                    <option value="">اختر النوع</option>
                                    {leaveTypes.map((lt: any) => (
                                        <option key={lt.id} value={lt.id}>{lt.name_ar ?? lt.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">من *</label>
                                    <input type="date" required className={cls} value={form.start_date} onChange={(e) => setForm(f => ({ ...f, start_date: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">إلى *</label>
                                    <input type="date" required className={cls} value={form.end_date} onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">السبب</label>
                                <textarea className={cls} rows={2} value={form.reason} onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))} />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">إلغاء</button>
                                <button type="submit" disabled={createMutation.isPending} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                                    {createMutation.isPending ? "جاري الإرسال..." : "إرسال الطلب"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" dir="rtl">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                        <h2 className="text-lg font-bold mb-4">سبب الرفض</h2>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="أدخل سبب الرفض..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="flex gap-3 justify-end mt-4">
                            <button onClick={() => { setRejectId(null); setRejectReason(""); }} className="px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">إلغاء</button>
                            <button
                                disabled={!rejectReason.trim() || rejectMutation.isPending}
                                onClick={() => rejectMutation.mutate({ id: rejectId, reason: rejectReason })}
                                className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                            >
                                {rejectMutation.isPending ? "جاري الرفض..." : "رفض الطلب"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
