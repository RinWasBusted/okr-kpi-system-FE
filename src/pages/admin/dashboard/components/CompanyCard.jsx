import { ChevronRight, Users } from 'lucide-react';

/**
 * CompanyCard Component
 * Displays company information with token usage progress
 *
 * @param {Object} props
 * @param {Object} props.company - Company data
 * @param {number} props.company.id - Company ID
 * @param {string} props.company.name - Company name
 * @param {string} props.company.logo_url - Company logo URL
 * @param {'FREE'|'SUBSCRIPTION'|'PAY_AS_YOU_GO'} props.company.ai_plan - AI plan type
 * @param {number} props.company.token_usage - Current token usage
 * @param {number} props.company.limit_usage - Usage limit (for calculating percentage)
 * @param {number} props.company.credit_cost - Credit cost
 * @param {number} [props.company.employee_count] - Number of employees
 * @param {string} [props.company.reset_date] - Reset date string
 * @param {Function} props.onClick - Click handler
 */
const CompanyCard = ({ company, onClick }) => {
  const {
    name,
    logo_url,
    ai_plan,
    token_usage,
    limit_usage,
    employee_count,
    reset_date,
  } = company;

  // Calculate usage percentage
  const usagePercentage = limit_usage > 0
    ? Math.round((token_usage / limit_usage) * 100)
    : 0;

  // Plan configuration mapping
  const planConfig = {
    FREE: {
      label: 'Starter',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      barColor: 'bg-green-500',
    },
    SUBSCRIPTION: {
      label: 'Professional',
      bgColor: 'bg-cyan-100',
      textColor: 'text-cyan-600',
      barColor: 'bg-cyan-500',
    },
    PAY_AS_YOU_GO: {
      label: 'Enterprise',
      bgColor: 'bg-orange-100',
      textColor: 'text-primary',
      barColor: 'bg-primary',
    },
  };

  const plan = planConfig[ai_plan] || planConfig.FREE;

  // Format numbers
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  return (
    <div
      onClick={onClick}
      className="bg-background rounded-lg border border-secondary/20 p-6 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Header: Name + Arrow */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {logo_url ? (
            <img
              src={logo_url}
              alt={name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-secondary">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h3 className="text-lg font-semibold text-text">{name}</h3>
        </div>
        <ChevronRight size={20} className="text-secondary" />
      </div>

      {/* Plan Badge */}
      <div className="mb-4">
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${plan.bgColor} ${plan.textColor}`}
        >
          {plan.label}
        </span>
      </div>

      {/* Token Usage Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-secondary">Tokens sử dụng</span>
          <span className={`text-sm font-semibold ${plan.textColor}`}>
            {usagePercentage}%
          </span>
        </div>
        {/* Progress Bar */}
        <div className="h-2 bg-secondary/20 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full ${plan.barColor} transition-all duration-300`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-secondary">
          {formatNumber(token_usage)} / {formatNumber(limit_usage)}
        </p>
      </div>

      {/* Footer: Employee count & Reset date */}
      <div className="flex items-center justify-between pt-3 border-t border-secondary/10">
        <div className="flex items-center gap-1.5 text-sm text-secondary">
          <Users size={14} />
          <span>{employee_count || 0} người dùng</span>
        </div>
        {reset_date && (
          <span className="text-xs text-secondary">
            Reset: {reset_date}
          </span>
        )}
      </div>
    </div>
  );
};

export default CompanyCard;
