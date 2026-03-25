import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader, Eye, EyeOff } from 'lucide-react';
import { updateCompanyAdmin } from '../../../../services/adminCompany';

const EditAdminModal = ({ admin, companyId, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    full_name: admin?.full_name || '',
    email: admin?.email || '',
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyAdmins', companyId] });
      onSuccess();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary/20">
          <h2 className="text-xl font-bold text-text">Chỉnh sửa thông tin admin</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Tên đầy đủ
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
              placeholder="Nhập tên đầy đủ"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
              placeholder="Nhập email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
                placeholder="Để trống nếu không muốn đổi mật khẩu"
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
            <p className="text-xs text-secondary mt-1">Min 8 ký tự (để trống nếu không muốn đổi)</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/10 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending && <Loader size={16} className="animate-spin" />}
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>

          {/* Error */}
          {updateMutation.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                {updateMutation.error.response?.data?.message || 'Lỗi khi cập nhật'}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditAdminModal;
