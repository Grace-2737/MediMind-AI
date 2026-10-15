import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, PatientProfile, DoctorProfile } from '../types';
import { StorageService } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  currentPatient: PatientProfile | null;
  currentDoctor: DoctorProfile | null;
  role: UserRole | 'guest';
  isAuthenticated: boolean;
  loginWithEmail: (email: string, password?: string) => boolean;
  loginAsDemo: (role: UserRole) => void;
  registerPatient: (data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    age?: number;
    gender?: 'Male' | 'Female' | 'Other';
    bloodGroup?: string;
  }) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPatient, setCurrentPatient] = useState<PatientProfile | null>(null);
  const [currentDoctor, setCurrentDoctor] = useState<DoctorProfile | null>(null);

  const loadUserById = (userId: string | null) => {
    if (!userId) {
      setCurrentUser(null);
      setCurrentPatient(null);
      setCurrentDoctor(null);
      return;
    }

    const users = StorageService.getUsers();
    const user = users.find((u) => u.id === userId);

    if (!user) {
      setCurrentUser(null);
      setCurrentPatient(null);
      setCurrentDoctor(null);
      StorageService.clearCurrentSession();
      return;
    }

    setCurrentUser(user);
    StorageService.setCurrentUserId(user.id);

    if (user.role === 'patient') {
      const patient = StorageService.getPatientById(user.id);
      setCurrentPatient(patient || null);
      setCurrentDoctor(null);
    } else if (user.role === 'doctor') {
      const doctor = StorageService.getDoctors().find((d) => d.userId === user.id);
      setCurrentDoctor(doctor || null);
      setCurrentPatient(null);
    } else {
      setCurrentPatient(null);
      setCurrentDoctor(null);
    }
  };

  useEffect(() => {
    const savedUserId = StorageService.getCurrentUserId();
    if (savedUserId) {
      loadUserById(savedUserId);
    }
  }, []);

  const loginWithEmail = (email: string, password?: string): boolean => {
    const users = StorageService.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      // If user has a set password and password was provided, verify it matches
      if (found.password && password && found.password !== password) {
        return false;
      }
      loadUserById(found.id);
      StorageService.addAuditLog(found.id, found.name, found.role, 'USER_LOGIN', `Logged in as ${found.email}`);
      return true;
    }
    return false;
  };

  const loginAsDemo = (demoRole: UserRole) => {
    const users = StorageService.getUsers();
    let target: User | undefined;
    if (demoRole === 'patient') {
      target = users.find((u) => u.id === 'user-patient-1') || users.find((u) => u.role === 'patient');
    } else if (demoRole === 'doctor') {
      target = users.find((u) => u.id === 'user-doctor-1') || users.find((u) => u.role === 'doctor');
    } else if (demoRole === 'admin') {
      target = users.find((u) => u.id === 'user-admin-1') || users.find((u) => u.role === 'admin');
    }

    if (target) {
      loadUserById(target.id);
      StorageService.addAuditLog(target.id, target.name, target.role, 'DEMO_LOGIN', `Accessed demo session: ${target.name}`);
    }
  };

  const switchRole = (newRole: UserRole) => {
    loginAsDemo(newRole);
  };

  const registerPatient = (data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    age?: number;
    gender?: 'Male' | 'Female' | 'Other';
    bloodGroup?: string;
  }) => {
    const result = StorageService.registerPatient(data);
    loadUserById(result.user.id);
  };

  const logout = () => {
    if (currentUser) {
      StorageService.addAuditLog(currentUser.id, currentUser.name, currentUser.role, 'USER_LOGOUT', 'Signed out from session');
    }
    setCurrentUser(null);
    setCurrentPatient(null);
    setCurrentDoctor(null);
    StorageService.clearCurrentSession();
  };

  const refreshUserData = () => {
    if (currentUser) {
      loadUserById(currentUser.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentPatient,
        currentDoctor,
        role: currentUser?.role || 'guest',
        isAuthenticated: !!currentUser,
        loginWithEmail,
        loginAsDemo,
        registerPatient,
        switchRole,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
