import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";

export default function LoginPage() {
    const [email, setEmail] = useState("admin@hr-system.com");
    const [password, setPassword] = useState("password");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await api.post("/login", { email, password });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            navigate("/employees");
        } catch {
            setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-600">نظام HR</h1>
                    <p className="text-gray-500 mt-2">نظام إدارة الموارد البشرية</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "جاري الدخول..." : "تسجيل الدخول"}
                    </button>
                </form>
            </div>
        </div>
    );
}
