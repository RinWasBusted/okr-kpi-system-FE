import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, Plus, AlertCircle, Target } from 'lucide-react';
import { getObjectives } from '../../../services/okr';
import { getCycles } from '../../../services/cycle.js';
import ObjectiveItem from './components/ObjectiveItem';
import ObjectiveItemSkeleton from './components/ObjectiveItemSkeleton';
import CreateObjectiveModal from './components/CreateObjectiveModal';

const OKRPage = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'hierarchy'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedObjectives, setExpandedObjectives] = useState(new Set());

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCycle, setSelectedCycle] = useState('');

  // Fetch objectives data
  const { data: objectivesResponse, isLoading: isLoadingObjectives, error: objectivesError, refetch: refetchObjectives } = useQuery({
    queryKey: ['objectives', selectedStatus, selectedCycle],
    queryFn: () => getObjectives({
      mode: 'tree',
      include_key_results: true,
      ...(selectedStatus && { status: selectedStatus }),
      ...(selectedCycle && { cycle_id: parseInt(selectedCycle) }),
      per_page: 100,
    }),
  });

  // Fetch cycles for filter
  const { data: cyclesResponse } = useQuery({
    queryKey: ['cycles', 'filter'],
    queryFn: () => getCycles({ per_page: 100 }),
  });

  const objectives = objectivesResponse?.data || [];
  const cycles = cyclesResponse?.data || [];

  // Auto-expand all objectives when loaded
  useEffect(() => {
    if (objectives.length > 0) {
      const allIds = objectives.map(o => o.id);
      setExpandedObjectives(new Set(allIds));
    }
  }, [objectives]);

  // Toggle expand/collapse
  const toggleExpand = (objectiveId) => {
    setExpandedObjectives(prev => {
      const newSet = new Set(prev);
      if (newSet.has(objectiveId)) {
        newSet.delete(objectiveId);
      } else {
        newSet.add(objectiveId);
      }
      return newSet;
    });
  };

  // Status options for filter
  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'Draft', label: 'Bản nháp' },
    { value: 'Active', label: 'Đang hoạt động' },
    { value: 'Pending_Approval', label: 'Chờ phê duyệt' },
    { value: 'Completed', label: 'Hoàn thành' },
  ];

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

      {/* View Toggle Tabs */}
      <div className="border-b border-secondary/20">
        <div className="flex gap-8">
          <button
            onClick={() => setViewMode('hierarchy')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              viewMode === 'hierarchy'
                ? 'text-primary border-b-2 border-primary'
                : 'text-secondary hover:text-text'
            }`}
          >
            Hierarchy View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              viewMode === 'list'
                ? 'text-primary border-b-2 border-primary'
                : 'text-secondary hover:text-text'
            }`}
          >
            Danh sách
          </button>
        </div>
      </div>

      {/* Filters */}
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

      {/* Objectives List */}
      <div className="space-y-4">
        {isLoadingObjectives ? (
          // Loading skeletons
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <ObjectiveItemSkeleton key={index} />
            ))}
          </div>
        ) : objectives.length === 0 ? (
          <div className="bg-background rounded-xl border border-secondary/20 p-12 text-center">
            <Target size={48} className="mx-auto mb-4 opacity-50 text-secondary" />
            <p className="text-secondary">Chưa có Objective nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {objectives.map(objective => (
              <ObjectiveItem
                key={objective.id}
                objective={objective}
                expandedObjectives={expandedObjectives}
                toggleExpand={toggleExpand}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Objective Modal */}
      {isCreateModalOpen && (
        <CreateObjectiveModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            refetchObjectives();
          }}
          cycles={cycles}
        />
      )}
    </div>
  );
};

export default OKRPage;
