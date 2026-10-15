export type UserRole = 'patient' | 'doctor' | 'admin';

export type Language = 'en' | 'ta';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  department?: string;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
  status: 'active' | 'pending' | 'suspended';
}

export interface PatientProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  assignedDoctorId?: string;
  assignedDoctorName?: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  specialization: string;
  hospital: string;
  qualification: string;
  licenseNumber: string;
  status: 'approved' | 'pending' | 'inactive';
  experienceYears: number;
  assignedPatientCount: number;
}

export type ParameterStatus = 'normal' | 'borderline' | 'abnormal';

export interface ExtractedParameter {
  id: string;
  name: string;
  category: string;
  value: number;
  unit: string;
  referenceRange: {
    min: number;
    max: number;
    text: string;
  };
  status: ParameterStatus;
  previousValue?: number;
  changePercent?: number;
  interpretation?: string;
  tamilName?: string;
  tamilExplanation?: string;
}

export interface AbnormalityArea {
  area: string;
  category: string;
  severity: string;
  flaggedParameters: string[];
  findingsSummary: string;
  recommendedDoctor: {
    id: string;
    name: string;
    specialization: string;
    hospital: string;
    experienceYears: number;
    reason: string;
  };
}

export interface MedicalReport {
  id: string;
  patientId: string;
  patientName: string;
  reportTitle: string;
  reportType: 'CBC' | 'Blood Glucose' | 'HbA1c' | 'Lipid Profile' | 'Thyroid Profile' | 'Liver Function' | 'Kidney Function' | 'Comprehensive Panel';
  labName: string;
  reportDate: string;
  uploadDate: string;
  status: 'analyzed' | 'processing' | 'flagged';
  fileName: string;
  fileSize: string;
  parameters: ExtractedParameter[];
  aiPatientSummary?: string;
  aiDoctorSummary?: string;
  tamilSummary?: string;
  keyFindings: string[];
  abnormalCount: number;
  borderlineCount: number;
  normalCount: number;
  abnormalityAreas?: AbnormalityArea[];
}

export interface ParameterTrendPoint {
  date: string;
  value: number;
  status: ParameterStatus;
  reportId: string;
  reportTitle: string;
}

export interface ParameterTrend {
  parameterName: string;
  unit: string;
  category: string;
  referenceRange: { min: number; max: number };
  trendDirection: 'improving' | 'stable' | 'increasing' | 'decreasing' | 'insufficient_data';
  currentValue: number;
  previousValue?: number;
  changeRate: number;
  dataPoints: ParameterTrendPoint[];
}

export type RiskSeverity = 'low' | 'moderate' | 'elevated' | 'high';

export interface RiskIndicator {
  id: string;
  patientId: string;
  category: string;
  title: string;
  severity: RiskSeverity;
  probabilityScore?: number; // from scikit-learn classifier
  reason: string;
  contributingDataPoints: string[];
  suggestedAction: string;
  tamilTitle?: string;
  tamilReason?: string;
  tamilSuggestedAction?: string;
  dateGenerated: string;
}

export interface PersonalizedInsight {
  id: string;
  patientId: string;
  type: 'positive' | 'warning' | 'reminder' | 'trend';
  text: string;
  tamilText?: string;
  relatedParameter?: string;
  date: string;
}

export interface DoctorNote {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  clinicalRemarks: string;
  treatmentAdvice: string;
  followUpPlan: string;
}

export interface FollowUpRecommendation {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  testName: string;
  recommendedDate: string;
  urgency: 'routine' | 'priority' | 'urgent';
  reason: string;
  status: 'pending' | 'scheduled' | 'completed';
}

export interface TestReminder {
  id: string;
  patientId: string;
  title: string;
  dueDate: string;
  category: string;
  notes?: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  patientId: string;
  date: string;
  title: string;
  type: 'report' | 'consultation' | 'medication' | 'test' | 'vital';
  description: string;
  badgeText?: string;
  relatedId?: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  tamilTerm: string;
  category: string;
  normalRange: string;
  simpleExplanation: string;
  tamilExplanation: string;
  whyItMatters: string;
}

export interface SystemMetrics {
  totalPatients: number;
  totalDoctors: number;
  reportsUploaded: number;
  reportsAnalyzed: number;
  abnormalReportsCount: number;
  pendingDoctorApprovals: number;
  aiQueriesAnswered: number;
  upcomingReminders: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
}
