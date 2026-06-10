import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit, Users } from "lucide-react";
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
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">الأقسام</h1>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                    <Plus size={16} /> إضافة قسم
                </button>
            </div>

            {isLoading ? (
                <div className="p-12 text-center text-gray-500">جاري التحميل...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments.map((dept: any) => (
                        <div key={dept.id} className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">{dept.code}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(dept)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={14} /></button>
                                    <button onClick={() => confirm("حذف القسم؟") && deleteMutation.mutate(dept.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            {dept.description && <p className="text-sm text-gray-500 mb-3">{dept.description}</p>}
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Users size={14} />
                                <span>{dept.employees_count ?? 0} موظف</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" dir="rtl">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-lg font-bold mb-4">{editDept ? "تعديل القسم" : "إضافة قسم جديد"}</h2>
                        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">اسم القسم *</label>
                                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">الرمز *</label>
                                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="مثال: IT" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">الوصف</label>
                                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={closeForm} className="px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">إلغاء</button>
                                <button type="submit" disabled={saveMutation.isPending} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
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
