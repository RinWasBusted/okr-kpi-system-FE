import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { deleteCycle } from '../../../../services/cycle';
import { toast } from 'react-toastify';

const DeleteCycleConfirmModal = ({ cycle, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await deleteCycle(cycle.id);
      toast.success(`Đã xóa chu kỳ "${cycle.name}" thành công`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Không thể xóa chu kỳ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-background rounded-xl shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-text">Xác nhận xóa</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} className="text-secondary" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <p className="text-text">
              Bạn có chắc chắn muốn xóa chu kỳ{' '}
              <span className="font-semibold text-primary">"{cycle?.name}"</span>?
            </p>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                <span className="font-semibold">Cảnh báo:</span> Hành động này không thể hoàn tác.
                Tất cả dữ liệu liên quan đến chu kỳ này sẽ bị xóa vĩnh viễn.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-secondary/20">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 text-text hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xóa...
                </>
              ) : (
                'Xác nhận xóa'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteCycleConfirmModal;
