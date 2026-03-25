import { createBrowserRouter, Navigate } from "react-router-dom";
import App from '../App.jsx';
import Login from "../pages/auth/login.jsx";
import AdminPage from "../pages/admin/adminPage.jsx";
import Dashboard from "../pages/admin/dashboard/Dashboard.jsx";
import CompanyPage from "../pages/admin/company/CompanyPage.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import SettingPage from "../pages/admin/setting/SettingPage.jsx";

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
                element: <Dashboard />
            },
            {
                path: "company",
                element: <AdminPage />
            },
            {
                path: "admin-accounts",
                element: <AdminPage />
            },
            {
                path: "company/:companyInfo",
                element: <CompanyPage />
            },
            {
                path: "setting",
                element: <SettingPage />
            }
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