import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldAlert, ArrowRight, CheckCircle2, AlertTriangle, Lightbulb, Upload } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { computeRiskIndicatorsFromReports, computeInsightsFromReports } from '../../utils/healthAnalytics';
import { RiskIndicator, PersonalizedInsight, MedicalReport } from '../../types';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';

export const AiInsightsView: React.FC = () => {
  const { currentPatient, currentUser } = useAuth();
  const { language, t } = useLanguage();
  const patientId = currentPatient?.id || currentUser?.id || '';

  const [reports, setReports] = useState<MedicalReport[]>([]);

  useEffect(() => {
    setReports(StorageService.getReports(patientId));
  }, [patientId]);

  // Dynamically compute risks and insights strictly from this patient's actual uploaded reports
  const risks = computeRiskIndicatorsFromReports(reports, patientId);
  const insights = computeInsightsFromReports(reports, patientId);

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('aiInsightsTitle')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('aiInsightsSubtitle')}
          </p>
        </div>
      </div>

      {/* Risk Analysis Overview Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-xl shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <h2 className="text-sm font-semibold tracking-wide">
            {t('algorithmicRiskPipeline')}
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          {t('algorithmicRiskDesc')}
        </p>
      </div>

      {/* Empty State when patient has 0 reports */}
      {reports.length === 0 ? (
        <div className="p-8 sm:p-12 bg-white border border-slate-200 rounded-xl text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-base font-bold text-slate-900">
              {t('insightsNoDataTitle')}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('insightsNoDataDesc')}
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
          {/* AI-Assisted Risk Indicators Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              {t('activeRiskIndicatorsTitle')}
            </h3>

            {risks.length === 0 ? (
              <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-950">
                    {language === 'ta' ? 'அசாதாரண இடர் குறியீடுகள் எதுவும் இல்லை' : 'No Active Risk Indicators Flagged'}
                  </h4>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    {language === 'ta'
                      ? 'உங்கள் ஆய்வக அளவீடுகள் அனைத்தும் மருத்துவ பரிந்துரை எல்லைகளுக்குள் உள்ளன.'
                      : 'All extracted parameters sit within standard clinical physiological targets.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {risks.map((risk) => {
                  const isElevated = risk.severity === 'elevated' || risk.severity === 'high';

                  return (
                    <div
                      key={risk.id}
                      className={`p-5 rounded-xl border space-y-4 transition-all shadow-xs ${
                        isElevated
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-semibold text-amber-700 tracking-wider uppercase block">
                            {risk.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                            {language === 'ta' && risk.tamilTitle ? risk.tamilTitle : risk.title}
                          </h4>
                        </div>
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded border uppercase ${
                            isElevated
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {risk.severity} Attention
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <span className="font-semibold text-slate-800 block">{t('algorithmicReasonLabel')}</span>
                        <p className="text-slate-700 leading-relaxed">
                          {language === 'ta' && risk.tamilReason ? risk.tamilReason : risk.reason}
                        </p>
                      </div>

                      {/* Contributing Data Points */}
                      <div className="p-3 bg-white/90 rounded-lg border border-slate-200/80 space-y-1.5 text-xs">
                        <span className="font-semibold text-slate-900 block">
                          {t('contributingEvidenceLabel')}
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                          {risk.contributingDataPoints.map((dp, i) => (
                            <li key={i}>{dp}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Suggested Action */}
                      <div className="p-3 bg-teal-50/60 rounded-lg border border-teal-100 text-xs space-y-0.5">
                        <span className="font-semibold text-teal-950 block">{t('suggestedActionLabel')}</span>
                        <p className="text-teal-900 leading-relaxed">
                          {language === 'ta' && risk.tamilSuggestedAction ? risk.tamilSuggestedAction : risk.suggestedAction}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Personalized Health Insights Feed */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                {t('personalizedInsightsTitle')}
              </h3>
            </div>

            {insights.length === 0 ? (
              <p className="text-xs text-slate-500">
                {t('noInsightsYet')}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {insights.map((ins) => (
                  <div
                    key={ins.id}
                    className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-xs leading-relaxed text-slate-700 flex items-start gap-3"
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${
                        ins.type === 'warning'
                          ? 'bg-amber-500'
                          : ins.type === 'positive'
                          ? 'bg-emerald-500'
                          : 'bg-teal-500'
                      }`}
                    />
                    <div className="space-y-0.5">
                      <p>{language === 'ta' && ins.tamilText ? ins.tamilText : ins.text}</p>
                      <span className="text-[10px] text-slate-400 block font-mono">{ins.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
