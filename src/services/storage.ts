import {
  User,
  PatientProfile,
  DoctorProfile,
  MedicalReport,
  RiskIndicator,
  PersonalizedInsight,
  DoctorNote,
  FollowUpRecommendation,
  TestReminder,
  TimelineEvent,
  GlossaryTerm,
  SystemMetrics,
  AuditLog,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_REPORTS,
  INITIAL_RISK_INDICATORS,
  INITIAL_INSIGHTS,
  INITIAL_REMINDERS,
  INITIAL_TIMELINE_EVENTS,
  INITIAL_DOCTOR_NOTES,
  INITIAL_FOLLOW_UPS,
  INITIAL_GLOSSARY,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';

const STORAGE_KEYS = {
  USERS: 'medimind_users',
  PATIENTS: 'medimind_patients',
  DOCTORS: 'medimind_doctors',
  REPORTS: 'medimind_reports',
  RISK_INDICATORS: 'medimind_risk_indicators',
  INSIGHTS: 'medimind_insights',
  REMINDERS: 'medimind_reminders',
  TIMELINE: 'medimind_timeline',
  DOCTOR_NOTES: 'medimind_doctor_notes',
  FOLLOW_UPS: 'medimind_follow_ups',
  GLOSSARY: 'medimind_glossary',
  METRICS: 'medimind_metrics',
  AUDIT_LOGS: 'medimind_audit_logs',
  CURRENT_USER_ID: 'medimind_current_user_id',
  LANGUAGE: 'medimind_language',
};

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export const StorageService = {
  // Current user session
  getCurrentUserId(): string | null {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  setCurrentUserId(id: string | null): void {
    if (!id) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    } else {
      saveToStorage(STORAGE_KEYS.CURRENT_USER_ID, id);
    }
  },
  clearCurrentSession(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  },

  // Users
  getUsers(): User[] {
    return getFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
  saveUsers(users: User[]): void {
    saveToStorage(STORAGE_KEYS.USERS, users);
  },
  updateUserStatus(userId: string, status: 'active' | 'pending' | 'suspended'): void {
    const users = this.getUsers().map((u) => (u.id === userId ? { ...u, status } : u));
    this.saveUsers(users);
  },
  updateUserPassword(userId: string, password: string): void {
    const users = this.getUsers().map((u) => (u.id === userId ? { ...u, password } : u));
    this.saveUsers(users);
  },

  // Register a new patient
  registerPatient(data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    age?: number;
    gender?: 'Male' | 'Female' | 'Other';
    bloodGroup?: string;
    allergies?: string[];
    chronicConditions?: string[];
  }): { user: User; patient: PatientProfile } {
    const userId = `user-patient-${Date.now()}`;
    const patientId = `patient-${Date.now()}`;

    const newUser: User = {
      id: userId,
      name: data.name,
      email: data.email,
      role: 'patient',
      password: data.password || 'password123',
      phone: data.phone || '',
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    const newPatient: PatientProfile = {
      id: patientId,
      userId: userId,
      name: data.name,
      email: data.email,
      age: data.age || 30,
      gender: data.gender || 'Other',
      bloodGroup: data.bloodGroup || 'O+',
      allergies: data.allergies || [],
      chronicConditions: data.chronicConditions || [],
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
    };

    const users = [...this.getUsers(), newUser];
    const patients = [...this.getPatients(), newPatient];

    this.saveUsers(users);
    saveToStorage(STORAGE_KEYS.PATIENTS, patients);

    this.addAuditLog(
      userId,
      newUser.name,
      'patient',
      'USER_REGISTRATION',
      `Registered new patient account: ${newUser.name} (${newUser.email})`
    );

    return { user: newUser, patient: newPatient };
  },

  addAdmin(data: {
    name: string;
    email: string;
    department?: string;
    password?: string;
  }): User {
    const userId = `user-admin-${Date.now()}`;
    const newAdmin: User = {
      id: userId,
      name: data.name,
      email: data.email,
      role: 'admin',
      department: data.department || 'Clinical Operations & Systems',
      password: data.password || 'admin123',
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    const users = [newAdmin, ...this.getUsers()];
    this.saveUsers(users);

    this.addAuditLog(
      userId,
      data.name,
      'admin',
      'PROVISION_ADMIN',
      `Provisioned new Administrator: ${data.name} (${data.email})`
    );

    return newAdmin;
  },

  // Patients
  getPatients(): PatientProfile[] {
    return getFromStorage(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  },
  getPatientById(id: string): PatientProfile | undefined {
    if (!id) return undefined;
    return this.getPatients().find((p) => p.id === id || p.userId === id);
  },
  updatePatientProfile(patientId: string, updates: Partial<PatientProfile>): void {
    const patients = this.getPatients().map((p) =>
      p.id === patientId || p.userId === patientId ? { ...p, ...updates } : p
    );
    saveToStorage(STORAGE_KEYS.PATIENTS, patients);

    // Also update User record if name or phone changed
    if (updates.name || updates.phone) {
      const patient = this.getPatientById(patientId);
      if (patient) {
        const users = this.getUsers().map((u) =>
          u.id === patient.userId
            ? { ...u, name: updates.name || u.name, phone: updates.phone ?? u.phone }
            : u
        );
        this.saveUsers(users);
      }
    }
  },

  // Doctors
  getDoctors(): DoctorProfile[] {
    return getFromStorage(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
  },
  approveDoctor(doctorId: string): void {
    const doctors = this.getDoctors().map((d) => (d.id === doctorId ? { ...d, status: 'approved' as const } : d));
    saveToStorage(STORAGE_KEYS.DOCTORS, doctors);
    this.addAuditLog('admin', 'System Admin', 'admin', 'APPROVE_DOCTOR', `Approved doctor credentials for ${doctorId}`);
  },
  addDoctor(newDoc: DoctorProfile): void {
    const doctors = [newDoc, ...this.getDoctors()];
    saveToStorage(STORAGE_KEYS.DOCTORS, doctors);
  },

  // Reports
  getAllReports(): MedicalReport[] {
    return getFromStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  },
  getReports(patientId?: string): MedicalReport[] {
    const reports = this.getAllReports();
    if (!patientId) {
      // Do not return all reports if no patientId was specified for a patient inquiry
      return [];
    }
    return reports.filter((r) => r.patientId === patientId);
  },
  getReportById(id: string): MedicalReport | undefined {
    return this.getAllReports().find((r) => r.id === id);
  },
  addReport(report: MedicalReport): void {
    const reports = [report, ...this.getAllReports()];
    saveToStorage(STORAGE_KEYS.REPORTS, reports);

    // Append timeline event for this patient
    this.addTimelineEvent({
      id: `time-${Date.now()}`,
      patientId: report.patientId,
      date: report.reportDate,
      title: `${report.reportTitle} Uploaded`,
      type: 'report',
      description: `${report.reportType} processed via MediMind AI. ${report.abnormalCount} abnormal values detected.`,
      badgeText: 'Report Analyzed',
      relatedId: report.id,
    });

    this.addAuditLog(
      report.patientId,
      report.patientName,
      'patient',
      'REPORT_UPLOADED',
      `Uploaded and analyzed ${report.reportTitle}`
    );
  },

  // Risk Indicators
  getRiskIndicators(patientId: string): RiskIndicator[] {
    if (!patientId) return [];
    const list = getFromStorage(STORAGE_KEYS.RISK_INDICATORS, INITIAL_RISK_INDICATORS);
    return list.filter((r) => r.patientId === patientId);
  },
  addRiskIndicator(indicator: RiskIndicator): void {
    const list = [indicator, ...getFromStorage(STORAGE_KEYS.RISK_INDICATORS, INITIAL_RISK_INDICATORS)];
    saveToStorage(STORAGE_KEYS.RISK_INDICATORS, list);
  },

  // Insights
  getInsights(patientId: string): PersonalizedInsight[] {
    if (!patientId) return [];
    const list = getFromStorage(STORAGE_KEYS.INSIGHTS, INITIAL_INSIGHTS);
    return list.filter((i) => i.patientId === patientId);
  },

  // Reminders
  getReminders(patientId: string): TestReminder[] {
    if (!patientId) return [];
    const list = getFromStorage(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS);
    return list.filter((r) => r.patientId === patientId);
  },
  addReminder(reminder: TestReminder): void {
    const list = [reminder, ...getFromStorage(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS)];
    saveToStorage(STORAGE_KEYS.REMINDERS, list);
  },
  toggleReminder(id: string): void {
    const list = getFromStorage<TestReminder[]>(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS).map((r) =>
      r.id === id ? { ...r, status: (r.status === 'completed' ? 'pending' : 'completed') as any } : r
    );
    saveToStorage(STORAGE_KEYS.REMINDERS, list);
  },
  deleteReminder(id: string): void {
    const list = getFromStorage<TestReminder[]>(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS).filter((r) => r.id !== id);
    saveToStorage(STORAGE_KEYS.REMINDERS, list);
  },

  // Timeline
  getTimelineEvents(patientId: string): TimelineEvent[] {
    if (!patientId) return [];
    const list = getFromStorage(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE_EVENTS);
    return list.filter((e) => e.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  addTimelineEvent(event: TimelineEvent): void {
    const list = [event, ...getFromStorage(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE_EVENTS)];
    saveToStorage(STORAGE_KEYS.TIMELINE, list);
  },

  // Doctor Notes
  getDoctorNotes(patientId: string): DoctorNote[] {
    if (!patientId) return [];
    const list = getFromStorage(STORAGE_KEYS.DOCTOR_NOTES, INITIAL_DOCTOR_NOTES);
    return list.filter((n) => n.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  getAllDoctorNotes(): DoctorNote[] {
    const list = getFromStorage(STORAGE_KEYS.DOCTOR_NOTES, INITIAL_DOCTOR_NOTES);
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  addDoctorNote(note: DoctorNote): void {
    const list = [note, ...getFromStorage(STORAGE_KEYS.DOCTOR_NOTES, INITIAL_DOCTOR_NOTES)];
    saveToStorage(STORAGE_KEYS.DOCTOR_NOTES, list);

    this.addTimelineEvent({
      id: `time-${Date.now()}`,
      patientId: note.patientId,
      date: note.date,
      title: `Consultation Note by ${note.doctorName}`,
      type: 'consultation',
      description: note.treatmentAdvice,
      badgeText: 'Doctor Review',
    });

    this.addAuditLog(note.doctorId, note.doctorName, 'doctor', 'CLINICAL_NOTE_ADDED', `Clinical note added for patient ${note.patientId}`);
  },

  // Follow-up Recommendations
  getFollowUps(patientId?: string): FollowUpRecommendation[] {
    const list = getFromStorage(STORAGE_KEYS.FOLLOW_UPS, INITIAL_FOLLOW_UPS);
    if (!patientId) return list;
    return list.filter((f) => f.patientId === patientId);
  },
  getAllFollowUps(): FollowUpRecommendation[] {
    return getFromStorage(STORAGE_KEYS.FOLLOW_UPS, INITIAL_FOLLOW_UPS);
  },
  addFollowUp(fup: FollowUpRecommendation): void {
    const list = [fup, ...getFromStorage(STORAGE_KEYS.FOLLOW_UPS, INITIAL_FOLLOW_UPS)];
    saveToStorage(STORAGE_KEYS.FOLLOW_UPS, list);
  },

  // Glossary
  getGlossary(): GlossaryTerm[] {
    return getFromStorage(STORAGE_KEYS.GLOSSARY, INITIAL_GLOSSARY);
  },

  // System Metrics calculated from actual stored records
  getMetrics(): SystemMetrics {
    const patients = this.getPatients();
    const doctors = this.getDoctors();
    const reports = this.getAllReports();
    const pendingDocs = doctors.filter((d) => d.status === 'pending').length;
    const abnormalReports = reports.filter((r) => r.abnormalCount > 0).length;

    return {
      totalPatients: patients.length,
      totalDoctors: doctors.length,
      reportsUploaded: reports.length,
      reportsAnalyzed: reports.length,
      abnormalReportsCount: abnormalReports,
      pendingDoctorApprovals: pendingDocs,
      aiQueriesAnswered: 24,
      upcomingReminders: getFromStorage<TestReminder[]>(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS).filter((r) => r.status === 'pending').length,
    };
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return getFromStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },
  addAuditLog(userId: string, userName: string, role: any, action: string, details: string): void {
    const logs = [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId,
        userName,
        role,
        action,
        details,
      },
      ...this.getAuditLogs(),
    ];
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 100));
  },

  // Reset to original mock data
  resetAllData(): void {
    localStorage.clear();
    saveToStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    saveToStorage(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    saveToStorage(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    saveToStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    saveToStorage(STORAGE_KEYS.RISK_INDICATORS, INITIAL_RISK_INDICATORS);
    saveToStorage(STORAGE_KEYS.INSIGHTS, INITIAL_INSIGHTS);
    saveToStorage(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS);
    saveToStorage(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE_EVENTS);
    saveToStorage(STORAGE_KEYS.DOCTOR_NOTES, INITIAL_DOCTOR_NOTES);
    saveToStorage(STORAGE_KEYS.FOLLOW_UPS, INITIAL_FOLLOW_UPS);
    saveToStorage(STORAGE_KEYS.GLOSSARY, INITIAL_GLOSSARY);
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },
};
