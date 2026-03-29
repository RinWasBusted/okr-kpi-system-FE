import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Building2, Loader, AlertCircle } from 'lucide-react';
import { getUnits } from '../../../services/unit';
import UnitItem from './components/UnitItem';

const UnitPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUnits, setExpandedUnits] = useState(new Set());

  // Fetch units data
  const { data: unitsResponse, isLoading, error } = useQuery({
    queryKey: ['units'],
    queryFn: () => getUnits({ per_page: 100 }),
  });

  const units = unitsResponse?.data || [];

  // Auto-expand all units when data is loaded
  useEffect(() => {
    if (units.length > 0) {
      const allIds = units.map(u => u.id);
      setExpandedUnits(new Set(allIds));
    }
  }, [units]);

  // API already returns nested tree structure via sub_units
  // No need to build tree manually

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

  // Filter root units by search query
  const filteredRootUnits = useMemo(() => {
    if (!searchQuery) return units;
    return units.filter(unit =>
      unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.manager?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [units, searchQuery]);

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
      <div>
        <h1 className="text-3xl font-bold text-text mb-2">Đơn vị</h1>
        <p className="text-secondary">Quản lý cơ cấu tổ chức</p>
      </div>

      {/* Search Box */}
      <div className="bg-background rounded-xl border border-secondary/20 p-6">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="Tìm kiếm đơn vị..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-secondary/20 bg-background text-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Units Tree */}
      <div className="bg-background rounded-xl border border-secondary/20 overflow-hidden">
        <div className="p-6 border-b border-secondary/20">
          <h2 className="text-lg font-semibold text-text">Cơ cấu tổ chức</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size={32} className="text-primary animate-spin" />
          </div>
        ) : units.length === 0 ? (
          <div className="text-center py-12 text-secondary">
            <Building2 size={48} className="mx-auto mb-4 opacity-50" />
            <p>Chưa có đơn vị nào</p>
          </div>
        ) : (
          <div className="p-4">
            {filteredRootUnits.map(unit => (
              <UnitItem
                key={unit.id}
                unit={unit}
                level={0}
                expandedUnits={expandedUnits}
                toggleExpand={toggleExpand}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitPage;
