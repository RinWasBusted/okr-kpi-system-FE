import { useState, useMemo } from 'react';
import { X, Eye, EyeOff, Lock } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { createObjective, getAvailableParentObjectives } from '../../../../services/okr.js';
import { getUnits, getUnitMembers } from '../../../../services/unit.js';
import { getCycles } from '../../../../services/cycle.js';

const CreateObjectiveModal = ({ onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    owner_id: '',
    unit_id: '',
    cycle_id: '',
    parent_objective_id: '',
    visibility: 'PUBLIC',
  });

  // Fetch units tree for dropdown
  const { data: unitsResponse, isLoading: isLoadingUnits } = useQuery({
    queryKey: ['units', 'tree'],
    queryFn: () => getUnits({ mode: 'tree', per_page: 100 }),
  });

  // Fetch cycles for dropdown
  const { data: cyclesResponse, isLoading: isLoadingCycles } = useQuery({
    queryKey: ['cycles', 'list'],
    queryFn: () => getCycles({ per_page: 100 }),
  });

  // Fetch users of selected unit
  const { data: unitMembersResponse, isLoading: isLoadingUnitMembers } = useQuery({
    queryKey: ['unitMembers', formData.unit_id],
    queryFn: () => getUnitMembers(formData.unit_id, { per_page: 100 }),
    enabled: !!formData.unit_id,
  });

  // Fetch available parent objectives for selected unit
  const { data: parentObjectivesResponse, isLoading: isLoadingParentObjectives } = useQuery({
    queryKey: ['availableParentObjectives', formData.unit_id, formData.cycle_id],
    queryFn: () => getAvailableParentObjectives({
      unit_id: formData.unit_id,
      cycle_id: formData.cycle_id || undefined,
    }),
    enabled: !!formData.unit_id,
  });

  const units = unitsResponse?.data || [];
  const cycles = cyclesResponse?.data || [];
  const unitMembers = unitMembersResponse?.data || [];
  const parentObjectivesData = parentObjectivesResponse?.data || [];

  // Flatten parent objectives from grouped data
  const parentObjectives = useMemo(() => {
    const objectives = [];
    parentObjectivesData.forEach((group) => {
      if (group.objectives && group.objectives.length > 0) {
        group.objectives.forEach((obj) => {
          objectives.push({
            ...obj,
            unitName: group.unit?.name || 'Không xác định',
          });
        });
      }
    });
    return objectives;
  }, [parentObjectivesData]);

  // Flatten units for selection with hierarchical display
  const flatUnits = useMemo(() => {
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

    if (!formData.unit_id) {
      toast.error('Vui lòng chọn đơn vị');
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      cycle_id: parseInt(formData.cycle_id),
      unit_id: parseInt(formData.unit_id),
      visibility: formData.visibility,
    };

    // Optional fields - only add if they have values
    if (formData.owner_id) {
      payload.owner_id = parseInt(formData.owner_id);
    }

    if (formData.parent_objective_id) {
      payload.parent_objective_id = parseInt(formData.parent_objective_id);
    }

    createMutation.mutate(payload);
  };

  const visibilityOptions = [
    {
      value: 'PUBLIC',
      label: 'Công khai',
      description: 'Mọi người đều xem được',
      icon: Eye,
      warning: null,
    },
    {
      value: 'INTERNAL',
      label: 'Nội bộ',
      description: 'Trong nhánh đơn vị',
      icon: EyeOff,
      warning: 'Chỉ các thành viên thuộc đơn vị này, đơn vị cha và đơn vị con có thể xem.',
    },
    {
      value: 'PRIVATE',
      label: 'Riêng tư',
      description: 'Hạn chế nhất',
      icon: Lock,
      warning: 'Chỉ người sở hữu và các thành viên đơn vị cấp trên được xem.',
    },
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

          {/* Unit and Cycle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Đơn vị/Phòng ban <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.unit_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unit_id: e.target.value,
                    owner_id: '', // Reset owner when unit changes
                    parent_objective_id: '', // Reset parent objective when unit changes
                  })
                }
                disabled={isLoadingUnits}
                className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="">{isLoadingUnits ? 'Đang tải...' : 'Chọn đơn vị'}</option>
                {flatUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.prefix + unit.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Chu kỳ <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.cycle_id}
                onChange={(e) => setFormData({ ...formData, cycle_id: e.target.value })}
                disabled={isLoadingCycles}
                className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer disabled:opacity-50"
                required
              >
                <option value="">{isLoadingCycles ? 'Đang tải...' : 'Chọn chu kỳ'}</option>
                {cycles.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>
                    {cycle.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Owner and Parent Objective */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Người sở hữu
              </label>
              <select
                value={formData.owner_id}
                onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                disabled={!formData.unit_id || isLoadingUnitMembers}
                className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="">
                  {!formData.unit_id
                    ? 'Chọn đơn vị trước'
                    : isLoadingUnitMembers
                      ? 'Đang tải...'
                      : 'Cả đơn vị'}
                </option>
                {unitMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Objective cha
              </label>
              <select
                value={formData.parent_objective_id}
                onChange={(e) =>
                  setFormData({ ...formData, parent_objective_id: e.target.value })
                }
                disabled={!formData.unit_id || isLoadingParentObjectives}
                className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="">
                  {!formData.unit_id
                    ? 'Chọn đơn vị trước'
                    : isLoadingParentObjectives
                      ? 'Đang tải...'
                      : 'Không có'}
                </option>
                {parentObjectives.map((obj) => (
                  <option key={obj.id} value={obj.id}>
                    [{obj.unitName}] {obj.title}
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
                        <div
                          className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-text'}`}
                        >
                          {option.label}
                        </div>
                        <div className="text-xs text-secondary">{option.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Visibility Warning */}
            {formData.visibility !== 'PUBLIC' && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-800">
                  <span className="font-medium">Lưu ý: </span>
                  {visibilityOptions.find((opt) => opt.value === formData.visibility)?.warning}
                </p>
              </div>
            )}
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
