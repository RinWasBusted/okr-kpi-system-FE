import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader } from 'lucide-react';
import { updateCompany } from '../../../../services/company';

const EditCompanyModal = ({ company, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: company?.name || '',
    slug: company?.slug || '',
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateCompany(company.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      onSuccess();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary/20">
          <h2 className="text-xl font-bold text-text">Chỉnh sửa thông tin công ty</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Tên công ty
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
              placeholder="Nhập tên công ty"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
              placeholder="Nhập slug"
              required
            />
            <p className="text-xs text-secondary mt-1">Slug phải là unique trên toàn hệ thống</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/10 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending && <Loader size={16} className="animate-spin" />}
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>

          {/* Error */}
          {updateMutation.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                {updateMutation.error.response?.data?.message || 'Lỗi khi cập nhật'}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditCompanyModal;
