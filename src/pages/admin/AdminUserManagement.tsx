import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Plus,
  Shield,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Building,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { useLanguage } from '../../context/LanguageContext';
import { User, DoctorProfile } from '../../types';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';

export const AdminUserManagement: React.FC = () => {
  const { language, t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

  // New Doctor form
  const [docName, setDocName] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docSpec, setDocSpec] = useState('Endocrinology');
  const [docHospital, setDocHospital] = useState('Apollo Specialty Center');
  const [docLicense, setDocLicense] = useState('TN-MED-99412');

  // New Admin form
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminDept, setAdminDept] = useState('Hospital Systems Governance');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminSuccessMsg, setAdminSuccessMsg] = useState('');
  const [adminErrorMsg, setAdminErrorMsg] = useState('');

  useEffect(() => {
    setUsers(StorageService.getUsers());
    setDoctors(StorageService.getDoctors());
  }, []);

  const handleToggleUserStatus = (userId: string, currentStatus: string) => {
    const next = currentStatus === 'active' ? 'suspended' : 'active';
    StorageService.updateUserStatus(userId, next as any);
    setUsers(StorageService.getUsers());
  };

  const handleApproveDoctor = (doctorId: string) => {
    StorageService.approveDoctor(doctorId);
    setDoctors(StorageService.getDoctors());
    setUsers(StorageService.getUsers());
  };

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !docEmail) return;

    const newDocId = `doc-${Date.now()}`;
    const newUserId = `user-doc-${Date.now()}`;

    const newDoc: DoctorProfile = {
      id: newDocId,
      userId: newUserId,
      name: docName,
      email: docEmail,
      specialization: docSpec,
      hospital: docHospital,
      qualification: 'MBBS, MD',
      licenseNumber: docLicense,
      status: 'approved',
      experienceYears: 8,
      assignedPatientCount: 0,
    };

    const newUser: User = {
      id: newUserId,
      name: docName,
      email: docEmail,
      role: 'doctor',
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    StorageService.addDoctor(newDoc);
    StorageService.saveUsers([newUser, ...StorageService.getUsers()]);

    setDoctors(StorageService.getDoctors());
    setUsers(StorageService.getUsers());
    setShowAddDoctorModal(false);
    setDocName('');
    setDocEmail('');
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminErrorMsg('');
    setAdminSuccessMsg('');

    if (!adminName.trim() || !adminEmail.trim()) {
      setAdminErrorMsg(language === 'ta' ? 'பெயர் மற்றும் மின்னஞ்சலை உள்ளிடவும்.' : 'Please enter admin name and email.');
      return;
    }

    if (!adminPassword || adminPassword.length < 6) {
      setAdminErrorMsg(
        language === 'ta'
          ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் கொண்டிருக்க வேண்டும்.'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }

    // Call StorageService.addAdmin
    StorageService.addAdmin({
      name: adminName.trim(),
      email: adminEmail.trim(),
      department: adminDept,
      password: adminPassword,
    });

    setUsers(StorageService.getUsers());
    setAdminSuccessMsg(
      language === 'ta'
        ? `நிர்வாகி "${adminName}" வெற்றிகரமாக சேர்க்கப்பட்டார்!`
        : `Administrator "${adminName}" provisioned successfully!`
    );

    setAdminName('');
    setAdminEmail('');
    setAdminPassword('');

    setTimeout(() => {
      setShowAddAdminModal(false);
      setAdminSuccessMsg('');
    }, 1200);
  };

  const filteredUsers = users.filter((u) => {
    const matchQ =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase()));
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchQ && matchRole;
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const doctorCount = users.filter((u) => u.role === 'doctor').length;
  const patientCount = users.filter((u) => u.role === 'patient').length;

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {language === 'ta' ? 'பயனர் & நிர்வாக அடைவு' : 'User & Administrator Directory'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'கணக்கு ஒதுக்கீடு, புதிய நிர்வாகிகளைச் சேர்த்தல் மற்றும் பங்கு அடிப்படையிலான அணுகல் கட்டுப்பாடு'
              : 'Account provisioning, adding system administrators, and role-based access governance'}
          </p>
        </div>

        {/* Action Buttons: Add Admin & Provision Doctor */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setShowAddAdminModal(true);
              setAdminErrorMsg('');
              setAdminSuccessMsg('');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>{language === 'ta' ? '+ புதிய நிர்வாகி' : '+ Add Administrator'}</span>
          </button>

          <button
            onClick={() => setShowAddDoctorModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4 text-teal-600" />
            <span>{language === 'ta' ? 'புதிய மருத்துவர்' : '+ Provision Physician'}</span>
          </button>
        </div>
      </div>

      {/* Doctor Approval Pending Queue */}
      {doctors.some((d) => d.status === 'pending') && (
        <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-amber-700" />
            <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              {language === 'ta' ? 'நிலுவையில் உள்ள மருத்துவர் உரிம சரிபார்ப்பு' : 'Pending Doctor Licensure Verification'} ({doctors.filter((d) => d.status === 'pending').length})
            </h3>
          </div>

          <div className="space-y-2">
            {doctors
              .filter((d) => d.status === 'pending')
              .map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-white rounded-lg border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900">{doc.name}</h4>
                    <p className="text-slate-500 text-[11px]">
                      {doc.specialization} · {doc.hospital} · {t('licenseNumberLabel')}: <span className="font-mono">{doc.licenseNumber}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleApproveDoctor(doc.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md shadow-2xs self-start sm:self-auto"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{language === 'ta' ? 'சான்றுகளை அங்கீகரி' : 'Approve Credentials'}</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Search and Role Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'ta' ? 'பயனர் பெயர், துறை அல்லது மின்னஞ்சல் கொண்டு தேடுக...' : 'Search by name, department, or email...'}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden text-slate-900"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs overflow-x-auto">
          {[
            { id: 'ALL', label: language === 'ta' ? 'அனைத்து' : 'All Users', count: users.length },
            { id: 'admin', label: language === 'ta' ? 'நிர்வாகிகள்' : 'Administrators', count: adminCount },
            { id: 'doctor', label: language === 'ta' ? 'மருத்துவர்கள்' : 'Doctors', count: doctorCount },
            { id: 'patient', label: language === 'ta' ? 'நோயாளிகள்' : 'Patients', count: patientCount },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setRoleFilter(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                roleFilter === item.id
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{item.label}</span>
              <span className="text-[10px] font-mono px-1 rounded bg-slate-200/70 text-slate-700">
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[11px]">
                <th className="py-3 px-4">{language === 'ta' ? 'பயனர்' : 'User'}</th>
                <th className="py-3 px-4">{language === 'ta' ? 'பங்கு & துறை' : 'Role & Department'}</th>
                <th className="py-3 px-4">{language === 'ta' ? 'தொலைபேசி' : 'Phone'}</th>
                <th className="py-3 px-4">{language === 'ta' ? 'பதிவு தேதி' : 'Registered Date'}</th>
                <th className="py-3 px-4 text-center">{t('statusLabel')}</th>
                <th className="py-3 px-4 text-right">{language === 'ta' ? 'நடவடிக்கைகள்' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`font-semibold capitalize px-2 py-0.5 rounded border text-[11px] ${
                          user.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : user.role === 'doctor'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-teal-50 text-teal-700 border-teal-200'
                        }`}
                      >
                        {user.role === 'admin' ? 'System Admin' : user.role}
                      </span>
                      {user.department && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          ({user.department})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                    {user.phone || '—'}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {user.createdAt ? user.createdAt.split('T')[0] : '2026-01-01'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                        user.status === 'active'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-rose-700 bg-rose-50 border-rose-200'
                      }`}
                    >
                      {user.status === 'active' ? (language === 'ta' ? 'செயலில்' : 'Active') : (language === 'ta' ? 'நிறுத்தப்பட்டது' : 'Suspended')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleUserStatus(user.id, user.status)}
                      className={`text-xs font-medium px-2.5 py-1 rounded border transition-colors ${
                        user.status === 'active'
                          ? 'text-slate-600 hover:text-rose-700 border-slate-200 hover:border-rose-300'
                          : 'text-emerald-700 hover:text-emerald-900 border-emerald-200 bg-emerald-50'
                      }`}
                    >
                      {user.status === 'active' ? (language === 'ta' ? 'நிறுத்து' : 'Suspend') : (language === 'ta' ? 'செயலாக்கு' : 'Activate')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Administrator Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'ta' ? 'புதிய கணினி நிர்வாகியை சேர்த்தல்' : 'Provision New Administrator'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {language === 'ta' ? 'கணினி அமைப்புகளை நிர்வகிக்கும் அதிகாரம் பெற்ற கணக்கு' : 'Grant administrative permissions and security credentials'}
                </p>
              </div>
            </div>

            {adminErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                {adminErrorMsg}
              </div>
            )}

            {adminSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{adminSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddAdmin} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {language === 'ta' ? 'நிர்வாகியின் முழு பெயர்' : 'Administrator Full Name'}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandran"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {language === 'ta' ? 'நிர்வாக மின்னஞ்சல் முகவரி' : 'Official Admin Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh.admin@medimind.org"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {language === 'ta' ? 'நிர்வாக பிரிவு / துறை' : 'Department / Authority Unit'}
                </label>
                <select
                  value={adminDept}
                  onChange={(e) => setAdminDept(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white"
                >
                  <option value="Hospital Systems Governance">Hospital Systems Governance</option>
                  <option value="Clinical IT & Security">Clinical IT & Security</option>
                  <option value="Healthcare Compliance & Audit">Healthcare Compliance & Audit</option>
                  <option value="Chief Medical Officer Administration">Chief Medical Officer Administration</option>
                  <option value="Laboratory Information Systems (LIS)">Laboratory Information Systems (LIS)</option>
                </select>
              </div>

              {/* Password Field with Eye Toggle */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {language === 'ta' ? 'பாதுகாப்பு கடவுச்சொல்' : 'Admin Security Password'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Min 6 characters (e.g. SecurePass2026!)"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors"
                    title={showAdminPassword ? 'Hide password' : 'Show password'}
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-teal-600" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {language === 'ta' ? 'புதிய நிர்வாகி இந்த மின்னஞ்சல் மற்றும் கடவுச்சொல்லைப் பயன்படுத்தி உள்நுழையலாம்.' : 'The new admin can log into the Admin Console using this email and password.'}
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {t('actionCancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-xs"
                >
                  {language === 'ta' ? 'நிர்வாகியை உருவாக்கு' : 'Create Admin Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'ta' ? 'புதிய மருத்துவரை பதிவு செய்தல்' : 'Provision Authorized Physician'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {language === 'ta' ? 'மருத்துவ உரிமம் மற்றும் பணிமனை அணுகல்' : 'Register medical license and clinical workspace access'}
                </p>
              </div>
            </div>

            <form onSubmit={handleAddDoctor} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {language === 'ta' ? 'மருத்துவர் முழு பெயர்' : 'Doctor Full Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Nathan"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {language === 'ta' ? 'அதிகாரப்பூர்வ மின்னஞ்சல்' : 'Official Medical Email'}
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. dr.rajesh@medimind.org"
                  value={docEmail}
                  onChange={(e) => setDocEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('specializationLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={docSpec}
                  onChange={(e) => setDocSpec(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {language === 'ta' ? 'இணைக்கப்பட்ட மருத்துவமனை' : 'Affiliated Hospital / Center'}
                </label>
                <input
                  type="text"
                  required
                  value={docHospital}
                  onChange={(e) => setDocHospital(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('licenseNumberLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={docLicense}
                  onChange={(e) => setDocLicense(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono text-slate-900 bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {t('actionCancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-xs"
                >
                  {language === 'ta' ? 'மருத்துவரை பதிவு செய்' : 'Register Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
