import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import { createKeyResult, getKeyResults } from '../../../../services/okr.js';

const CreateKeyResultModal = ({ objectiveId, onClose, onSuccess }) => {
  const queryClient = useQueryClient();

  // Evaluation method options
  const evaluationMethods = [
    { value: 'MAXIMIZE', label: 'Tối đa hóa (MAXIMIZE)', description: 'Giá trị cao hơn là tốt hơn' },
    { value: 'MINIMIZE', label: 'Tối thiểu hóa (MINIMIZE)', description: 'Giá trị thấp hơn là tốt hơn' },
    { value: 'TARGET', label: 'Mục tiêu (TARGET)', description: 'Giá trị nên ổn định trong khoảng' },
  ];

  const [formData, setFormData] = useState({
    title: '',
    current_value: 0,
    target_value: 100,
    unit: '',
    weight: 0,
    due_date: null,
    evaluation_method: 'MAXIMIZE',
  });
  const [weightError, setWeightError] = useState('');

  // Fetch existing key results to calculate total weight
  const { data: keyResultsResponse } = useQuery({
    queryKey: ['keyResults', objectiveId],
    queryFn: () => getKeyResults(objectiveId, { per_page: 100 }),
    enabled: !!objectiveId,
  });

  const keyResults = keyResultsResponse?.data || [];
  const totalExistingWeight = keyResults.reduce((sum, kr) => sum + (kr.weight || 0), 0);
  const remainingWeight = Math.max(0, 100 - totalExistingWeight);

  // Validate weight when it changes
  useEffect(() => {
    const newWeight = parseFloat(formData.weight) || 0;
    if (newWeight <= 0) {
      setWeightError('Trọng số phải lớn hơn 0');
    } else if (totalExistingWeight + newWeight > 100) {
      setWeightError(`Tổng trọng số không được vượt quá 100%. Còn lại: ${remainingWeight.toFixed(2)}%`);
    } else {
      setWeightError('');
    }
  }, [formData.weight, totalExistingWeight, remainingWeight]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => createKeyResult(objectiveId, data),
    onSuccess: () => {
      toast.success('Tạo Key Result thành công!');
      queryClient.invalidateQueries({ queryKey: ['keyResults', objectiveId] });
      queryClient.invalidateQueries({ queryKey: ['objective', objectiveId] });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo Key Result');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề Key Result');
      return;
    }

    if (formData.title.length > 255) {
      toast.error('Tiêu đề không được vượt quá 255 ký tự');
      return;
    }

    if (formData.unit.length > 25) {
      toast.error('Đơn vị không được vượt quá 25 ký tự');
      return;
    }

    const currentValue = parseFloat(formData.current_value);
    const targetValue = parseFloat(formData.target_value);
    const weight = parseFloat(formData.weight);

    if (isNaN(targetValue) || targetValue <= 0) {
      toast.error('Giá trị mục tiêu phải lớn hơn 0');
      return;
    }

    if (isNaN(currentValue) || currentValue < 0) {
      toast.error('Giá trị hiện tại không được âm');
      return;
    }

    if (isNaN(weight) || weight <= 0) {
      toast.error('Trọng số phải lớn hơn 0');
      return;
    }

    if (totalExistingWeight + weight > 100) {
      toast.error(`Tổng trọng số không được vượt quá 100%. Còn lại: ${remainingWeight.toFixed(2)}%`);
      return;
    }

    const payload = {
      title: formData.title.trim(),
      current_value: currentValue,
      target_value: targetValue,
      unit: formData.unit.trim(),
      weight: weight,
      evaluation_method: formData.evaluation_method,
      ...(formData.due_date && {
        due_date: formData.due_date.toISOString(),
      }),
    };

    createMutation.mutate(payload);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden border border-secondary/20">
        {/* Header */}
        <div className="px-6 py-4 border-b border-secondary/20 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Thêm Key Result mới</h2>
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
              Tiêu đề <span className="text-red-400">*</span>
              <span className="text-secondary text-xs ml-1">(tối đa 255 ký tự)</span>
            </label>
            <input
              type="text"
              placeholder="VD: Tăng số lượng khách hàng"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              maxLength={255}
              className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              required
            />
            <div className="text-xs text-secondary mt-1 text-right">
              {formData.title.length}/255
            </div>
          </div>

          {/* Current Value and Target Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Giá trị hiện tại <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={0}
                step="any"
                placeholder="0"
                value={formData.current_value}
                onChange={(e) => handleChange('current_value', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Giá trị mục tiêu <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                step="any"
                placeholder="100"
                value={formData.target_value}
                onChange={(e) => handleChange('target_value', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          {/* Unit and Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Đơn vị
                <span className="text-secondary text-xs ml-1">(tối đa 25 ký tự)</span>
              </label>
              <input
                type="text"
                placeholder="VD: %, users, $"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                maxLength={25}
                className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <div className="text-xs text-secondary mt-1 text-right">
                {formData.unit.length}/25
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Trọng số (%) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={0.01}
                max={100}
                step="0.01"
                placeholder="0"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                  weightError ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-secondary/20'
                }`}
                required
              />
              <div className="text-xs text-secondary mt-1">
                Còn lại: <span className="font-medium text-emerald-400">{remainingWeight.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Evaluation Method */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Phương thức đánh giá <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.evaluation_method}
              onChange={(e) => handleChange('evaluation_method', e.target.value)}
              disabled={createMutation.isPending}
              className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
            >
              {evaluationMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-secondary mt-1">
              {evaluationMethods.find(m => m.value === formData.evaluation_method)?.description}
            </p>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Hạn chót
              <span className="text-secondary text-xs ml-1">(tùy chọn)</span>
            </label>
            <div className="relative">
              <DatePicker
                selected={formData.due_date}
                onChange={(date) => handleChange('due_date', date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Chọn ngày hạn chót"
                className="w-full px-4 py-2 pl-10 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                isClearable
                minDate={new Date()}
              />
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
            </div>
          </div>

          {/* Weight Error Message */}
          {weightError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400">
                <span className="font-medium">Lỗi: </span>
                {weightError}
              </p>
            </div>
          )}

          {/* Weight Info */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm text-primary">
              <span className="font-medium">Thông tin: </span>
              Trọng số hiện tại của Objective:{' '}
              <span className="font-semibold">{totalExistingWeight.toFixed(2)}%</span>
              {remainingWeight > 0 ? (
                <span>. Bạn có thể thêm tối đa <span className="font-semibold">{remainingWeight.toFixed(2)}%</span>.</span>
              ) : (
                <span className="text-red-400">. Đã đạt tối đa 100%!</span>
              )}
            </p>
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
              disabled={createMutation.isPending || !!weightError || remainingWeight <= 0}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo Key Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateKeyResultModal;
