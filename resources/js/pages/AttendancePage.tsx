import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../lib/axios";
import { formatDate } from "../lib/utils";

const statusColors: Record<string, string> = {
    present: "bg-green-100 text-green-800",
    absent: "bg-red-100 text-red-800",
    late: "bg-yellow-100 text-yellow-800",
    half_day: "bg-orange-100 text-orange-800",
    on_leave: "bg-blue-100 text-blue-800",
    holiday: "bg-purple-100 text-purple-800",
};

const statusLabels: Record<string, string> = {
    present: "حاضر",
    absent: "غائب",
    late: "متأخر",
    half_day: "نصف يوم",
    on_leave: "إجازة",
    holiday: "عطلة",
};

export default function AttendancePage() {
    const today = new Date().toISOString().split("T")[0];
    const [date, setDate] = useState(today);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ employee_id: "", date: today, check_in: "", check_out: "", status: "present", notes: "" });
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["attendance", date, page],
        queryFn: () => api.get("/attendance", { params: { date, page, per_page: 20 } }).then((r) => r.data),
    });

    const { data: employees = [] } = useQuery({
        queryKey: ["employees-all"],
        queryFn: () => api.get("/employees", { params: { per_page: 999 } }).then((r) => r.data.data),
    });

    const saveMutation = useMutation({
        mutationFn: (data: any) => api.post("/attendance", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attendance"] });
            setShowForm(false);
            setForm({ employee_id: "", date: today, check_in: "", check_out: "", status: "present", notes: "" });
        },
    });

    const records = data?.data ?? [];
    const meta = data?.meta ?? {};

    const filtered = search
        ? records.filter((r: any) =>
              `${r.employee?.first_name} ${r.employee?.last_name}`.includes(search)
          )
        : records;

    const prevDay = () => {
        const d = new Date(date);
        d.setDate(d.getDate() - 1);
        setDate(d.toISOString().split("T")[0]);
        setPage(1);
    };

    const nextDay = () => {
        const d = new Date(date);
        d.setDate(d.getDate() + 1);
        setDate(d.toISOString().split("T")[0]);
        setPage(1);
    };

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">الحضور والغياب</h1>
                    <p className="mt-1 text-sm text-slate-500">متابعة حضور الموظفين اليومي</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary">
                    <Plus size={18} /> تسجيل حضور
                </button>
            </div>

            {/* Date nav */}
            <div className="card flex flex-wrap items-center gap-3 p-4">
                <button onClick={prevDay} className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50">
                    <ChevronRight size={18} />
                </button>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => { setDate(e.target.value); setPage(1); }}
                    className="input w-auto"
                />
                <button onClick={nextDay} className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50">
                    <ChevronLeft size={18} />
                </button>
                <div className="relative max-w-xs flex-1">
                    <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pr-10"
                    />
                </div>
            </div>

            {/* Stats */}
            {records.length > 0 && (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {Object.entries(statusLabels).map(([key, label]) => {
                        const count = records.filter((r: any) => r.status === key).length;
                        return (
                            <div key={key} className="card p-4 text-center">
                                <div className="text-2xl font-bold text-slate-900">{count}</div>
                                <div className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[key]}`}>{label}</div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Table */}
            <div className="card overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-400">جاري التحميل...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">لا توجد سجلات لهذا اليوم</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50/80">
                            <tr>
                                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">الموظف</th>
                                <th className="hidden px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">القسم</th>
                                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">الحالة</th>
                                <th className="hidden px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 sm:table-cell">الدخول</th>
                                <th className="hidden px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 sm:table-cell">الخروج</th>
                                <th className="hidden px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 lg:table-cell">وقت العمل</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((r: any) => (
                                <tr key={r.id} className="transition-colors hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900">{r.employee?.first_name} {r.employee?.last_name}</div>
                                        <div className="text-xs text-slate-500">{r.employee?.employee_number}</div>
                                    </td>
                                    <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{r.employee?.department?.name ?? "-"}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[r.status] ?? "bg-slate-100 text-slate-700"}`}>
                                            {statusLabels[r.status] ?? r.status}
                                        </span>
                                    </td>
                                    <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">{r.check_in ?? "-"}</td>
                                    <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">{r.check_out ?? "-"}</td>
                                    <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">
                                        {r.work_minutes ? `${Math.floor(r.work_minutes / 60)}س ${r.work_minutes % 60}د` : "-"}
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

            {/* Add Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" dir="rtl" onClick={() => setShowForm(false)}>
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-5 text-lg font-bold text-slate-900">تسجيل حضور</h2>
                        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">الموظف *</label>
                                <select required className="input"
                                    value={form.employee_id} onChange={(e) => setForm(f => ({ ...f, employee_id: e.target.value }))}>
                                    <option value="">اختر موظف</option>
                                    {employees.map((emp: any) => (
                                        <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">التاريخ *</label>
                                <input type="date" required className="input"
                                    value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">الحالة *</label>
                                <select className="input"
                                    value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}>
                                    {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">وقت الدخول</label>
                                    <input type="time" className="input"
                                        value={form.check_in} onChange={(e) => setForm(f => ({ ...f, check_in: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">وقت الخروج</label>
                                    <input type="time" className="input"
                                        value={form.check_out} onChange={(e) => setForm(f => ({ ...f, check_out: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">ملاحظات</label>
                                <textarea className="input" rows={2}
                                    value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">إلغاء</button>
                                <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                                    {saveMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
