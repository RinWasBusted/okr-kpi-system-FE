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
import { getObjectives } from '../../../services/objective';
import { toast } from 'react-toastify';
import StatsSection from './components/StatsSection';
import CycleTimeline from './components/CycleTimeline';
import TabNavigation from './components/TabNavigation';
import DashboardPlaceholder from './components/DashboardPlaceholder';
import AtRiskObjectives from './components/AtRiskObjectives';
import AtRiskKPIs from './components/AtRiskKPIs';
import OKRHierarchyView from '../OKR/components/OKRHierarchyView';

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
        toast.error(error.response?.data?.error?.message || 'Failed to load dashboard data');
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

  // Fetch objectives for tree view
  const { data: treeResponse, isLoading: isLoadingTree } = useQuery({
    queryKey: ['objectives', 'tree', company_slug],
    queryFn: async () => {
      try {
        const response = await getObjectives({
          mode: 'tree',
          include_key_results: false,
          per_page: 100,
        });
        return response.data;
      } catch (error) {
        console.error('Failed to load objectives:', error);
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

  const cycles = cyclesData || [];
  const treeObjectives = treeResponse || [];

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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {/* Stats Cards */}
            <div>
              <StatsSection stats={stats} />
            </div>

            {/* Timeline - Generous width on large screens */}
            <div style={{ minHeight: '280px' }}>
              <CycleTimeline cycles={cycles} isLoading={isCyclesLoading} />
            </div>
          </div>

          {/* At Risk Lists */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            <AtRiskObjectives />
            <AtRiskKPIs />
          </div>
        </div>
      )}

      {/* Objective Tree Tab */}
      {activeTab === 'tree' && (
        <div>
          {isLoadingTree ? (
            <div className="flex items-center justify-center h-96 bg-background rounded-xl border border-secondary/20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : treeObjectives.length === 0 ? (
            <div className="bg-background rounded-xl border border-secondary/20 p-12 text-center">
              <Target size={48} className="mx-auto mb-4 opacity-50 text-secondary" />
              <p className="text-secondary">Chưa có Objective nào</p>
            </div>
          ) : (
            <OKRHierarchyView objectives={treeObjectives} />
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
