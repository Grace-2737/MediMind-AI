import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Stethoscope,
  Activity,
  FileText,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { StorageService } from '../../services/storage';
import { PatientProfile, MedicalReport, FollowUpRecommendation } from '../../types';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';
import { NextMoveGuide } from '../../components/NextMoveGuide';

export const DoctorDashboard: React.FC = () => {
  const { currentDoctor } = useAuth();
  const { language, t } = useLanguage();

  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [search, setSearch] = useState('');
  const [allReports, setAllReports] = useState<MedicalReport[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpRecommendation[]>([]);

  useEffect(() => {
    setPatients(StorageService.getPatients());
    setAllReports(StorageService.getAllReports());
    setFollowUps(StorageService.getFollowUps());
  }, []);

  const totalAbnormalMarkers = allReports.reduce((acc, r) => acc + (r.abnormalCount || 0), 0);
  const pendingFollowUps = followUps.filter((f) => f.status === 'pending');

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.chronicConditions.some((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      {/* Doctor Header Banner */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base">
            <Stethoscope className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">
              {t('greetingDoctor')},
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {currentDoctor?.name || 'Dr. Priya Sharma'}
            </h1>
            <p className="text-xs text-slate-500">
              {currentDoctor?.specialization || 'Internal Medicine & Diabetology'} · {currentDoctor?.hospital || 'Apex Specialty Center'} · {t('licenseNumberLabel')}: {currentDoctor?.licenseNumber || 'TN-MED-84920'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/doctor/notes"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            {t('navDoctorNotes')}
          </Link>
        </div>
      </div>

      <NextMoveGuide />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">{t('navPatients')}</span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {patients.length}
            </span>
            <span className="text-xs text-slate-500">{language === 'ta' ? 'பதிவு செய்யப்பட்ட நோயாளிகள்' : 'active rosters'}</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">{t('kpiAbnormalParameters')}</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-rose-600 tabular-nums">
              {totalAbnormalMarkers}
            </span>
            <span className="text-xs text-rose-600 font-medium">{t('statusAbnormal')}</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">{t('kpiRecentReports')}</span>
            <FileText className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {allReports.length}
            </span>
            <span className="text-xs text-slate-500">{t('recordsCount')}</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">{t('navFollowUps')}</span>
            <Calendar className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {pendingFollowUps.length}
            </span>
            <span className="text-xs text-slate-500">{language === 'ta' ? 'நிலுவையில் உள்ளவை' : 'pending orders'}</span>
          </div>
        </div>
      </div>

      {/* Patient Directory Roster */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              {t('authorizedPatientsTitle')} ({patients.length})
            </h2>
            <p className="text-xs text-slate-500">
              {t('authorizedPatientsSubtitle')}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'ta' ? 'நோயாளி பெயர் அல்லது உடல் நிலை மூலம் தேடுக...' : 'Search patients by name or condition...'}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden text-slate-900"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              {t('noPatientsFound')}
            </div>
          ) : (
            filtered.map((pt) => {
              const patientReports = allReports.filter((r) => r.patientId === pt.id);
              const latest = patientReports[0];

              return (
                <div
                  key={pt.id}
                  className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{pt.name}</h3>
                      <span className="text-xs text-slate-500">
                        {pt.age} {language === 'ta' ? 'வயது' : 'yrs'} · {pt.gender} · {t('bloodGroupLabel')}: {pt.bloodGroup}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-slate-400 font-medium">{t('chronicConditions')}:</span>
                      {pt.chronicConditions.length === 0 ? (
                        <span className="text-slate-400 text-[11px] italic">{t('noneRecorded')}</span>
                      ) : (
                        pt.chronicConditions.map((cond, i) => (
                          <span key={i} className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {cond}
                          </span>
                        ))
                      )}
                    </div>

                    {latest ? (
                      <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-2">
                        <span>{t('latestLabel')}:</span>
                        <strong className="text-slate-700">{latest.reportTitle}</strong>
                        <span className="font-mono tabular-nums text-slate-400">({latest.reportDate})</span>
                        {latest.abnormalCount > 0 && (
                          <span className="text-rose-600 font-semibold">
                            · {latest.abnormalCount} {t('statusAbnormal')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 pt-1">
                        {t('noReportsForPatient')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/doctor/patient/${pt.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <span>{t('openClinicalRecordBtn')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
