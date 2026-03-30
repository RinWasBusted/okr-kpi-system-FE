const PlaceholderCard = () => (
  <div className="p-4 space-y-3 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-secondary/20 rounded-lg" />
        <div className="space-y-2">
          <div className="w-32 h-4 bg-secondary/20 rounded" />
          <div className="w-24 h-3 bg-secondary/20 rounded" />
        </div>
      </div>
      <div className="w-16 h-6 bg-secondary/20 rounded-full" />
    </div>
    <div className="flex items-center gap-4">
      <div className="w-20 h-4 bg-secondary/20 rounded" />
      <div className="w-20 h-4 bg-secondary/20 rounded" />
      <div className="w-20 h-4 bg-secondary/20 rounded" />
    </div>
    <div className="flex items-center gap-2 pt-2">
      <div className="flex-1 h-8 bg-secondary/20 rounded" />
      <div className="flex-1 h-8 bg-secondary/20 rounded" />
    </div>
  </div>
);

export default PlaceholderCard;
