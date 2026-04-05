import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, Plus, AlertCircle, BarChart3, Search } from 'lucide-react';
import { getKPIAssignments, getKPIDictionaries } from '../../../services/kpi';
import { getCycles } from '../../../services/cycle';
import KPIItem from './components/KPIItem';
import KPIItemSkeleton from './components/KPIItemSkeleton';

const KPIPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter states
  const [selectedVisibility, setSelectedVisibility] = useState('');
  const [selectedCycle, setSelectedCycle] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');

  // Fetch KPI assignments
  const {
    data: kpiResponse,
    isLoading: isLoadingKPIs,
    error: kpiError,
    refetch: refetchKPIs
  } = useQuery({
    queryKey: ['kpi-assignments'],
    queryFn: () => getKPIAssignments({
      per_page: 100,
    }),
  });

  // Fetch cycles for filter
  const { data: cyclesResponse } = useQuery({
    queryKey: ['cycles', 'filter'],
    queryFn: () => getCycles({ per_page: 100 }),
  });

  // Fetch KPI dictionaries for reference
  const { data: dictionariesResponse } = useQuery({
    queryKey: ['kpi-dictionaries'],
    queryFn: () => getKPIDictionaries(),
  });

  const rawKPIs = kpiResponse?.data || [];
  const cycles = cyclesResponse?.data || [];
  const dictionaries = dictionariesResponse?.data || [];

  // Determine if we should show search results
  const isSearchActive = searchQuery.trim().length > 0;

  // Helper: Filter KPI by visibility, cycle, and unit
  const matchesFilters = (kpi) => {
    const matchesVisibility = !selectedVisibility || kpi.visibility === selectedVisibility;
    const matchesCycle = !selectedCycle || kpi.cycle_id === parseInt(selectedCycle);
    const matchesUnit = !selectedUnit || kpi.unit_id === parseInt(selectedUnit);
    return matchesVisibility && matchesCycle && matchesUnit;
  };

  // Build tree structure from flat list (using parent_assignment_id)
  const buildKPITree = (kpis) => {
    const kpiMap = new Map(kpis.map(k => [k.id, { ...k, children: [] }]));
    const rootKPIs = [];

    kpis.forEach(kpi => {
      const node = kpiMap.get(kpi.id);
      if (kpi.parent_assignment_id && kpiMap.has(kpi.parent_assignment_id)) {
        const parent = kpiMap.get(kpi.parent_assignment_id);
        parent.children.push(node);
      } else {
        rootKPIs.push(node);
      }
    });

    return rootKPIs;
  };

  // Filtered KPIs (for tree view - only root items)
  const filteredKPIs = useMemo(() => {
    if (!selectedVisibility && !selectedCycle && !selectedUnit) return rawKPIs;
    return rawKPIs.filter(matchesFilters);
  }, [rawKPIs, selectedVisibility, selectedCycle, selectedUnit]);

  // Tree structure for display
  const kpiTree = useMemo(() => {
    return buildKPITree(filteredKPIs);
  }, [filteredKPIs]);

  // Get root KPIs (no parent)
  const rootKPIs = useMemo(() => {
    return kpiTree;
  }, [kpiTree]);

  // Search results (flat list)
  const searchResults = useMemo(() => {
    if (!isSearchActive) return [];
    const query = searchQuery.toLowerCase();
    return rawKPIs.filter((kpi) => {
      // Lọc theo filters trước
      if (!matchesFilters(kpi)) return false;
      // Lọc theo search query
      const dictName = kpi.kpi_dictionary?.name?.toLowerCase() || '';
      const unitName = kpi.unit?.name?.toLowerCase() || '';
      const ownerName = kpi.owner?.full_name?.toLowerCase() || '';
      return (
        dictName.includes(query) ||
        unitName.includes(query) ||
        ownerName.includes(query)
      );
    });
  }, [rawKPIs, searchQuery, isSearchActive, selectedVisibility, selectedCycle, selectedUnit]);

  // Visibility options for filter
  const visibilityOptions = [
    { value: '', label: 'Tất cả quyền xem' },
    { value: 'PUBLIC', label: 'Công khai' },
    { value: 'INTERNAL', label: 'Nội bộ' },
    { value: 'PRIVATE', label: 'Riêng tư' },
  ];

  // Unique units from KPIs
  const units = useMemo(() => {
    const unitMap = new Map();
    rawKPIs.forEach(kpi => {
      if (kpi.unit) {
        unitMap.set(kpi.unit.id, kpi.unit);
      }
    });
    return Array.from(unitMap.values());
  }, [rawKPIs]);

  // Handle refresh
  const handleRefresh = () => {
    refetchKPIs();
  };

  // Handle edit
  const handleEdit = (kpi) => {
    // TODO: Open edit modal
    console.log('Edit KPI:', kpi);
  };

  // Handle delete
  const handleDelete = (kpi) => {
    // TODO: Open delete confirmation modal
    console.log('Delete KPI:', kpi);
  };

  if (kpiError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-red-600" />
            <div>
              <p className="text-red-800 font-semibold">Lỗi khi tải dữ liệu KPI</p>
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
          <h1 className="text-2xl font-bold text-text mb-1">Company KPIs</h1>
          <p className="text-secondary text-sm">Quản lý KPI của công ty</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
        >
          <Plus size={18} />
          Tạo KPI
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-70 max-w-md">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên KPI, đơn vị, người sở hữu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-text"
              >
                <span className="text-lg">×</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-secondary" />
            <select
              value={selectedVisibility}
              onChange={(e) => setSelectedVisibility(e.target.value)}
              className="px-3 py-2 rounded-lg border border-secondary/20 bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              {visibilityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="px-3 py-2 rounded-lg border border-secondary/20 bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              <option value="">Tất cả chu kỳ</option>
              {cycles.map(cycle => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="px-3 py-2 rounded-lg border border-secondary/20 bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              <option value="">Tất cả đơn vị</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search Results Indicator */}
      {isSearchActive && (
        <div className="text-sm text-secondary">
          Tìm thấy <strong className="text-text">{searchResults.length}</strong> kết quả cho "<strong className="text-text">{searchQuery}</strong>"
        </div>
      )}

      {/* KPIs List */}
      <div className="space-y-4">
        {isLoadingKPIs ? (
          // Loading skeletons
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <KPIItemSkeleton key={index} />
            ))}
          </div>
        ) : isSearchActive ? (
          // Search results in list mode
          searchResults.length === 0 ? (
            <div className="bg-background rounded-xl border border-secondary/20 p-12 text-center">
              <BarChart3 size={48} className="mx-auto mb-4 opacity-50 text-secondary" />
              <p className="text-secondary">Không tìm thấy KPI nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map(kpi => (
                <KPIItem
                  key={kpi.id}
                  kpi={kpi}
                  allKPIs={rawKPIs}
                  onUpdate={handleRefresh}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )
        ) : (
          // Tree view (default)
          rootKPIs.length === 0 ? (
            <div className="bg-background rounded-xl border border-secondary/20 p-12 text-center">
              <BarChart3 size={48} className="mx-auto mb-4 opacity-50 text-secondary" />
              <p className="text-secondary">Chưa có KPI nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rootKPIs.map(kpi => (
                <KPIItem
                  key={kpi.id}
                  kpi={kpi}
                  allKPIs={rawKPIs}
                  onUpdate={handleRefresh}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Create KPI Modal - Placeholder */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Tạo KPI mới</h2>
            <p className="text-secondary mb-4">Chức năng đang được phát triển...</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 border border-secondary/20 rounded-lg hover:bg-secondary/10 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPIPage;
