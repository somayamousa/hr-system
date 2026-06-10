import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Users, Building2, LogOut, Menu, X, Clock, CalendarDays } from "lucide-react";
import api from "../lib/axios";

const navItems = [
    { to: "/employees", label: "الموظفون", icon: Users },
    { to: "/departments", label: "الأقسام", icon: Building2 },
    { to: "/attendance", label: "الحضور والغياب", icon: Clock },
    { to: "/leave-requests", label: "طلبات الإجازة", icon: CalendarDays },
];

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const logout = async () => {
        await api.post("/logout").catch(() => {});
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const currentTitle =
        navItems.find((i) => location.pathname.startsWith(i.to))?.label ?? "لوحة التحكم";

    const initials = (user.name || "؟").trim().charAt(0);

    return (
        <div className="flex h-screen bg-slate-50" dir="rtl">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 right-0 z-50 w-72 bg-gradient-to-b from-brand-800 to-brand-900 text-white shadow-xl transform transition-transform duration-300 ${
                    sidebarOpen ? "translate-x-0" : "translate-x-full"
                } lg:relative lg:translate-x-0`}
            >
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-bold backdrop-blur">
                                HR
                            </div>
                            <div>
                                <h1 className="text-lg font-bold leading-tight">نظام HR</h1>
                                <p className="text-xs text-white/60">إدارة الموارد البشرية</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-1.5 rounded-lg hover:bg-white/10 lg:hidden"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
                        {navItems.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                                        isActive
                                            ? "bg-white text-brand-700 shadow-sm"
                                            : "text-white/75 hover:bg-white/10 hover:text-white"
                                    }`
                                }
                            >
                                <Icon size={19} />
                                {label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User + logout */}
                    <div className="p-4 border-t border-white/10">
                        <div className="mb-3 flex items-center gap-3 px-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{user.name || "مستخدم"}</p>
                                <p className="truncate text-xs text-white/55">{user.email || ""}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-red-500/90 hover:text-white"
                        >
                            <LogOut size={18} />
                            تسجيل الخروج
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main */}
            <div className="flex flex-1 flex-col min-w-0">
                <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                        >
                            <Menu size={20} />
                        </button>
                        <h2 className="text-lg font-bold text-slate-900">{currentTitle}</h2>
                    </div>
                    <div className="hidden items-center gap-3 sm:flex">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                            {initials}
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
