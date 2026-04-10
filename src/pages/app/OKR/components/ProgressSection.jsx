import { useMemo } from 'react';

// Predefined color palette for key result segments
const COLOR_PALETTE = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500',
];

// Generate a stable color based on key result ID
const getColorById = (id) => {
  const index = id % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
};

const ProgressSection = ({ objective }) => {
  const keyResults = objective?.key_results || [];

  // Calculate segments based on key results weights
  const totalWeight = keyResults.reduce((sum, kr) => sum + (kr.weight || 0), 0) || 100;

  const segments = useMemo(() => {
    return keyResults.map(kr => ({
      id: kr.id,
      weight: ((kr.weight || 33.33) / totalWeight) * 100,
      color: getColorById(kr.id),
      title: kr.title,
      percentage: kr.progress_percentage || 0
    }));
  }, [keyResults, totalWeight]);

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
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'on-track' };
    }
  };

  const statusConfig = getStatusBadge(objective?.progress_status);

  return (
    <div className="bg-background rounded-xl border border-secondary/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text">Tiến độ</h3>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
          {statusConfig.label}
        </span>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-secondary text-sm">Tiến độ tổng</span>
        <span className="text-3xl font-bold text-text">{objective?.progress_percentage || 0}%</span>
      </div>

      {/* Overall progress bar - shows actual progress percentage */}
      <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${objective?.progress_percentage || 0}%` }}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {segments.map((segment) => (
          <div key={segment.id} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${segment.color}`} />
            <span className="text-sm text-secondary">{segment.title} ({segment.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressSection;
