import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  Activity,
  Calendar,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Upload,
  CheckCircle2,
  Clock,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { StorageService } from '../../services/storage';
import {
  computeParameterTrends,
  computeRiskIndicatorsFromReports,
  computeInsightsFromReports,
} from '../../utils/healthAnalytics';
import { MedicalReport, RiskIndicator, PersonalizedInsight, TestReminder, TimelineEvent, ParameterTrend } from '../../types';
import { TrendChart } from '../../components/TrendChart';
import { ParameterGauge } from '../../components/ParameterGauge';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';
import { NextMoveGuide } from '../../components/NextMoveGuide';

export const PatientDashboard: React.FC = () => {
  const { currentPatient, currentUser } = useAuth();
  const { language, t } = useLanguage();

  const patientId = currentPatient?.id || currentUser?.id || '';

  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [reminders, setReminders] = useState<TestReminder[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const ptReports = StorageService.getReports(patientId);
    setReports(ptReports);
    setReminders(StorageService.getReminders(patientId));
    setTimeline(StorageService.getTimelineEvents(patientId).slice(0, 4));
  }, [patientId]);

  // Compute dynamic trends and indicators strictly from the patient's actual uploaded reports
  const computedTrends = computeParameterTrends(reports);
  const computedRisks = computeRiskIndicatorsFromReports(reports, patientId);
  const computedInsights = computeInsightsFromReports(reports, patientId);

  const latestReport = reports[0];
  const abnormalCount = latestReport ? latestReport.abnormalCount : 0;
  const pendingReminders = reminders.filter((r) => r.status === 'pending');

  const handleToggleReminder = (id: string) => {
    StorageService.toggleReminder(id);
    setReminders(StorageService.getReminders(patientId));
  };

  const displayName = currentPatient?.name || currentUser?.name || 'Patient';

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Top Greeting & Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div>
          <span className="text-xs font-medium text-slate-400">
            {t('greetingPatient')},
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {displayName}
          </h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            {currentPatient?.age && <span>{t('ageLabel')}: {currentPatient.age}</span>}
            {currentPatient?.bloodGroup && (
              <>
                <span aria-hidden="true">·</span>
                <span>{t('bloodGroupLabel')}: {currentPatient.bloodGroup}</span>
              </>
            )}
            {currentPatient?.assignedDoctorName && (
              <>
                <span aria-hidden="true">·</span>
                <span>{language === 'ta' ? 'மருத்துவர்' : 'Doctor'}: {currentPatient.assignedDoctorName}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Upload className="w-4 h-4 text-teal-400" />
            <span>{t('actionUpload')}</span>
          </Link>
          <Link
            to="/ask-medimind"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>{t('actionAsk')}</span>
          </Link>
        </div>
      </div>

      {/* Recommended Next Move Guidance Workflow */}
      <NextMoveGuide />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Recent Reports */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">{t('kpiRecentReports')}</span>
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {reports.length}
            </span>
            <span className="text-xs text-slate-500">{t('recordsCount')}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>{t('latestLabel')}</span>
            <span className="font-medium text-slate-700">{latestReport?.reportDate || t('noneLabel')}</span>
          </div>
        </div>

        {/* KPI 2: Abnormal Parameters */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">{t('kpiAbnormalParameters')}</span>
            <AlertTriangle className={`w-4 h-4 ${abnormalCount > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${
                abnormalCount > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {abnormalCount}
            </span>
            <span className="text-xs text-slate-500">{t('flaggedInLatest')}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>{t('statusLabel')}</span>
            <span className={`font-medium ${abnormalCount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              {abnormalCount > 0 ? t('requiresMedicalReview') : t('allGood')}
            </span>
          </div>
        </div>

        {/* KPI 3: Active Risk Indicators */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">{t('kpiActiveRisks')}</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {computedRisks.length}
            </span>
            <span className="text-xs text-slate-500">{t('aiAssistedIndicators')}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>{t('priorityLabel')}</span>
            <span className="font-medium text-slate-700">
              {computedRisks[0]?.category || t('noneLabel')}
            </span>
          </div>
        </div>

        {/* KPI 4: Upcoming Tests */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">{t('kpiUpcomingTests')}</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {pendingReminders.length}
            </span>
            <span className="text-xs text-slate-500">{t('pendingRemindersCount')}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>{t('nextDueLabel')}</span>
            <span className="font-medium text-slate-700">{pendingReminders[0]?.dueDate || t('noneLabel')}</span>
          </div>
        </div>
      </div>

      {/* If patient has NO uploaded reports yet, show clean empty state */}
      {reports.length === 0 ? (
        <div className="p-8 sm:p-12 bg-white border border-slate-200 rounded-xl text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-base font-bold text-slate-900">
              {t('noReportsUploadedTitle')}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('noReportsUploadedDesc')}
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4 text-teal-400" />
              <span>{t('actionUploadFirst')}</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Main Section 1: Health Overview & Extracted Parameters from Latest Report */}
          {latestReport && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                    {t('secHealthOverview')}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {latestReport.reportTitle} ({latestReport.reportDate}) · {latestReport.labName}
                  </p>
                </div>
                <Link
                  to={`/reports/${latestReport.id}`}
                  className="text-xs font-medium text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
                >
                  <span>{t('actionViewDetails')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {latestReport.parameters.map((param) => (
                  <ParameterGauge key={param.id} parameter={param} />
                ))}
              </div>
            </div>
          )}

          {/* Main Section 2 & 3: Health Trends & AI Health Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Longitudinal Trends (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    {t('secHealthTrends')}
                  </h3>
                </div>
                {computedTrends.length > 0 && (
                  <Link
                    to="/trends"
                    className="text-xs text-teal-700 hover:text-teal-900 font-medium inline-flex items-center gap-1"
                  >
                    <span>{t('actionExploreAll')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {reports.length < 2 ? (
                <div className="p-6 bg-white border border-slate-200 rounded-xl text-center space-y-2 text-xs text-slate-500">
                  <Activity className="w-6 h-6 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-700">{t('insufficientDataForTrends')}</p>
                  <p className="text-[11px] text-slate-400">
                    You have 1 uploaded report ({latestReport?.reportTitle}). Upload a second test to plot progression curves.
                  </p>
                </div>
              ) : computedTrends.length === 0 ? (
                <div className="p-6 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  No overlapping parameters found across historical reports to plot trends.
                </div>
              ) : (
                <div className="space-y-4">
                  {computedTrends.slice(0, 2).map((trend) => (
                    <TrendChart key={trend.parameterName} trend={trend} height={200} />
                  ))}
                </div>
              )}
            </div>

            {/* Right: AI Health Insights & Risk Indicators (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    {t('secAiInsights')}
                  </h3>
                </div>
                {computedRisks.length > 0 && (
                  <Link
                    to="/insights"
                    className="text-xs text-teal-700 hover:text-teal-900 font-medium inline-flex items-center gap-1"
                  >
                    <span>{t('actionViewAll')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* AI Risk Indicator Card */}
              {computedRisks.length > 0 ? (
                <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
                        {computedRisks[0].category}
                      </span>
                      <h4 className="text-sm font-bold text-amber-950 mt-0.5">
                        {language === 'ta' && computedRisks[0].tamilTitle ? computedRisks[0].tamilTitle : computedRisks[0].title}
                      </h4>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded uppercase">
                      {computedRisks[0].severity}
                    </span>
                  </div>

                  <p className="text-xs text-amber-900 leading-relaxed">
                    {language === 'ta' && computedRisks[0].tamilReason ? computedRisks[0].tamilReason : computedRisks[0].reason}
                  </p>

                  <div className="space-y-1 text-xs pt-1 border-t border-amber-200/60">
                    <span className="font-semibold text-amber-950 block">{t('contributingEvidenceLabel')}</span>
                    <ul className="list-disc list-inside space-y-0.5 text-amber-800 text-[11px]">
                      {computedRisks[0].contributingDataPoints.map((dp, i) => (
                        <li key={i}>{dp}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 bg-white/80 rounded border border-amber-200 text-xs text-amber-950">
                    <span className="font-semibold">{t('suggestedActionLabel')} </span>
                    {language === 'ta' && computedRisks[0].tamilSuggestedAction ? computedRisks[0].tamilSuggestedAction : computedRisks[0].suggestedAction}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'ta' ? 'செயலில் உள்ள இடர் குறியீடுகள் எதுவும் இல்லை' : 'No Active Risk Indicators Flagged'}</span>
                  </div>
                  <p className="text-emerald-800 text-[11px]">
                    {language === 'ta' ? 'அனைத்து அளவுகளும் இயல்பான வரம்பிற்குள் உள்ளன.' : 'Extracted parameters currently sit within expected standard physiological boundaries.'}
                  </p>
                </div>
              )}

              {/* Personalized Insights Stream */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  {t('personalizedInsightsTitle')}
                </h4>
                <div className="space-y-2.5">
                  {computedInsights.map((ins) => (
                    <div
                      key={ins.id}
                      className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs leading-relaxed text-slate-700 flex items-start gap-2.5"
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                          ins.type === 'warning'
                            ? 'bg-amber-500'
                            : ins.type === 'positive'
                            ? 'bg-emerald-500'
                            : 'bg-teal-500'
                        }`}
                      />
                      <div>
                        <p>{language === 'ta' && ins.tamilText ? ins.tamilText : ins.text}</p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{ins.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Section 4 & 5: Upcoming Reminders & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reminders (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                {t('secReminders')}
              </h3>
            </div>
            <Link
              to="/reminders"
              className="text-xs text-teal-700 hover:text-teal-900 font-medium inline-flex items-center gap-1"
            >
              <span>{t('actionManageReminders')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
            {reminders.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 space-y-2">
                <p>{t('noRemindersYet')}</p>
                <Link
                  to="/reminders"
                  className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('actionAddReminder')}</span>
                </Link>
              </div>
            ) : (
              reminders.slice(0, 3).map((rem) => (
                <div
                  key={rem.id}
                  onClick={() => handleToggleReminder(rem.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    rem.status === 'completed'
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-colors ${
                        rem.status === 'completed'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {rem.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                    </button>
                    <div>
                      <h5
                        className={`text-xs font-semibold ${
                          rem.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {rem.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">{rem.notes}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono tabular-nums text-slate-600 shrink-0 font-medium">
                    {rem.dueDate}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Timeline (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                {t('secTimeline')}
              </h3>
            </div>
            <Link
              to="/timeline"
              className="text-xs text-teal-700 hover:text-teal-900 font-medium inline-flex items-center gap-1"
            >
              <span>{t('actionFullJourney')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
            {timeline.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                {t('noTimelineEvents')}
              </div>
            ) : (
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-slate-200">
                {timeline.map((evt) => (
                  <div key={evt.id} className="relative flex items-start gap-3 pl-6">
                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-white border-2 border-teal-600" />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{evt.title}</span>
                        <span className="text-[10px] font-mono text-slate-400">{evt.date}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">{evt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
