import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, ChevronDown, Check } from 'lucide-react';
import { getKPIAssignments } from '../../../../services/kpi';
import { getCycles } from '../../../../services/cycle';
import CardSkeleton from './CardSkeleton';

const getVisibilityLabel = (visibility) => {
  const visibilityMap = {
    'PUBLIC': 'Công khai',
    'INTERNAL': 'Nội bộ',
    'PRIVATE': 'Riêng tư'
  };
  return visibilityMap[visibility] || visibility;
};

const CycleFilterDropdown = ({ cycles, selectedCycles, onToggle, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCount = selectedCycles.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-1.5 text-sm border border-secondary/30 rounded-lg hover:bg-secondary/5 transition-colors cursor-pointer"
      >
        <span>Tất cả chu kỳ</span>
        {selectedCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-500 text-white rounded-full">
            {selectedCount}
          </span>
        )}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-56 bg-background border border-secondary/30 rounded-lg shadow-lg z-20 py-2">
            <div className="px-3 py-2 border-b border-secondary/20 flex items-center justify-between">
              <span className="text-sm font-medium">Chọn chu kỳ</span>
              {selectedCount > 0 && (
                <button
                  onClick={onClear}
                  className="text-xs text-green-500 hover:text-green-600 cursor-pointer"
                >
                  Xóa lọc
                </button>
              )}
            </div>
            <div className="max-h-48 overflow-y-auto">
              {cycles.length === 0 ? (
                <div className="px-3 py-4 text-sm text-secondary text-center">
                  Chưa có dữ liệu chu kỳ
                </div>
              ) : (
                cycles.map((cycle) => (
                  <label
                    key={cycle.id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-secondary/5 cursor-pointer"
                  >
                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
                      selectedCycles.includes(cycle.id)
                        ? 'bg-green-500 border-green-500'
                        : 'border-secondary/40'
                    }`}>
                      {selectedCycles.includes(cycle.id) && <Check size={10} className="text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedCycles.includes(cycle.id)}
                      onChange={() => onToggle(cycle.id)}
                    />
                    <span className="text-sm truncate">{cycle.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const KPIList = ({ unitId }) => {
  const [selectedCycleIds, setSelectedCycleIds] = useState([]);

  // Fetch KPIs for this unit independently
  const { data: kpiData, isLoading: isLoadingKPIs } = useQuery({
    queryKey: ['kpi-assignments', { unit_id: unitId }],
    queryFn: () => getKPIAssignments({ unit_id: unitId, per_page: 100 }),
    enabled: !!unitId,
  });

  // Fetch cycles for filter
  const { data: cyclesData } = useQuery({
    queryKey: ['cycles'],
    queryFn: () => getCycles({ per_page: 100 }),
  });

  const kpis = kpiData?.data || [];
  const cycles = cyclesData?.data || [];

  // Filter KPIs by selected cycles (FE filtering)
  const filteredKPIs = selectedCycleIds.length > 0
    ? kpis.filter((kpi) => kpi.cycle && selectedCycleIds.includes(kpi.cycle.id))
    : kpis;

  const count = filteredKPIs.length;

  const handleCycleToggle = (cycleId) => {
    setSelectedCycleIds((prev) =>
      prev.includes(cycleId)
        ? prev.filter((id) => id !== cycleId)
        : [...prev, cycleId]
    );
  };

  const handleClearFilters = () => {
    setSelectedCycleIds([]);
  };

  // Show skeleton placeholder while loading
  if (isLoadingKPIs) {
    return (
      <CardSkeleton
        title="KPI"
        icon={<TrendingUp size={20} className="text-green-500" />}
      />
    );
  }

  return (
    <div className="bg-background rounded-xl border border-secondary/20">
      <div className="p-6 border-b border-secondary/20 flex items-center justify-between rounded-t-xl">
        <h2 className="text-lg font-semibold text-text flex items-center gap-2">
          <TrendingUp size={20} className="text-green-500" />
          KPI ({count})
        </h2>
        <CycleFilterDropdown
          cycles={cycles}
          selectedCycles={selectedCycleIds}
          onToggle={handleCycleToggle}
          onClear={handleClearFilters}
        />
      </div>
      {count === 0 ? (
        <div className="text-center py-8 text-secondary">
          <p>{selectedCycleIds.length > 0 ? 'Không có KPI nào trong chu kỳ đã chọn' : 'Chưa có KPI nào'}</p>
        </div>
      ) : (
        <div className="divide-y divide-secondary/10">
          {filteredKPIs.map((kpi) => (
            <div key={kpi.id} className="p-4 hover:bg-secondary/5 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-text truncate mb-1">{kpi.kpi_dictionary.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-secondary">
                    <span>Chu kỳ: {kpi.cycle?.name || 'Chưa xác định'}</span>
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
