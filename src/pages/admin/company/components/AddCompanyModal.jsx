import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Loader, Upload, Image } from 'lucide-react';
import { toast } from 'react-toastify';
import { createCompany } from '../../../../services/company';

const AddCompanyModal = ({ onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Cleanup URL object when unmount
  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const createMutation = useMutation({
    mutationFn: (data) => createCompany(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Company created successfully');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create company');
    },
  });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      // Revoke old preview URL if exists
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      file: logoFile,
    };
    createMutation.mutate(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-secondary/20">
          <h2 className="text-xl font-bold text-text">Add New Company</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary/10 rounded-lg transition-colors">
            <X size={20} className="text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
              placeholder="Enter company name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
              placeholder="company-slug"
              required
            />
            <p className="text-xs text-secondary mt-1">
              This will be used in the URL: /slug/login
            </p>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Company Logo
            </label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image size={24} className="text-primary/50" />
                )}
              </div>

              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 border border-secondary/20 rounded-lg text-sm text-text hover:bg-secondary/5 transition-colors"
                  >
                    <Upload size={16} />
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </button>

                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-3 py-2 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-secondary mt-2">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB
                </p>
              </div>
            </div>
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
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {createMutation.isPending && <Loader size={16} className="animate-spin" />}
              <Plus size={16} />
              Add Company
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCompanyModal;
