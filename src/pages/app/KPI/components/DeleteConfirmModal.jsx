import { useState } from 'react';
import { X, AlertTriangle, Loader } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { deleteKPIAssignment } from '../../../../services/kpi.js';

/**
 * Delete Confirmation Modal Component
 * Modal for confirming deletion of a KPI assignment
 *
 * @param {Object} props
 * @param {Function} props.onClose - Close modal callback
 * @param {Function} props.onSuccess - Success callback after KPI deleted
 * @param {Object} props.kpi - KPI data to delete
 * @param {boolean} [props.cascade=false] - Whether to cascade delete all descendants
 */
const DeleteConfirmModal = ({ onClose, onSuccess, kpi, cascade = false }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteKPIAssignment(kpi.id, cascade),
    onSuccess: (response) => {
      toast.success(response.message || 'Xóa KPI thành công!');
      queryClient.invalidateQueries({ queryKey: ['kpi-assignments'] });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Có lỗi xảy ra khi xóa KPI');
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const kpiName = kpi?.kpi_dictionary?.name || 'KPI không tên';
  const hasChildren = kpi?.children && kpi.children.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={!deleteMutation.isPending ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-secondary/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-text">Xác nhận xóa</h2>
          </div>
          <button
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="p-2 hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-text">
            Bạn có chắc chắn muốn xóa KPI <strong>"{kpiName}"</strong>?
          </p>

          {hasChildren && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Cảnh báo: </span>
                KPI này có {kpi.children.length} KPI con. Xóa KPI này sẽ xóa tất cả các KPI con.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={deleteMutation.isPending}
              className="flex-1 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {deleteMutation.isPending && <Loader size={16} className="animate-spin" />}
              Xóa KPI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
