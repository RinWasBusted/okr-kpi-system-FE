import { Target, Loader } from 'lucide-react';

const getVisibilityLabel = (visibility) => {
  const visibilityMap = {
    'PUBLIC': 'Công khai',
    'INTERNAL': 'Nội bộ',
    'PRIVATE': 'Riêng tư'
  };
  return visibilityMap[visibility] || visibility;
};

const OKRList = ({ okrs, isLoading, count }) => {
  return (
    <div className="bg-background rounded-xl border border-secondary/20 overflow-hidden">
      <div className="p-6 border-b border-secondary/20">
        <h2 className="text-lg font-semibold text-text flex items-center gap-2">
          <Target size={20} className="text-orange-500" />
          OKR ({count})
        </h2>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader size={24} className="text-primary animate-spin" />
        </div>
      ) : count === 0 ? (
        <div className="text-center py-8 text-secondary">
          <p>Chưa có OKR nào</p>
        </div>
      ) : (
        <div className="divide-y divide-secondary/10">
          {okrs.map((okr) => (
            <div key={okr.id} className="p-4 hover:bg-secondary/5 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-text truncate">{okr.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                      okr.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {okr.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-secondary">
                    <span>Chu kỳ: {okr.cycle_name || okr.cycle_id}</span>
                    <span>•</span>
                    <span>{getVisibilityLabel(okr.visibility)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-text">{okr.progress_percentage || 0}%</p>
                  <div className="w-24 h-2 bg-secondary/15 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${okr.progress_percentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OKRList;
