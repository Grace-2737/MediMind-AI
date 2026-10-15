import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { ParameterTrend } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface TrendChartProps {
  trend: ParameterTrend;
  height?: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({ trend, height = 240 }) => {
  const { t } = useLanguage();

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'improving':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'increasing':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'decreasing':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'stable':
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  const getTrendLabel = (direction: string) => {
    switch (direction) {
      case 'improving':
        return t('statusImproving');
      case 'increasing':
        return t('statusIncreasing');
      case 'decreasing':
        return t('statusDecreasing');
      case 'stable':
      default:
        return t('statusStable');
    }
  };

  const chartData = trend.dataPoints.map((dp) => ({
    date: new Date(dp.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    value: dp.value,
    status: dp.status,
    title: dp.reportTitle,
  }));

  const yValues = trend.dataPoints.map((d) => d.value);
  const minY = Math.floor(Math.min(...yValues, trend.referenceRange.min) * 0.9);
  const maxY = Math.ceil(Math.max(...yValues, trend.referenceRange.max) * 1.1);

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[11px] font-medium text-slate-400 block tracking-wider uppercase">
            {trend.category}
          </span>
          <h4 className="text-sm font-semibold text-slate-900">{trend.parameterName}</h4>
        </div>
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded border whitespace-nowrap ${getTrendColor(
            trend.trendDirection
          )}`}
        >
          {getTrendLabel(trend.trendDirection)}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="flex items-baseline justify-between border-b border-slate-100 pb-2 text-xs">
        <div>
          <span className="text-xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {trend.currentValue}
          </span>
          <span className="ml-1 text-slate-500">{trend.unit}</span>
        </div>
        <div className="text-right text-slate-500 text-[11px]">
          <span>{t('colReferenceRange')}: </span>
          <span className="font-mono tabular-nums font-medium text-slate-700">
            {trend.referenceRange.min} - {trend.referenceRange.max} {trend.unit}
          </span>
        </div>
      </div>

      {/* Recharts LineChart */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              domain={[minY, maxY]}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="p-2.5 bg-slate-900 text-white rounded shadow-lg text-xs space-y-1">
                      <p className="font-semibold">{data.title || data.date}</p>
                      <p className="font-mono tabular-nums text-teal-300">
                        {t('colExtractedValue')}: {data.value} {trend.unit}
                      </p>
                      <p className="text-[10px] text-slate-400">{t('colStatus')}: {data.status}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Reference upper bound */}
            <ReferenceLine
              y={trend.referenceRange.max}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{
                value: `Max ${trend.referenceRange.max}`,
                position: 'right',
                fill: '#ef4444',
                fontSize: 9,
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#0f766e"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#0f766e', strokeWidth: 1, stroke: '#ffffff' }}
              activeDot={{ r: 6, fill: '#0d9488' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
