import { useState } from 'react';
import { X, AlertTriangle, ListTodo, Target, Calendar, Weight } from 'lucide-react';

const evaluationMethodLabels = {
  MAXIMIZE: 'Tối đa hóa',
  MINIMIZE: 'Tối thiểu hóa',
  TARGET: 'Đạt mục tiêu'
};

const AIConfirmCreateModal = ({ keyResults, onClose, onConfirm, isPending }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Tính tổng trọng số
  const totalWeight = keyResults.reduce((sum, kr) => sum + (kr.weight || 0), 0);
  const isWeightValid = totalWeight <= 100;

  const handleConfirm = () => {
    if (!isWeightValid) {
      return;
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={!isPending ? onClose : undefined} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text">Xác nhận tạo Key Results</h2>
              <p className="text-sm text-secondary">
                {keyResults.length} Key Result{keyResults.length > 1 ? 's' : ''} sẽ được tạo
              </p>
            </div>
          </div>
          {!isPending && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} className="text-secondary" />
            </button>
          )}
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Thông báo tổng trọng số */}
          <div className={`px-6 py-3 border-b ${isWeightValid ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Weight size={16} className={isWeightValid ? 'text-emerald-600' : 'text-red-600'} />
                <span className={`text-sm font-medium ${isWeightValid ? 'text-emerald-700' : 'text-red-700'}`}>
                  Tổng trọng số: {totalWeight.toFixed(0)}%
                </span>
              </div>
              {!isWeightValid && (
                <span className="text-sm text-red-600">
                  Tổng trọng số không được vượt quá 100%
                </span>
              )}
            </div>
            {!isWeightValid && (
              <div className="w-full bg-red-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-red-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(totalWeight, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Danh sách KR trong box scroll */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              {keyResults.map((kr, index) => (
                <div
                  key={index}
                  className="border border-secondary/20 rounded-xl p-4 bg-background hover:border-primary/30 transition-colors"
                >
                  {/* Header: STT + Title */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-primary text-white text-xs font-bold rounded-full shrink-0">
                      {index + 1}
                    </div>
                    <h4 className="font-medium text-text flex-1">{kr.title}</h4>
                  </div>

                  {/* Chi tiết */}
                  <div className="grid grid-cols-2 gap-3 ml-9">
                    <div className="flex items-center gap-2 text-sm">
                      <Target size={14} className="text-secondary" />
                      <span className="text-secondary">Giá trị:</span>
                      <span className="font-medium text-text">
                        {kr.start_value}{kr.unit} → {kr.target_value}{kr.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Weight size={14} className="text-secondary" />
                      <span className="text-secondary">Trọng số:</span>
                      <span className="font-medium text-primary">
                        {Math.round(kr.weight * 100)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <ListTodo size={14} className="text-secondary" />
                      <span className="text-secondary">Phương pháp:</span>
                      <span className="font-medium text-text">
                        {evaluationMethodLabels[kr.evaluation_method] || kr.evaluation_method}
                      </span>
                    </div>

                    {kr.due_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-secondary" />
                        <span className="text-secondary">Hết hạn:</span>
                        <span className="font-medium text-text">
                          {new Date(kr.due_date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-secondary/20 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            Quay lại chỉnh sửa
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending || !isWeightValid}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <span>Xác nhận tạo {keyResults.length} Key Result</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIConfirmCreateModal;
