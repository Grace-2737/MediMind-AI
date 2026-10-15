import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { SidebarProvider } from './context/SidebarContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginView } from './pages/LoginView';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { UploadReportView } from './pages/patient/UploadReportView';
import { ReportsListView } from './pages/patient/ReportsListView';
import { ReportDetailView } from './pages/patient/ReportDetailView';
import { CompareReportsView } from './pages/patient/CompareReportsView';
import { HealthTrendsView } from './pages/patient/HealthTrendsView';
import { AiInsightsView } from './pages/patient/AiInsightsView';
import { AskMediMindView } from './pages/patient/AskMediMindView';
import { HealthTimelineView } from './pages/patient/HealthTimelineView';
import { RemindersView } from './pages/patient/RemindersView';
import { GlossaryView } from './pages/patient/GlossaryView';
import { ProfileView } from './pages/patient/ProfileView';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorPatientView } from './pages/doctor/DoctorPatientView';
import { DoctorNotesView } from './pages/doctor/DoctorNotesView';
import { DoctorFollowUpsView } from './pages/doctor/DoctorFollowUpsView';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUserManagement } from './pages/admin/AdminUserManagement';
import { AdminAiAnalytics } from './pages/admin/AdminAiAnalytics';

const AppLayout: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-teal-100 selection:text-teal-900">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto relative">
        <Sidebar />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginView />} />

            {/* Patient Routes */}
            <Route path="/dashboard" element={<PatientDashboard />} />
            <Route path="/upload" element={<UploadReportView />} />
            <Route path="/reports" element={<ReportsListView />} />
            <Route path="/reports/:id" element={<ReportDetailView />} />
            <Route path="/compare" element={<CompareReportsView />} />
            <Route path="/trends" element={<HealthTrendsView />} />
            <Route path="/insights" element={<AiInsightsView />} />
            <Route path="/ask-medimind" element={<AskMediMindView />} />
            <Route path="/timeline" element={<HealthTimelineView />} />
            <Route path="/reminders" element={<RemindersView />} />
            <Route path="/glossary" element={<GlossaryView />} />
            <Route path="/profile" element={<ProfileView />} />

            {/* Doctor Routes */}
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/patients" element={<DoctorDashboard />} />
            <Route path="/doctor/patient/:id" element={<DoctorPatientView />} />
            <Route path="/doctor/notes" element={<DoctorNotesView />} />
            <Route path="/doctor/follow-ups" element={<DoctorFollowUpsView />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUserManagement />} />
            <Route path="/admin/analytics" element={<AdminAiAnalytics />} />
            <Route path="/admin/logs" element={<AdminAiAnalytics />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{t('footerCopyright')}</span>
          <span className="text-[11px] text-slate-400">
            {t('footerSubtext')}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <SidebarProvider>
            <AppLayout />
          </SidebarProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
