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

    const cls = "input";

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">طلبات الإجازة</h1>
                    <p className="mt-1 text-sm text-slate-500">مراجعة طلبات الإجازة والموافقة عليها</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary">
                    <Plus size={18} /> طلب إجازة
                </button>
            </div>

            {/* Filter */}
            <div className="card flex gap-3 p-4">
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="input w-auto"
                >
                    <option value="">كل الحالات</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="approved">موافق عليه</option>
                    <option value="rejected">مرفوض</option>
                </select>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-400">جاري التحميل...</div>
                ) : requests.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">لا توجد طلبات</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50/80">
                            <tr>
                                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">الموظف</th>
                                <th className="hidden px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">نوع الإجازة</th>
                                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">من</th>
                                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">إلى</th>
                                <th className="hidden px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 sm:table-cell">الأيام</th>
                                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">الحالة</th>
                                <th className="px-4 py-3.5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {requests.map((req: any) => (
                                <tr key={req.id} className="transition-colors hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900">{req.employee?.first_name} {req.employee?.last_name}</div>
                                        <div className="text-xs text-slate-500">{req.employee?.department?.name}</div>
                                    </td>
                                    <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{req.leave_type?.name_ar ?? req.leave_type?.name}</td>
                                    <td className="px-4 py-3 text-slate-600">{formatDate(req.start_date)}</td>
                                    <td className="px-4 py-3 text-slate-600">{formatDate(req.end_date)}</td>
                                    <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">{req.total_days} يوم</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[req.status] ?? "bg-slate-100 text-slate-700"}`}>
                                            {statusLabels[req.status] ?? req.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {req.status === "pending" && (
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => approveMutation.mutate(req.id)}
                                                    className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50"
                                                    title="موافقة"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setRejectId(req.id)}
                                                    className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                                                    title="رفض"
                                                >
                                                    <X size={16} />
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
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                        <span className="text-sm text-slate-500">{meta.from}-{meta.to} من {meta.total}</span>
                        <div className="flex gap-2">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40">السابق</button>
                            <button disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40">التالي</button>
                        </div>
                    </div>
                )}
            </div>

            {/* New Request Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" dir="rtl" onClick={() => setShowForm(false)}>
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-5 text-lg font-bold text-slate-900">طلب إجازة جديد</h2>
                        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">الموظف *</label>
                                <select required className={cls} value={form.employee_id} onChange={(e) => setForm(f => ({ ...f, employee_id: e.target.value }))}>
                                    <option value="">اختر موظف</option>
                                    {employees.map((emp: any) => (
                                        <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">نوع الإجازة *</label>
                                <select required className={cls} value={form.leave_type_id} onChange={(e) => setForm(f => ({ ...f, leave_type_id: e.target.value }))}>
                                    <option value="">اختر النوع</option>
                                    {leaveTypes.map((lt: any) => (
                                        <option key={lt.id} value={lt.id}>{lt.name_ar ?? lt.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">من *</label>
                                    <input type="date" required className={cls} value={form.start_date} onChange={(e) => setForm(f => ({ ...f, start_date: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">إلى *</label>
                                    <input type="date" required className={cls} value={form.end_date} onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">السبب</label>
                                <textarea className={cls} rows={2} value={form.reason} onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))} />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">إلغاء</button>
                                <button type="submit" disabled={createMutation.isPending} className="btn-primary">
                                    {createMutation.isPending ? "جاري الإرسال..." : "إرسال الطلب"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" dir="rtl" onClick={() => { setRejectId(null); setRejectReason(""); }}>
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-4 text-lg font-bold text-slate-900">سبب الرفض</h2>
                        <textarea
                            className="input"
                            rows={3}
                            placeholder="أدخل سبب الرفض..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="mt-4 flex justify-end gap-3">
                            <button onClick={() => { setRejectId(null); setRejectReason(""); }} className="btn-ghost">إلغاء</button>
                            <button
                                disabled={!rejectReason.trim() || rejectMutation.isPending}
                                onClick={() => rejectMutation.mutate({ id: rejectId, reason: rejectReason })}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 active:scale-[.98] disabled:opacity-50"
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
