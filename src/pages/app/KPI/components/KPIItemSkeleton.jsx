const KPIItemSkeleton = () => {
  return (
    <div className="bg-background rounded-xl border border-secondary/20 p-5 animate-pulse">
      <div className="flex items-start gap-4">
        {/* Expand placeholder */}
        <div className="w-6 h-6 bg-gray-200 rounded" />

        {/* Icon placeholder */}
        <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />

        {/* Info placeholder */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-28" />
          </div>
        </div>

        {/* Values placeholder */}
        <div className="w-48 shrink-0 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32 ml-auto" />
          <div className="h-2 bg-gray-200 rounded-full" />
          <div className="h-3 bg-gray-200 rounded w-20 ml-auto" />
        </div>

        {/* Actions placeholder */}
        <div className="flex items-center gap-2 border-l border-secondary/20 pl-4 shrink-0">
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="h-8 w-8 bg-gray-200 rounded" />
          <div className="h-8 w-8 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
};

export default KPIItemSkeleton;
