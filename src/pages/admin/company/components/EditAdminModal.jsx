import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { updateCompanyAdmin } from '../../../../services/adminCompany';

const EditAdminModal = ({ admin, companyId, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    full_name: admin?.full_name || '',
    email: admin?.email || '',
    avatar_url: admin?.avatar_url || '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data) => {
      // Only send password if it's not empty
      const updateData = { ...data };
      if (!updateData.password) {
        delete updateData.password;
      }
      return updateCompanyAdmin(companyId, admin.id, updateData);
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Admin updated successfully');
      queryClient.invalidateQueries({ queryKey: ['companyAdmins', companyId] });
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update admin');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary/20">
          <h2 className="text-xl font-bold text-text">Edit Admin Information</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-xl font-bold text-primary">
                  {getInitials(formData.full_name)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-text mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
              placeholder="Enter full name"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
              placeholder="Enter email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
                placeholder="Leave empty if you don't want to change"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-text transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-secondary mt-1">Min 8 characters (leave empty if no change)</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/10 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending && <Loader size={16} className="animate-spin" />}
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>

          {/* Error */}
          {updateMutation.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                {updateMutation.error.response?.data?.message || 'Error updating admin'}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditAdminModal;
