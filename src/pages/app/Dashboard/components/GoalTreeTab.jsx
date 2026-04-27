import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Target } from 'lucide-react';
import { getObjectives } from '../../../../services/objective';
import OKRHierarchyView from '../../OKR/components/OKRHierarchyView';

const STATUS_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'ON_TRACK', label: 'Đúng hạn' },
  { key: 'AT_RISK', label: 'Rủi ro' },
  { key: 'CRITICAL', label: 'Chậm trễ' },
  { key: 'Pending_Approval', label: 'Chờ duyệt' },
  { key: 'Draft', label: 'Bản nháp' },
];

const GoalTreeTab = ({ cycleId }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const { data: treeData, isLoading } = useQuery({
    queryKey: ['objectives', 'goal-tree', cycleId],
    queryFn: () =>
      getObjectives({
        mode: 'tree',
        cycle_id: cycleId,
        include_key_results: false,
        per_page: 200,
      }).then((r) => r.data || []),
    enabled: !!cycleId,
  });

  const treeObjectives = treeData || [];

  // Filter logic: dim non-matching nodes instead of removing them
  const filteredObjectives = useMemo(() => {
    if (activeFilter === 'all') return treeObjectives;

    const matchesFilter = (obj) => {
      const s = obj.status?.toUpperCase();
      const ps = obj.progress_status?.toUpperCase();
      
      if (activeFilter === 'Pending_Approval') return s === 'PENDING_APPROVAL';
      if (activeFilter === 'Draft') return s === 'DRAFT';
      if (activeFilter === 'AT_RISK') return ps === 'AT_RISK' || ps === 'WARNING' || s === 'AT_RISK' || s === 'WARNING';
      if (activeFilter === 'CRITICAL') return ps === 'CRITICAL' || ps === 'DANGER' || ps === 'NOT_STARTED' || s === 'CRITICAL' || s === 'DANGER' || s === 'NOT_STARTED';
      return ps === activeFilter || s === activeFilter;
    };

    // Recursive function to determine if a node or any of its descendants match
    const processNodes = (nodes) =>
      nodes.map((node) => {
        const subObjectives = node.sub_objectives || [];
        const processedChildren = processNodes(subObjectives);
        
        const hasMatchingChild = processedChildren.some(child => !child._dimmed);
        const selfMatches = matchesFilter(node);

        return {
          ...node,
          _dimmed: !(selfMatches || hasMatchingChild),
          sub_objectives: processedChildren.length > 0 ? processedChildren : undefined,
        };
      });

    return processNodes(treeObjectives);
  }, [treeObjectives, activeFilter]);

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer ${
              activeFilter === filter.key
                ? 'bg-primary text-white border-primary'
                : 'bg-background text-secondary border-secondary/20 hover:border-primary/40 hover:text-text'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Tree */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96 bg-background rounded-xl border border-secondary/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : filteredObjectives.length === 0 ? (
        <div className="bg-background rounded-xl border border-secondary/20 p-12 text-center">
          <Target size={48} className="mx-auto mb-4 opacity-50 text-secondary" />
          <p className="text-secondary">Chưa có Objective nào trong chu kỳ này</p>
        </div>
      ) : (
        <OKRHierarchyView objectives={filteredObjectives} />
      )}
    </div>
  );
};

export default GoalTreeTab;
