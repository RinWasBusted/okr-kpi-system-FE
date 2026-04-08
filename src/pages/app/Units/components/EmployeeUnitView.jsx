import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Building2, AlertCircle, Loader2 } from 'lucide-react';
import { getUnits } from '../../../../services/unit';
import { useAuthStore } from '../../../../hooks/useAuth';
import EmployeeUnitItem from './EmployeeUnitItem';
import EmployeeUnitMemberList from './EmployeeUnitMemberList';

/**
 * EmployeeUnitView - Component hiển thị Units tree view cho Employee
 * Hiển thị cây đơn vị bên trái và danh sách nhân viên của đơn vị được chọn bên phải
 */
const EmployeeUnitView = () => {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUnits, setExpandedUnits] = useState(new Set());
  const [selectedUnit, setSelectedUnit] = useState(null);

  const currentUserUnitId = user?.unit_id;

  // Fetch units data (tree mode for initial display)
  const { data: unitsTreeResponse, isLoading: isLoadingTree, error } = useQuery({
    queryKey: ['units', 'tree'],
    queryFn: () => getUnits({ per_page: 100, mode: 'tree' }),
  });

  // Fetch units data (list mode in background for search)
  const { data: unitsListResponse, isLoading: isLoadingList } = useQuery({
    queryKey: ['units', 'list'],
    queryFn: () => getUnits({ per_page: 100, mode: 'list' }),
  });

  const unitsTree = unitsTreeResponse?.data || [];
  const unitsList = unitsListResponse?.data || [];

  // Determine which data to display based on search state
  const isSearchActive = searchQuery.trim().length > 0;
  const displayUnits = isSearchActive ? unitsList : unitsTree;
  const isLoading = isSearchActive ? isLoadingList : isLoadingTree;

  // Auto-expand all units when tree data is loaded (only for tree mode)
  // Auto-select first unit or user's unit
  useEffect(() => {
    if (!isSearchActive && unitsTree.length > 0) {
      const allIds = collectAllUnitIds(unitsTree);
      setExpandedUnits(new Set(allIds));

      // Auto-select user's unit if exists, otherwise select first unit
      if (currentUserUnitId) {
        const userUnit = findUnitById(unitsTree, currentUserUnitId);
        if (userUnit) {
          setSelectedUnit(userUnit);
        } else {
          setSelectedUnit(unitsTree[0]);
        }
      } else {
        setSelectedUnit(unitsTree[0]);
      }
    }
  }, [unitsTree, isSearchActive, currentUserUnitId]);

  // Helper function to collect all unit IDs for auto-expand
  const collectAllUnitIds = (units) => {
    const ids = [];
    const traverse = (unitList) => {
      unitList.forEach(unit => {
        ids.push(unit.id);
        if (unit.sub_units?.length > 0) {
          traverse(unit.sub_units);
        }
      });
    };
    traverse(units);
    return ids;
  };

  // Helper function to find unit by ID in tree
  const findUnitById = (units, id) => {
    for (const unit of units) {
      if (unit.id === id) return unit;
      if (unit.sub_units?.length > 0) {
        const found = findUnitById(unit.sub_units, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Toggle expand/collapse
  const toggleExpand = (unitId) => {
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
  };

  // Handle unit selection
  const handleSelectUnit = (unit) => {
    setSelectedUnit(unit);
  };

  // Filter units by search query (only applies to list mode)
  const filteredUnits = useMemo(() => {
    if (!isSearchActive) return displayUnits;
    return displayUnits.filter(unit =>
      unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.manager?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [displayUnits, searchQuery, isSearchActive]);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-red-600" />
            <div>
              <p className="text-red-800 font-semibold">Lỗi khi tải dữ liệu đơn vị</p>
              <p className="text-red-600 text-sm mt-1">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text mb-1">Units</h1>
          <p className="text-secondary text-sm">View company structure and employee list</p>
        </div>
      </div>

      {/* Search Box */}
      <div className="bg-background rounded-xl border border-secondary/20 p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="Search units..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Organization Structure */}
        <div className="lg:col-span-2">
          <div className="bg-background rounded-xl border border-secondary/20 overflow-hidden">
            <div className="p-4 border-b border-secondary/20">
              <div className="flex items-center gap-2 text-text">
                <Building2 size={18} className="text-primary" />
                <span className="font-semibold">Organization Structure</span>
              </div>
            </div>

            <div className="p-4 max-h-[calc(100vh-280px)] overflow-y-auto">
              {isLoading ? (
                // Loading state
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 border border-secondary/20 rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-secondary/20 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-40 bg-secondary/20 rounded animate-pulse" />
                        <div className="h-4 w-32 bg-secondary/20 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredUnits.length === 0 ? (
                <div className="text-center py-12 text-secondary">
                  <Building2 size={48} className="mx-auto mb-4 opacity-50" />
                  <p>{isSearchActive ? 'No units found' : 'No units available'}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {isSearchActive ? (
                    // List mode for search
                    filteredUnits.map(unit => (
                      <div
                        key={unit.id}
                        onClick={() => handleSelectUnit(unit)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 mb-2
                          ${selectedUnit?.id === unit.id
                            ? 'border-primary bg-orange-50 ring-1 ring-primary/20'
                            : 'border-secondary/20 bg-background hover:border-primary/30 hover:shadow-sm'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                            <Building2 size={20} className="text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-text">{unit.name}</h3>
                            <p className="text-sm text-secondary">
                              {unit.manager?.full_name || 'No manager'}
                              {unit.manager?.job_title && ` (${unit.manager.job_title})`}
                            </p>
                          </div>
                          <div className="text-sm text-secondary">
                            {unit.member_count || 0} members
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Tree mode
                    filteredUnits.map(unit => (
                      <EmployeeUnitItem
                        key={unit.id}
                        unit={unit}
                        level={0}
                        expandedUnits={expandedUnits}
                        toggleExpand={toggleExpand}
                        isSelected={selectedUnit?.id === unit.id}
                        onSelect={handleSelectUnit}
                        currentUserUnitId={currentUserUnitId}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Employee List */}
        <div className="lg:col-span-1">
          <EmployeeUnitMemberList unit={selectedUnit} />
        </div>
      </div>
    </div>
  );
};

export default EmployeeUnitView;
