import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Edit, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { updateCompany } from '../../../../services/company';

const AI_PLAN_OPTIONS = [
  { value: 'FREE', label: 'Free' },
  { value: 'SUBSCRIPTION', label: 'Subscription' },
  { value: 'PAY_AS_YOU_GO', label: 'Pay as you go' },
];

const EditCompanyModal = ({ company, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: company.name || '',
    slug: company.slug || '',
    ai_plan: company.ai_plan || 'FREE',
    usage_limit: company.usage_limit || 0,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateCompany(company.id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Company updated successfully');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['companyStats', company.id] });
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update company');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-secondary/20">
          <h2 className="text-xl font-bold text-text">Edit Company Information</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary/10 rounded-lg transition-colors">
            <X size={20} className="text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">Company Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">AI Plan</label>
            <select
              value={formData.ai_plan}
              onChange={(e) => setFormData({ ...formData, ai_plan: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text bg-background"
              required
            >
              {AI_PLAN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Usage Limit</label>
            <input
              type="number"
              min="0"
              value={formData.usage_limit}
              onChange={(e) => setFormData({ ...formData, usage_limit: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
              placeholder="Enter usage limit"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {updateMutation.isPending && <Loader size={16} className="animate-spin" />}
              <Edit size={16} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCompanyModal;
