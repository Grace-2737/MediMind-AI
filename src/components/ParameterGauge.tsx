import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Sparkles, X } from 'lucide-react';
import { ExtractedParameter } from '../types';
import { ApiService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { AudioPlayer } from './AudioPlayer';

interface ParameterGaugeProps {
  parameter: ExtractedParameter;
  onExplain?: (param: ExtractedParameter) => void;
}

export const ParameterGauge: React.FC<ParameterGaugeProps> = ({ parameter }) => {
  const { language, t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<{
    simpleExplanation: string;
    whyItMatters: string;
    recordedTrend: string;
    suggestedNextStep: string;
  } | null>(null);

  const isAbnormal = parameter.status === 'abnormal';
  const isBorderline = parameter.status === 'borderline';

  const statusColor = isAbnormal
    ? 'text-rose-700 bg-rose-50 border-rose-200'
    : isBorderline
    ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-emerald-700 bg-emerald-50 border-emerald-200';

  const statusLabel = isAbnormal
    ? t('statusAbnormal')
    : isBorderline
    ? t('statusBorderline')
    : t('statusNormal');

  const handleExplainClick = async () => {
    setShowModal(true);
    if (!explanation) {
      setLoading(true);
      try {
        const res = await ApiService.explainParameter(parameter, language);
        setExplanation(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const fullTextToRead = explanation
    ? `${parameter.name}. Current reading: ${parameter.value} ${parameter.unit}. ${explanation.simpleExplanation} ${explanation.whyItMatters} ${explanation.recordedTrend} ${explanation.suggestedNextStep}`
    : '';

  return (
    <>
      <div className="p-4 bg-white border border-slate-200/90 rounded-lg hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between">
        {/* Top Header */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block tracking-wider uppercase">
                {parameter.category}
              </span>
              <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                {language === 'ta' && parameter.tamilName ? parameter.tamilName : parameter.name}
              </h4>
              {language === 'ta' && parameter.tamilName && (
                <span className="text-[11px] text-slate-400 block">{parameter.name}</span>
              )}
            </div>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded border whitespace-nowrap ${statusColor}`}>
              {statusLabel}
            </span>
          </div>

          {/* Metric Value */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {parameter.value}
            </span>
            <span className="text-xs font-medium text-slate-500">{parameter.unit}</span>

            {/* Change Delta */}
            {parameter.previousValue !== undefined && (
              <span className="ml-auto text-xs font-mono tabular-nums flex items-center gap-0.5 text-slate-500">
                {parameter.value > parameter.previousValue ? (
                  <>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />
                    <span>+{Math.abs(Number((parameter.value - parameter.previousValue).toFixed(2)))}</span>
                  </>
                ) : parameter.value < parameter.previousValue ? (
                  <>
                    <ArrowDownRight className="w-3.5 h-3.5 text-slate-600" />
                    <span>-{Math.abs(Number((parameter.previousValue - parameter.value).toFixed(2)))}</span>
                  </>
                ) : (
                  <>
                    <Minus className="w-3 h-3 text-slate-400" />
                    <span>0</span>
                  </>
                )}
              </span>
            )}
          </div>

          {/* Reference range */}
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>{t('referenceInterval')}</span>
            <span className="font-mono tabular-nums font-medium text-slate-700">
              {parameter.referenceRange?.text || `${parameter.referenceRange?.min} - ${parameter.referenceRange?.max}`}
            </span>
          </div>
        </div>

        {/* Explain Action */}
        <div className="mt-4 pt-2 flex items-center justify-between">
          <button
            onClick={handleExplainClick}
            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium text-teal-800 bg-teal-50/70 hover:bg-teal-100/80 rounded-md transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>{t('actionExplain')}</span>
          </button>
        </div>
      </div>

      {/* AI Explanation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  {language === 'ta' ? `AI அளவீட்டு விளக்கம் · ${parameter.tamilName || parameter.name}` : `AI Parameter Explanation · ${parameter.name}`}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">{t('recordedReading')}</span>
                  <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                    {parameter.value} {parameter.unit}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {t('colReferenceRange')}: {parameter.referenceRange?.text || `${parameter.referenceRange?.min} - ${parameter.referenceRange?.max}`}
                  </span>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded border ${statusColor}`}>
                  {statusLabel}
                </span>
              </div>

              {loading ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500">{language === 'ta' ? 'விளக்கம் உருவாக்கப்படுகிறது...' : 'Generating plain-language explanation...'}</p>
                </div>
              ) : explanation ? (
                <div className="space-y-3">
                  <div>
                    <h5 className="font-semibold text-slate-900 text-xs mb-1">{t('simpleExplanationTitle')}</h5>
                    <p className="leading-relaxed text-slate-600 bg-slate-50/50 p-2.5 rounded border border-slate-100">
                      {explanation.simpleExplanation}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-900 text-xs mb-1">{t('whyItMattersTitle')}</h5>
                    <p className="leading-relaxed text-slate-600 bg-slate-50/50 p-2.5 rounded border border-slate-100">
                      {explanation.whyItMatters}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-900 text-xs mb-1">{t('recordedTrendTitle')}</h5>
                    <p className="leading-relaxed text-slate-600 bg-slate-50/50 p-2.5 rounded border border-slate-100">
                      {explanation.recordedTrend}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-900 text-xs mb-1">{t('suggestedNextStepTitle')}</h5>
                    <p className="leading-relaxed text-slate-700 bg-teal-50/40 p-2.5 rounded border border-teal-100">
                      {explanation.suggestedNextStep}
                    </p>
                  </div>

                  {/* Audio Controls */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[11px] text-slate-500">{t('listenViaTts')}</span>
                    <AudioPlayer textToRead={fullTextToRead} lang={language} label={t('actionReadAloud')} />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
              <span>{t('educationalOutputNotice')}</span>
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-md"
              >
                {t('actionDone')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
