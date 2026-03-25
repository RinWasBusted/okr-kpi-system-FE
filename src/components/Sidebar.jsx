import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Shield,
  Moon,
  Settings,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Navigation items configuration
  const navItems = [
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
    {
      id: 3,
      title: 'Tài khoản Admin',
      icon: Shield,
      path: '/admin/admin-accounts',
    },
  ];

  const handleNavClick = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    localStorage.setItem('theme', theme === 'light' ? 'dark' : 'light');
  }

  return (
    <aside className="w-60 h-screen bg-background flex flex-col border-r border-secondary/20">
      {/* Header */}
      <div className="p-6 border-b border-secondary/20">
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

      {/* Bottom Section */}
      <div className="border-t border-secondary/20 p-3 space-y-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={handleThemeToggle}
          className="w-full cursor-pointer flex  items-center gap-3 px-4 py-3 rounded-lg text-text hover:bg-secondary/10 transition-all duration-200"
        >
          <Moon size={20} />
          <span className="text-sm font-medium">Chế độ tối</span>
        </button>

        {/* Settings */}
        <button className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg text-text hover:bg-secondary/10 transition-all duration-200">
          <Settings size={20} />
          <span className="text-sm font-medium">Cài đặt</span>
        </button>

        {/* Profile Bar */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-full cursor-pointer flex items-center justify-between px-4 py-3 rounded-lg text-text hover:bg-secondary/10 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                AP
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Admin Platform</p>
                <p className="text-xs text-gray-500">Quản lý nền tảng</p>
              </div>
            </div>
            <ChevronDown 
              size={16} 
              className={`text-gray-400 transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-background border border-secondary/10 rounded-lg overflow-hidden p-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-text hover:bg-secondary/10 transition-all duration-200 rounded-lg">
                <LogOut size={18} className="text-text" />
                <span className="text-sm font-medium text-text">Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
