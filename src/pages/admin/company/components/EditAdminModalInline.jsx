import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader, Camera } from 'lucide-react';
import { toast } from 'react-toastify';
import { updateCompanyAdmin, uploadCompanyAdminAvatar } from '../../../../services/adminCompany';

const EditAdminModalInline = ({ admin, companyId, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(admin.avatar_url || null);
  const [formData, setFormData] = useState({
    full_name: admin.full_name || '',
    email: admin.email || '',
  });

  const avatarMutation = useMutation({
    mutationFn: (file) => uploadCompanyAdminAvatar(companyId, admin.id, file),
    onSuccess: (response) => {
      toast.success(response.message || 'Avatar updated successfully');
      queryClient.invalidateQueries({ queryKey: ['companyAdmins', companyId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update avatar');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateCompanyAdmin(companyId, admin.id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Admin updated successfully');
      queryClient.invalidateQueries({ queryKey: ['companyAdmins', companyId] });
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update admin');
    },
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Upload avatar first if changed
    if (avatarFile) {
      await avatarMutation.mutateAsync(avatarFile);
    }

    updateMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-secondary/20">
          <h2 className="text-xl font-bold text-text">Edit Admin</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary/10 rounded-lg transition-colors">
            <X size={20} className="text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div
              onClick={handleAvatarClick}
              className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group border-2 border-secondary/20 hover:border-primary transition-colors"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-secondary/10 flex items-center justify-center">
                  <span className="text-2xl text-secondary font-medium">
                    {admin.full_name?.charAt(0).toUpperCase() || 'A'}
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
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleAvatarClick}
              className="mt-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Change Avatar
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
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
              disabled={updateMutation.isPending || avatarMutation.isPending}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {updateMutation.isPending || avatarMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size={16} className="animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAdminModalInline;
