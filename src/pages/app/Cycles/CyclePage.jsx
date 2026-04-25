import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, AlertCircle, Calendar, Search } from 'lucide-react';
import { getCycles } from '../../../services/cycle';
import CycleItem from './components/CycleItem';
import CycleItemSkeleton from './components/CycleItemSkeleton';
import AddCycleModal from './components/AddCycleModal';

const CyclePage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'open', 'closed'

  // Fetch cycles data
  const { data: cyclesResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['cycles'],
    queryFn: () => getCycles({ per_page: 100 }),
  });

  const cycles = cyclesResponse?.data || [];

  // Filter cycles on FE side
  const filteredCycles = useMemo(() => {
    return cycles.filter((cycle) => {
      // Filter by search query (name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        if (!cycle.name.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Filter by status
      if (statusFilter !== 'all') {
        const isOpen = !cycle.is_locked;
        if (statusFilter === 'open' && !isOpen) return false;
        if (statusFilter === 'closed' && isOpen) return false;
      }

      // Filter by start date
      if (startDate) {
        const cycleStart = new Date(cycle.start_date);
        const filterStart = new Date(startDate);
        if (cycleStart < filterStart) return false;
      }

      // Filter by end date
      if (endDate) {
        const cycleEnd = new Date(cycle.end_date);
        const filterEnd = new Date(endDate);
        if (cycleEnd > filterEnd) return false;
      }

      return true;
    });
  }, [cycles, searchQuery, statusFilter, startDate, endDate]);

  // Calculate stats from open cycles only
  const stats = useMemo(() => {
    const openCycles = cycles.filter((c) => !c.is_locked);
    const openCyclesCount = openCycles.length;

    // Calculate total objectives and KPIs from open cycles
    let totalObjectives = 0;
    let totalKpis = 0;

    openCycles.forEach((cycle) => {
      const stats = cycle.statistics || {};
      totalObjectives += stats.total_objectives || 0;
      totalKpis += stats.total_kpis || 0;
    });

    return {
      openCyclesCount,
      totalObjectives,
      totalKpis,
    };
  }, [cycles]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('all');
  };

  // Check if any filter is active
  const hasActiveFilters = searchQuery || startDate || endDate || statusFilter !== 'all';

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-red-600" />
            <div>
              <p className="text-text font-semibold">Lỗi khi tải dữ liệu chu kỳ</p>
              <p className="text-secondary text-sm mt-1">{error.message}</p>
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
          <h1 className="text-2xl font-bold text-text mb-1">Chu kỳ</h1>
          <p className="text-secondary text-sm">Quản lý chu kỳ OKR và KPI</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Plus size={18} />
          Tạo chu kỳ
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-background rounded-xl border border-secondary/20 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search by name */}
          <div className="flex-1">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên chu kỳ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border text-text border-secondary/20 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Status filter */}
          <div className="w-full md:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-background cursor-pointer"
            >
              <option value="all" className="text-text">Tất cả trạng thái</option>
              <option value="open" className="text-text">Đang mở</option>
              <option value="closed" className="text-text">Đã đóng</option>
            </select>
          </div>

          {/* Date range filters */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              placeholder="Từ ngày"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-secondary/20 rounded-lg text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <span className="text-secondary">-</span>
            <input
              type="date"
              placeholder="Đến ngày"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-secondary/20 rounded-lg text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-secondary hover:text-text border border-secondary/20 rounded-lg hover:bg-secondary/5 transition-colors cursor-pointer whitespace-nowrap"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Cycles List */}
      <div className="bg-background rounded-xl border border-secondary/20 overflow-hidden">
        {/* List Header with Stats */}
        <div className="px-4 py-3 border-b border-secondary/20 bg-secondary/5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-text">Danh sách chu kỳ</span>
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="animate-pulse w-16 h-4 bg-secondary/20 rounded" />
                <div className="animate-pulse w-16 h-4 bg-secondary/20 rounded" />
                <div className="animate-pulse w-16 h-4 bg-secondary/20 rounded" />
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm">
                <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full font-bold uppercase text-[10px] tracking-wider">
                  {stats.openCyclesCount} ĐANG MỞ
                </span>
                <span className="text-secondary">
                  {stats.totalObjectives} Objectives
                </span>
                <span className="text-secondary">
                  {stats.totalKpis} KPIs
                </span>
              </div>
            )}
          </div>
          <span className="text-sm text-secondary">
            {filteredCycles.length} / {cycles.length} chu kỳ
          </span>
        </div>

        {isLoading ? (
          // Loading skeletons
          <div className="p-4 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <CycleItemSkeleton key={index} />
            ))}
          </div>
        ) : filteredCycles.length === 0 ? (
          <div className="text-center py-12 text-secondary">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>{hasActiveFilters ? 'Không tìm thấy chu kỳ phù hợp' : 'Chưa có chu kỳ nào'}</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-primary hover:underline cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {filteredCycles.map((cycle) => (
              <CycleItem key={cycle.id} cycle={cycle} onRefetch={refetch} />
            ))}
          </div>
        )}
      </div>

      {/* Add Cycle Modal */}
      {isAddModalOpen && (
        <AddCycleModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default CyclePage;
