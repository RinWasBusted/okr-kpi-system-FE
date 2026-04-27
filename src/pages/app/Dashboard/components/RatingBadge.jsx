/**
 * Consistent color-coded badge for PerformanceRating values.
 * Used in evaluation tables and alert strips.
 *
 * @param {Object} props
 * @param {string} props.rating - PerformanceRating enum value
 * @param {string} [props.size] - 'sm' | 'md' (default: 'sm')
 */
const RATING_CONFIG = {
  EXCELLENT: {
    label: 'Xuất sắc',
    className: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  },
  GOOD: {
    label: 'Tốt',
    className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  ABOVE_AVERAGE: {
    label: 'Khá',
    className: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  },
  SATISFACTORY: {
    label: 'Đạt',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  NEEDS_IMPROVEMENT: {
    label: 'Cần cải thiện',
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
};

const RatingBadge = ({ rating, size = 'sm' }) => {
  const config = RATING_CONFIG[rating];
  if (!config) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20">
        N/A
      </span>
    );
  }

  const sizeClasses = size === 'md'
    ? 'px-3 py-1 text-sm'
    : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${sizeClasses} ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default RatingBadge;
