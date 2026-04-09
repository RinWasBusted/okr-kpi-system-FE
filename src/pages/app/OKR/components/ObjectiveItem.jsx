import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Target, Edit, Trash2, ArrowUpRight, TrendingUp, Loader2 } from 'lucide-react';
import { getKeyResults } from '../../../../services/okr';
import { EditObjectiveModal, DeleteObjectiveConfirmModal } from './EditObjectiveModal';

// Status badge component
const StatusBadge = ({ status, progressStatus }) => {
  const getStatusConfig = () => {
    // First check objective status
    switch (status) {
      case 'Draft':
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Bản nháp' };
      case 'Active':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Hoạt động' };
      case 'Pending_Approval':
        return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Chờ duyệt' };
      case 'Rejected':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Từ chối' };
      case 'Completed':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Hoàn thành' };
      default:
        break;
    }

    // Fallback to progress_status
    switch (progressStatus) {
      case 'COMPLETED':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'completed' };
      case 'ON_TRACK':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'on-track' };
      case 'WARNING':
        return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'at-risk' };
      case 'DANGER':
      case 'NOT_STARTED':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'at-risk' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: status?.toLowerCase() || 'draft' };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Progress bar component
const ProgressBar = ({ percentage, color = 'bg-cyan-500' }) => (
  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
    <div
      className={`h-full ${color} rounded-full transition-all duration-300`}
      style={{ width: `${Math.min(percentage || 0, 100)}%` }}
    />
  </div>
);

// Cycle tooltip component
const CycleTooltip = ({ cycle }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!cycle) return <span className="text-secondary">No Cycle</span>;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <span
      className="relative inline-block cursor-help"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="text-secondary hover:text-text transition-colors border-b border-dotted border-secondary">
        {cycle.name}
      </span>
      {showTooltip && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-lg">
          <div className="font-medium">{cycle.name}</div>
          <div className="text-gray-300 mt-1">
            {formatDate(cycle.start_date)} - {formatDate(cycle.end_date)}
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800" />
        </div>
      )}
    </span>
  );
};

