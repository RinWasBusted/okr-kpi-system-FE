import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { User_avatar } from '../../../../assets';
import { updateUserAvatar, deleteUserAvatar } from '../../../../services/user';

/**
 * ProfileHeader Component
 * Displays user profile header with avatar, name, and email
 */
const ProfileHeader = ({ user, onAvatarUpdate }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: ({ id, formData }) => updateUserAvatar(id, formData),
    onSuccess: (response) => {
      toast.success(response.message || 'Cập nhật ảnh đại diện thành công');
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      if (onAvatarUpdate) {
        onAvatarUpdate(response.data?.user?.avatar_url);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể cập nhật ảnh đại diện');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteUserAvatar(id),
    onSuccess: (response) => {
      toast.success(response.message || 'Đã xóa ảnh đại diện');
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      if (onAvatarUpdate) {
        onAvatarUpdate(null);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể xóa ảnh đại diện');
    },
  });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await uploadMutation.mutateAsync({ id: user.id, formData });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleChangePicture = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteAvatar = async () => {
    if (!user.avatar_url) return;
    await deleteMutation.mutateAsync(user.id);
  };

  return (
    <div className="bg-background rounded-2xl shadow-sm p-6 flex items-center gap-6">
      {/* Avatar */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-orange-50 border-2 border-orange-100">
          <img
            src={user.avatar_url || User_avatar}
            alt={user.full_name}
            className="w-full h-full object-cover"
          />
        </div>
        {isUploading && (
          <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="flex-1">
        <h2 className="text-xl font-bold text-text">{user.full_name}</h2>
        <p className="text-secondary">{user.email}</p>
        <button
          onClick={handleChangePicture}
          disabled={isUploading || uploadMutation.isPending}
          className="mt-3 px-4 py-2 text-sm font-medium bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
        >
          Thay đổi ảnh đại diện
        </button>
        {user.avatar_url && (
          <button
            onClick={handleDeleteAvatar}
            disabled={deleteMutation.isPending}
            className="mt-3 ml-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Xóa ảnh
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ProfileHeader;
