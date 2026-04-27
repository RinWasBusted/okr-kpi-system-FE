import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, LayoutDashboard, AlertCircle, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCycles } from '../../../services/cycle';
import useAuthStore from '../../../hooks/useAuth';
import UnitOverviewTab from './components/UnitOverviewTab';
import PeopleManagementTab from './components/PeopleManagementTab';
import PersonalTab from './components/PersonalTab';
import GoalTreeTab from './components/GoalTreeTab';

// ─── Cycle Switcher ────────────────────────────────────────────────────────────
const CycleSwitcher = ({ cycles, selectedId, onSelect }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = cycles.find((c) => c.id === selectedId);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-secondary/20 bg-background hover:border-primary/40 transition-colors text-sm font-medium text-text cursor-pointer"
      >
        <span>{selected?.name || 'Chọn chu kỳ'}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-background border border-secondary/20 rounded-lg shadow-xl z-50 py-1 max-h-64 overflow-y-auto">
          {cycles.map((cycle) => (
            <button
              key={cycle.id}
              onClick={() => { onSelect(cycle.id); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/10 transition-colors cursor-pointer flex items-center justify-between ${
                cycle.id === selectedId ? 'text-primary font-semibold bg-primary/5' : 'text-text'
              }`}
            >
              <span>{cycle.name}</span>
              {cycle.is_locked && <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/10 text-secondary">Locked</span>}
            </button>
          ))}
          {cycles.length === 0 && (
            <p className="px-4 py-3 text-sm text-secondary text-center">Không có chu kỳ nào</p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Tab Item ──────────────────────────────────────────────────────────────────
const TabItem = ({ id, label, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`pb-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
      active
        ? 'text-primary border-b-2 border-primary'
        : 'text-secondary hover:text-text'
    }`}
  >
    {label}
  </button>
);

// ─── No Cycles Banner ──────────────────────────────────────────────────────────
const NoCyclesBanner = () => {
  const { company_slug } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-72 bg-background rounded-xl border border-dashed border-amber-500/40 px-6">
      <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-amber-500" />
      </div>
      <h3 className="text-lg font-semibold text-text mb-2">Chưa có chu kỳ đánh giá</h3>
      <p className="text-sm text-secondary text-center max-w-md mb-5">
        Để sử dụng Dashboard, bạn cần tạo ít nhất một chu kỳ đánh giá (cycle).
        Chu kỳ giúp tổ chức và theo dõi các OKR, KPI theo từng giai đoạn.
      </p>
      <button
        onClick={() => navigate(`/${company_slug}/app/cycles`)}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
      >
        <Plus size={16} />
        Tạo chu kỳ đầu tiên
      </button>
    </div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const user = useAuthStore((s) => s.user);
  const isManager = user?.is_manager || false;
  const isAdmin = user?.role === 'ADMIN_COMPANY';
  const showManagerTabs = isManager || isAdmin;

  const defaultTab = showManagerTabs ? 'unit-overview' : 'personal';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [cycleId, setCycleId] = useState(null);
  const [loadedTabs, setLoadedTabs] = useState(new Set());

  // Fetch cycles
  const { data: cyclesData, isLoading: cyclesLoading } = useQuery({
    queryKey: ['cycles-dashboard'],
    queryFn: () => getCycles({ per_page: 100 }).then((r) => r.data || []),
    staleTime: 5 * 60 * 1000,
  });

  const cycles = cyclesData || [];
  const cyclesFetched = !cyclesLoading && cyclesData !== undefined;
  const noCycles = cyclesFetched && cycles.length === 0;

  // Default to most recent unlocked cycle
  useEffect(() => {
    if (cycles.length > 0 && !cycleId) {
      const unlocked = cycles.filter((c) => !c.is_locked);
      const target = unlocked.length > 0 ? unlocked[0] : cycles[0];
      setCycleId(target.id);
    }
  }, [cycles, cycleId]);

  // Track loaded tabs for lazy loading
  useEffect(() => {
    setLoadedTabs((prev) => new Set(prev).add(activeTab));
  }, [activeTab]);

  // When cycle changes, keep loaded tabs
  useEffect(() => {
    // When cycle changes, tabs will re-fetch via queryKey
  }, [cycleId]);

  const tabs = useMemo(() => {
    const list = [];
    if (showManagerTabs) {
      list.push({ id: 'unit-overview', label: 'Tổng quan đơn vị' });
      list.push({ id: 'people', label: 'Quản lý nhân sự' });
    }
    list.push({ id: 'personal', label: 'Cá nhân' });
    list.push({ id: 'goal-tree', label: 'Cây mục tiêu' });
    return list;
  }, [showManagerTabs]);

  // Ensure active tab is valid
  useEffect(() => {
    const validIds = tabs.map((t) => t.id);
    if (!validIds.includes(activeTab)) {
      setActiveTab(validIds[0]);
    }
  }, [tabs, activeTab]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard size={24} className="text-primary" />
            <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          </div>
          <p className="text-secondary text-sm mt-1">Theo dõi hiệu suất và mục tiêu</p>
        </div>
        {!noCycles && <CycleSwitcher cycles={cycles} selectedId={cycleId} onSelect={setCycleId} />}
      </div>

      {/* Loading cycles */}
      {cyclesLoading && (
        <div className="flex items-center justify-center h-64 bg-background rounded-xl border border-secondary/20">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            <p className="text-secondary text-sm">Đang tải dữ liệu chu kỳ...</p>
          </div>
        </div>
      )}

      {/* No cycles state */}
      {noCycles && <NoCyclesBanner />}

      {/* Has cycles — show tabs and content */}
      {cyclesFetched && !noCycles && (
        <>
          {/* Tabs */}
          <div className="flex gap-6 border-b border-secondary/20 overflow-x-auto">
            {tabs.map((tab) => (
              <TabItem
                key={tab.id}
                id={tab.id}
                label={tab.label}
                active={activeTab === tab.id}
                onClick={setActiveTab}
              />
            ))}
          </div>

          {/* Tab content — lazy loaded */}
          {cycleId && (
            <div>
              {activeTab === 'unit-overview' && showManagerTabs && (
                <UnitOverviewTab unitId={user?.unit_id} cycleId={cycleId} />
              )}
              {activeTab === 'people' && showManagerTabs && (
                <PeopleManagementTab unitId={user?.unit_id} cycleId={cycleId} />
              )}
              {activeTab === 'personal' && (
                <PersonalTab userId={user?.id} cycleId={cycleId} />
              )}
              {activeTab === 'goal-tree' && (
                <GoalTreeTab cycleId={cycleId} />
              )}
            </div>
          )}

          {!cycleId && (
            <div className="flex items-center justify-center h-64 bg-background rounded-xl border border-secondary/20">
              <p className="text-secondary text-sm">Đang tải dữ liệu chu kỳ...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
