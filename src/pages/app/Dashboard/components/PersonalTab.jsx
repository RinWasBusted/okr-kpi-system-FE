import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Target, BarChart3, Clock, ArrowRight, MessageSquare, TrendingUp,
} from 'lucide-react';
import { getObjectives } from '../../../../services/objective';
import { getKPIAssignments } from '../../../../services/kpi-assignment';
import { getKPITimeline, getOKRTimeline } from '../../../../services/statistic';
import { getMyCheckInActivities } from '../../../../services/checkIn';
import TrendChart from './TrendChart';

const ACTIVE_STATUSES = ['NOT_STARTED', 'ON_TRACK', 'AT_RISK', 'CRITICAL', 'COMPLETED'];

// ─── Progress Bar ──────────────────────────────────────────────────────────────
const ProgressBar = ({ value = 0, status }) => {
  const barColor =
    status === 'CRITICAL' ? 'bg-red-500'
    : status === 'AT_RISK' ? 'bg-amber-500'
    : status === 'COMPLETED' ? 'bg-emerald-500'
    : 'bg-primary';
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 bg-secondary/15 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="text-xs font-medium text-text w-10 text-right shrink-0">{Math.round(value)}%</span>
    </div>
  );
};

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Active: 'bg-emerald-500/10 text-emerald-600', Draft: 'bg-gray-500/10 text-gray-500',
    Pending_Approval: 'bg-amber-500/10 text-amber-600', Rejected: 'bg-red-500/10 text-red-500',
    Completed: 'bg-blue-500/10 text-blue-600', ON_TRACK: 'bg-emerald-500/10 text-emerald-600',
    AT_RISK: 'bg-amber-500/10 text-amber-600', CRITICAL: 'bg-red-500/10 text-red-500',
    NOT_STARTED: 'bg-gray-500/10 text-gray-500', COMPLETED: 'bg-blue-500/10 text-blue-600',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${map[status] || 'bg-secondary/10 text-secondary'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-secondary/15 rounded ${className}`} />
);

// ─── Stat Circle ───────────────────────────────────────────────────────────────
const StatCircle = ({ label, value, color }) => {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r="36" fill="none" stroke="var(--color-secondary)" strokeWidth="6" opacity="0.15" />
          <circle cx="40" cy="40" r="36" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-700" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-text">{Math.round(value)}%</span>
      </div>
      <span className="text-xs text-secondary font-medium">{label}</span>
    </div>
  );
};

// ─── Personal Tab ──────────────────────────────────────────────────────────────
const PersonalTab = ({ userId, cycleId }) => {
  const { company_slug } = useParams();
  const navigate = useNavigate();

  // Personal objectives (with key_results for check-in feed)
  const { data: objectivesData, isLoading: objLoading } = useQuery({
    queryKey: ['objectives', 'personal', userId, cycleId],
    queryFn: () =>
      getObjectives({ owner_id: userId, cycle_id: cycleId, mode: 'list', per_page: 100, include_key_results: true }).then((r) => r.data || []),
    enabled: !!userId && !!cycleId,
  });

  // Personal KPIs
  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ['kpi-assignments', 'personal', userId, cycleId],
    queryFn: () =>
      getKPIAssignments({ owner_id: userId, cycle_id: cycleId, mode: 'list', per_page: 100 }).then((r) => r.data || []),
    enabled: !!userId && !!cycleId,
  });

  // Personal timelines (for multi-line charts)
  const { data: kpiTimeline, isLoading: kpiTimeLoading } = useQuery({
    queryKey: ['kpi-timeline', 'personal', userId, cycleId],
    queryFn: () => getKPITimeline({ cycle_id: cycleId, user_id: userId }).then((r) => r.data),
    enabled: !!userId && !!cycleId,
  });

  const { data: okrTimeline, isLoading: okrTimeLoading } = useQuery({
    queryKey: ['okr-timeline', 'personal', userId, cycleId],
    queryFn: () => getOKRTimeline({ cycle_id: cycleId, user_id: userId }).then((r) => r.data),
    enabled: !!userId && !!cycleId,
  });

  const objectives = objectivesData || [];
  const kpis = kpiData || [];

  // Only active objectives count for OKR progress
  const activeObjectives = useMemo(() => {
    return objectives.filter((o) => {
      const status = o.status?.toUpperCase();
      return ['ACTIVE', 'ON_TRACK', 'AT_RISK', 'CRITICAL', 'NOT_STARTED'].includes(status);
    });
  }, [objectives]);

  // OKR check-ins: Fetch check-ins PERFORMED by the current user
  const { data: myActivitiesData, isLoading: myActivitiesLoading } = useQuery({
    queryKey: ['my-checkin-activities', userId, cycleId],
    queryFn: () => getMyCheckInActivities({ cycle_id: cycleId, limit: 20 }),
    enabled: !!userId && !!cycleId,
  });

  const myActivities = myActivitiesData?.data || [];

  const checkInsLoading = myActivitiesLoading;

  // Compute stats — only from active objectives
  const okrProgress = useMemo(() => {
    if (!activeObjectives.length) return 0;
    return activeObjectives.reduce((s, o) => s + (o.progress_percentage || 0), 0) / activeObjectives.length;
  }, [activeObjectives]);

  const kpiProgress = useMemo(() => {
    if (!kpis.length) return 0;
    return kpis.reduce((s, k) => s + (k.progress_percentage || 0), 0) / kpis.length;
  }, [kpis]);

  // Due soon
  const dueSoonItems = useMemo(() => {
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const items = [];

    for (const obj of activeObjectives) {
      const dueDate = obj.cycle?.end_date ? new Date(obj.cycle.end_date) : null;
      if (dueDate && dueDate >= now && dueDate <= sevenDays) {
        items.push({ type: 'objective', title: obj.title, due_date: dueDate, id: obj.id });
      }
    }
    for (const kpi of kpis) {
      const dueDate = kpi.cycle?.end_date ? new Date(kpi.cycle.end_date) : null;
      if (dueDate && dueDate >= now && dueDate <= sevenDays) {
        items.push({ type: 'kpi', title: kpi.kpi_dictionary?.name || `KPI #${kpi.id}`, due_date: dueDate, id: kpi.id });
      }
    }

    return items.sort((a, b) => a.due_date - b.due_date);
  }, [activeObjectives, kpis]);

  // ─── Build real check-in activity feed from fetched data ─────────────────────
  const recentCheckIns = useMemo(() => {
    // Activities (merged OKR & KPI from backend)
    // Tạm ẩn KPI Records theo yêu cầu
    return myActivities.filter(ci => ci.type !== 'kpi');
  }, [myActivities]);

  // ─── Multi-line chart data ───────────────────────────────────────────────────
  const { okrChartData, okrSeries, okrLabels } = useMemo(() => {
    if (!okrTimeline?.objectives?.length || !okrTimeline?.periods?.length)
      return { okrChartData: [], okrSeries: [], okrLabels: [] };
    const objs = okrTimeline.objectives;
    const periods = okrTimeline.periods;
    const series = objs.map((o) => `okr_${o.objective_id}`);
    const labels = objs.map((o) => o.objective_title);
    const chartData = periods.map((period) => {
      const row = { period };
      for (const obj of objs) {
        const point = obj.timeline.find((t) => t.period === period);
        row[`okr_${obj.objective_id}`] = point ? point.progress_percentage : null;
      }
      return row;
    });
    return { okrChartData: chartData, okrSeries: series, okrLabels: labels };
  }, [okrTimeline]);

  const { kpiChartData, kpiSeries, kpiLabels } = useMemo(() => {
    if (!kpiTimeline?.kpis?.length || !kpiTimeline?.periods?.length)
      return { kpiChartData: [], kpiSeries: [], kpiLabels: [] };
    const kpiItems = kpiTimeline.kpis;
    const periods = kpiTimeline.periods;
    const series = kpiItems.map((k) => `kpi_${k.kpi_id}`);
    const labels = kpiItems.map((k) => k.kpi_name);
    const chartData = periods.map((period) => {
      const row = { period };
      for (const kpi of kpiItems) {
        const point = kpi.timeline.find((t) => t.period === period);
        row[`kpi_${kpi.kpi_id}`] = point ? point.progress_percentage : null;
      }
      return row;
    });
    return { kpiChartData: chartData, kpiSeries: series, kpiLabels: labels };
  }, [kpiTimeline]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch { return dateStr; }
  };

  return (
    <div className="space-y-5">
      {/* Due soon */}
      {dueSoonItems.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-amber-500" />
            <h4 className="text-sm font-semibold text-text">Sắp đến hạn (7 ngày)</h4>
          </div>
          <div className="space-y-2">
            {dueSoonItems.map((item, i) => (
              <div key={`${item.type}-${item.id}-${i}`} className="flex items-center gap-2 text-sm">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${item.type === 'objective' ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {item.type === 'objective' ? 'OKR' : 'KPI'}
                </span>
                <span className="text-text truncate flex-1">{item.title}</span>
                <span className="text-xs text-secondary shrink-0">{item.due_date.toLocaleDateString('vi-VN')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat circles */}
      <div className="bg-background border border-secondary/20 rounded-xl p-5">
        <div className="flex items-center justify-center gap-10">
          {objLoading || kpiLoading ? (
            <>
              <Skeleton className="w-20 h-20 rounded-full" />
              <Skeleton className="w-20 h-20 rounded-full" />
            </>
          ) : (
            <>
              <StatCircle label="OKR Progress" value={okrProgress} color="#6366f1" />
              <StatCircle label="KPI Completion" value={kpiProgress} color="#10b981" />
            </>
          )}
        </div>
      </div>

      {/* Personal objectives */}
      <div className="bg-background border border-secondary/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-primary" />
          <h4 className="text-sm font-semibold text-text">Objectives của tôi</h4>
          <span className="ml-auto text-xs text-secondary">{objectives.length}</span>
        </div>
        {objLoading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : objectives.length === 0 ? (
          <p className="text-sm text-secondary text-center py-6">Bạn chưa có objective nào</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {objectives.map((obj) => (
              <div key={obj.id} className="flex items-center gap-3 p-3 rounded-lg border border-secondary/10 hover:bg-secondary/5 transition-colors cursor-pointer"
                onClick={() => navigate(`/${company_slug}/app/okr/${obj.id}`)}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{obj.title}</p>
                  <StatusBadge status={obj.progress_status || obj.status} />
                </div>
                <div className="w-28 shrink-0"><ProgressBar value={obj.progress_percentage} status={obj.progress_status} /></div>
                <ArrowRight size={14} className="text-secondary shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Personal KPIs */}
      <div className="bg-background border border-secondary/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-emerald-500" />
          <h4 className="text-sm font-semibold text-text">KPI của tôi</h4>
          <span className="ml-auto text-xs text-secondary">{kpis.length}</span>
        </div>
        {kpiLoading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : kpis.length === 0 ? (
          <p className="text-sm text-secondary text-center py-6">Bạn chưa có KPI nào</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {kpis.map((kpi) => (
              <div key={kpi.id} className="flex items-center gap-3 p-3 rounded-lg border border-secondary/10 hover:bg-secondary/5 transition-colors cursor-pointer"
                onClick={() => navigate(`/${company_slug}/app/kpi/${kpi.id}`)}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{kpi.kpi_dictionary?.name || `KPI #${kpi.id}`}</p>
                  <StatusBadge status={kpi.progress_status} />
                </div>
                <div className="w-28 shrink-0"><ProgressBar value={kpi.progress_percentage} status={kpi.progress_status} /></div>
                <ArrowRight size={14} className="text-secondary shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts — multi-line */}
      <div className="grid grid-cols-1 gap-4">
        <TrendChart data={okrChartData} xKey="period" series={okrSeries} seriesLabels={okrLabels} isLoading={okrTimeLoading} title="OKR Trend cá nhân" emptyMessage="Chưa có dữ liệu" />
        {/* <TrendChart data={kpiChartData} xKey="period" series={kpiSeries} seriesLabels={kpiLabels} isLoading={kpiTimeLoading} title="KPI Trend cá nhân" emptyMessage="Chưa có dữ liệu" /> */}
      </div>

      {/* Check-in / Activity feed — from real check-in and KPI record data */}
      <div className="bg-background border border-secondary/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={16} className="text-indigo-500" />
          <h4 className="text-sm font-semibold text-text">Hoạt động check-in gần đây</h4>
        </div>
        {(objLoading || kpiLoading || checkInsLoading) ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : recentCheckIns.length === 0 ? (
          <p className="text-sm text-secondary text-center py-6">Chưa có check-in nào. Hãy cập nhật tiến độ OKR hoặc KPI để thấy hoạt động ở đây.</p>
        ) : (
          <div className="space-y-3">
            {recentCheckIns.map((ci) => (
              <div key={ci.id} className="flex gap-3 p-3 rounded-lg border border-secondary/10">
                {ci.user?.avatar_url ? (
                  <img src={ci.user.avatar_url} alt="" className="w-8 h-8 rounded-full shrink-0 mt-0.5 object-cover border border-secondary/10" />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${ci.type === 'okr' ? 'bg-indigo-500/10' : 'bg-emerald-500/10'}`}>
                    <TrendingUp size={14} className={ci.type === 'okr' ? 'text-indigo-500' : 'text-emerald-500'} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${ci.type === 'okr' ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {ci.type === 'okr' ? 'OKR' : 'KPI'}
                    </span>
                    <p className="text-sm text-text truncate"><span className="font-medium">{ci.title}</span></p>
                  </div>
                  {ci.subtitle && (
                    <p className="text-xs text-secondary truncate mt-0.5">↳ {ci.subtitle}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-xs text-secondary">
                    <span>Tiến độ: <strong className="text-text">{Math.round(ci.progress * 100) / 100}%</strong></span>
                    <span>•</span>
                    <span>{formatDate(ci.date)}</span>
                  </div>
                  {ci.comment && (
                    <p className="text-xs text-secondary mt-1 italic truncate">"{ci.comment}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalTab;
