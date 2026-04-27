import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { getCurrentUser } from '../../../services/auth';
import { useAuthStore } from '../../../hooks/useAuth';
import ProfileHeader from './components/ProfileHeader';
import PersonalInfoSection from './components/PersonalInfoSection';
import PasswordSecuritySection from './components/PasswordSecuritySection';

/**
 * ProfilePage Component
 * User profile page with personal info and security settings
 */
const ProfilePage = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  // Fetch current user data
  const { data, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await getCurrentUser();
      return response.data?.user;
    },
    retry: false,
    onSuccess: (userData) => {
      // Update auth store with fresh user data
      if (userData) {
        setUser(userData);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể tải thông tin người dùng');
    },
  });

  const user = data || null;

  const handleAvatarUpdate = (avatarUrl) => {
    if (user) {
      const updatedUser = { ...user, avatar_url: avatarUrl };
      setUser(updatedUser);
      queryClient.setQueryData(['currentUser'], updatedUser);
    }
  };

  const handleUserUpdate = (updatedUserData) => {
    if (updatedUserData) {
      setUser(updatedUserData);
      queryClient.setQueryData(['currentUser'], updatedUserData);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-100">
        <div className="flex items-center gap-3 text-secondary">
          <Loader size={24} className="animate-spin" />
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">Không thể tải thông tin. Vui lòng thử lại sau.</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['currentUser'] })}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">Trang cá nhân</h1>
        <p className="text-secondary">Quản lý thông tin tài khoản và bảo mật của bạn</p>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {/* Profile Header with Avatar */}
        <ProfileHeader user={user} onAvatarUpdate={handleAvatarUpdate} />

        {/* Personal Information Section */}
        <PersonalInfoSection user={user} onUserUpdate={handleUserUpdate} />

        {/* Password & Security Section */}
        <PasswordSecuritySection userEmail={user.email} />
      </div>
    </div>
  );
};

export default ProfilePage;
