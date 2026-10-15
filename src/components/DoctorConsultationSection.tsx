import React, { useState } from 'react';
import {
  Stethoscope,
  Calendar,
  Building,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Send,
} from 'lucide-react';
import { AbnormalityArea, DoctorProfile } from '../types';
import { StorageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface DoctorConsultationSectionProps {
  abnormalityAreas?: AbnormalityArea[];
  patientId?: string;
  patientName?: string;
  reportTitle?: string;
}

export const DoctorConsultationSection: React.FC<DoctorConsultationSectionProps> = ({
  abnormalityAreas = [],
  patientId,
  patientName,
  reportTitle,
}) => {
  const { currentPatient, currentUser } = useAuth();
  const { language } = useLanguage();
  const isTa = language === 'ta';

  const [bookedDoctors, setBookedDoctors] = useState<Record<string, string>>({});
  const [selectedSlot, setSelectedSlot] = useState<Record<string, string>>({});

  const allDoctors = StorageService.getDoctors().filter((d) => d.status === 'approved');

  // Fallback if no abnormality areas passed but we have enrolled doctors
  const displayAreas = abnormalityAreas.length > 0 ? abnormalityAreas : [];

  const handleBookConsultation = (docId: string, areaName: string, doctorName: string) => {
    const timeSlot = selectedSlot[docId] || 'Tomorrow, 10:30 AM';
    const targetPatientId = patientId || currentPatient?.id || currentUser?.id || 'patient-1';
    const targetPatientName = patientName || currentPatient?.name || currentUser?.name || 'Patient';

    // Add recommendation / appointment into storage
    StorageService.addFollowUp({
      id: `fup-${Date.now()}`,
      patientId: targetPatientId,
      doctorId: docId,
      doctorName,
      testName: `Specialist Consultation: ${areaName}`,
      recommendedDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      urgency: 'priority',
      reason: `Specialist consultation for abnormal findings in ${areaName} (${reportTitle || 'Lab Report'}). Slot: ${timeSlot}`,
      status: 'scheduled',
    });

    setBookedDoctors((prev) => ({
      ...prev,
      [docId]: timeSlot,
    }));
  };

  if (displayAreas.length === 0) {
    return (
      <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-emerald-950">
            {isTa ? 'அனைத்து அளவீடுகளும் இயல்பாக உள்ளன' : 'All Test Parameters Within Reference Intervals'}
          </h3>
        </div>
        <p className="text-xs text-emerald-800 leading-relaxed">
          {isTa
            ? 'உங்கள் ஆய்வக அறிக்கையில் எந்த அவசர அசாதாரணங்களும் கண்டறியப்படவில்லை. தற்போது சிறப்பு மருத்துவர் ஆலோசனை தேவையில்லை. வழக்கமான வருடாந்திர பரிசோதனையை தொடருங்கள்.'
            : 'No abnormal values requiring urgent physician intervention were detected in this report. Maintain your wellness routine and standard periodic health screenings.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isTa ? 'கண்டறியப்பட்ட அசாதாரணங்கள் & பரிந்துரைக்கப்படும் சிறப்பு மருத்துவர்கள்' : 'Abnormalities Detected & Recommended Doctor Consultation'}
            </h3>
            <p className="text-xs text-slate-500">
              {isTa
                ? 'உங்கள் பரிசோதனை முடிவுகளில் கண்டறியப்பட்ட அசாதாரணங்களின்படி பதிவு செய்யப்பட்ட தகுதியான மருத்துவர்கள்.'
                : 'Matched from enrolled clinical specialists based on your flagged laboratory indicators.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayAreas.map((area, idx) => {
          const doc = area.recommendedDoctor;
          const isBooked = Boolean(bookedDoctors[doc.id]);

          return (
            <div
              key={`${area.area}-${idx}`}
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs hover:shadow-xs transition-shadow"
            >
              {/* Abnormality badge and flagged markers */}
              <div className="space-y-2 border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                    {area.area}
                  </span>
                  <span className="text-[10px] font-semibold text-rose-600 font-mono">
                    {area.severity.toUpperCase()} ATTENTION
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 block">
                    {isTa ? 'அசாதாரண அளவீடுகள்:' : 'Flagged Abnormal Markers:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {area.flaggedParameters.map((pName, pIdx) => (
                      <span
                        key={pIdx}
                        className="px-2 py-0.5 bg-rose-50/80 text-rose-800 border border-rose-200 rounded text-[11px] font-semibold font-mono"
                      >
                        {pName}
                      </span>
                    ))}
                  </div>
                </div>

                {area.findingsSummary && (
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {area.findingsSummary}
                  </p>
                )}
              </div>

              {/* Matched Doctor Enrollment Card */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3.5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{doc.name}</h4>
                      <p className="text-[11px] font-medium text-teal-700">{doc.specialization}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[180px]">{doc.hospital}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                    {doc.experienceYears}+ yrs exp
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded border border-slate-100 flex items-start gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span>{doc.reason}</span>
                </div>

                {isBooked ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-semibold block">
                        {isTa ? 'ஆலோசனை முன்பதிவு உறுதி செய்யப்பட்டது!' : 'Consultation Requested!'}
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        {bookedDoctors[doc.id]} · {doc.hospital}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {isTa ? 'விரைவு நேரம்:' : 'Available Slot:'}
                      </span>
                      <select
                        value={selectedSlot[doc.id] || 'Tomorrow, 10:30 AM'}
                        onChange={(e) => setSelectedSlot((prev) => ({ ...prev, [doc.id]: e.target.value }))}
                        className="text-[11px] py-1 px-2 border border-slate-200 rounded bg-white font-mono"
                      >
                        <option value="Tomorrow, 10:30 AM">Tomorrow, 10:30 AM</option>
                        <option value="Tomorrow, 02:00 PM">Tomorrow, 02:00 PM</option>
                        <option value="Friday, 11:00 AM">Friday, 11:00 AM</option>
                        <option value="Saturday, 04:30 PM">Saturday, 04:30 PM</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookConsultation(doc.id, area.area, doc.name)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
                    >
                      <Send className="w-3.5 h-3.5 text-teal-400" />
                      <span>
                        {isTa ? `டாக்டர் ${doc.name.replace('Dr. ', '')} உடன் ஆலோசனை முன்பதிவு செய்க` : `Consult with ${doc.name}`}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
