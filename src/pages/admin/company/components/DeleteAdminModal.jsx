import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Trash2, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { deactivateCompanyAdmin } from '../../../../services/adminCompany';

const DeleteAdminModal = ({ admin, companyId, onClose, onSuccess }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      console.log('Calling deactivateCompanyAdmin API for admin:', admin.id);
      return deactivateCompanyAdmin(companyId, admin.id);
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Admin deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['companyAdmins', companyId] });
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to delete admin');
    },
  });

  // Debug log
  console.log('DeleteAdminModal rendered for:', admin.full_name, 'isPending:', deleteMutation.isPending);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary/20">
          <h2 className="text-xl font-bold text-text">Delete Admin</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-text">
            Are you sure you want to delete admin <strong>{admin.full_name}</strong>?
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">
              This action cannot be undone. The admin will lose access to the company.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={deleteMutation.isPending}
              className="flex-1 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deleteMutation.isPending && <Loader size={16} className="animate-spin" />}
              <Trash2 size={16} />
              Delete Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAdminModal;
