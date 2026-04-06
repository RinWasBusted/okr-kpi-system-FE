import { useState } from 'react';
import { X, Loader, TrendingUp } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { createKPIRecord } from '../../../../services/kpi.js';

/**
 * Check In Modal Component
 * Modal for creating a new KPI record/check-in
 *
 * @param {Object} props
 * @param {Function} props.onClose - Close modal callback
 * @param {Function} props.onSuccess - Success callback after check-in created
 * @param {Object} props.kpi - KPI data
 */
const CheckInModal = ({ onClose, onSuccess, kpi }) => {
  const queryClient = useQueryClient();
  const [actualValue, setActualValue] = useState('');

  const kpiName = kpi?.kpi_dictionary?.name || 'KPI';
  const unit = kpi?.kpi_dictionary?.unit || '';
  const currentValue = kpi?.current_value || 0;
  const targetValue = kpi?.target_value || 0;

  // Calculate dates based on cycle
  const today = new Date();
  const periodStart = kpi?.cycle?.start_date
    ? new Date(kpi.cycle.start_date).toISOString().split('T')[0]
    : new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const periodEnd = kpi?.cycle?.end_date
    ? new Date(kpi.cycle.end_date).toISOString().split('T')[0]
    : new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const checkInMutation = useMutation({
    mutationFn: (data) => createKPIRecord(kpi.id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Check-in thành công!');
      queryClient.invalidateQueries({ queryKey: ['kpi-assignment', kpi.id] });
      queryClient.invalidateQueries({ queryKey: ['kpi-records', kpi.id] });
      queryClient.invalidateQueries({ queryKey: ['kpi-assignments'] });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi check-in');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!actualValue || parseFloat(actualValue) < 0) {
      toast.error('Vui lòng nhập giá trị hợp lệ');
      return;
    }

    const payload = {
      period_start: periodStart,
      period_end: periodEnd,
      actual_value: parseFloat(actualValue),
    };

    checkInMutation.mutate(payload);
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return '0';
    if (unit === '%') return `${value}%`;
    if (unit === 'VNĐ') return `${value.toLocaleString('vi-VN')} VNĐ`;
    return value.toLocaleString('vi-VN');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={!checkInMutation.isPending ? onClose : undefined} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-secondary/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text">Check-in KPI</h2>
              <p className="text-sm text-secondary">Cập nhật tiến độ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={checkInMutation.isPending}
            className="p-2 hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* KPI Info */}
          <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
            <p className="font-medium text-text mb-2">{kpiName}</p>
            <div className="flex items-center gap-4 text-sm text-secondary">
              <span>Hiện tại: <strong className="text-text">{formatValue(currentValue)}</strong></span>
              <span>Mục tiêu: <strong className="text-text">{formatValue(targetValue)}</strong></span>
            </div>
          </div>

          {/* Actual Value Input */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Giá trị thực tế <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder={`Nhập giá trị ${unit ? `(${unit})` : ''}`}
                value={actualValue}
                onChange={(e) => setActualValue(e.target.value)}
                disabled={checkInMutation.isPending}
                className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                required
                autoFocus
              />
              {unit && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary text-sm">
                  {unit}
                </span>
              )}
            </div>
            <p className="text-xs text-secondary mt-1">
              Nhập giá trị thực tế đã đạt được trong kỳ này
            </p>
          </div>

          {/* Period Info */}
          <div className="text-sm text-secondary">
            <p>Kỳ: <span className="text-text">{kpi?.cycle?.name}</span></p>
            <p>Thời gian: <span className="text-text">{periodStart} - {periodEnd}</span></p>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 pt-4 border-t border-secondary/20">
            <button
              type="button"
              onClick={onClose}
              disabled={checkInMutation.isPending}
              className="flex-1 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={checkInMutation.isPending || !actualValue}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {checkInMutation.isPending && <Loader size={16} className="animate-spin" />}
              Check-in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckInModal;
