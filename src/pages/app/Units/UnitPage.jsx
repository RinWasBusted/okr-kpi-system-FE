import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Building2, AlertCircle, Plus } from 'lucide-react';
import { getUnits } from '../../../services/unit';
import UnitItem from './components/UnitItem';
import UnitItemSkeleton from './components/UnitItemSkeleton';
import AddUnitModal from './components/AddUnitModal';

const UnitPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUnits, setExpandedUnits] = useState(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch units data
  const { data: unitsResponse, isLoading, error } = useQuery({
    queryKey: ['units'],
    queryFn: () => getUnits({ per_page: 100 }),
  });

  const units = unitsResponse?.data || [];

  // Auto-expand all units when data is loaded
  useEffect(() => {
    if (units.length > 0) {
      const allIds = units.map(u => u.id);
      setExpandedUnits(new Set(allIds));
    }
  }, [units]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalUnits = units.length;

    // Mock data for progress/health (since API doesn't provide these yet)
    // In real scenario, these should come from API
    const avgOkrProgress = 78;
    const okrTrend = 5;
    const avgKpiHealth = 80;
    const kpiTrend = 3;

    return {
      totalUnits,
      avgOkrProgress,
      okrTrend,
      avgKpiHealth,
      kpiTrend,
    };
  }, [units]);

  // Toggle expand/collapse
  const toggleExpand = (unitId) => {
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
  };

  // Filter root units by search query
  const filteredRootUnits = useMemo(() => {
    if (!searchQuery) return units;
    return units.filter(unit =>
      unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.manager?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [units, searchQuery]);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-red-600" />
            <div>
              <p className="text-red-800 font-semibold">Lỗi khi tải dữ liệu đơn vị</p>
              <p className="text-red-600 text-sm mt-1">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text mb-1">Quản lý Đơn vị</h1>
          <p className="text-secondary text-sm">Manage organizational units and hierarchy</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          Tạo đơn vị cấp cao
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Units */}
        <div className="bg-background rounded-xl border border-secondary/20 p-6">
          <p className="text-sm text-secondary mb-2">Tổng số đơn vị</p>
          {isLoading ? (
            <div className="animate-pulse w-12 h-8 bg-secondary/20 rounded" />
          ) : (
            <p className="text-3xl font-bold text-text">{stats.totalUnits}</p>
          )}
        </div>

        {/* Average OKR Progress */}
        <div className="bg-background rounded-xl border border-secondary/20 p-6">
          <p className="text-sm text-secondary mb-2">Tiến độ OKR trung bình</p>
          {isLoading ? (
            <div className="animate-pulse w-16 h-8 bg-secondary/20 rounded" />
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-text">{stats.avgOkrProgress}%</p>
              <span className="text-xs text-green-500 flex items-center">
                ↑ {stats.okrTrend}%
              </span>
            </div>
          )}
        </div>

        {/* KPI Health */}
        <div className="bg-background rounded-xl border border-secondary/20 p-6">
          <p className="text-sm text-secondary mb-2">KPI Health trung bình</p>
          {isLoading ? (
            <div className="animate-pulse w-16 h-8 bg-secondary/20 rounded" />
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-text">{stats.avgKpiHealth}%</p>
              <span className="text-xs text-green-500 flex items-center">
                ↑ {stats.kpiTrend}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Search Box */}
      <div className="bg-background rounded-xl border border-secondary/20 p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="Tìm kiếm đơn vị..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Units Tree */}
      <div className="bg-background rounded-xl border border-secondary/20 overflow-hidden">
        {isLoading ? (
          // Loading skeletons
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <UnitItemSkeleton key={index} level={0} />
            ))}
          </div>
        ) : units.length === 0 ? (
          <div className="text-center py-12 text-secondary">
            <Building2 size={48} className="mx-auto mb-4 opacity-50" />
            <p>Chưa có đơn vị nào</p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredRootUnits.map(unit => (
              <UnitItem
                key={unit.id}
                unit={unit}
                level={0}
                expandedUnits={expandedUnits}
                toggleExpand={toggleExpand}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Unit Modal */}
      {isAddModalOpen && (
        <AddUnitModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            // Auto-expand all units after adding new unit
            if (units.length > 0) {
              const allIds = units.map(u => u.id);
              setExpandedUnits(new Set(allIds));
            }
          }}
          units={units}
          isLoadingUnits={isLoading}
        />
      )}
    </div>
  );
};

export default UnitPage;
