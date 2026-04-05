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
        <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center">
          <span className="text-sky-600 text-xs font-bold">⊕</span>
        </div>
        <h3 className="text-lg font-semibold text-text">Child Objectives</h3>
      </div>

      <div className="space-y-4">
        {childObjectives.map((child) => {
          const progressColor = getProgressColor(child.progress_percentage || 0);
          const statusConfig = child.progress_status === 'ON_TRACK'
            ? { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'on-track' }
            : { bg: 'bg-orange-100', text: 'text-orange-700', label: 'at-risk' };

          return (
            <div key={child.id} className="bg-sky-50 rounded-xl border border-sky-100 p-5">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                  <span className="text-sky-600 text-xs font-bold">⊕</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-text">{child.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <p className="text-sm text-secondary mb-3">
                    Owner: {child.owner?.full_name || 'Chưa gán'} • Unit: {child.unit?.name || 'N/A'} • Cycle: {child.cycle?.name || 'N/A'}
                  </p>

                  {/* Progress bar */}
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
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
                  <p className="text-xs text-secondary">Progress</p>
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
