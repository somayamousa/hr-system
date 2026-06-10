import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import api from "../../lib/axios";

interface Props {
    employeeId: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ContractForm({ employeeId, onClose, onSuccess }: Props) {
    const [form, setForm] = useState({
        type: "permanent",
        start_date: "",
        end_date: "",
        salary: "",
        currency: "ILS",
        working_hours_per_week: 40,
        vacation_days_per_year: 14,
        status: "active",
        signed_date: "",
        terms: "",
    });

    const mutation = useMutation({
        mutationFn: (data: any) => api.post("/contracts", { ...data, employee_id: employeeId }),
        onSuccess,
    });

    const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));
    const cls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" dir="rtl">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-lg font-bold">إضافة عقد جديد</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">نوع العقد</label>
                            <select className={cls} value={form.type} onChange={(e) => set("type", e.target.value)}>
                                <option value="permanent">دائم</option>
                                <option value="fixed_term">محدد المدة</option>
                                <option value="part_time">دوام جزئي</option>
                                <option value="internship">تدريب</option>
                                <option value="freelance">عمل حر</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">الحالة</label>
                            <select className={cls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                                <option value="active">نشط</option>
                                <option value="draft">مسودة</option>
                                <option value="expired">منتهي</option>
                                <option value="terminated">ملغى</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">تاريخ البدء *</label>
                            <input type="date" className={cls} required value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">تاريخ الانتهاء</label>
                            <input type="date" className={cls} value={form.end_date} onChange={(e) => set("end_date", e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">الراتب *</label>
                            <input type="number" className={cls} required min="0" value={form.salary} onChange={(e) => set("salary", e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">العملة</label>
                            <select className={cls} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                                <option value="ILS">شيكل</option>
                                <option value="USD">دولار</option>
                                <option value="JOD">دينار</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">ساعات العمل/أسبوع</label>
                            <input type="number" className={cls} min="1" value={form.working_hours_per_week} onChange={(e) => set("working_hours_per_week", Number(e.target.value))} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">أيام الإجازة/سنة</label>
                            <input type="number" className={cls} min="0" value={form.vacation_days_per_year} onChange={(e) => set("vacation_days_per_year", Number(e.target.value))} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">تاريخ التوقيع</label>
                            <input type="date" className={cls} value={form.signed_date} onChange={(e) => set("signed_date", e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">بنود العقد</label>
                        <textarea className={cls} rows={3} value={form.terms} onChange={(e) => set("terms", e.target.value)} />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">إلغاء</button>
                        <button type="submit" disabled={mutation.isPending} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                            {mutation.isPending ? "جاري الحفظ..." : "إضافة العقد"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
