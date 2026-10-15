import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Upload,
  FileCheck,
  Stethoscope,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Users,
  FileText,
  ShieldCheck,
  Activity,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { StorageService } from '../services/storage';

export const NextMoveGuide: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { role, currentPatient, currentUser } = useAuth();
  const { language, t } = useLanguage();
  const location = useLocation();
  const isTa = language === 'ta';

  if (!currentUser) return null;

  // Patient Workflow Steps
  if (role === 'patient') {
    const patientReports = StorageService.getReports().filter(
      (r) => r.patientId === currentPatient?.id || r.patientId === currentUser.id
    );
    const hasReports = patientReports.length > 0;
    const hasAbnormalReports = patientReports.some((r) => (r.abnormalCount || 0) > 0);

    const steps = [
      {
        id: 'upload',
        num: 1,
        title: isTa ? '1. அறிக்கை பதிவேற்றம் (OCR)' : '1. Upload Lab Report',
        subtitle: isTa ? 'துல்லியமான OCR ஸ்கேனிங்' : 'Multimodal OCR scanning',
        path: '/upload',
        icon: Upload,
        completed: hasReports,
        isNext: !hasReports,
      },
      {
        id: 'review',
        num: 2,
        title: isTa ? '2. அசாதாரணங்கள் பகுப்பாய்வு' : '2. Review Abnormalities',
        subtitle: isTa ? 'அளவீடுகள் & நிலை சரிபார்ப்பு' : 'AI triage & flagged ranges',
        path: hasReports ? `/reports/${patientReports[0].id}` : '/reports',
        icon: FileCheck,
        completed: hasReports && location.pathname.startsWith('/reports'),
        isNext: hasReports && !hasAbnormalReports,
      },
      {
        id: 'consult',
        num: 3,
        title: isTa ? '3. சிறப்பு மருத்துவர் ஆலோசனை' : '3. Doctor Consultation',
        subtitle: isTa ? 'பதிவுசெய்த மருத்துவர் தொடர்பு' : 'Match enrolled specialist',
        path: hasReports ? `/reports/${patientReports[0].id}` : '/dashboard',
        icon: Stethoscope,
        completed: false,
        isNext: hasReports && hasAbnormalReports,
      },
      {
        id: 'trends',
        num: 4,
        title: isTa ? '4. போக்குகள் & ஒப்பீடு' : '4. Trends & Comparison',
        subtitle: isTa ? 'நீண்ட கால வரைபடங்கள்' : 'Long-term metric graphs',
        path: patientReports.length > 1 ? '/compare' : '/trends',
        icon: TrendingUp,
        completed: location.pathname === '/trends' || location.pathname === '/compare',
        isNext: patientReports.length > 1 && location.pathname !== '/compare',
      },
    ];

    const currentNextStep = steps.find((s) => s.isNext) || steps[0];

    return (
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-700/60 relative overflow-hidden">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Compass className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-teal-400 uppercase">
                {isTa ? 'அடுத்த கட்ட வழிகாட்டி' : 'Recommended Next Move'}
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-white">
                {isTa
                  ? !hasReports
                    ? 'முதல் படி: உங்கள் ஆய்வக அறிக்கையை OCR மூலம் பதிவேற்றவும்'
                    : hasAbnormalReports
                    ? 'அடுத்த படி: அசாதாரணங்களை கண்டறிந்து மருத்துவரிடம் ஆலோசிக்கவும்'
                    : 'அடுத்த படி: உங்கள் ஆரோக்கிய வரைபடங்கள் மற்றும் போக்குகளை சரிபார்க்கவும்'
                  : !hasReports
                  ? 'First Step: Upload and scan your medical lab report with OCR'
                  : hasAbnormalReports
                  ? 'Next Step: Review flagged abnormalities and consult specialist doctor'
                  : 'Next Step: Track long-term health trends and compare previous tests'}
              </h2>
            </div>
          </div>

          <Link
            to={currentNextStep.path}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-sm hover:translate-x-0.5"
          >
            <span>{isTa ? 'அடுத்த நகர்வுக்கு செல்க' : 'Take This Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Horizontal Step Slider Roadmap */}
        {!compact && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-slate-700/60">
            {steps.map((st) => {
              const StepIcon = st.icon;
              const isActive = location.pathname === st.path || (st.id === 'upload' && location.pathname === '/upload');
              return (
                <Link
                  key={st.id}
                  to={st.path}
                  className={`p-2.5 rounded-xl border transition-all text-left block group ${
                    isActive
                      ? 'bg-teal-900/40 border-teal-400/80 ring-1 ring-teal-400/50'
                      : st.isNext
                      ? 'bg-white/10 border-teal-400/40 hover:bg-white/15'
                      : 'bg-white/5 border-slate-700/50 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                        st.completed
                          ? 'bg-emerald-500 text-white'
                          : st.isNext
                          ? 'bg-teal-400 text-slate-950 ring-2 ring-teal-400/40'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {st.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : st.num}
                    </div>
                    {st.isNext && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-400/20 text-teal-300 border border-teal-400/40 animate-pulse">
                        NEXT
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-white group-hover:text-teal-300 transition-colors truncate">
                    {st.title}
                  </div>
                  <div className="text-[10px] text-slate-300 truncate">
                    {st.subtitle}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Physician Workflow Steps
  if (role === 'doctor') {
    return (
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-700/60 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Compass className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase">
                {isTa ? 'மருத்துவர் வழிகாட்டி' : 'Physician Clinical Flow'}
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-white">
                {isTa
                  ? 'பரிந்துரைக்கப்பட்ட அடுத்த நகர்வு: நோயாளி அறிக்கைகள் & SOAP ஆவணங்களை மதிப்பாய்வு செய்யவும்'
                  : 'Recommended Next Move: Review assigned patients, author SOAP clinical notes, and set follow-ups'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/doctor/patients"
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
            >
              {isTa ? 'நோயாளிகள் பட்டியல்' : 'Patient Roster'}
            </Link>
            <Link
              to="/doctor/notes"
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              {isTa ? 'மருத்துவ குறிப்புகள்' : 'SOAP Notes'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin Workflow Steps
  if (role === 'admin') {
    return (
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-700/60 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Compass className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-teal-400 uppercase">
                {isTa ? 'நிர்வாக வழிகாட்டி' : 'Administrator Governance Hub'}
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-white">
                {isTa
                  ? 'பரிந்துரைக்கப்பட்ட அடுத்த நகர்வு: புதிய நிர்வாகிகளைச் சேர்த்தல் மற்றும் கணினி சரிபார்ப்புகளை நிர்வகிக்கவும்'
                  : 'Recommended Next Move: Provision authorized Administrators, verify physicians, and inspect audit logs'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/users"
              className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              {isTa ? '+ நிர்வாகியைச் சேர்' : '+ Provision Admin'}
            </Link>
            <Link
              to="/admin/analytics"
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              {isTa ? 'கணினி தணிக்கை' : 'Audit Logs'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
