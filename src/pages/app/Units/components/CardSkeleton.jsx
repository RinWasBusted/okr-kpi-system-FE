const CardSkeleton = ({ title, icon }) => {
  return (
    <div className="bg-background rounded-xl border border-secondary/20 overflow-hidden">
      <div className="p-6 border-b border-secondary/20">
        <div className="flex items-center gap-2">
          {icon}
          <div className="h-5 w-24 bg-secondary/20 rounded animate-pulse" />
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="h-16 bg-secondary/10 rounded-lg animate-pulse" />
        <div className="h-16 bg-secondary/10 rounded-lg animate-pulse" />
        <div className="h-16 bg-secondary/10 rounded-lg animate-pulse" />
      </div>
    </div>
  );
};

export default CardSkeleton;
