import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Edit, Loader, Camera } from 'lucide-react';
import { toast } from 'react-toastify';
import { updateCompany, uploadCompanyLogo } from '../../../../services/company';

const EditCompanyModal = ({ company, onClose, onSuccess, onCancel }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(company.logo_url || null);
  const [formData, setFormData] = useState({
    name: company.name || '',
    slug: company.slug || '',
  });

  const logoMutation = useMutation({
    mutationFn: (file) => uploadCompanyLogo(company.id, file),
    onSuccess: (response) => {
      toast.success(response.message || 'Logo updated successfully');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update logo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateCompany(company.id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Company updated successfully');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update company');
    },
  });

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Upload logo first if changed
    if (logoFile) {
      await logoMutation.mutateAsync(logoFile);
    }

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
          {/* Logo Section */}
          <div className="flex flex-col items-center">
            <div
              onClick={handleLogoClick}
              className="relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer group border-2 border-secondary/20 hover:border-primary transition-colors bg-secondary/5"
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Company logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl text-secondary font-bold">
                    {company.name?.charAt(0).toUpperCase() || 'C'}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleLogoClick}
              className="mt-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Change Logo
            </button>
          </div>

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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={updateMutation.isPending || logoMutation.isPending}
              className="flex-1 px-4 py-2 border border-secondary/20 rounded-lg text-text hover:bg-secondary/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending || logoMutation.isPending}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {(updateMutation.isPending || logoMutation.isPending) && (
                <Loader size={16} className="animate-spin" />
              )}
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
