import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, Plus, AlertCircle, Target, Search } from 'lucide-react';
import { getObjectives } from '../../../services/okr';
import { getCycles } from '../../../services/cycle.js';
import ObjectiveItem from './components/ObjectiveItem';
import ObjectiveItemSkeleton from './components/ObjectiveItemSkeleton';
import CreateObjectiveModal from './components/CreateObjectiveModal';

const OKRPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCycle, setSelectedCycle] = useState('');

  // Fetch objectives data in tree mode (for display) - lấy tất cả, không filter
  const {
    data: treeResponse,
    isLoading: isLoadingTree,
    error: treeError,
    refetch: refetchTree
  } = useQuery({
    queryKey: ['objectives', 'tree'],
    queryFn: () => getObjectives({
      mode: 'tree',
      include_key_results: false,
      per_page: 100,
    }),
  });

  // Fetch objectives data in list mode (for search/filter - background) - lấy tất cả
  const {
    data: listResponse,
    isLoading: isLoadingList,
  } = useQuery({
    queryKey: ['objectives', 'list'],
    queryFn: () => getObjectives({
      mode: 'list',
      include_key_results: false,
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

  const rawTreeObjectives = treeResponse?.data || [];
  const rawListObjectives = listResponse?.data || [];
  const cycles = cyclesResponse?.data || [];

  // Determine if we should show search results
  const isSearchActive = searchQuery.trim().length > 0;

  // Helper: Filter objective by status and cycle
  const matchesFilters = (obj) => {
    const matchesStatus = !selectedStatus || obj.status === selectedStatus;
    // Check cả cycle_id trực tiếp và cycle?.id
    const objCycleId = obj.cycle_id || obj.cycle?.id;
    const matchesCycle = !selectedCycle || objCycleId === parseInt(selectedCycle);
    return matchesStatus && matchesCycle;
  };

  // Helper: Recursively filter tree (giữ lại parent nếu có child match)
  const filterTreeRecursive = (items) => {
    return items
      .map((item) => {
        // Lọc sub_objectives đệ quy
        const filteredSubObjectives = item.sub_objectives
          ? filterTreeRecursive(item.sub_objectives)
          : [];

        // Kiểm tra nếu item này match filter
        const itemMatches = matchesFilters(item);

        // Nếu item match hoặc có con match, giữ lại
        if (itemMatches || filteredSubObjectives.length > 0) {
          return {
            ...item,
            sub_objectives: filteredSubObjectives,
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  // Filtered tree data (cho tree view)
  const treeObjectives = useMemo(() => {
    if (!selectedStatus && !selectedCycle) return rawTreeObjectives;
    return filterTreeRecursive(rawTreeObjectives);
  }, [rawTreeObjectives, selectedStatus, selectedCycle]);

  // Filtered list data (cho search) - lọc theo status, cycle, và search query
  const filteredObjectives = useMemo(() => {
    if (!isSearchActive) return [];
    const query = searchQuery.toLowerCase();
    return rawListObjectives.filter((obj) => {
      // Lọc theo status và cycle trước
      if (!matchesFilters(obj)) return false;
      // Lọc theo search query
      return (
        obj.title?.toLowerCase().includes(query) ||
        obj.description?.toLowerCase().includes(query) ||
        obj.unit?.name?.toLowerCase().includes(query) ||
        obj.owner?.full_name?.toLowerCase().includes(query)
      );
    });
  }, [rawListObjectives, searchQuery, isSearchActive, selectedStatus, selectedCycle]);

  // Status options for filter
  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'Draft', label: 'Bản nháp' },
    { value: 'Active', label: 'Đang hoạt động' },
    { value: 'Pending_Approval', label: 'Chờ phê duyệt' },
    { value: 'Completed', label: 'Hoàn thành' },
  ];

  // Combine loading states
  const isLoading = isLoadingTree || (isSearchActive && isLoadingList);
  const objectivesError = treeError;

  // Refresh data
  const handleRefresh = () => {
    refetchTree();
  };

  if (objectivesError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-red-600" />
            <div>
              <p className="text-red-800 font-semibold">Lỗi khi tải dữ liệu OKR</p>
              <p className="text-red-600 text-sm mt-1">{objectivesError.message}</p>
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
          <h1 className="text-2xl font-bold text-text mb-1">Company OKRs</h1>
          <p className="text-secondary text-sm">Quản lý OKR của công ty</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
        >
          <Plus size={18} />
          Tạo Objective
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
              placeholder="Tìm kiếm theo tên, mô tả, đơn vị, người sở hữu..."
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
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border border-secondary/20 bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              {statusOptions.map(option => (
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
        </div>
      </div>

      {/* Search Results Indicator */}
      {isSearchActive && (
        <div className="text-sm text-secondary">
          Tìm thấy <strong className="text-text">{filteredObjectives.length}</strong> kết quả cho "<strong className="text-text">{searchQuery}</strong>"
        </div>
      )}

      {/* Objectives List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <ObjectiveItemSkeleton key={index} />
            ))}
          </div>
        ) : isSearchActive ? (
          // Search results in list mode
          filteredObjectives.length === 0 ? (
            <div className="bg-background rounded-xl border border-secondary/20 p-12 text-center">
              <Target size={48} className="mx-auto mb-4 opacity-50 text-secondary" />
              <p className="text-secondary">Không tìm thấy Objective nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredObjectives.map(objective => (
                <ObjectiveItem
                  key={objective.id}
                  objective={objective}
                  onUpdate={handleRefresh}
                />
              ))}
            </div>
          )
        ) : (
          // Tree view (default)
          treeObjectives.length === 0 ? (
            <div className="bg-background rounded-xl border border-secondary/20 p-12 text-center">
              <Target size={48} className="mx-auto mb-4 opacity-50 text-secondary" />
              <p className="text-secondary">Chưa có Objective nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {treeObjectives.map(objective => (
                <ObjectiveItem
                  key={objective.id}
                  objective={objective}
                  onUpdate={handleRefresh}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Create Objective Modal */}
      {isCreateModalOpen && (
        <CreateObjectiveModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            refetchTree();
          }}
          cycles={cycles}
        />
      )}
    </div>
  );
};

export default OKRPage;
