import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, FileText, Stethoscope, Pill, CheckCircle, Calendar, Upload } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { TimelineEvent } from '../../types';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';

export const HealthTimelineView: React.FC = () => {
  const { currentPatient, currentUser } = useAuth();
  const { language, t } = useLanguage();
  const patientId = currentPatient?.id || currentUser?.id || '';

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    setEvents(StorageService.getTimelineEvents(patientId));
  }, [patientId]);

  const filteredEvents = events.filter((e) => filterType === 'all' || e.type === filterType);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'report':
        return <FileText className="w-4 h-4 text-teal-600" />;
      case 'consultation':
        return <Stethoscope className="w-4 h-4 text-blue-600" />;
      case 'medication':
        return <Pill className="w-4 h-4 text-amber-600" />;
      case 'vital':
      default:
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getFilterLabel = (type: string) => {
    switch (type) {
      case 'report':
        return t('reportsTab');
      case 'consultation':
        return t('consultationsTab');
      case 'medication':
        return t('medicationsTab');
      default:
        return t('allEventsTab');
    }
  };

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('timelinePageTitle')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('timelinePageSubtitle')}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          {['all', 'report', 'consultation', 'medication'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterType === type
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {getFilterLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-900">{t('noTimelineEvents')}</p>
            <p className="text-xs text-slate-500">
              {language === 'ta'
                ? 'உங்கள் மருத்துவ அறிக்கைகள் மற்றும் ஆலோசனைகள் சேர்க்கப்படும்போது இங்கு தோன்றும்.'
                : 'Your chronological journey will record reports, doctor reviews, and medications as they occur.'}
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t('actionUploadFirst')}</span>
            </Link>
          </div>
        ) : (
          <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
            {filteredEvents.map((evt) => (
              <div key={evt.id} className="relative flex items-start gap-4">
                <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                  {getEventIcon(evt.type)}
                </div>

                <div className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1 hover:bg-slate-100/60 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider">
                      {evt.badgeText || evt.type}
                    </span>
                    <span className="text-xs font-mono tabular-nums text-slate-500 font-medium">
                      {evt.date}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{evt.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
