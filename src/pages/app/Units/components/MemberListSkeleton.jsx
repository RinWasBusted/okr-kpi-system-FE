const MemberListSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Manager Skeleton */}
      <div className="bg-background rounded-xl border border-secondary/20 overflow-hidden">
        <div className="p-6 border-b border-secondary/20">
          <div className="h-5 w-24 bg-secondary/20 rounded animate-pulse" />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary/20 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-secondary/20 rounded animate-pulse" />
              <div className="h-3 w-48 bg-secondary/20 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Members Skeleton */}
      <div className="bg-background rounded-xl border border-secondary/20 overflow-hidden">
        <div className="p-6 border-b border-secondary/20">
          <div className="h-5 w-32 bg-secondary/20 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-secondary/10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/20 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-28 bg-secondary/20 rounded animate-pulse" />
                  <div className="h-3 w-40 bg-secondary/20 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberListSkeleton;
