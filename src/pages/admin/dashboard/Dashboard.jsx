import { Building2, Users, Shield, CheckCircle, Loader, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCompanies } from '../../../services/company';
import CompanyCard from './components/CompanyCard';
import CompanyCardSkeleton from './components/CompanyCardSkeleton';

const Dashboard = () => {
  // Fetch params - chỉ dùng để gọi API, không thay đổi khi filter
  const [fetchParams] = useState({
    page: 1,
    per_page: 100,
  });

  // Filter states - chỉ lọc ở FE, không trigger API call
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('');

  // Fetch companies using react-query - chỉ gọi 1 lần khi mount
  const { data: apiResponse, isLoading, error } = useQuery({
    queryKey: ['companies', fetchParams],
    queryFn: () => getCompanies(fetchParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transform API data to match component structure
  const companiesData = useMemo(() => {
    if (!apiResponse?.data) return [];
    return apiResponse.data.map((company) => ({
      id: company.id,
      name: company.name,
      slug: company.slug,
      logo_url: company.logo_url,
      ai_plan: company.ai_plan,
      token_usage: company.token_usage || 0,
      limit_usage: company.usage_limit || 0,
      credit_cost: company.credit_cost || 0,
      employee_count: company.employee_count || 0,
      reset_date: company.reset_date,
      isActive: company.is_active,
    }));
  }, [apiResponse]);

  // Filter companies ở phía FE
  const filteredCompanies = useMemo(() => {
    return companiesData.filter((company) => {
      // Filter by search query (tên công ty)
      const matchesSearch = searchQuery === '' ||
        company.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by plan
      const matchesPlan = planFilter === '' || company.ai_plan === planFilter;

      return matchesSearch && matchesPlan;
    });
  }, [companiesData, searchQuery, planFilter]);

  // Tính toán stats từ dữ liệu gốc (không filter)
  const stats = {
    totalCompanies: companiesData.length,
    totalEmployees: companiesData.reduce((sum, c) => sum + (c.employee_count || 0), 0),
    totalAdminCompanies: companiesData.length,
    activePercentage: companiesData.length > 0
      ? Math.round(
          (companiesData.filter((c) => c.isActive).length / companiesData.length) * 100
        )
      : 0,
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Dashboard</h1>
          <p className="text-secondary">Tổng quan hệ thống</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-semibold">Lỗi khi tải dữ liệu</p>
          <p className="text-red-600 text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text mb-2">Dashboard</h1>
        <p className="text-secondary">Tổng quan hệ thống</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Companies */}
        <StatCard
          title="Tổng công ty"
          value={stats.totalCompanies}
          icon={Building2}
          bgColor="bg-orange-100"
          iconColor="text-primary"
          isLoading={isLoading}
        />

        {/* Total Employees */}
        <StatCard
          title="Tổng nhân viên"
          value={stats.totalEmployees}
          icon={Users}
          bgColor="bg-green-100"
          iconColor="text-green-500"
          isLoading={isLoading}
        />

        {/* Admin Companies */}
        <StatCard
          title="Admin Company"
          value={stats.totalAdminCompanies}
          icon={Shield}
          bgColor="bg-purple-100"
          iconColor="text-purple-500"
          isLoading={isLoading}
        />

        {/* Active Percentage */}
        <StatCard
          title="Hoạt động"
          value={`${stats.activePercentage}%`}
          icon={CheckCircle}
          bgColor="bg-yellow-100"
          iconColor="text-yellow-500"
          isLoading={isLoading}
        />
      </div>

      {/* Filters Section */}
      <div className="bg-background rounded-lg border border-secondary/20 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
            />
            <input
              type="text"
              placeholder="Tìm kiếm công ty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary whitespace-nowrap">Gói:</span>
            <div className="flex gap-2">
              {[
                { key: '', label: 'Tất cả' },
                { key: 'PAY_AS_YOU_GO', label: 'Enterprise' },
                { key: 'SUBSCRIPTION', label: 'Professional' },
                { key: 'FREE', label: 'Starter' },
              ].map((plan) => (
                <button
                  key={plan.key}
                  onClick={() => setPlanFilter(plan.key)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    planFilter === plan.key
                      ? 'bg-primary text-white'
                      : 'bg-secondary/10 text-secondary hover:bg-secondary/20'
                  }`}
                >
                  {plan.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading
          ? // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <CompanyCardSkeleton key={index} />
            ))
          : // Company cards (filtered)
            filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onClick={() => {
                  // Navigate to company detail or handle click
                  console.log('Clicked company:', company.id);
                }}
              />
            ))}
      </div>

      {/* Empty state */}
      {!isLoading && filteredCompanies.length === 0 && (
        <div className="text-center py-12 bg-background rounded-lg border border-secondary/20">
          <p className="text-secondary">Không tìm thấy công ty nào</p>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, bgColor, iconColor, isLoading }) => {
  return (
    <div className="bg-background rounded-lg p-6 border border-secondary/20 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-secondary mb-2">{title}</p>
          {isLoading ? (
            <Loader size={24} className="text-primary animate-spin" />
          ) : (
            <p className="text-3xl font-bold text-text">{value}</p>
          )}
        </div>
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon size={24} className={iconColor} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
