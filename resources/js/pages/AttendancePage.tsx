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
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">الحضور والغياب</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                    <Plus size={16} /> تسجيل حضور
                </button>
            </div>

            {/* Date nav */}
            <div className="flex items-center gap-3">
                <button onClick={prevDay} className="p-2 hover:bg-gray-100 rounded-lg border">
                    <ChevronRight size={18} />
                </button>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => { setDate(e.target.value); setPage(1); }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={nextDay} className="p-2 hover:bg-gray-100 rounded-lg border">
                    <ChevronLeft size={18} />
                </button>
                <div className="relative flex-1 max-w-xs">
                    <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg pr-9 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Stats */}
            {records.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {Object.entries(statusLabels).map(([key, label]) => {
                        const count = records.filter((r: any) => r.status === key).length;
                        return (
                            <div key={key} className="bg-white rounded-xl border p-3 text-center">
                                <div className="text-2xl font-bold text-gray-900">{count}</div>
                                <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${statusColors[key]}`}>{label}</div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-500">جاري التحميل...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">لا توجد سجلات لهذا اليوم</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-right px-4 py-3 text-gray-600 font-medium">الموظف</th>
                                <th className="text-right px-4 py-3 text-gray-600 font-medium hidden md:table-cell">القسم</th>
                                <th className="text-right px-4 py-3 text-gray-600 font-medium">الحالة</th>
                                <th className="text-right px-4 py-3 text-gray-600 font-medium hidden sm:table-cell">الدخول</th>
                                <th className="text-right px-4 py-3 text-gray-600 font-medium hidden sm:table-cell">الخروج</th>
                                <th className="text-right px-4 py-3 text-gray-600 font-medium hidden lg:table-cell">وقت العمل</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((r: any) => (
                                <tr key={r.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">{r.employee?.first_name} {r.employee?.last_name}</div>
                                        <div className="text-xs text-gray-500">{r.employee?.employee_number}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{r.employee?.department?.name ?? "-"}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[r.status] ?? "bg-gray-100 text-gray-800"}`}>
                                            {statusLabels[r.status] ?? r.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{r.check_in ?? "-"}</td>
                                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{r.check_out ?? "-"}</td>
                                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                                        {r.work_minutes ? `${Math.floor(r.work_minutes / 60)}س ${r.work_minutes % 60}د` : "-"}
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

            {/* Add Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" dir="rtl">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-lg font-bold mb-4">تسجيل حضور</h2>
                        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">الموظف *</label>
                                <select required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={form.employee_id} onChange={(e) => setForm(f => ({ ...f, employee_id: e.target.value }))}>
                                    <option value="">اختر موظف</option>
                                    {employees.map((emp: any) => (
                                        <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">التاريخ *</label>
                                <input type="date" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">الحالة *</label>
                                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}>
                                    {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">وقت الدخول</label>
                                    <input type="time" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={form.check_in} onChange={(e) => setForm(f => ({ ...f, check_in: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">وقت الخروج</label>
                                    <input type="time" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={form.check_out} onChange={(e) => setForm(f => ({ ...f, check_out: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">ملاحظات</label>
                                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2}
                                    value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">إلغاء</button>
                                <button type="submit" disabled={saveMutation.isPending} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
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
