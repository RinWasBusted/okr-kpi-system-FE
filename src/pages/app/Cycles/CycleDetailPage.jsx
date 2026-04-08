import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Target,
  TrendingUp,
  Calendar,
  Lock,
  LockOpen,
  Edit,
  Trash2,
  MoreVertical,
  ChevronLeft,
  Copy,
} from 'lucide-react';
import { getCycleById } from '../../../services/cycle';
import { getObjectives } from '../../../services/okr';
import { getKPIAssignments } from '../../../services/kpi-assignment';
import { useAuthStore } from '../../../hooks/useAuth';
import EditCycleModal from './components/EditCycleModal';
import DeleteCycleConfirmModal from './components/DeleteCycleConfirmModal';
import CopyOKRKPIModal from './components/CopyOKRKPIModal';

const CycleDetailPage = () => {
  const { cycleId, company_slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

  // Fetch cycle detail
  const { data: cycleResponse, isLoading: isCycleLoading, refetch } = useQuery({
    queryKey: ['cycle', cycleId],
    queryFn: () => getCycleById(cycleId),
    enabled: !!cycleId,
  });

  const cycle = cycleResponse?.data?.cycle;

  // Fetch objectives for this cycle
  const { data: objectivesResponse, isLoading: isObjectivesLoading } = useQuery({
    queryKey: ['objectives', cycleId],
    queryFn: () => getObjectives({ cycle_id: cycleId, per_page: 100 }),
    enabled: !!cycleId,
  });

  const objectives = objectivesResponse?.data || [];

  // Fetch KPI assignments for this cycle
  const { data: kpiResponse, isLoading: isKpiLoading } = useQuery({
    queryKey: ['kpi-assignments', cycleId],
    queryFn: () => getKPIAssignments({ cycle_id: cycleId, per_page: 100 }),
    enabled: !!cycleId,
  });

  const kpiAssignments = kpiResponse?.data || [];

  // Format date
  const formatDateVN = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Get status display
  const getStatusDisplay = () => {
    if (!cycle) return { text: '', className: '' };

    if (cycle.is_locked) {
      return {
        text: 'Đã đóng',
        className: 'bg-gray-100 text-gray-600',
      };
    }

    const daysRemaining = cycle.days_remaining || 0;
    if (daysRemaining > 0) {
      return {
        text: `Đang mở - Còn ${daysRemaining} ngày`,
        className: 'bg-green-100 text-green-600',
      };
    }
    return {
      text: 'Đang mở',
      className: 'bg-green-100 text-green-600',
    };
  };

  const status = getStatusDisplay();
  const statistics = cycle?.statistics || {};

  if (isCycleLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-secondary/20 rounded" />
          <div className="h-32 bg-secondary/20 rounded-xl" />
          <div className="h-64 bg-secondary/20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary">Không tìm thấy chu kỳ</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/${company_slug}/app/cycles`)}
            className="p-2 hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronLeft size={24} className="text-secondary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text">{cycle.name}</h1>
            <p className="text-secondary text-sm">
              {formatDateVN(cycle.start_date)} - {formatDateVN(cycle.end_date)}
            </p>
          </div>
        </div>

        {/* Three-dot menu */}
        {user?.role === 'ADMIN_COMPANY' && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer"
            >
              <MoreVertical size={20} className="text-secondary" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-background rounded-xl shadow-lg border border-secondary/20 py-2 z-20">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setIsEditModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-secondary/10 transition-colors cursor-pointer"
                >
                  <Edit size={18} className="text-primary" />
                  <span>Chỉnh sửa</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setIsDeleteModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-secondary/10 transition-colors cursor-pointer text-red-600"
                >
                  <Trash2 size={18} />
                  <span>Xóa</span>
                </button>
                <div className="border-t border-secondary/20 my-2" />
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setIsCopyModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-secondary/10 transition-colors cursor-pointer"
                >
                  <Copy size={18} className="text-primary" />
                  <span>Sao chép OKR / KPI từ chu kỳ khác</span>
                </button>
              </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Cycle Info Card */}
      <div className="bg-background rounded-xl border border-secondary/20 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-text mb-2">Thông tin chu kỳ</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.className}`}>
              {status.text}
            </span>
          </div>
          {cycle.is_locked ? (
            <Lock size={20} className="text-gray-400" />
          ) : (
            <LockOpen size={20} className="text-green-500" />
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Target size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-secondary">Objectives</p>
              <p className="text-lg font-bold text-text">{statistics.total_objectives || 0}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Calendar size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-secondary">KPIs</p>
              <p className="text-lg font-bold text-text">{statistics.total_kpis || 0}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
              <TrendingUp size={20} className="text-cyan-600" />
            </div>
            <div>
              <p className="text-xs text-secondary">Tiến độ OKR TB</p>
              <p className="text-lg font-bold text-text">{statistics.avg_objective_progress || 0}%</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <TrendingUp size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-secondary">Tiến độ KPI TB</p>
              <p className="text-lg font-bold text-text">{statistics.avg_kpi_progress || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Objectives Section */}
      <div className="bg-background rounded-xl border border-secondary/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-secondary/20 bg-secondary/5">
          <h2 className="text-lg font-semibold text-text flex items-center gap-2">
            <Target size={20} className="text-primary" />
            Danh sách Objectives ({objectives.length})
          </h2>
        </div>

        {isObjectivesLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-secondary/20 rounded-lg" />
            ))}
          </div>
        ) : objectives.length === 0 ? (
          <div className="p-6 text-center text-secondary">
            <p>Chưa có objective nào trong chu kỳ này</p>
          </div>
        ) : (
          <div className="divide-y divide-secondary/10">
            {objectives.map((objective) => (
              <div
                key={objective.id}
                className="p-4 hover:bg-secondary/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-text">{objective.title}</h3>
                    <p className="text-sm text-secondary">
                      {objective.description || 'Không có mô tả'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      objective.status === 'Active'
                        ? 'bg-green-100 text-green-600'
                        : objective.status === 'Draft'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {objective.status}
                    </span>
                    <span className="text-sm font-medium text-text">
                      {objective.progress_percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KPI Assignments Section */}
      <div className="bg-background rounded-xl border border-secondary/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-secondary/20 bg-secondary/5">
          <h2 className="text-lg font-semibold text-text flex items-center gap-2">
            <Calendar size={20} className="text-amber-600" />
            Danh sách KPI Assignments ({kpiAssignments.length})
          </h2>
        </div>

        {isKpiLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-secondary/20 rounded-lg" />
            ))}
          </div>
        ) : kpiAssignments.length === 0 ? (
          <div className="p-6 text-center text-secondary">
            <p>Chưa có KPI assignment nào trong chu kỳ này</p>
          </div>
        ) : (
          <div className="divide-y divide-secondary/10">
            {kpiAssignments.map((kpi) => (
              <div
                key={kpi.id}
                className="p-4 hover:bg-secondary/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-text">
                      {kpi.kpi_dictionary?.name || 'Unknown KPI'}
                    </h3>
                    <p className="text-sm text-secondary">
                      Target: {kpi.target_value} {kpi.kpi_dictionary?.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      kpi.progress_status === 'COMPLETED'
                        ? 'bg-green-100 text-green-600'
                        : kpi.progress_status === 'ON_TRACK'
                        ? 'bg-blue-100 text-blue-600'
                        : kpi.progress_status === 'AT_RISK'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {kpi.progress_status}
                    </span>
                    <span className="text-sm font-medium text-text">
                      {kpi.progress_percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditCycleModal
          cycle={cycle}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => refetch()}
        />
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <DeleteCycleConfirmModal
          cycle={cycle}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={() => navigate('/cycles')}
        />
      )}

      {/* Copy Modal */}
      {isCopyModalOpen && (
        <CopyOKRKPIModal
          currentCycleId={cycleId}
          onClose={() => setIsCopyModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CycleDetailPage;
