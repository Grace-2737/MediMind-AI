import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Sparkles, CheckCircle, Shield, AlertTriangle } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { useLanguage } from '../../context/LanguageContext';
import { AuditLog } from '../../types';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';

export const AdminAiAnalytics: React.FC = () => {
  const { language, t } = useLanguage();
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    setLogs(StorageService.getAuditLogs());
  }, []);

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" />
          <span>{language === 'ta' ? 'AI எஞ்சின் & OCR கணினி பகுப்பாய்வு' : 'AI Engine & OCR System Analytics'}</span>
        </h1>
        <p className="text-xs text-slate-500">
          {language === 'ta'
            ? 'ஜெமினி 3.8 ஃப்ளாஷ் அனுமானம், ஹியூரிஸ்டிக் ஃபால்பேக் விகிதங்கள் மற்றும் பிரித்தெடுத்தல் துல்லியம்'
            : 'Telemetry for Gemini 3.8 Flash inference, heuristic fallback rates, and extraction accuracy'}
        </p>
      </div>

      {/* Model Spec Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
            <Cpu className="w-4 h-4 text-teal-600" />
            <span>{language === 'ta' ? 'இயற்கை மொழி செயலாக்க எஞ்சின்' : 'NLP Inference Engine'}</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900">Gemini 3.8 Flash</h3>
          <p className="text-xs text-slate-600">
            {language === 'ta'
              ? 'இரு-முறை சுருக்கங்களை உருவாக்குகிறது (நோயாளி சுருக்கம் + மருத்துவர் SOAP), இருமொழி தமிழ் விளக்கங்கள் மற்றும் Ask MediMind வினவல்களுக்கு பதிலளிக்கிறது.'
              : 'Generates dual-mode summaries (Patient friendly + Doctor SOAP), bilingual Tamil explanations, and answers Ask MediMind queries.'}
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>{language === 'ta' ? 'ML இடர் வகைப்படுத்தி' : 'ML Risk Classifier'}</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900">Scikit-Learn Pipeline</h3>
          <p className="text-xs text-slate-600">
            {language === 'ta'
              ? 'RandomForestClassifier மற்றும் பல காரணி மாதிரிகள் கிளைசெமிக் மற்றும் இருதய ஆபத்து சாத்தியக்கூறுகளை கணிக்கின்றன.'
              : 'RandomForestClassifier and Logistic Regression multi-factor models predicting glycemic and cardiovascular risk probabilities.'}
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>{language === 'ta' ? 'ஆவண பிரித்தெடுப்பான்' : 'Document Parser'}</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900">PyMuPDF / Tesseract</h3>
          <p className="text-xs text-slate-600">
            {language === 'ta'
              ? 'டிஜிட்டல் PDF உரை பிரித்தெடுத்தல் மற்றும் ஸ்கேன் செய்யப்பட்ட மருத்துவ அறிக்கை படங்களுக்கான OCR தொழில்நுட்பம்.'
              : 'Digital PDF text stream extraction and optical character recognition for scanned medical report images.'}
          </p>
        </div>
      </div>

      {/* Live System Activity Trail */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
        <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
          {language === 'ta' ? 'முழு கணினி தணிக்கை பதிவு' : 'Complete System Audit Trail'} ({logs.length} {language === 'ta' ? 'நிகழ்வுகள் பதிவாகியுள்ளன' : 'events recorded'})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[11px]">
                <th className="py-2.5 px-3">{language === 'ta' ? 'நேரம்' : 'Timestamp'}</th>
                <th className="py-2.5 px-3">{language === 'ta' ? 'பயனர்' : 'Actor'}</th>
                <th className="py-2.5 px-3">{language === 'ta' ? 'பங்கு' : 'Role'}</th>
                <th className="py-2.5 px-3">{language === 'ta' ? 'நிகழ்வு குறியீடு' : 'Event Code'}</th>
                <th className="py-2.5 px-3">{language === 'ta' ? 'விளக்கம்' : 'Description'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{log.userName}</td>
                  <td className="py-2.5 px-3 capitalize text-slate-600">{log.role}</td>
                  <td className="py-2.5 px-3 font-semibold text-teal-700">{log.action}</td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-sm truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
