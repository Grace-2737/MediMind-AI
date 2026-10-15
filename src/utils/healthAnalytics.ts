import { MedicalReport, ParameterTrend, RiskIndicator, PersonalizedInsight, ExtractedParameter } from '../types';

export function computeParameterTrends(reports: MedicalReport[]): ParameterTrend[] {
  if (!reports || reports.length === 0) return [];

  // Sort reports ascending by date
  const sortedReports = [...reports].sort(
    (a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime()
  );

  // Map to gather parameter data points
  const paramMap = new Map<string, {
    name: string;
    category: string;
    unit: string;
    refMin: number;
    refMax: number;
    points: Array<{ date: string; value: number; status: any; reportId: string; reportTitle: string }>;
  }>();

  sortedReports.forEach((rep) => {
    rep.parameters.forEach((param) => {
      const key = param.name.toLowerCase().trim();
      if (!paramMap.has(key)) {
        paramMap.set(key, {
          name: param.name,
          category: param.category,
          unit: param.unit,
          refMin: param.referenceRange?.min ?? 0,
          refMax: param.referenceRange?.max ?? 100,
          points: [],
        });
      }
      const item = paramMap.get(key)!;
      item.points.push({
        date: rep.reportDate,
        value: param.value,
        status: param.status,
        reportId: rep.id,
        reportTitle: rep.reportTitle,
      });
    });
  });

  const trends: ParameterTrend[] = [];

  paramMap.forEach((entry) => {
    if (entry.points.length === 0) return;

    const points = entry.points;
    const current = points[points.length - 1];
    const previous = points.length > 1 ? points[points.length - 2] : undefined;

    let trendDirection: 'improving' | 'stable' | 'increasing' | 'decreasing' | 'insufficient_data' = 'insufficient_data';
    let changeRate = 0;

    if (previous && points.length >= 2) {
      const delta = current.value - previous.value;
      const pct = previous.value !== 0 ? (delta / previous.value) * 100 : 0;
      changeRate = Number(pct.toFixed(1));

      const isLowerBetter =
        entry.name.toLowerCase().includes('cholesterol') ||
        entry.name.toLowerCase().includes('ldl') ||
        entry.name.toLowerCase().includes('triglyceride') ||
        entry.name.toLowerCase().includes('glucose') ||
        entry.name.toLowerCase().includes('hba1c') ||
        entry.name.toLowerCase().includes('creatinine') ||
        entry.name.toLowerCase().includes('pressure') ||
        entry.name.toLowerCase().includes('esr');

      const isHigherBetter =
        entry.name.toLowerCase().includes('hdl') ||
        entry.name.toLowerCase().includes('hemoglobin') ||
        entry.name.toLowerCase().includes('egfr');

      if (Math.abs(changeRate) < 1.0) {
        trendDirection = 'stable';
      } else if (isLowerBetter) {
        trendDirection = delta < 0 ? 'improving' : 'increasing';
      } else if (isHigherBetter) {
        trendDirection = delta > 0 ? 'improving' : 'decreasing';
      } else {
        trendDirection = delta > 0 ? 'increasing' : 'decreasing';
      }
    }

    trends.push({
      parameterName: entry.name,
      unit: entry.unit,
      category: entry.category,
      referenceRange: { min: entry.refMin, max: entry.refMax },
      trendDirection,
      currentValue: current.value,
      previousValue: previous?.value,
      changeRate,
      dataPoints: points,
    });
  });

  return trends;
}

export function computeRiskIndicatorsFromReports(reports: MedicalReport[], patientId: string): RiskIndicator[] {
  if (!reports || reports.length === 0) return [];

  const latest = [...reports].sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime())[0];
  const indicators: RiskIndicator[] = [];

  const hba1cParam = latest.parameters.find((p) => p.name.toLowerCase().includes('hba1c'));
  const glucoseParam = latest.parameters.find((p) => p.name.toLowerCase().includes('glucose'));

  if ((hba1cParam && hba1cParam.value > 5.6) || (glucoseParam && glucoseParam.value > 99)) {
    const val = hba1cParam ? `${hba1cParam.value}%` : `${glucoseParam?.value} mg/dL`;
    indicators.push({
      id: `risk-glycemic-${Date.now()}`,
      patientId,
      category: 'Glycemic Regulation',
      title: 'Elevated Glycemic Attention Indicator',
      severity: (hba1cParam && hba1cParam.value >= 6.5) || (glucoseParam && glucoseParam.value >= 126) ? 'elevated' : 'moderate',
      reason: `Recorded glycemic parameter (${hba1cParam?.name || glucoseParam?.name}: ${val}) is above the clinical reference target.`,
      contributingDataPoints: [
        `${hba1cParam ? `HbA1c measured at ${hba1cParam.value}%` : `Glucose at ${glucoseParam?.value} mg/dL`}`,
        `Report: ${latest.reportTitle} (${latest.reportDate})`,
      ],
      suggestedAction: 'Discuss glycemic parameters with your attending healthcare professional. Review carbohydrate nutrition.',
      tamilTitle: 'ரத்த சர்க்கரை அதிகரிப்பு எச்சரிக்கை',
      tamilReason: `உங்கள் சர்க்கரை அளவு (${val}) மருத்துவ பரிந்துரை வரம்பை விட அதிகமாக உள்ளது.`,
      tamilSuggestedAction: 'மருத்துவரிடம் சர்க்கரை அளவு குறித்து ஆலோசித்து உணவு கட்டுப்பாடு மற்றும் உடற்பயிற்சியை தொடரவும்.',
      dateGenerated: latest.reportDate,
    });
  }

  const cholParam = latest.parameters.find((p) => p.name.toLowerCase().includes('total cholesterol') || (p.name.toLowerCase().includes('cholesterol') && !p.name.toLowerCase().includes('hdl') && !p.name.toLowerCase().includes('ldl')));
  const ldlParam = latest.parameters.find((p) => p.name.toLowerCase().includes('ldl'));
  const trigParam = latest.parameters.find((p) => p.name.toLowerCase().includes('triglyceride'));

  if ((cholParam && cholParam.value > 200) || (ldlParam && ldlParam.value > 100) || (trigParam && trigParam.value > 150)) {
    const factors: string[] = [];
    if (cholParam && cholParam.value > 200) factors.push(`Total Cholesterol: ${cholParam.value} mg/dL (Ref < 200)`);
    if (ldlParam && ldlParam.value > 100) factors.push(`LDL: ${ldlParam.value} mg/dL (Ref < 100)`);
    if (trigParam && trigParam.value > 150) factors.push(`Triglycerides: ${trigParam.value} mg/dL (Ref < 150)`);

    indicators.push({
      id: `risk-lipid-${Date.now()}`,
      patientId,
      category: 'Cardiovascular / Lipid',
      title: 'Lipid Profile Attention Indicator',
      severity: (ldlParam && ldlParam.value >= 140) || (cholParam && cholParam.value >= 240) ? 'elevated' : 'moderate',
      reason: 'Extracted lipid markers reflect values above optimal cardiovascular reference boundaries.',
      contributingDataPoints: factors,
      suggestedAction: 'Maintain aerobic activity (150 mins/week), reduce saturated trans-fats, and correlate with clinical lipid guidance.',
      tamilTitle: 'கொழுப்பு அளவு கண்காணிப்பு குறியீடு',
      tamilReason: 'கொழுப்பு அளவுகள் (கொலஸ்ட்ரால் / எல்.டி.எல்) பரிந்துரைக்கப்பட்ட அளவை விட அதிகமாக உள்ளன.',
      tamilSuggestedAction: 'தினசரி உடற்பயிற்சி மற்றும் ஆரோக்கியமான உணவு முறையை கடைப்பிடிக்கவும்.',
      dateGenerated: latest.reportDate,
    });
  }

  const creatParam = latest.parameters.find((p) => p.name.toLowerCase().includes('creatinine'));
  if (creatParam && creatParam.value > 1.3) {
    indicators.push({
      id: `risk-renal-${Date.now()}`,
      patientId,
      category: 'Renal Function',
      title: 'Renal Clearance Attention Indicator',
      severity: 'elevated',
      reason: `Serum creatinine (${creatParam.value} mg/dL) exceeds normal reference upper boundary (1.3 mg/dL).`,
      contributingDataPoints: [`Serum Creatinine: ${creatParam.value} mg/dL`, `Report: ${latest.reportTitle}`],
      suggestedAction: 'Ensure adequate hydration and consult your physician regarding kidney function markers.',
      tamilTitle: 'சிறுநீரக செயல்பாடு எச்சரிக்கை',
      tamilReason: `சீரம் கிரியேட்டினின் (${creatParam.value} mg/dL) இயல்பு வரம்பை விட அதிகமாக உள்ளது.`,
      tamilSuggestedAction: 'போதுமான அளவு தண்ணீர் அருந்தவும் மற்றும் மருத்துவரிடம் ஆலோசிக்கவும்.',
      dateGenerated: latest.reportDate,
    });
  }

  const tshParam = latest.parameters.find((p) => p.name.toLowerCase().includes('tsh'));
  if (tshParam && (tshParam.value > 4.2 || tshParam.value < 0.4)) {
    indicators.push({
      id: `risk-thyroid-${Date.now()}`,
      patientId,
      category: 'Thyroid Function',
      title: 'Thyroid Hormone Variation Indicator',
      severity: 'moderate',
      reason: `TSH level (${tshParam.value} µIU/mL) is outside the expected standard interval (0.4 - 4.2 µIU/mL).`,
      contributingDataPoints: [`TSH: ${tshParam.value} µIU/mL`],
      suggestedAction: 'Correlate with Free T3 / Free T4 measurements and review with an endocrinologist.',
      tamilTitle: 'தைராய்டு ஹார்மோன் மாறுபாடு குறியீடு',
      tamilReason: `TSH அளவு (${tshParam.value} µIU/mL) இயல்பு வரம்பிற்கு வெளியே உள்ளது.`,
      tamilSuggestedAction: 'தைராய்டு மருத்துவரிடம் பரிசீலிக்கவும்.',
      dateGenerated: latest.reportDate,
    });
  }

  return indicators;
}

