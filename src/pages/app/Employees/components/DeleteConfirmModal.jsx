import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Trash2, AlertTriangle, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { deleteUser } from '../../../../services/user';

/**
 * DeleteConfirmModal Component
 * Modal for confirming user deletion
 *
 * @param {Object} props
 * @param {Function} props.onClose - Close modal callback
 * @param {Object} props.user - User data to delete
 */
const DeleteConfirmModal = ({ onClose, user }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(user.id),
    onSuccess: (response) => {
      toast.success(response.message || 'Xóa nhân viên thành công');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Không thể xóa nhân viên');
    },
  });

  const handleConfirmDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Xác nhận xóa</h2>
          <button
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-gray-900 font-medium mb-2">
                Bạn có chắc chắn muốn xóa nhân viên này?
              </p>
              <p className="text-gray-500 text-sm">
                Nhân viên <span className="font-semibold text-gray-900">{user?.full_name}</span> ({user?.email}) sẽ bị xóa vĩnh viễn.
                Hành động này không thể hoàn tác.
              </p>
              {user?.role === 'ADMIN_COMPANY' && (
                <p className="text-red-500 text-sm mt-2">
                  Lưu ý: Đây là tài khoản Admin. Không thể xóa tài khoản Admin cuối cùng của công ty.
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
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {deleteMutation.isPending && (
                <Loader size={16} className="animate-spin" />
              )}
              <Trash2 size={16} />
              Xóa nhân viên
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
