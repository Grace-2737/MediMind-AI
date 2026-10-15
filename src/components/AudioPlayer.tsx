import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, Square } from 'lucide-react';
import { speechService, SpeechState } from '../utils/speech';
import { useLanguage } from '../context/LanguageContext';

interface AudioPlayerProps {
  textToRead: string;
  lang?: 'en' | 'ta';
  label?: string;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  textToRead,
  lang,
  label = 'Listen',
  className = '',
}) => {
  const { language, t } = useLanguage();
  const activeLang = lang || language;
  const [speechState, setSpeechState] = useState<SpeechState>({
    isSpeaking: false,
    isPaused: false,
  });

  useEffect(() => {
    const unsubscribe = speechService.subscribe(setSpeechState);
    return () => unsubscribe();
  }, []);

  const handleToggle = () => {
    if (speechState.isSpeaking) {
      if (speechState.isPaused) {
        speechService.resume();
      } else {
        speechService.pause();
      }
    } else {
      speechService.speak(textToRead, activeLang);
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    speechService.stop();
  };

  return (
    <div className={`inline-flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg ${className}`}>
      <button
        onClick={handleToggle}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white rounded shadow-sm hover:bg-slate-50 transition-colors"
        title={t('actionListen')}
      >
        {speechState.isSpeaking && !speechState.isPaused ? (
          <>
            <Pause className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>{t('actionPauseAudio')}</span>
          </>
        ) : speechState.isPaused ? (
          <>
            <Play className="w-3.5 h-3.5 text-teal-600" />
            <span>{t('actionResumeAudio')}</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-teal-600" />
            <span>{label}</span>
          </>
        )}
      </button>

      {speechState.isSpeaking && (
        <button
          onClick={handleStop}
          className="p-1 text-slate-500 hover:text-rose-600 rounded hover:bg-slate-200/60 transition-colors"
          title={t('actionStopAudio')}
        >
          <Square className="w-3.5 h-3.5" />
        </button>
      )}

      {speechState.isSpeaking && !speechState.isPaused && (
        <span className="flex items-center gap-0.5 px-1.5 text-[10px] text-teal-600 font-medium">
          <span className="w-1 h-3 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1 h-4 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1 h-2 bg-teal-500 rounded-full animate-bounce"></span>
        </span>
      )}
    </div>
  );
};
