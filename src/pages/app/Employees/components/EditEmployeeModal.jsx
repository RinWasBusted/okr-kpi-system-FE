import { useState, useMemo, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Save, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { updateUser } from '../../../../services/user';
import { User_avatar } from '../../../../assets';

/**
 * TreeSelect Component - Hierarchical unit selector
 */
const TreeSelect = ({ units, value, onChange, isLoading, disabled }) => {
  // Build tree options with indentation
  const treeOptions = useMemo(() => {
    const options = [];

    const traverse = (items, level = 0) => {
      items.forEach((item) => {
        options.push({
          id: item.id,
          name: item.name,
          level,
          prefix: level > 0 ? '　'.repeat(level) + '└ ' : '',
        });
        if (item.sub_units?.length) {
          traverse(item.sub_units, level + 1);
        }
      });
    };

    traverse(units);
    return options;
  }, [units]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="w-full h-10 bg-gray-100 rounded-lg" />
      </div>
    );
  }

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
      disabled={disabled}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-gray-900 bg-white disabled:opacity-50"
    >
      <option value="">Chưa phân công</option>
      {treeOptions.map((unit) => (
        <option key={unit.id} value={unit.id}>
          {unit.prefix + unit.name}
        </option>
      ))}
    </select>
  );
};

/**
 * EditEmployeeModal Component
 * Modal for editing an employee
 */
const EditEmployeeModal = ({ user, onClose, units, isLoadingUnits }) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    unit_id: null,
    job_title: '',
    is_active: true,
  });
  const [errors, setErrors] = useState({});

  // Populate form with user data when modal opens
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        password: '',
        confirm_password: '',
        unit_id: user.unit?.id || null,
        job_title: user.job_title || '',
        is_active: user.is_active ?? true,
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Cập nhật nhân viên thành công');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Không thể cập nhật nhân viên');
    },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Vui lòng nhập họ và tên';
    } else if (formData.full_name.length > 255) {
      newErrors.full_name = 'Họ và tên không được vượt quá 255 ký tự';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (formData.job_title && formData.job_title.length > 100) {
      newErrors.job_title = 'Chức vụ không được vượt quá 100 ký tự';
    }

    // Password validation - only if user wants to change password
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
      }
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = 'Mật khẩu xác nhận không khớp';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitData = {
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      is_active: formData.is_active,
    };

    // Only include password if user entered one
    if (formData.password) {
      submitData.password = formData.password;
    }

    // Include unit_id (can be null to unassign)
    if (formData.unit_id !== undefined) {
      submitData.unit_id = formData.unit_id;
    }

    // Include job_title (allow empty string to remove)
    if (formData.job_title !== undefined) {
      submitData.job_title = formData.job_title.trim() || null;
    }

    updateMutation.mutate({ id: user.id, data: submitData });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa nhân viên</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* User Info Display */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <img
              src={user.avatar_url || User_avatar}
              alt={user.full_name}
              className={`w-12 h-12 rounded-full object-cover ${!user.avatar_url ? 'border border-secondary/30' : ''}`}
            />
            <div>
              <p className="font-medium text-gray-900">{user.full_name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              maxLength={255}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 bg-white ${
                errors.full_name
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-gray-200 focus:ring-orange-500/50'
              }`}
              placeholder="Nhập họ và tên"
              disabled={updateMutation.isPending}
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              {formData.full_name.length}/255 ký tự
            </p>
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chức vụ
            </label>
            <input
              type="text"
              value={formData.job_title}
              onChange={(e) => handleChange('job_title', e.target.value)}
              maxLength={100}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 bg-white ${
                errors.job_title
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-gray-200 focus:ring-orange-500/50'
              }`}
              placeholder="Nhập chức vụ (không bắt buộc)"
              disabled={updateMutation.isPending}
            />
            {errors.job_title && (
              <p className="mt-1 text-sm text-red-500">{errors.job_title}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              {formData.job_title.length}/100 ký tự
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 bg-white ${
                errors.email
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-gray-200 focus:ring-orange-500/50'
              }`}
              placeholder="Nhập email"
              disabled={updateMutation.isPending}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password - Optional for edit */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Đổi mật khẩu (tùy chọn)</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 bg-white ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-gray-200 focus:ring-orange-500/50'
                  }`}
                  placeholder="Nhập mật khẩu mới (bỏ trống nếu không đổi)"
                  disabled={updateMutation.isPending}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhập lại mật khẩu mới
                </label>
                <input
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => handleChange('confirm_password', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 bg-white ${
                    errors.confirm_password
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-gray-200 focus:ring-orange-500/50'
                  }`}
                  placeholder="Nhập lại mật khẩu mới"
                  disabled={updateMutation.isPending}
                />
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirm_password}</p>
                )}
              </div>
            </div>
          </div>

          {/* Unit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thuộc đơn vị
            </label>
            <TreeSelect
              units={units}
              value={formData.unit_id}
              onChange={(value) => handleChange('unit_id', value)}
              isLoading={isLoadingUnits}
              disabled={updateMutation.isPending}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Trạng thái hoạt động</p>
              <p className="text-sm text-gray-500">
                {formData.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="sr-only peer"
                disabled={updateMutation.isPending}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {updateMutation.isPending && (
                <Loader size={16} className="animate-spin" />
              )}
              <Save size={16} />
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
