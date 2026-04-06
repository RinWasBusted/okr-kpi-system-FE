import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getObjectiveById, deleteObjective } from '../../../services/okr.js';
import ProgressSection from './components/ProgressSection';
import KeyResultsSection from './components/KeyResultsSection';
import ChildObjectivesSection from './components/ChildObjectivesSection';
import FeedbackSection from './components/FeedbackSection';
import { EditObjectiveModal } from './components/EditObjectiveModal';

const ObjectiveDetailPage = () => {
  const { company_slug, objectiveId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Helper: Find objective in cache (from OKRPage tree data)
  const findObjectiveInCache = () => {
    // Check tree data cache
    const treeData = queryClient.getQueryData(['objectives', 'tree']);
    if (treeData?.data) {
      const findInTree = (items) => {
        for (const item of items) {
          if (item.id === parseInt(objectiveId)) return item;
          if (item.sub_objectives?.length) {
            const found = findInTree(item.sub_objectives);
            if (found) return found;
          }
        }
        return null;
      };
      const found = findInTree(treeData.data);
      if (found) return found;
    }

    // Check list data cache
    const listData = queryClient.getQueryData(['objectives', 'list']);
    if (listData?.data) {
      const found = listData.data.find(o => o.id === parseInt(objectiveId));
      if (found) return found;
    }

    return null;
  };

  // Get initial data from cache
  const cachedObjective = findObjectiveInCache();

  // Fetch objective detail (only if not in cache)
  const { data: objectiveResponse, isLoading, error } = useQuery({
    queryKey: ['objective', objectiveId],
    queryFn: () => getObjectiveById(objectiveId),
    enabled: !!objectiveId && !cachedObjective,
    initialData: cachedObjective ? { data: { objective: cachedObjective }, success: true } : undefined,
  });

  const objective = objectiveResponse?.data?.objective || cachedObjective || {};
  const canEdit = objective.permission?.editable === true;
  const canDelete = objective.permission?.deletable === true;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteObjective,
    onSuccess: () => {
      toast.success('Xóa Objective thành công!');
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      navigate(`/${company_slug}/app/okr`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi xóa Objective');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-800 font-semibold">Lỗi khi tải dữ liệu Objective</p>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to={`/${company_slug}/app/okr`}
        className="inline-flex items-center gap-2 text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft size={18} />
        Quay lại danh sách OKR
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">{objective.title}</h1>
          <p className="text-secondary mt-1">
            {objective.unit?.name} • {objective.owner?.full_name} • {objective.cycle?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/10 transition-colors cursor-pointer"
            >
              <Edit size={18} />
              Chỉnh sửa
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
            >
              <Trash2 size={18} />
              Xóa
            </button>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <ProgressSection objective={objective} />

      {/* Key Results Section */}
      <KeyResultsSection objectiveId={objectiveId} />

      {/* Child Objectives Section */}
      <ChildObjectivesSection childObjectives={objective.sub_objectives} />

      {/* Feedback Section */}
      <FeedbackSection objectiveId={objectiveId} />

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditObjectiveModal
          objective={objective}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['objective', objectiveId] });
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Xác nhận xóa</h2>
            <p className="text-secondary mb-6">
              Bạn có chắc chắn muốn xóa Objective "<strong>{objective.title}</strong>"?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/10 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => deleteMutation.mutate(objectiveId)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ObjectiveDetailPage;
