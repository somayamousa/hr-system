import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Users, Building2, LogOut, Menu, X } from "lucide-react";
import api from "../lib/axios";

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const logout = async () => {
        await api.post("/logout").catch(() => {});
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const navItems = [
        { to: "/employees", label: "الموظفون", icon: Users },
        { to: "/departments", label: "الأقسام", icon: Building2 },
    ];

    return (
        <div className="flex h-screen bg-gray-50" dir="rtl">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "translate-x-full"} lg:relative lg:translate-x-0`}>
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b">
                        <h1 className="text-xl font-bold text-blue-600">نظام HR</h1>
                        <p className="text-sm text-gray-500 mt-1">{user.name}</p>
                    </div>
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                        isActive
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-gray-600 hover:bg-gray-100"
                                    }`
                                }
                            >
                                <Icon size={18} />
                                {label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="p-4 border-t">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut size={18} />
                            تسجيل الخروج
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b px-4 py-3 flex items-center justify-between lg:hidden">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
                        <Menu size={20} />
                    </button>
                    <h1 className="font-bold text-blue-600">نظام HR</h1>
                </header>
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
