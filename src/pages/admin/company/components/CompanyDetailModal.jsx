import { useQuery } from '@tanstack/react-query';
import { X, Building2 } from 'lucide-react';
import { getCompanyStats } from '../../../../services/company';

const CompanyDetailModal = ({ company, onClose }) => {
  const { data: statsResponse, isLoading: isStatsLoading } = useQuery({
    queryKey: ['companyStats', company.id],
    queryFn: () => getCompanyStats(company.id),
    enabled: !!company.id,
  });

  const stats = statsResponse?.data || {};

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Placeholder component cho dữ liệu đang loading
  const PlaceholderBox = () => (
    <div className="h-5 bg-secondary/20 rounded animate-pulse" />
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary/20 sticky top-0 bg-background">
          <h2 className="text-xl font-bold text-text">Company Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary/10 rounded-lg transition-colors">
            <X size={20} className="text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Company Header với Logo */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full items-center justify-center ${company.logo_url ? 'hidden' : 'flex'}`}>
                <Building2 size={32} className="text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-text">{company.name}</h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  company.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {company.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Info Grid - Hiển thị các trường theo yêu cầu */}
          <div className="grid grid-cols-2 gap-4">
            {/* Admin Count */}
            <div className="bg-secondary/5 rounded-lg p-4">
              <p className="text-sm text-secondary mb-1">Admin Count</p>
              {isStatsLoading ? (
                <PlaceholderBox />
              ) : (
                <p className="font-semibold text-text">{stats.admin_count ?? '-'}</p>
              )}
            </div>

            {/* Employee Count */}
            <div className="bg-secondary/5 rounded-lg p-4">
              <p className="text-sm text-secondary mb-1">Employee Count</p>
              {isStatsLoading ? (
                <PlaceholderBox />
              ) : (
                <p className="font-semibold text-text">{stats.employee_count ?? '-'}</p>
              )}
            </div>

            {/* AI Plan */}
            <div className="bg-secondary/5 rounded-lg p-4">
              <p className="text-sm text-secondary mb-1">AI Plan</p>
              {isStatsLoading ? (
                <PlaceholderBox />
              ) : (
                <p className="font-semibold text-text">{stats.ai_plan ?? '-'}</p>
              )}
            </div>

            {/* Token Usage */}
            <div className="bg-secondary/5 rounded-lg p-4">
              <p className="text-sm text-secondary mb-1">Token Usage</p>
              {isStatsLoading ? (
                <PlaceholderBox />
              ) : (
                <p className="font-semibold text-text">
                  {stats.token_usage ? stats.token_usage.toLocaleString() : '-'}
                </p>
              )}
            </div>

            {/* Usage Limit */}
            <div className="bg-secondary/5 rounded-lg p-4">
              <p className="text-sm text-secondary mb-1">Usage Limit</p>
              {isStatsLoading ? (
                <PlaceholderBox />
              ) : (
                <p className="font-semibold text-text">
                  {stats.usage_limit ? stats.usage_limit.toLocaleString() : '-'}
                </p>
              )}
            </div>

            {/* Credit Cost */}
            <div className="bg-secondary/5 rounded-lg p-4">
              <p className="text-sm text-secondary mb-1">Credit Cost</p>
              {isStatsLoading ? (
                <PlaceholderBox />
              ) : (
                <p className="font-semibold text-text">
                  {stats.credit_cost ? `$${stats.credit_cost}` : '-'}
                </p>
              )}
            </div>

            {/* Created At - full width */}
            <div className="bg-secondary/5 rounded-lg p-4 col-span-2">
              <p className="text-sm text-secondary mb-1">Created At</p>
              <p className="font-semibold text-text">{formatDate(company.created_at)}</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-secondary/20">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/5 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailModal;
