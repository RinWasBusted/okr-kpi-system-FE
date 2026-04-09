const StatCard = ({ title, value, icon: Icon, color, trend, breakdown }) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-background border border-secondary/20 rounded-lg p-4 md:p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-secondary text-sm">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-text mt-2">{value}</p>
          {breakdown && (
            <p className="text-xs text-secondary mt-2">{breakdown}</p>
          )}
          {trend && (
            <p className="text-xs text-green-600 mt-2">{trend}</p>
          )}
        </div>
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0 ml-3 ${colorClasses[color]}`}>
          <Icon size={20} className="md:w-6 md:h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
