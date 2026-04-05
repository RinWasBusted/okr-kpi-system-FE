import { useState } from 'react';
import { X, Eye, EyeOff, Lock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { createObjective } from '../../../../services/okr.js';
import { getUnits } from '../../../../services/unit.js';
import { useQuery } from '@tanstack/react-query';

const CreateObjectiveModal = ({ onClose, onSuccess, cycles }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    owner: '',
    unit_id: '',
    cycle_id: cycles[0]?.id || '',
    status: 'Draft',
    visibility: 'INTERNAL',
  });

  // Fetch units for dropdown
  const { data: unitsResponse, isLoading: isLoadingUnits } = useQuery({
    queryKey: ['units', 'list'],
    queryFn: () => getUnits({ mode: 'list', per_page: 100 }),
  });

  const units = unitsResponse?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createObjective,
    onSuccess: () => {
      toast.success('Tạo Objective thành công!');
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo Objective');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề Objective');
      return;
    }

    if (!formData.cycle_id) {
      toast.error('Vui lòng chọn chu kỳ');
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      cycle_id: parseInt(formData.cycle_id),
      visibility: formData.visibility,
    };

    if (formData.unit_id) {
      payload.unit_id = parseInt(formData.unit_id);
    }

    createMutation.mutate(payload);
  };

  const visibilityOptions = [
    {
      value: 'PUBLIC',
      label: 'Công khai',
      description: 'Mọi người',
      icon: Eye,
    },
    {
      value: 'INTERNAL',
      label: 'Nội bộ',
      description: 'Phòng ban',
      icon: EyeOff,
    },
    {
      value: 'PRIVATE',
      label: 'Riêng tư',
      description: 'Chỉ mình tôi',
      icon: Lock,
    },
  ];

  const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Active', label: 'Active' },
    { value: 'Pending_Approval', label: 'Pending Approval' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-secondary/20 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Tạo Objective mới</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Tiêu đề Objective <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Tăng doanh thu 20%"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Mô tả
            </label>
            <textarea
              placeholder="Mô tả chi tiết về objective này..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Owner and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Owner <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Sales Team"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Đơn vị/Phòng ban <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.unit_id}
                onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                <option value="">Chọn đơn vị</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cycle and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Chu kỳ <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.cycle_id}
                onChange={(e) => setFormData({ ...formData, cycle_id: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                required
              >
                <option value="">Chọn chu kỳ</option>
                {cycles.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>
                    {cycle.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Phạm vi truy cập <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {visibilityOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.visibility === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, visibility: option.value })}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-secondary/20 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Icon
                        size={18}
                        className={`shrink-0 mt-0.5 ${isSelected ? 'text-primary' : 'text-secondary'}`}
                      />
                      <div>
                        <div className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-text'}`}>
                          {option.label}
                        </div>
                        <div className="text-xs text-secondary">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 pt-4 border-t border-secondary/20">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/10 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo Objective'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateObjectiveModal;
