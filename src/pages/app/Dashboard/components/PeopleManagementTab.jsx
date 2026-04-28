import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, Check, X, ClipboardList, ArrowUpDown,
  AlertCircle, Clock, Medal, Award
} from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../../../../hooks/useAuth';
import { getUnitEvaluations, getCompanyEmployeesEvaluations } from '../../../../services/statistic';
import { getObjectives, approveObjective, rejectObjective } from '../../../../services/objective';
import NoUnitBanner from './NoUnitBanner';

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-secondary/15 rounded ${className}`} />
);

const VERDICT_CONFIG = {
  EXCELLENT: {
    label: 'Xuất sắc',
    className: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  },
  GOOD: {
    label: 'Tốt',
    className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  ABOVE_AVERAGE: {
    label: 'Khá',
    className: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  },
  SATISFACTORY: {
    label: 'Đạt',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  AVERAGE: {
    label: 'Trung bình',
    className: 'bg-secondary/10 text-secondary border-secondary/20',
  },
  NEEDS_IMPROVEMENT: {
    label: 'Cần cải thiện',
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
};

const formatVerdictLabel = (verdict) => {
  if (!verdict) return null;
  if (VERDICT_CONFIG[verdict]?.label) return VERDICT_CONFIG[verdict].label;
  return verdict
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const VerdictBadge = ({ verdict }) => {
  if (!verdict) {
    return <span className="text-secondary/50">-</span>;
  }

  const config = VERDICT_CONFIG[verdict];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
        config?.className || 'bg-secondary/10 text-secondary border-secondary/20'
      }`}
    >
      {formatVerdictLabel(verdict)}
    </span>
  );
};

const normalizeEvaluation = (evaluation = {}) => ({
  ...evaluation,
  evaluation_id: evaluation.evaluation_id ?? evaluation.id ?? null,
});

// ─── Sortable Table Header ─────────────────────────────────────────────────────
const SortHeader = ({ label, sortKey, currentSort, onSort }) => {
  const isActive = currentSort.key === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-1 text-xs font-semibold text-secondary uppercase tracking-wider hover:text-text transition-colors cursor-pointer"
    >
      {label}
      <ArrowUpDown size={12} className={isActive ? 'text-primary' : 'opacity-40'} />
    </button>
  );
};

