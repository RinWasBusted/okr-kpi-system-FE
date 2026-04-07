import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { createKPIDictionary } from '../../../../services/kpi-dictionaries';

/**
 * AddKPIDictionaryModal Component
 * Modal for creating a new KPI Dictionary
 *
 * @param {Object} props
 * @param {Function} props.onClose - Close modal callback
 * @param {Function} props.onSuccess - Success callback after creation
 * @param {Array} props.units - Units tree data for dropdown
 * @param {boolean} props.isLoadingUnits - Loading state for units
 */
const AddKPIDictionaryModal = ({ onClose, onSuccess, units = [], isLoadingUnits = false }) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: '',
    evaluation_method: 'MAXIMIZE',
    unit_id: '',
  });

  const [errors, setErrors] = useState({});

  // Flatten units for parent selection with hierarchy
  const unitOptions = useMemo(() => {
    const options = [];

    const traverse = (items, level = 0) => {
      items.forEach((item) => {
        options.push({
          id: item.id,
          name: item.name,
          level,
          prefix: level > 0 ? '\u3000'.repeat(level) + '\u2514 ' : '',
        });
        if (item.sub_units?.length) {
          traverse(item.sub_units, level + 1);
        }
      });
    };

    traverse(units);
    return options;
  }, [units]);

  // Evaluation method options
  const evaluationMethods = [
    { value: 'MAXIMIZE', label: 'Tối đa hóa (MAXIMIZE)', description: 'Giá trị cao hơn là tốt hơn' },
    { value: 'MINIMIZE', label: 'Tối thiểu hóa (MINIMIZE)', description: 'Giá trị thấp hơn là tốt hơn' },
    { value: 'TARGET', label: 'Mục tiêu (TARGET)', description: 'Giá trị nên ổn định trong khoảng' },
  ];

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên mẫu KPI';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Tên mẫu KPI không được vượt quá 255 ký tự';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Mô tả không được vượt quá 1000 ký tự';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Vui lòng nhập đơn vị tính';
    } else if (formData.unit.length > 25) {
      newErrors.unit = 'Đơn vị tính không được vượt quá 25 ký tự';
    }

    if (!formData.evaluation_method) {
      newErrors.evaluation_method = 'Vui lòng chọn phương thức tính';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: (data) => createKPIDictionary(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Tạo mẫu KPI thành công');
      queryClient.invalidateQueries({ queryKey: ['kpi-dictionaries'] });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể tạo mẫu KPI');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      unit: formData.unit.trim(),
      evaluation_method: formData.evaluation_method,
      ...(formData.description.trim() && { description: formData.description.trim() }),
      ...(formData.unit_id && { unit_id: parseInt(formData.unit_id) }),
    };

    createMutation.mutate(submitData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary/20 sticky top-0 bg-background">
          <h2 className="text-xl font-bold text-text">Thêm mẫu KPI</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary/10 rounded-lg transition-colors cursor-pointer"
            disabled={createMutation.isPending}
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* KPI Name */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Tên mẫu KPI <span className="text-red-500">*</span>
              <span className="text-secondary text-xs ml-1">(tối đa 255 ký tự)</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text bg-background"
              placeholder="Nhập tên mẫu KPI"
              maxLength={255}
              disabled={createMutation.isPending}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Mô tả
              <span className="text-secondary text-xs ml-1">(tối đa 1000 ký tự)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text bg-background resize-none"
              placeholder="Nhập mô tả cho mẫu KPI"
              rows={3}
              maxLength={1000}
              disabled={createMutation.isPending}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Unit of Measurement */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Đơn vị tính <span className="text-red-500">*</span>
              <span className="text-secondary text-xs ml-1">(tối đa 25 ký tự, vd: VNĐ, %, Số lượng)</span>
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text bg-background"
              placeholder="vd: VNĐ, %, Số lượng"
              maxLength={25}
              disabled={createMutation.isPending}
            />
            {errors.unit && (
              <p className="text-red-500 text-xs mt-1">{errors.unit}</p>
            )}
          </div>

          {/* Evaluation Method */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Phương thức tính <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {evaluationMethods.map((method) => (
                <label
                  key={method.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.evaluation_method === method.value
                      ? 'border-primary bg-primary/5'
                      : 'border-secondary/20 hover:border-secondary/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="evaluation_method"
                    value={method.value}
                    checked={formData.evaluation_method === method.value}
                    onChange={(e) => handleChange('evaluation_method', e.target.value)}
                    className="mt-0.5"
                    disabled={createMutation.isPending}
                  />
                  <div>
                    <p className="text-sm font-medium text-text">{method.label}</p>
                    <p className="text-xs text-secondary">{method.description}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.evaluation_method && (
              <p className="text-red-500 text-xs mt-1">{errors.evaluation_method}</p>
            )}
          </div>

          {/* Unit (Organization Unit) */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Đơn vị áp dụng
            </label>
            {isLoadingUnits ? (
              <div className="animate-pulse">
                <div className="w-full h-10 bg-secondary/20 rounded-lg" />
              </div>
            ) : (
              <select
                value={formData.unit_id}
                onChange={(e) => handleChange('unit_id', e.target.value)}
                className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text bg-background"
                disabled={createMutation.isPending}
              >
                <option value="">-- Toàn công ty --</option>
                {unitOptions.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.prefix + unit.name}
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-secondary mt-1">
              Chọn đơn vị nếu KPI này chỉ áp dụng cho đơn vị cụ thể. Để trống nếu áp dụng toàn công ty.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-secondary/20">
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
              disabled={createMutation.isPending || isLoadingUnits}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {createMutation.isPending && (
                <Loader size={16} className="animate-spin" />
              )}
              <Plus size={16} />
              Thêm mẫu KPI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddKPIDictionaryModal;
