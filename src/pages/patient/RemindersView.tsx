import React, { useState, useEffect } from 'react';
import { Bell, Plus, CheckCircle2, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { TestReminder } from '../../types';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';

export const RemindersView: React.FC = () => {
  const { currentPatient, currentUser } = useAuth();
  const { language, t } = useLanguage();
  const patientId = currentPatient?.id || currentUser?.id || '';

  const [reminders, setReminders] = useState<TestReminder[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newCategory, setNewCategory] = useState('General Health');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    setReminders(StorageService.getReminders(patientId));
  }, [patientId]);

  const handleToggle = (id: string) => {
    StorageService.toggleReminder(id);
    setReminders(StorageService.getReminders(patientId));
  };

  const handleDelete = (id: string) => {
    StorageService.deleteReminder(id);
    setReminders(StorageService.getReminders(patientId));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDueDate) return;

    const item: TestReminder = {
      id: `rem-${Date.now()}`,
      patientId,
      title: newTitle,
      dueDate: newDueDate,
      category: newCategory,
      notes: newNotes,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    StorageService.addReminder(item);
    setReminders(StorageService.getReminders(patientId));
    setShowAddModal(false);
    setNewTitle('');
    setNewDueDate('');
    setNewNotes('');
  };

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('remindersPageTitle')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('remindersPageSubtitle')}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-teal-400" />
          <span>{t('actionAddReminder')}</span>
        </button>
      </div>

      {/* Reminders List or Empty State */}
      {reminders.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-xl text-center space-y-3 shadow-xs">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h2 className="text-sm font-bold text-slate-900">{t('noRemindersYet')}</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'ta'
              ? 'அடுத்த ஆய்வக சோதனை அல்லது மருத்துவ பரிசோதனைக்கான நினைவூட்டலை சேர்க்கவும்.'
              : 'Add proactive reminders for upcoming routine blood panels, doctor follow-ups, or fasting diagnostic tests.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-teal-400" />
              <span>{t('actionAddReminder')}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map((rem) => {
            const isDone = rem.status === 'completed';
            return (
              <div
                key={rem.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between shadow-xs ${
                  isDone ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggle(rem.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 hover:border-slate-400 text-transparent'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <h3
                        className={`text-sm font-bold ${
                          isDone ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {rem.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleDelete(rem.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title={t('actionDelete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 pl-7 leading-relaxed">{rem.notes}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 pl-7">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {rem.category}
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-slate-700 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{t('dueDateLabel')}: {rem.dueDate}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">{t('addReminderModalTitle')}</h3>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t('testTitleLabel')}</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={language === 'ta' ? 'எ.கா: HbA1c & லிப்பிட் பரிசோதனை' : 'e.g. HbA1c & Lipid Panel'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t('dueDateLabel')}</label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t('categoryLabel')}</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white"
                >
                  <option value="Endocrinology">Endocrinology (Diabetes/Thyroid)</option>
                  <option value="Cardiology">Cardiology / Lipid</option>
                  <option value="Nephrology">Nephrology / Kidney</option>
                  <option value="Hematology">Hematology / CBC</option>
                  <option value="General Health">General Health</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t('notesLabel')}</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder={language === 'ta' ? 'எ.கா: 10 மணி நேர இரவு உண்ணாநிலை தேவை...' : 'e.g. 10 hours overnight fasting required...'}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-slate-900 bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {t('actionCancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                >
                  {t('saveReminderBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
