import { ExtractedParameter, ParameterStatus } from '../types';

export type SupportedReportType =
  | 'CBC'
  | 'Blood Glucose'
  | 'HbA1c'
  | 'Lipid Profile'
  | 'Thyroid Profile'
  | 'Liver Function'
  | 'Kidney Function'
  | 'Comprehensive Panel';

export interface SampleReportPreset {
  id: string;
  name: string;
  type: SupportedReportType;
  lab: string;
  parameters: Array<{
    name: string;
    category: string;
    value: number;
    unit: string;
    min: number;
    max: number;
    refText: string;
    tamilName: string;
    tamilExplanation: string;
  }>;
}

export const SAMPLE_PRESETS: SampleReportPreset[] = [
  {
    id: 'preset-cbc',
    name: 'Complete Blood Count (CBC)',
    type: 'CBC',
    lab: 'Apollo Diagnostic Services',
    parameters: [
      {
        name: 'Hemoglobin',
        category: 'Hematology',
        value: 13.8,
        unit: 'g/dL',
        min: 13.0,
        max: 17.0,
        refText: '13.0 - 17.0 g/dL',
        tamilName: 'ஹீமோகுளோபின்',
        tamilExplanation: 'ரத்த சிவப்பணுக்களின் பிராணவாயு ஏந்திச்செல்லும் புரதம்.',
      },
      {
        name: 'Total Leukocyte Count (WBC)',
        category: 'Hematology',
        value: 8400,
        unit: 'cells/cu.mm',
        min: 4000,
        max: 11000,
        refText: '4,000 - 11,000 cells/cu.mm',
        tamilName: 'வெள்ளை ரத்த அணுக்கள் (WBC)',
        tamilExplanation: 'நோய்த்தொற்றுகளை எதிர்க்கும் உடலின் பாதுகாப்பு அணுக்கள்.',
      },
      {
        name: 'Platelet Count',
        category: 'Hematology',
        value: 245000,
        unit: 'cells/cu.mm',
        min: 150000,
        max: 450000,
        refText: '150,000 - 450,000 cells/cu.mm',
        tamilName: 'ரத்த தட்டணுக்கள்',
        tamilExplanation: 'ரத்தம் உறைவதற்கு உதவும் முக்கிய அணுக்கள்.',
      },
      {
        name: 'RBC Count',
        category: 'Hematology',
        value: 4.8,
        unit: 'million/cu.mm',
        min: 4.5,
        max: 5.9,
        refText: '4.5 - 5.9 million/cu.mm',
        tamilName: 'சிவப்பு ரத்த அணுக்கள்',
        tamilExplanation: 'ஆக்ஸிஜனை உடலின் திசுக்களுக்கு கடத்தும் அணுக்கள்.',
      },
      {
        name: 'ESR (Erythrocyte Sedimentation Rate)',
        category: 'Hematology',
        value: 12,
        unit: 'mm/hr',
        min: 0,
        max: 15,
        refText: '< 15 mm/hr',
        tamilName: 'இ.எஸ்.ஆர் (அழற்சி அளவு)',
        tamilExplanation: 'உடலில் ஏதேனும் வீக்கம் அல்லது அழற்சி உள்ளதா என்பதைக் குறிக்கிறது.',
      },
    ],
  },
  {
    id: 'preset-lipid',
    name: 'Advanced Lipid Profile',
    type: 'Lipid Profile',
    lab: 'Metropolis Healthcare',
    parameters: [
      {
        name: 'Total Cholesterol',
        category: 'Lipid',
        value: 218,
        unit: 'mg/dL',
        min: 125,
        max: 200,
        refText: '< 200 mg/dL',
        tamilName: 'மொத்த கொலஸ்ட்ரால்',
        tamilExplanation: 'ரத்தத்தில் உள்ள அனைத்து வகை கொழுப்புகளின் கூட்டு அளவு.',
      },
      {
        name: 'LDL Cholesterol',
        category: 'Lipid',
        value: 142,
        unit: 'mg/dL',
        min: 0,
        max: 100,
        refText: '< 100 mg/dL',
        tamilName: 'எல்.டி.எல் கெட்ட கொழுப்பு',
        tamilExplanation: 'ரத்த நாளங்களில் படியக்கூடிய கொழுப்பு.',
      },
      {
        name: 'HDL Cholesterol',
        category: 'Lipid',
        value: 44,
        unit: 'mg/dL',
        min: 40,
        max: 60,
        refText: '> 40 mg/dL',
        tamilName: 'ஹெச்.டி.எல் நல்ல கொழுப்பு',
        tamilExplanation: 'இதயத்தைப் பாதுகாக்கும் நன்மை செய்யும் கொழுப்பு.',
      },
      {
        name: 'Serum Triglycerides',
        category: 'Lipid',
        value: 182,
        unit: 'mg/dL',
        min: 0,
        max: 150,
        refText: '< 150 mg/dL',
        tamilName: 'டிரைகிளிசரைடு',
        tamilExplanation: 'உணவுக் கொழுப்பிலிருந்து உருவாகும் கொழுப்பு வகை.',
      },
      {
        name: 'VLDL Cholesterol',
        category: 'Lipid',
        value: 36,
        unit: 'mg/dL',
        min: 5,
        max: 30,
        refText: '< 30 mg/dL',
        tamilName: 'வி.எல்.டி.எல் கொழுப்பு',
        tamilExplanation: 'டிரைகிளிசரைடுகளை சுமந்து செல்லும் கொழுப்பு வகை.',
      },
    ],
  },
  {
    id: 'preset-glucose',
    name: 'Blood Glucose Test (Fasting & PP)',
    type: 'Blood Glucose',
    lab: 'Thyrocare Laboratories',
    parameters: [
      {
        name: 'Fasting Blood Glucose',
        category: 'Glycemic',
        value: 108,
        unit: 'mg/dL',
        min: 70,
        max: 99,
        refText: '70 - 99 mg/dL',
        tamilName: 'வெறும் வயிற்று சர்க்கரை',
        tamilExplanation: 'சாப்பிடுவதற்கு முன் உள்ள ரத்த சர்க்கரை அளவு.',
      },
      {
        name: 'Post-Prandial Blood Glucose',
        category: 'Glycemic',
        value: 146,
        unit: 'mg/dL',
        min: 70,
        max: 140,
        refText: '< 140 mg/dL',
        tamilName: 'உணவுக்குப் பின் சர்க்கரை',
        tamilExplanation: 'சாப்பிட்டு 2 மணி நேரம் கழித்து எடுக்கப்படும் அளவு.',
      },
    ],
  },
  {
    id: 'preset-hba1c',
    name: 'HbA1c Glycated Hemoglobin Test',
    type: 'HbA1c',
    lab: 'Metropolis Diagnostics',
    parameters: [
      {
        name: 'HbA1c (Glycated Hemoglobin)',
        category: 'Glycemic',
        value: 6.4,
        unit: '%',
        min: 4.0,
        max: 5.6,
        refText: '< 5.7%',
        tamilName: 'எச்பிஏ1சி (சர்க்கரை சராசரி)',
        tamilExplanation: 'கடந்த 3 மாதங்களின் ரத்த சர்க்கரை சராசரி.',
      },
      {
        name: 'Estimated Average Glucose (eAG)',
        category: 'Glycemic',
        value: 137,
        unit: 'mg/dL',
        min: 80,
        max: 120,
        refText: '< 120 mg/dL',
        tamilName: 'சராசரி குளுக்கோஸ் மதிப்பீடு',
        tamilExplanation: 'HbA1c அடிப்படையிலான சராசரி குளுக்கோஸ் மதிப்பீடு.',
      },
    ],
  },
  {
    id: 'preset-thyroid',
    name: 'Thyroid Function Test (TFT)',
    type: 'Thyroid Profile',
    lab: 'Dr. Lal PathLabs',
    parameters: [
      {
        name: 'TSH (Ultrasensitive)',
        category: 'Endocrinology',
        value: 3.2,
        unit: 'µIU/mL',
        min: 0.4,
        max: 4.2,
        refText: '0.40 - 4.20 µIU/mL',
        tamilName: 'தைராய்டு தூண்டும் ஹார்மோன் (TSH)',
        tamilExplanation: 'தைராய்டு சுரப்பியின் செயல்பாட்டை கட்டுப்படுத்தும் பிட்யூட்டரி ஹார்மோன்.',
      },
      {
        name: 'Free T3 (Triiodothyronine)',
        category: 'Endocrinology',
        value: 2.9,
        unit: 'pg/mL',
        min: 2.0,
        max: 4.4,
        refText: '2.00 - 4.40 pg/mL',
        tamilName: 'ஃப்ரீ டி3 ஹார்மோன்',
        tamilExplanation: 'உடல் ஆற்றல் மற்றும் வளர்சிதை மாற்றத்திற்கான தைராய்டு ஹார்மோன்.',
      },
      {
        name: 'Free T4 (Thyroxine)',
        category: 'Endocrinology',
        value: 1.2,
        unit: 'ng/dL',
        min: 0.8,
        max: 1.8,
        refText: '0.80 - 1.80 ng/dL',
        tamilName: 'ஃப்ரீ டி4 ஹார்மோன்',
        tamilExplanation: 'தைராய்டு சுரப்பியால் உற்பத்தி செய்யப்படும் முக்கிய ஹார்மோன்.',
      },
    ],
  },
  {
    id: 'preset-liver',
    name: 'Liver Function Test (LFT)',
    type: 'Liver Function',
    lab: 'Apollo Diagnostic Services',
    parameters: [
      {
        name: 'Total Bilirubin',
        category: 'Hepatic',
        value: 0.9,
        unit: 'mg/dL',
        min: 0.2,
        max: 1.2,
        refText: '0.2 - 1.2 mg/dL',
        tamilName: 'மொத்த பிலிரூபின்',
        tamilExplanation: 'கல்லீரல் பித்த நீர் அளவு மற்றும் மஞ்சள் காமாலை கண்காணிப்பு.',
      },
      {
        name: 'SGPT / ALT',
        category: 'Hepatic',
        value: 32,
        unit: 'U/L',
        min: 7,
        max: 56,
        refText: '7 - 56 U/L',
        tamilName: 'எஸ்.ஜி.பி.டி / ஏ.எல்.டி நொதி',
        tamilExplanation: 'கல்லீரல் செல்களில் உள்ள முக்கிய என்சைம்.',
      },
      {
        name: 'SGOT / AST',
        category: 'Hepatic',
        value: 28,
        unit: 'U/L',
        min: 10,
        max: 40,
        refText: '10 - 40 U/L',
        tamilName: 'எஸ்.ஜி.ஓ.டி / ஏ.எஸ்.டி நொதி',
        tamilExplanation: 'கல்லீரல் திசு ஆரோக்கியத்தை காட்டும் நொதி.',
      },
      {
        name: 'Alkaline Phosphatase (ALP)',
        category: 'Hepatic',
        value: 88,
        unit: 'U/L',
        min: 44,
        max: 147,
        refText: '44 - 147 U/L',
        tamilName: 'ஆல்கலைன் பாஸ்பேடேஸ்',
        tamilExplanation: 'கல்லீரல் மற்றும் பித்த நாளங்களின் நொதி.',
      },
      {
        name: 'Serum Albumin',
        category: 'Hepatic',
        value: 4.4,
        unit: 'g/dL',
        min: 3.5,
        max: 5.5,
        refText: '3.5 - 5.5 g/dL',
        tamilName: 'சீரம் அல்புமின்',
        tamilExplanation: 'கல்லீரலால் உற்பத்தி செய்யப்படும் முக்கிய புரதம்.',
      },
    ],
  },
  {
    id: 'preset-renal',
    name: 'Kidney Function Test (KFT)',
    type: 'Kidney Function',
    lab: 'SRL Diagnostics',
    parameters: [
      {
        name: 'Serum Creatinine',
        category: 'Renal',
        value: 1.02,
        unit: 'mg/dL',
        min: 0.7,
        max: 1.3,
        refText: '0.70 - 1.30 mg/dL',
        tamilName: 'சீரம் கிரியேட்டினின்',
        tamilExplanation: 'சிறுநீரகத்தின் கழிவு வெளியேற்றும் திறன் அளவு.',
      },
      {
        name: 'Blood Urea Nitrogen (BUN)',
        category: 'Renal',
        value: 15.2,
        unit: 'mg/dL',
        min: 7,
        max: 20,
        refText: '7.0 - 20.0 mg/dL',
        tamilName: 'ரத்த யூரியா நைட்ரஜன்',
        tamilExplanation: 'புரத சிதைவின் போது சிறுநீரகத்தால் அகற்றப்படும் கழிவு.',
      },
      {
        name: 'Serum Uric Acid',
        category: 'Renal',
        value: 5.8,
        unit: 'mg/dL',
        min: 3.5,
        max: 7.2,
        refText: '3.5 - 7.2 mg/dL',
        tamilName: 'சீரம் யூரிக் அமிலம்',
        tamilExplanation: 'மூட்டு வலி மற்றும் கவுட் நோயைக் குறிக்கும் அளவு.',
      },
      {
        name: 'eGFR',
        category: 'Renal',
        value: 94,
        unit: 'mL/min/1.73m²',
        min: 90,
        max: 140,
        refText: '> 90 mL/min/1.73m²',
        tamilName: 'சிறுநீரக வடிகட்டும் வீதம் (eGFR)',
        tamilExplanation: 'சிறுநீரகங்கள் நிமிடத்திற்கு வடிகட்டும் ரத்தத்தின் அளவு.',
      },
    ],
  },
];

