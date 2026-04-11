import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Edit,
  Power,
  Loader,
  AlertCircle,
  Mail,
  User,
  ArrowLeft,
} from 'lucide-react';
import { getCompanyById, updateCompany, getCompanyStats } from '../../../services/company';
import EditCompanyModal from './components/EditCompanyModal';
import ConfirmModal from './components/ConfirmModal';
import AdminList from './components/AdminList';

const CompanyPage = () => {
  const { companyInfo } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'activate' or 'deactivate'

  // Extract company_id from companyInfo (format: slug-id)
  const companyId = companyInfo ? parseInt(companyInfo.split('-').pop(), 10) : null;

  // Fetch company details with stats in single call
  const { data: companyResponse, isLoading: companyLoading, error: companyError } = useQuery({
    queryKey: ['companyStats', companyId],
    queryFn: () => getCompanyStats(companyId),
    enabled: !!companyId,
  });

  // Update company mutation
  const updateMutation = useMutation({
    mutationFn: (data) => updateCompany(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyStats', companyId] });
      setIsConfirmModalOpen(false);
      setConfirmAction(null);
    },
  });

  // Extract company and stats from response data
  const company = companyResponse?.data;
  const stats = companyResponse?.data;

  const handleToggleStatus = () => {
    setConfirmAction(company?.is_active ? 'deactivate' : 'activate');
    setIsConfirmModalOpen(true);
  };

  const handleConfirmStatusChange = () => {
    const newStatus = confirmAction === 'activate';
    updateMutation.mutate({ is_active: newStatus });
  };

  if (companyError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-red-600" />
            <div>
              <p className="text-red-800 font-semibold">Lỗi khi tải dữ liệu công ty</p>
              <p className="text-red-600 text-sm mt-1">{companyError.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (companyLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-3 py-2 text-secondary hover:text-text hover:bg-secondary/10 rounded-lg transition-colors duration-200"
      >
        <ArrowLeft size={20} />
        Quay lại
      </button>

      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Chi tiết công ty</h1>
          <p className="text-secondary">{company?.name}</p>
        </div>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200"
        >
          <Edit size={18} />
          Chỉnh sửa
        </button>
      </div>

      {/* Company Info Card */}
      <div className="bg-background rounded-lg border border-secondary/20 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Company Name */}
          <div>
            <p className="text-sm text-secondary mb-1">Tên công ty</p>
            <p className="text-lg font-semibold text-text">{company?.name}</p>
          </div>

          {/* Slug */}
          <div>
            <p className="text-sm text-secondary mb-1">Slug</p>
            <p className="text-lg font-semibold text-text font-mono">{company?.slug}</p>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm text-secondary mb-1">Trạng thái</p>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  company?.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {company?.is_active ? 'Hoạt động' : 'Không hoạt động'}
              </span>
              <button
                onClick={handleToggleStatus}
                disabled={updateMutation.isPending}
                className={`p-1.5 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  company?.is_active
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-green-600 hover:bg-green-50'
                }`}
                title={company?.is_active ? 'Dừng hoạt động' : 'Kích hoạt'}
              >
                {updateMutation.isPending ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Power size={16} />
                )}
              </button>
            </div>
          </div>

          {/* AI Plan */}
          <div>
            <p className="text-sm text-secondary mb-1">AI Plan</p>
            <p className="text-lg font-semibold text-text">{company?.ai_plan || 'FREE'}</p>
          </div>

          {/* Usage Limit */}
          <div>
            <p className="text-sm text-secondary mb-1">Usage Limit</p>
            <p className="text-lg font-semibold text-text">{company?.usage_limit?.toLocaleString() || 0}</p>
          </div>

          {/* Token Usage */}
          <div>
            <p className="text-sm text-secondary mb-1">Token Usage</p>
            <p className="text-lg font-semibold text-text">{company?.token_usage?.toLocaleString() || 0}</p>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-secondary/20">
            <StatItem label="Admin" value={stats?.admin_count || 0} />
            <StatItem label="Nhân viên" value={stats?.employee_count || 0} />
            <StatItem label="Chu kỳ hoạt động" value={stats?.active_cycles || 0} />
            <StatItem label="Tổng mục tiêu" value={stats?.total_objectives || 0} />
            <StatItem label="Tiến độ OKR" value={`${Math.round(stats?.avg_okr_progress || 0)}%`} />
            <StatItem label="KPI gán" value={stats?.total_kpi_assignments || 0} />
          </div>
        )}
      </div>

      {/* Admin List */}
      <AdminList companyId={company?.id} />

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditCompanyModal
          company={company}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Confirm Modal */}
      {isConfirmModalOpen && (
        <ConfirmModal
          title={
            confirmAction === 'activate'
              ? 'Khởi động công ty?'
              : 'Dừng hoạt động công ty?'
          }
          message={
            confirmAction === 'activate'
              ? 'Công ty sẽ được khởi động, các nhân viên có thể đăng nhập lại.'
              : 'Tất cả nhân viên sẽ mất quyền truy cập. Hành động này không thể hoàn tác ngay lập tức.'
          }
          isLoading={updateMutation.isPending}
          onConfirm={handleConfirmStatusChange}
          onCancel={() => {
            setIsConfirmModalOpen(false);
            setConfirmAction(null);
          }}
        />
      )}
    </div>
  );
};

const StatItem = ({ label, value }) => (
  <div className="text-center">
    <p className="text-2xl font-bold text-primary">{value}</p>
    <p className="text-xs text-secondary mt-1">{label}</p>
  </div>
);

export default CompanyPage;