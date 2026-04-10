import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, Sparkles, Loader2, AlertCircle, Check, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { generateKeyResultsForObjective } from '../../../../services/okr-ai.js';

const evaluationMethodLabels = {
  MAXIMIZE: 'Tối đa hóa',
  MINIMIZE: 'Tối thiểu hóa',
  TARGET: 'Đạt mục tiêu'
};

const AIGenerateKRModal = ({ objectiveId, objectiveTitle, onClose, onConfirmCreate }) => {
  const [step, setStep] = useState('input'); // 'input' | 'results'
  const [formData, setFormData] = useState({
    count: 5,
    language: 'vi',
    due_date: '',
    unit: '',
    evaluation_method: '',
    context: ''
  });
  const [generatedData, setGeneratedData] = useState(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState(new Set());
  const [editedSuggestions, setEditedSuggestions] = useState({});
  const [expandedEvaluations, setExpandedEvaluations] = useState(new Set());

  const generateMutation = useMutation({
    mutationFn: (params) => generateKeyResultsForObjective(objectiveId, params),
    onSuccess: (response) => {
      if (response.success) {
        setGeneratedData(response.data);
        // Mặc định chọn tất cả suggestions
        const allIndices = new Set(response.data.suggestions.map((_, index) => index));
        setSelectedSuggestions(allIndices);
        // Khởi tạo editedSuggestions với dữ liệu gốc
        const initialEdits = {};
        response.data.suggestions.forEach((sugg, index) => {
          initialEdits[index] = { ...sugg };
        });
        setEditedSuggestions(initialEdits);
        setStep('results');
        toast.success('AI đã tạo gợi ý Key Results thành công!');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Có lỗi xảy ra khi tạo gợi ý từ AI');
    }
  });

  const handleGenerate = () => {
    const params = {
      count: parseInt(formData.count),
      language: formData.language
    };

    if (formData.due_date || formData.unit || formData.evaluation_method || formData.context) {
      params.constraints = {};
      if (formData.due_date) params.constraints.due_date = formData.due_date;
      if (formData.unit) params.constraints.unit = formData.unit;
      if (formData.evaluation_method) params.constraints.evaluation_method = formData.evaluation_method;
      if (formData.context) params.constraints.context = formData.context;
    }

    generateMutation.mutate(params);
  };

  const handleToggleSelection = (index) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleEditSuggestion = (index, field, value) => {
    setEditedSuggestions(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value
      }
    }));
  };

  const handleToggleEvaluation = (index) => {
    const newExpanded = new Set(expandedEvaluations);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEvaluations(newExpanded);
  };

  const handleProceedToConfirm = () => {
    if (selectedSuggestions.size === 0) {
      toast.warning('Vui lòng chọn ít nhất một Key Result để tạo');
      return;
    }

    // Chuẩn bị dữ liệu để truyền sang modal xác nhận
    const selectedKeyResults = Array.from(selectedSuggestions).map(index => {
      const edited = editedSuggestions[index];
      return {
        title: edited.title,
        target_value: parseFloat(edited.target_value) || 0,
        start_value: parseFloat(edited.start_value) || 0,
        current_value: parseFloat(edited.start_value) || 0,
        unit: edited.unit,
        weight: parseFloat(edited.weight) || 0,
        due_date: edited.due_date,
        evaluation_method: edited.evaluation_method
      };
    });

    onConfirmCreate(selectedKeyResults);
  };

  const isInputStep = step === 'input';
  const isResultsStep = step === 'results';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-linear-to-br from-violet-500 to-purple-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text">
                {isInputStep ? 'AI Gợi ý Key Results' : 'Kết quả gợi ý từ AI'}
              </h2>
              <p className="text-sm text-secondary">
                {isInputStep
                  ? 'Nhập thông tin để AI tạo gợi ý Key Results phù hợp'
                  : `Objective: ${objectiveTitle || 'Không có tiêu đề'}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isInputStep && (
            <div className="space-y-6">
              {/* Số lượng và Ngôn ngữ */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Số lượng gợi ý <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.count}
                    onChange={(e) => setFormData(prev => ({ ...prev, count: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border transition-all bg-background text-text focus:outline-none focus:ring-2 focus:border-primary ${
                      parseInt(formData.count) > 5
                        ? 'border-red-300 focus:ring-red-500/20'
                        : 'border-secondary/20 focus:ring-primary/20'
                    }`}
                  />
                  {parseInt(formData.count) > 5 && (
                    <p className="text-xs text-red-600 mt-1">
                      ❌ Số lượng gợi ý không được vượt quá 5
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Ngôn ngữ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">Tiếng Anh</option>
                  </select>
                </div>
              </div>

              {/* Ràng buộc (Optional) */}
              <div className="bg-secondary/5 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 text-secondary">
                  <Info size={16} />
                  <span className="text-sm font-medium">Ràng buộc tùy chọn</span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-secondary mb-2">Ngày hết hạn</label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-secondary mb-2">Đơn vị đo lường</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="VD: %, users, ..."
                      className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-secondary mb-2">Phương pháp đánh giá</label>
                    <select
                      value={formData.evaluation_method}
                      onChange={(e) => setFormData(prev => ({ ...prev, evaluation_method: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="">Tự động</option>
                      <option value="MAXIMIZE">Tối đa hóa</option>
                      <option value="MINIMIZE">Tối thiểu hóa</option>
                      <option value="TARGET">Đạt mục tiêu</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-secondary mb-2">Ngữ cảnh bổ sung</label>
                  <textarea
                    value={formData.context}
                    onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                    placeholder="VD: Startup fintech tập trung vào mobile payments, team có 3 kỹ sư..."
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border transition-all bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:border-primary resize-none ${
                      formData.context.length > 1000
                        ? 'border-red-300 focus:ring-red-500/20'
                        : 'border-secondary/20 focus:ring-primary/20'
                    }`}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <div>
                      {formData.context.length > 1000 && (
                        <p className="text-xs text-red-600">
                          Ngữ cảnh không được vượt quá 1000 ký tự
                        </p>
                      )}
                    </div>
                    <p className={`text-xs ${formData.context.length > 1000 ? 'text-red-600 font-medium' : 'text-secondary'}`}>
                      {formData.context.length} / 1000
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isResultsStep && generatedData && (
            <div className="space-y-6">
              {/* Thông tin tổng quan */}
              {generatedData.overall_feedback && (
                <div className="bg-linear-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-4">
                  <h3 className="font-medium text-violet-800 mb-2 flex items-center gap-2">
                    <Info size={16} />
                    Đánh giá tổng quan
                  </h3>
                  <p className="text-sm text-violet-700 mb-2">
                    {generatedData.overall_feedback.summary}
                  </p>
                  {generatedData.overall_feedback.alignment_analysis && (
                    <p className="text-sm text-violet-600">
                      <strong>Phân tích sự liên kết:</strong> {generatedData.overall_feedback.alignment_analysis}
                    </p>
                  )}
                  {generatedData.overall_feedback.risks?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-violet-700 font-medium">Rủi ro:</p>
                      <ul className="text-sm text-violet-600 list-disc list-inside">
                        {generatedData.overall_feedback.risks.map((risk, i) => (
                          <li key={i}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Danh sách suggestions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-text">
                    Danh sách gợi ý ({selectedSuggestions.size}/{generatedData.suggestions.length} đã chọn)
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const allIndices = new Set(generatedData.suggestions.map((_, i) => i));
                        setSelectedSuggestions(allIndices);
                      }}
                      className="text-sm text-primary hover:underline cursor-pointer"
                    >
                      Chọn tất cả
                    </button>
                    <span className="text-secondary">|</span>
                    <button
                      onClick={() => setSelectedSuggestions(new Set())}
                      className="text-sm text-secondary hover:underline cursor-pointer"
                    >
                      Bỏ chọn tất cả
                    </button>
                  </div>
                </div>

                {generatedData.suggestions.map((suggestion, index) => {
                  const isSelected = selectedSuggestions.has(index);
                  const edited = editedSuggestions[index] || suggestion;
                  const isExpanded = expandedEvaluations.has(index);
                  const evaluation = suggestion.evaluation || {};

                  return (
                    <div
                      key={index}
                      className={`border rounded-xl transition-all ${
                        isSelected
                          ? 'border-primary bg-orange-50/30'
                          : 'border-secondary/20 bg-white opacity-60'
                      }`}
                    >
                      {/* Header của suggestion */}
                      <div className="flex items-start gap-4 p-4">
                        <button
                          onClick={() => handleToggleSelection(index)}
                          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-primary border-primary'
                              : 'border-secondary/40 hover:border-primary'
                          }`}
                        >
                          {isSelected && <Check size={12} className="text-white" />}
                        </button>

                        <div className="flex-1 space-y-4">
                          {/* Title input */}
                          <div>
                            <label className="block text-xs font-medium text-secondary mb-1">
                              Tiêu đề Key Result
                            </label>
                            <input
                              type="text"
                              value={edited.title}
                              onChange={(e) => handleEditSuggestion(index, 'title', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                          </div>

                          {/* Các trường khác */}
                          <div className="grid grid-cols-5 gap-3">
                            <div>
                              <label className="block text-xs text-secondary mb-1">Giá trị đích</label>
                              <input
                                type="number"
                                value={edited.target_value}
                                onChange={(e) => handleEditSuggestion(index, 'target_value', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-secondary mb-1">Giá trị bắt đầu</label>
                              <input
                                type="number"
                                value={edited.start_value}
                                onChange={(e) => handleEditSuggestion(index, 'start_value', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-secondary mb-1">Đơn vị</label>
                              <input
                                type="text"
                                value={edited.unit}
                                onChange={(e) => handleEditSuggestion(index, 'unit', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-secondary mb-1">Trọng số (%)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={Math.round(edited.weight * 100)}
                                onChange={(e) => handleEditSuggestion(index, 'weight', parseFloat(e.target.value) / 100)}
                                className="w-full px-3 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-secondary mb-1">Ngày hết hạn</label>
                              <input
                                type="date"
                                value={edited.due_date || ''}
                                onChange={(e) => handleEditSuggestion(index, 'due_date', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              />
                            </div>
                          </div>

                          {/* Phương pháp đánh giá */}
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <label className="block text-xs text-secondary mb-1">Phương pháp đánh giá</label>
                              <select
                                value={edited.evaluation_method}
                                onChange={(e) => handleEditSuggestion(index, 'evaluation_method', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              >
                                {Object.entries(evaluationMethodLabels).map(([value, label]) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </select>
                            </div>
                            {evaluation.fit_score !== undefined && (
                              <div className="flex items-center gap-2 px-3 py-2 bg-violet-100 rounded-lg">
                                <span className="text-sm font-medium text-violet-700">
                                  Fit Score: {evaluation.fit_score}/100
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Đánh giá của AI - có thể mở rộng */}
                          {(evaluation.fit_reason || evaluation.issues?.length > 0) && (
                            <div className="border-t border-secondary/10 pt-3">
                              <button
                                onClick={() => handleToggleEvaluation(index)}
                                className="flex items-center gap-2 text-sm text-secondary hover:text-text transition-colors cursor-pointer"
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                Xem đánh giá chi tiết từ AI
                              </button>

                              {isExpanded && (
                                <div className="mt-3 space-y-2 bg-violet-50/50 rounded-lg p-3">
                                  {evaluation.fit_reason && (
                                    <p className="text-sm text-violet-700">
                                      <strong>Lý do phù hợp:</strong> {evaluation.fit_reason}
                                    </p>
                                  )}
                                  {evaluation.issues?.length > 0 && (
                                    <div>
                                      <p className="text-sm text-violet-700 font-medium">Vấn đề tiềm ẩn:</p>
                                      <ul className="text-sm text-violet-600 list-disc list-inside">
                                        {evaluation.issues.map((issue, i) => (
                                          <li key={i}>{issue}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-secondary/20">
          {isResultsStep && (
            <button
              onClick={() => setStep('input')}
              className="px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/10 transition-colors cursor-pointer"
            >
              Quay lại
            </button>
          )}
          {isInputStep && <div />}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/10 transition-colors cursor-pointer"
            >
              Hủy
            </button>

            {isInputStep ? (
              <button
                onClick={handleGenerate}
                disabled={generateMutation.isPending || parseInt(formData.count) > 5 || formData.context.length > 1000}
                className="flex items-center gap-2 px-6 py-2 bg-linear-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang tạo gợi ý...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Tạo gợi ý
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleProceedToConfirm}
                disabled={selectedSuggestions.size === 0}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Check size={18} />
                Tiếp tục ({selectedSuggestions.size})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGenerateKRModal;
