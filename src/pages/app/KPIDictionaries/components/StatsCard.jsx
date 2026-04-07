/**
 * StatsCard Component
 * Displays a statistic card with title and value
 *
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Card value
 * @param {boolean} props.isLoading - Loading state
 * @param {string} [props.className] - Additional CSS classes
 */
const StatsCard = ({ title, value, isLoading, className = '' }) => {
  return (
    <div className={`bg-background rounded-xl border border-secondary/20 p-6 ${className}`}>
      <p className="text-sm text-secondary mb-2">{title}</p>
      {isLoading ? (
        <div className="animate-pulse w-12 h-8 bg-secondary/20 rounded" />
      ) : (
        <p className="text-3xl font-bold text-text">{value}</p>
      )}
    </div>
  );
};

export default StatsCard;
