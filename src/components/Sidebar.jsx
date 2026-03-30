import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Shield,
  Moon,
  Settings,
  ChevronDown,
  LogOut,
  Users,
  Calendar,
  Target,
  BarChart3,
  FileText,
  BookOpen,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { logout, getCurrentUser } from '../services/auth';
import { useAuthStore } from '../hooks/useAuth';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, setUser } = useAuthStore();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch current user info on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await getCurrentUser();
        if (response.data?.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };

    if (!user) {
      fetchCurrentUser();
    }
  }, [user, setUser]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Lưu thông tin trước khi xóa
      const companySlug = user?.company_slug;
      const role = user?.role;

      await logout();
      useAuthStore.setState({ user: null, isAuthenticated: false });

      // Redirect dựa trên role
      if (role === 'ADMIN_COMPANY' && companySlug) {
        navigate(`/${companySlug}/login`);
      } else {
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Navigation items configuration based on role
  const getNavItems = () => {
    // ADMIN_COMPANY: sử dụng path /:company_slug/app/
    if (user?.role === 'ADMIN_COMPANY') {
      const companySlug = user?.company_slug || 'company';
      return [
        {
          id: 1,
          title: 'Dashboard',
          icon: LayoutDashboard,
          path: `/${companySlug}/app/dashboard`,
        },
        {
          id: 2,
          title: 'Đơn vị',
          icon: Building2,
          path: `/${companySlug}/app/units`,
        },
        {
          id: 3,
          title: 'Nhân sự',
          icon: Users,
          path: `/${companySlug}/app/hr`,
        },
        {
          id: 4,
          title: 'Chu kỳ',
          icon: Calendar,
          path: `/${companySlug}/app/cycles`,
        },
        {
          id: 5,
          title: 'OKR',
          icon: Target,
          path: `/${companySlug}/app/okr`,
        },
        {
          id: 6,
          title: 'KPI',
          icon: BarChart3,
          path: `/${companySlug}/app/kpi`,
        },
        {
          id: 7,
          title: 'KPI Dictionary',
          icon: BookOpen,
          path: `/${companySlug}/app/kpi-dictionary`,
        },
        {
          id: 8,
          title: 'Báo cáo',
          icon: FileText,
          path: `/${companySlug}/app/reports`,
        },
      ];
    }

    // ADMIN: sử dụng path /admin/
    return [
      {
        id: 1,
        title: 'Dashboard',
        icon: LayoutDashboard,
        path: '/admin/dashboard',
      },
      {
        id: 2,
        title: 'Công ty',
        icon: Building2,
        path: '/admin/company',
      },
    ];
  };

  const navItems = getNavItems();

  const handleNavClick = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  return (
    <aside className="w-60 h-screen bg-background flex flex-col border-r border-secondary/20">
      {/* Header */}
      <div className="px-6 flex flex-col justify-center border-b border-secondary/20 h-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-text">OKR KPI</h1>
            <p className="text-xs text-text">Management</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={`w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 border border-transparent ${
                active
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'text-text hover:bg-secondary/10'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.title}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