// Key Result Item - compact display
const KeyResultItem = ({ kr }) => {
  const progress = kr.progress_percentage || 0;

  const getProgressColor = (value) => {
    if (value >= 80) return 'bg-emerald-500';
    if (value >= 50) return 'bg-cyan-500';
    if (value >= 30) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <div className="py-3 border-b border-secondary/10 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text truncate" title={kr.title}>
            {kr.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-50">
              <div
                className={`h-full ${getProgressColor(progress)} rounded-full`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-secondary">
              {progress}%
            </span>          </div>
        </div>
        <div className="text-xs text-secondary ml-4 shrink-0">
          <span className="font-medium">{kr.current_value}</span>
          <span className="mx-1">/</span>
          <span>{kr.target_value} {kr.unit}</span>
        </div>
      </div>
    </div>
  );
};

// Key Results Section
const KeyResultsSection = ({ objectiveId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();
  const [hasPrefetched, setHasPrefetched] = useState(false);

  // Prefetch on hover
  const handleMouseEnter = useCallback(() => {
    if (!hasPrefetched) {
      queryClient.prefetchQuery({
        queryKey: ['keyResults', objectiveId],
        queryFn: () => getKeyResults(objectiveId, { per_page: 100 }),
        staleTime: 5 * 60 * 1000,
      });
      setHasPrefetched(true);
    }
  }, [queryClient, objectiveId, hasPrefetched]);

  const { data: keyResultsData, isLoading } = useQuery({
    queryKey: ['keyResults', objectiveId],
    queryFn: () => getKeyResults(objectiveId, { per_page: 100 }),
    enabled: isExpanded,
    staleTime: 5 * 60 * 1000,
  });

  const keyResults = keyResultsData?.data || [];

  return (
    <div className="mt-4 pt-4 border-t border-secondary/10" >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="flex items-center gap-2 text-sm font-medium text-text hover:text-primary transition-colors cursor-pointer"
        onMouseEnter={handleMouseEnter}
      >
        <TrendingUp size={16} className="text-primary" />
        <span>Các Key Results</span>
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {isExpanded && (
        <div className="mt-3 pl-4 border-l-2 border-primary/20">
          {isLoading ? (
            <div className="flex items-center gap-2 py-4 text-secondary">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Đang tải...</span>
            </div>
          ) : keyResults.length === 0 ? (
            <p className="py-4 text-sm text-secondary">Chưa có key result nào</p>
          ) : (
            <div className="bg-secondary/5 rounded-lg px-4">
              {keyResults.map((kr) => (
                <KeyResultItem key={kr.id} kr={kr} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Recursive Objective Item Component
const ObjectiveItem = ({ objective, level = 0, onUpdate }) => {
  const navigate = useNavigate();
  const subObjectives = objective.sub_objectives || [];
  const hasChildren = subObjectives.length > 0;
  const [isExpanded, setIsExpanded] = useState(hasChildren);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Check permissions from API
  const canView = objective.permission?.view === true;
  const canEdit = objective.permission?.edit === true;
  const canDelete = objective.permission?.delete === true;
  const canSubmit = objective.permission?.submit === true;
  const canApprove = objective.permission?.approve === true;
  const canReject = objective.permission?.reject === true;
  
  // Check if status is editable (Draft or Rejected)
  const isEditableStatus = objective.status === 'Draft' || objective.status === 'Rejected';
  
  const hasActions = canEdit || canDelete || canView;

  const getProgressColor = (value) => {
    if (value >= 80) return 'bg-cyan-500';
    if (value >= 50) return 'bg-cyan-400';
    return 'bg-orange-400';
  };

  const getBorderColor = () => {
    if (objective.progress_status === 'DANGER' || objective.progress_status === 'NOT_STARTED') {
      return 'border-red-200';
    }
    if (objective.progress_status === 'WARNING') {
      return 'border-orange-200';
    }
    return 'border-secondary/20';
  };

  const progressColor = getProgressColor(objective.progress_percentage || 0);
  const borderColor = getBorderColor();
  const indentPadding = level * 24;

  return (
    <>
      <div className="w-full">
        {/* Objective Row Container */}
        <div
          className={`relative rounded-xl transition-all duration-200 ${level > 0 ? 'mt-2' : ''}`}
          style={{ marginLeft: `${indentPadding}px` }}
        >
          {/* Main Card */}
          <div
            className={`bg-background rounded-xl border ${borderColor} hover:shadow-md transition-shadow cursor-pointer`}
            onClick={() => navigate(`./${objective.id}`)}
          >
            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* Expand/Collapse Button */}
                <div className="w-6 shrink-0">
                  {hasChildren ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                      }}
                      className="mt-1 p-1 rounded hover:bg-secondary/20 transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown size={18} className="text-secondary" />
                      ) : (
                        <ChevronRight size={18} className="text-secondary" />
                      )}
                    </button>
                  ) : (
                    <span className="w-6" />
                  )}
                </div>

                {/* Objective Icon */}
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Target size={20} className="text-primary" />
                </div>

                {/* Objective Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-text text-lg">{objective.title}</h3>
                    <StatusBadge status={objective.status} progressStatus={objective.progress_status} />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-secondary flex-wrap">
                    <span>{objective.unit?.name || 'No Unit'}</span>
                    {objective.owner && (
                      <>
                        <span>•</span>
                        <span className="text-text">
                          Phân công: {objective.owner.full_name}
                          {objective.owner.job_title && ` (${objective.owner.job_title})`}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <CycleTooltip cycle={objective.cycle} />
                  </div>
                </div>

                {/* Progress Section */}
                <div className="w-64 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-text">{objective.progress_percentage || 0}%</span>
                    <span className="text-xs text-secondary">Tiến độ</span>
                  </div>
                  <ProgressBar percentage={objective.progress_percentage} color={progressColor} />
                </div>

                {/* Action Buttons */}
                {hasActions && (
                  <div className="flex items-center gap-2 border-l border-secondary/20 pl-4 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`./${objective.id}`);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                      title="Xem chi tiết"
                    >
                      Chi tiết
                      <ArrowUpRight size={14} />
                    </button>
                    {canEdit && isEditableStatus && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 text-secondary hover:text-primary hover:bg-orange-100 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>
                    )}
                    {canDelete && isEditableStatus && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Key Results Section */}
              <KeyResultsSection objectiveId={objective.id} />
            </div>
          </div>
        </div>

        {/* Children - Recursive rendering */}
        {hasChildren && isExpanded && (
          <div className="relative mt-2">
            {subObjectives.map((child) => (
              <ObjectiveItem
                key={child.id}
                objective={child}
                level={level + 1}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditObjectiveModal
          objective={objective}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={onUpdate}
        />
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <DeleteObjectiveConfirmModal
          objective={objective}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={onUpdate}
        />
      )}
    </>
  );
};

export default ObjectiveItem;
