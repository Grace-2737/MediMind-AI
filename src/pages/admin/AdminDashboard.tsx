import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Stethoscope,
  FileText,
  Activity,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { StorageService } from '../../services/storage';
import { useLanguage } from '../../context/LanguageContext';
import { SystemMetrics, AuditLog } from '../../types';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';
import { NextMoveGuide } from '../../components/NextMoveGuide';

export const AdminDashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const [metrics, setMetrics] = useState<SystemMetrics>(StorageService.getMetrics());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    setMetrics(StorageService.getMetrics());
    setAuditLogs(StorageService.getAuditLogs().slice(0, 5));
  }, []);

  const monthlyVolumeData = [
    { month: 'Jun', reports: 58, aiQueries: 140 },
    { month: 'Jul', reports: 72, aiQueries: 185 },
    { month: 'Aug', reports: 85, aiQueries: 230 },
    { month: 'Sep', reports: 110, aiQueries: 310 },
    { month: 'Oct', reports: 154, aiQueries: 375 },
  ];

  const abnormalityData = [
    { name: language === 'ta' ? 'இயல்பானது' : 'Normal', value: 317, color: '#10b981' },
    { name: language === 'ta' ? 'விளிம்புநிலை' : 'Borderline', value: 84, color: '#f59e0b' },
    { name: language === 'ta' ? 'அசாதாரணமானது' : 'Abnormal Flagged', value: 78, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <Shield className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">
              {language === 'ta' ? 'நிர்வாக கட்டுப்பாட்டு மையம்' : 'Administration Console'}
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {t('navAdminDashboard')}
            </h1>
            <p className="text-xs text-slate-500">
              {language === 'ta'
                ? 'MediMind AI இயக்க அளவீடுகள், பயனர் அங்கீகாரம் மற்றும் கண்டறியும் பைப்லைன் பகுப்பாய்வு'
                : 'MediMind AI telemetry, role authorization, and diagnostic pipeline analytics'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/users"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            {t('navUserManagement')}
          </Link>
        </div>
      </div>

      <NextMoveGuide />

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">
              {language === 'ta' ? 'மொத்த நோயாளிகள்' : 'Total Patients'}
            </span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {metrics.totalPatients}
            </span>
            <span className="text-xs text-emerald-600 font-medium">+12%</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">
              {language === 'ta' ? 'செயலில் உள்ள மருத்துவர்கள்' : 'Active Physicians'}
            </span>
            <Stethoscope className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {metrics.totalDoctors}
            </span>
            <span className="text-xs text-amber-600 font-medium">3 {language === 'ta' ? 'நிலுவை' : 'pending'}</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">{t('kpiRecentReports')}</span>
            <FileText className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {metrics.reportsAnalyzed}
            </span>
            <span className="text-xs text-slate-500">{t('recordsCount')}</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">
              {language === 'ta' ? 'செயற்கை நுண்ணறிவு வினவல்கள்' : 'AI Queries Served'}
            </span>
            <Sparkles className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {metrics.aiQueriesAnswered}
            </span>
            <span className="text-xs text-slate-500">Gemini 3.8 Flash</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Activity (8 cols) */}
        <div className="lg:col-span-8 p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                {language === 'ta' ? 'மாதாந்திர செயலாக்க அளவு (அறிக்கைகள் & AI வினவல்கள்)' : 'Monthly System Throughput (Reports & AI Queries)'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'ta' ? 'நீள்வெட்டு பைப்லைன் செயலாக்க அளவு' : 'Longitudinal pipeline processing volume'}
              </p>
            </div>
          </div>

          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2.5 bg-slate-900 text-white rounded text-xs space-y-1">
                          <p className="font-semibold">{payload[0].payload.month}</p>
                          <p className="text-teal-300">Reports: {payload[0].value}</p>
                          <p className="text-sky-300">AI Queries: {payload[1].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="reports" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="aiQueries" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Abnormality Frequency Pie (4 cols) */}
        <div className="lg:col-span-4 p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              {language === 'ta' ? 'கண்டறியும் அசாதாரண பரவல்' : 'Diagnostic Abnormality Distribution'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {language === 'ta' ? 'பிரித்தெடுக்கப்பட்ட அளவீடுகளின் பிரிவு' : 'Breakdown of extracted test parameters'}
            </p>
          </div>

          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={abnormalityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {abnormalityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
            {abnormalityData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span>{d.name}</span>
                </span>
                <span className="font-mono tabular-nums font-semibold text-slate-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent System Activity Logs */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              {language === 'ta' ? 'நேரடி கணினி செயல்பாடுகள் மற்றும் தணிக்கை பதிவு' : 'Live System Activity & Audit Trail'}
            </h3>
          </div>
          <Link to="/admin/analytics" className="text-xs text-teal-700 hover:text-teal-900 font-medium">
            {t('actionViewAll')} →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[11px]">
                <th className="py-2 px-3">{language === 'ta' ? 'நேரம்' : 'Timestamp'}</th>
                <th className="py-2 px-3">{language === 'ta' ? 'பயனர்' : 'User'}</th>
                <th className="py-2 px-3">{t('statusLabel')}</th>
                <th className="py-2 px-3">{language === 'ta' ? 'செயல்பாடு' : 'Action'}</th>
                <th className="py-2 px-3">{language === 'ta' ? 'விவரம்' : 'Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{log.userName}</td>
                  <td className="py-2.5 px-3 capitalize text-slate-600">{log.role}</td>
                  <td className="py-2.5 px-3 font-semibold text-teal-700">{log.action}</td>
                  <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
