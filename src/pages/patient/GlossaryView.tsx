import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Volume2, Globe, Sparkles } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { useLanguage } from '../../context/LanguageContext';
import { GlossaryTerm } from '../../types';
import { AudioPlayer } from '../../components/AudioPlayer';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';

export const GlossaryView: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    setGlossary(StorageService.getGlossary());
  }, []);

  const categories = ['ALL', ...Array.from(new Set(glossary.map((g) => g.category)))];

  const filtered = glossary.filter((item) => {
    const q = search.toLowerCase();
    const matchQuery =
      item.term.toLowerCase().includes(q) ||
      item.tamilTerm.includes(q) ||
      item.simpleExplanation.toLowerCase().includes(q) ||
      item.tamilExplanation.includes(q);
    const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchQuery && matchCat;
  });

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            <span>{t('glossaryPageTitle')}</span>
          </h1>
          <p className="text-xs text-slate-500">
            {t('glossaryPageSubtitle')}
          </p>
        </div>

        <button
          onClick={toggleLanguage}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 self-start sm:self-auto transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-teal-600" />
          <span>{t('activeLanguageLabel')} {language === 'en' ? 'English' : 'தமிழ் (Tamil)'}</span>
        </button>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchGlossaryPlaceholder')}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400 text-slate-900"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? (language === 'ta' ? 'அனைத்தும்' : 'ALL') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Glossary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const explanationText = language === 'ta' ? item.tamilExplanation : item.simpleExplanation;
          const fullToRead = `${item.term}. ${explanationText} ${item.whyItMatters}`;

          return (
            <div
              key={item.id}
              className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {language === 'ta' ? item.tamilTerm : item.term}
                    </h3>
                    {language === 'ta' && (
                      <span className="text-xs text-slate-400 font-medium block">{item.term}</span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {item.normalRange}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                  {explanationText}
                </p>

                <div className="text-xs text-slate-600 space-y-0.5">
                  <span className="font-semibold text-slate-900 block">{t('whyItMattersLabel')}</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{item.whyItMatters}</p>
                </div>
              </div>

              {/* Audio controller */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px]">{t('audioNarrationLabel')}</span>
                <AudioPlayer textToRead={fullToRead} lang={language} label={t('actionReadAloud')} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
