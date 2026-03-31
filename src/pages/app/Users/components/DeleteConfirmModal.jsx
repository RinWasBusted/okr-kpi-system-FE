import { AlertTriangle, Loader } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, user, isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text">Xác nhận xóa</h2>
              <p className="text-secondary text-sm">Hành động này không thể hoàn tác</p>
            </div>
          </div>

          <p className="text-text mb-6">
            Bạn có chắc chắn muốn xóa nhân viên{' '}
            <span className="font-semibold">{user?.full_name}</span>?
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-secondary/20 rounded-lg text-text hover:bg-secondary/5 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader size={16} className="animate-spin" />}
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
