import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Calendar,
  Target,
  BarChart3,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../hooks/useAuth';
import WebLogo from '../assets/Weblogo.webp';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, setUser } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile and handle resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Close menu when width changes to >= 1024px
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize mobile state on mount
  useEffect(() => {
    const isMobileInitial = window.innerWidth < 1024;
    if (isMobileInitial) {
      setIsMobileMenuOpen(false);
    }
  }, []);

  // Navigation items configuration based on role
  const getNavItems = () => {
    // ADMIN_COMPANY: sử dụng path /:company_slug/app/
    if (user?.role === 'ADMIN_COMPANY' || user?.role === 'EMPLOYEE') {
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
          path: `/${companySlug}/app/employees`,
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
          title: 'Mẫu KPI',
          icon: BookOpen,
          path: `/${companySlug}/app/kpi-dictionaries`,
        }
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
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button - appears on header when sidebar is closed */}
      {isMobile && (
        <button
          onClick={toggleMobileMenu}
          className="fixed top-3 left-5 z-100 p-2 hover:bg-secondary/10 rounded-lg transition-colors duration-200 lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu size={24} className="text-text" />
        </button>
      )}

      {/* Overlay for mobile */}
        <div
          className={`fixed duration-100 inset-0 bg-black/50 ${isMobileMenuOpen ? 'z-30 opacity-100' : 'hidden z-0 opacity-0'} lg:hidden`}
          onClick={closeMobileMenu}
        />

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-60 h-screen bg-background z-50 flex flex-col border-r border-secondary/20  transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobile && !isMobileMenuOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
        style={{
          transform:
            isMobile && !isMobileMenuOpen ? 'translateX(-100%)' : 'translateX(0)',
        }}
      >
      {/* Header */}
      <div className="px-6 flex flex-col justify-center border-b border-secondary/20 h-16 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={WebLogo} alt="OKR KPI Logo" className="w-10 h-10 rounded-lg object-cover" />
            <div>
              <h1 className="text-sm font-bold text-text">OKR KPI</h1>
              <p className="text-xs text-text">Management</p>
            </div>
          </div>
          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={closeMobileMenu}
              className="lg:hidden p-2 hover:bg-secondary/10 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X size={20} className="text-text" />
            </button>
          )}
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
              onClick={() => {
                handleNavClick(item.path);
                closeMobileMenu();
              }}
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
    </>
  );
};

export default Sidebar;
