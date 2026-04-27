import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, ChevronDown, ChevronRight, Users, ArrowUpRight } from 'lucide-react';

/**
 * EmployeeUnitItem - Component hiển thị một Unit trong tree view cho Employee
 * @param {Object} unit - Dữ liệu unit
 * @param {number} level - Cấp độ lồng nhau (0 cho root)
 * @param {Set} expandedUnits - Set các unit ID đang expanded
 * @param {Function} toggleExpand - Hàm toggle expand/collapse
 * @param {boolean} isSelected - Unit có đang được chọn không
 * @param {Function} onSelect - Hàm callback khi click vào unit
 * @param {number} currentUserUnitId - Unit ID của user hiện tại (để hiển thị link Chi tiết)
 */
const EmployeeUnitItem = ({
  unit,
  level = 0,
  expandedUnits,
  toggleExpand,
  isSelected,
  onSelect,
  selectedUnit,
  currentUserUnitId,
}) => {
  const navigate = useNavigate();
  const { company_slug } = useParams();

  const subUnits = unit.sub_units || [];
  const hasChildren = subUnits.length > 0;
  const isExpanded = expandedUnits.has(unit.id);

  // Check if this is user's unit
  const isUserUnit = unit.id === currentUserUnitId;

  console.log('isUserUnit', isUserUnit, 'currentUserUnitId', currentUserUnitId, 'unit.id', unit.id);

  // Calculate indentation based on level
  const indentPadding = level * 24;

  return (
    <div className="w-full">
      {/* Unit Row Container */}
      <div
        className="relative"
        style={{ marginLeft: `${indentPadding}px` }}
      >
        {/* Connector line */}
        {level > 0 && (
          <div className="absolute -left-4 top-6 w-3 h-px bg-secondary/30" />
        )}

        {/* Main Card */}
        <div
          onClick={() => onSelect(unit)}
          className={`
            rounded-lg border transition-all duration-200 cursor-pointer mb-2
            ${isSelected
              ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-[0_0_15px_rgba(234,88,12,0.15)]'
              : 'border-secondary/20 bg-background hover:border-primary/30 hover:shadow-sm'
            }
          `}
        >
          <div className="p-4">
            <div className="flex items-center gap-3">
              {/* Expand/Collapse Button */}
              <div className="w-6 shrink-0">
                {hasChildren ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(unit.id);
                    }}
                    className="p-1 rounded hover:bg-secondary/20 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-secondary" />
                    ) : (
                      <ChevronRight size={16} className="text-secondary" />
                    )}
                  </button>
                ) : (
                  <span className="w-6" />
                )}
              </div>

              {/* Unit Icon */}
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                <Building2 size={20} className="text-primary" />
              </div>

              {/* Unit Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-text">{unit.name}</h3>
                  {isUserUnit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/${company_slug}/app/units/${unit.id}`);
                      }}
                      className="text-xs text-primary hover:underline flex items-center gap-0.5"
                    >
                      Chi tiết
                      <ArrowUpRight size={10} />
                    </button>
                  )}
                </div>
                <div className="text-sm text-secondary">
                  {unit.manager?.full_name || 'Chưa có quản lý'}
                  {unit.manager?.job_title && ` (${unit.manager.job_title})`}
                </div>
              </div>

              {/* Member Count */}
              <div className="flex items-center gap-1 text-sm text-secondary shrink-0">
                <Users size={14} />
                <span>{unit.member_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative mt-1">
          {/* Vertical line */}
          <div
            className="absolute top-0 bottom-0 w-px bg-secondary/20"
            style={{ left: `${indentPadding + 12}px` }}
          />
          {subUnits.map(child => (
            <EmployeeUnitItem
              key={child.id}
              unit={child}
              level={level + 1}
              expandedUnits={expandedUnits}
              toggleExpand={toggleExpand}
              isSelected={selectedUnit?.id === child.id}
              onSelect={onSelect}
              selectedUnit={selectedUnit}
              currentUserUnitId={currentUserUnitId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeUnitItem;
