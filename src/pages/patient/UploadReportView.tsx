import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  CheckCircle,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
  FileCheck,
  Scan,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { determineStatus } from '../../utils/reportParser';
import { ExtractedParameter, MedicalReport, AbnormalityArea } from '../../types';
import { ApiService } from '../../services/api';
import { StorageService } from '../../services/storage';
import { DoctorConsultationSection } from '../../components/DoctorConsultationSection';
import { ReportComparisonChart } from '../../components/ReportComparisonChart';

export const UploadReportView: React.FC = () => {
  const navigate = useNavigate();
  const { currentPatient, currentUser } = useAuth();
  const { language, t } = useLanguage();
  const isTa = language === 'ta';

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Select & Upload, 2: Extracting/Analyzing, 3: Review & Save
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState<any>('Comprehensive Panel');
  const [labName, setLabName] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileBase64, setSelectedFileBase64] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('application/pdf');
  const [rawTextContent, setRawTextContent] = useState<string>('');
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');

  const [progressText, setProgressText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const [extractedParameters, setExtractedParameters] = useState<ExtractedParameter[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<{
    patientSummary: string;
    doctorSummary: string;
    tamilSummary: string;
    keyFindings: string[];
    abnormalityAreas?: AbnormalityArea[];
  } | null>(null);

  // New manual parameter form state
  const [newParamName, setNewParamName] = useState('');
  const [newParamCategory, setNewParamCategory] = useState('Glycemic');
  const [newParamValue, setNewParamValue] = useState<number>(0);
  const [newParamUnit, setNewParamUnit] = useState('mg/dL');
  const [newParamMin, setNewParamMin] = useState<number>(70);
  const [newParamMax, setNewParamMax] = useState<number>(99);
  const [newParamRefText, setNewParamRefText] = useState('70 - 99 mg/dL');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      setSelectedMimeType(file.type || 'application/pdf');
      setReportTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      setExtractionError(null);

      const reader = new FileReader();
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        reader.onload = () => {
          setSelectedFileBase64(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = () => {
          setRawTextContent(reader.result as string);
        };
        reader.readAsText(file);
      }
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFileName && !rawTextContent.trim() && extractedParameters.length === 0) {
      setExtractionError(
        isTa
          ? 'தயவுசெய்து ஒரு ஆய்வக அறிக்கையை பதிவேற்றவும் அல்லது அறிக்கையின் உரையை உள்ளிடவும்.'
          : 'Please select a laboratory report file or paste diagnostic report text to proceed.'
      );
      return;
    }

    setExtractionError(null);
    setStep(2);
    setProgressPercent(20);
    setProgressText(
      isTa
        ? 'ஆய்வக அறிக்கையிலிருந்து OCR ஸ்கேனிங் மூலம் உரை பிரித்தெடுக்கப்படுகிறது...'
        : 'Scanning laboratory report with high-precision OCR pipeline...'
    );

    try {
      let paramsToUse = [...extractedParameters];

      // If we don't already have extracted parameters, perform OCR extraction
      if (paramsToUse.length === 0) {
        setProgressPercent(45);
        setProgressText(
          isTa
            ? 'அளவீடுகள் மற்றும் ஆய்வக குறிப்பு வரம்புகள் அடையாளம் காணப்படுகின்றன...'
            : 'Extracting diagnostic test parameters and clinical reference intervals...'
        );

        const ocrResult = await ApiService.ocrExtractDocument({
          fileBase64: selectedFileBase64 || undefined,
          mimeType: selectedMimeType,
          fileName: selectedFileName || 'Report',
          textContent: rawTextContent || undefined,
        });

        if (ocrResult && ocrResult.parameters && ocrResult.parameters.length > 0) {
          paramsToUse = ocrResult.parameters;
          setExtractedParameters(paramsToUse);
          if (ocrResult.reportTitle) setReportTitle(ocrResult.reportTitle);
          if (ocrResult.reportType) setReportType(ocrResult.reportType);
          if (ocrResult.labName) setLabName(ocrResult.labName);
          if (ocrResult.reportDate) setReportDate(ocrResult.reportDate);
        } else {
          // No parameters could be extracted - DO NOT SET DEFAULT VALUES
          setProgressPercent(100);
          setStep(1);
          setExtractionError(
            isTa
              ? 'இந்த கோப்பிலிருந்து ஆய்வக அளவீடுகளை தானாகவே கண்டறிய முடியவில்லை. தயவுசெய்து தெளிவான ஆவணத்தை பதிவேற்றவும் அல்லது கீழே உள்ள "அளவீட்டை சேர்" பொத்தானை பயன்படுத்தி கைமுறையாக உள்ளிடவும்.'
              : 'Could not automatically identify structured test parameters from this file. Please upload a clearer scan, paste raw lab text, or use "Add Parameter" to input your values directly.'
          );
          return;
        }
      }

      setProgressPercent(75);
      setProgressText(
        isTa
          ? 'அசாதாரணங்கள் கண்டறியப்பட்டு சிறப்பு மருத்துவர் பரிந்துரைகள் உருவாக்கப்படுகின்றன...'
          : 'Analyzing flagged abnormalities and matching enrolled clinical specialists...'
      );

      const analysisResult = await ApiService.analyzeReport({
        reportTitle,
        reportType,
        parameters: paramsToUse,
        labName,
        reportDate,
        patientId: currentPatient?.id || currentUser?.id,
        patientName: currentPatient?.name || currentUser?.name,
      });

      setAiAnalysis(analysisResult);
      setProgressPercent(100);

      setTimeout(() => {
        setStep(3);
      }, 400);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setExtractionError(
        isTa
          ? 'அறிக்கையை பகுப்பாய்வு செய்வதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
          : 'Encountered an issue analyzing report. Please try again.'
      );
      setStep(1);
    }
  };

  const handleAddManualParameter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParamName.trim()) return;

    const status = determineStatus(newParamValue, newParamMin, newParamMax);
    const newParam: ExtractedParameter = {
      id: `param-manual-${Date.now()}`,
      name: newParamName.trim(),
      category: newParamCategory,
      value: newParamValue,
      unit: newParamUnit.trim(),
      referenceRange: {
        min: newParamMin,
        max: newParamMax,
        text: newParamRefText.trim() || `${newParamMin} - ${newParamMax} ${newParamUnit}`,
      },
      status,
    };

    setExtractedParameters([...extractedParameters, newParam]);
    setNewParamName('');
    setShowAddForm(false);
  };

  const handleRemoveParameter = (id: string) => {
    setExtractedParameters(extractedParameters.filter((p) => p.id !== id));
  };

  const handleSaveReport = () => {
    const abnormalCount = extractedParameters.filter((p) => p.status === 'abnormal').length;
    const borderlineCount = extractedParameters.filter((p) => p.status === 'borderline').length;
    const normalCount = extractedParameters.filter((p) => p.status === 'normal').length;

    const assignedPatientId = currentPatient?.id || (currentUser ? currentUser.id : 'patient-1');
    const assignedPatientName = currentPatient?.name || currentUser?.name || 'Patient';

    const newReport: MedicalReport = {
      id: `rep-${Date.now()}`,
      patientId: assignedPatientId,
      patientName: assignedPatientName,
      reportTitle,
      reportType,
      labName,
      reportDate,
      uploadDate: new Date().toISOString(),
      status: 'analyzed',
      fileName: selectedFileName || 'uploaded_lab_report.pdf',
      fileSize: '1.2 MB',
      parameters: extractedParameters,
      aiPatientSummary: aiAnalysis?.patientSummary,
      aiDoctorSummary: aiAnalysis?.doctorSummary,
      tamilSummary: aiAnalysis?.tamilSummary,
      keyFindings: aiAnalysis?.keyFindings || ['Parameters extracted and categorized.'],
      abnormalCount,
      borderlineCount,
      normalCount,
      abnormalityAreas: aiAnalysis?.abnormalityAreas,
    };

    StorageService.addReport(newReport);
    navigate(`/reports/${newReport.id}`);
  };

  const updateParamValue = (idx: number, newVal: number) => {
    const updated = [...extractedParameters];
    const target = updated[idx];
    target.value = newVal;
    target.status = determineStatus(newVal, target.referenceRange.min, target.referenceRange.max);
    setExtractedParameters(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('uploadTitle')}
          </h1>
          <p className="text-xs text-slate-500">
            {isTa
              ? 'உங்கள் ஆய்வக அறிக்கையை பதிவேற்றி உடனடி OCR ஸ்கேனிங் மற்றும் சிறப்பு மருத்துவர் பரிந்துரைகளை பெறவும்.'
              : 'Upload your lab report for high-precision OCR scanning, parameter extraction, and doctor consultation matching.'}
          </p>
        </div>
      </div>

      {extractionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-900">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">{isTa ? 'அறிவிப்பு:' : 'Document Notice:'}</span>
            <p>{extractionError}</p>
          </div>
        </div>
      )}

      {/* Step 1: Upload & Configuration Form */}
      {step === 1 && (
        <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-6 shadow-2xs">
          {/* Mode Switcher: Upload File vs Paste Text */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setInputMode('file')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                inputMode === 'file'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isTa ? 'ஆவணம் / ஸ்கேன் கோப்பு பதிவேற்றம்' : 'Upload PDF / Scanned Image'}</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                inputMode === 'text'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isTa ? 'ஆய்வக உரை உள்ளீடு' : 'Paste Lab Summary Text'}</span>
            </button>
          </div>

          {inputMode === 'file' ? (
            <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-8 text-center space-y-3 bg-slate-50/50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <Scan className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">
                  {selectedFileName ? selectedFileName : t('dragDropText')}
                </p>
                <p className="text-xs text-slate-500">
                  {t('supportedFormats')} (PDF, JPG, PNG)
                </p>
              </div>
              <label className="inline-block cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs">
                  {selectedFileName ? (isTa ? 'வேறு கோப்பை தேர்ந்தெடுக்க' : 'Change Selected File') : t('browseFilesBtn')}
                </span>
              </label>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                {isTa ? 'மருத்துவ ஆய்வக அறிக்கையின் உரையை இங்கு ஒட்டவும்:' : 'Paste Raw Medical Laboratory Text / Report Summary:'}
              </label>
              <textarea
                rows={6}
                value={rawTextContent}
                onChange={(e) => setRawTextContent(e.target.value)}
                placeholder="e.g. Fasting Blood Glucose: 135 mg/dL (Ref: 70-99), HbA1c: 7.1% (Ref: < 5.7%), Total Cholesterol: 228 mg/dL (Ref: < 200), Serum Creatinine: 1.1 mg/dL..."
                className="w-full p-3 border border-slate-200 rounded-lg text-xs font-mono focus:outline-hidden focus:border-slate-400 bg-white"
              />
            </div>
          )}

          {/* Metadata Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">{t('reportTitleLabel')}</label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400 bg-white"
                placeholder="e.g. Comprehensive Metabolic Panel"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">{t('reportTypeLabel')}</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400 bg-white"
              >
                <option value="Comprehensive Panel">Comprehensive Panel</option>
                <option value="CBC">Complete Blood Count (CBC)</option>
                <option value="HbA1c">HbA1c & Blood Glucose</option>
                <option value="Lipid Profile">Lipid Profile</option>
                <option value="Thyroid Profile">Thyroid Profile (TFT)</option>
                <option value="Liver Function">Liver Function (LFT)</option>
                <option value="Kidney Function">Kidney Function (KFT)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">{t('labNameLabel')}</label>
              <input
                type="text"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400 bg-white"
                placeholder="e.g. Apollo Diagnostics"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">{t('reportDateLabel')}</label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400 font-mono bg-white"
              />
            </div>
          </div>

          {/* Manual Parameter Management / Preview */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">
                {isTa ? 'அளவீடுகள் பட்டியல்' : 'Configured / Extracted Parameters'} ({extractedParameters.length})
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? (isTa ? 'படிவத்தை மூடு' : 'Close Form') : (isTa ? 'புதிய அளவீட்டை சேர்' : 'Add Test Parameter')}</span>
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddManualParameter} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Test Parameter Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fasting Glucose"
                      value={newParamName}
                      onChange={(e) => setNewParamName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Body Category</label>
                    <select
                      value={newParamCategory}
                      onChange={(e) => setNewParamCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                    >
                      <option value="Glycemic">Glycemic (Sugar/Diabetes)</option>
                      <option value="Lipid">Lipid (Cholesterol/Cardio)</option>
                      <option value="Renal">Renal (Kidney)</option>
                      <option value="Liver">Liver (Hepatic)</option>
                      <option value="Hematology">Hematology (Blood Count)</option>
                      <option value="Thyroid">Thyroid</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Measured Value</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newParamValue}
                      onChange={(e) => setNewParamValue(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Unit</label>
                    <input
                      type="text"
                      value={newParamUnit}
                      onChange={(e) => setNewParamUnit(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white font-mono"
                      placeholder="e.g. mg/dL"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Normal Min</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newParamMin}
                      onChange={(e) => setNewParamMin(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Normal Max</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newParamMax}
                      onChange={(e) => setNewParamMax(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Reference Range Text</label>
                    <input
                      type="text"
                      value={newParamRefText}
                      onChange={(e) => setNewParamRefText(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white font-mono"
                      placeholder="e.g. 70 - 99 mg/dL"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded text-xs transition-colors"
                  >
                    Add to Report
                  </button>
                </div>
              </form>
            )}

            {extractedParameters.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs">
                {extractedParameters.map((p) => (
                  <span
                    key={p.id || p.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded text-[11px] font-mono border border-slate-200"
                  >
                    <span>{p.name}: <strong className="text-slate-900">{p.value} {p.unit}</strong></span>
                    <button
                      type="button"
                      onClick={() => handleRemoveParameter(p.id)}
                      className="text-slate-400 hover:text-rose-600 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleStartAnalysis}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>{isTa ? 'OCR ஸ்கேனிங் & அறிக்கை பகுப்பாய்வு' : 'Analyze Report (OCR Scanning)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Animated Extraction & Analysis Progress */}
      {step === 2 && (
        <div className="p-12 bg-white border border-slate-200 rounded-xl text-center space-y-6 shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto text-teal-600">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-slate-900">
              {t('processingReportTitle')}
            </h3>
            <p className="text-xs text-slate-600 font-mono">{progressText}</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-teal-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-500 max-w-lg mx-auto pt-4">
            <div className="p-2 rounded bg-slate-50 border border-slate-100">1. Multimodal OCR</div>
            <div className="p-2 rounded bg-slate-50 border border-slate-100">2. Reference Ranges</div>
            <div className="p-2 rounded bg-slate-50 border border-slate-100">3. Abnormality Triage</div>
            <div className="p-2 rounded bg-slate-50 border border-slate-100">4. Doctor Matching</div>
          </div>
        </div>
      )}

      {/* Step 3: Review Extracted Data, Doctor Recommendations, Comparison Chart & Save */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 space-y-1">
              <p className="font-semibold text-emerald-900">{t('reviewAndSaveTitle')}</p>
              <p>
                {isTa
                  ? 'அறிக்கை வெற்றிகரமாக ஸ்கேன் செய்யப்பட்டு பகுப்பாய்வு செய்யப்பட்டது. கீழே உள்ள மருத்துவர் பரிந்துரைகள் மற்றும் வரைபடங்களை மதிப்பாய்வு செய்து சேமிக்கவும்.'
                  : 'Report successfully scanned and analyzed with OCR. Review detected abnormalities, matched doctor consultation, and graphs below before saving.'}
              </p>
            </div>
          </div>

          {/* AI Summaries Preview */}
          {aiAnalysis && (
            <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  {t('aiGeneratedSummaryTitle')}
                </h3>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100 font-normal">
                {isTa && aiAnalysis.tamilSummary ? aiAnalysis.tamilSummary : aiAnalysis.patientSummary}
              </p>
            </div>
          )}

          {/* Doctor Consultation Recommendations for Flagged Abnormalities */}
          <DoctorConsultationSection
            abnormalityAreas={aiAnalysis?.abnormalityAreas}
            patientId={currentPatient?.id || currentUser?.id}
            patientName={currentPatient?.name || currentUser?.name}
            reportTitle={reportTitle}
          />

          {/* Visual Parameter Comparison & Range Graphs */}
          <ReportComparisonChart
            parameters={extractedParameters}
            reportTitle={reportTitle}
          />

          {/* Extracted Parameters Table */}
          <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                {t('extractedParamsTitle')} ({extractedParameters.length})
              </h3>
              <span className="text-[11px] text-slate-400">
                {isTa ? 'மதிப்புகளை திருத்தலாம்' : 'Editable parameter values'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[11px]">
                    <th className="py-2 px-3">{t('colParameter')}</th>
                    <th className="py-2 px-3">{t('colCategory')}</th>
                    <th className="py-2 px-3 text-right">{t('colExtractedValue')}</th>
                    <th className="py-2 px-3">{t('colUnit')}</th>
                    <th className="py-2 px-3">{t('colReferenceRange')}</th>
                    <th className="py-2 px-3 text-center">{t('colStatus')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {extractedParameters.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{p.name}</td>
                      <td className="py-2.5 px-3 text-slate-500">{p.category}</td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={p.value}
                          onChange={(e) => updateParamValue(idx, parseFloat(e.target.value) || 0)}
                          className="w-24 text-right px-2 py-1 border border-slate-200 rounded font-mono font-bold text-slate-900 bg-white"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono">{p.unit}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">{p.referenceRange.text}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                            p.status === 'abnormal'
                              ? 'text-rose-700 bg-rose-50 border-rose-200'
                              : p.status === 'borderline'
                              ? 'text-amber-700 bg-amber-50 border-amber-200'
                              : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          }`}
                        >
                          {p.status === 'abnormal' ? t('statusAbnormal') : p.status === 'borderline' ? t('statusBorderline') : t('statusNormal')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Final Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg bg-white"
              >
                {t('reuploadBtn')}
              </button>
              <button
                type="button"
                onClick={handleSaveReport}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
              >
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>{t('actionConfirmSave')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
