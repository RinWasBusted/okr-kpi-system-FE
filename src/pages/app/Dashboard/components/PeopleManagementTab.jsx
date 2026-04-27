import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, ChevronDown, ChevronUp, Check, X, ClipboardList, ArrowUpDown,
  AlertCircle, Clock,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getUnitEvaluations } from '../../../../services/statistic';
import { getObjectives, approveObjective, rejectObjective } from '../../../../services/objective';
import RatingBadge from './RatingBadge';
import NoUnitBanner from './NoUnitBanner';

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-secondary/15 rounded ${className}`} />
);

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
  const [sort, setSort] = useState({ key: 'composite_score', dir: 'desc' });

  // Show notice if user has no unit
  if (!unitId) {
    return (
      <NoUnitBanner message="Bạn chưa được phân công vào đơn vị nào. Quản lý nhân sự yêu cầu bạn thuộc một đơn vị. Vui lòng liên hệ quản trị viên để được xếp vào đơn vị." />
    );
  }

  // 1. Evaluations — with error handling
  const { data: evaluations, isLoading: evalLoading, isError: evalError } = useQuery({
    queryKey: ['unit-evaluations', unitId, cycleId],
    queryFn: () => getUnitEvaluations(unitId, cycleId).then((r) => r.data || []),
    enabled: !!unitId && !!cycleId,
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

  // Sorted evaluations
  const sortedEvaluations = useMemo(() => {
    if (!evaluations) return [];
    return [...evaluations].sort((a, b) => {
      const aVal = a[sort.key] ?? -Infinity;
      const bVal = b[sort.key] ?? -Infinity;
      if (typeof aVal === 'string') {
        return sort.dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sort.dir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [evaluations, sort]);

  const handleSort = (key) => {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc',
    }));
  };

  const pending = pendingObjectives || [];

  // Check if evaluations are empty (either no data or error)
  const showEvaluationEmptyState = evalError || (!evalLoading && (!evaluations || evaluations.length === 0));

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
                  Bảng bên dưới sẽ hiển thị danh sách thành viên với điểm số khi evaluations được tự động khởi tạo.
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/5">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Tên</th>
                  <th className="text-right px-3 py-3"><SortHeader label="OKR %" sortKey="avg_okr_progress" currentSort={sort} onSort={handleSort} /></th>
                  <th className="text-right px-3 py-3"><SortHeader label="KPI %" sortKey="avg_kpi_progress" currentSort={sort} onSort={handleSort} /></th>
                  <th className="text-right px-3 py-3"><SortHeader label="OKR" sortKey="okr_count" currentSort={sort} onSort={handleSort} /></th>
                  <th className="text-right px-3 py-3"><SortHeader label="KPI" sortKey="kpi_count" currentSort={sort} onSort={handleSort} /></th>
                  <th className="text-right px-3 py-3"><SortHeader label="Điểm" sortKey="composite_score" currentSort={sort} onSort={handleSort} /></th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Xếp hạng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/10">
                {sortedEvaluations.map((ev) => (
                  <tr key={ev.user_id || ev.evaluation_id || Math.random()} className="hover:bg-secondary/5 transition-colors">
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
                    <td className="px-3 py-3 text-right text-sm text-text">
                      {ev.evaluation_id ? `${ev.avg_okr_progress}%` : <span className="text-secondary/50">—</span>}
                    </td>
                    <td className="px-3 py-3 text-right text-sm text-text">
                      {ev.evaluation_id ? `${ev.avg_kpi_progress}%` : <span className="text-secondary/50">—</span>}
                    </td>
                    <td className="px-3 py-3 text-right text-sm text-text">
                      {ev.evaluation_id ? ev.okr_count : <span className="text-secondary/50">—</span>}
                    </td>
                    <td className="px-3 py-3 text-right text-sm text-text">
                      {ev.evaluation_id ? ev.kpi_count : <span className="text-secondary/50">—</span>}
                    </td>
                    <td className="px-3 py-3 text-right text-sm font-semibold text-text">
                      {ev.evaluation_id ? ev.composite_score : <span className="text-secondary/50">—</span>}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {ev.rating ? <RatingBadge rating={ev.rating} /> : <span className="text-xs text-secondary/50">No data</span>}
                    </td>
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
