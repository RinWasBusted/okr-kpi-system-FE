import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, AlertCircle, BookOpen } from 'lucide-react';
import { toast } from 'react-toastify';
import { getKPIDictionaries } from '../../../services/kpi';
import { getUnits } from '../../../services/unit';
import StatsCard from './components/StatsCard';
import KPIDictionaryCard from './components/KPIDictionaryCard';
import KPIDictionaryCardSkeleton from './components/KPIDictionaryCardSkeleton';
import UnitTreeSelect from './components/UnitTreeSelect';
import AddKPIDictionaryModal from './components/AddKPIDictionaryModal';
import DeleteKPIDictionaryModal from './components/DeleteKPIDictionaryModal';

/**
 * KPIDictionariesPage Component
 * Page for managing KPI Dictionary templates
 * Includes stats, search, filtering by unit, and CRUD operations
 */
const KPIDictionariesPage = () => {
  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState({
    value: '',
    unitId: null,
    descendantIds: [],
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch KPI Dictionaries
  const {
    data: kpiDictionariesResponse,
    isLoading: isLoadingKPIs,
    error: kpiError,
  } = useQuery({
    queryKey: ['kpi-dictionaries'],
    queryFn: () => getKPIDictionaries(),
  });

  // Fetch Units (tree mode) for filtering and modal
  const {
    data: unitsResponse,
    isLoading: isLoadingUnits,
  } = useQuery({
    queryKey: ['units', 'tree'],
    queryFn: () => getUnits({ per_page: 100, mode: 'tree' }),
  });

  const kpiDictionaries = useMemo(() =>
    kpiDictionariesResponse?.data || [],
    [kpiDictionariesResponse]
  );
  const unitsTree = useMemo(() =>
    unitsResponse?.data || [],
    [unitsResponse]
  );

  // Calculate stats by grouping KPIs (simulate category stats)
  const stats = useMemo(() => {
    // Group by unit_id for stats display
    const statsMap = new Map();
    let totalCount = 0;

    // Count total
    totalCount = kpiDictionaries.length;

    // Group by unit (if unit_id exists, group by unit name, otherwise "Toàn công ty")
    kpiDictionaries.forEach((kpi) => {
      const unitName = kpi.unit?.name || 'Toàn công ty';
      statsMap.set(unitName, (statsMap.get(unitName) || 0) + 1);
    });

    // Get top 3 categories by count
    const sortedCategories = Array.from(statsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      total: totalCount,
      categories: sortedCategories,
    };
  }, [kpiDictionaries]);

  // Filter KPIs based on search query and unit filter
  const filteredKPIs = useMemo(() => {
    let result = [...kpiDictionaries];

    // Filter by search query (search by name and description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (kpi) =>
          kpi.name.toLowerCase().includes(query) ||
          (kpi.description?.toLowerCase() || '').includes(query)
      );
    }

    // Filter by unit (include selected unit and its descendants)
    if (selectedUnitFilter.unitId) {
      const targetUnitIds = new Set(selectedUnitFilter.descendantIds);
      result = result.filter(
        (kpi) =>
          targetUnitIds.has(kpi.unit_id) ||
          // Include company-wide KPIs when filtering
          (kpi.unit_id === null && selectedUnitFilter.value === '')
      );
    }

    return result;
  }, [kpiDictionaries, searchQuery, selectedUnitFilter]);

  // Handle unit filter change
  const handleUnitFilterChange = (filterData) => {
    setSelectedUnitFilter(filterData);
  };

  // Handle delete success
  const handleDeleteSuccess = () => {
    setDeleteTarget(null);
  };

  // Error state
  if (kpiError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-red-600" />
            <div>
              <p className="text-red-800 font-semibold">
                Lỗi khi tải dữ liệu KPI
              </p>
              <p className="text-red-600 text-sm mt-1">{kpiError.message}</p>
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
          <h1 className="text-2xl font-bold text-text mb-1">Từ điển KPI</h1>
          <p className="text-secondary text-sm">
            Quản lý định nghĩa và công thức tính KPI
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
        >
          <Plus size={18} />
          Thêm mẫu KPI
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total KPIs */}
        <StatsCard
          title="Tổng số KPI"
          value={stats.total}
          isLoading={isLoadingKPIs}
        />

        {/* Category Stats (dynamic based on actual data) */}
        {isLoadingKPIs ? (
          <>
            <StatsCard title="Loading..." value="-" isLoading={true} />
            <StatsCard title="Loading..." value="-" isLoading={true} />
            <StatsCard title="Loading..." value="-" isLoading={true} />
          </>
        ) : (
          stats.categories.map(([category, count]) => (
            <StatsCard
              key={category}
              title={category}
              value={count}
              isLoading={false}
            />
          ))
        )}

        {/* Fill empty slots if fewer categories */}
        {!isLoadingKPIs &&
          stats.categories.length < 3 &&
          Array.from({ length: 3 - stats.categories.length }).map((_, i) => (
            <StatsCard
              key={`empty-${i}`}
              title="Chưa có dữ liệu"
              value="-"
              isLoading={false}
            />
          ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-background rounded-xl border border-secondary/20 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
              />
              <input
                type="text"
                placeholder="Tìm kiếm KPI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-text"
                >
                  <span className="text-lg">&times;</span>
                </button>
              )}
            </div>
          </div>

          {/* Unit Filter (Tree Select) */}
          <div className="w-full sm:w-64">
            <UnitTreeSelect
              value={selectedUnitFilter.value}
              onChange={handleUnitFilterChange}
              units={unitsTree}
              isLoading={isLoadingUnits}
              placeholder="Tất cả đơn vị"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoadingKPIs ? (
          // Loading skeletons
          <>
            <KPIDictionaryCardSkeleton />
            <KPIDictionaryCardSkeleton />
            <KPIDictionaryCardSkeleton />
            <KPIDictionaryCardSkeleton />
          </>
        ) : filteredKPIs.length === 0 ? (
          // Empty state
          <div className="col-span-full bg-background rounded-xl border border-secondary/20 p-12 text-center">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50 text-secondary" />
            <p className="text-secondary">
              {searchQuery || selectedUnitFilter.value
                ? 'Không tìm thấy KPI nào phù hợp'
                : 'Chưa có mẫu KPI nào'}
            </p>
            {(searchQuery || selectedUnitFilter.value) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedUnitFilter({ value: '', unitId: null, descendantIds: [] });
                }}
                className="mt-4 text-primary hover:underline cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          // KPI Cards
          filteredKPIs.map((kpi) => (
            <KPIDictionaryCard
              key={kpi.id}
              kpi={kpi}
              onDelete={setDeleteTarget}
            />
          ))
        )}
      </div>

      {/* Add KPI Modal */}
      {isAddModalOpen && (
        <AddKPIDictionaryModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            toast.success('Thêm mẫu KPI thành công');
          }}
          units={unitsTree}
          isLoadingUnits={isLoadingUnits}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteKPIDictionaryModal
          kpi={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default KPIDictionariesPage;
