import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, Plus, AlertCircle, BarChart3, Search } from 'lucide-react';
import { getKPIAssignments, getKPIDictionaries } from '../../../services/kpi';
import { getCycles } from '../../../services/cycle';
import KPIItem from './components/KPIItem';
import KPIItemSkeleton from './components/KPIItemSkeleton';
import CreateKPIModal from './components/CreateKPIModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';

const KPIPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedKPIs, setExpandedKPIs] = useState(new Set());

  // Filter states
  const [selectedVisibility, setSelectedVisibility] = useState('');
  const [selectedCycle, setSelectedCycle] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');

  // Fetch KPI assignments in tree mode (for display)
  const {
    data: treeResponse,
    isLoading: isLoadingTree,
    error: treeError,
    refetch: refetchTree
  } = useQuery({
    queryKey: ['kpi-assignments', 'tree'],
    queryFn: () => getKPIAssignments({
      mode: 'tree',
      per_page: 100,
    }),
  });

  // Fetch KPI assignments in list mode (for search/filter - background)
  const {
    data: listResponse,
    isLoading: isLoadingList,
  } = useQuery({
    queryKey: ['kpi-assignments', 'list'],
    queryFn: () => getKPIAssignments({
      mode: 'list',
      per_page: 100,
    }),
    // Chạy ngầm, không block UI
    staleTime: 5 * 60 * 1000,
  });

  // Fetch cycles for filter
  const { data: cyclesResponse } = useQuery({
    queryKey: ['cycles', 'filter'],
    queryFn: () => getCycles({ per_page: 100 }),
  });


  const rawTreeKPIs = treeResponse?.data || [];
  const rawListKPIs = listResponse?.data || [];
  const cycles = cyclesResponse?.data || [];

  // Auto-expand all root KPIs when tree data loads
  useEffect(() => {
    if (rawTreeKPIs.length > 0 && expandedKPIs.size === 0) {
      // Collect all KPI IDs recursively
      const collectAllIds = (kpis) => {
        const ids = [];
        kpis.forEach(kpi => {
          ids.push(kpi.id);
          if (kpi.sub_assignments?.length > 0) {
            ids.push(...collectAllIds(kpi.sub_assignments));
          }
        });
        return ids;
      };
      const allIds = collectAllIds(rawTreeKPIs);
      setExpandedKPIs(new Set(allIds));
    }
  }, [rawTreeKPIs]);

  // Determine if we should show search results
  const isSearchActive = searchQuery.trim().length > 0;

  // Helper: Filter KPI by visibility, cycle, and unit
  const matchesFilters = (kpi) => {
    const matchesVisibility = !selectedVisibility || kpi.visibility === selectedVisibility;
    const matchesCycle = !selectedCycle || kpi.cycle_id === parseInt(selectedCycle);
    const matchesUnit = !selectedUnit || kpi.unit_id === parseInt(selectedUnit);
    return matchesVisibility && matchesCycle && matchesUnit;
  };

  // Helper: Recursively filter tree (giữ lại parent nếu có child match)
  const filterTreeRecursive = (items) => {
    return items
      .map((item) => {
        // Lọc children đệ quy
        const filteredChildren = item.children
          ? filterTreeRecursive(item.children)
          : [];

        // Kiểm tra nếu item này match filter
        const itemMatches = matchesFilters(item);

        // Nếu item match hoặc có con match, giữ lại
        if (itemMatches || filteredChildren.length > 0) {
          return {
            ...item,
            children: filteredChildren,
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  // Filtered tree data (cho tree view)
  const treeKPIs = useMemo(() => {
    if (!selectedVisibility && !selectedCycle && !selectedUnit) return rawTreeKPIs;
    return filterTreeRecursive(rawTreeKPIs);
  }, [rawTreeKPIs, selectedVisibility, selectedCycle, selectedUnit]);

  // Filtered list data (cho search) - lọc theo filters và search query
  const filteredKPIs = useMemo(() => {
    if (!isSearchActive) return [];
    const query = searchQuery.toLowerCase();
    return rawListKPIs.filter((kpi) => {
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
  }, [rawListKPIs, searchQuery, isSearchActive, selectedVisibility, selectedCycle, selectedUnit]);

  // Toggle expand/collapse for a KPI
  const toggleExpand = (kpiId) => {
    setExpandedKPIs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(kpiId)) {
        newSet.delete(kpiId);
      } else {
        newSet.add(kpiId);
      }
      return newSet;
    });
  };

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
    rawListKPIs.forEach(kpi => {
      if (kpi.unit) {
        unitMap.set(kpi.unit.id, kpi.unit);
      }
    });
    return Array.from(unitMap.values());
  }, [rawListKPIs]);

  // Combine loading states
  const isLoading = isLoadingTree || (isSearchActive && isLoadingList);
  const kpiError = treeError;

  // Handle refresh
  const handleRefresh = () => {
    refetchTree();
  };

  // Handle edit
  const handleEdit = (kpi) => {
    setSelectedKPI(kpi);
    setIsEditModalOpen(true);
  };

  // Handle delete
  const handleDelete = (kpi) => {
    setSelectedKPI(kpi);
    setIsDeleteModalOpen(true);
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
          Tìm thấy <strong className="text-text">{filteredKPIs.length}</strong> kết quả cho "<strong className="text-text">{searchQuery}</strong>"
        </div>
      )}

      {/* KPIs List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <KPIItemSkeleton key={index} />
            ))}
          </div>
        ) : isSearchActive ? (
          // Search results in list mode
          filteredKPIs.length === 0 ? (
            <div className="bg-background rounded-xl border border-secondary/20 p-12 text-center">
              <BarChart3 size={48} className="mx-auto mb-4 opacity-50 text-secondary" />
              <p className="text-secondary">Không tìm thấy KPI nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredKPIs.map(kpi => (
                <KPIItem
                  key={kpi.id}
                  kpi={kpi}
                  expandedKPIs={expandedKPIs}
                  toggleExpand={toggleExpand}
                  isSearchMode={true}
                  onUpdate={handleRefresh}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )
        ) : (
          // Tree view (default)
          treeKPIs.length === 0 ? (
            <div className="bg-background rounded-xl border border-secondary/20 p-12 text-center">
              <BarChart3 size={48} className="mx-auto mb-4 opacity-50 text-secondary" />
              <p className="text-secondary">Chưa có KPI nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {treeKPIs.map(kpi => (
                <KPIItem
                  key={kpi.id}
                  kpi={kpi}
                  expandedKPIs={expandedKPIs}
                  toggleExpand={toggleExpand}
                  isSearchMode={false}
                  onUpdate={handleRefresh}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Create KPI Modal */}
      {isCreateModalOpen && (
        <CreateKPIModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleRefresh}
        />
      )}

      {/* Edit KPI Modal */}
      {isEditModalOpen && selectedKPI && (
        <CreateKPIModal
          kpi={selectedKPI}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedKPI(null);
          }}
          onSuccess={handleRefresh}
        />
      )}

      {/* Delete Confirm Modal */}
      {isDeleteModalOpen && selectedKPI && (
        <DeleteConfirmModal
          kpi={selectedKPI}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedKPI(null);
          }}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
};

export default KPIPage;
