import { createBrowserRouter, Navigate } from "react-router-dom";
import App from '../App.jsx';
import Login from "../pages/auth/login.jsx";
import AdminPage from "../pages/admin/adminPage.jsx";
import AdminDashboard from "../pages/admin/dashboard/Dashboard.jsx";
import AdminCompanyPage from "../pages/admin/company/CompanyPage.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import AdminSettingPage from "../pages/admin/setting/SettingPage.jsx";
import CompanyPage from "../pages/admin/company/CompanyPage.jsx";

import AppPage from "../pages/app/AppPage.jsx";
import Dashboard from "../pages/app/Dashboard/Dashboard.jsx";
import UnitPage from "../pages/app/Units/UnitPage.jsx";
import UnitDetailPage from "../pages/app/Units/UnitDetailPage.jsx";
import CyclePage from "../pages/app/Cycles/CyclePage.jsx";
import CycleDetailPage from "../pages/app/Cycles/CycleDetailPage.jsx";
import OKRPage from "../pages/app/OKR/OKRPage.jsx";
import ObjectiveDetailPage from "../pages/app/OKR/ObjectiveDetailPage.jsx";
import KPIDictionariesPage from "../pages/app/KPIDictionaries/KPIDictionariesPage.jsx";
import KPIPage from "../pages/app/KPI/KPIPage.jsx";
import KPIDetailPage from "../pages/app/KPI/KPIDetailPage.jsx";
import EmployeePage from "../pages/app/Employees/EmployeePage.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />
    },
    {
        path: "/admin/login",
        element: <Login />
    },
    {
        path: "/admin",
        element: <ProtectedRoute><AdminPage /></ProtectedRoute>,
        children: [
            {
                index: true,
                element: <Navigate to="dashboard" replace />
            },
            {
                path: "dashboard",
                element: <AdminDashboard />
            },
            {
                path: "company",
                element: <CompanyPage />
            },
            {
                path: "admin-accounts",
                element: <AdminPage />
            },
            {
                path: "company/:companyInfo",
                element: <AdminCompanyPage />
            },
            {
                path: "setting",
                element: <AdminSettingPage />
            },
        ]
    },
    {
        path: "/:company_slug/app",
        element: <ProtectedRoute><AppPage /></ProtectedRoute>,
        children: [
            {
                index: true,
                element: <Dashboard />
            },
            {
                path: "dashboard",
                element: <Dashboard />
            },
            {
                path: "units",
                element: <UnitPage />
            },
            {
                path: "units/:unitId",
                element: <UnitDetailPage />
            },
            {
                path: "employees",
                element: <EmployeePage />
            },
            {
                path: "cycles",
                element: <CyclePage />
            },
            {
                path: "cycles/:cycleId",
                element: <CycleDetailPage />
            },
            {
                path: "okr",
                element: <OKRPage />
            },
            {
                path: "okr/:objectiveId",
                element: <ObjectiveDetailPage />
            },
            {
                path: "kpi",
                element: <KPIPage />
            },
            {
                path: "kpi/:kpiId",
                element: <KPIDetailPage />
            },
            {
                path: "kpi-dictionaries",
                element: <KPIDictionariesPage />
            },
        ]
    },
    {
        path: "/:company_slug/login",
        element: <Login />
    },
    {
        path: "/:company_slug/",
    }
]);

export default router;