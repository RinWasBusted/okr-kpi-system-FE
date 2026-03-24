import { createBrowserRouter } from "react-router-dom";
import App from '../App.jsx';
import Login from "../pages/auth/login.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />
    },
    {
        path: "/:company_slug/login",
        element: <Login />
    }
]);

export default router;