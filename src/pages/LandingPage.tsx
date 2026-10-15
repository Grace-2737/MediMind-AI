import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  FileText,
  Activity,
  Bot,
  Calendar,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const LandingPage: React.FC = () => {
  const { language, t } = useLanguage();
  const isTa = language === 'ta';

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto px-4">
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            {isTa ? 'நுண்ணறிவு மருத்துவ அறிக்கை பகுப்பாய்வு தளம்' : 'Intelligent Clinical Health Analytics Platform'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight text-balance">
            {t('heroTitle')}
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/login?role=patient"
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
          >
            <span>{isTa ? 'நோயாளி உள்நுழைவு' : 'Launch Patient Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login?role=doctor"
            className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <span>{isTa ? 'மருத்துவர் பணிமனை' : 'Physician Workspace'}</span>
          </Link>
          <Link
            to="/login?role=admin"
            className="inline-flex items-center gap-2 px-5 py-3 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200"
          >
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            <span>{isTa ? 'நிர்வாகி உள்நுழைவு' : 'Admin Login'}</span>
          </Link>
        </div>
      </section>

      {/* Core Principle / Pipeline Flow */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t('pipelineTitle')}
          </span>
          <h2 className="text-lg font-bold text-slate-900">
            {isTa ? 'MediMind AI எவ்வாறு செயல்படுகிறது: மருத்துவ பகுப்பாய்வு ஓட்டம்' : 'How MediMind AI Works: The Clinical Intelligence Pipeline'}
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mx-auto">
            {t('pipelineSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2 text-center text-xs">
          {[
            { step: '01', title: t('pipeUpload'), desc: isTa ? 'PDF அல்லது ஸ்கேன்' : 'PDF or Scan' },
            { step: '02', title: t('pipeExtract'), desc: 'Multimodal OCR' },
            { step: '03', title: t('pipeAnalyze'), desc: isTa ? 'குறிப்பு வரம்புகள்' : 'Reference Bounds' },
            { step: '04', title: t('pipeCompare'), desc: isTa ? 'வரலாற்று ஒப்பீடு' : 'Historical Deltas' },
            { step: '05', title: t('pipeDetect'), desc: isTa ? 'அசாதாரணங்கள்' : 'Abnormalities' },
            { step: '06', title: t('pipeExplain'), desc: isTa ? 'எளிய மொழி விளக்கம்' : 'Plain Language' },
            { step: '07', title: isTa ? 'மருத்துவர் ஆலோசனை' : 'Doctor Match', desc: isTa ? 'சிறப்பு மருத்துவர்' : 'Specialist Roster' },
            { step: '08', title: t('pipeVisualize'), desc: isTa ? 'வரைபடங்கள்' : 'Recharts Trends' },
            { step: '09', title: t('pipeRemind'), desc: isTa ? 'நினைவூட்டல்' : 'Follow-Up Orders' },
          ].map((item) => (
            <div key={item.step} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 font-bold block">{item.step}</span>
              <h3 className="font-bold text-slate-900 text-xs">{item.title}</h3>
              <p className="text-[11px] text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features & Modules */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isTa ? 'மருத்துவ தொகுதிகள்' : 'Dedicated Workspaces'}
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            {isTa ? 'மூன்று பிரத்யேக மருத்துவ தொகுதிகள்' : 'Three Purpose-Built Clinical Portals'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Patient Card */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{isTa ? 'நோயாளி தளம்' : 'Patient Portal'}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isTa
                    ? 'நோயாளிக்கு அணுகக்கூடிய சுகாதார விழிப்புணர்வு, OCR ஸ்கேனிங் மற்றும் ஊடாடும் மருத்துவ பதிவு வழிகாட்டுதலை வழங்குகிறது.'
                    : 'Empowers patients with accessible health literacy, automated OCR scanning, and interactive record navigation.'}
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{isTa ? 'PDF & ஸ்கேன் செய்யப்பட்ட ஆய்வக அறிக்கைகள் பதிவேற்றம்' : 'Upload PDF & Scanned Lab Reports'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{isTa ? 'அசாதாரண அளவீடுகள் கண்டறிதல் & கேஜ் பார்வைகள்' : 'Abnormal Value Detection & Gauges'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{isTa ? 'பதிவு செய்யப்பட்ட மருத்துவர்களுடன் ஆலோசனை முன்பதிவு' : 'Specialist Doctor Consultation Matching'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{isTa ? 'நீள்வெட்டு போக்குகள் & ஒப்பீட்டு மாற்றங்கள்' : 'Longitudinal Trends & Delta Comparisons'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{isTa ? '"Ask MediMind" இயற்கை மொழி விளக்கம்' : '"Ask MediMind" Health Record Guidance'}</span>
                </li>
              </ul>
            </div>
            <Link
              to="/login?role=patient"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 pt-3 border-t border-slate-100"
            >
              <span>{isTa ? 'நோயாளி உள்நுழைவு' : 'Patient Portal Login'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Doctor Card */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{isTa ? 'மருத்துவர் பணிமனை' : 'Physician Workspace'}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isTa
                    ? 'கட்டமைக்கப்பட்ட SOAP முடிவெடுக்கும் ஆதரவு சுருக்கங்களுடன் விரிவான மருத்துவ ஆய்வு தளம்.'
                    : 'Comprehensive clinical review workspace with structured SOAP decision-support summaries.'}
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{isTa ? 'அங்கீகரிக்கப்பட்ட நோயாளிகள் பட்டியல் & தேடல்' : 'Authorized Patient Roster & Search'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{isTa ? 'AI மருத்துவ SOAP சுருக்க உருவாக்கம்' : 'AI Clinical SOAP Summary Generation'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{isTa ? 'பல அறிக்கைகள் ஒப்பீடு & அளவீட்டு அட்டவணை' : 'Multi-Report Parameter Cross-Tabulation'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{isTa ? 'மருத்துவ ஆலோசனை குறிப்புகள் பதிவு செய்தல்' : 'Clinical Consultation Notes Logging'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{isTa ? 'அச்சிடக்கூடிய மருத்துவர் சுருக்கம் ஏற்றுமதி' : 'Printable Physician Summary Export'}</span>
                </li>
              </ul>
            </div>
            <Link
              to="/login?role=doctor"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 pt-3 border-t border-slate-100"
            >
              <span>{isTa ? 'மருத்துவர் உள்நுழைவு' : 'Physician Login'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Admin Card */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{isTa ? 'நிர்வாக தளம்' : 'Administration Console'}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isTa
                    ? 'பாதுகாப்பு ஆளுமை, மருத்துவர் சான்றொப்ப ஒப்புதல்கள் மற்றும் கணினி அளவிலான அளவீட்டு பகுப்பாய்வு.'
                    : 'Security governance, physician credential approvals, and system-wide telemetry analytics.'}
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                  <span>{isTa ? 'பயனர் & மருத்துவர் அடைவு மேலாண்மை' : 'User & Physician Directory Management'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                  <span>{isTa ? 'மருத்துவர் உரிம சரிபார்ப்பு & ஒப்புதல்' : 'Doctor Licensure Verification & Approval'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                  <span>{isTa ? 'மாதாந்திர உட்செலுத்துதல் & செயலாக்க அளவு' : 'Monthly Ingestion & Processing Volume'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                  <span>{isTa ? 'அசாதாரண அதிர்வெண் பரவல் பகுப்பாய்வு' : 'Abnormality Frequency Distribution'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                  <span>{isTa ? 'நிகழ்நேர தணிக்கை பதிவு பதிவு செய்தல்' : 'Real-Time Audit Trail Logging'}</span>
                </li>
              </ul>
            </div>
            <Link
              to="/login?role=admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-700 pt-3 border-t border-slate-100"
            >
              <span>{isTa ? 'நிர்வாகி உள்நுழைவு' : 'Admin Login'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
