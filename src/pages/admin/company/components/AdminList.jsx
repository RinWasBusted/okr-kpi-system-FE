import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Loader, Edit, Power } from 'lucide-react';
import { useState } from 'react';
import { getCompanyAdmins, updateCompanyAdmin } from '../../../../services/adminCompany';
import ConfirmModal from './ConfirmModal';
import EditAdminModal from './EditAdminModal';

const AdminList = ({ companyId }) => {
  const queryClient = useQueryClient();
  const [confirmAdminId, setConfirmAdminId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [editingAdminId, setEditingAdminId] = useState(null);

  // Fetch company admins
  const { data: adminsResponse, isLoading } = useQuery({
    queryKey: ['companyAdmins', companyId],
    queryFn: () => getCompanyAdmins(companyId),
    enabled: !!companyId,
  });

  // Mutation for updating admin status
  const updateAdminStatusMutation = useMutation({
    mutationFn: async (adminId) => {
      const admin = admins.find((a) => a.id === adminId);
      return updateCompanyAdmin(companyId, adminId, { is_active: !admin?.is_active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyAdmins', companyId] });
      setConfirmAdminId(null);
      setConfirmAction(null);
    },
  });

  const admins = adminsResponse?.data || [];

  const handleToggleAdminStatus = (adminId) => {
    const admin = admins.find((a) => a.id === adminId);
    setConfirmAdminId(adminId);
    setConfirmAction(admin?.is_active ? 'deactivate' : 'activate');
  };

  const handleConfirmAdminStatusChange = () => {
    updateAdminStatusMutation.mutate(confirmAdminId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-text">Danh sách Admin</h2>

      {admins.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {admins.map((admin) => (
            <AdminCard
              key={admin.id}
              admin={admin}
              onEdit={() => setEditingAdminId(admin.id)}
              onToggleStatus={() => handleToggleAdminStatus(admin.id)}
              isLoading={updateAdminStatusMutation.isPending && confirmAdminId === admin.id}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg border border-secondary/20 p-6 text-center">
          <p className="text-secondary">Không có admin nào</p>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmAdminId && (
        <ConfirmModal
          title={
            confirmAction === 'activate'
              ? 'Kích hoạt admin?'
              : 'Vô hiệu hóa admin?'
          }
          message={
            confirmAction === 'activate'
              ? 'Admin sẽ có thể đăng nhập lại và quản lý công ty.'
              : 'Admin sẽ mất quyền truy cập vào công ty này.'
          }
          isLoading={updateAdminStatusMutation.isPending}
          onConfirm={handleConfirmAdminStatusChange}
          onCancel={() => {
            setConfirmAdminId(null);
            setConfirmAction(null);
          }}
        />
      )}

      {/* Edit Admin Modal */}
      {editingAdminId && (
        <EditAdminModal
          admin={admins.find((a) => a.id === editingAdminId)}
          companyId={companyId}
          onClose={() => setEditingAdminId(null)}
          onSuccess={() => setEditingAdminId(null)}
        />
      )}
    </div>
  );
};

const AdminCard = ({ admin, onEdit, onToggleStatus, isLoading }) => {
  return (
    <div className="bg-background rounded-lg border border-secondary/20 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Avatar */}
          <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-primary">
              {admin.full_name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase() || 'A'}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-semibold text-text">{admin.full_name}</h3>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  admin.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {admin.is_active ? 'Hoạt động' : 'Vô hiệu hóa'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-secondary text-sm">
              <Mail size={16} />
              {admin.email}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onEdit()}
            className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors duration-200"
            title="Chỉnh sửa"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onToggleStatus()}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              admin.is_active
                ? 'text-red-600 hover:bg-red-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
            title={admin.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
          >
            {isLoading ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Power size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminList;