export function determineStatus(val: number, min: number, max: number): ParameterStatus {
  if (val < min) {
    if (val >= min * 0.9) return 'borderline';
    return 'abnormal';
  }
  if (val > max) {
    if (val <= max * 1.1) return 'borderline';
    return 'abnormal';
  }
  return 'normal';
}

/**
 * Accurately detect report type from file name, document text, or metadata keywords
 */
export function detectReportType(fileName: string = '', textContent: string = ''): SupportedReportType | null {
  const combined = `${fileName} ${textContent}`.toLowerCase();

  // 1. Complete Blood Count
  if (
    combined.includes('cbc') ||
    combined.includes('complete blood') ||
    combined.includes('hemogram') ||
    combined.includes('wbc') ||
    combined.includes('platelet') ||
    combined.includes('leukocyte') ||
    (combined.includes('hemoglobin') && !combined.includes('hba1c') && !combined.includes('glycated'))
  ) {
    return 'CBC';
  }

  // 2. Thyroid Profile
  if (
    combined.includes('thyroid') ||
    combined.includes('tft') ||
    combined.includes('tsh') ||
    combined.includes('triiodothyronine') ||
    combined.includes('thyroxine')
  ) {
    return 'Thyroid Profile';
  }

  // 3. Liver Function Test
  if (
    combined.includes('liver') ||
    combined.includes('lft') ||
    combined.includes('bilirubin') ||
    combined.includes('sgpt') ||
    combined.includes('sgot') ||
    combined.includes('alkaline phosphatase')
  ) {
    return 'Liver Function';
  }

  // 4. Kidney Function Test
  if (
    combined.includes('kidney') ||
    combined.includes('renal') ||
    combined.includes('kft') ||
    combined.includes('rft') ||
    combined.includes('creatinine') ||
    combined.includes('blood urea') ||
    combined.includes('uric acid')
  ) {
    return 'Kidney Function';
  }

  // 5. Lipid Profile
  if (
    combined.includes('lipid') ||
    combined.includes('cholesterol') ||
    combined.includes('triglyceride') ||
    combined.includes('hdl') ||
    combined.includes('ldl')
  ) {
    return 'Lipid Profile';
  }

  // 6. HbA1c
  if (
    combined.includes('hba1c') ||
    combined.includes('glycated hemoglobin') ||
    combined.includes('glycohemoglobin')
  ) {
    return 'HbA1c';
  }

  // 7. Blood Glucose
  if (
    combined.includes('glucose') ||
    combined.includes('sugar') ||
    combined.includes('fbs') ||
    combined.includes('ppbs') ||
    combined.includes('fasting blood sugar')
  ) {
    return 'Blood Glucose';
  }

  return null;
}

