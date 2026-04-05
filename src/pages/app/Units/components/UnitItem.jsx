import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, ChevronDown, ChevronRight, Users, Target, ArrowUpRight, Edit, Trash2 } from 'lucide-react';
import EditUnitModal from './EditUnitModal';
import DeleteUnitConfirmModal from './DeleteUnitConfirmModal';

// Recursive Unit Item Component
const UnitItem = ({ unit, level = 0, expandedUnits, toggleExpand, searchQuery, isSearchMode = false }) => {
  const navigate = useNavigate();
  const { company_slug } = useParams();

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Use sub_units from API response (only in tree mode)
  const subUnits = isSearchMode ? [] : (unit.sub_units || []);
  const hasChildren = subUnits.length > 0;
  const isExpanded = expandedUnits.has(unit.id);

  // Determine color based on progress/health
  const getProgressColor = (value) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const okrColor = getProgressColor(unit.okr_progress || 0);
  const kpiColor = getProgressColor(unit.kpi_health || 0);

  // Filter children by search query
  const filteredChildren = useMemo(() => {
    if (!searchQuery) return subUnits;
    return subUnits.filter(child =>
      child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.manager?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subUnits, searchQuery]);

  // Calculate indentation based on level
  const indentPadding = level * 24;

  return (
    <>
      <div className="w-full">
        {/* Unit Row Container */}
        <div
          className={`relative rounded-lg transition-all duration-200 ${level > 0 ? 'mt-2' : ''}`}
          style={{ marginLeft: `${indentPadding}px` }}
        >
          {/* Main Card */}
          <div className="bg-background rounded-lg border border-secondary/20 hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex items-center gap-4">
                {/* Expand/Collapse Button */}
                <div className="w-6 shrink-0">
                  {hasChildren ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(unit.id);
                      }}
                      className="p-1 rounded hover:bg-secondary/20 transition-colors cursor-pointer"
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
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                  <Building2 size={24} className="text-primary" />
                </div>

                {/* Unit Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-text text-lg">{unit.name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/${company_slug}/app/units/${unit.id}`);
                      }}
                      className="text-sm text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      Chi tiết
                      <ArrowUpRight size={12} />
                    </button>
                  </div>
                  <div className="text-sm text-secondary">
                    {unit.manager?.full_name || 'Chưa có quản lý'}
                    {unit.manager?.role && ` (${unit.manager.role})`}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-secondary">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {unit.member_count || 0} thành viên
                    </span>
                    <span className="flex items-center gap-1">
                      <Target size={12} />
                      {unit.okr_count || 0} OKR
                    </span>
                    <span className="flex items-center gap-1">
                      <Target size={12} className="rotate-45" />
                      {unit.kpi_count || 0} KPI
                    </span>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="flex items-center gap-6 shrink-0">
                  {/* OKR Progress */}
                  <div className="w-36">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-secondary">OKR Progress</span>
                      <span className="font-semibold text-text">{unit.okr_progress || 0}%</span>
                    </div>
                    <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${okrColor} rounded-full transition-all duration-300`}
                        style={{ width: `${unit.okr_progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* KPI Health */}
                  <div className="w-36">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-secondary">KPI Health</span>
                      <span className="font-semibold text-text">{unit.kpi_health || 0}%</span>
                    </div>
                    <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${kpiColor} rounded-full transition-all duration-300`}
                        style={{ width: `${unit.kpi_health || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {unit?.permission?.editable && (
                  <div className="flex items-center gap-2 border-l border-secondary/20 pl-4">
                    {unit?.permission?.editable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 text-secondary hover:text-primary hover:bg-orange-100 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <Edit size={18} />
                    </button>
                    )}
                    {unit?.permission?.deletable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDeleteModalOpen(true);
                      }}
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
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="relative mt-2">
            {filteredChildren.map(child => (
              <UnitItem
                key={child.id}
                unit={child}
                level={level + 1}
                expandedUnits={expandedUnits}
                toggleExpand={toggleExpand}
                searchQuery={searchQuery}
                isSearchMode={isSearchMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditUnitModal
          unit={unit}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <DeleteUnitConfirmModal
          unit={unit}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </>
  );
};

export default UnitItem;
