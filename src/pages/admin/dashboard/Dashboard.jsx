import { ChevronRight, Building2, Users, Shield, CheckCircle, Loader } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCompanies } from '../../../services/company';

const Dashboard = () => {
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 100,
  });

  // Fetch companies using react-query
  const { data: apiResponse, isLoading, error } = useQuery({
    queryKey: ['companies', filters],
    queryFn: () => getCompanies(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transform API data to match component structure
  const companiesData = useMemo(() => {
    if (!apiResponse?.data) return [];
    return apiResponse.data.map((company) => ({
      id: company.id,
      name: company.name,
      slug: company.slug,
      employeeCount: company.employee_count,
      adminCount: company.admin_count,
      isActive: company.is_active,
    }));
  }, [apiResponse]);

  // Sắp xếp companies - active trước, inactive sau
  const sortedCompanies = useMemo(() => {
    return [...companiesData].sort((a, b) => {
      if (a.isActive === b.isActive) return 0;
      return a.isActive ? -1 : 1;
    });
  }, [companiesData]);

  // Tính toán stats
  const stats = {
    totalCompanies: companiesData.length,
    totalEmployees: companiesData.reduce((sum, c) => sum + c.employeeCount, 0),
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

      {/* Company List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-text">Danh sách công ty</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size={32} className="text-primary animate-spin" />
          </div>
        ) : sortedCompanies.length > 0 ? (
          <div className="space-y-3">
            {sortedCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg border border-secondary/20 p-6 text-center">
            <p className="text-secondary">Không có công ty nào</p>
          </div>
        )}
      </div>
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

// Company Card Component
const CompanyCard = ({ company }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/admin/company/${company.slug}-${company.id}`);
  };

  return (
    <button
      onClick={handleCardClick}
      className="w-full bg-background rounded-lg border border-secondary/20 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4 flex-1">
          {/* Company Icon */}
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
            <Building2 size={24} className="text-primary" />
          </div>

          {/* Company Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-text">{company.name}</h3>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  company.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {company.isActive ? 'Hoạt động' : 'Không hoạt động'}
              </span>
            </div>
            <p className="text-sm text-secondary mt-1">{company.slug}</p>
          </div>

          {/* Stats */}
          <div className="flex gap-8 text-center">
            <div>
              <p className="text-lg font-bold text-text">{company.employeeCount}</p>
              <p className="text-xs text-secondary">nhân viên</p>
            </div>
            <div>
              <p className="text-lg font-bold text-text">{company.adminCount}</p>
              <p className="text-xs text-secondary">admin</p>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="p-2 hover:bg-secondary/10 rounded-lg transition-all duration-200 ml-4">
          <ChevronRight size={20} className="text-secondary" />
        </div>
      </div>
    </button>
  );
};

export default Dashboard;