/**
 * KPIDictionaryCardSkeleton Component
 * Loading placeholder for KPI dictionary card
 */
const KPIDictionaryCardSkeleton = () => {
  return (
    <div className="bg-background rounded-xl border border-secondary/20 p-6">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-40 bg-secondary/20 rounded animate-pulse" />
            <div className="h-5 w-16 bg-secondary/20 rounded-full animate-pulse" />
          </div>
          <div className="h-4 w-full max-w-xs bg-secondary/20 rounded animate-pulse" />
        </div>
        <div className="h-9 w-9 bg-secondary/20 rounded-lg animate-pulse ml-2 shrink-0" />
      </div>

      {/* Details Grid Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="h-4 w-20 bg-secondary/20 rounded animate-pulse" />
            <div className="h-4 w-24 bg-secondary/20 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default KPIDictionaryCardSkeleton;
