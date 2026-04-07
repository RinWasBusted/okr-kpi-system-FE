const ObjectiveItemSkeleton = () => {
  return (
    <div className="bg-background rounded-xl border border-secondary/20 overflow-hidden p-5">
      <div className="flex items-start gap-4">
        {/* Expand button placeholder */}
        <div className="w-6 h-6 rounded bg-secondary/20 animate-pulse" />

        {/* Icon placeholder */}
        <div className="w-10 h-10 rounded-full bg-secondary/20 animate-pulse shrink-0" />

        {/* Title and info */}
        <div className="flex-1 min-w-0">
          <div className="h-5 w-3/4 bg-secondary/20 rounded animate-pulse mb-2" />
          <div className="h-4 w-1/2 bg-secondary/20 rounded animate-pulse" />
        </div>

        {/* Progress section */}
        <div className="w-64 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="h-6 w-12 bg-secondary/20 rounded animate-pulse" />
            <div className="h-4 w-14 bg-secondary/20 rounded animate-pulse" />
          </div>
          <div className="h-2 bg-secondary/20 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ObjectiveItemSkeleton;
