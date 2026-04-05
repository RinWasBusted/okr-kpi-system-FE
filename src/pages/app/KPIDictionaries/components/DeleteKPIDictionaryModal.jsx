import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, AlertTriangle, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { deleteKPIDictionary } from '../../../../services/kpi';

/**
 * DeleteKPIDictionaryModal Component
 * Confirmation modal for deleting a KPI Dictionary
 *
 * @param {Object} props
 * @param {Object} props.kpi - KPI dictionary to delete
 * @param {Function} props.onClose - Close modal callback
 * @param {Function} props.onSuccess - Success callback after deletion
 */
const DeleteKPIDictionaryModal = ({ kpi, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [confirmText, setConfirmText] = useState('');

  const deleteMutation = useMutation({
    mutationFn: () => deleteKPIDictionary(kpi.id),
    onSuccess: (response) => {
      toast.success(response.message || 'Xóa mẫu KPI thành công');
      queryClient.invalidateQueries({ queryKey: ['kpi-dictionaries'] });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Không thể xóa mẫu KPI';
      toast.error(message);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const isConfirmValid = confirmText.toLowerCase() === 'xóa';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text">Xác nhận xóa</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary/10 rounded-lg transition-colors cursor-pointer"
            disabled={deleteMutation.isPending}
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              Bạn có chắc chắn muốn xóa mẫu KPI này? Hành động này không thể hoàn tác.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-secondary">Mẫu KPI sẽ bị xóa:</p>
            <div className="bg-secondary/10 rounded-lg p-3">
              <p className="font-medium text-text">{kpi?.name}</p>
              <p className="text-xs text-secondary mt-1">
                Đơn vị tính: {kpi?.unit || '-'}
              </p>
            </div>
          </div>

          {/* Warning about existing assignments */}
          <div className="text-sm text-secondary">
            <p className="font-medium text-text mb-1">Lưu ý:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Mẫu KPI sau khi xóa sẽ không thể khôi phục</li>
            </ul>
          </div>

          {/* Confirmation input */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Nhập <strong className="text-red-600">"xóa"</strong> để xác nhận
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 text-text bg-background"
              placeholder="Nhập 'xóa' để xác nhận"
              disabled={deleteMutation.isPending}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="flex-1 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmValid || deleteMutation.isPending}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {deleteMutation.isPending && (
              <Loader size={16} className="animate-spin" />
            )}
            Xóa mẫu KPI
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteKPIDictionaryModal;
