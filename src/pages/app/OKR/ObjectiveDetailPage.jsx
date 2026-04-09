import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit, Trash2, Send, X, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getObjectiveById,
  deleteObjective,
  updateObjective,
  submitObjective,
  approveObjective,
  rejectObjective,
  revertObjectiveToDraft,
} from '../../../services/okr.js';
import ProgressSection from './components/ProgressSection';
import KeyResultsSection from './components/KeyResultsSection';
import ChildObjectivesSection from './components/ChildObjectivesSection';
import FeedbackSection from './components/FeedbackSection';
import { EditObjectiveModal } from './components/EditObjectiveModal';

// Status Badge Component
const StatusBadge = ({ status, progressStatus }) => {
  const getStatusConfig = () => {
    // First check objective status
    switch (status) {
      case 'Draft':
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Bản nháp' };
      case 'Active':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Đang hoạt động' };
      case 'Pending_Approval':
        return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Chờ phê duyệt' };
      case 'Rejected':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Từ chối' };
      case 'Completed':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Hoàn thành' };
      default:
        break;
    }

    // Fallback to progress status
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
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};


const ObjectiveDetailPage = () => {
  const { company_slug, objectiveId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionComment, setRejectionComment] = useState('');

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
  const status = objective.status;

  // Permission checks from API
  const canView = objective.permission?.view === true;
  const canEdit = objective.permission?.edit === true;
  const canDelete = objective.permission?.delete === true;
  const canSubmit = objective.permission?.submit === true;
  const canApprove = objective.permission?.approve === true;
  const canReject = objective.permission?.reject === true;

  // Redirect if no view permission
  useEffect(() => {
    if (!isLoading && objective.id && !canView) {
      toast.error('Bạn không có quyền xem Objective này');
      navigate(`/${company_slug}/app/okr`);
    }
  }, [isLoading, objective.id, canView, company_slug, navigate]);

  // Determine if objective is in editable state (Draft or Rejected)
  const isEditableStatus = status === 'Draft' || status === 'Rejected';

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

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: submitObjective,
    onSuccess: async () => {
      toast.success('Submit Objective thành công! Đang chờ phê duyệt.');
      // Refresh objective data to update status and permissions
      const updatedData = await getObjectiveById(objectiveId);
      queryClient.setQueryData(['objective', objectiveId], updatedData);
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi submit Objective');
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: () => approveObjective(objectiveId),
    onSuccess: async () => {
      toast.success('Phê duyệt Objective thành công!');
      // Refresh objective data to update status and permissions
      const updatedData = await getObjectiveById(objectiveId);
      queryClient.setQueryData(['objective', objectiveId], updatedData);
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi phê duyệt Objective');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: () => rejectObjective(objectiveId, { comment: rejectionComment }),
    onSuccess: async () => {
      toast.success('Từ chối Objective thành công!');
      setRejectionComment('');
      setIsRejectModalOpen(false);
      // Refresh objective data to update status and permissions
      const updatedData = await getObjectiveById(objectiveId);
      queryClient.setQueryData(['objective', objectiveId], updatedData);
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi từ chối Objective');
    },
  });

  // Revert to draft mutation
  const revertMutation = useMutation({
    mutationFn: () => revertObjectiveToDraft(objectiveId),
    onSuccess: async () => {
      toast.success('Trở lại bản nháp thành công!');
      // Refresh objective data to update status and permissions
      const updatedData = await getObjectiveById(objectiveId);
      queryClient.setQueryData(['objective', objectiveId], updatedData);
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi trở lại bản nháp');
    },
  });

  const handleEditClick = () => {
    // Edit button is only shown for Draft and Rejected statuses
    setIsEditModalOpen(true);
  };

  const handleSubmit = () => {
    if (window.confirm(`Bạn có chắc chắn muốn submit Objective "${objective.title}" để phê duyệt?`)) {
      submitMutation.mutate(objectiveId);
    }
  };

  const handleApprove = () => {
    if (window.confirm(`Bạn có chắc chắn muốn phê duyệt Objective "${objective.title}"?`)) {
      approveMutation.mutate();
    }
  };

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
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-text">{objective.title}</h1>
            <StatusBadge status={status} progressStatus={objective.progress_status} />
          </div>
          <p className="text-secondary">
            {objective.unit?.name}  {objective.owner?.full_name ? `• ${objective.owner.full_name}` : ''} • {objective.cycle?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Approve Button - Only for Pending_Approval status with approve permission */}
          {status === 'Pending_Approval' && canApprove && (
            <button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send size={18} />
              {approveMutation.isPending ? 'Đang phê duyệt...' : 'Phê duyệt'}
            </button>
          )}

          {/* Reject Button - Only for Pending_Approval status with reject permission */}
          {status === 'Pending_Approval' && canReject && (
            <button
              onClick={() => setIsRejectModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
            >
              <X size={18} />
              Từ chối
            </button>
          )}

          {/* Revert to Draft Button - Only for non-Draft/Rejected status with edit permission */}
          {status !== 'Draft' && status !== 'Rejected' && canEdit && (
            <button
              onClick={() => {
                if (window.confirm(`Bạn có chắc chắn muốn trở lại bản nháp cho Objective "${objective.title}"?`)) {
                  revertMutation.mutate();
                }
              }}
              disabled={revertMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/10 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {revertMutation.isPending ? 'Đang trở lại...' : 'Trở lại bản nháp'}
            </button>
          )}

          {/* Submit Button - Only for Draft or Rejected status with submit permission */}
          {(status === 'Draft' || status === 'Rejected') && canSubmit && (
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send size={18} />
              {submitMutation.isPending ? 'Đang submit...' : 'Submit'}
            </button>
          )}

          {/* Edit Button - Only for Draft or Rejected status with edit permission */}
          {isEditableStatus && canEdit && (
            <button
              onClick={handleEditClick}
              className="flex items-center gap-2 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/10 transition-colors cursor-pointer"
            >
              <Edit size={18} />
              Chỉnh sửa
            </button>
          )}

          {/* Delete Button - Only for Draft or Rejected status with delete permission */}
          {isEditableStatus && canDelete && (
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

      {/* Status Info Banner for Pending Approval */}
      {status === 'Pending_Approval' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-amber-600 shrink-0" />
          <div>
            <p className="font-medium text-amber-800">Objective đang chờ phê duyệt</p>
            <p className="text-sm text-amber-700">Bạn không thể chỉnh sửa Objective cho đến khi được phê duyệt hoặc từ chối.</p>
          </div>
        </div>
      )}

      {/* Status Info Banner for Rejected */}
      {status === 'Rejected' && objective.rejection_comment && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle size={20} className="text-red-600 shrink-0" />
            <p className="font-medium text-red-800">Objective bị từ chối</p>
          </div>
          <p className="text-sm text-red-700 ml-8">
            <span className="font-medium">Lý do:</span> {objective.rejection_comment}
          </p>
        </div>
      )}

      {/* Progress Section */}
      <ProgressSection objective={objective} />

      {/* Key Results Section */}
      <KeyResultsSection
        objectiveId={objectiveId}
        objectiveStatus={status}
        isEditableStatus={isEditableStatus}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      {/* Child Objectives Section */}
      <ChildObjectivesSection childObjectives={objective.sub_objectives} />

      {/* Feedback Section */}
      <FeedbackSection objectiveId={objectiveId} canEdit={canEdit} />

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditObjectiveModal
          objective={objective}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['objective', objectiveId] });
            queryClient.invalidateQueries({ queryKey: ['objectives'] });
          }}
        />
      )}

      {/* Reject Confirmation Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsRejectModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text">Từ chối Objective</h2>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="p-2 hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} className="text-secondary" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-secondary">
                Vui lòng nhập lý do từ chối cho Objective &quot;<strong>{objective.title}</strong>&quot;
              </p>
              <textarea
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-32"
              />
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/10 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isPending || !rejectionComment.trim()}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {rejectMutation.isPending ? 'Đang từ chối...' : 'Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text">Xác nhận xóa</h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-2 hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} className="text-secondary" />
              </button>
            </div>
            <p className="text-secondary mb-6">
              Bạn có chắc chắn muốn xóa Objective &quot;<strong>{objective.title}</strong>&quot;?
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
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer"
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
