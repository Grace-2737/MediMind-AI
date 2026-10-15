import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  Shield,
  Heart,
  AlertCircle,
  Save,
  CheckCircle,
  Stethoscope,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { StorageService } from '../../services/storage';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';

export const ProfileView: React.FC = () => {
  const { currentUser, currentPatient, currentDoctor, role } = useAuth();
  const { language, t } = useLanguage();

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states initialized with current user/patient values (no fallback to Arun Kumar for other users)
  const [name, setName] = useState(currentUser?.name || currentPatient?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || currentPatient?.phone || '');
  const [age, setAge] = useState(currentPatient?.age || 0);
  const [bloodGroup, setBloodGroup] = useState(currentPatient?.bloodGroup || 'O+');
  const [allergies, setAllergies] = useState((currentPatient?.allergies || []).join(', '));
  const [conditions, setConditions] = useState((currentPatient?.chronicConditions || []).join(', '));
  const [emergencyName, setEmergencyName] = useState(currentPatient?.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(currentPatient?.emergencyContact?.phone || '');
  const [emergencyRelation, setEmergencyRelation] = useState(currentPatient?.emergencyContact?.relationship || 'Family');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setPhone(currentUser.phone || '');
    }
    if (currentPatient) {
      setAge(currentPatient.age || 0);
      setBloodGroup(currentPatient.bloodGroup || 'O+');
      setAllergies((currentPatient.allergies || []).join(', '));
      setConditions((currentPatient.chronicConditions || []).join(', '));
      if (currentPatient.emergencyContact) {
        setEmergencyName(currentPatient.emergencyContact.name || '');
        setEmergencyPhone(currentPatient.emergencyContact.phone || '');
        setEmergencyRelation(currentPatient.emergencyContact.relationship || 'Family');
      }
    }
  }, [currentUser, currentPatient]);

  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentPatient) {
      const allergyList = allergies
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const conditionList = conditions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      StorageService.updatePatientProfile(currentPatient.id, {
        name,
        phone,
        age: Number(age),
        bloodGroup,
        allergies: allergyList,
        chronicConditions: conditionList,
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relationship: emergencyRelation,
        },
      });
    }

    if (currentUser && newPassword.trim().length >= 6) {
      StorageService.updateUserPassword(currentUser.id, newPassword.trim());
      setNewPassword('');
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const isDemoAccount =
    currentUser?.id === 'user-patient-1' ||
    currentUser?.id === 'user-doctor-1' ||
    currentUser?.id === 'user-admin-1';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {role === 'doctor'
              ? t('doctorProfileTitle')
              : role === 'admin'
              ? (language === 'ta' ? 'கணினி நிர்வாகி சுயவிவரம்' : 'System Administrator Profile')
              : t('patientProfileTitle')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('profileSubtitle')}
          </p>
        </div>

        {isDemoAccount && (
          <span className="self-start sm:self-auto text-[11px] font-medium px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
            {t('demoModeBadge')}
          </span>
        )}
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t('profileSavedNotice')}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 bg-white border border-slate-200 rounded-xl space-y-5 shadow-xs">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold">
            {name ? name.charAt(0) : 'U'}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{name || 'User'}</h2>
            <p className="text-xs text-slate-500">
              {currentUser?.email} · {t('statusLabel')}: <span className="capitalize font-semibold text-slate-700">{role}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              {t('colPatientName')} / {language === 'ta' ? 'முழு பெயர்' : 'Full Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              {t('emergencyPhoneLabel')} / {language === 'ta' ? 'தொலைபேசி எண்' : 'Phone'}
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono text-slate-900 bg-white"
            />
          </div>

          {role === 'patient' && (
            <>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('ageLabel')}
                </label>
                <input
                  type="number"
                  value={age || ''}
                  onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('bloodGroupLabel')}
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
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

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('allergies')}
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder={language === 'ta' ? 'எ.கா: பென்சிலின், நிலக்கடலை' : 'Comma-separated (e.g. Penicillin, Peanuts)'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('chronicConditions')}
                </label>
                <input
                  type="text"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder={language === 'ta' ? 'எ.கா: நீரிழிவு, உயர் இரத்த அழுத்தம்' : 'Comma-separated (e.g. Pre-diabetes, Hypertension)'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white"
                />
              </div>

              <div className="sm:col-span-2 pt-3 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  {t('emergencyContactHeader')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {t('contactNameRelLabel')}
                    </label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder={language === 'ta' ? 'பெயர் (உறவு)' : 'Contact Name & Relationship'}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {t('emergencyPhoneLabel')}
                    </label>
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono text-slate-900 bg-white"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {role === 'doctor' && (
            <>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('specializationLabel')}
                </label>
                <input
                  type="text"
                  disabled
                  value={currentDoctor?.specialization || 'Internal Medicine & Diabetology'}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-700"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('licenseNumberLabel')}
                </label>
                <input
                  type="text"
                  disabled
                  value={currentDoctor?.licenseNumber || 'TN-MED-84920'}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-mono text-slate-700"
                />
              </div>
            </>
          )}

          {/* Account Security & Password */}
          <div className="sm:col-span-2 pt-3 border-t border-slate-100">
            <label className="font-semibold text-slate-700 block mb-1">
              {language === 'ta' ? 'கணக்கு கடவுச்சொல் (மாற்ற விரும்பினால்)' : 'Account Password (Leave blank to keep current)'}
            </label>
            <div className="relative max-w-sm">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                title={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-teal-600" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {language === 'ta'
                ? 'உங்கள் கடவுச்சொல்லை மாற்ற புதிய கடவுச்சொல்லை உள்ளிட்டு கீழே உள்ள சேமி பொத்தானை அழுத்தவும்.'
                : 'To update your login credentials, type a new password and click Save Changes.'}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t('saveProfileBtn')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
