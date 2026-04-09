const StatCardSkeleton = () => (
  <div className="bg-background border border-secondary/20 rounded-lg p-4 md:p-6">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="h-4 bg-secondary/20 rounded w-24 mb-3 animate-pulse"></div>
        <div className="h-8 bg-secondary/20 rounded w-16 mb-2 animate-pulse"></div>
        <div className="h-3 bg-secondary/10 rounded w-20 animate-pulse"></div>
      </div>
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-secondary/20 shrink-0 ml-3 animate-pulse"></div>
    </div>
  </div>
);

const DashboardPlaceholder = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="h-8 bg-secondary/20 rounded w-40 mb-3 animate-pulse"></div>
        <div className="h-4 bg-secondary/10 rounded w-64 animate-pulse"></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-secondary/20 pb-3">
        <div className="h-5 bg-secondary/20 rounded w-20 animate-pulse"></div>
        <div className="h-5 bg-secondary/10 rounded w-28 animate-pulse"></div>
      </div>

      {/* Stats Cards and Timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Stats Cards */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[...Array(3)].map((_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>
        {/* Timeline Placeholder */}
        <div className="xl:col-span-1 bg-background border border-secondary/20 rounded-lg p-4">
          <div className="h-5 bg-secondary/20 rounded w-32 mb-4 animate-pulse"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-secondary/10 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Placeholders */}
      <div className="bg-background border border-secondary/20 rounded-lg p-6">
        <div className="h-6 bg-secondary/20 rounded w-32 mb-4 animate-pulse"></div>
        <div className="h-64 bg-secondary/5 rounded-lg animate-pulse"></div>
      </div>

      <div className="bg-background border border-secondary/20 rounded-lg p-6">
        <div className="h-6 bg-secondary/20 rounded w-40 mb-4 animate-pulse"></div>
        <div className="h-64 bg-secondary/5 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
};

export default DashboardPlaceholder;
