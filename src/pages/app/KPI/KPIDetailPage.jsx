import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Edit,
  Trash2,
  BarChart3,
  TrendingUp,
  TrendingDown,
  TrendingUp as TrendingStable,
  Calendar,
  User,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Plus,
  Loader,
  Clock,
  ChevronUp,
  ChevronDown,
  Minus,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getKPIAssignmentById,
  deleteKPIAssignment,
  getKPIRecords,
} from '../../../services/kpi.js';
import CreateKPIModal from './components/CreateKPIModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import CheckInModal from './components/CheckInModal';

// Visibility badge component
const VisibilityBadge = ({ visibility }) => {
  const getConfig = () => {
    switch (visibility) {
      case 'PUBLIC':
        return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'CÔNG KHAI', icon: Eye };
      case 'INTERNAL':
        return { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'NỘI BỘ', icon: EyeOff };
      case 'PRIVATE':
        return { bg: 'bg-secondary/10', text: 'text-secondary', label: 'RIÊNG TƯ', icon: Lock };
      default:
        return { bg: 'bg-secondary/10', text: 'text-secondary', label: visibility?.toUpperCase() || 'NỘI BỘ', icon: EyeOff };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
};

// Status badge component
const StatusBadge = ({ status }) => {
  const getConfig = () => {
    switch (status) {
      case 'ON_TRACK':
        return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'ĐÚNG TIẾN ĐỘ' };
      case 'AT_RISK':
        return { bg: 'bg-orange-500/10', text: 'text-orange-500', label: 'CẢNH BÁO' };
      case 'CRITICAL':
        return { bg: 'bg-red-500/10', text: 'text-red-500', label: 'NGUY HIỂM' };
      case 'COMPLETED':
        return { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'HOÀN THÀNH' };
      case 'NOT_STARTED':
        return { bg: 'bg-secondary/10', text: 'text-secondary', label: 'CHƯA BẮT ĐẦU' };
      default:
        return { bg: 'bg-secondary/10', text: 'text-secondary', label: status?.toUpperCase() || 'KHÔNG XÁC ĐỊNH' };
    }
  };

  const config = getConfig();

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Trend badge component
const TrendBadge = ({ trend }) => {
  const getConfig = () => {
    switch (trend) {
      case 'Upward':
        return { icon: ChevronUp, color: 'text-green-600', label: 'Tăng' };
      case 'Downward':
        return { icon: ChevronDown, color: 'text-red-600', label: 'Giảm' };
      case 'Stable':
        return { icon: Minus, color: 'text-blue-600', label: 'Ổn định' };
      default:
        return { icon: TrendingStable, color: 'text-gray-600', label: '-' };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 text-sm ${config.color}`}>
      <Icon size={16} />
      {config.label}
    </span>
  );
};

// Progress bar component
const ProgressBar = ({ percentage, color = 'bg-blue-500' }) => (
  <div className="h-3 bg-secondary/10 rounded-full overflow-hidden">
    <div
      className={`h-full ${color} rounded-full transition-all duration-300`}
      style={{ width: `${Math.min(percentage || 0, 100)}%` }}
    />
  </div>
);

const KPIDetailPage = () => {
  const { company_slug, kpiId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

  // Helper: Find KPI in cache (from KPIPage tree data)
  const findKPIInCache = () => {
    const kpiAssignmentsData = queryClient.getQueryData(['kpi-assignments']);
    if (kpiAssignmentsData?.data) {
      const findInTree = (items) => {
        for (const item of items) {
          if (item.id === parseInt(kpiId)) return item;
          if (item.children?.length) {
            const found = findInTree(item.children);
            if (found) return found;
          }
        }
        return null;
      };
      const found = findInTree(kpiAssignmentsData.data);
      if (found) return found;
    }
    return null;
  };

  // Get initial data from cache
  const cachedKPI = findKPIInCache();

  // Fetch KPI detail (with initial data from cache)
  const {
    data: kpiResponse,
    isLoading: isLoadingKPI,
    error: kpiError,
  } = useQuery({
    queryKey: ['kpi-assignment', kpiId],
    queryFn: () => getKPIAssignmentById(kpiId),
    enabled: !!kpiId && !cachedKPI,
    initialData: cachedKPI ? { data: { kpi_assignment: cachedKPI }, success: true } : undefined,
  });

  // Fetch KPI records
  const {
    data: recordsResponse,
    isLoading: isLoadingRecords,
  } = useQuery({
    queryKey: ['kpi-records', kpiId],
    queryFn: () => getKPIRecords(kpiId, { per_page: 50 }),
    enabled: !!kpiId,
  });

  // Handle KPI fetch error
  useEffect(() => {
    if (kpiError) {
      toast.error(kpiError.response?.data?.error?.message || 'Không thể tải dữ liệu KPI');
      navigate(`/${company_slug}/app/kpi`);
    }
  }, [kpiError, company_slug, navigate]);

  const kpi = kpiResponse?.data?.kpi_assignment || {};
  const records = recordsResponse?.data || [];

  const canEdit = kpi.permission?.editable === true;
  const canDelete = kpi.permission?.deletable === true;

  const evaluationMethod = kpi.kpi_dictionary?.evaluation_method || 'Positive';

  // Calculate progress: if KPI has sub-assignments, use average of children's progress
  // Otherwise use the backend-provided progress_percentage
  const progressPercentage = (() => {
    const subAssignments = kpi.sub_assignments || kpi.children || [];
    if (subAssignments.length > 0) {
      const totalProgress = subAssignments.reduce((sum, child) => {
        return sum + (child.progress_percentage || 0);
      }, 0);
      return totalProgress / subAssignments.length;
    }
    return kpi.progress_percentage || 0;
  })();

  const getProgressColor = (value) => {
    if (value >= 80) return 'bg-blue-500';
    if (value >= 50) return 'bg-blue-400';
    return 'bg-orange-400';
  };

  const progressColor = getProgressColor(progressPercentage);

  const formatValue = (value) => {
    if (value === null || value === undefined) return '0';
    const unit = kpi.kpi_dictionary?.unit;
    if (unit === '%') return `${value}%`;
    if (unit === 'VNĐ') return `${value.toLocaleString('vi-VN')} VNĐ`;
    return value.toLocaleString('vi-VN');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (isLoadingKPI) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-secondary/10 rounded animate-pulse" />
        <div className="h-48 bg-secondary/10 rounded-xl animate-pulse" />
        <div className="h-64 bg-secondary/10 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (kpiError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-800 font-semibold">Lỗi khi tải dữ liệu KPI</p>
        <p className="text-red-600 text-sm mt-1">{kpiError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to={`/${company_slug}/app/kpi`}
        className="inline-flex items-center gap-2 text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft size={18} />
        Quay lại danh sách KPI
      </Link>

      {/* Header with Actions */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <BarChart3 size={24} className="text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text">{kpi.kpi_dictionary?.name || 'KPI không tên'}</h1>
              <div className="flex items-center gap-2 mt-1">
                <VisibilityBadge visibility={kpi.visibility} />
                <span className="text-secondary">•</span>
                <span className="text-secondary text-sm">{evaluationMethod}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/10 transition-colors cursor-pointer"
            >
              <Edit size={18} />
              Chỉnh sửa
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
            >
              <Trash2 size={18} />
              Xóa
            </button>
          )}
        </div>
      </div>

      {/* KPI Info Card */}
      <div className="bg-background rounded-xl border border-secondary/20 shadow-sm overflow-hidden">
        {/* Progress Section */}
        <div className="p-6 border-b border-secondary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-text">{progressPercentage.toFixed(1)}%</div>
                <div className="text-sm text-secondary">Tiến độ</div>
              </div>
              <div className="h-12 w-px bg-secondary/20" />
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-text">{formatValue(kpi.current_value)}</span>
                  <span className="text-secondary">/ {formatValue(kpi.target_value)}</span>
                </div>
                <div className="text-sm text-secondary">Đơn vị: {kpi.kpi_dictionary?.unit || 'Không có'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {kpi.progress_status && <StatusBadge status={kpi.progress_status} />}
              <button
                onClick={() => setIsCheckInModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <TrendingUp size={18} />
                Check-in
              </button>
            </div>
          </div>
          <ProgressBar percentage={progressPercentage} color={progressColor} />
        </div>

        {/* Details Grid */}
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Building2 size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-secondary mb-0.5">Đơn vị</p>
              <p className="font-medium text-text">{kpi.unit?.name || 'Không có'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
              <User size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-secondary mb-0.5">Phân công</p>
              <p className="font-medium text-text">{kpi.owner?.full_name || 'Cả đơn vị'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <Calendar size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-secondary mb-0.5">Chu kỳ</p>
              <p className="font-medium text-text">{kpi.cycle?.name || 'Không có'}</p>
              {kpi.cycle && (
                <p className="text-xs text-secondary mt-0.5">
                  {formatDate(kpi.cycle.start_date)} - {formatDate(kpi.cycle.end_date)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
              <Clock size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-secondary mb-0.5">Cập nhật lần cuối</p>
              <p className="font-medium text-text">{formatDate(kpi.updated_at) || 'Chưa cập nhật'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Records History Section */}
      <div className="bg-background rounded-xl border border-secondary/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-secondary/20 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Lịch sử cập nhật</h2>
          <span className="text-sm text-secondary">{records.length} bản ghi</span>
        </div>

        <div className="divide-y divide-secondary/10">
          {isLoadingRecords ? (
            // Loading skeleton
            <>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-6 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : records.length === 0 ? (
            // Empty state
            <div className="p-12 text-center">
              <Clock size={48} className="mx-auto mb-4 opacity-50 text-secondary" />
              <p className="text-secondary">Chưa có lịch sử cập nhật</p>
              <button
                onClick={() => setIsCheckInModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <Plus size={18} />
                Thêm check-in đầu tiên
              </button>
            </div>
          ) : (
            // Records list
            records.map((record) => (
              <div key={record.id} className="p-6 hover:bg-secondary/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      record.status === 'ON_TRACK' ? 'bg-emerald-500/10' :
                      record.status === 'AT_RISK' ? 'bg-orange-500/10' :
                      record.status === 'CRITICAL' ? 'bg-red-500/10' :
                      'bg-secondary/10'
                    }`}>
                      <TrendingUp size={20} className={`${
                        record.status === 'ON_TRACK' ? 'text-emerald-500' :
                        record.status === 'AT_RISK' ? 'text-orange-500' :
                        record.status === 'CRITICAL' ? 'text-red-500' :
                        'text-secondary'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-text">
                          {formatValue(record.actual_value)}
                        </span>
                        {record.status && <StatusBadge status={record.status} />}
                      </div>
                      <p className="text-sm text-secondary">
                        {formatDate(record.period_start)} - {formatDate(record.period_end)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-text">
                      {record.progress_percentage?.toFixed(2)}%
                    </div>
                    {record.trend && <TrendBadge trend={record.trend} />}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <CreateKPIModal
          kpi={kpi}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['kpi-assignment', kpiId] });
          }}
        />
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <DeleteConfirmModal
          kpi={kpi}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={() => {
            navigate(`/${company_slug}/app/kpi`);
          }}
        />
      )}

      {/* Check In Modal */}
      {isCheckInModalOpen && (
        <CheckInModal
          kpi={kpi}
          onClose={() => setIsCheckInModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['kpi-assignment', kpiId] });
            queryClient.invalidateQueries({ queryKey: ['kpi-records', kpiId] });
          }}
        />
      )}
    </div>
  );
};

export default KPIDetailPage;
