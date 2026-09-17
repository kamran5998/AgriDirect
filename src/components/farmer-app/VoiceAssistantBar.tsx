import React, { useState } from 'react';
import { Mic, MicOff, RefreshCw, Volume2, Sparkles, AlertCircle, Check, X } from 'lucide-react';
import { Language, TRANSLATIONS } from './types';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';

export interface VoiceAssistantBarProps {
  lang: Language;
  onTranscriptRecognized: (text: string) => void;
  placeholderPrompt?: string;
  helperExamples?: string[];
  autoApply?: boolean;
  className?: string;
  compact?: boolean;
}

export const VoiceAssistantBar: React.FC<VoiceAssistantBarProps> = ({
  lang,
  onTranscriptRecognized,
  placeholderPrompt,
  helperExamples,
  autoApply = true,
  className = '',
  compact = false,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [manualText, setManualText] = useState<string>('');

  const {
    isSupported,
    isListening,
    isProcessing,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceAssistant({
    lang,
    onResult: (finalText) => {
      setManualText(finalText);
      if (autoApply) {
        onTranscriptRecognized(finalText);
      }
    },
  });

  const activeText = interimTranscript || transcript || manualText;

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      setManualText('');
      startListening();
    }
  };

  const handleApply = () => {
    if (activeText) {
      onTranscriptRecognized(activeText);
    }
  };

  const handleClear = () => {
    resetTranscript();
    setManualText('');
  };

  // Compact Pill Variation (e.g. for tight headers or input toolbars)
  if (compact) {
    return (
      <div className={`inline-flex flex-col gap-1.5 ${className}`}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMicClick}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                : isProcessing
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            title={isListening ? t.voiceListening : t.voiceTapToSpeak}
          >
            {isListening ? (
              <>
                <MicOff className="w-3.5 h-3.5 animate-spin" />
                <span>{t.voiceListening}</span>
              </>
            ) : isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{t.voiceProcessing}</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5" />
                <span>{t.voiceTapToSpeak}</span>
              </>
            )}
          </button>

          {activeText && (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-medium max-w-xs truncate">
              <span className="font-bold text-emerald-700">🎤</span>
              <span className="truncate">{activeText}</span>
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 text-emerald-600 hover:text-emerald-900 rounded cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="text-[11px] text-amber-700 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  // Full-width Farmer Voice Card
  return (
    <div
      className={`bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs transition-all ${
        isListening
          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
          : isProcessing
          ? 'border-amber-400 bg-amber-50/20'
          : 'hover:border-slate-300'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status / Instruction Left Column */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isListening
                  ? 'bg-rose-500 animate-ping'
                  : isProcessing
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-emerald-500'
              }`}
            />
            <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider font-['Outfit',sans-serif]">
              {isListening
                ? t.voiceListening
                : isProcessing
                ? t.voiceProcessing
                : activeText
                ? t.voiceRecognizedText
                : t.speakInsteadOfTyping || 'Voice Assistant'}
            </h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase font-mono">
              {lang === 'hi' ? 'हिन्दी' : lang === 'mr' ? 'मराठी' : 'English'}
            </span>
          </div>

          <p className="text-xs text-slate-600">
            {activeText ? (
              <span className="font-bold text-slate-900 text-sm">
                "{activeText}"
              </span>
            ) : placeholderPrompt ? (
              placeholderPrompt
            ) : lang === 'hi' ? (
              'माइक दबाकर अपनी फसल, मात्रा या जिला बोलें (उदा. "गेहूं 50 क्विंटल सीहोर")'
            ) : lang === 'mr' ? (
              'माइक दाबून तुमचे पीक, प्रमाण किंवा जिल्हा सांगा (उदा. "सोयाबीन 30 क्विंटल नाशिक")'
            ) : (
              'Tap microphone and speak your crop, quantity, or query (e.g., "Wheat 50 quintals Sehore")'
            )}
          </p>
        </div>

        {/* Action Button Right Column */}
        <div className="flex items-center gap-2 shrink-0">
          {activeText && !isListening && (
            <>
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title={t.voiceClear}
              >
                <X className="w-3.5 h-3.5" />
                <span>{t.voiceClear}</span>
              </button>

              {!autoApply && (
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.voiceApplyText}</span>
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={handleMicClick}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/20 animate-pulse'
                : isProcessing
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>{t.voiceListening}</span>
              </>
            ) : isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.voiceProcessing}</span>
              </>
            ) : activeText ? (
              <>
                <Mic className="w-4 h-4" />
                <span>{t.voiceRetry}</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>{t.voiceTapToSpeak}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Helper Voice Examples Pill List */}
      {helperExamples && helperExamples.length > 0 && !activeText && !isListening && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span className="text-[11px] font-bold text-slate-400">
            {lang === 'hi' ? 'उदाहरण:' : lang === 'mr' ? 'उदा:' : 'Examples:'}
          </span>
          {helperExamples.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setManualText(ex);
                onTranscriptRecognized(ex);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-slate-700"
            >
              "{ex}"
            </button>
          ))}
        </div>
      )}

      {/* Error fallback message */}
      {error && (
        <div className="mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              {lang === 'hi'
                ? 'आप सामान्य कीबोर्ड / ड्रॉपडाउन से भी चयन कर सकते हैं।'
                : lang === 'mr'
                ? 'तुम्ही कीबोर्ड किंवा ड्रॉपडाउन वापरूनही निवड करू शकता.'
                : 'You can continue using standard keyboard and dropdown controls seamlessly.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
