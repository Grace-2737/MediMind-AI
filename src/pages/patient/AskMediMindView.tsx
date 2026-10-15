import React, { useState, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Bot, User, Volume2, Globe, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { StorageService } from '../../services/storage';
import { ApiService } from '../../services/api';
import { AudioPlayer } from '../../components/AudioPlayer';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  lang?: 'en' | 'ta';
}

export const AskMediMindView: React.FC = () => {
  const { currentPatient, currentUser } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  const patientId = currentPatient?.id || currentUser?.id || '';
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    setReports(StorageService.getReports(patientId));
  }, [patientId]);

  const hasReports = reports.length > 0;

  const getInitialGreeting = () => {
    if (!hasReports) {
      return language === 'ta'
        ? 'வணக்கம்! நான் MediMind AI. நீங்கள் இதுவரை எந்த ஆய்வக அறிக்கையையும் பதிவேற்றவில்லை. நீங்கள் ஒரு மருத்துவ அறிக்கையை பதிவேற்றியதும் உங்கள் அளவீடுகள், மாற்றங்கள் மற்றும் போக்குகளை நான் விளக்குவேன். அதுவரை மருத்துவ சொற்கள் மற்றும் ஆய்வக பரிசோதனைகள் குறித்த பொதுவான கேள்விகளை நீங்கள் கேட்கலாம்.'
        : 'Hello! I am MediMind AI. You have not uploaded any medical reports yet. Once you upload a laboratory report via the Upload Report section, I will interpret your parameters, track changes, and highlight health trends. You can also ask general questions about medical terms and diagnostic tests.';
    }
    return language === 'ta'
      ? 'வணக்கம்! நான் MediMind AI. உங்கள் ஆய்வக அறிக்கைகள், ரத்த சர்க்கரை அளவுகள் (HbA1c), கொலஸ்ட்ரால் போக்குகள் மற்றும் மருத்துவ சொற்கள் குறித்த சந்தேகங்களை கேட்கலாம். நான் மருத்துவர் அல்ல, ஆனால் உங்கள் அறிக்கைகளைப் புரிந்துகொள்ள உதவ முடியும்.'
      : 'Hello! I am MediMind AI. I can help interpret your laboratory test results, explain parameter changes, and summarize observed health trends based on your stored records. What would you like to know?';
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    setMessages([
      {
        id: 'msg-init-1',
        sender: 'assistant',
        text: getInitialGreeting(),
        timestamp: 'Just now',
        lang: language,
      },
    ]);
  }, [language, hasReports]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sampleQuestions = hasReports
    ? language === 'ta'
      ? [
          'எனது சமீபத்திய அறிக்கையில் என்ன மாற்றங்கள் உள்ளன?',
          'முந்தைய அறிக்கையை விட எந்த அளவுகள் மாறியுள்ளன?',
          'எனது HbA1c அளவை விளக்குங்கள்.',
          'எனது கொலஸ்ட்ரால் போக்கை காட்டுங்கள்.',
        ]
      : [
          'What changed in my latest report?',
          'Which values are different from my previous report?',
          'Explain my HbA1c result.',
          'Show me my cholesterol trend.',
        ]
    : language === 'ta'
    ? [
        'HbA1c பரிசோதனை எதற்காக செய்யப்படுகிறது?',
        'ரத்த சர்க்கரை இயல்பு அளவு என்ன?',
        'கொலஸ்ட்ரால் அளவை எவ்வாறு குறைக்கலாம்?',
        'சிறுநீரக பரிசோதனைக்கு எவ்வாறு தயாராக வேண்டும்?',
      ]
    : [
        'What does an HbA1c test measure?',
        'What is a normal fasting glucose range?',
        'How can I prepare for a lipid panel test?',
        'What is the role of serum creatinine?',
      ];

  const handleSend = async (queryToSend?: string) => {
    const q = queryToSend || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const patientContext = {
        patientName: currentPatient?.name || currentUser?.name,
        age: currentPatient?.age,
        conditions: currentPatient?.chronicConditions,
        hasReports,
        reportsCount: reports.length,
        reports: reports.map((r) => ({
          title: r.reportTitle,
          date: r.reportDate,
          parameters: r.parameters.map((p: any) => ({
            name: p.name,
            value: p.value,
            unit: p.unit,
            status: p.status,
            previous: p.previousValue,
          })),
        })),
        latestReport: reports[0]
          ? {
              title: reports[0].reportTitle,
              date: reports[0].reportDate,
              parameters: reports[0].parameters.map((p: any) => ({
                name: p.name,
                value: p.value,
                unit: p.unit,
                status: p.status,
                previous: p.previousValue,
              })),
            }
          : null,
      };

      const res = await ApiService.askMediMind(q, patientContext, language);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lang: language,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        text:
          language === 'ta'
            ? 'மன்னிக்கவும், உங்கள் கோரிக்கையை செயலாக்குவதில் சிக்கல் ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
            : 'Sorry, I encountered an issue interpreting your records. Please try again.',
        timestamp: 'Just now',
        lang: language,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <span>{t('askMediMindTitle')}</span>
          </h1>
          <p className="text-xs text-slate-500">
            {t('askMediMindSubtitle')}
          </p>
        </div>

        <button
          onClick={toggleLanguage}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 self-start sm:self-auto transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-teal-600" />
          <span>{language === 'en' ? 'தமிழ் (Tamil)' : 'English'}</span>
        </button>
      </div>

      {!hasReports && (
        <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <p>{t('askNoReportsNotice')}</p>
        </div>
      )}

      {/* Chat Conversation Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[560px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-teal-600 text-white shadow-2xs'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed space-y-2 shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line font-normal">{msg.text}</div>

                <div
                  className={`flex items-center justify-between gap-3 pt-1 text-[10px] ${
                    msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {msg.sender === 'assistant' && (
                    <AudioPlayer
                      textToRead={msg.text}
                      lang={msg.lang || language}
                      label={t('actionReadAloud')}
                      className="bg-transparent p-0"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-600 rounded-full animate-ping"></div>
                <span>{t('thinkingNotice')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Queries Chips */}
        <div className="p-3 bg-white border-t border-slate-100 space-y-1.5">
          <span className="text-[11px] font-medium text-slate-400 block">
            {t('suggestedQueriesLabel')}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sampleQuestions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="px-2.5 py-1 text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-left transition-colors truncate max-w-xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={t('askInputPlaceholder')}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-slate-400 focus:bg-white transition-all text-slate-900"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-xl transition-colors shadow-2xs"
          >
            <span>{t('sendBtn')}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
