import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { useLanguage } from '../../context/LanguageContext';
import { FollowUpRecommendation, PatientProfile } from '../../types';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';

export const DoctorFollowUpsView: React.FC = () => {
  const { language, t } = useLanguage();
  const [followUps, setFollowUps] = useState<FollowUpRecommendation[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);

  useEffect(() => {
    const pts = StorageService.getPatients();
    setPatients(pts);
    let allFups: FollowUpRecommendation[] = [];
    pts.forEach((p) => {
      allFups = [...allFups, ...StorageService.getFollowUps(p.id)];
    });
    setFollowUps(allFups);
  }, []);

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {t('followUpsRepoTitle')}
        </h1>
        <p className="text-xs text-slate-500">
          {t('followUpsRepoSubtitle')}
        </p>
      </div>

      {followUps.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-xl text-center space-y-2 text-xs text-slate-500">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700">{t('noFollowUpsYet')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {followUps.map((fup) => {
            const pt = patients.find((p) => p.id === fup.patientId);

            return (
              <div
                key={fup.id}
                className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 text-xs shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">
                      {language === 'ta' ? 'நோயாளி' : 'Patient'}: {pt?.name || fup.patientId}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{fup.testName}</h3>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded border uppercase ${
                      fup.urgency === 'urgent'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : fup.urgency === 'priority'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {fup.urgency === 'urgent' ? t('urgencyUrgent') : fup.urgency === 'priority' ? t('urgencyPriority') : t('urgencyRoutine')}
                  </span>
                </div>

                <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                  {fup.reason}
                </p>

                <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-slate-100">
                  <span>{language === 'ta' ? 'மருத்துவர்' : 'Ordering Doctor'}: {fup.doctorName}</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{fup.recommendedDate}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
