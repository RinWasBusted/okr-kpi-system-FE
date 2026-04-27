import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Loader, Edit, Power, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getCompanyAdmins, updateCompanyAdmin } from '../../../../services/adminCompany';
import EditAdminModal from './EditAdminModal';
import DeleteAdminModal from './DeleteAdminModal';

const AdminList = ({ companyId }) => {
  const queryClient = useQueryClient();
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [deletingAdmin, setDeletingAdmin] = useState(null);

  // Fetch company admins
  const { data: adminsResponse, isLoading } = useQuery({
    queryKey: ['companyAdmins', companyId],
    queryFn: async () => {
      try {
        const response = await getCompanyAdmins(companyId);
        return response;
      } catch (error) {
        toast.error(error.response?.data?.error?.message || 'Failed to load admins');
        throw error;
      }
    },
    enabled: !!companyId,
  });

  // Mutation for updating admin status
  const updateAdminStatusMutation = useMutation({
    mutationFn: async ({ adminId, isActive }) => {
      return updateCompanyAdmin(companyId, adminId, { is_active: isActive });
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Admin status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['companyAdmins', companyId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update admin status');
    },
  });

  const admins = adminsResponse?.data || [];

  const handleToggleAdminStatus = (admin) => {
    const newStatus = !admin.is_active;
    updateAdminStatusMutation.mutate({
      adminId: admin.id,
      isActive: newStatus,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-text">Company Administrators</h2>
        <div className="flex items-center justify-center py-12">
          <Loader size={32} className="text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-text">Company Administrators</h2>

      {admins.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {admins.map((admin) => (
            <AdminCard
              key={admin.id}
              admin={admin}
              onEdit={() => setEditingAdmin(admin)}
              onToggleStatus={() => handleToggleAdminStatus(admin)}
              onDelete={() => setDeletingAdmin(admin)}
              isLoading={
                updateAdminStatusMutation.isPending &&
                updateAdminStatusMutation.variables?.adminId === admin.id
              }
            />
          ))}
        </div>
      ) : (
        <div className="bg-secondary/5 rounded-lg border border-secondary/20 p-6 text-center">
          <p className="text-secondary">No administrators found</p>
        </div>
      )}

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <EditAdminModal
          admin={editingAdmin}
          companyId={companyId}
          onClose={() => setEditingAdmin(null)}
          onSuccess={() => setEditingAdmin(null)}
        />
      )}

      {/* Delete Admin Confirmation Modal */}
      {deletingAdmin && (
        <DeleteAdminModal
          admin={deletingAdmin}
          companyId={companyId}
          onClose={() => setDeletingAdmin(null)}
          onSuccess={() => setDeletingAdmin(null)}
        />
      )}
    </div>
  );
};

const   AdminCard = ({ admin, onEdit, onToggleStatus, onDelete, isLoading }) => {
  return (
    <div className="bg-background rounded-lg border border-secondary/20 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                {admin.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-secondary text-sm">
              <Mail size={16} />
              {admin.email}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors duration-200"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={onToggleStatus}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              admin.is_active
                ? 'text-red-600 hover:bg-red-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
            title={admin.is_active ? 'Deactivate' : 'Activate'}
          >
            {isLoading ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Power size={18} />
            )}
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminList;
