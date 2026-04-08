import { Trash2, Edit } from 'lucide-react';

/**
 * Evaluation method display configuration
 */
const getEvaluationMethodConfig = (method) => {
  switch (method) {
    case 'MAXIMIZE':
      return {
        label: 'Tối đa hóa (↑ tốt)',
        color: 'text-green-600 bg-green-50',
      };
    case 'MINIMIZE':
      return {
        label: 'Tối thiểu hóa (↓ tốt)',
        color: 'text-red-600 bg-red-50',
      };
    case 'TARGET':
      return {
        label: 'Mục tiêu (= tốt)',
        color: 'text-blue-600 bg-blue-50',
      };
    default:
      return {
        label: method || 'Không xác định',
        color: 'text-gray-600 bg-gray-50',
      };
  }
};

/**
 * KPIDictionaryCard Component
 * Displays a KPI dictionary card with details
 *
 * @param {Object} props
 * @param {Object} props.kpi - KPI dictionary data
 * @param {Function} props.onEdit - Edit callback
 * @param {Function} props.onDelete - Delete callback
 */
const KPIDictionaryCard = ({ kpi, onEdit, onDelete }) => {
  const evaluationConfig = getEvaluationMethodConfig(kpi.evaluation_method);
  const permission = kpi.permission || {};

  // Determine unit name display
  const getUnitName = () => {
    if (kpi.unit) {
      return kpi.unit.name;
    }
    if (kpi.unit_id) {
      return 'Đơn vị #' + kpi.unit_id;
    }
    return 'Toàn công ty';
  };

  return (
    <div className="bg-background rounded-xl border border-secondary/20 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-text text-lg truncate">
              {kpi.name}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {getUnitName()}
            </span>
          </div>
          {kpi.description && (
            <p className="text-sm text-secondary mt-1 line-clamp-2">
              {kpi.description}
            </p>
          )}
        </div>

        {/* Delete Button Only */}
        <div className="flex items-center gap-1 ml-2 shrink-0">
          {permission.editable && (
            <button
              onClick={() => onEdit?.(kpi)}
              className="p-2 text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
              title="Chỉnh sửa"
            >
              <Edit size={18} />
            </button>
          )}
          {permission.deletable && (
            <button
              onClick={() => onDelete?.(kpi)}
              className="p-2 text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Xóa"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Details Grid - Based on actual API response */}
      <div className="space-y-3">
        {/* Description Row - Primary info from API */}
        {kpi.description && (
          <div className="flex items-start gap-2 text-sm">
            <span className="text-secondary shrink-0 w-24">Mô tả:</span>
            <span className="text-text text-xs flex-1 line-clamp-2">
              {kpi.description}
            </span>
          </div>
        )}

        {/* Unit of Measurement Row */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary">Đơn vị đo lường:</span>
          <span className="text-text font-medium font-mono bg-secondary/10 px-2 py-0.5 rounded">
            {kpi.unit || '-'}
          </span>
        </div>

        {/* Evaluation Method Row */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary">Phương thức đánh giá:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${evaluationConfig.color}`}>
            {evaluationConfig.label}
          </span>
        </div>

        {/* Unit Scope Row */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary">Phạm vi:</span>
          <span className="text-text font-medium">
            {kpi.org_unit?.name || 'Toàn công ty'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default KPIDictionaryCard;
