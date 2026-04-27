/**
 * UnitItemSkeleton Component
 * Placeholder loading state for UnitItem
 */
const UnitItemSkeleton = ({ level = 0 }) => {
  const indentPadding = level * 32;

  return (
    <div
      className="w-full"
      style={{ marginLeft: `${indentPadding}px` }}
    >
      <div className="bg-background rounded-lg border border-secondary/20 p-4 mb-2">
        <div className="flex items-center justify-between">
          {/* Left: Icon + Info */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 animate-pulse bg-secondary/20 rounded" />
            <div className="space-y-2">
              <div className="w-40 h-5 animate-pulse bg-secondary/20 rounded" />
              <div className="w-28 h-3 animate-pulse bg-secondary/20 rounded" />
            </div>
          </div>

          {/* Right: Progress bars */}
          <div className="flex items-center gap-8">
            <div className="w-32 space-y-1">
              <div className="w-20 h-3 animate-pulse bg-secondary/20 rounded" />
              <div className="w-full h-2 animate-pulse bg-secondary/20 rounded-full" />
            </div>
            <div className="w-32 space-y-1">
              <div className="w-20 h-3 animate-pulse bg-secondary/20 rounded" />
              <div className="w-full h-2 animate-pulse bg-secondary/20 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitItemSkeleton;
