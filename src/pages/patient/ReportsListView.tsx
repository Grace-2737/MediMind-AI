import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Upload, Search, Filter, ArrowRight, GitCompare, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { StorageService } from '../../services/storage';
import { MedicalReport } from '../../types';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';

export const ReportsListView: React.FC = () => {
  const { currentPatient, currentUser } = useAuth();
  const { language, t } = useLanguage();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const patientId = currentPatient?.id || currentUser?.id || '';

  useEffect(() => {
    setReports(StorageService.getReports(patientId));
  }, [patientId]);

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.reportTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.labName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || r.reportType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('navReports')}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'வரலாற்று ஆய்வக முடிவுகள், நோயறிதல் சோதனைகள் மற்றும் AI பிரித்தெடுத்தல் பதிவுகள்'
              : 'Historical laboratory results, diagnostic panels, and AI extraction records'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {reports.length >= 2 && (
            <Link
              to="/compare"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('actionCompare')}</span>
            </Link>
          )}
          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-teal-400" />
            <span>{t('actionUpload')}</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ta' ? 'அறிக்கை பெயர் அல்லது ஆய்வகம் கொண்டு தேடுக...' : 'Search by report name or laboratory...'}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden text-slate-700"
          >
            <option value="ALL">{language === 'ta' ? 'அனைத்து பிரிவுகளும்' : 'All Panel Types'}</option>
            <option value="Comprehensive Panel">Comprehensive Panel</option>
            <option value="HbA1c">HbA1c & Glucose</option>
            <option value="Lipid Profile">Lipid Profile</option>
            <option value="CBC">Complete Blood Count</option>
            <option value="Thyroid Profile">Thyroid Profile</option>
          </select>
        </div>
      </div>

      {/* Reports Table Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-900">
              {reports.length === 0 ? t('noReportsUploadedTitle') : (language === 'ta' ? 'பொருந்தும் அறிக்கைகள் எதுவும் கிடைக்கவில்லை' : 'No matching reports found')}
            </p>
            <p className="text-xs text-slate-500">
              {reports.length === 0 ? t('noReportsUploadedDesc') : (language === 'ta' ? 'உங்கள் தேடல் சொல்லை மாற்றவும் அல்லது புதிய அறிக்கையை பதிவேற்றவும்.' : 'Adjust your search filter or upload a new laboratory record.')}
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg"
            >
              <Upload className="w-3.5 h-3.5 text-teal-400" />
              <span>{t('actionUploadFirst')}</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{report.reportTitle}</h3>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      {report.reportType}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="font-mono tabular-nums">{report.reportDate}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{report.labName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{report.fileName}</span>
                  </div>

                  {/* Parameter Count Metrics */}
                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <span className="text-slate-600">
                      <strong>{report.parameters.length}</strong> {language === 'ta' ? 'அளவீடுகள்' : 'parameters'}
                    </span>
                    {report.abnormalCount > 0 && (
                      <span className="text-rose-600 font-semibold">
                        {report.abnormalCount} {t('statusAbnormal')}
                      </span>
                    )}
                    {report.borderlineCount > 0 && (
                      <span className="text-amber-600">
                        {report.borderlineCount} {t('statusBorderline')}
                      </span>
                    )}
                    <span className="text-emerald-600">
                      {report.normalCount} {t('statusNormal')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    to={`/reports/${report.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors"
                  >
                    <span>{t('actionViewDetails')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
