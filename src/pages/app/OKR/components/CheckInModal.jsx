import { useState } from 'react';
import { X, Link2, MessageSquare, Target } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { createCheckIn } from '../../../../services/checkIn.js';

const CheckInModal = ({ keyResult, objectiveId, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    achieved_value: keyResult.current_value || 0,
    evidence_url: '',
    comment: '',
  });

  const checkInMutation = useMutation({
    mutationFn: (data) => createCheckIn(keyResult.id, data),
    onSuccess: () => {
      toast.success('Check-in thành công!');
      queryClient.invalidateQueries({ queryKey: ['keyResults', objectiveId] });
      queryClient.invalidateQueries({ queryKey: ['objective', objectiveId] });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Có lỗi xảy ra khi check-in');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const achievedValue = parseFloat(formData.achieved_value);
    if (isNaN(achievedValue) || achievedValue < 0) {
      toast.error('Giá trị đạt được không được âm');
      return;
    }

    if (!formData.evidence_url.trim()) {
      toast.error('Vui lòng nhập link bằng chứng');
      return;
    }

    // Validate URL format
    try {
      new URL(formData.evidence_url);
    } catch {
      toast.error('Link bằng chứng không hợp lệ');
      return;
    }

    if (formData.evidence_url.length > 2048) {
      toast.error('Link bằng chứng không được vượt quá 2048 ký tự');
      return;
    }

    if (formData.comment && formData.comment.length > 1000) {
      toast.error('Comment không được vượt quá 1000 ký tự');
      return;
    }

    const payload = {
      achieved_value: achievedValue,
      evidence_url: formData.evidence_url.trim(),
      ...(formData.comment.trim() && { comment: formData.comment.trim() }),
    };

    checkInMutation.mutate(payload);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const progress = Math.round(
    ((parseFloat(formData.achieved_value) || 0) /
      (keyResult.target_value || 1)) *
      100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-secondary/20 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Check-in Key Result</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Key Result Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-text mb-3">{keyResult.title}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-secondary">Mục tiêu: </span>
                <span className="font-medium text-emerald-600">
                  {keyResult.target_value}
                  {keyResult.unit}
                </span>
              </div>
              <div>
                <span className="text-secondary">Hiện tại: </span>
                <span className="font-medium text-cyan-600">
                  {keyResult.current_value}
                  {keyResult.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Achieved Value Input */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-primary" />
                <span>
                  Giá trị đạt được <span className="text-red-500">*</span>
                </span>
              </div>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                step="any"
                value={formData.achieved_value}
                onChange={(e) => handleChange('achieved_value', e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Nhập giá trị đạt được"
                autoFocus
              />
              <span className="text-secondary font-medium px-3 py-2 bg-gray-100 rounded-lg">
                {keyResult.unit}
              </span>
            </div>
          </div>

          {/* Evidence URL Input */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              <div className="flex items-center gap-2">
                <Link2 size={16} className="text-primary" />
                <span>
                  Link bằng chứng <span className="text-red-500">*</span>
                </span>
              </div>
            </label>
            <input
              type="url"
              placeholder="https://example.com/evidence.pdf"
              value={formData.evidence_url}
              onChange={(e) => handleChange('evidence_url', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <p className="text-xs text-secondary mt-1">
              Link đến tài liệu, hình ảnh hoặc bằng chứng cho kết quả đạt được
            </p>
          </div>

          {/* Comment Input */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-primary" />
                <span>Comment</span>
                <span className="text-secondary text-xs">(tùy chọn)</span>
              </div>
            </label>
            <textarea
              placeholder="Nhập ghi chú cho lần check-in này..."
              value={formData.comment}
              onChange={(e) => handleChange('comment', e.target.value)}
              maxLength={1000}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
            <div className="text-xs text-secondary mt-1 text-right">
              {formData.comment.length}/1000
            </div>
          </div>

          {/* Progress Preview */}
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Tiến độ sau check-in: </span>
                <span className="font-semibold">{progress}%</span>
              </p>
              <span className="text-xs text-blue-600">
                {formData.achieved_value}
                {keyResult.unit} / {keyResult.target_value}
                {keyResult.unit}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progress >= 80
                    ? 'bg-emerald-500'
                    : progress >= 50
                      ? 'bg-cyan-500'
                      : 'bg-orange-400'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
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
              disabled={checkInMutation.isPending}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {checkInMutation.isPending ? 'Đang check-in...' : 'Check-in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckInModal;
