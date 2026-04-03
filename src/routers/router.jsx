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
            }
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
                path: "cycles",
                element: <CyclePage />
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