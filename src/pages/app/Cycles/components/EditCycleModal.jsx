import { useState, useMemo, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import { updateCycle } from '../../../../services/cycle';

const EditCycleModal = ({ cycle, onClose, onSuccess }) => {
  // Store dates as Date objects for react-datepicker
  const [formData, setFormData] = useState({
    name: '',
    start_date: null,
    end_date: null,
  });

  // Initialize form with cycle data
  useEffect(() => {
    if (cycle) {
      setFormData({
        name: cycle.name || '',
        start_date: cycle.start_date ? new Date(cycle.start_date) : null,
        end_date: cycle.end_date ? new Date(cycle.end_date) : null,
      });
    }
  }, [cycle]);

  // Calculate duration in days
  const duration = useMemo(() => {
    if (!formData.start_date || !formData.end_date) return 0;
    const diffTime = Math.abs(formData.end_date - formData.start_date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  }, [formData.start_date, formData.end_date]);

  // Format Date to YYYY-MM-DD for API
  const formatDateForAPI = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => updateCycle(cycle.id, data),
    onSuccess: () => {
      toast.success('Cập nhật chu kỳ thành công');
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật chu kỳ');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      name: formData.name,
      start_date: formatDateForAPI(formData.start_date),
      end_date: formatDateForAPI(formData.end_date),
    };
    updateMutation.mutate(submitData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  // Custom styles for DatePicker to match existing design
  const datePickerClassName = "w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer";

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-background rounded-xl shadow-xl w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary/20">
            <h2 className="text-xl font-bold text-text">Cập nhật chu kỳ</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} className="text-secondary" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Cycle Name */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Tên chu kỳ *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="VD: Q3 2026"
                required
                className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Ngày bắt đầu *
                </label>
                <div className="relative">
                  <DatePicker
                    selected={formData.start_date}
                    onChange={(date) => handleDateChange('start_date', date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn ngày"
                    required
                    className={datePickerClassName}
                    calendarClassName="bg-background border border-secondary/20 rounded-lg shadow-lg"
                  />
                  <Calendar size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Ngày kết thúc *
                </label>
                <div className="relative">
                  <DatePicker
                    selected={formData.end_date}
                    onChange={(date) => handleDateChange('end_date', date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn ngày"
                    required
                    className={datePickerClassName}
                    calendarClassName="bg-background border border-secondary/20 rounded-lg shadow-lg"
                  />
                  <Calendar size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Duration Display */}
            {duration > 0 && (
              <div className="text-sm text-secondary">
                Kéo dài <span className="font-medium text-text">{duration}</span> ngày
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-text hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {updateMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCycleModal;
