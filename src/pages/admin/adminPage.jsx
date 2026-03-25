import AdminLayout from "../../layouts/AdminLayout";
import { Outlet } from "react-router-dom";

const AdminPage = () => {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminPage;
