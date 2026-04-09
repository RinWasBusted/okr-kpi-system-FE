import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Heart,
  Target,
  Zap,
} from 'lucide-react';
import { getMyCompanyStats } from '../../../services/company';
import { getCycles } from '../../../services/cycle';
import { toast } from 'react-toastify';
import StatsSection from './components/StatsSection';
import CycleTimeline from './components/CycleTimeline';
import TabNavigation from './components/TabNavigation';
import DashboardPlaceholder from './components/DashboardPlaceholder';

const Dashboard = () => {
  const { company_slug } = useParams();
  const [activeTab, setActiveTab] = useState('overall');

  // Fetch company stats
  const { data: statsData, isLoading: isStatsLoading, error: statsError } = useQuery({
    queryKey: ['company-stats', company_slug],
    queryFn: async () => {
      try {
        const response = await getMyCompanyStats();
        return response.data;
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load dashboard data');
        throw error;
      }
    },
  });

  // Fetch cycles for timeline
  const { data: cyclesData, isLoading: isCyclesLoading } = useQuery({
    queryKey: ['cycles', company_slug],
    queryFn: async () => {
      try {
        const response = await getCycles({ per_page: 100 });
        return response.data;
      } catch (error) {
        // Silently fail for timeline, don't block dashboard
        console.error('Failed to load cycles:', error);
        return [];
      }
    },
    retry: false,
  });

  // Prepare stats data
  const stats = [
    {
      title: 'Sức khỏe KPI',
      value: statsData?.kpi_health?.toFixed(1) || 0,
      icon: Heart,
      color: 'green',
      breakdown: `${statsData?.total_kpi || 0} KPI`,
      suffix: '%',
    },
    {
      title: 'Tiến độ OKR',
      value: statsData?.okr_progress?.toFixed(1) || 0,
      icon: Target,
      color: 'primary',
      breakdown: `${statsData?.total_okr || 0} Objective`,
      suffix: '%',
    },
    {
      title: 'Chi phí phát sinh',
      value: statsData?.credit_cost?.toFixed(2) || 0,
      icon: Zap,
      color: 'orange',
      breakdown: `${statsData?.token_usage || 0} / ${statsData?.usage_limit || 0} Token`,
      details: statsData?.ai_plan || 'FREE',
      suffix: '',
    },
  ];

  console.log("cycleData", cyclesData);

  const cycles = cyclesData? cyclesData : [];

  console.log("cycles", cycles);

  if (isStatsLoading) {
    return <DashboardPlaceholder />;
  }

  if (statsError && !statsData) {
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
          {/* Stats and Timeline Row - Responsive Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
            {/* Stats Cards - Take up 2/3 on large screens */}
            <div className="xl:col-span-2">
              <StatsSection stats={stats} />
            </div>

            {/* Timeline - Take up 1/3 on large screens */}
            <div className="xl:col-span-1" style={{ minHeight: '280px' }}>
              <CycleTimeline cycles={cycles} isLoading={isCyclesLoading} />
            </div>
          </div>

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
