import React, { useState, useEffect } from 'react';
import { Stethoscope, Calendar, User, Search, Plus, FileText } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { useLanguage } from '../../context/LanguageContext';
import { DoctorNote, PatientProfile } from '../../types';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';

export const DoctorNotesView: React.FC = () => {
  const { language, t } = useLanguage();
  const [notes, setNotes] = useState<DoctorNote[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const allPatients = StorageService.getPatients();
    setPatients(allPatients);
    let allNotes: DoctorNote[] = [];
    allPatients.forEach((p) => {
      allNotes = [...allNotes, ...StorageService.getDoctorNotes(p.id)];
    });
    setNotes(allNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const filtered = notes.filter((n) =>
    n.clinicalRemarks.toLowerCase().includes(search.toLowerCase()) ||
    n.doctorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('clinicalNotesRepoTitle')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('clinicalNotesRepoSubtitle')}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'ta' ? 'மருத்துவ குறிப்புகளைத் தேடுக...' : 'Search clinical notes...'}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden text-slate-900"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-10 bg-white border border-slate-200 rounded-xl text-center space-y-2 text-xs text-slate-500">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">{t('noNotesYet')}</p>
          </div>
        ) : (
          filtered.map((note) => {
            const pt = patients.find((p) => p.id === note.patientId);

            return (
              <div
                key={note.id}
                className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 text-xs leading-relaxed shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {language === 'ta' ? 'நோயாளி' : 'Patient'}: {pt?.name || note.patientId}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">PID: {note.patientId}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span>{language === 'ta' ? 'மருத்துவர்' : 'Attending'}: <strong>{note.doctorName}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{note.date}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="font-semibold text-slate-900 block mb-0.5">{t('clinicalAssessmentLabel')}:</span>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100">
                      {note.clinicalRemarks}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 block mb-0.5">{t('treatmentAdviceLabel')}:</span>
                    <p className="text-slate-700 bg-teal-50/40 p-2.5 rounded border border-teal-100">
                      {note.treatmentAdvice}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 block mb-0.5">{t('followUpPlanLabel')}:</span>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100">
                      {note.followUpPlan}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
