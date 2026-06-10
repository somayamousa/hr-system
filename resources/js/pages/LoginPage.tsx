import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
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
        <div
            className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 p-4"
            dir="rtl"
        >
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold text-white backdrop-blur">
                        HR
                    </div>
                    <h1 className="text-2xl font-bold text-white">نظام إدارة الموارد البشرية</h1>
                    <p className="mt-1 text-sm text-white/70">سجّل دخولك للمتابعة</p>
                </div>

                {/* Card */}
                <div className="rounded-2xl bg-white p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 ring-1 ring-red-100">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                البريد الإلكتروني
                            </label>
                            <div className="relative">
                                <Mail
                                    size={18}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pr-10"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <Lock
                                    size={18}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pr-10"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                            {loading ? (
                                "جاري الدخول..."
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    تسجيل الدخول
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-xs text-white/50">
                    © {new Date().getFullYear()} نظام إدارة الموارد البشرية
                </p>
            </div>
        </div>
    );
}
