const CycleItemSkeleton = () => {
  return (
    <div className="bg-background rounded-xl border border-secondary/20 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="animate-pulse w-32 h-6 bg-secondary/20 rounded mb-2" />
              <div className="animate-pulse w-48 h-4 bg-secondary/20 rounded" />
            </div>
            <div className="animate-pulse w-24 h-6 bg-secondary/20 rounded-full" />
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-4 gap-6 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="animate-pulse w-10 h-10 bg-secondary/20 rounded-lg" />
                <div>
                  <div className="animate-pulse w-16 h-3 bg-secondary/20 rounded mb-1" />
                  <div className="animate-pulse w-8 h-5 bg-secondary/20 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex items-center gap-2 ml-4">
          <div className="animate-pulse w-9 h-9 bg-secondary/20 rounded-lg" />
          <div className="animate-pulse w-9 h-9 bg-secondary/20 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default CycleItemSkeleton;
