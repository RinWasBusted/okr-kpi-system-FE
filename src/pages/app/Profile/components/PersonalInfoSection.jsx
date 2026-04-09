import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, User, Mail, Building2, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { updateUser } from '../../../../services/user';

/**
 * PersonalInfoSection Component
 * Displays and allows editing of personal information
 */
const PersonalInfoSection = ({ user, onUserUpdate }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
  });
  const [errors, setErrors] = useState({});

  // Các trường chỉ hiển thị (không chỉnh sửa được)
  const displayFields = [
    { key: 'email', label: 'Email', icon: Mail, value: user?.email },
    { key: 'company_name', label: 'Công ty', icon: Building2, value: user?.company_name },
    { key: 'unit_name', label: 'Đơn vị', icon: Users, value: user?.unit_name || 'Chưa phân công' },
    { key: 'created_at', label: 'Ngày tạo tài khoản', icon: null, value: formatDate(user?.created_at) },
  ];

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Cập nhật thông tin thành công');
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      if (onUserUpdate) {
        onUserUpdate(response.data?.user);
      }
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin');
    },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Vui lòng nhập họ và tên';
    } else if (formData.full_name.length > 255) {
      newErrors.full_name = 'Họ và tên không được vượt quá 255 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const data = {
      full_name: formData.full_name.trim(),
    };

    updateMutation.mutate({ id: user.id, data });
  };

  const handleCancel = () => {
    setFormData({ full_name: user?.full_name || '' });
    setErrors({});
    setIsEditing(false);
  };

  const handleChange = (value) => {
    setFormData({ full_name: value });
    if (errors.full_name) {
      setErrors({});
    }
  };

  // Chỉ cho phép chỉnh sửa nếu không đang loading
  const canEdit = !updateMutation.isPending;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Thông tin cá nhân</h3>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={updateMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-orange-500/30"
              >
                {updateMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Lưu thay đổi
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer"
            >
              Chỉnh sửa
            </button>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name - Editable field */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User size={16} />
            Họ và tên
          </label>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleChange(e.target.value)}
                disabled={!canEdit}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 bg-white ${
                  errors.full_name
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-gray-200 focus:ring-orange-500/50'
                }`}
                placeholder="Nhập họ và tên"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>
              )}
            </div>
          ) : (
            <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900">
              {user?.full_name}
            </div>
          )}
        </div>

        {/* Display-only fields */}
        {displayFields.map((field) => (
          <div key={field.key}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              {field.icon && <field.icon size={16} />}
              {field.label}
            </label>
            <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900">
              {field.value || '-'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Format date to Vietnamese locale
 */
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default PersonalInfoSection;
