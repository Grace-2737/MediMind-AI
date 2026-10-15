import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Calendar,
  Building,
  ArrowLeft,
  Sparkles,
  GitCompare,
  CheckCircle,
  AlertTriangle,
  Stethoscope,
  Globe,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { MedicalReport } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { ParameterGauge } from '../../components/ParameterGauge';
import { AudioPlayer } from '../../components/AudioPlayer';
import { DoctorConsultationSection } from '../../components/DoctorConsultationSection';
import { ReportComparisonChart } from '../../components/ReportComparisonChart';
import { AbnormalityArea } from '../../types';

export const ReportDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();
  const [report, setReport] = useState<MedicalReport | null>(null);
  const [summaryMode, setSummaryMode] = useState<'patient' | 'doctor' | 'tamil'>(() => (language === 'ta' ? 'tamil' : 'patient'));

  useEffect(() => {
    if (id) {
      const found = StorageService.getReportById(id);
      if (found) setReport(found);
    }
  }, [id]);

  useEffect(() => {
    if (language === 'ta') {
      setSummaryMode('tamil');
    } else if (summaryMode === 'tamil') {
      setSummaryMode('patient');
    }
  }, [language]);

  if (!report) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-700">
          {language === 'ta' ? 'மருத்துவ அறிக்கை பதிவு கிடைக்கவில்லை.' : 'Medical report record not found.'}
        </p>
        <Link to="/reports" className="text-xs text-teal-600 underline">
          {t('backToReports')}
        </Link>
      </div>
    );
  }

  // Derive abnormality areas if not saved on report
  let computedAbnormalities: AbnormalityArea[] = report.abnormalityAreas || [];
  if (computedAbnormalities.length === 0) {
    const doctors = StorageService.getDoctors().filter((d) => d.status === 'approved');
    const abnormalParams = report.parameters.filter((p) => p.status === 'abnormal' || p.status === 'borderline');

    const byCat: Record<string, typeof abnormalParams> = {};
    abnormalParams.forEach((p) => {
      const cat = p.category || 'General';
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push(p);
    });

    computedAbnormalities = Object.keys(byCat).map((cat) => {
      const params = byCat[cat];
      let matchedDoc = doctors.find((d) =>
        cat.toLowerCase().includes('glycemic') || cat.toLowerCase().includes('diabetes')
          ? d.specialization.toLowerCase().includes('diabetology') || d.specialization.toLowerCase().includes('internal')
          : cat.toLowerCase().includes('lipid') || cat.toLowerCase().includes('cardio')
          ? d.specialization.toLowerCase().includes('cardiology')
          : cat.toLowerCase().includes('renal') || cat.toLowerCase().includes('kidney')
          ? d.specialization.toLowerCase().includes('nephrology')
          : cat.toLowerCase().includes('liver')
          ? d.specialization.toLowerCase().includes('gastro') || d.specialization.toLowerCase().includes('hepat')
          : false
      ) || doctors[0];

      return {
        area: `${cat} Health Markers`,
        category: cat,
        severity: params.some((p) => p.status === 'abnormal') ? 'High' : 'Moderate',
        flaggedParameters: params.map((p) => `${p.name}: ${p.value} ${p.unit} (Ref: ${p.referenceRange.text})`),
        findingsSummary: `Detected ${params.length} marker(s) deviating from standard clinical bounds.`,
        recommendedDoctor: {
          id: matchedDoc.id,
          name: matchedDoc.name,
          specialization: matchedDoc.specialization,
          hospital: matchedDoc.hospital,
          experienceYears: matchedDoc.experienceYears,
          reason: `Consult ${matchedDoc.name} (${matchedDoc.specialization}) at ${matchedDoc.hospital} for targeted management of your ${cat} indicators.`,
        },
      };
    });
  }

  const activeSummaryText =
    summaryMode === 'tamil'
      ? report.tamilSummary || (language === 'ta' ? 'தமிழ் சுருக்கம் உருவாக்கப்படவில்லை.' : 'Tamil summary not available.')
      : summaryMode === 'doctor'
      ? report.aiDoctorSummary || 'No clinical SOAP summary generated.'
      : report.aiPatientSummary || 'No patient summary generated.';

  const activeSummaryLang = summaryMode === 'tamil' ? 'ta' : 'en';

  return (
    <div className="space-y-6">
      {/* Back button and Report Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/reports"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('backToReports')}</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{report.reportTitle}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span className="font-mono tabular-nums">{report.reportDate}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Building className="w-3 h-3 text-slate-400" />
              <span>{report.labName}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px]">{report.fileName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/compare?primary=${report.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <GitCompare className="w-3.5 h-3.5 text-teal-600" />
            <span>{t('compareWithHistorical')}</span>
          </Link>
        </div>
      </div>

      {/* AI Summary Card with Patient / Doctor / Tamil Modes */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              {t('aiGeneratedSummaryTitle')}
            </h3>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setSummaryMode('patient')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                summaryMode === 'patient'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{t('patientModeTab')}</span>
            </button>
            <button
              onClick={() => setSummaryMode('doctor')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                summaryMode === 'doctor'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3 h-3 text-teal-600" />
              <span>{t('doctorSoapModeTab')}</span>
            </button>
            <button
              onClick={() => setSummaryMode('tamil')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                summaryMode === 'tamil'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3 h-3 text-teal-600" />
              <span>{t('tamilModeTab')}</span>
            </button>
          </div>
        </div>

        {/* Summary Content Body */}
        <div className="space-y-3">
          <p className="text-xs leading-relaxed text-slate-700 bg-slate-50/70 p-4 rounded-lg border border-slate-100 whitespace-pre-line font-normal">
            {activeSummaryText}
          </p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              {t('listenAiExplanation')}
            </span>
            <AudioPlayer textToRead={activeSummaryText} lang={activeSummaryLang} label={t('actionPlayNarration')} />
          </div>
        </div>

        {/* Key Findings List */}
        {report.keyFindings && report.keyFindings.length > 0 && (
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <h4 className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider">
              {t('keyObservedFindings')}
            </h4>
            <ul className="space-y-1 text-xs text-slate-600">
              {report.keyFindings.map((finding, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommended Doctor Consultation for Detected Abnormalities */}
      <DoctorConsultationSection
        abnormalityAreas={computedAbnormalities}
        patientId={report.patientId}
        patientName={report.patientName}
        reportTitle={report.reportTitle}
      />

      {/* Visual Parameter Comparison & Range Graphs */}
      <ReportComparisonChart
        parameters={report.parameters}
        reportTitle={report.reportTitle}
      />

      {/* Extracted Parameters Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              {t('extractedHealthParams')} ({report.parameters.length})
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'ta'
                ? 'நிலையான மருத்துவ குறிப்பு வரம்புகளுடன் ஒப்பிடப்பட்ட அளவீடுகள். எளிய விளக்கத்தைப் பெற "விளக்கத்தை காண்க" என்பதை கிளிக் செய்யவும்.'
                : 'Normalized values compared against standard reference intervals. Click "Explain This" for plain-language interpretation.'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-rose-600 font-semibold">{report.abnormalCount} {t('statusAbnormal')}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 font-medium">{report.normalCount} {t('statusNormal')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {report.parameters.map((param) => (
            <ParameterGauge key={param.id} parameter={param} />
          ))}
        </div>
      </div>
    </div>
  );
};
