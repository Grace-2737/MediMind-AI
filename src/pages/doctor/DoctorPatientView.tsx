import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  AlertTriangle,
  FileText,
  TrendingUp,
  Sparkles,
  Stethoscope,
  Plus,
  Save,
  Printer,
  Calendar,
  CheckCircle,
  FileCheck,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  computeParameterTrends,
  computeRiskIndicatorsFromReports,
} from '../../utils/healthAnalytics';
import {
  PatientProfile,
  MedicalReport,
  DoctorNote,
  FollowUpRecommendation,
  RiskIndicator,
  ParameterTrend,
} from '../../types';
import { TrendChart } from '../../components/TrendChart';
import { ParameterGauge } from '../../components/ParameterGauge';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';

export const DoctorPatientView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentDoctor } = useAuth();
  const { language, t } = useLanguage();

  const patientId = id || '';
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [notes, setNotes] = useState<DoctorNote[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpRecommendation[]>([]);

  // Add Note Form states
  const [remarks, setRemarks] = useState('');
  const [advice, setAdvice] = useState('');
  const [plan, setPlan] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteSavedAlert, setNoteSavedAlert] = useState(false);

  // Add Follow-up Form states
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [fupTest, setFupTest] = useState('HbA1c & Fasting Glucose Evaluation');
  const [fupDate, setFupDate] = useState('2026-11-20');
  const [fupUrgency, setFupUrgency] = useState<'routine' | 'priority' | 'urgent'>('priority');
  const [fupReason, setFupReason] = useState('Evaluate glycemic response following dietary adjustments');

  // Summary download modal
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  useEffect(() => {
    if (patientId) {
      const p = StorageService.getPatientById(patientId);
      if (p) setPatient(p);
      setReports(StorageService.getReports(patientId));
      setNotes(StorageService.getDoctorNotes(patientId));
      setFollowUps(StorageService.getFollowUps(patientId));
    }
  }, [patientId]);

  // Compute dynamic trends and risk indicators strictly from this patient's actual reports
  const computedTrends = computeParameterTrends(reports);
  const risks = computeRiskIndicatorsFromReports(reports, patientId);
  const latestReport = reports[0];

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks || !advice) return;

    const newNote: DoctorNote = {
      id: `note-${Date.now()}`,
      patientId,
      doctorId: currentDoctor?.id || 'doctor-1',
      doctorName: currentDoctor?.name || 'Dr. Priya Sharma',
      doctorSpecialization: currentDoctor?.specialization || 'Internal Medicine & Diabetology',
      date: new Date().toISOString().split('T')[0],
      clinicalRemarks: remarks,
      treatmentAdvice: advice,
      followUpPlan: plan,
    };

    StorageService.addDoctorNote(newNote);
    setNotes(StorageService.getDoctorNotes(patientId));
    setShowNoteModal(false);
    setRemarks('');
    setAdvice('');
    setPlan('');
    setNoteSavedAlert(true);
    setTimeout(() => setNoteSavedAlert(false), 3000);
  };

  const handleSaveFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    const newFup: FollowUpRecommendation = {
      id: `fup-${Date.now()}`,
      patientId,
      doctorId: currentDoctor?.id || 'doctor-1',
      doctorName: currentDoctor?.name || 'Dr. Priya Sharma',
      testName: fupTest,
      recommendedDate: fupDate,
      urgency: fupUrgency,
      reason: fupReason,
      status: 'pending',
    };

    StorageService.addFollowUp(newFup);
    setFollowUps(StorageService.getFollowUps(patientId));
    setShowFollowUpModal(false);
  };

  if (!patient) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        {language === 'ta' ? 'நோயாளி மருத்துவ பதிவு ஏற்றப்படுகிறது...' : 'Loading patient clinical chart...'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      {/* Header and Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/doctor"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('backToPatients')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{patient.name}</h1>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
              PID: {patient.id}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {patient.age} {language === 'ta' ? 'வயது' : 'yrs'} · {patient.gender} · {t('bloodGroupLabel')}: {patient.bloodGroup} · {t('chronicConditions')}: {patient.chronicConditions.join(', ') || t('noneRecorded')}
          </p>
        </div>

        {/* Doctor Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSummaryModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>{t('actionDownloadSummary')}</span>
          </button>
          <button
            onClick={() => setShowFollowUpModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>{t('orderTestBtn')}</span>
          </button>
          <button
            onClick={() => setShowNoteModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-teal-400" />
            <span>{t('actionAddNote')}</span>
          </button>
        </div>
      </div>

      {noteSavedAlert && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{language === 'ta' ? 'மருத்துவ குறிப்பு நோயாளியின் பதிவில் வெற்றிகரமாக சேர்க்கப்பட்டது.' : 'Clinical note recorded into patient record and health timeline.'}</span>
        </div>
      )}

      {/* Patient Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Medical History & Baseline */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-xs">
          <h3 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
            {language === 'ta' ? 'மருத்துவ விவரங்கள் & அடிப்படைகள்' : 'Clinical Baseline & Details'}
          </h3>
          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between">
              <span>{t('allergies')}:</span>
              <strong className="text-slate-800">{patient.allergies.join(', ') || t('noneRecorded')}</strong>
            </div>
            <div className="flex justify-between">
              <span>{t('chronicConditions')}:</span>
              <strong className="text-slate-800">{patient.chronicConditions.join(', ') || t('noneRecorded')}</strong>
            </div>
            <div className="flex justify-between">
              <span>{t('bloodGroupLabel')}:</span>
              <strong className="font-mono text-slate-800">{patient.bloodGroup}</strong>
            </div>
            <div className="flex justify-between">
              <span>{language === 'ta' ? 'பதிவேற்றப்பட்ட அறிக்கைகள்' : 'Uploaded Reports'}:</span>
              <strong className="font-mono text-slate-800">{reports.length}</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Emergency Contact */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-xs">
          <h3 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
            {t('emergencyContactHeader')}
          </h3>
          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between">
              <span>{t('contactNameRelLabel')}:</span>
              <strong className="text-slate-800">{patient.emergencyContact?.name || t('noneRecorded')}</strong>
            </div>
            <div className="flex justify-between">
              <span>{t('relationship')}:</span>
              <strong className="text-slate-800">{patient.emergencyContact?.relationship || '—'}</strong>
            </div>
            <div className="flex justify-between">
              <span>{t('emergencyPhoneLabel')}:</span>
              <strong className="font-mono text-slate-800">{patient.emergencyContact?.phone || '—'}</strong>
            </div>
          </div>
        </div>

        {/* Card 3: Assigned Care */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-xs">
          <h3 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
            {language === 'ta' ? 'மருத்துவ கவனிப்பு நிலை' : 'Assigned Care Status'}
          </h3>
          <div className="space-y-1.5 text-slate-700">
            <div className="flex justify-between text-slate-600">
              <span>{language === 'ta' ? 'நியமிக்கப்பட்ட மருத்துவர்' : 'Assigned Doctor'}:</span>
              <strong className="text-slate-800">{patient.assignedDoctorName || currentDoctor?.name || 'Dr. Priya Sharma'}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{language === 'ta' ? 'நிலுவை பின்தொடர்வுகள்' : 'Pending Follow-ups'}:</span>
              <strong className="font-mono text-slate-800">{followUps.filter((f) => f.status === 'pending').length}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{language === 'ta' ? 'பதிவான குறிப்புகள்' : 'Clinical Notes'}:</span>
              <strong className="font-mono text-slate-800">{notes.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* AI Doctor SOAP Clinical Summary Banner */}
      {latestReport?.aiDoctorSummary && (
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              {t('aiGeneratedSummaryTitle')} (SOAP) · {latestReport.reportTitle}
            </h3>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed font-mono whitespace-pre-line text-slate-800">
            {latestReport.aiDoctorSummary}
          </div>
        </div>
      )}

      {/* Abnormal Values and Risk Indicators Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Abnormal Parameters in Latest Report (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-semibold text-slate-900">
                {t('kpiAbnormalParameters')} ({latestReport?.abnormalCount || 0})
              </h3>
            </div>
            {latestReport && (
              <Link
                to={`/reports/${latestReport.id}`}
                className="text-xs text-teal-700 hover:text-teal-900 font-medium"
              >
                {t('actionViewDetails')}
              </Link>
            )}
          </div>

          {reports.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-500">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">{t('noReportsForPatient')}</p>
            </div>
          ) : latestReport?.abnormalCount === 0 ? (
            <div className="p-6 bg-white border border-slate-200 rounded-xl text-center text-xs text-emerald-800 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{language === 'ta' ? 'அசாதாரண அளவீடுகள் எதுவும் இல்லை.' : 'No abnormal parameters flagged in the latest report.'}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {latestReport?.parameters
                .filter((p) => p.status === 'abnormal' || p.status === 'borderline')
                .map((p) => (
                  <ParameterGauge key={p.id} parameter={p} />
                ))}
            </div>
          )}

          {/* Longitudinal Trend Chart if computed trends exist */}
          {computedTrends.length > 0 && (
            <div className="pt-2">
              <TrendChart trend={computedTrends[0]} height={200} />
            </div>
          )}
        </div>

        {/* Right: AI Risk Indicators & Follow-up Recommendations (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">
            {t('activeRiskIndicatorsTitle')} & {t('navFollowUps')}
          </h3>

          {risks.length === 0 ? (
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-500">
              {language === 'ta' ? 'செயலில் உள்ள இடர் குறியீடுகள் எதுவும் இல்லை.' : 'No active risk indicators detected for this patient.'}
            </div>
          ) : (
            risks.map((risk) => (
              <div key={risk.id} className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-900">
                    {language === 'ta' && risk.tamilTitle ? risk.tamilTitle : risk.title}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                    {risk.severity}
                  </span>
                </div>
                <p className="text-amber-950 leading-relaxed text-[11px]">
                  {language === 'ta' && risk.tamilReason ? risk.tamilReason : risk.reason}
                </p>
                <div className="pt-1 text-[10px] text-amber-800">
                  <strong>{t('suggestedActionLabel')}: </strong>{' '}
                  {language === 'ta' && risk.tamilSuggestedAction ? risk.tamilSuggestedAction : risk.suggestedAction}
                </div>
              </div>
            ))
          )}

          {/* Pending Follow-up Orders */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                {t('followUpsRepoTitle')} ({followUps.length})
              </h4>
            </div>

            {followUps.length === 0 ? (
              <p className="text-xs text-slate-400">{t('noFollowUpsYet')}</p>
            ) : (
              <div className="space-y-2">
                {followUps.map((fup) => (
                  <div key={fup.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{fup.testName}</span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-rose-50 text-rose-700">
                        {fup.urgency}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">{fup.reason}</p>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      {t('targetDueDateLabel')}: {fup.recommendedDate}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Consultation Notes Stream */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              {t('clinicalNotesRepoTitle')} ({notes.length})
            </h3>
          </div>
          <button
            onClick={() => setShowNoteModal(true)}
            className="text-xs font-medium text-teal-700 hover:text-teal-900"
          >
            + {t('actionAddNote')}
          </button>
        </div>

        {notes.length === 0 ? (
          <p className="text-xs text-slate-400">{t('noNotesYet')}</p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs leading-relaxed"
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="font-bold text-slate-900">
                    {note.doctorName} · {note.doctorSpecialization}
                  </span>
                  <span className="font-mono tabular-nums text-slate-500">{note.date}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">{t('clinicalAssessmentLabel')}: </span>
                  <p className="text-slate-700 mt-0.5">{note.clinicalRemarks}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">{t('treatmentAdviceLabel')}: </span>
                  <p className="text-slate-700 mt-0.5">{note.treatmentAdvice}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">{t('followUpPlanLabel')}: </span>
                  <p className="text-slate-700 mt-0.5">{note.followUpPlan}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">{t('recordConsultationNoteBtn')}</h3>
            <form onSubmit={handleSaveNote} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t('clinicalAssessmentLabel')}</label>
                <textarea
                  rows={3}
                  required
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={language === 'ta' ? 'நோயாளியின் பரிசோதனை மதிப்பீடு...' : 'Patient presented for routine review. Evaluated recent parameter progression...'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t('treatmentAdviceLabel')}</label>
                <textarea
                  rows={2}
                  required
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  placeholder={language === 'ta' ? 'மருத்துவ பரிந்துரைகள் மற்றும் உணவு முறை...' : 'Titrate therapy as required. Dietary and lifestyle counseling...'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t('followUpPlanLabel')}</label>
                <input
                  type="text"
                  required
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  placeholder={language === 'ta' ? 'பின்தொடர் ஆய்வு திட்டம்...' : 'Repeat evaluation in 6 weeks.'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 transition-colors"
                >
                  {t('actionCancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                >
                  {t('saveNoteBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Follow-up Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">{t('orderFollowUpBtn')}</h3>
            <form onSubmit={handleSaveFollowUp} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t('investigationNameLabel')}</label>
                <input
                  type="text"
                  required
                  value={fupTest}
                  onChange={(e) => setFupTest(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t('targetDueDateLabel')}</label>
                <input
                  type="date"
                  required
                  value={fupDate}
                  onChange={(e) => setFupDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono text-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t('clinicalUrgencyLabel')}</label>
                <select
                  value={fupUrgency}
                  onChange={(e) => setFupUrgency(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white"
                >
                  <option value="routine">{t('urgencyRoutine')}</option>
                  <option value="priority">{t('urgencyPriority')}</option>
                  <option value="urgent">{t('urgencyUrgent')}</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t('reasonForOrderLabel')}</label>
                <textarea
                  rows={2}
                  required
                  value={fupReason}
                  onChange={(e) => setFupReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFollowUpModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 transition-colors"
                >
                  {t('actionCancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                >
                  {t('orderTestBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clinical Summary Download Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t('clinicalSummaryDocTitle')}</h3>
                <p className="text-xs text-slate-500">MediMind AI Clinical Consultation Summary</p>
              </div>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
              >
                {t('actionClose')}
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs leading-relaxed text-slate-800 font-mono">
              <p>===============================================================</p>
              <p>PATIENT: {patient.name} | AGE: {patient.age} | GENDER: {patient.gender} | BLOOD: {patient.bloodGroup}</p>
              <p>ATTENDING PHYSICIAN: {currentDoctor?.name || 'Dr. Priya Sharma'} ({currentDoctor?.licenseNumber || 'TN-MED-84920'})</p>
              <p>DIAGNOSTIC HISTORY: {patient.chronicConditions.join(', ') || 'None recorded'}</p>
              <p>===============================================================</p>
              <p>CURRENT LABORATORY OBSERVATIONS ({reports.length} Reports):</p>
              {latestReport ? (
                <>
                  <p>• Latest Report: {latestReport.reportTitle} ({latestReport.reportDate})</p>
                  <p>• Abnormal Count: {latestReport.abnormalCount} | Normal Count: {latestReport.normalCount}</p>
                  {latestReport.parameters.map((p) => (
                    <p key={p.name}>  - {p.name}: {p.value} {p.unit} [{p.status.toUpperCase()}] (Ref: {p.referenceRange.text})</p>
                  ))}
                </>
              ) : (
                <p>• No laboratory panels uploaded yet by this patient.</p>
              )}
              <p>===============================================================</p>
              <p>THERAPEUTIC & FOLLOW-UP ORDERS:</p>
              {followUps.length > 0 ? (
                followUps.map((f) => (
                  <p key={f.id}>• Order: {f.testName} (Target: {f.recommendedDate}, Urgency: {f.urgency})</p>
                ))
              ) : (
                <p>• Routine review as clinically indicated.</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">Clinical Decision-Support Output</span>
              <button
                onClick={() => {
                  window.print();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('actionPrint')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
