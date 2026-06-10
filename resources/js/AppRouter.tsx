import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Layout from "./components/Layout";
import EmployeesPage from "./pages/employees/EmployeesPage";
import EmployeeDetailPage from "./pages/employees/EmployeeDetailPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import AttendancePage from "./pages/AttendancePage";
import LeaveRequestsPage from "./pages/LeaveRequestsPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem("token");
    return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Layout />
                    </PrivateRoute>
                }
            >
                <Route index element={<Navigate to="/employees" replace />} />
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="employees/:id" element={<EmployeeDetailPage />} />
                <Route path="departments" element={<DepartmentsPage />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="leave-requests" element={<LeaveRequestsPage />} />
            </Route>
        </Routes>
    );
}
