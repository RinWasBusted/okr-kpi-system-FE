import { TrendingUp, Loader } from 'lucide-react';

const getVisibilityLabel = (visibility) => {
  const visibilityMap = {
    'PUBLIC': 'Công khai',
    'INTERNAL': 'Nội bộ',
    'PRIVATE': 'Riêng tư'
  };
  return visibilityMap[visibility] || visibility;
};

const KPIList = ({ kpis, isLoading, count }) => {
  return (
    <div className="bg-background rounded-xl border border-secondary/20 overflow-hidden">
      <div className="p-6 border-b border-secondary/20">
        <h2 className="text-lg font-semibold text-text flex items-center gap-2">
          <TrendingUp size={20} className="text-green-500" />
          KPI ({count})
        </h2>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader size={24} className="text-primary animate-spin" />
        </div>
      ) : count === 0 ? (
        <div className="text-center py-8 text-secondary">
          <p>Chưa có KPI nào</p>
        </div>
      ) : (
        <div className="divide-y divide-secondary/10">
          {kpis.map((kpi) => (
            <div key={kpi.id} className="p-4 hover:bg-secondary/5 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-text truncate mb-1">{kpi.kpi_dictionary.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-secondary">
                    <span>Chu kỳ: {kpi.cycle?.name || kpi.cycle_name || 'Chưa xác định'}</span>
                    <span>•</span>
                    <span>Mục tiêu: {kpi.target_value} {kpi.kpi_dictionary.unit}</span>
                    <span>•</span>
                    <span>Hiện tại: {kpi.current_value} {kpi.kpi_dictionary.unit}</span>
                    <span>•</span>
                    <span>{getVisibilityLabel(kpi.visibility)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-text">{kpi.progress_percentage || 0}%</p>
                  <div className="w-24 h-2 bg-secondary/15 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${kpi.progress_percentage || 0}%` }}
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

export default KPIList;
