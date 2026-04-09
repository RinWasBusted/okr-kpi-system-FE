import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Moon,
  Sun,
  Bell,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { logout } from '../services/auth';
import { getUnreadCount } from '../services/notification';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../hooks/useAuth';
import { User_avatar } from '../assets';
import NotificationBoard from './NotificationBoard';

const Header = () => {
  const navigate = useNavigate();
  const { company_slug } = useParams();
  const { theme, setTheme } = useTheme();
  const { user, clearAuth } = useAuthStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userMenuRef = useRef(null);
  const notiMenuRef = useRef(null);
  const notificationBoardRef = useRef(null);

  // Lấy company_slug từ URL nếu có
  const getCompanySlug = () => {
    return company_slug || null;
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data?.unread_count || 0);
    } catch {
      // Silent error
    }
  };

  // Fetch unread count on mount và interval
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  // Refresh khi đóng/mở notification
  useEffect(() => {
    if (isNotiOpen) {
      fetchUnreadCount();
    }
  }, [isNotiOpen]);

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

  return (
    <header className="h-16 bg-background border-b border-secondary/20 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">

      {/* Spacer cho desktop - để căn phải các icon */}
      <div className="flex flex-1" />

      {/* Right side icons */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          className="p-2 rounded-lg text-text hover:bg-secondary/10 transition-colors cursor-pointer"
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
            onMouseEnter={() => notificationBoardRef.current?.preload()}
            className="p-2 rounded-lg text-text hover:bg-secondary/10 transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {/* Badge số lượng chưa đọc */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1.5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          <div
            className={`absolute right-0 mt-2 bg-background border border-secondary/20 rounded-lg shadow-lg overflow-hidden z-50 ${
              !isNotiOpen && 'hidden'
            }`}
          >
            <NotificationBoard ref={notificationBoardRef} onUnreadCountChange={fetchUnreadCount} />
          </div>
        </div>

        {/* User Avatar */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-secondary/10 transition-colors cursor-pointer"
          >
            <img
              src={user?.avatar_url || User_avatar}
              alt="User Avatar"
              className="w-9 h-9 md:w-10 md:h-10 rounded-full"
            />
          </button>

          {/* User Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-background border border-secondary/20 rounded-lg shadow-lg overflow-hidden">
              {/* User Info Header */}
              {user ? (
                <div className="px-4 py-3 border-b border-secondary/20">
                  <p className="font-semibold text-text">{user.full_name}</p>
                  <p className="text-sm text-secondary">{user.email}</p>
                </div>
              ) : (
                <div className="px-4 py-3 border-b border-secondary/20">
                  <p className="font-semibold text-text">User</p>
                  <p className="text-sm text-secondary">Not available</p>
                </div>
              )}

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate(user.role === 'ADMIN' ? `/admin/profile` : `/${getCompanySlug()}/app/profile`);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-text hover:bg-secondary/10 transition-colors text-left cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">Profile</span>
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    // Navigate to settings
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-text hover:bg-secondary/10 transition-colors text-left cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Settings</span>
                </button>
                <div className="border-t border-secondary/20 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left cursor-pointer"
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
