import { useState } from 'react';
import { Building2, MoreVertical, Edit, Eye, Power, Trash2 } from 'lucide-react';

const CompanyRow = ({ company, onViewDetail, onManage, onEdit, onSuspend, onDelete }) => {
  return (
    <tr className="hover:bg-secondary/5 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
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
              <Building2 size={20} className="text-primary" />
            </div>
          </div>
          <div>
            <p className="font-medium text-text">{company.name}</p>
            <p className="text-sm text-secondary">{company.slug}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            company.is_active
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {company.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
          Starter
        </span>
      </td>
      <td className="px-6 py-4 text-center text-text">
        {company.admin_count ?? '-'}
      </td>
      <td className="px-6 py-4 text-center text-text">
        {company.employee_count ?? '-'}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onManage}
            className="px-3 py-1.5 border border-secondary/20 rounded-lg text-sm text-text hover:bg-secondary/5 transition-colors"
          >
            Manage
          </button>
          <button
            onClick={onViewDetail}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
          >
            <Eye size={14} />
            Detail
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CompanyRow;
