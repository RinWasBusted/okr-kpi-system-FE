import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Target, Calendar, CheckSquare, Square, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { getCycles } from '../../../../services/cycle';
import { getObjectives } from '../../../../services/okr';
import { getKPIAssignments } from '../../../../services/kpi-assignment';

const CopyOKRKPIModal = ({ currentCycleId, onClose }) => {
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [selectedObjectives, setSelectedObjectives] = useState([]);
  const [selectedKPIs, setSelectedKPIs] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch all cycles
  const { data: cyclesResponse } = useQuery({
    queryKey: ['cycles'],
    queryFn: () => getCycles({ per_page: 100 }),
  });

  const cycles = (cyclesResponse?.data || []).filter(
    (c) => c.id.toString() !== currentCycleId
  );

  // Fetch objectives for selected cycle
  const { data: objectivesResponse, isLoading: isObjectivesLoading } = useQuery({
    queryKey: ['objectives', selectedCycleId],
    queryFn: () => getObjectives({ cycle_id: selectedCycleId, per_page: 100 }),
    enabled: !!selectedCycleId,
  });

  const sourceObjectives = objectivesResponse?.data || [];

  // Fetch KPI assignments for selected cycle
  const { data: kpiResponse, isLoading: isKpiLoading } = useQuery({
    queryKey: ['kpi-assignments', selectedCycleId],
    queryFn: () => getKPIAssignments({ cycle_id: selectedCycleId, per_page: 100 }),
    enabled: !!selectedCycleId,
  });

  const sourceKPIs = kpiResponse?.data || [];

  const toggleObjective = (id) => {
    setSelectedObjectives((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleKPI = (id) => {
    setSelectedKPIs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Select all objectives
  const selectAllObjectives = () => {
    if (selectedObjectives.length === sourceObjectives.length) {
      setSelectedObjectives([]);
    } else {
      setSelectedObjectives(sourceObjectives.map((o) => o.id));
    }
  };

  // Select all KPIs
  const selectAllKPIs = () => {
    if (selectedKPIs.length === sourceKPIs.length) {
      setSelectedKPIs([]);
    } else {
      setSelectedKPIs(sourceKPIs.map((k) => k.id));
    }
  };

  const handleCopy = () => {
    if (selectedObjectives.length === 0 && selectedKPIs.length === 0) {
      toast.error('Vui lòng chọn ít nhất một Objective hoặc KPI để sao chép');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    const selectedObjectiveNames = sourceObjectives
      .filter((o) => selectedObjectives.includes(o.id))
      .map((o) => o.title);
    const selectedKPINames = sourceKPIs
      .filter((k) => selectedKPIs.includes(k.id))
      .map((k) => k.kpi_dictionary?.name || 'Unknown KPI');

    toast.success(
      `Sao chép thành công!\nObjectives: ${selectedObjectiveNames.join(', ') || 'Không có'}\nKPIs: ${selectedKPINames.join(', ') || 'Không có'}`
    );
    onClose();
  };

  const selectedCycle = cycles.find((c) => c.id.toString() === selectedCycleId);

  const allObjectivesSelected =
    sourceObjectives.length > 0 && selectedObjectives.length === sourceObjectives.length;
  const allKPIsSelected =
    sourceKPIs.length > 0 && selectedKPIs.length === sourceKPIs.length;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-background rounded-xl shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary/20">
            <h2 className="text-xl font-bold text-text">Sao chép OKR / KPI từ chu kỳ khác</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} className="text-secondary" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Select Cycle */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Chọn chu kỳ nguồn *
              </label>
              <select
                value={selectedCycleId}
                onChange={(e) => {
                  setSelectedCycleId(e.target.value);
                  setSelectedObjectives([]);
                  setSelectedKPIs([]);
                }}
                className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Chọn chu kỳ...</option>
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCycleId && (
              <>
                {/* Objectives List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                      <Target size={16} className="text-primary" />
                      Objectives ({sourceObjectives.length})
                    </h3>
                    {sourceObjectives.length > 0 && (
                      <button
                        onClick={selectAllObjectives}
                        className="text-xs text-primary hover:underline cursor-pointer"
                      >
                        {allObjectivesSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      </button>
                    )}
                  </div>
                  {isObjectivesLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse h-12 bg-secondary/20 rounded" />
                      ))}
                    </div>
                  ) : sourceObjectives.length === 0 ? (
                    <p className="text-sm text-secondary">Không có objective nào</p>
                  ) : (
                    <div className="space-y-2">
                      {sourceObjectives.map((obj) => (
                        <label
                          key={obj.id}
                          className="flex items-start gap-3 p-3 rounded-lg border border-secondary/20 hover:bg-secondary/5 cursor-pointer transition-colors"
                        >
                          <div className="mt-0.5">
                            {selectedObjectives.includes(obj.id) ? (
                              <CheckSquare size={18} className="text-primary" />
                            ) : (
                              <Square size={18} className="text-secondary" />
                            )}
                          </div>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={selectedObjectives.includes(obj.id)}
                            onChange={() => toggleObjective(obj.id)}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-text text-sm">{obj.title}</p>
                            <p className="text-xs text-secondary">
                              Tiến độ: {obj.progress_percentage}%
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* KPI List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                      <Calendar size={16} className="text-amber-600" />
                      KPI Assignments ({sourceKPIs.length})
                    </h3>
                    {sourceKPIs.length > 0 && (
                      <button
                        onClick={selectAllKPIs}
                        className="text-xs text-primary hover:underline cursor-pointer"
                      >
                        {allKPIsSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      </button>
                    )}
                  </div>
                  {isKpiLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse h-12 bg-secondary/20 rounded" />
                      ))}
                    </div>
                  ) : sourceKPIs.length === 0 ? (
                    <p className="text-sm text-secondary">Không có KPI nào</p>
                  ) : (
                    <div className="space-y-2">
                      {sourceKPIs.map((kpi) => (
                        <label
                          key={kpi.id}
                          className="flex items-start gap-3 p-3 rounded-lg border border-secondary/20 hover:bg-secondary/5 cursor-pointer transition-colors"
                        >
                          <div className="mt-0.5">
                            {selectedKPIs.includes(kpi.id) ? (
                              <CheckSquare size={18} className="text-primary" />
                            ) : (
                              <Square size={18} className="text-secondary" />
                            )}
                          </div>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={selectedKPIs.includes(kpi.id)}
                            onChange={() => toggleKPI(kpi.id)}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-text text-sm">
                              {kpi.kpi_dictionary?.name || 'Unknown KPI'}
                            </p>
                            <p className="text-xs text-secondary">
                              Target: {kpi.target_value} {kpi.kpi_dictionary?.unit} | Tiến độ: {kpi.progress_percentage}%
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-secondary/20">
            <button
              onClick={onClose}
              className="px-6 py-2 text-text hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleCopy}
              disabled={!selectedCycleId || (selectedObjectives.length === 0 && selectedKPIs.length === 0)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Sao chép
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-60">
          <div className="fixed inset-0 bg-black/60" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-background rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
              <div className="p-6 border-b border-secondary/20">
                <h3 className="text-lg font-bold text-text">Xác nhận sao chép</h3>
                <p className="text-sm text-secondary mt-2">
                  Bạn sắp sao chép từ chu kỳ <strong>{selectedCycle?.name}</strong>:
                </p>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {selectedObjectives.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-text mb-2">Objectives ({selectedObjectives.length}):</p>
                    <div className="max-h-32 overflow-y-auto bg-secondary/5 rounded-lg p-3">
                      <ul className="text-sm text-secondary list-disc list-inside space-y-1">
                        {sourceObjectives
                          .filter((o) => selectedObjectives.includes(o.id))
                          .map((o) => (
                            <li key={o.id} className="truncate">{o.title}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                )}

                {selectedKPIs.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-text mb-2">KPIs ({selectedKPIs.length}):</p>
                    <div className="max-h-32 overflow-y-auto bg-secondary/5 rounded-lg p-3">
                      <ul className="text-sm text-secondary list-disc list-inside space-y-1">
                        {sourceKPIs
                          .filter((k) => selectedKPIs.includes(k.id))
                          .map((k) => (
                            <li key={k.id} className="truncate">{k.kpi_dictionary?.name || 'Unknown KPI'}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-secondary/20">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-6 py-2 text-text hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CopyOKRKPIModal;
