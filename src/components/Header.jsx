import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Moon,
  Sun,
  Bell,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { getCurrentUser, refreshToken, logout } from '../services/auth';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../hooks/useAuth';

// Mock data cho notifications
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Reminder: Weekly Check-in due (Overdue 2 days)',
    time: '2 hours ago',
    read: false,
    type: 'reminder',
  },
  {
    id: 2,
    title: 'Your OKR "Q1 Revenue" has been approved',
    time: '5 hours ago',
    read: true,
    type: 'success',
  },
  {
    id: 3,
    title: 'New KPI metric assigned to you',
    time: '1 day ago',
    read: true,
    type: 'info',
  },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { setUser, clearAuth } = useAuthStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notiMenuRef = useRef(null);

  // Lấy company_slug từ URL nếu có
  const getCompanySlug = () => {
    const pathParts = location.pathname.split('/');
    if (pathParts[1] && pathParts[1] !== 'admin') {
      return pathParts[1];
    }
    return null;
  };

  // Fetch current user với React Query
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const response = await getCurrentUser();
        if (response.data?.user) {
          setUser(response.data.user);
          return response.data.user;
        }
        return null;
      } catch (error) {
        // Thử refresh token
        try {
          await refreshToken();
          // Thử lại sau khi refresh
          const retryResponse = await getCurrentUser();
          if (retryResponse.data?.user) {
            setUser(retryResponse.data.user);
            return retryResponse.data.user;
          }
        } catch (refreshError) {
          // Refresh cũng thất bại -> chưa đăng nhập
          clearAuth();
          const companySlug = getCompanySlug();
          if (companySlug) {
            navigate(`/${companySlug}/login`);
          } else {
            navigate('/admin/login');
          }
        }
        throw error;
      }
    },
    retry: false,
  });

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notiMenuRef.current && !notiMenuRef.current.contains(event.target)) {
        setIsNotiOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    try {
      await logout();
      clearAuth();
      const companySlug = getCompanySlug();
      if (companySlug) {
        navigate(`/${companySlug}/login`);
      } else {
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Lấy initials từ full_name
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // Placeholder loading cho avatar
  const AvatarPlaceholder = () => (
    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-secondary/20 animate-pulse" />
  );

  return (
    <header className="h-16 bg-background border-b border-secondary/20 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
      {/* Logo - chỉ hiển thị trên mobile, hoặc khi cần */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">O</span>
        </div>
        <span className="font-bold text-text text-sm">OKR Platform</span>
      </div>

      {/* Spacer cho desktop - để căn phải các icon */}
      <div className="hidden md:flex flex-1" />

      {/* Right side icons */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          className="p-2 rounded-lg text-text hover:bg-secondary/10 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notiMenuRef}>
          <button
            onClick={() => setIsNotiOpen(!isNotiOpen)}
            className="p-2 rounded-lg text-text hover:bg-secondary/10 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {/* Red dot indicator */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Notification Dropdown */}
          {isNotiOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-background border border-secondary/20 rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-secondary/20">
                <h3 className="font-semibold text-text">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {MOCK_NOTIFICATIONS.map((noti) => (
                  <div
                    key={noti.id}
                    className="px-4 py-3 hover:bg-secondary/5 border-b border-secondary/10 last:border-0 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          noti.read ? 'bg-secondary/30' : 'bg-primary'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm text-text">{noti.title}</p>
                        <p className="text-xs text-secondary mt-1">{noti.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="relative" ref={userMenuRef}>
          {isUserLoading ? (
            <AvatarPlaceholder />
          ) : (
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-secondary/10 transition-colors"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {getInitials(userData?.full_name)}
              </div>
            </button>
          )}

          {/* User Dropdown */}
          {isUserMenuOpen && userData && (
            <div className="absolute right-0 mt-2 w-64 bg-background border border-secondary/20 rounded-lg shadow-lg overflow-hidden">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-secondary/20">
                <p className="font-semibold text-text">{userData.full_name}</p>
                <p className="text-sm text-secondary">{userData.email}</p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    // Navigate to profile
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-text hover:bg-secondary/10 transition-colors text-left"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">Profile</span>
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    // Navigate to settings
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-text hover:bg-secondary/10 transition-colors text-left"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Settings</span>
                </button>
                <div className="border-t border-secondary/20 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
