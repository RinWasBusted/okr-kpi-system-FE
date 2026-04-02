import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2, Users, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { getUnitDetail } from '../../../services/unit';
import OKRList from './components/OKRList';
import KPIList from './components/KPIList';
import MemberList from './components/MemberList';
import MemberListSkeleton from './components/MemberListSkeleton';

const UnitDetailPage = () => {
  const { unitId, company_slug } = useParams();
  const navigate = useNavigate();

  // Fetch unit details only
  const { data: unitData, isLoading: unitLoading, error: unitError } = useQuery({
    queryKey: ['unit', unitId],
    queryFn: () => getUnitDetail(unitId),
    enabled: !!unitId,
  });

  const unit = unitData?.data;

  // Calculate statistics from unit data only
  const memberCount = unit?.member_count || 0;

  if (unitError) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate(`/${company_slug}/app/units`)}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-red-600" />
            <div>
              <p className="text-red-800 font-semibold">Không tìm thấy đơn vị</p>
              <p className="text-red-600 text-sm mt-1">Unit ID: {unitId}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <button
        onClick={() => navigate(`/${company_slug}/app/units`)}
        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
      >
        <ArrowLeft size={20} />
        Quay lại
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Unit Info Card */}
          {unitLoading ? (
            <div className="bg-background rounded-xl border border-secondary/20 p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-secondary/20 shrink-0 animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="h-7 w-48 bg-secondary/20 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-secondary/20 rounded animate-pulse" />
                  <div className="h-4 w-40 bg-secondary/20 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-background rounded-xl border border-secondary/20 p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                  <Building2 size={32} className="text-orange-500" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-text mb-2">{unit.name}</h1>
                  <div className="space-y-1 text-sm text-secondary">
                    <p>Quản lý: <span className="text-text font-medium">{unit.manager?.full_name || 'Chưa có'}</span></p>
                    <p>Tổng số thành viên: <span className="text-text font-medium">{memberCount}</span></p>
                    {unit.parent_unit && (
                      <p>Đơn vị cha: <span className="text-text font-medium">{unit.parent_unit.name}</span></p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* OKR Stats */}
            <div className="bg-background rounded-lg border border-secondary/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-secondary">OKR</span>
                <Target size={20} className="text-orange-500" />
              </div>
              {unitLoading ? (
                <div className="h-2 bg-secondary/20 rounded-full animate-pulse" />
              ) : (
                <div className="h-2 bg-secondary/15 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500/30 rounded-full animate-pulse" />
                </div>
              )}
            </div>

            {/* KPI Stats */}
            <div className="bg-background rounded-lg border border-secondary/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-secondary">KPI</span>
                <TrendingUp size={20} className="text-green-500" />
              </div>
              {unitLoading ? (
                <div className="h-2 bg-secondary/20 rounded-full animate-pulse" />
              ) : (
                <div className="h-2 bg-secondary/15 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500/30 rounded-full animate-pulse" />
                </div>
              )}
            </div>

            {/* Members Stats */}
            <div className="bg-background rounded-lg border border-secondary/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-secondary">Thành viên</span>
                <Users size={20} className="text-blue-500" />
              </div>
              {unitLoading ? (
                <div className="h-8 w-12 bg-secondary/20 rounded animate-pulse" />
              ) : (
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-text">{memberCount}</p>
                  <p className="text-xs text-secondary">Người trong đơn vị</p>
                </div>
              )}
            </div>
          </div>

          {/* OKR List - Loads independently */}
          <OKRList unitId={unitId} />

          {/* KPI List - Loads independently */}
          <KPIList unitId={unitId} />
        </div>

        {/* Right Sidebar - Members */}
        <div className="lg:col-span-1">
          {unitLoading ? (
            <MemberListSkeleton />
          ) : (
            <MemberList unit={unit} memberCount={memberCount} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitDetailPage;
