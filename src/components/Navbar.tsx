import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Globe,
  User as UserIcon,
  LogOut,
  LogIn,
  Stethoscope,
  ShieldCheck,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSidebar } from '../context/SidebarContext';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, role, isAuthenticated, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { toggleSidebar, toggleCollapse, isCollapsed } = useSidebar();

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Zone 1: Sidebar Toggle Slider + Wordmark */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={() => {
                // On mobile toggle open, on desktop toggle collapse
                if (window.innerWidth < 1024) {
                  toggleSidebar();
                } else {
                  toggleCollapse();
                }
              }}
              type="button"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Slide Navigation Menu"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-slate-700" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-slate-700" />
              )}
            </button>
          )}

          <Link to="/" className="flex items-center gap-2 text-slate-900 group">
            <span className="text-lg font-bold tracking-tight text-slate-900">
              {t('appName')}
            </span>
          </Link>
        </div>

        {/* Zone 2: Navigation Links */}
        {isAuthenticated && (
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-600">
            <Link
              to={role === 'patient' ? '/dashboard' : role === 'doctor' ? '/doctor' : '/admin'}
              className="hover:text-slate-900 transition-colors"
            >
              {role === 'patient' ? t('navDashboard') : role === 'doctor' ? t('navDoctorDashboard') : t('navAdminDashboard')}
            </Link>
            {role === 'patient' && (
              <>
                <Link to="/reports" className="hover:text-slate-900 transition-colors">
                  {t('navReports')}
                </Link>
                <Link to="/upload" className="hover:text-slate-900 transition-colors flex items-center gap-1 font-semibold text-teal-700">
                  <span>{t('navUpload')}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                </Link>
                <Link to="/trends" className="hover:text-slate-900 transition-colors">
                  {t('navTrends')}
                </Link>
                <Link to="/compare" className="hover:text-slate-900 transition-colors">
                  {t('navCompare')}
                </Link>
                <Link to="/ask-medimind" className="hover:text-slate-900 transition-colors">
                  {t('navAskMediMind')}
                </Link>
              </>
            )}
            {role === 'doctor' && (
              <>
                <Link to="/doctor" className="hover:text-slate-900 transition-colors">
                  {t('navPatients')}
                </Link>
                <Link to="/doctor/notes" className="hover:text-slate-900 transition-colors">
                  {t('navDoctorNotes')}
                </Link>
                <Link to="/doctor/follow-ups" className="hover:text-slate-900 transition-colors">
                  {t('navFollowUps')}
                </Link>
              </>
            )}
            {role === 'admin' && (
              <>
                <Link to="/admin/users" className="hover:text-slate-900 transition-colors">
                  {t('navUserManagement')}
                </Link>
                <Link to="/admin/analytics" className="hover:text-slate-900 transition-colors">
                  {t('navSystemAnalytics')}
                </Link>
              </>
            )}
          </nav>
        )}

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Login shortcut */}
          {(!isAuthenticated || role !== 'admin') && (
            <Link
              to="/login?role=admin"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              title="Admin Portal Login"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>{language === 'ta' ? 'நிர்வாகி உள்நுழைவு' : 'Admin Login'}</span>
            </Link>
          )}

          {/* Language Toggle: English | தமிழ் */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors shadow-2xs"
            title="Toggle Language: English / தமிழ்"
          >
            <Globe className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-semibold">{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* Authentication State */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900"
              >
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-[11px]">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden xl:block text-left leading-tight">
                  <span className="font-semibold block text-slate-900 truncate max-w-[110px]">
                    {currentUser?.name}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {role}
                  </span>
                </div>
              </Link>
              <button
                onClick={handleSignOut}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                title={t('signOut')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('signIn')}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