export function computeInsightsFromReports(reports: MedicalReport[], patientId: string): PersonalizedInsight[] {
  if (!reports || reports.length === 0) return [];

  const sorted = [...reports].sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
  const latest = sorted[0];
  const previous = sorted.length > 1 ? sorted[1] : null;

  const insights: PersonalizedInsight[] = [];

  const abnormalParams = latest.parameters.filter((p) => p.status === 'abnormal');
  if (abnormalParams.length > 0) {
    insights.push({
      id: `ins-abn-${Date.now()}`,
      patientId,
      type: 'warning',
      text: `Your latest report (${latest.reportTitle}) contains ${abnormalParams.length} parameter(s) outside reference ranges: ${abnormalParams.map((p) => p.name).join(', ')}.`,
      tamilText: `உங்கள் சமீபத்திய அறிக்கையில் (${latest.reportTitle}) ${abnormalParams.length} அளவுகள் இயல்பு வரம்பிற்கு வெளியே உள்ளன.`,
      date: latest.reportDate,
    });
  }

  if (previous) {
    // Compare parameters between latest and previous
    latest.parameters.forEach((param) => {
      const prevParam = previous.parameters.find((p) => p.name.toLowerCase() === param.name.toLowerCase());
      if (prevParam) {
        const delta = param.value - prevParam.value;
        if (Math.abs(delta) > 0.1) {
          const isLowerBetter =
            param.name.toLowerCase().includes('cholesterol') ||
            param.name.toLowerCase().includes('glucose') ||
            param.name.toLowerCase().includes('hba1c') ||
            param.name.toLowerCase().includes('triglyceride');

          const isFavorable = isLowerBetter ? delta < 0 : delta > 0;
          insights.push({
            id: `ins-cmp-${param.name}-${Date.now()}`,
            patientId,
            type: isFavorable ? 'positive' : 'warning',
            text: `Your ${param.name} changed by ${delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)} ${param.unit} compared to your ${previous.reportDate} test.`,
            tamilText: `உங்கள் ${param.name} முந்தைய ${previous.reportDate} தேதியுடன் ஒப்பிடுகையில் ${delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)} ${param.unit} மாறியுள்ளது.`,
            relatedParameter: param.name,
            date: latest.reportDate,
          });
        }
      }
    });
  } else {
    insights.push({
      id: `ins-base-${Date.now()}`,
      patientId,
      type: 'positive',
      text: `Baseline health parameters established from ${latest.reportTitle} (${latest.reportDate}). Upload future reports to track longitudinal changes over time.`,
      tamilText: `உங்கள் ஆரம்ப சுகாதார அளவுகள் பதிவு செய்யப்பட்டுள்ளன. காலப்போக்கில் மாற்றங்களை கண்காணிக்க தொடர்ச்சியான அறிக்கைகளை பதிவேற்றவும்.`,
      date: latest.reportDate,
    });
  }

  return insights;
}
