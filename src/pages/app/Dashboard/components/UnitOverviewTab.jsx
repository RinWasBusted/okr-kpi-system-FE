import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Users, Target, BarChart3, AlertTriangle,
  ArrowRight, X, TrendingUp,
} from 'lucide-react';
import { getUnitDetail } from '../../../../services/unit';
import { getObjectives } from '../../../../services/objective';
import { getKPIAssignments } from '../../../../services/kpi-assignment';
import { getKPITimeline, getOKRTimeline } from '../../../../services/statistic';
import TrendChart from './TrendChart';
import NoUnitBanner from './NoUnitBanner';

const ACTIVE_STATUSES = ['NOT_STARTED', 'ON_TRACK', 'AT_RISK', 'CRITICAL', 'COMPLETED'];

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, suffix = '', icon: Icon, color }) => {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-emerald-500/10 text-emerald-500',
    blue: 'bg-blue-500/10 text-blue-500',
    amber: 'bg-amber-500/10 text-amber-500',
    indigo: 'bg-indigo-500/10 text-indigo-500',
  };
  return (
    <div className="bg-background border border-secondary/20 rounded-xl p-4 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-secondary text-xs font-medium uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline gap-1 mt-1.5">
          <span className="text-2xl font-bold text-text">{value ?? '—'}</span>
          {suffix && <span className="text-sm text-secondary">{suffix}</span>}
        </div>
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color] || colorMap.primary}`}>
        <Icon size={20} />
      </div>
    </div>
  );
};

// ─── Alert Strip ───────────────────────────────────────────────────────────────
const AlertStrip = ({ objectives = [], kpis = [], onDismiss }) => {
  const atRiskObj = objectives.filter(
    (o) => ACTIVE_STATUSES.includes(o.status) && (o.progress_status === 'AT_RISK' || o.progress_status === 'CRITICAL')
  );
  const atRiskKpi = kpis.filter(
    (k) => k.progress_status === 'AT_RISK' || k.progress_status === 'CRITICAL'
  );

  if (atRiskObj.length === 0 && atRiskKpi.length === 0) return null;

  const parts = [];
  const oR = atRiskObj.filter((o) => o.progress_status === 'AT_RISK').length;
  const oC = atRiskObj.filter((o) => o.progress_status === 'CRITICAL').length;
  const kR = atRiskKpi.filter((k) => k.progress_status === 'AT_RISK').length;
  const kC = atRiskKpi.filter((k) => k.progress_status === 'CRITICAL').length;

  if (oR > 0) parts.push(`${oR} objective có rủi ro`);
  if (oC > 0) parts.push(`${oC} objective chậm trễ`);
  if (kR > 0) parts.push(`${kR} KPI có rủi ro`);
  if (kC > 0) parts.push(`${kC} KPI chậm trễ`);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400">
      <AlertTriangle size={16} className="shrink-0" />
      <span className="text-sm font-medium flex-1">{parts.join(' · ')}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="text-amber-500 hover:text-amber-600 cursor-pointer">
          <X size={14} />
        </button>
      )}
    </div>
  );
};

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

// ─── Main Tab ──────────────────────────────────────────────────────────────────
const UnitOverviewTab = ({ unitId, cycleId }) => {
  const { company_slug } = useParams();
  const navigate = useNavigate();
  const [alertDismissed, setAlertDismissed] = useState(false);

  if (!unitId) {
    return (
      <NoUnitBanner message="Bạn chưa được phân công vào đơn vị nào. Dữ liệu tổng quan đơn vị yêu cầu bạn thuộc một đơn vị. Vui lòng liên hệ quản trị viên để được xếp vào đơn vị." />
    );
  }

  // 1. Unit detail
  const { data: unitData, isLoading: unitLoading } = useQuery({
    queryKey: ['unit-detail', unitId],
    queryFn: () => getUnitDetail(unitId).then((r) => r.data),
    enabled: !!unitId,
  });

  // 2. KPI timeline
  const { data: kpiTimeline, isLoading: kpiTimeLoading } = useQuery({
    queryKey: ['kpi-timeline', unitId, cycleId],
    queryFn: () => getKPITimeline({ cycle_id: cycleId, unit_id: unitId }).then((r) => r.data),
    enabled: !!unitId && !!cycleId,
  });

  // 3. OKR timeline
  const { data: okrTimeline, isLoading: okrTimeLoading } = useQuery({
    queryKey: ['okr-timeline', unitId, cycleId],
    queryFn: () => getOKRTimeline({ cycle_id: cycleId, unit_id: unitId }).then((r) => r.data),
    enabled: !!unitId && !!cycleId,
  });

  // 4. Objectives
  const { data: objectivesData, isLoading: objLoading } = useQuery({
    queryKey: ['objectives', 'unit-overview', unitId, cycleId],
    queryFn: () =>
      getObjectives({ unit_id: unitId, cycle_id: cycleId, mode: 'list', per_page: 100 }).then((r) => r.data || []),
    enabled: !!unitId && !!cycleId,
  });

  // 5. KPI Assignments
  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ['kpi-assignments', 'unit-overview', unitId, cycleId],
    queryFn: () =>
      getKPIAssignments({ unit_id: unitId, cycle_id: cycleId, mode: 'list', per_page: 100 }).then((r) => r.data || []),
    enabled: !!unitId && !!cycleId,
  });

  const objectives = objectivesData || [];
  const kpis = kpiData || [];

  // Only count active objectives for OKR progress
  const activeObjectives = useMemo(
    () => objectives.filter((o) => ACTIVE_STATUSES.includes(o.status)),
    [objectives]
  );
  const computedOkrProgress = useMemo(() => {
    if (!activeObjectives.length) return null;
    return (activeObjectives.reduce((s, o) => s + (o.progress_percentage || 0), 0) / activeObjectives.length).toFixed(1);
  }, [activeObjectives]);

  // ─── Transform OKR timeline: one line per objective ──────────────────────────
  const { okrChartData, okrSeries, okrLabels } = useMemo(() => {
    if (!okrTimeline?.objectives?.length || !okrTimeline?.periods?.length) {
      return { okrChartData: [], okrSeries: [], okrLabels: [] };
    }
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

  // ─── Transform KPI timeline: one line per KPI ───────────────────────────────
  const { kpiChartData, kpiSeries, kpiLabels } = useMemo(() => {
    if (!kpiTimeline?.kpis?.length || !kpiTimeline?.periods?.length) {
      return { kpiChartData: [], kpiSeries: [], kpiLabels: [] };
    }
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

  return (
    <div className="space-y-5">
      {/* Alert strip */}
      {!alertDismissed && (
        <AlertStrip
          objectives={objectives}
          kpis={kpis}
          onDismiss={() => setAlertDismissed(true)}
        />
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {unitLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard title="Thành viên" value={unitData?.member_count} icon={Users} color="blue" />
            <StatCard title="Tiến độ OKR" value={computedOkrProgress ?? unitData?.okr_progress?.toFixed(1)} suffix="%" icon={Target} color="primary" />
            <StatCard title="KPI Progress" value={unitData?.kpi_health?.toFixed(1)} suffix="%" icon={BarChart3} color="green" />
            <StatCard title="Tổng KPI" value={unitData?.kpi_count} icon={TrendingUp} color="amber" />
            <StatCard title="Tổng Objective" value={activeObjectives.length || unitData?.okr_count} icon={Target} color="indigo" />
          </>
        )}
      </div>

      {/* Charts — multi-line, one per objective/KPI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrendChart
          data={okrChartData}
          xKey="period"
          series={okrSeries}
          seriesLabels={okrLabels}
          isLoading={okrTimeLoading}
          title="OKR Trend"
          emptyMessage="Chưa có dữ liệu OKR timeline"
        />
        <TrendChart
          data={kpiChartData}
          xKey="period"
          series={kpiSeries}
          seriesLabels={kpiLabels}
          isLoading={kpiTimeLoading}
          title="KPI Trend"
          emptyMessage="Chưa có dữ liệu KPI timeline"
        />
      </div>

      {/* Objectives list */}
      <div className="bg-background border border-secondary/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-primary" />
          <h4 className="text-sm font-semibold text-text">Objectives</h4>
          <span className="ml-auto text-xs text-secondary">{objectives.length} items</span>
        </div>
        {objLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : objectives.length === 0 ? (
          <p className="text-sm text-secondary text-center py-6">Chưa có objective nào trong chu kỳ này</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {objectives.map((obj) => (
              <div
                key={obj.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-secondary/10 hover:bg-secondary/5 transition-colors cursor-pointer"
                onClick={() => navigate(`/${company_slug}/app/okr/${obj.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{obj.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={obj.progress_status || obj.status} />
                    {obj.owner?.full_name && (
                      <span className="text-xs text-secondary truncate">{obj.owner.full_name}</span>
                    )}
                  </div>
                </div>
                <div className="w-32 shrink-0">
                  <ProgressBar value={obj.progress_percentage} status={obj.progress_status} />
                </div>
                <ArrowRight size={14} className="text-secondary shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KPI list */}
      <div className="bg-background border border-secondary/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-emerald-500" />
          <h4 className="text-sm font-semibold text-text">KPI Assignments</h4>
          <span className="ml-auto text-xs text-secondary">{kpis.length} items</span>
        </div>
        {kpiLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : kpis.length === 0 ? (
          <p className="text-sm text-secondary text-center py-6">Chưa có KPI nào trong chu kỳ này</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {kpis.map((kpi) => (
              <div
                key={kpi.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-secondary/10 hover:bg-secondary/5 transition-colors cursor-pointer"
                onClick={() => navigate(`/${company_slug}/app/kpi/${kpi.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {kpi.kpi_dictionary?.name || `KPI #${kpi.id}`}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={kpi.progress_status} />
                    {kpi.owner?.full_name && (
                      <span className="text-xs text-secondary truncate">{kpi.owner.full_name}</span>
                    )}
                  </div>
                </div>
                <div className="w-32 shrink-0">
                  <ProgressBar value={kpi.progress_percentage} status={kpi.progress_status} />
                </div>
                <ArrowRight size={14} className="text-secondary shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitOverviewTab;
