import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, AlertOctagon, ArrowRight, Target } from 'lucide-react';
import { toast } from 'react-toastify';
import { getObjectives } from '../../../../services/objective';

const STATUS_CONFIG = {
  AT_RISK: {
    label: 'At Risk',
    icon: AlertTriangle,
    colorClass: 'text-amber-500',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/20',
  },
  CRITICAL: {
    label: 'Critical',
    icon: AlertOctagon,
    colorClass: 'text-red-500',
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-500/20',
  },
};

const ObjectiveItem = ({ objective, companySlug }) => {
  const navigate = useNavigate();
  const status = objective.progress_status;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.AT_RISK;
  const StatusIcon = config.icon;

  const handleViewDetail = () => {
    navigate(`/${companySlug}/objectives/${objective.id}`);
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${config.borderClass} ${config.bgClass} hover:bg-opacity-20 transition-colors`}
    >
      <div className={`mt-0.5 ${config.colorClass}`}>
        <StatusIcon size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-text truncate" title={objective.title}>
          {objective.title}
        </h4>

        <div className="flex items-center gap-2 mt-1.5 text-xs text-secondary">
          {objective.owner?.full_name && (
            <span className="truncate">{objective.owner.full_name}</span>
          )}
          {objective.unit?.name && (
            <>
              <span className="text-secondary/50">|</span>
              <span className="truncate">{objective.unit.name}</span>
            </>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Target size={12} className="text-secondary/70" />
            <span className="text-xs text-secondary">{objective.progress_percentage}%</span>
            <span className={`text-xs font-medium ${config.colorClass}`}>{config.label}</span>
          </div>

          <button
            onClick={handleViewDetail}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            Chi tiết
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

const LoadingPlaceholder = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="flex items-start gap-3 p-3 rounded-lg border border-secondary/20 animate-pulse"
      >
        <div className="w-4 h-4 mt-0.5 rounded-full bg-secondary/20" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-secondary/20 rounded w-3/4" />
          <div className="h-3 bg-secondary/10 rounded w-1/2" />
          <div className="flex items-center justify-between">
            <div className="h-3 bg-secondary/10 rounded w-1/4" />
            <div className="h-3 bg-secondary/10 rounded w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const AtRiskObjectives = () => {
  const { company_slug } = useParams();

  // Fetch AT_RISK objectives
  const { data: atRiskData, isLoading: isAtRiskLoading } = useQuery({
    queryKey: ['objectives', company_slug, 'at-risk'],
    queryFn: async () => {
      try {
        const response = await getObjectives({
          progress_status: 'AT_RISK',
          mode: 'list',
          per_page: 10,
        });
        return response.data || [];
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load at-risk objectives');
        return [];
      }
    },
    retry: false,
  });

  // Fetch CRITICAL objectives
  const { data: criticalData, isLoading: isCriticalLoading } = useQuery({
    queryKey: ['objectives', company_slug, 'critical'],
    queryFn: async () => {
      try {
        const response = await getObjectives({
          progress_status: 'CRITICAL',
          mode: 'list',
          per_page: 10,
        });
        return response.data || [];
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load critical objectives');
        return [];
      }
    },
    retry: false,
  });

  const isLoading = isAtRiskLoading || isCriticalLoading;
  const atRiskObjectives = atRiskData || [];
  const criticalObjectives = criticalData || [];
  const totalCount = atRiskObjectives.length + criticalObjectives.length;

  return (
    <div className="bg-background border border-secondary/20 rounded-lg p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" />
          <h3 className="text-base font-semibold text-text">Objectives cần chú ý</h3>
          {totalCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-500 rounded-full">
              {totalCount}
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <LoadingPlaceholder />
      ) : totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
            <Target size={20} className="text-green-500" />
          </div>
          <p className="text-sm text-secondary">Không có objective nào cần chú ý</p>
          <p className="text-xs text-secondary/70 mt-1">Tất cả objectives đều đang on track</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {criticalObjectives.map((objective) => (
            <ObjectiveItem key={`critical-${objective.id}`} objective={objective} companySlug={company_slug} />
          ))}
          {atRiskObjectives.map((objective) => (
            <ObjectiveItem key={`at-risk-${objective.id}`} objective={objective} companySlug={company_slug} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AtRiskObjectives;
