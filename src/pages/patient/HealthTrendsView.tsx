import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Activity, Filter, Info, ArrowUpRight, ArrowDownRight, Minus, Upload, FileText } from 'lucide-react';
import { TrendChart } from '../../components/TrendChart';
import { ParameterTrend, MedicalReport } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { StorageService } from '../../services/storage';
import { computeParameterTrends } from '../../utils/healthAnalytics';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';

export const HealthTrendsView: React.FC = () => {
  const { currentPatient, currentUser } = useAuth();
  const { language, t } = useLanguage();

  const patientId = currentPatient?.id || currentUser?.id || '';
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedParamName, setSelectedParamName] = useState<string>('');
  const [timeWindow, setTimeWindow] = useState<'6m' | '1y' | 'all'>('all');

  useEffect(() => {
    const list = StorageService.getReports(patientId);
    setReports(list);
  }, [patientId]);

  // Compute trends strictly from the patient's actual uploaded reports
  const computedTrends = computeParameterTrends(reports);

  // Set default selected parameter once trends are computed
  useEffect(() => {
    if (computedTrends.length > 0 && !selectedParamName) {
      setSelectedParamName(computedTrends[0].parameterName);
    }
  }, [computedTrends, selectedParamName]);

  const activeTrend = computedTrends.find((t) => t.parameterName === selectedParamName) || computedTrends[0];

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('trendsPageTitle')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('trendsPageSubtitle')}
          </p>
        </div>

        {/* Time Window Selector */}
        {computedTrends.length > 0 && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setTimeWindow('6m')}
              className={`px-3 py-1 rounded-md transition-colors ${
                timeWindow === '6m' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              {t('timeRange6m')}
            </button>
            <button
              onClick={() => setTimeWindow('1y')}
              className={`px-3 py-1 rounded-md transition-colors ${
                timeWindow === '1y' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              {t('timeRange1y')}
            </button>
            <button
              onClick={() => setTimeWindow('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                timeWindow === 'all' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              {t('timeRangeAll')}
            </button>
          </div>
        )}
      </div>

      {/* Empty States Handling */}
      {reports.length === 0 ? (
        <div className="p-8 sm:p-12 bg-white border border-slate-200 rounded-xl text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mx-auto">
            <Activity className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-base font-bold text-slate-900">
              {t('trendsNoDataTitle')}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('trendsNoDataDesc')}
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
      ) : reports.length < 2 ? (
        <div className="p-8 bg-white border border-slate-200 rounded-xl text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-sm font-bold text-slate-900">
              {t('insufficientTrendsMsg')}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('trendsOneReportDesc')}
            </p>
          </div>
          <div className="pt-1">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4 text-teal-400" />
              <span>{t('uploadSecondReport')}</span>
            </Link>
          </div>
        </div>
      ) : computedTrends.length === 0 ? (
        <div className="p-8 bg-white border border-slate-200 rounded-xl text-center space-y-2 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">
            {language === 'ta'
              ? 'வரலாற்று அறிக்கைகளில் ஒப்பீட்டு அளவீடுகள் எதுவும் பொருந்தவில்லை.'
              : 'No overlapping health parameters found across historical reports to plot longitudinal progression.'}
          </p>
        </div>
      ) : (
        <>
          {/* Parameter Buttons Selector */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-500">
              {t('trendsSelectParam')}
            </span>
            <div className="flex flex-wrap gap-2">
              {computedTrends.map((item) => (
                <button
                  key={item.parameterName}
                  onClick={() => setSelectedParamName(item.parameterName)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    activeTrend?.parameterName === item.parameterName
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {item.parameterName}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Trend Focus Card */}
          {activeTrend && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <TrendChart trend={activeTrend} height={320} />
              </div>

              {/* Trend Analysis Details */}
              <div className="lg:col-span-4 p-5 bg-white border border-slate-200 rounded-xl space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    {t('parameterIntelligence')}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{activeTrend.parameterName}</h3>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t('currentValueLabel')}</span>
                    <span className="font-mono tabular-nums font-bold text-slate-900">
                      {activeTrend.currentValue} {activeTrend.unit}
                    </span>
                  </div>
                  {activeTrend.previousValue !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">{t('previousValueLabel')}</span>
                      <span className="font-mono tabular-nums text-slate-700">
                        {activeTrend.previousValue} {activeTrend.unit}
                      </span>
                    </div>
                  )}
                  {activeTrend.changeRate !== 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">{t('relativeDeltaLabel')}</span>
                      <span
                        className={`font-mono tabular-nums font-semibold flex items-center gap-0.5 ${
                          activeTrend.changeRate > 0 ? 'text-rose-600' : 'text-teal-600'
                        }`}
                      >
                        {activeTrend.changeRate > 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        <span>{activeTrend.changeRate > 0 ? `+${activeTrend.changeRate}%` : `${activeTrend.changeRate}%`}</span>
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                    <span className="text-slate-500">{t('colReferenceRange')}:</span>
                    <span className="font-mono tabular-nums text-slate-800">
                      {activeTrend.referenceRange.min} - {activeTrend.referenceRange.max} {activeTrend.unit}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <h4 className="font-semibold text-slate-900">{t('observedTrajectoryInsight')}</h4>
                  <p className="text-slate-600 leading-relaxed bg-teal-50/40 p-3 rounded border border-teal-100">
                    {language === 'ta'
                      ? activeTrend.trendDirection === 'increasing'
                        ? `அளவீடுகள் முந்தைய பரிசோதனையை விட மேல்நோக்கிய போக்கைக் காட்டுகின்றன (+${activeTrend.changeRate}%). உணவு முறை மற்றும் மருத்துவ ஆலோசனையை பெறவும்.`
                        : activeTrend.trendDirection === 'improving'
                        ? `அளவீடுகள் சாதகமான முன்னேற்றத்தை பிரதிபலிக்கின்றன (${activeTrend.changeRate}%). இது பரிந்துரைக்கப்பட்ட வரம்பிற்குள் நகர்கிறது.`
                        : 'அளவீடுகள் நிலையான வரம்பிற்குள் உள்ளன.'
                      : activeTrend.trendDirection === 'increasing'
                      ? `Measurements reflect an upward progression (+${activeTrend.changeRate}%). Correlate with clinical dietary and physical activity compliance.`
                      : activeTrend.trendDirection === 'improving'
                      ? `Demonstrating a favorable response (${activeTrend.changeRate}%), showing positive adaptation toward target bounds.`
                      : 'Measurements demonstrate longitudinal stability within preserved reference thresholds.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
