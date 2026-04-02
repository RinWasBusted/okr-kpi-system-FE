import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Trash2, AlertTriangle, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { deleteUnit } from '../../../../services/unit';

/**
 * DeleteUnitConfirmModal Component
 * Modal for confirming unit deletion
 *
 * @param {Object} props
 * @param {Function} props.onClose - Close modal callback
 * @param {Function} props.onSuccess - Success callback after unit deleted
 * @param {Object} props.unit - Unit data to delete
 */
const DeleteUnitConfirmModal = ({ onClose, onSuccess, unit }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteUnit(unit.id),
    onSuccess: (response) => {
      toast.success(response.message || 'Xóa đơn vị thành công');
      queryClient.invalidateQueries({ queryKey: ['units'] });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể xóa đơn vị');
    },
  });

  const handleConfirmDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary/20">
          <h2 className="text-xl font-bold text-text">Xác nhận xóa</h2>
          <button
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="p-1 hover:bg-secondary/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-text font-medium mb-2">
                Bạn có chắc chắn muốn xóa đơn vị này?
              </p>
              <p className="text-secondary text-sm">
                Đơn vị <span className="font-semibold text-text">{unit?.name}</span> sẽ bị xóa vĩnh viễn.
                Hành động này không thể hoàn tác.
              </p>
              {unit?.sub_units?.length > 0 && (
                <p className="text-red-500 text-sm mt-2">
                  Lưu ý: Đơn vị này có {unit.sub_units.length} đơn vị con. Bạn cần xóa hoặc chuyển các đơn vị con trước.
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={deleteMutation.isPending}
              className="flex-1 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/5 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deleteMutation.isPending && (
                <Loader size={16} className="animate-spin" />
              )}
              <Trash2 size={16} />
              Xóa đơn vị
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUnitConfirmModal;
