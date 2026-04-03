import { useState, useMemo, useEffect } from 'react';
import { X, Copy, FileText, Calendar } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import { createCycle, cloneCycle } from '../../../../services/cycle';

const AddCycleModal = ({ onClose, onSuccess, cycles }) => {
  // Mode: 'new' or 'clone'
  const [mode, setMode] = useState('new');

  // Form data - store as Date objects for react-datepicker
  const [formData, setFormData] = useState({
    name: '',
    start_date: null,
    end_date: null,
  });

  // Clone options
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [cloneOptions, setCloneOptions] = useState({
    basicInfo: true, // Thông tin cơ bản (name, dates) - mặc định ticked
    okr: false,      // Sao chép OKR
    kpi: false,      // Sao chép KPI
  });

  // Calculate duration in days
  const duration = useMemo(() => {
    if (!formData.start_date || !formData.end_date) return 0;
    const diffTime = Math.abs(formData.end_date - formData.start_date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  }, [formData.start_date, formData.end_date]);

  // Format date to dd/MM/yyyy for display
  const formatDateVN = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Format Date to YYYY-MM-DD for API
  const formatDateForAPI = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // When in clone mode and cycle is selected, calculate new dates based on clone options
  useEffect(() => {
    if (mode === 'clone' && selectedCycleId) {
      const selectedCycle = cycles.find(c => c.id.toString() === selectedCycleId);
      if (selectedCycle) {
        const originalStart = new Date(selectedCycle.start_date);
        const originalEnd = new Date(selectedCycle.end_date);
        const diffDays = Math.ceil((originalEnd - originalStart) / (1000 * 60 * 60 * 24)) + 1;

        const today = new Date();
        const newEnd = new Date(today);
        newEnd.setDate(today.getDate() + diffDays);

        // Auto-fill if "Thông tin cơ bản" is selected
        if (cloneOptions.basicInfo) {
          setFormData({
            name: selectedCycle.name || '',
            start_date: today,
            end_date: newEnd,
          });
        } else {
          setFormData({
            name: '',
            start_date: today,
            end_date: newEnd,
          });
        }
      }
    }
  }, [mode, selectedCycleId, cycles, cloneOptions.basicInfo]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createCycle,
    onSuccess: () => {
      toast.success('Tạo chu kỳ thành công');
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo chu kỳ');
    },
  });

  // Clone mutation
  const cloneMutation = useMutation({
    mutationFn: () => cloneCycle(selectedCycleId),
    onSuccess: () => {
      toast.success('Sao chép chu kỳ thành công');
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi sao chép chu kỳ');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = {
      name: formData.name,
      start_date: formatDateForAPI(formData.start_date),
      end_date: formatDateForAPI(formData.end_date),
    };

    if (mode === 'new') {
      createMutation.mutate(submitData);
    } else {
      if (!selectedCycleId) {
        toast.error('Vui lòng chọn chu kỳ làm mẫu');
        return;
      }
      cloneMutation.mutate();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleCloneOptionChange = (option) => {
    setCloneOptions(prev => {
      const newOptions = { ...prev, [option]: !prev[option] };

      // If toggling basicInfo, auto-fill or clear name and dates
      if (option === 'basicInfo' && selectedCycleId) {
        const selectedCycle = cycles.find(c => c.id.toString() === selectedCycleId);
        if (selectedCycle) {
          if (newOptions.basicInfo) {
            // Auto-fill: copy name, today as start, today + duration as end
            const originalStart = new Date(selectedCycle.start_date);
            const originalEnd = new Date(selectedCycle.end_date);
            const diffDays = Math.ceil((originalEnd - originalStart) / (1000 * 60 * 60 * 24)) + 1;

            const today = new Date();
            const newEnd = new Date(today);
            newEnd.setDate(today.getDate() + diffDays);

            setFormData(prev => ({
              ...prev,
              name: selectedCycle.name || '',
              start_date: today,
              end_date: newEnd,
            }));
          } else {
            // Clear the name but keep dates
            setFormData(prev => ({
              ...prev,
              name: '',
            }));
          }
        }
      }

      return newOptions;
    });
  };

  const isSubmitting = createMutation.isPending || cloneMutation.isPending;

  // Custom styles for DatePicker to match existing design
  const datePickerClassName = "w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer";

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-background rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary/20">
            <h2 className="text-xl font-bold text-text">Tạo chu kỳ mới</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} className="text-secondary" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Mode Selection */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-text">Phương thức tạo</p>

              {/* New Cycle Option */}
              <label
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  mode === 'new'
                    ? 'border-primary bg-primary/5'
                    : 'border-secondary/20 hover:border-secondary/40'
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value="new"
                  checked={mode === 'new'}
                  onChange={() => setMode('new')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-primary" />
                    <span className="font-medium text-text">Tạo chu kỳ mới hoàn toàn</span>
                  </div>
                  <p className="text-sm text-secondary mt-1">Bắt đầu từ đầu với các thông số mặc định</p>
                </div>
              </label>

              {/* Clone Option */}
              <label
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  mode === 'clone'
                    ? 'border-primary bg-primary/5'
                    : 'border-secondary/20 hover:border-secondary/40'
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value="clone"
                  checked={mode === 'clone'}
                  onChange={() => setMode('clone')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Copy size={18} className="text-primary" />
                    <span className="font-medium text-text">Tạo dựa theo chu kỳ đã có</span>
                  </div>
                  <p className="text-sm text-secondary mt-1">Sao chép cài đặt từ chu kỳ cũ</p>
                </div>
              </label>
            </div>

            {/* Clone Options - Only show when in clone mode */}
            {mode === 'clone' && (
              <div className="space-y-4 p-4 bg-secondary/10 rounded-lg">
                {/* Select Template Cycle */}
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Chọn chu kỳ làm mẫu *
                  </label>
                  <select
                    value={selectedCycleId}
                    onChange={(e) => setSelectedCycleId(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Chọn chu kỳ...</option>
                    {cycles.map((cycle) => (
                      <option key={cycle.id} value={cycle.id}>
                        {cycle.name} ({formatDateVN(new Date(cycle.start_date))} - {formatDateVN(new Date(cycle.end_date))})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clone Options Checkboxes */}
                <div>
                  <p className="text-sm font-medium text-text mb-2">Chọn thông số muốn sao chép</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cloneOptions.basicInfo}
                        onChange={() => handleCloneOptionChange('basicInfo')}
                        className="rounded border-secondary/20"
                      />
                      <span className="text-sm text-text">Thông tin cơ bản (tên và thời gian)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cloneOptions.okr}
                        onChange={() => handleCloneOptionChange('okr')}
                        className="rounded border-secondary/20"
                      />
                      <span className="text-sm text-text">Sao chép OKR</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cloneOptions.kpi}
                        onChange={() => handleCloneOptionChange('kpi')}
                        className="rounded border-secondary/20"
                      />
                      <span className="text-sm text-text">Sao chép KPI</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

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
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? 'Đang tạo...' : 'Tạo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCycleModal;
