import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Power, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { updateCompany } from '../../../../services/company';

const ActivateCompanyModal = ({ company, onClose, onSuccess }) => {
  const queryClient = useQueryClient();

  const activateMutation = useMutation({
    mutationFn: () => updateCompany(company.id, { is_active: true }),
    onSuccess: (response) => {
      toast.success(response.message || 'Company activated successfully');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to activate company');
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-secondary/20">
          <h2 className="text-xl font-bold text-text">Activate Company</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary/10 rounded-lg transition-colors">
            <X size={20} className="text-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-text">
            Are you sure you want to activate <strong>{company.name}</strong>?
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700">
              Users from this company will be able to access the platform again.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => activateMutation.mutate()}
              disabled={activateMutation.isPending}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {activateMutation.isPending && <Loader size={16} className="animate-spin" />}
              <Power size={16} />
              Activate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivateCompanyModal;
