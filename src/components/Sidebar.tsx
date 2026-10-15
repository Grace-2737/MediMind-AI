import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Upload,
  TrendingUp,
  GitCompare,
  Sparkles,
  MessageSquare,
  Clock,
  Bell,
  BookOpen,
  User,
  Users,
  Stethoscope,
  Shield,
  Activity,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Compass,
  X,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSidebar } from '../context/SidebarContext';
import { StorageService } from '../services/storage';

export const Sidebar: React.FC = () => {
  const { role, isAuthenticated, currentPatient, currentUser } = useAuth();
  const { language, t } = useLanguage();
  const { isOpen, isCollapsed, toggleCollapse, closeMobile } = useSidebar();
  const isTa = language === 'ta';

  if (!isAuthenticated) return null;

  // Determine patient report count for next move hint
  const patientReports = StorageService.getReports().filter(
    (r) => r.patientId === currentPatient?.id || r.patientId === currentUser?.id
  );
  const hasReports = patientReports.length > 0;

  const patientNav = [
    { to: '/dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { to: '/upload', label: t('navUpload'), icon: Upload, highlight: !hasReports, badge: !hasReports ? 'NEXT' : undefined },
    { to: '/reports', label: t('navReports'), icon: FileText, count: patientReports.length },
    { to: '/trends', label: t('navTrends'), icon: TrendingUp },
    { to: '/compare', label: t('navCompare'), icon: GitCompare },
    { to: '/insights', label: t('navAiInsights'), icon: Sparkles },
    { to: '/ask-medimind', label: t('navAskMediMind'), icon: MessageSquare },
    { to: '/timeline', label: t('navTimeline'), icon: Clock },
    { to: '/reminders', label: t('navReminders'), icon: Bell },
    { to: '/glossary', label: t('navGlossary'), icon: BookOpen },
    { to: '/profile', label: t('navProfile'), icon: User },
  ];

  const doctorNav = [
    { to: '/doctor', label: t('navDoctorDashboard'), icon: LayoutDashboard },
    { to: '/doctor/patients', label: t('navPatients'), icon: Users },
    { to: '/doctor/notes', label: t('navDoctorNotes'), icon: Stethoscope },
    { to: '/doctor/follow-ups', label: t('navFollowUps'), icon: FileCheck },
    { to: '/profile', label: t('navDoctorProfile'), icon: User },
  ];

  const adminNav = [
    { to: '/admin', label: t('navAdminDashboard'), icon: LayoutDashboard },
    { to: '/admin/users', label: t('navUserManagement'), icon: Users, badge: '+Admin' },
    { to: '/admin/analytics', label: t('navSystemAnalytics'), icon: Activity },
    { to: '/admin/logs', label: t('navAiMonitoring'), icon: Shield },
    { to: '/profile', label: t('navSettings'), icon: User },
  ];

  const activeNav = role === 'patient' ? patientNav : role === 'doctor' ? doctorNav : adminNav;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Container with smooth sliding transitions */}
      <aside
        className={`fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-xs ${
          // Mobile: slide in/out
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          // Desktop: collapsed rail (w-18) vs expanded (w-64)
          isCollapsed ? 'lg:w-[72px]' : 'lg:w-64'
        } w-72`}
      >
        {/* Slider toggle handle button mounted on outer border */}
        <button
          onClick={toggleCollapse}
          type="button"
          className="hidden lg:flex absolute -right-3.5 top-5 z-50 w-7 h-7 rounded-full bg-white border border-slate-300 shadow-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 items-center justify-center transition-transform hover:scale-110"
          title={isCollapsed ? (isTa ? 'விகிதத்தை விரிக்கவும்' : 'Expand Sidebar') : (isTa ? 'விகிதத்தை சுருக்கவும்' : 'Collapse Sidebar')}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 text-slate-700" /> : <ChevronLeft className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Top: Header & Nav items */}
        <div className="py-4 px-3 space-y-2 overflow-y-auto overflow-x-hidden flex-1 scrollbar-thin">
          {/* Mobile close button */}
          <div className="flex lg:hidden items-center justify-between pb-2 mb-2 border-b border-slate-100 px-1">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {role === 'patient' ? t('portalPatient') : role === 'doctor' ? t('portalDoctor') : t('portalAdmin')}
            </span>
            <button
              onClick={closeMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Portal Label (hidden when collapsed) */}
          <div className="hidden lg:flex items-center justify-between px-2 pb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            {!isCollapsed && (
              <span>{role === 'patient' ? t('portalPatient') : role === 'doctor' ? t('portalDoctor') : t('portalAdmin')}</span>
            )}
          </div>

          {/* Next Move Quick Banner in Sidebar (when expanded) */}
          {!isCollapsed && role === 'patient' && !hasReports && (
            <NavLink
              to="/upload"
              onClick={closeMobile}
              className="block p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 hover:bg-teal-100/70 transition-all text-xs mb-3 group"
            >
              <div className="flex items-center gap-1.5 font-bold text-teal-900 mb-1">
                <Compass className="w-3.5 h-3.5 text-teal-700 animate-pulse" />
                <span>{isTa ? 'உங்கள் அடுத்த கட்டம்:' : 'Your Next Move:'}</span>
              </div>
              <p className="text-[11px] text-teal-800 leading-tight">
                {isTa ? 'ஆய்வக அறிக்கையை OCR ஸ்கேன் மூலம் பதிவேற்றவும்.' : 'Upload your lab report for instant OCR scanning & analysis.'}
              </p>
            </NavLink>
          )}

          {/* Nav Items */}
          <nav className="space-y-1">
            {activeNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMobile}
                  end={item.to === '/dashboard' || item.to === '/doctor' || item.to === '/admin'}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all group ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    } ${isCollapsed ? 'justify-center px-2 py-2.5' : ''}`
                  }
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105`} />
                  
                  {!isCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}

                  {!isCollapsed && (item as any).badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-700 border border-teal-300">
                      {(item as any).badge}
                    </span>
                  )}

                  {!isCollapsed && (item as any).count !== undefined && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200/70 text-slate-700">
                      {(item as any).count}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className={`p-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1 ${isCollapsed ? 'text-center' : ''}`}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center justify-between text-slate-400">
                <span>{t('statusLabel')}</span>
                <span className="font-semibold text-slate-800 capitalize">{role}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                MediMind AI Clinical Intelligence
              </p>
            </>
          ) : (
            <div className="text-center text-[10px] text-slate-400 font-mono">
              AI
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
