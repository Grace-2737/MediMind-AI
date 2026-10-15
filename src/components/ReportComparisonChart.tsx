import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';
import { ExtractedParameter } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { BarChart3, Layers, TrendingUp } from 'lucide-react';

interface ReportComparisonChartProps {
  parameters: ExtractedParameter[];
  comparisonParameters?: ExtractedParameter[];
  reportTitle?: string;
  comparisonReportTitle?: string;
}

export const ReportComparisonChart: React.FC<ReportComparisonChartProps> = ({
  parameters,
  comparisonParameters,
  reportTitle = 'Current Report',
  comparisonReportTitle = 'Previous Report',
}) => {
  const { language } = useLanguage();
  const isTa = language === 'ta';
  const [activeTab, setActiveTab] = useState<'comparison' | 'category' | 'range'>('comparison');

  if (!parameters || parameters.length === 0) return null;

  // Prepare data comparing Current vs Previous (if available) or Current vs Normal Bounds
  const compMap = new Map<string, ExtractedParameter>();
  if (comparisonParameters) {
    comparisonParameters.forEach((p) => compMap.set(p.name, p));
  }

  const comparisonData = parameters.map((p) => {
    const prev = compMap.get(p.name);
    const prevVal = prev ? prev.value : p.previousValue !== undefined ? p.previousValue : undefined;
    const shortName = p.name.length > 18 ? p.name.substring(0, 16) + '...' : p.name;

    return {
      name: shortName,
      fullName: p.name,
      category: p.category,
      unit: p.unit,
      currentValue: p.value,
      previousValue: prevVal,
      minRef: p.referenceRange.min,
      maxRef: p.referenceRange.max,
      status: p.status,
      refText: p.referenceRange.text,
    };
  });

  // Category counts
  const categorySummary: Record<string, { total: number; normal: number; abnormal: number }> = {};
  parameters.forEach((p) => {
    const cat = p.category || 'General';
    if (!categorySummary[cat]) {
      categorySummary[cat] = { total: 0, normal: 0, abnormal: 0 };
    }
    categorySummary[cat].total++;
    if (p.status === 'abnormal' || p.status === 'borderline') {
      categorySummary[cat].abnormal++;
    } else {
      categorySummary[cat].normal++;
    }
  });

  const categoryData = Object.keys(categorySummary).map((cat) => ({
    category: cat,
    normal: categorySummary[cat].normal,
    abnormal: categorySummary[cat].abnormal,
    total: categorySummary[cat].total,
  }));

  const hasHistoricalValues = comparisonData.some((d) => d.previousValue !== undefined);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isTa ? 'ஆய்வக அளவீடுகள் பகுப்பாய்வு வரைபடம்' : 'Laboratory Parameter Comparison & Range Graphs'}
            </h3>
            <p className="text-xs text-slate-500">
              {isTa
                ? 'அளவீடுகளின் மருத்துவ ஒப்பீடு மற்றும் குறிப்பு வரம்புகளின் பார்வை'
                : 'Interactive clinical visualization of measured values and reference bounds'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
              activeTab === 'comparison'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
            <span>{hasHistoricalValues ? (isTa ? 'வரலாற்று ஒப்பீடு' : 'Delta Comparison') : (isTa ? 'அளவீடு பார்வை' : 'Measured Values')}</span>
          </button>
          <button
            onClick={() => setActiveTab('category')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
              activeTab === 'category'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>{isTa ? 'உறுப்பு அமைப்புகள்' : 'Category Distribution'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'comparison' && (
        <div className="space-y-4">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{ top: 15, right: 20, left: 0, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={-15}
                  textAnchor="end"
                  height={45}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg text-xs space-y-1 shadow-lg max-w-xs">
                          <p className="font-bold text-white border-b border-slate-700 pb-1">
                            {data.fullName} ({data.category})
                          </p>
                          <p className="text-teal-300 font-mono">
                            {reportTitle}: <span className="font-bold">{data.currentValue} {data.unit}</span>
                          </p>
                          {data.previousValue !== undefined && (
                            <p className="text-slate-300 font-mono">
                              {comparisonReportTitle}: {data.previousValue} {data.unit}
                            </p>
                          )}
                          <p className="text-slate-400 text-[11px] pt-1">
                            Standard Range: {data.refText}
                          </p>
                          <div className="pt-1">
                            <span
                              className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                data.status === 'abnormal'
                                  ? 'bg-rose-500 text-white'
                                  : data.status === 'borderline'
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-emerald-500 text-white'
                              }`}
                            >
                              {data.status}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
                <Bar
                  name={`${reportTitle} (Current)`}
                  dataKey="currentValue"
                  radius={[4, 4, 0, 0]}
                >
                  {comparisonData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.status === 'abnormal'
                          ? '#e11d48'
                          : entry.status === 'borderline'
                          ? '#d97706'
                          : '#0d9488'
                      }
                    />
                  ))}
                </Bar>
                {hasHistoricalValues && (
                  <Bar
                    name={`${comparisonReportTitle} (Baseline)`}
                    dataKey="previousValue"
                    fill="#94a3b8"
                    radius={[4, 4, 0, 0]}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
                <span>{isTa ? 'இயல்பு வரம்பு' : 'Normal Reference Range'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-600 inline-block" />
                <span>{isTa ? 'எல்லை நிலை' : 'Borderline Flag'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-600 inline-block" />
                <span>{isTa ? 'அசாதாரண அளவு' : 'Abnormal Cutoff'}</span>
              </span>
            </div>
            {hasHistoricalValues && (
              <span className="font-mono text-[11px] text-slate-400">
                Grey bar indicates prior historical comparison
              </span>
            )}
          </div>
        </div>
      )}

      {activeTab === 'category' && (
        <div className="space-y-4">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                <Tooltip
                  formatter={(val, name) => [
                    `${val} parameter(s)`,
                    name === 'normal' ? 'Normal In-Range' : 'Abnormal Flagged',
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="normal" name="Normal In-Range" stackId="a" fill="#0d9488" radius={[0, 0, 0, 0]} />
                <Bar dataKey="abnormal" name="Abnormal / Borderline" stackId="a" fill="#e11d48" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
            {categoryData.map((c) => (
              <div key={c.category} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-700 block truncate">{c.category}</span>
                <div className="flex items-center justify-between text-[11px] mt-1 font-mono">
                  <span className="text-emerald-700">{c.normal} Normal</span>
                  <span className={c.abnormal > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                    {c.abnormal} Flagged
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
