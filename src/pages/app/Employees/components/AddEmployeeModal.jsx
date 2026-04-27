import { useState, useMemo, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Loader, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import { createUser } from '../../../../services/user';

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
        <div className="w-full h-10 bg-secondary/10 rounded-lg" />
      </div>
    );
  }

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
      disabled={disabled}
      className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text bg-background disabled:opacity-50"
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
 * ImageDropzone Component - Avatar upload with react-dropzone
 */
const ImageDropzone = ({ onImageSelect, selectedImage }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onImageSelect(acceptedFiles[0]);
      }
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const previewUrl = selectedImage ? URL.createObjectURL(selectedImage) : null;

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-secondary/30 hover:border-secondary/50'}
      `}
    >
      <input {...getInputProps()} />
      {previewUrl ? (
        <div className="flex flex-col items-center gap-2">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-20 h-20 rounded-full object-cover"
          />
          <p className="text-sm text-secondary">{selectedImage.name}</p>
          <p className="text-xs text-secondary/50">Kéo thả hoặc bấm để thay đổi</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
            <Upload size={24} className="text-secondary/50" />
          </div>
          <p className="text-sm text-secondary">
            {isDragActive ? 'Thả ảnh vào đây' : 'Kéo thả ảnh vào đây hoặc bấm để chọn'}
          </p>
          <p className="text-xs text-secondary/50">Hỗ trợ: JPEG, PNG, GIF (tối đa 5MB)</p>
        </div>
      )}
    </div>
  );
};

/**
 * AddEmployeeModal Component
 * Modal for creating a new employee
 */
const AddEmployeeModal = ({ onClose, units, isLoadingUnits }) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    unit_id: null,
    job_title: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [errors, setErrors] = useState({});

  const createMutation = useMutation({
    mutationFn: (data) => createUser(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Tạo nhân viên thành công');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Không thể tạo nhân viên');
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

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Mật khẩu xác nhận không khớp';
    }

    if (formData.job_title && formData.job_title.length > 255) {
      newErrors.job_title = 'Chức vụ không được vượt quá 255 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitData = new FormData();
    submitData.append('full_name', formData.full_name.trim());
    submitData.append('email', formData.email.trim());
    submitData.append('password', formData.password);
    if (formData.unit_id) {
      submitData.append('unit_id', formData.unit_id);
    }
    if (formData.job_title.trim()) {
      submitData.append('job_title', formData.job_title.trim());
    }
    if (avatar) {
      submitData.append('avatar', avatar);
    }

    createMutation.mutate(submitData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary/20">
          <h2 className="text-xl font-bold text-text">Thêm nhân viên</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary/10 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Avatar</label>
            <ImageDropzone onImageSelect={setAvatar} selectedImage={avatar} />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              maxLength={255}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-text bg-background ${
                errors.full_name
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-secondary/20 focus:ring-primary/50'
              }`}
              placeholder="Nhập họ và tên"
              disabled={createMutation.isPending}
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>
            )}
            <p className="mt-1 text-xs text-secondary/50">
              {formData.full_name.length}/255 ký tự
            </p>
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Chức vụ
            </label>
            <input
              type="text"
              value={formData.job_title}
              onChange={(e) => handleChange('job_title', e.target.value)}
              maxLength={255}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-text bg-background ${
                errors.job_title
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-secondary/20 focus:ring-primary/50'
              }`}
              placeholder="Nhập chức vụ (không bắt buộc)"
              disabled={createMutation.isPending}
            />
            {errors.job_title && (
              <p className="mt-1 text-sm text-red-500">{errors.job_title}</p>
            )}
            <p className="mt-1 text-xs text-secondary/50">
              {formData.job_title.length}/255 ký tự
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-text bg-background ${
                errors.email
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-secondary/20 focus:ring-primary/50'
              }`}
              placeholder="Nhập email"
              disabled={createMutation.isPending}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-text bg-background ${
                errors.password
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-secondary/20 focus:ring-primary/50'
              }`}
              placeholder="Nhập mật khẩu"
              disabled={createMutation.isPending}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Nhập lại mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.confirm_password}
              onChange={(e) => handleChange('confirm_password', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-text bg-background ${
                errors.confirm_password
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-secondary/20 focus:ring-primary/50'
              }`}
              placeholder="Nhập lại mật khẩu"
              disabled={createMutation.isPending}
            />
            {errors.confirm_password && (
              <p className="mt-1 text-sm text-red-500">{errors.confirm_password}</p>
            )}
          </div>

          {/* Unit Selection */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Thuộc đơn vị
            </label>
            <TreeSelect
              units={units}
              value={formData.unit_id}
              onChange={(value) => handleChange('unit_id', value)}
              isLoading={isLoadingUnits}
              disabled={createMutation.isPending}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {createMutation.isPending && (
                <Loader size={16} className="animate-spin" />
              )}
              <Plus size={16} />
              Thêm nhân viên
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
