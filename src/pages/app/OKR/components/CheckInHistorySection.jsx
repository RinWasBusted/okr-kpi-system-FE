import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, TrendingUp, User, ExternalLink, MessageSquare } from 'lucide-react';
import { getObjectiveCheckIns } from '../../../../services/okr';

const CheckInHistorySection = ({ objectiveId }) => {
  const { data: checkInsResponse, isLoading } = useQuery({
    queryKey: ['objective-checkins', objectiveId],
    queryFn: () => getObjectiveCheckIns(objectiveId),
    enabled: !!objectiveId,
  });

  const checkIns = checkInsResponse?.data || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-background rounded-xl border border-secondary/20 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-secondary/20 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text flex items-center gap-2">
          <Clock size={20} className="text-blue-500" />
          Lịch sử Check-in
        </h2>
        <span className="text-sm text-secondary">{checkIns.length} bản ghi</span>
      </div>

      <div className="divide-y divide-secondary/10">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary/10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary/10 rounded w-1/4" />
                  <div className="h-3 bg-secondary/10 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : checkIns.length === 0 ? (
          <div className="p-12 text-center">
            <Clock size={48} className="mx-auto mb-4 opacity-50 text-secondary" />
            <p className="text-secondary">Chưa có lịch sử check-in cho Objective này</p>
          </div>
        ) : (
          checkIns.map((checkIn) => (
            <div key={checkIn.id} className="p-6 hover:bg-secondary/5 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 overflow-hidden">
                    {checkIn.user?.avatar_url ? (
                      <img src={checkIn.user.avatar_url} alt={checkIn.user.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-blue-500" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-text">
                        {checkIn.user?.full_name || 'Người dùng'}
                      </span>
                      <span className="text-secondary text-sm">đã cập nhật</span>
                      <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">
                        {checkIn.key_result?.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-secondary mt-1">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDate(checkIn.created_at)}
                      </span>
                    </div>

                    {checkIn.comment && (
                      <div className="mt-3 p-3 bg-secondary/5 rounded-lg text-sm text-text border border-secondary/10 flex gap-2">
                        <MessageSquare size={16} className="text-secondary shrink-0 mt-0.5" />
                        <p className="italic">&quot;{checkIn.comment}&quot;</p>
                      </div>
                    )}

                    {checkIn.evidence_url && (
                      <a
                        href={checkIn.evidence_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                      >
                        <ExternalLink size={14} />
                        Xem minh chứng
                      </a>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                      <TrendingUp size={16} />
                      <span>{checkIn.progress_snapshot}%</span>
                    </div>
                    <div className="text-[10px] text-secondary uppercase font-bold tracking-wider bg-secondary/5 px-1.5 py-0.5 rounded border border-secondary/10">
                      Snap: {checkIn.obj_progress_snapshot}% OBJ
                    </div>
                    <div className="text-xs font-medium text-text mt-1">
                      Giá trị: {checkIn.achieved_value}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CheckInHistorySection;
