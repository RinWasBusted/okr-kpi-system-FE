import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, ChevronDown, ChevronRight } from 'lucide-react';

// Recursive Unit Item Component
const UnitItem = ({ unit, level = 0, expandedUnits, toggleExpand, searchQuery }) => {
  const navigate = useNavigate();
  const { company_slug } = useParams();
  // Use sub_units from API response
  const subUnits = unit.sub_units || [];
  const hasChildren = subUnits.length > 0;
  const isExpanded = expandedUnits.has(unit.id);

  // Mock progress data (API doesn't provide these yet)
  const okrCount = Math.floor(Math.random() * 5);
  const kpiCount = Math.floor(Math.random() * 3);
  const okrProgress = okrCount > 0 ? Math.floor(Math.random() * 40) + 40 : 0;
  const kpiProgress = kpiCount > 0 ? Math.floor(Math.random() * 30) + 60 : 0;
  const overallProgress = okrCount + kpiCount > 0 ? Math.round((okrProgress + kpiProgress) / 2) : 0;

  // Filter children by search query
  const filteredChildren = useMemo(() => {
    if (!searchQuery) return subUnits;
    return subUnits.filter(child =>
      child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.manager?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subUnits, searchQuery]);

  // Calculate indentation based on level
  const indentPadding = level * 32; // 32px per level

  return (
    <div className="w-full">
      {/* Unit Row Container */}
      <div
        className={`
          relative rounded-lg transition-all duration-200
          ${level > 0 ? 'mt-2' : ''}
          hover:bg-secondary/10
        `}
        style={{ marginLeft: `${indentPadding}px` }}
      >
        {/* Connector line for child items */}
        {level > 0 && (
          <div className="absolute -left-4 top-0 bottom-0 w-px bg-secondary/30" />
        )}

        {/* Horizontal connector */}
        {level > 0 && (
          <div className="absolute -left-4 top-6 w-4 h-px bg-secondary/30" />
        )}

        {/* Main Card */}
        <div 
          className="bg-background rounded-lg border border-secondary/20 p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate(`/${company_slug}/app/units/${unit.id}`)}
        >
          {/* Main Row */}
          <div className="flex items-center justify-between">
            {/* Left: Expand Button + Icon + Name + Manager */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Expand/Collapse Button */}
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(unit.id)}
                  className="p-1 rounded hover:bg-secondary/20 transition-colors shrink-0"
                >
                  {isExpanded ? (
                    <ChevronDown size={18} className="text-secondary" />
                  ) : (
                    <ChevronRight size={18} className="text-secondary" />
                  )}
                </button>
              ) : (
                <span className="w-7 shrink-0" />
              )}

              {/* Unit Icon */}
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                <Building2 size={20} className="text-orange-500" />
              </div>

              {/* Unit Info */}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-text truncate">{unit.name}</h3>
                <p className="text-sm text-secondary">
                  Quản lý: {unit.manager?.full_name || 'Chưa có'} • {unit.member_count || 0} thành viên
                </p>
              </div>
            </div>

            {/* Right: OKR/KPI Counts */}
            <div className="flex items-center gap-6 mr-6">
              <div className="text-center min-w-12">
                <span className="text-xs text-secondary uppercase block">OKR</span>
                <p className="text-lg font-semibold text-text">{okrCount}</p>
              </div>
              <div className="text-center min-w-12">
                <span className="text-xs text-secondary uppercase block">KPI</span>
                <p className="text-lg font-semibold text-text">{kpiCount}</p>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="text-center min-w-16">
              <span className="text-xs text-secondary uppercase block">Tiến độ</span>
              <p className={`text-lg font-bold ${overallProgress >= 50 ? 'text-green-600' : 'text-orange-500'}`}>
                {overallProgress}%
              </p>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="flex gap-4 mt-4 ml-12">
            {/* OKR Progress */}
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-secondary">OKR</span>
                <span className="text-orange-500 font-medium">{okrProgress}%</span>
              </div>
              <div className="h-2 bg-secondary/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${okrProgress}%` }}
                />
              </div>
            </div>

            {/* KPI Progress */}
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-secondary">KPI</span>
                <span className="text-green-500 font-medium">{kpiProgress}%</span>
              </div>
              <div className="h-2 bg-secondary/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${kpiProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Children - Render with connector lines */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {/* Vertical connector line for children */}
          <div
            className="absolute top-0 bottom-0 w-px bg-secondary/30"
            style={{ left: `${indentPadding + 16}px` }}
          />
          {filteredChildren.map(child => (
            <UnitItem
              key={child.id}
              unit={child}
              level={level + 1}
              expandedUnits={expandedUnits}
              toggleExpand={toggleExpand}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UnitItem;
