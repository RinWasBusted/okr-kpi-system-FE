import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, BarChart3, Edit, Trash2, ArrowUpRight, Eye, EyeOff, Users } from 'lucide-react';

// Visibility badge component
const VisibilityBadge = ({ visibility }) => {
  const getConfig = () => {
    switch (visibility) {
      case 'PUBLIC':
        return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'CÔNG KHAI', icon: Eye };
      case 'INTERNAL':
        return { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'NỘI BỘ', icon: Users };
      case 'PRIVATE':
        return { bg: 'bg-secondary/10', text: 'text-secondary', label: 'RIÊNG TƯ', icon: EyeOff };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: visibility?.toLowerCase() || 'Nội bộ', icon: Users };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
};

// Progress bar component
const ProgressBar = ({ percentage, color = 'bg-blue-500' }) => (
  <div className="h-2 bg-secondary/10 rounded-full overflow-hidden">
    <div
      className={`h-full ${color} rounded-full transition-all duration-300`}
      style={{ width: `${Math.min(percentage || 0, 100)}%` }}
    />
  </div>
);

// Cycle tooltip component
const CycleTooltip = ({ cycle }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!cycle) return <span className="text-secondary">Không có chu kỳ</span>;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <span
      className="relative inline-block cursor-help"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="text-secondary hover:text-text transition-colors border-b border-dotted border-secondary">
        {cycle.name}
      </span>
      {showTooltip && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-lg">
          <div className="font-medium">{cycle.name}</div>
          <div className="text-gray-300 mt-1">
            {formatDate(cycle.start_date)} - {formatDate(cycle.end_date)}
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800" />
        </div>
      )}
    </span>
  );
};

// Recursive KPI Item Component
const KPIItem = ({ kpi, level = 0, expandedKPIs, toggleExpand, isSearchMode = false, onUpdate, onEdit, onDelete }) => {
  const { company_slug } = useParams();
  // Use sub_assignments from tree mode (only in tree mode)
  const childKPIs = isSearchMode ? [] : (kpi.sub_assignments || []);
  const hasChildren = childKPIs.length > 0;
  const isExpanded = expandedKPIs.has(kpi.id);

  // Check permissions
  const canEdit = kpi.permission?.edit === true;
  const canDelete = kpi.permission?.delete === true;
  const canViewDetail = true;
  const hasActions = canEdit || canDelete || canViewDetail;

  const evaluationMethod = kpi.kpi_dictionary?.evaluation_method || 'Positive';
  const progressPercentage = kpi.progress_percentage || 0;

  const getProgressColor = (value) => {
    if (value >= 80) return 'bg-blue-500';
    if (value >= 50) return 'bg-blue-400';
    return 'bg-orange-400';
  };

  const progressColor = getProgressColor(progressPercentage);
  const indentPadding = level * 24;

  const formatValue = (value, unit) => {
    if (value === null || value === undefined) return '0' + (unit ? ` ${unit}` : '');
    if (unit === '%') return `${value}%`;
    if (unit === 'VNĐ') return `${value.toLocaleString('vi-VN')} VNĐ`;
    return `${value.toLocaleString('vi-VN')}${unit ? ` ${unit}` : ''}`;
  };

  return (
    <div className="w-full">
      {/* KPI Row Container */}
      <div
        className={`relative rounded-xl transition-all duration-200 ${level > 0 ? 'mt-2' : ''}`}
        style={{ marginLeft: `${indentPadding}px` }}
      >
        {/* Main Card */}
        <div
          className="bg-background rounded-xl border border-secondary/20 hover:shadow-md transition-shadow"
        >
          <div className="p-5">
            <div className="flex items-start gap-4">
              {/* Expand/Collapse Button */}
              <div className="w-6 shrink-0">
                {hasChildren ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(kpi.id);
                    }}
                    className="mt-1 p-1 rounded hover:bg-secondary/20 transition-colors cursor-pointer"
                  >
                    {isExpanded ? (
                      <ChevronDown size={18} className="text-secondary" />
                    ) : (
                      <ChevronRight size={18} className="text-secondary" />
                    )}
                  </button>
                ) : (
                  <span className="w-6" />
                )}
              </div>

              {/* KPI Icon */}
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <BarChart3 size={20} className="text-blue-500" />
              </div>

              {/* KPI Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-text text-lg">
                    {kpi.kpi_dictionary?.name || 'KPI không tên'}
                  </h3>
                  <VisibilityBadge visibility={kpi.visibility} />
                </div>

                <div className="flex items-center gap-2 text-sm text-secondary flex-wrap">
                  {kpi.owner && (
                    <>
                      <span>•</span>
                      <span className="text-text">
                        Phân công: {kpi.owner.full_name}
                        {kpi.owner.job_title && ` (${kpi.owner.job_title})`}
                      </span>
                    </>
                  )}
                  {kpi.unit && (
                    <>
                      <span>•</span>
                      <span>{kpi.unit.name}</span>
                    </>
                  )}
                  <span>•</span>
                  <CycleTooltip cycle={kpi.cycle} />
                </div>
              </div>

              {/* Values Section */}
              <div className="w-48 shrink-0 text-right">
                <div className="text-sm text-secondary mb-1">
                  {formatValue(kpi.current_value, kpi.kpi_dictionary?.unit)} / {formatValue(kpi.target_value, kpi.kpi_dictionary?.unit)}
                </div>
                <ProgressBar percentage={progressPercentage} color={progressColor} />
                <div className="text-xs text-secondary mt-1">
                  {progressPercentage.toFixed(1)}% - {evaluationMethod}
                </div>
              </div>

              {/* Action Buttons */}
              {hasActions && (
                <div className="flex items-center gap-2 border-l border-secondary/20 pl-4 shrink-0">
                  <Link
                    to={`/${company_slug}/app/kpi/${kpi.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Xem chi tiết"
                  >
                    Chi tiết
                    <ArrowUpRight size={14} />
                  </Link>
                  {canEdit && (
                    <button
                      onClick={() => onEdit?.(kpi)}
                      className="p-2 text-secondary hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <Edit size={18} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => onDelete?.(kpi)}
                      className="p-2 text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Children - Recursive rendering */}
      {hasChildren && isExpanded && (
        <div className="relative mt-2">
          {childKPIs.map((child) => (
            <KPIItem
              key={child.id}
              kpi={child}
              level={level + 1}
              expandedKPIs={expandedKPIs}
              toggleExpand={toggleExpand}
              isSearchMode={isSearchMode}
              onUpdate={onUpdate}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default KPIItem;
