import { useState, useMemo } from 'react';
import { X, Eye, EyeOff, Lock, Loader } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { createKPIAssignment, updateKPIAssignment, getKPIDictionariesForAssignment, getAvailableParentKPIs } from '../../../../services/kpi.js';
import { getUnits } from '../../../../services/unit.js';
import { getCycles } from '../../../../services/cycle.js';
import { getUsers } from '../../../../services/user.js';

/**
 * Create/Edit KPI Modal Component
 * Modal for creating a new KPI assignment or editing an existing one
 *
 * @param {Object} props
 * @param {Function} props.onClose - Close modal callback
 * @param {Function} props.onSuccess - Success callback after KPI created/updated
 * @param {Object} [props.kpi] - Existing KPI data for edit mode (optional)
 */
const CreateKPIModal = ({ onClose, onSuccess, kpi = null }) => {
  const queryClient = useQueryClient();
  const isEditMode = !!kpi;

  // Initialize form data based on mode (create or edit)
  const [formData, setFormData] = useState(() => {
    if (isEditMode) {
      return {
        kpi_dictionary_id: kpi.kpi_dictionary_id || '',
        unit_id: kpi.unit_id || '',
        cycle_id: kpi.cycle_id || '',
        owner_id: kpi.owner_id || '',
        current_value: kpi.current_value?.toString() || '0',
        target_value: kpi.target_value?.toString() || '',
        visibility: kpi.visibility || 'INTERNAL',
        parent_assignment_id: kpi.parent_assignment_id || '',
      };
    }
    return {
      kpi_dictionary_id: '',
      unit_id: '',
      cycle_id: '',
      owner_id: '',
      current_value: '0',
      target_value: '',
      visibility: 'INTERNAL',
      parent_assignment_id: '',
    };
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

  // Fetch KPI dictionaries available for assignment based on selected unit
  const { data: dictionariesResponse, isLoading: isLoadingDictionaries } = useQuery({
    queryKey: ['kpi-dictionaries', 'forAssignment', formData.unit_id],
    queryFn: () => getKPIDictionariesForAssignment(formData.unit_id),
    enabled: !isEditMode && !!formData.unit_id, // Only fetch in create mode when unit is selected
  });

  // Fetch available parent KPIs based on selected unit
  const { data: parentKPIsResponse, isLoading: isLoadingParentKPIs } = useQuery({
    queryKey: ['available-parent-kpis', formData.unit_id],
    queryFn: () => getAvailableParentKPIs({
      unit_id: formData.unit_id,
    }),
    enabled: !isEditMode && !!formData.unit_id, // Only fetch in create mode when unit is selected
  });

  // Fetch users of selected unit
  const { data: usersResponse, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users', formData.unit_id],
    queryFn: () => getUsers({ unit_id: formData.unit_id, per_page: 100 }),
    enabled: !!formData.unit_id,
  });

  const units = unitsResponse?.data || [];
  const cycles = cyclesResponse?.data || [];
  const dictionaries = dictionariesResponse?.data || [];
  const users = usersResponse?.data || [];
  const parentKPIsData = parentKPIsResponse?.data || [];

  // Flatten parent KPI options from grouped data
  const parentKPIOptions = useMemo(() => {
    const options = [];
    parentKPIsData.forEach((group) => {
      if (group.assignments && group.assignments.length > 0) {
        group.assignments.forEach((assignment) => {
          options.push({
            ...assignment,
            unitName: group.unit?.name || 'Không xác định',
          });
        });
      }
    });
    return options;
  }, [parentKPIsData]);

  // Get selected dictionary info for displaying unit
  const selectedDictionary = useMemo(() => {
    if (!formData.kpi_dictionary_id) return null;
    return dictionaries.find(d => d.id === parseInt(formData.kpi_dictionary_id));
  }, [formData.kpi_dictionary_id, dictionaries]);

  // Get selected parent KPI info
  const selectedParentKPI = useMemo(() => {
    if (!formData.parent_assignment_id) return null;
    return parentKPIOptions.find(k => k.id === parseInt(formData.parent_assignment_id));
  }, [formData.parent_assignment_id, parentKPIOptions]);

  // Handle parent KPI change - auto set kpi_dictionary_id
  const handleParentKPIChange = (e) => {
    const parentId = e.target.value;
    const parent = parentId ? parentKPIOptions.find(k => k.id === parseInt(parentId)) : null;

    setFormData({
      ...formData,
      parent_assignment_id: parentId,
      // Auto-set kpi_dictionary_id from parent if selected, otherwise keep current
      kpi_dictionary_id: parent ? parent.kpi_dictionary?.id?.toString() || '' : formData.kpi_dictionary_id,
    });
  };

  // Flatten units for selection with hierarchical display
  const flatUnits = useMemo(() => {
    const options = [];

    const traverse = (items, level = 0) => {
      items.forEach((item) => {
        options.push({
          id: item.id,
          name: item.name,
          level,
          prefix: level > 0 ? '  '.repeat(level) + '└ ' : '',
        });
        if (item.sub_units?.length) {
          traverse(item.sub_units, level + 1);
        }
      });
    };

    traverse(units);
    return options;
  }, [units]);

  // Get selected unit name
  const selectedUnitName = useMemo(() => {
    return flatUnits.find(u => u.id === parseInt(formData.unit_id))?.name || '';
  }, [formData.unit_id, flatUnits]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createKPIAssignment,
    onSuccess: (response) => {
      toast.success(response.message || 'Tạo KPI thành công!');
      queryClient.invalidateQueries({ queryKey: ['kpi-assignments'] });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Có lỗi xảy ra khi tạo KPI');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => updateKPIAssignment(kpi.id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Cập nhật KPI thành công!');
      queryClient.invalidateQueries({ queryKey: ['kpi-assignments'] });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Có lỗi xảy ra khi cập nhật KPI');
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isEditMode && !formData.kpi_dictionary_id) {
      toast.error('Vui lòng chọn mẫu KPI');
      return;
    }

    if (!isEditMode && !formData.unit_id) {
      toast.error('Vui lòng chọn đơn vị');
      return;
    }

    if (!formData.cycle_id) {
      toast.error('Vui lòng chọn chu kỳ');
      return;
    }

    if (!formData.target_value || parseFloat(formData.target_value) <= 0) {
      toast.error('Giá trị mục tiêu phải lớn hơn 0');
      return;
    }

    const payload = {
      cycle_id: parseInt(formData.cycle_id),
      target_value: parseFloat(formData.target_value),
      current_value: parseFloat(formData.current_value || 0),
      visibility: formData.visibility,
    };

    // Add fields based on mode
    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      payload.kpi_dictionary_id = parseInt(formData.kpi_dictionary_id);
      payload.unit_id = parseInt(formData.unit_id);
      if (formData.owner_id) {
        payload.owner_id = parseInt(formData.owner_id);
      }
      if (formData.parent_assignment_id) {
        payload.parent_assignment_id = parseInt(formData.parent_assignment_id);
      }
      createMutation.mutate(payload);
    }
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
      <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-xl mx-4 overflow-hidden max-h-[90vh] flex flex-col border border-secondary/20">
        {/* Header */}
        <div className="px-6 py-4 border-b border-secondary/20 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold text-text">
            {isEditMode ? 'Chỉnh sửa KPI' : 'Tạo KPI mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Unit Selection - Only in Create Mode */}
          {!isEditMode && (
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Đơn vị <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.unit_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unit_id: e.target.value,
                    kpi_dictionary_id: '', // Reset KPI dictionary when unit changes
                    owner_id: '', // Reset owner when unit changes
                    parent_assignment_id: '', // Reset parent when unit changes
                  })
                }
                disabled={isLoadingUnits || isPending}
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
          )}

          {/* Parent KPI Selection - Only in Create Mode */}
          {!isEditMode && (
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                KPI cha
              </label>
              <select
                value={formData.parent_assignment_id}
                onChange={handleParentKPIChange}
                disabled={!formData.unit_id || isLoadingParentKPIs || isPending}
                className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="">
                  {!formData.unit_id
                    ? 'Chọn đơn vị trước'
                    : isLoadingParentKPIs
                      ? 'Đang tải...'
                      : 'Không có (KPI gốc)'}
                </option>
                {parentKPIOptions.map((kpi) => (
                  <option key={kpi.id} value={kpi.id}>
                    [{kpi.unitName}] {kpi.kpi_dictionary?.name} ({kpi.progress_percentage?.toFixed(0)}%)
                  </option>
                ))}
              </select>
              {parentKPIOptions.length > 0 && (
                <p className="text-xs text-secondary mt-1">
                  Chọn KPI cha từ đơn vị hiện tại hoặc đơn vị cấp trên. Khi chọn KPI cha, mẫu KPI sẽ được tự động chọn theo KPI cha.
                </p>
              )}
            </div>
          )}

          {/* KPI Dictionary Selection - Only in Create Mode */}
          {!isEditMode && (
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Mẫu KPI <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.kpi_dictionary_id}
                onChange={(e) =>
                  setFormData({ ...formData, kpi_dictionary_id: e.target.value })
                }
                disabled={
                  !formData.unit_id ||
                  isLoadingDictionaries ||
                  isPending ||
                  !!formData.parent_assignment_id // Disabled when parent KPI is selected
                }
                className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="">
                  {!formData.unit_id
                    ? 'Chọn đơn vị trước'
                    : formData.parent_assignment_id
                      ? `Tự động: ${selectedParentKPI?.kpi_dictionary?.name || 'KPI cha'}`
                      : isLoadingDictionaries
                        ? 'Đang tải...'
                        : 'Chọn mẫu KPI'}
                </option>
                {dictionaries.map((dict) => (
                  <option key={dict.id} value={dict.id}>
                    {dict.name} ({dict.unit}) - {dict.evaluation_method}
                  </option>
                ))}
              </select>
              {selectedDictionary && !formData.parent_assignment_id && (
                <p className="text-xs text-secondary mt-1">
                  {selectedDictionary.description || 'Không có mô tả'}
                </p>
              )}
              {formData.parent_assignment_id && (
                <p className="text-xs text-amber-400 mt-1">
                  Mẫu KPI đã được tự động chọn theo KPI cha
                </p>
              )}
            </div>
          )}

          {/* Cycle Selection */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Chu kỳ <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.cycle_id}
              onChange={(e) => setFormData({ ...formData, cycle_id: e.target.value })}
              disabled={isLoadingCycles || isPending}
              className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer disabled:opacity-50"
            >
              <option value="">{isLoadingCycles ? 'Đang tải...' : 'Chọn chu kỳ'}</option>
              {cycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.name}
                </option>
              ))}
            </select>
          </div>

          {/* Current Value and Target Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Giá trị hiện tại
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                disabled={isPending}
                className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Giá trị mục tiêu <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Nhập giá trị mục tiêu"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                disabled={isPending}
                className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                required
              />
            </div>
          </div>

          {/* Owner Selection - Only in Create Mode */}
          {!isEditMode && (
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Phân công
              </label>
              <select
                value={formData.owner_id}
                onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                disabled={!formData.unit_id || isLoadingUsers || isPending}
                className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="">
                  {!formData.unit_id
                    ? 'Chọn đơn vị trước'
                    : isLoadingUsers
                      ? 'Đang tải...'
                      : `Cả đơn vị${selectedUnitName ? ` (${selectedUnitName})` : ''}`}
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} {user.job_title ? `(${user.job_title})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

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
                    disabled={isPending}
                    className={`p-3 rounded-lg border-2 transition-all text-left disabled:opacity-50 ${
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
              <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <p className="text-sm text-amber-400">
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
              disabled={isPending}
              className="flex-1 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isPending && <Loader size={16} className="animate-spin" />}
              {isEditMode ? 'Cập nhật' : 'Tạo KPI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateKPIModal;
