import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Edit, FileText, Upload, Download, Trash2, Plus } from "lucide-react";
import api from "../../lib/axios";
import { formatDate, formatCurrency, statusColors, statusLabels } from "../../lib/utils";
import EmployeeForm from "./EmployeeForm";
import ContractForm from "./ContractForm";

export default function EmployeeDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showEditForm, setShowEditForm] = useState(false);
    const [showContractForm, setShowContractForm] = useState(false);
    const [activeTab, setActiveTab] = useState<"info" | "contracts" | "documents">("info");

    const { data: employee, isLoading } = useQuery({
        queryKey: ["employee", id],
        queryFn: () => api.get(`/employees/${id}`).then((r) => r.data),
    });

    const deleteDocMutation = useMutation({
        mutationFn: (docId: number) => api.delete(`/documents/${docId}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employee", id] }),
    });

    const uploadDocMutation = useMutation({
        mutationFn: (formData: FormData) => api.post("/documents", formData, { headers: { "Content-Type": "multipart/form-data" } }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employee", id] }),
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const title = prompt("عنوان الوثيقة:");
        if (!title) return;
        const fd = new FormData();
        fd.append("employee_id", id!);
        fd.append("title", title);
        fd.append("type", "other");
        fd.append("file", file);
        uploadDocMutation.mutate(fd);
    };

    if (isLoading) return <div className="p-12 text-center text-gray-500">جاري التحميل...</div>;
    if (!employee) return <div className="p-12 text-center text-gray-500">الموظف غير موجود</div>;

    const tabs = [
        { key: "info", label: "المعلومات" },
        { key: "contracts", label: `العقود (${employee.contracts?.length ?? 0})` },
        { key: "documents", label: `الوثائق (${employee.documents?.length ?? 0})` },
    ];

    return (
        <div className="space-y-6 max-w-4xl mx-auto" dir="rtl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate("/employees")} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowRight size={18} />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{employee.first_name} {employee.last_name}</h1>
                    <p className="text-gray-500 text-sm">{employee.employee_number} • {employee.job_title}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[employee.status] ?? ""}`}>
                    {statusLabels[employee.status]}
                </span>
                <button
                    onClick={() => setShowEditForm(true)}
                    className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                    <Edit size={15} /> تعديل
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b">
                <div className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab.key
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Info Tab */}
            {activeTab === "info" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard title="المعلومات الشخصية">
                        <InfoRow label="الاسم الكامل" value={`${employee.first_name} ${employee.last_name}`} />
                        <InfoRow label="البريد الإلكتروني" value={employee.email} />
                        <InfoRow label="الهاتف" value={employee.phone} />
                        <InfoRow label="الجنس" value={statusLabels[employee.gender]} />
                        <InfoRow label="رقم الهوية" value={employee.national_id} />
                        <InfoRow label="الجنسية" value={employee.nationality} />
                        <InfoRow label="تاريخ الميلاد" value={formatDate(employee.date_of_birth)} />
                        <InfoRow label="العنوان" value={employee.address} />
                    </InfoCard>
                    <InfoCard title="معلومات العمل">
                        <InfoRow label="رقم الموظف" value={employee.employee_number} />
                        <InfoRow label="القسم" value={employee.department?.name} />
                        <InfoRow label="المسمى الوظيفي" value={employee.job_title} />
                        <InfoRow label="الدرجة" value={employee.position} />
                        <InfoRow label="نوع التوظيف" value={statusLabels[employee.employment_type]} />
                        <InfoRow label="تاريخ التوظيف" value={formatDate(employee.hire_date)} />
                        <InfoRow label="الراتب الأساسي" value={formatCurrency(employee.basic_salary)} />
                    </InfoCard>
                    <InfoCard title="جهة الطوارئ">
                        <InfoRow label="الاسم" value={employee.emergency_contact_name} />
                        <InfoRow label="الهاتف" value={employee.emergency_contact_phone} />
                    </InfoCard>
                </div>
            )}

            {/* Contracts Tab */}
            {activeTab === "contracts" && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowContractForm(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                        >
                            <Plus size={15} /> إضافة عقد
                        </button>
                    </div>
                    {employee.contracts?.length === 0 ? (
                        <div className="bg-white rounded-xl border p-12 text-center text-gray-500">لا يوجد عقود</div>
                    ) : (
                        employee.contracts?.map((c: any) => (
                            <div key={c.id} className="bg-white rounded-xl border p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <span className="font-medium text-gray-900">{c.contract_number}</span>
                                        <span className="text-gray-500 text-sm mr-3">{statusLabels[c.type]}</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[c.status] ?? "bg-gray-100 text-gray-800"}`}>
                                        {statusLabels[c.status] ?? c.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div><span className="text-gray-500">الراتب: </span><span className="font-medium">{formatCurrency(c.salary, c.currency)}</span></div>
                                    <div><span className="text-gray-500">من: </span><span>{formatDate(c.start_date)}</span></div>
                                    <div><span className="text-gray-500">إلى: </span><span>{formatDate(c.end_date) || "غير محدد"}</span></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <label className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 cursor-pointer">
                            <Upload size={15} /> رفع وثيقة
                            <input type="file" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>
                    {employee.documents?.length === 0 ? (
                        <div className="bg-white rounded-xl border p-12 text-center text-gray-500">لا يوجد وثائق</div>
                    ) : (
                        <div className="grid gap-3">
                            {employee.documents?.map((doc: any) => (
                                <div key={doc.id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
                                    <FileText size={20} className="text-blue-500 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{doc.title}</p>
                                        <p className="text-xs text-gray-500">{doc.file_name} • {statusLabels[doc.type] ?? doc.type}</p>
                                    </div>
                                    {doc.expiry_date && (
                                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                            ينتهي: {formatDate(doc.expiry_date)}
                                        </span>
                                    )}
                                    <a href={`/hr-system/public/api/documents/${doc.id}/download`} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded">
                                        <Download size={15} />
                                    </a>
                                    <button onClick={() => confirm("حذف الوثيقة؟") && deleteDocMutation.mutate(doc.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showEditForm && (
                <EmployeeForm
                    employee={employee}
                    onClose={() => setShowEditForm(false)}
                    onSuccess={() => { setShowEditForm(false); queryClient.invalidateQueries({ queryKey: ["employee", id] }); }}
                />
            )}
            {showContractForm && (
                <ContractForm
                    employeeId={Number(id)}
                    onClose={() => setShowContractForm(false)}
                    onSuccess={() => { setShowContractForm(false); queryClient.invalidateQueries({ queryKey: ["employee", id] }); }}
                />
            )}
        </div>
    );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b">{title}</h3>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-900 text-left">{value || "-"}</span>
        </div>
    );
}
