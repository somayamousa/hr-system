import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import api from "../../lib/axios";

interface Props {
    onClose: () => void;
    onSuccess: () => void;
    employee?: any;
}

export default function EmployeeForm({ onClose, onSuccess, employee }: Props) {
    const isEdit = !!employee;
    const [form, setForm] = useState({
        first_name: employee?.first_name ?? "",
        last_name: employee?.last_name ?? "",
        email: employee?.email ?? "",
        phone: employee?.phone ?? "",
        date_of_birth: employee?.date_of_birth ?? "",
        gender: employee?.gender ?? "",
        national_id: employee?.national_id ?? "",
        nationality: employee?.nationality ?? "فلسطيني",
        address: employee?.address ?? "",
        hire_date: employee?.hire_date ?? "",
        employment_type: employee?.employment_type ?? "full_time",
        status: employee?.status ?? "active",
        job_title: employee?.job_title ?? "",
        position: employee?.position ?? "",
        basic_salary: employee?.basic_salary ?? "",
        department_id: employee?.department_id ?? "",
        emergency_contact_name: employee?.emergency_contact_name ?? "",
        emergency_contact_phone: employee?.emergency_contact_phone ?? "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { data: departments } = useQuery({
        queryKey: ["departments-list"],
        queryFn: () => api.get("/departments").then((r) => r.data),
    });

    const mutation = useMutation({
        mutationFn: (data: any) =>
            isEdit ? api.put(`/employees/${employee.id}`, data) : api.post("/employees", data),
        onSuccess,
        onError: (err: any) => setErrors(err.response?.data?.errors ?? {}),
    });

    const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

    const inputClass = (field: string) =>
        `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[field] ? "border-red-400" : "border-gray-300"}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" dir="rtl">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                    <h2 className="text-lg font-bold">{isEdit ? "تعديل موظف" : "إضافة موظف جديد"}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="p-6 space-y-6">
                    {/* Personal Info */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b">المعلومات الشخصية</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">الاسم الأول *</label>
                                <input className={inputClass("first_name")} value={form.first_name} onChange={(e) => set("first_name", e.target.value)} required />
                                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">اسم العائلة *</label>
                                <input className={inputClass("last_name")} value={form.last_name} onChange={(e) => set("last_name", e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">البريد الإلكتروني *</label>
                                <input type="email" className={inputClass("email")} value={form.email} onChange={(e) => set("email", e.target.value)} required />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">رقم الهاتف</label>
                                <input className={inputClass("phone")} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">تاريخ الميلاد</label>
                                <input type="date" className={inputClass("date_of_birth")} value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">الجنس</label>
                                <select className={inputClass("gender")} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                                    <option value="">اختر</option>
                                    <option value="male">ذكر</option>
                                    <option value="female">أنثى</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">رقم الهوية</label>
                                <input className={inputClass("national_id")} value={form.national_id} onChange={(e) => set("national_id", e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">الجنسية</label>
                                <input className={inputClass("nationality")} value={form.nationality} onChange={(e) => set("nationality", e.target.value)} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">العنوان</label>
                                <textarea className={inputClass("address")} rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Work Info */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b">معلومات العمل</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">تاريخ التوظيف *</label>
                                <input type="date" className={inputClass("hire_date")} value={form.hire_date} onChange={(e) => set("hire_date", e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">القسم</label>
                                <select className={inputClass("department_id")} value={form.department_id} onChange={(e) => set("department_id", e.target.value)}>
                                    <option value="">بدون قسم</option>
                                    {departments?.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">المسمى الوظيفي *</label>
                                <input className={inputClass("job_title")} value={form.job_title} onChange={(e) => set("job_title", e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">الدرجة الوظيفية</label>
                                <input className={inputClass("position")} value={form.position} onChange={(e) => set("position", e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">نوع التوظيف</label>
                                <select className={inputClass("employment_type")} value={form.employment_type} onChange={(e) => set("employment_type", e.target.value)}>
                                    <option value="full_time">دوام كامل</option>
                                    <option value="part_time">دوام جزئي</option>
                                    <option value="contract">عقد</option>
                                    <option value="intern">متدرب</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">الحالة</label>
                                <select className={inputClass("status")} value={form.status} onChange={(e) => set("status", e.target.value)}>
                                    <option value="active">نشط</option>
                                    <option value="inactive">غير نشط</option>
                                    <option value="terminated">منتهي الخدمة</option>
                                    <option value="on_leave">في إجازة</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">الراتب الأساسي *</label>
                                <input type="number" className={inputClass("basic_salary")} value={form.basic_salary} onChange={(e) => set("basic_salary", e.target.value)} required min="0" />
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b">جهة الطوارئ</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">اسم جهة الطوارئ</label>
                                <input className={inputClass("emergency_contact_name")} value={form.emergency_contact_name} onChange={(e) => set("emergency_contact_name", e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">هاتف جهة الطوارئ</label>
                                <input className={inputClass("emergency_contact_phone")} value={form.emergency_contact_phone} onChange={(e) => set("emergency_contact_phone", e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                            إلغاء
                        </button>
                        <button type="submit" disabled={mutation.isPending} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                            {mutation.isPending ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة الموظف"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
