import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { updateCompanyAdmin } from '../../../../services/adminCompany';

const ChangePasswordModal = ({ admin, companyId, onClose }) => {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState('');

  const updateMutation = useMutation({
    mutationFn: () => updateCompanyAdmin(companyId, admin.id, { password }),
    onSuccess: (response) => {
      toast.success(response.message || 'Password changed successfully');
      queryClient.invalidateQueries({ queryKey: ['companyAdmins', companyId] });
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-sm w-full p-6">
        <h3 className="text-lg font-bold text-text mb-4">Change Password</h3>
        <p className="text-sm text-secondary mb-4">{admin.full_name}</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text mb-4"
          minLength={8}
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending || password.length < 8}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
