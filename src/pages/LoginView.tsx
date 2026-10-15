import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Shield,
  Stethoscope,
  User,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  FileBadge,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithEmail, registerPatient } = useAuth();
  const { language, t } = useLanguage();
  const isTa = language === 'ta';

  // Role can be initialized from query param ?role=patient|doctor|admin
  const roleParam = searchParams.get('role') as UserRole | null;
  const initialRole: UserRole = roleParam === 'doctor' || roleParam === 'admin' ? roleParam : 'patient';

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  // Clean empty inputs - no pre-filled or displayed credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Register form states (with password creation)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regAge, setRegAge] = useState<number>(32);
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [regBlood, setRegBlood] = useState('B+');

  useEffect(() => {
    if (roleParam && (roleParam === 'patient' || roleParam === 'doctor' || roleParam === 'admin')) {
      setSelectedRole(roleParam);
    }
  }, [roleParam]);

  const redirectAfterAuth = (role: UserRole) => {
    if (role === 'doctor') {
      navigate('/doctor');
    } else if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage(
        isTa
          ? 'தயவுசெய்து உங்கள் மின்னஞ்சல் முகவரி மற்றும் கடவுச்சொல்லை உள்ளிடவும்.'
          : 'Please enter your email address and password.'
      );
      return;
    }

    const success = loginWithEmail(email.trim(), password);
    if (success) {
      redirectAfterAuth(selectedRole);
    } else {
      setErrorMessage(
        isTa
          ? 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல். தயவுசெய்து சரியான விவரங்களை உள்ளிடவும் அல்லது புதிய நோயாளி கணக்கை பதிவு செய்யவும்.'
          : 'Invalid email or password. Please verify your credentials or register a new patient account.'
      );
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMessage(
        isTa ? 'தயவுசெய்து முழு பெயர் மற்றும் மின்னஞ்சலை உள்ளிடவும்.' : 'Please provide your full name and email address.'
      );
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setErrorMessage(
        isTa
          ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் கொண்டிருக்க வேண்டும்.'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage(
        isTa ? 'கடவுச்சொற்கள் பொருந்தவில்லை. தயவுசெய்து மீண்டும் சரிபார்க்கவும்.' : 'Passwords do not match. Please re-enter.'
      );
      return;
    }

    // Register patient with password
    registerPatient({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      phone: regPhone.trim(),
      age: regAge,
      gender: regGender,
      bloodGroup: regBlood,
    });

    setSuccessMessage(
      isTa
        ? 'உங்கள் நோயாளி கணக்கு மற்றும் கடவுச்சொல் வெற்றிகரமாக உருவாக்கப்பட்டது! முகப்பிற்கு மாற்றப்படுகிறது...'
        : 'Patient account and personal password created successfully! Redirecting to your dashboard...'
    );

    setTimeout(() => {
      redirectAfterAuth('patient');
    }, 1200);
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6">
      {/* Role Selection Tabs */}
      <div className="flex p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => handleRoleSelect('patient')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all ${
            selectedRole === 'patient'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5 text-teal-600" />
          <span>{isTa ? 'நோயாளி தளம்' : 'Patient Portal'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleRoleSelect('doctor')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all ${
            selectedRole === 'doctor'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
          <span>{isTa ? 'மருத்துவர் பணிமனை' : 'Physician'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleRoleSelect('admin')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all ${
            selectedRole === 'admin'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-slate-700" />
          <span>{isTa ? 'நிர்வாகி' : 'Admin'}</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center mx-auto">
            {selectedRole === 'doctor' ? (
              <Stethoscope className="w-5 h-5 text-teal-400" />
            ) : selectedRole === 'admin' ? (
              <Shield className="w-5 h-5 text-teal-400" />
            ) : (
              <Sparkles className="w-5 h-5 text-teal-400" />
            )}
          </div>
          <h1 className="text-lg font-bold">
            {selectedRole === 'patient'
              ? activeTab === 'signin'
                ? isTa ? 'நோயாளி உள்நுழைவு' : 'Patient Portal Login'
                : isTa ? 'புதிய நோயாளி பதிவு' : 'New Patient Registration'
              : selectedRole === 'doctor'
              ? isTa ? 'மருத்துவர் பணிமனை உள்நுழைவு' : 'Physician Clinical Workspace'
              : isTa ? 'கணினி நிர்வாகி உள்நுழைவு' : 'Administrator Console'}
          </h1>
          <p className="text-xs text-slate-300">
            {selectedRole === 'patient'
              ? isTa ? 'உங்கள் ஆய்வக அறிக்கைகள் மற்றும் சுகாதார போக்குகளை அணுக மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்' : 'Enter your registered email and password to access your health records'
              : selectedRole === 'doctor'
              ? isTa ? 'மருத்துவ முடிவு ஆதரவு மற்றும் SOAP ஆவணங்களை அணுகவும்' : 'Clinical SOAP decision support, patient records, and lab review'
              : isTa ? 'மருத்துவர் சரிபார்ப்பு மற்றும் கணினி தணிக்கை கட்டுப்பாடுகள்' : 'System governance, user directory, and admin management'}
          </p>
        </div>

        {/* Tab switch for patient (SignIn vs Register) */}
        {selectedRole === 'patient' && (
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTab('signin');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                activeTab === 'signin'
                  ? 'border-slate-900 text-slate-900 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t('signIn')}
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                activeTab === 'register'
                  ? 'border-slate-900 text-slate-900 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t('register')}
            </button>
          </div>
        )}

        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'signin' || selectedRole !== 'patient' ? (
            /* Sign-In Form: User enters their email & password */
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {selectedRole === 'patient'
                    ? t('emailLabel')
                    : selectedRole === 'doctor'
                    ? (isTa ? 'மருத்துவர் அதிகாரப்பூர்வ மின்னஞ்சல்' : 'Physician Medical Email')
                    : (isTa ? 'நிர்வாகி மின்னஞ்சல்' : 'Administrator Email')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      selectedRole === 'patient'
                        ? 'Enter your email address'
                        : selectedRole === 'doctor'
                        ? 'e.g. physician@medimind.org'
                        : 'e.g. admin@medimind.org'
                    }
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400 font-mono text-slate-900 bg-white"
                  />
                </div>
              </div>

              {selectedRole === 'doctor' && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {isTa ? 'மருத்துவ கவுன்சில் உரிம எண் (விருப்பத்தேர்வு)' : 'Medical Council Licensure Number (Optional)'}
                  </label>
                  <div className="relative">
                    <FileBadge className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="e.g. TN-MED-84920"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400 font-mono text-slate-900 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Password field with Eye toggle inside */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {selectedRole === 'admin'
                    ? (isTa ? 'பாதுகாப்பு கடவுச்சொல்' : 'Security Access Key / Password')
                    : t('passwordLabel')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400 font-mono text-slate-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-slate-600" /> : <Eye className="w-4 h-4 text-teal-600" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>
                  {selectedRole === 'patient'
                    ? t('loginBtn')
                    : selectedRole === 'doctor'
                    ? isTa ? 'மருத்துவராக உள்நுழைக' : 'Enter Physician Workspace'
                    : isTa ? 'நிர்வாகியாக உள்நுழைக' : 'Enter Admin Console'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            /* Register Form: Patient creates their own account & password */
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('fullNameLabel')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Raman"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('emailLabel')}
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. suresh.raman@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white font-mono"
                />
              </div>

              {/* Patient Creates Password and Confirms with Eye Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {isTa ? 'கடவுச்சொல்லை உருவாக்கவும்' : 'Create Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Min 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono text-slate-900 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title={showRegPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-teal-600" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {isTa ? 'கடவுச்சொல் உறுதிப்படுத்தல்' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono text-slate-900 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-teal-600" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t('ageLabel')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={regAge}
                    onChange={(e) => setRegAge(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t('genderLabel')}
                  </label>
                  <select
                    value={regGender}
                    onChange={(e) => setRegGender(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white"
                  >
                    <option value="Male">{t('male')}</option>
                    <option value="Female">{t('female')}</option>
                    <option value="Other">{t('other')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t('bloodGroupLabel')}
                  </label>
                  <select
                    value={regBlood}
                    onChange={(e) => setRegBlood(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono text-slate-900 bg-white"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t('phoneLabel')}
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 00000"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono text-slate-900 bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs mt-2"
              >
                {t('registerBtn')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
