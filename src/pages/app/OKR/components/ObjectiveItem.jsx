import { useState } from 'react';
import { ChevronDown, ChevronRight, Target, TrendingUp, Users } from 'lucide-react';
import KeyResultItem from './KeyResultItem';

// Status badge component
const StatusBadge = ({ status, progressStatus }) => {
  const getStatusConfig = () => {
    // First check progress_status
    switch (progressStatus) {
      case 'COMPLETED':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'completed' };
      case 'ON_TRACK':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'on-track' };
      case 'WARNING':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'at-risk' };
      case 'DANGER':
      case 'NOT_STARTED':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'at-risk' };
      default:
        break;
    }

    // Fallback to status
    switch (status) {
      case 'Draft':
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'draft' };
      case 'Active':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'active' };
      case 'Pending_Approval':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'pending' };
      case 'Completed':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'completed' };
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

// Child Objective Card
const ChildObjectiveCard = ({ objective }) => {
  const getProgressColor = (value) => {
    if (value >= 80) return 'bg-emerald-500';
    if (value >= 50) return 'bg-cyan-500';
    return 'bg-orange-400';
  };

  const progressColor = getProgressColor(objective.progress_percentage || 0);

  return (
    <div className="bg-sky-50 rounded-lg p-4 border border-sky-100">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
          <Target size={16} className="text-sky-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-text">{objective.title}</h4>
            <StatusBadge status={objective.status} progressStatus={objective.progress_status} />
          </div>
          <div className="flex items-center gap-4 text-xs text-secondary mb-3">
            <span>{objective.owner?.full_name || 'Chưa có owner'}</span>
            <span>•</span>
            <span>{objective.unit?.name || 'No Unit'}</span>
            <span>•</span>
            <span>{objective.cycle?.name || 'No Cycle'}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar percentage={objective.progress_percentage} color={progressColor} />
            </div>
            <span className="text-sm font-semibold text-text w-12 text-right">
              {objective.progress_percentage || 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ObjectiveItem = ({ objective, expandedObjectives, toggleExpand, viewMode }) => {
  const isExpanded = expandedObjectives.has(objective.id);
  const hasKeyResults = objective.key_results && objective.key_results.length > 0;
  const hasChildObjectives = objective.child_objectives && objective.child_objectives.length > 0;

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

  return (
    <div className={`bg-background rounded-xl border ${borderColor} overflow-hidden transition-all duration-200 hover:shadow-md`}>
      {/* Objective Header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Expand/Collapse Button */}
          <button
            onClick={() => toggleExpand(objective.id)}
            className="mt-1 p-1 rounded hover:bg-secondary/20 transition-colors cursor-pointer shrink-0"
          >
            {isExpanded ? (
              <ChevronDown size={18} className="text-secondary" />
            ) : (
              <ChevronRight size={18} className="text-secondary" />
            )}
          </button>

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

            <div className="flex items-center gap-2 text-sm text-secondary">
              <span>{objective.owner?.full_name || objective.unit?.name || 'No Owner'}</span>
              <span>•</span>
              <span>{objective.unit?.name || 'No Unit'}</span>
              <span>•</span>
              <span>{objective.cycle?.name || 'No Cycle'}</span>
            </div>
          </div>

          {/* Progress Section */}
          <div className="w-64 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-text">{objective.progress_percentage || 0}%</span>
              <span className="text-xs text-secondary">Progress</span>
            </div>
            <ProgressBar percentage={objective.progress_percentage} color={progressColor} />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-5 pb-5">
          {/* Key Results Section */}
          {(hasKeyResults || hasChildObjectives) && (
            <div className="mt-4">
              {/* Key Results */}
              {hasKeyResults && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={16} className="text-primary" />
                    <h4 className="font-semibold text-text">Key Results</h4>
                  </div>
                  <div className="space-y-3">
                    {objective.key_results.map((kr, index) => (
                      <KeyResultItem
                        key={kr.id || index}
                        keyResult={kr}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Child Objectives */}
              {hasChildObjectives && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={16} className="text-sky-600" />
                    <h4 className="font-semibold text-text">Child Objectives</h4>
                  </div>
                  <div className="space-y-3">
                    {objective.child_objectives.map((child) => (
                      <ChildObjectiveCard key={child.id} objective={child} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ObjectiveItem;
