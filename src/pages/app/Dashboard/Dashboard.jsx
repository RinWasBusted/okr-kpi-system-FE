import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Activity,
  Target,
  TrendingUp,
} from 'lucide-react';
import { getMyCompany } from '../../../services/company';
import { getKPIAssignments } from '../../../services/kpi';
import { toast } from 'react-toastify';
import StatsSection from './components/StatsSection';
import TabNavigation from './components/TabNavigation';
import DashboardPlaceholder from './components/DashboardPlaceholder';

const Dashboard = () => {
  const { company_slug } = useParams();
  const [activeTab, setActiveTab] = useState('overall');

  // Fetch company stats
  const { data: companyData, isLoading: isCompanyLoading, error: companyError } = useQuery({
    queryKey: ['company', company_slug],
    queryFn: async () => {
      try {
        const response = await getMyCompany();
        return response.data;
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load company data');
        throw error;
      }
    },
  });

  // Fetch KPIs count
  const { data: kpisData, isLoading: isKPIsLoading } = useQuery({
    queryKey: ['kpis', company_slug, { per_page: 1 }],
    queryFn: async () => {
      try {
        const response = await getKPIAssignments({ per_page: 1 });
        return response.data;
      } catch (error) {
        // Silent error for KPI count - not critical
        return { meta: { total: 0 } };
      }
    },
  });

  const isLoading = isCompanyLoading || isKPIsLoading;

  // Prepare stats data
  const stats = [
    {
      title: 'Total Users',
      value: (companyData?.admin_count || 0) + (companyData?.employee_count || 0),
      icon: Users,
      color: 'orange',
      breakdown: `${companyData?.admin_count || 0} Admin | ${companyData?.employee_count || 0} Nhân sự`,
    },
    {
      title: 'Cycles',
      value: companyData?.active_cycles || 0,
      icon: Activity,
      color: 'blue',
      trend: null,
    },
    {
      title: 'Active OKRs',
      value: companyData?.total_objectives || 0,
      icon: Target,
      color: 'primary',
      trend: null,
    },
    {
      title: 'KPIs Assigned',
      value: kpisData?.meta?.total || 0,
      icon: TrendingUp,
      color: 'green',
      trend: null,
    },
  ];

  if (isLoading) {
    return <DashboardPlaceholder />;
  }

  if (companyError && !companyData) {
    return (
      <div className="p-6">
        <p className="text-red-500">Failed to load dashboard data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text">Dashboard</h1>
        <p className="text-secondary mt-1">Company performance overview and objective tracking</p>
      </div>

      {/* Tabs */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Stats Section */}
      {activeTab === 'overall' && (
        <div className="space-y-6">
          <StatsSection stats={stats} />

          {/* Placeholder for future charts */}
          <div className="bg-background border border-secondary/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-text mb-4">OKR Progress Over Time</h2>
            <div className="h-64 flex items-center justify-center bg-secondary/5 rounded-lg">
              <p className="text-secondary">Chart will be added here</p>
            </div>
          </div>

          <div className="bg-background border border-secondary/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Company KPI Trends</h2>
            <div className="h-64 flex items-center justify-center bg-secondary/5 rounded-lg">
              <p className="text-secondary">Chart will be added here</p>
            </div>
          </div>
        </div>
      )}

      {/* Objective Tree Tab */}
      {activeTab === 'tree' && (
        <div className="bg-background border border-secondary/20 rounded-lg p-6">
          <p className="text-secondary">Objective tree view will be added here</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;