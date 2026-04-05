import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getKeyResults, deleteKeyResult } from '../../../../services/okr.js';
import CreateKeyResultModal from './CreateKeyResultModal.jsx';

const KeyResultItem = ({ keyResult, onEdit, onDelete }) => {
  const progress = keyResult.progress_percentage || Math.round((keyResult.current_value / keyResult.target_value) * 100) || 0;

  const getProgressColor = (value) => {
    if (value >= 80) return 'bg-emerald-500';
    if (value >= 50) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'ON_TRACK':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'on-track' };
      case 'WARNING':
        return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'at-risk' };
      case 'DANGER':
      case 'NOT_STARTED':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'at-risk' };
      default:
        return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'at-risk' };
    }
  };

  const progressColor = getProgressColor(progress);
  const statusConfig = getStatusBadge(keyResult.progress_status);

  return (
    <div className="border border-secondary/20 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Color dot */}
        <div className={`w-3 h-3 rounded-full ${progressColor} mt-2 shrink-0`} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-text">{keyResult.title}</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
              {statusConfig.label}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-primary">
              Weight: {keyResult.weight || 33.33}%
            </span>
          </div>

          <p className="text-xs text-secondary mb-3">
            Owner: {keyResult.owner?.full_name || 'Chưa gán'}
          </p>

          {/* Progress bar */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full ${progressColor} rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Values */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-secondary">Bắt đầu: <span className="font-medium text-text">{keyResult.start_value || 0}{keyResult.unit}</span></span>
            <span className="text-secondary">→</span>
            <span className="text-secondary">Hiện tại: <span className={`font-medium ${progress >= 50 ? 'text-cyan-600' : 'text-orange-600'}`}>{keyResult.current_value}{keyResult.unit}</span></span>
            <span className="text-secondary">→</span>
            <span className="text-secondary">Mục tiêu: <span className="font-medium text-emerald-600">{keyResult.target_value}{keyResult.unit}</span></span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-bold text-text mr-4">{progress}%</span>
          {keyResult.permission?.editable !== false && (
            <button
              onClick={() => onEdit(keyResult)}
              className="p-2 text-secondary hover:text-primary hover:bg-orange-100 rounded-lg transition-colors cursor-pointer"
            >
              <Edit size={16} />
            </button>
          )}
          {keyResult.permission?.deletable !== false && (
            <button
              onClick={() => onDelete(keyResult)}
              className="p-2 text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const KeyResultsSection = ({ objectiveId }) => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [, setEditingKeyResult] = useState(null);

  // Fetch key results
  const { data: keyResultsResponse, isLoading } = useQuery({
    queryKey: ['keyResults', objectiveId],
    queryFn: () => getKeyResults(objectiveId, { per_page: 100 }),
    enabled: !!objectiveId,
  });

  const keyResults = keyResultsResponse?.data || [];

  const totalWeight = keyResults.reduce((sum, kr) => sum + (kr.weight || 0), 0);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteKeyResult,
    onSuccess: () => {
      toast.success('Xóa Key Result thành công!');
      queryClient.invalidateQueries({ queryKey: ['keyResults', objectiveId] });
      queryClient.invalidateQueries({ queryKey: ['objective', objectiveId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa Key Result');
    },
  });

  const handleEdit = (keyResult) => {
    setEditingKeyResult(keyResult);
  };

  const handleDelete = (keyResult) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa Key Result "${keyResult.title}"?`)) {
      deleteMutation.mutate(keyResult.id);
    }
  };

  return (
    <div className="bg-background rounded-xl border border-secondary/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text">Key Results</h3>
          <p className="text-sm text-secondary mt-1">
            Tổng trọng số: <span className="font-semibold text-emerald-600">{totalWeight.toFixed(0)}%</span>
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Plus size={18} />
          Thêm Key Result
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : keyResults.length === 0 ? (
          <div className="text-center py-8 text-secondary">
            <p>Chưa có Key Result nào</p>
          </div>
        ) : (
          keyResults.map((keyResult) => (
            <KeyResultItem
              key={keyResult.id}
              keyResult={keyResult}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Create Key Result Modal */}
      {isCreateModalOpen && (
        <CreateKeyResultModal
          objectiveId={objectiveId}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['keyResults', objectiveId] });
            queryClient.invalidateQueries({ queryKey: ['objective', objectiveId] });
          }}
        />
      )}
    </div>
  );
};

export default KeyResultsSection;