// ─── People Management Tab ─────────────────────────────────────────────────────
const PeopleManagementTab = ({ unitId, cycleId }) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAdminCompany = String(user?.role || '').toUpperCase() === 'ADMIN_COMPANY';
  const [sort, setSort] = useState({ key: 'avg_kpi_progress', dir: 'desc' });

  // 1. Evaluations — with error handling
  const { data: evaluations, isLoading: evalLoading, isError: evalError } = useQuery({
    queryKey: [isAdminCompany ? 'company-employees-evaluations' : 'unit-evaluations', unitId, cycleId],
    queryFn: async () => {
      const response = isAdminCompany
        ? await getCompanyEmployeesEvaluations({ cycle_id: cycleId })
        : await getUnitEvaluations(unitId, cycleId);

      return (response?.data || []).map(normalizeEvaluation);
    },
    enabled: !!cycleId && (isAdminCompany || !!unitId),
    retry: false, // Don't retry on P2010 or similar data-not-ready errors
  });

  // 2. Pending approval objectives
  const { data: pendingObjectives, isLoading: pendingLoading } = useQuery({
    queryKey: ['objectives', 'pending-approval', unitId, cycleId],
    queryFn: () =>
      getObjectives({
        status: 'Pending_Approval',
        unit_id: unitId,
        cycle_id: cycleId,
        mode: 'list',
        per_page: 100,
      }).then((r) => r.data || []),
    enabled: !!unitId && !!cycleId,
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id) => approveObjective(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        ['objectives', 'pending-approval', unitId, cycleId],
        (old) => (old || []).filter((o) => o.id !== id)
      );
      toast.success('Đã duyệt objective');
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Lỗi khi duyệt'),
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (id) => rejectObjective(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        ['objectives', 'pending-approval', unitId, cycleId],
        (old) => (old || []).filter((o) => o.id !== id)
      );
      toast.success('Đã từ chối objective');
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Lỗi khi từ chối'),
  });

  // Add ranking based on KPI progress
  const rankedEvaluations = useMemo(() => {
    if (!evaluations) return [];
    
    // Sort descending by avg_kpi_progress to determine ranks
    const sorted = [...evaluations].sort((a, b) => (b.avg_kpi_progress || 0) - (a.avg_kpi_progress || 0));
    
    const rankMap = new Map();
    let currentRank = 1;
    
    sorted.forEach((ev, index) => {
      // Handle competition ranking (ties get the same rank)
      if (index > 0 && sorted[index - 1].avg_kpi_progress !== ev.avg_kpi_progress) {
        currentRank = index + 1;
      }
      if (ev.evaluation_id) {
        rankMap.set(ev.evaluation_id, currentRank);
      }
    });
    
    return evaluations.map(ev => ({
      ...ev,
      kpi_rank: ev.evaluation_id && ev.avg_kpi_progress != null ? rankMap.get(ev.evaluation_id) : null
    }));
  }, [evaluations]);

  // Sorted evaluations based on user's column sort choice
  const sortedEvaluations = useMemo(() => {
    if (!rankedEvaluations) return [];
    return [...rankedEvaluations].sort((a, b) => {
      const aVal = a[sort.key] ?? -Infinity;
      const bVal = b[sort.key] ?? -Infinity;
      if (typeof aVal === 'string') {
        return sort.dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sort.dir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [rankedEvaluations, sort]);

  const handleSort = (key) => {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc',
    }));
  };

  const pending = pendingObjectives || [];

  // Check if evaluations are empty (either no data or error)
  const showEvaluationEmptyState = evalError || (!evalLoading && (!evaluations || evaluations.length === 0));

  if (!unitId && !isAdminCompany) {
    return (
      <NoUnitBanner message="Bạn chưa được phân công vào đơn vị nào. Quản lý nhân sự yêu cầu bạn thuộc một đơn vị. Vui lòng liên hệ quản trị viên để được xếp vào đơn vị." />
    );
  }

  return (
    <div className="space-y-5">
      {/* Evaluation Table */}
      <div className="bg-background border border-secondary/20 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-secondary/10">
          <Users size={16} className="text-primary" />
          <h4 className="text-sm font-semibold text-text">Bảng đánh giá thành viên</h4>
          <span className="ml-auto text-xs text-secondary">{evaluations?.length ?? 0} người</span>
        </div>

        {evalLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : showEvaluationEmptyState ? (
          <div className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
                <Clock size={24} className="text-amber-500" />
              </div>
              <h5 className="text-sm font-semibold text-text mb-2">Chưa có dữ liệu đánh giá</h5>
              <p className="text-xs text-secondary max-w-sm leading-relaxed">
                Chưa có dữ liệu đánh giá. Dữ liệu sẽ được hệ thống tự động khởi tạo sau khi chu kỳ kết thúc. Khi đó, bạn sẽ thấy bảng tổng hợp điểm số và xếp hạng của toàn bộ nhân sự tại đây.
              </p>
              <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <AlertCircle size={14} className="text-blue-500 shrink-0" />
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  Mục này hiển thị danh sách thành viên với điểm số khi evaluations được tự động khởi tạo.
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/5">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider w-24">
                    <SortHeader label="Xếp hạng" sortKey="kpi_rank" currentSort={sort} onSort={handleSort} />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Tên</th>
                  <th className="text-right px-4 py-3">
                    <div className="flex justify-end">
                      <SortHeader label="Điểm KPI" sortKey="avg_kpi_progress" currentSort={sort} onSort={handleSort} />
                    </div>
                  </th>
                  {isAdminCompany && (
                    <th className="text-left px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">
                      Verdict
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/10">
                {sortedEvaluations.map((ev) => (
                  <tr key={ev.user_id || ev.evaluation_id || ev.full_name} className="hover:bg-secondary/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {ev.kpi_rank === 1 ? <Award size={20} className="text-amber-500" /> :
                         ev.kpi_rank === 2 ? <Medal size={18} className="text-gray-400" /> :
                         ev.kpi_rank === 3 ? <Medal size={18} className="text-amber-700" /> :
                         ev.kpi_rank ? <span className="text-sm font-medium text-secondary pl-2">{ev.kpi_rank}</span> :
                         <span className="text-sm text-secondary/50 pl-2">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {ev.avatar_url ? (
                          <img src={ev.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {ev.full_name?.[0] || '?'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text truncate">{ev.full_name}</p>
                          {ev.job_title && <p className="text-xs text-secondary truncate">{ev.job_title}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-primary">
                      {ev.evaluation_id ? ev.avg_kpi_progress : <span className="text-secondary/50">—</span>}
                    </td>
                    {isAdminCompany && (
                      <td className="px-4 py-3 text-sm">
                        {ev.evaluation_id ? <VerdictBadge verdict={ev.verdict} /> : <span className="text-secondary/50">—</span>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approval Queue */}
      <div className="bg-background border border-secondary/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList size={16} className="text-amber-500" />
          <h4 className="text-sm font-semibold text-text">Chờ duyệt</h4>
          {pending.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-500 rounded-full">
              {pending.length}
            </span>
          )}
        </div>

        {pendingLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : pending.length === 0 ? (
          <p className="text-sm text-secondary text-center py-6">Không có objective nào chờ duyệt</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {pending.map((obj) => (
              <div
                key={obj.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-secondary/10"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{obj.title}</p>
                  <p className="text-xs text-secondary mt-0.5 truncate">
                    {obj.owner?.full_name || 'Unknown'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => approveMutation.mutate(obj.id)}
                    disabled={approveMutation.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Check size={12} /> Duyệt
                  </button>
                  <button
                    onClick={() => rejectMutation.mutate(obj.id)}
                    disabled={rejectMutation.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <X size={12} /> Từ chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PeopleManagementTab;
