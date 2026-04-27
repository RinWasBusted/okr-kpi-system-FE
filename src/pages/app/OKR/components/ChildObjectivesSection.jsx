import { Link } from 'react-router-dom';

const ChildObjectivesSection = ({ childObjectives = [] }) => {
  const getProgressColor = (value) => {
    if (value >= 80) return 'bg-emerald-500';
    if (value >= 50) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <div className="bg-background rounded-xl border border-secondary/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 rounded-full bg-sky-500/10 flex items-center justify-center">
          <span className="text-sky-500 text-xs font-bold">⊕</span>
        </div>
        <h3 className="text-lg font-semibold text-text">Mục tiêu con</h3>
      </div>

      <div className="space-y-4">
        {childObjectives.map((child) => {
          const progressColor = getProgressColor(child.progress_percentage || 0);
          const getStatusConfig = (status) => {
            switch (status) {
              case 'COMPLETED':
              case 'ON_TRACK':
                return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'ĐÚNG TIẾN ĐỘ' };
              case 'WARNING':
              case 'AT_RISK':
                return { bg: 'bg-orange-500/10', text: 'text-orange-500', label: 'CÓ RỦI RO' };
              case 'CRITICAL':
              case 'DANGER':
              case 'NOT_STARTED':
                return { bg: 'bg-red-500/10', text: 'text-red-500', label: 'CHẬM TIẾN ĐỘ' };
              default:
                return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'ĐÚNG TIẾN ĐỘ' };
            }
          };
          const statusConfig = getStatusConfig(child.progress_status);

          return (
            <div key={child.id} className="bg-secondary/5 rounded-xl border border-secondary/20 p-5">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary text-xs font-bold">⊕</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-text">{child.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <p className="text-sm text-secondary mb-3">
                    Người phụ trách: {child.owner?.full_name || 'Chưa gán'} • Đơn vị: {child.unit?.name || 'N/A'} • Chu kỳ: {child.cycle?.name || 'N/A'}
                  </p>

                  {/* Progress bar */}
                  <div className="h-2 bg-secondary/10 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full ${progressColor} rounded-full transition-all duration-300`}
                      style={{ width: `${Math.min(child.progress_percentage || 0, 100)}%` }}
                    />
                  </div>

                  <Link
                    to={`../okr/${child.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    Chi tiết
                  </Link>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-2xl font-bold text-text">{child.progress_percentage || 0}%</span>
                  <p className="text-xs text-secondary">Tiến độ</p>
                </div>
              </div>
            </div>
          );
        })}

        {childObjectives.length === 0 && (
          <div className="text-center py-8 text-secondary">
            <p>Chưa có Child Objective nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildObjectivesSection;
