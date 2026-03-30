import AppLayout from "../../layouts/AppLayout.jsx";
import { Outlet } from "react-router-dom";

const AppPage = () => {
    return (
        <AppLayout>
            <Outlet />
        </AppLayout>
    );
};

export default AppPage;