import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { createUnit } from '../../../../services/unit';
import { getUsers } from '../../../../services/user';

/**
 * AddUnitModal Component
 * Modal for creating a new unit
 *
 * @param {Object} props
 * @param {Function} props.onClose - Close modal callback
 * @param {Function} props.onSuccess - Success callback after unit created
 * @param {Array} props.units - List of existing units for parent selection
 * @param {boolean} props.isLoadingUnits - Loading state for units data
 */
const AddUnitModal = ({ onClose, onSuccess, units = [], isLoadingUnits = false }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
    manager_id: '',
  });

  // Fetch users for manager selection
  const { data: usersResponse, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users', 'forUnitModal'],
    queryFn: () => getUsers({ per_page: 100 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const users = usersResponse?.data || [];

  // Flatten units for parent selection (include all levels)
  const parentOptions = useMemo(() => {
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

  const createMutation = useMutation({
    mutationFn: (data) => createUnit(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Tạo đơn vị thành công');
      queryClient.invalidateQueries({ queryKey: ['units'] });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể tạo đơn vị');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên đơn vị');
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      ...(formData.parent_id && { parent_id: parseInt(formData.parent_id) }),
      ...(formData.manager_id && { manager_id: parseInt(formData.manager_id) }),
    };

    createMutation.mutate(submitData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary/20">
          <h2 className="text-xl font-bold text-text">Thêm đơn vị</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary/10 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Unit Name */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Tên đơn vị <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text bg-background"
              placeholder="Nhập tên đơn vị"
              required
              disabled={createMutation.isPending}
            />
          </div>

          {/* Parent Unit */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Đơn vị cha
            </label>
            {isLoadingUnits ? (
              // Placeholder when loading units
              <div className="animate-pulse">
                <div className="w-full h-10 bg-secondary/20 rounded-lg" />
              </div>
            ) : (
              <select
                value={formData.parent_id}
                onChange={(e) => handleChange('parent_id', e.target.value)}
                className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text bg-background"
                disabled={createMutation.isPending}
              >
                <option value="">-- Không có (đơn vị cấp cao nhất) --</option>
                {parentOptions.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.prefix + unit.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Manager Selection */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Người quản lý
            </label>
            {isLoadingUsers ? (
              // Placeholder when loading users
              <div className="animate-pulse">
                <div className="w-full h-10 bg-secondary/20 rounded-lg" />
              </div>
            ) : (
              <select
                value={formData.manager_id}
                onChange={(e) => handleChange('manager_id', e.target.value)}
                className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text bg-background"
                disabled={createMutation.isPending}
              >
                <option value="">-- Chưa chỉ định --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-secondary mt-1">
              Chọn người quản lý từ danh sách nhân viên
            </p>
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
              disabled={createMutation.isPending || isLoadingUnits || isLoadingUsers}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {createMutation.isPending && (
                <Loader size={16} className="animate-spin" />
              )}
              <Plus size={16} />
              Thêm đơn vị
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUnitModal;
