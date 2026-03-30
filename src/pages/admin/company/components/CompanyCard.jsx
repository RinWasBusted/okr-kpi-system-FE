import { Building2, Eye } from 'lucide-react';

const CompanyCard = ({ company, onViewDetail, onManage }) => {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <Building2 size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-text">{company.name}</p>
            <p className="text-sm text-secondary">{company.slug}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            company.is_active
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {company.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-secondary">
        <span>Plan: Starter</span>
        <span>Admins: {company.admin_count ?? '-'}</span>
        <span>Users: {company.employee_count ?? '-'}</span>
      </div>
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={onManage}
          className="flex-1 px-3 py-2 border border-secondary/20 rounded-lg text-sm text-text hover:bg-secondary/5 transition-colors"
        >
          Manage
        </button>
        <button
          onClick={onViewDetail}
          className="flex items-center gap-1 px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
        >
          <Eye size={14} />
          Detail
        </button>
      </div>
    </div>
  );
};

export default CompanyCard;
