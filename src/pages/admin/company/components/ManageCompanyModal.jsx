import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Edit, Power, Plus } from 'lucide-react';
import { getCompanyAdmins } from '../../../../services/adminCompany';
import AddAdminModal from './AddAdminModal';
import EditAdminModalInline from './EditAdminModalInline';
import ChangePasswordModal from './ChangePasswordModal';
import DeleteAdminModal from './DeleteAdminModal';

const ManageCompanyModal = ({ company, onClose, onEdit, onSuspend, onActivate }) => {
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [deletingAdmin, setDeletingAdmin] = useState(null);
  const [passwordAdmin, setPasswordAdmin] = useState(null);

  const { data: adminsResponse, isLoading: isAdminsLoading } = useQuery({
    queryKey: ['companyAdmins', company.id],
    queryFn: () => getCompanyAdmins(company.id),
    enabled: !!company.id,
  });

  const admins = adminsResponse?.data || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary/20 sticky top-0 bg-background">
          <div>
            <h2 className="text-xl font-bold text-text">Manage Company</h2>
            <p className="text-secondary text-sm">{company.name}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-secondary/10 rounded-lg transition-colors">
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-b border-secondary/20">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/5 transition-colors"
            >
              <Edit size={16} />
              Edit Info
            </button>
            <button
              onClick={company.is_active ? onSuspend : onActivate}
              className={`flex items-center gap-2 px-4 py-2 border border-secondary/20 rounded-lg transition-colors ${
                company.is_active
                  ? 'text-text hover:bg-secondary/5'
                  : 'text-green-700 bg-green-50 hover:bg-green-100 border-green-200'
              }`}
            >
              <Power size={16} />
              {company.is_active ? 'Suspend' : 'Activate'}
            </button>
          </div>
        </div>

        {/* Company Administrators */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text">Company Administrators</h3>
            <button
              onClick={() => setIsAddAdminModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} />
              Add Admin
            </button>
          </div>

          {isAdminsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-8 bg-secondary/5 rounded-lg">
              <p className="text-secondary">No administrators found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <AdminItem
                  key={admin.id}
                  admin={admin}
                  onEdit={() => setEditingAdmin(admin)}
                  onChangePassword={() => setPasswordAdmin(admin)}
                  onDelete={() => setDeletingAdmin(admin)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-secondary/20">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>

      {/* Add Admin Modal */}
      {isAddAdminModalOpen && (
        <AddAdminModal
          companyId={company.id}
          onClose={() => setIsAddAdminModalOpen(false)}
          onSuccess={() => setIsAddAdminModalOpen(false)}
        />
      )}

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <EditAdminModalInline
          admin={editingAdmin}
          companyId={company.id}
          onClose={() => setEditingAdmin(null)}
          onSuccess={() => setEditingAdmin(null)}
        />
      )}

      {/* Change Password Modal */}
      {passwordAdmin && (
        <ChangePasswordModal
          admin={passwordAdmin}
          companyId={company.id}
          onClose={() => setPasswordAdmin(null)}
        />
      )}

      {/* Delete Admin Modal */}
      {deletingAdmin && (
        <DeleteAdminModal
          admin={deletingAdmin}
          companyId={company.id}
          onClose={() => setDeletingAdmin(null)}
          onSuccess={() => setDeletingAdmin(null)}
        />
      )}
    </div>
  );
};

// Lấy initials từ full_name
const getInitials = (name) => {
  if (!name) return 'A';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

const AdminItem = ({ admin, onEdit, onChangePassword, onDelete }) => {
  return (
    <div className="bg-secondary/5 rounded-lg p-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
            {admin.avatar_url ? (
              <img
                src={admin.avatar_url}
                alt={admin.full_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <span className="text-lg font-bold text-primary">
                {getInitials(admin.full_name)}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-medium text-text">{admin.full_name}</h4>
            <div className="flex items-center gap-4 mt-1 text-sm text-secondary">
              <span>{admin.email}</span>
            </div>
            <p className="text-xs text-secondary mt-1">
              Created: {new Date(admin.created_at).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onEdit}
            className="px-3 py-1.5 border border-secondary/20 rounded-lg text-sm text-text hover:bg-secondary/5 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onChangePassword}
            className="px-3 py-1.5 border border-secondary/20 rounded-lg text-sm text-text hover:bg-secondary/5 transition-colors flex items-center gap-1"
          >
            Password
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1.5 border border-red-300 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageCompanyModal;
