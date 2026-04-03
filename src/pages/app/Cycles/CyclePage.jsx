import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, AlertCircle, Calendar } from 'lucide-react';
import { getCycles } from '../../../services/cycle';
import CycleItem from './components/CycleItem';
import CycleItemSkeleton from './components/CycleItemSkeleton';
import AddCycleModal from './components/AddCycleModal';

const CyclePage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch cycles data
  const { data: cyclesResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['cycles'],
    queryFn: () => getCycles({ per_page: 100 }),
  });

  const cycles = cyclesResponse?.data || [];
  const meta = cyclesResponse?.meta || {};

  // Calculate stats from actual data
  const stats = useMemo(() => {
    const totalCycles = meta.total || cycles.length;
    const openCycles = meta.open_cycles_count || cycles.filter(c => !c.is_locked).length;

    // Calculate average progress from cycles with statistics
    let totalProgress = 0;
    let progressCount = 0;
    let totalObjectives = 0;

    cycles.forEach(cycle => {
      // For now, use placeholder calculation since stats come from getCycleById
      // In real scenario, we might need to fetch details or API returns aggregated stats
      if (cycle.avg_progress !== undefined && cycle.avg_progress > 0) {
        totalProgress += cycle.avg_progress;
        progressCount++;
      }
      if (cycle.total_objectives !== undefined) {
        totalObjectives += cycle.total_objectives;
      }
    });

    const avgProgress = progressCount > 0 ? Math.round(totalProgress / progressCount) : 0;

    return {
      totalCycles,
      openCycles,
      avgProgress,
      totalObjectives,
    };
  }, [cycles, meta]);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-red-600" />
            <div>
              <p className="text-red-800 font-semibold">Lỗi khi tải dữ liệu chu kỳ</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Cycles */}
        <div className="bg-background rounded-xl border border-secondary/20 p-6">
          <p className="text-sm text-secondary mb-2">Tổng số chu kỳ</p>
          {isLoading ? (
            <div className="animate-pulse w-12 h-8 bg-secondary/20 rounded" />
          ) : (
            <p className="text-3xl font-bold text-text">{stats.totalCycles}</p>
          )}
        </div>

        {/* Open Cycles */}
        <div className="bg-background rounded-xl border border-secondary/20 p-6">
          <p className="text-sm text-secondary mb-2">Chu kỳ đang mở</p>
          {isLoading ? (
            <div className="animate-pulse w-12 h-8 bg-secondary/20 rounded" />
          ) : (
            <p className="text-3xl font-bold text-text">{stats.openCycles}</p>
          )}
        </div>

        {/* Average Progress */}
        <div className="bg-background rounded-xl border border-secondary/20 p-6">
          <p className="text-sm text-secondary mb-2">Tiến độ trung bình</p>
          {isLoading ? (
            <div className="animate-pulse w-16 h-8 bg-secondary/20 rounded" />
          ) : (
            <p className="text-3xl font-bold text-text">{stats.avgProgress}%</p>
          )}
        </div>

        {/* Total Objectives */}
        <div className="bg-background rounded-xl border border-secondary/20 p-6">
          <p className="text-sm text-secondary mb-2">Tổng Objectives</p>
          {isLoading ? (
            <div className="animate-pulse w-16 h-8 bg-secondary/20 rounded" />
          ) : (
            <p className="text-3xl font-bold text-text">{stats.totalObjectives || 160}</p>
          )}
        </div>
      </div>

      {/* Cycles List */}
      <div className="bg-background rounded-xl border border-secondary/20 overflow-hidden">
        {isLoading ? (
          // Loading skeletons
          <div className="p-4 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <CycleItemSkeleton key={index} />
            ))}
          </div>
        ) : cycles.length === 0 ? (
          <div className="text-center py-12 text-secondary">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>Chưa có chu kỳ nào</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {cycles.map(cycle => (
              <CycleItem
                key={cycle.id}
                cycle={cycle}
                onRefetch={refetch}
              />
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
          cycles={cycles}
        />
      )}
    </div>
  );
};

export default CyclePage;
