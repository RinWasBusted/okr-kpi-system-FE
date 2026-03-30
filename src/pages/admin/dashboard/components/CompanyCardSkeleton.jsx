/**
 * CompanyCardSkeleton Component
 * Placeholder loading state for CompanyCard
 */
const CompanyCardSkeleton = () => {
  return (
    <div className="bg-background rounded-lg border border-secondary/20 p-6 animate-pulse">
      {/* Header: Name + Arrow */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg" />
          <div className="w-32 h-5 bg-secondary/20 rounded" />
        </div>
        <div className="w-5 h-5 bg-secondary/20 rounded" />
      </div>

      {/* Plan Badge */}
      <div className="mb-4">
        <div className="w-24 h-6 bg-secondary/20 rounded-full" />
      </div>

      {/* Token Usage Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="w-28 h-4 bg-secondary/20 rounded" />
          <div className="w-10 h-4 bg-secondary/20 rounded" />
        </div>
        {/* Progress Bar */}
        <div className="h-2 bg-secondary/20 rounded-full overflow-hidden mb-2">
          <div className="w-2/3 h-full bg-secondary/20" />
        </div>
        <div className="w-32 h-3 bg-secondary/20 rounded" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-secondary/10">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-secondary/20 rounded" />
          <div className="w-20 h-4 bg-secondary/20 rounded" />
        </div>
        <div className="w-24 h-3 bg-secondary/20 rounded" />
      </div>
    </div>
  );
};

export default CompanyCardSkeleton;
