import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit, Users, Building2 } from "lucide-react";
import api from "../lib/axios";

export default function DepartmentsPage() {
    const [showForm, setShowForm] = useState(false);
    const [editDept, setEditDept] = useState<any>(null);
    const [form, setForm] = useState({ name: "", code: "", description: "" });
    const queryClient = useQueryClient();

    const { data: departments = [], isLoading } = useQuery({
        queryKey: ["departments"],
        queryFn: () => api.get("/departments").then((r) => r.data),
    });

    const saveMutation = useMutation({
        mutationFn: (data: any) =>
            editDept ? api.put(`/departments/${editDept.id}`, data) : api.post("/departments", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            setShowForm(false);
            setEditDept(null);
            setForm({ name: "", code: "", description: "" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/departments/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
    });

    const openEdit = (dept: any) => {
        setEditDept(dept);
        setForm({ name: dept.name, code: dept.code, description: dept.description ?? "" });
        setShowForm(true);
    };

    const closeForm = () => { setShowForm(false); setEditDept(null); setForm({ name: "", code: "", description: "" }); };

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">الأقسام</h1>
                    <p className="mt-1 text-sm text-slate-500">تنظيم أقسام المؤسسة وعدد الموظفين</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary">
                    <Plus size={18} /> إضافة قسم
                </button>
            </div>

            {isLoading ? (
                <div className="p-12 text-center text-slate-400">جاري التحميل...</div>
            ) : departments.length === 0 ? (
                <div className="card p-12 text-center text-slate-400">لا توجد أقسام</div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {departments.map((dept: any) => (
                        <div key={dept.id} className="card group p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                            <div className="mb-3 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                                        <Building2 size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{dept.name}</h3>
                                        <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{dept.code}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button onClick={() => openEdit(dept)} className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50"><Edit size={15} /></button>
                                    <button onClick={() => confirm("حذف القسم؟") && deleteMutation.mutate(dept.id)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>
                                </div>
                            </div>
                            {dept.description && <p className="mb-3 text-sm text-slate-500">{dept.description}</p>}
                            <div className="flex items-center gap-1.5 border-t border-slate-100 pt-3 text-sm text-slate-500">
                                <Users size={15} />
                                <span>{dept.employees_count ?? 0} موظف</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" dir="rtl" onClick={closeForm}>
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-5 text-lg font-bold text-slate-900">{editDept ? "تعديل القسم" : "إضافة قسم جديد"}</h2>
                        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">اسم القسم *</label>
                                <input className="input" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">الرمز *</label>
                                <input className="input" required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="مثال: IT" />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">الوصف</label>
                                <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={closeForm} className="btn-ghost">إلغاء</button>
                                <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                                    {saveMutation.isPending ? "جاري الحفظ..." : editDept ? "حفظ" : "إضافة"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
