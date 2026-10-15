import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  GitCompare,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  BarChart2,
  Calendar,
  Upload,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { MedicalReport, ExtractedParameter } from '../../types';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';

export const CompareReportsView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { currentPatient, currentUser } = useAuth();
  const { language, t } = useLanguage();

  const patientId = currentPatient?.id || currentUser?.id || '';
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [reportAId, setReportAId] = useState<string>('');
  const [reportBId, setReportBId] = useState<string>('');

  useEffect(() => {
    const list = StorageService.getReports(patientId);
    setReports(list);

    const primaryParam = searchParams.get('primary');
    if (primaryParam && list.some((r) => r.id === primaryParam)) {
      setReportBId(primaryParam);
      const other = list.find((r) => r.id !== primaryParam);
      if (other) setReportAId(other.id);
    } else if (list.length >= 2) {
      setReportAId(list[1].id); // Previous
      setReportBId(list[0].id); // Latest
    } else if (list.length === 1) {
      setReportAId(list[0].id);
      setReportBId(list[0].id);
    }
  }, [patientId, searchParams]);

  const reportA = reports.find((r) => r.id === reportAId);
  const reportB = reports.find((r) => r.id === reportBId);

  // Match parameters between Report A and Report B
  interface ComparisonRow {
    name: string;
    unit: string;
    refRange: string;
    valueA?: number;
    statusA?: string;
    valueB?: number;
    statusB?: string;
    delta?: number;
    deltaPercent?: number;
  }

  const comparisonRows: ComparisonRow[] = [];
  if (reportA && reportB) {
    const mapA = new Map<string, ExtractedParameter>();
    reportA.parameters.forEach((p) => mapA.set(p.name, p));

    const mapB = new Map<string, ExtractedParameter>();
    reportB.parameters.forEach((p) => mapB.set(p.name, p));

    const allNames = Array.from(new Set([...mapA.keys(), ...mapB.keys()]));

    allNames.forEach((name) => {
      const pA = mapA.get(name);
      const pB = mapB.get(name);

      const valA = pA ? pA.value : undefined;
      const valB = pB ? pB.value : undefined;
      let delta: number | undefined;
      let deltaPercent: number | undefined;

      if (valA !== undefined && valB !== undefined) {
        delta = Number((valB - valA).toFixed(2));
        deltaPercent = valA !== 0 ? Number(((delta / valA) * 100).toFixed(1)) : 0;
      }

      comparisonRows.push({
        name,
        unit: pB?.unit || pA?.unit || '',
        refRange: pB?.referenceRange?.text || pA?.referenceRange?.text || '',
        valueA: valA,
        statusA: pA?.status,
        valueB: valB,
        statusB: pB?.status,
        delta,
        deltaPercent,
      });
    });
  }

  const chartData = comparisonRows
    .filter((r) => r.valueA !== undefined && r.valueB !== undefined)
    .slice(0, 6)
    .map((r) => ({
      name: r.name.split(' ')[0],
      fullName: r.name,
      [reportA?.reportTitle || 'Report A']: r.valueA,
      [reportB?.reportTitle || 'Report B']: r.valueB,
    }));

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('comparePageTitle')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('comparePageSubtitle')}
          </p>
        </div>
      </div>

      {/* Empty States Handling */}
      {reports.length === 0 ? (
        <div className="p-8 sm:p-12 bg-white border border-slate-200 rounded-xl text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mx-auto">
            <GitCompare className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-base font-bold text-slate-900">
              {t('compareNoDataTitle')}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('compareNoDataDesc')}
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4 text-teal-400" />
              <span>{t('actionUploadFirst')}</span>
            </Link>
          </div>
        </div>
      ) : reports.length < 2 ? (
        <div className="p-8 bg-white border border-slate-200 rounded-xl text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-sm font-bold text-slate-900">
              {t('noReportsToCompare')}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('compareOneReportDesc')}
            </p>
          </div>
          <div className="pt-1">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4 text-teal-400" />
              <span>{t('uploadSecondReport')}</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Selectors for Report A and Report B */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Selector A */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {t('reportALabel')}
              </label>
              <select
                value={reportAId}
                onChange={(e) => setReportAId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-800 bg-white"
              >
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.reportTitle} ({r.reportDate}) · {r.labName}
                  </option>
                ))}
              </select>
              {reportA && (
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  {t('reportDateLabel')}: {reportA.reportDate} · {reportA.parameters.length} {t('parametersReadyLabel')}
                </p>
              )}
            </div>

            {/* Selector B */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {t('reportBLabel')}
              </label>
              <select
                value={reportBId}
                onChange={(e) => setReportBId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-800 bg-white"
              >
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.reportTitle} ({r.reportDate}) · {r.labName}
                  </option>
                ))}
              </select>
              {reportB && (
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  {t('reportDateLabel')}: {reportB.reportDate} · {reportB.parameters.length} {t('parametersReadyLabel')}
                </p>
              )}
            </div>
          </div>

          {/* Side-by-side Visual Recharts Chart */}
          {chartData.length > 0 && reportA && reportB && (
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-teal-600" />
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    {t('visualComparisonTitle')}
                  </h3>
                </div>
              </div>

              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }} axisLine={{ stroke: '#e2e8f0' }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-2.5 bg-slate-900 text-white rounded shadow-lg text-xs space-y-1">
                              <p className="font-semibold">{data.fullName}</p>
                              {payload.map((item: any, i: number) => (
                                <p key={i} className="font-mono tabular-nums text-[11px]" style={{ color: item.color }}>
                                  {item.name}: {item.value}
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey={reportA.reportTitle} fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={reportB.reportTitle} fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Comparison Table */}
          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              {language === 'ta' ? 'அளவீட்டு ஒப்பீட்டு மற்றும் மாற்ற அட்டவணை' : 'Parameter Comparison & Trajectory Matrix'}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[11px]">
                    <th className="py-2.5 px-3">{t('colParameter')}</th>
                    <th className="py-2.5 px-3">{t('colReferenceRange')}</th>
                    <th className="py-2.5 px-3 text-right">
                      {t('colReportA')} ({reportA?.reportDate || 'A'})
                    </th>
                    <th className="py-2.5 px-3 text-right">
                      {t('colReportB')} ({reportB?.reportDate || 'B'})
                    </th>
                    <th className="py-2.5 px-3 text-right">{t('colDelta')}</th>
                    <th className="py-2.5 px-3 text-center">{t('colStatusShift')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonRows.map((row) => {
                    const isImproved =
                      (row.statusA === 'abnormal' && (row.statusB === 'borderline' || row.statusB === 'normal')) ||
                      (row.statusA === 'borderline' && row.statusB === 'normal');

                    const isWorsened =
                      (row.statusA === 'normal' && (row.statusB === 'borderline' || row.statusB === 'abnormal')) ||
                      (row.statusA === 'borderline' && row.statusB === 'abnormal');

                    return (
                      <tr key={row.name} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {row.name}
                          <span className="text-[10px] text-slate-400 font-normal block">{row.unit}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{row.refRange}</td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                          {row.valueA !== undefined ? `${row.valueA} ${row.unit}` : '—'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                          {row.valueB !== undefined ? `${row.valueB} ${row.unit}` : '—'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-medium">
                          {row.delta !== undefined ? (
                            <span
                              className={`inline-flex items-center gap-0.5 ${
                                row.delta > 0 ? 'text-amber-700' : row.delta < 0 ? 'text-teal-700' : 'text-slate-500'
                              }`}
                            >
                              {row.delta > 0 ? (
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              ) : row.delta < 0 ? (
                                <ArrowDownRight className="w-3.5 h-3.5" />
                              ) : (
                                <Minus className="w-3 h-3" />
                              )}
                              <span>
                                {row.delta > 0 ? `+${row.delta}` : row.delta} ({row.deltaPercent}%)
                              </span>
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isImproved ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {t('statusImproving')}
                            </span>
                          ) : isWorsened ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                              {t('statusBorderline')}
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                              {t('statusStable')}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