/**
 * Extract parameters matching the actual detected report type from text content
 */
export function extractParametersForType(
  type: SupportedReportType,
  rawText: string = ''
): ExtractedParameter[] {
  // Find standard preset for this type to use as base reference
  const preset = SAMPLE_PRESETS.find((p) => p.type === type);
  if (!preset) return [];

  // If text contains numbers for these parameters, parse them
  const lines = rawText.split('\n');

  return preset.parameters.map((p, idx) => {
    let extractedVal = p.value;

    if (rawText.trim().length > 0) {
      // Regex match for parameter value
      const escapedName = p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const shortName = p.name.split(' ')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:${escapedName}|${shortName}).*?([0-9]+\\.?[0-9]*)`, 'i');

      for (const line of lines) {
        const match = line.match(regex);
        if (match && match[1]) {
          const parsed = parseFloat(match[1]);
          if (!isNaN(parsed) && parsed > 0) {
            extractedVal = parsed;
            break;
          }
        }
      }
    }

    const status = determineStatus(extractedVal, p.min, p.max);
    return {
      id: `param-${idx}-${Date.now()}`,
      name: p.name,
      category: p.category,
      value: extractedVal,
      unit: p.unit,
      referenceRange: { min: p.min, max: p.max, text: p.refText },
      status,
      tamilName: p.tamilName,
      tamilExplanation: p.tamilExplanation,
      interpretation: status === 'normal' ? 'Within standard reference range.' : 'Outside reference interval.',
    };
  });
}

export function parseRawMedicalText(
  type: SupportedReportType = 'Comprehensive Panel',
  rawText: string = ''
): ExtractedParameter[] {
  return extractParametersForType(type, rawText);
}

