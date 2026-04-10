import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, MessageCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { listFeedbacks, createFeedback, deleteFeedback, listReplies, createReply } from '../../../../services/feedback.js';

// Helper to format date
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Get badge config based on type
const getFeedbackBadge = (type) => {
  const configs = {
    'PRAISE': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Khen ngợi' },
    'CONCERN': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Lo ngại' },
    'SUGGESTION': { bg: 'bg-sky-100', text: 'text-sky-700', label: 'Đề xuất' },
    'QUESTION': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Câu hỏi' },
    'BLOCKER': { bg: 'bg-red-100', text: 'text-red-700', label: 'Chặn' },
    'RESOLVED': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Đã giải quyết' },
    'APPROVED': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Đã duyệt' },
    'UNAPPROVED': { bg: 'bg-red-100', text: 'text-red-700', label: 'Chưa duyệt' },
  };
  return configs[type] || configs['CONCERN'];
};

// Reply Item Component
const ReplyItem = ({ reply, onDelete, currentUserId }) => {
  const badgeConfig = getFeedbackBadge(reply.type);
  const isAuthor = reply.user_id === currentUserId;

  return (
    <div className="flex gap-3 ml-12">
      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
        <span className="text-primary font-semibold text-sm">
          {reply.user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-text">{reply.user?.full_name || 'Unknown'}</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
            {reply.user?.role || 'Employee'}
          </span>
          <span className="text-xs text-secondary">• {formatDate(reply.created_at)}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeConfig.bg} ${badgeConfig.text}`}>
            {badgeConfig.label}
          </span>
        </div>
        <p className="text-text">{reply.content}</p>
        {isAuthor && (
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => onDelete(reply.id)}
              className="p-1.5 text-secondary hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Feedback Item Component
const FeedbackItem = ({ feedback, objectiveId, onDelete, currentUserId, canEdit }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const queryClient = useQueryClient();

  const badgeConfig = getFeedbackBadge(feedback.type);
  const isAuthor = feedback.user_id === currentUserId;

  // Fetch replies
  const { data: repliesResponse } = useQuery({
    queryKey: ['feedbackReplies', feedback.id],
    queryFn: () => listReplies(feedback.id),
    enabled: showReplies,
  });

  const repliesList = repliesResponse?.data || [];

  // Create reply mutation
  const replyMutation = useMutation({
    mutationFn: () => createReply(feedback.id, { content: replyContent, type: 'SUGGESTION' }),
    onSuccess: () => {
      toast.success('Đã gửi phản hồi!');
      setReplyContent('');
      setShowReply(false);
      queryClient.invalidateQueries({ queryKey: ['feedbackReplies', feedback.id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Có lỗi xảy ra');
    },
  });

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    replyMutation.mutate();
  };

  return (
    <div className="space-y-4">
      {/* Main feedback */}
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
          <span className="text-sky-600 font-semibold">
            {feedback.user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-text">{feedback.user?.full_name || 'Unknown'}</span>
            <span className="text-xs text-secondary">• {formatDate(feedback.created_at)}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeConfig.bg} ${badgeConfig.text}`}>
              {badgeConfig.label}
            </span>
          </div>
          <p className="text-text">{feedback.content}</p>

          <div className="flex items-center gap-2 mt-2">
            {canEdit && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="text-xs text-secondary hover:text-primary flex items-center gap-1 cursor-pointer"
              >
                <MessageCircle size={14} />
                Reply
              </button>
            )}
            {isAuthor && (
              <>
                <button
                  onClick={() => onDelete(feedback.id)}
                  className="p-1.5 text-secondary hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>

          {/* Reply form */}
          {showReply && (
            <form onSubmit={handleSubmitReply} className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Viết phản hồi..."
                className="flex-1 px-3 py-2 rounded-lg border border-secondary/20 bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                type="submit"
                disabled={replyMutation.isPending || !replyContent.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {replyMutation.isPending ? 'Đang gửi...' : 'Gửi'}
              </button>
            </form>
          )}

          {/* View replies button */}
          {repliesList.length > 0 && !showReplies && (
            <button
              onClick={() => setShowReplies(true)}
              className="text-xs text-primary mt-2 cursor-pointer hover:underline"
            >
              Xem {repliesList.length} phản hồi
            </button>
          )}
        </div>
      </div>

      {/* Replies */}
      {showReplies && repliesList.map((reply) => (
        <ReplyItem
          key={reply.id}
          reply={reply}
          onDelete={(replyId) => {
            // Handle reply deletion
            queryClient.invalidateQueries({ queryKey: ['feedbackReplies', feedback.id] });
          }}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
};

// Main Feedback Section
const FeedbackSection = ({ objectiveId, canEdit }) => {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [selectedType, setSelectedType] = useState('CONCERN');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch feedbacks
  const { data: feedbacksResponse, isLoading } = useQuery({
    queryKey: ['feedbacks', objectiveId],
    queryFn: () => listFeedbacks(objectiveId, { per_page: 100 }),
    enabled: !!objectiveId,
  });

  const feedbacks = feedbacksResponse?.data || [];

  // Create feedback mutation
  const createMutation = useMutation({
    mutationFn: (data) => createFeedback(objectiveId, data),
    onSuccess: () => {
      toast.success('Đã thêm feedback!');
      setNewComment('');
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: ['feedbacks', objectiveId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Có lỗi xảy ra');
    },
  });

  // Delete feedback mutation
  const deleteMutation = useMutation({
    mutationFn: (feedbackId) => deleteFeedback(objectiveId, feedbackId),
    onSuccess: () => {
      toast.success('Đã xóa feedback!');
      queryClient.invalidateQueries({ queryKey: ['feedbacks', objectiveId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Có lỗi xảy ra');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    createMutation.mutate({
      content: newComment,
      type: selectedType,
    });
  };

  const feedbackTypes = [
    { value: 'PRAISE', label: 'Khen ngợi', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'CONCERN', label: 'Lo ngại', color: 'bg-amber-100 text-amber-700' },
    { value: 'SUGGESTION', label: 'Đề xuất', color: 'bg-sky-100 text-sky-700' },
    { value: 'QUESTION', label: 'Câu hỏi', color: 'bg-purple-100 text-purple-700' },
    { value: 'BLOCKER', label: 'Blocker', color: 'bg-red-100 text-red-700' },
  ];

  // Get current user ID from localStorage or context (simplified)
  const currentUserId = useMemo(() => {
    // This should come from your auth context
    return null;
  }, []);

  return (
    <div className="bg-background rounded-xl border border-secondary/20 p-6">
      <h3 className="text-lg font-semibold text-text mb-6">Employee Feedback & Discussion</h3>

      {/* Add comment form */}
      <div className="mb-6">
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full px-4 py-3 text-left text-secondary border border-secondary/20 rounded-lg hover:border-primary hover:text-primary transition-colors cursor-pointer"
          >
            + Thêm bình luận hoặc feedback...
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {feedbackTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedType(type.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedType === type.value ? type.color : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Nhập nội dung feedback..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/10 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || !newComment.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {createMutation.isPending ? 'Đang gửi...' : 'Gửi'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Feedback list */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-8 text-secondary">
            <p>Chưa có feedback nào</p>
          </div>
        ) : (
          feedbacks.map((feedback) => (
            <FeedbackItem
              key={feedback.id}
              feedback={feedback}
              objectiveId={objectiveId}
              onDelete={(id) => deleteMutation.mutate(id)}
              currentUserId={currentUserId}
              canEdit={canEdit}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FeedbackSection;
