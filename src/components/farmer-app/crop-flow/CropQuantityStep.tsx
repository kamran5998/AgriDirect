import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  Volume2,
} from 'lucide-react';
import { Language } from '../types';
import { parseFarmerVoiceQuery } from '../../../utils/voiceLanguageParser';

interface CropQuantityStepProps {
  quantityQuintals: number;
  cropName: string;
  lang: Language;
  onQuantityChange: (qty: number) => void;
  onBack: () => void;
  onProceedToPrice: () => void;
}

const PRESET_QUANTITIES = [10, 20, 25, 30, 40, 50, 75, 100, 150];

export const CropQuantityStep: React.FC<CropQuantityStepProps> = ({
  quantityQuintals,
  cropName,
  lang,
  onQuantityChange,
  onBack,
  onProceedToPrice,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleStartVoice = () => {
    setValidationError(null);
    setVoiceFeedback(null);

    const voicePrompt =
      lang === 'hi'
        ? 'कृपया अपनी फसल की मात्रा बोलें, जैसे "40 क्विंटल"'
        : lang === 'mr'
        ? 'कृपया प्रमाण सांगा, उदा: "४० क्विंटल"'
        : 'Please speak your quantity, for example "40 quintals"';

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(voicePrompt);
        utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis unavailable:', e);
      }
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceFeedback('Voice recognition not supported in your browser. Please type the quantity below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      setVoiceFeedback('Listening... Please speak your quantity (e.g., "40 quintal")');

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0]?.transcript || '';
        setIsListening(false);

        // Normalize devanagari numerals
        const devanagariMap: Record<string, string> = { '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9' };
        const normalizedTranscript = transcript.replace(/[०-९]/g, (d: string) => devanagariMap[d] || d);

        const parsed = parseFarmerVoiceQuery(normalizedTranscript, lang);
        if (parsed.quantity && parsed.quantity > 0) {
          onQuantityChange(parsed.quantity);
          setVoiceFeedback(`Voice recognized: "${transcript}" → ${parsed.quantity} Qtl`);
        } else {
          const qtlMatch = normalizedTranscript.match(/(\d+(?:\.\d+)?)\s*(?:quintal|quintals|qtl|qtls|क्विंटल|क्वि|बोरी|बोरे)/i) ||
                           normalizedTranscript.match(/\b(\d+(?:\.\d+)?)\b/);
          if (qtlMatch) {
            const val = parseFloat(qtlMatch[1]);
            if (val > 0) {
              onQuantityChange(val);
              setVoiceFeedback(`Voice recognized: "${transcript}" → ${val} Qtl`);
            } else {
              setVoiceFeedback(`Heard "${transcript}". Please enter a valid quantity.`);
            }
          } else {
            setVoiceFeedback(`Heard "${transcript}". Could not detect a clear number.`);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setVoiceFeedback('Could not hear clearly. Please tap presets or type quantity below.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      setVoiceFeedback('Voice input error. Please enter quantity manually.');
    }
  };

  const handleNext = () => {
    if (!quantityQuintals || isNaN(Number(quantityQuintals)) || Number(quantityQuintals) <= 0) {
      setValidationError('Please enter a valid positive quantity in quintals.');
      return;
    }
    setValidationError(null);
    onProceedToPrice();
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <Scale className="w-3.5 h-3.5 text-emerald-600" />
          <span>{lang === 'hi' ? 'चरण 5: मात्रा' : lang === 'mr' ? 'पायरी ५: प्रमाण' : 'Step 5: Quantity'}</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-['Outfit',sans-serif]">
          {lang === 'hi' ? 'मात्रा दर्ज करें' : lang === 'mr' ? 'पिकाचे प्रमाण' : 'Tell us how much you have'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          {lang === 'hi'
            ? 'बोलकर या लिखकर बताएं कि आपके पास कितनी फसल (क्विंटल) बिक्री के लिए है'
            : 'Speak or enter the total available harvest volume in Quintals (Qtl).'}
        </p>
      </div>

      {/* Validation Alert */}
      {validationError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 font-bold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Quantity Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-sm space-y-6 text-center">
        
        {/* VOICE INPUT SECTION - Large Microphone Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleStartVoice}
            className={`w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full flex flex-col items-center justify-center transition-all shadow-lg cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/50 scale-105 ring-8 ring-rose-200'
                : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-emerald-600/30 hover:scale-105'
            }`}
          >
            {isListening ? (
              <MicOff className="w-10 h-10 sm:w-12 sm:h-12" />
            ) : (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
            )}
          </button>

          <div className="space-y-0.5">
            <p className="text-sm font-black text-slate-900">
              {isListening
                ? (lang === 'hi' ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now')
                : (lang === 'hi' ? 'माइक दबाएं और बोलें' : 'Tap the mic and speak')}
            </p>
            <p className="text-xs text-emerald-700 font-semibold">
              {lang === 'hi' ? 'उदाहरण: "40 क्विंटल"' : 'Example: "40 quintal"'}
            </p>
          </div>

          {voiceFeedback && (
            <div className="p-2.5 rounded-xl bg-emerald-50 text-xs font-bold text-emerald-900 border border-emerald-200 inline-block max-w-sm">
              {voiceFeedback}
            </div>
          )}
        </div>

        {/* DIVIDER */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-xs font-bold text-slate-400 uppercase absolute">
            {lang === 'hi' ? 'या हाथ से दर्ज करें' : 'Or enter manually'}
          </span>
        </div>

        {/* MANUAL NUMERIC INPUT */}
        <div className="space-y-4 max-w-xs mx-auto">
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(5, (quantityQuintals || 0) - 5))}
              className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 flex items-center justify-center text-xl font-bold cursor-pointer transition-all shrink-0"
            >
              <Minus className="w-5 h-5" />
            </button>

            <div className="relative flex-1">
              <input
                type="number"
                min="1"
                step="1"
                value={quantityQuintals || ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onQuantityChange(isNaN(val) ? 0 : val);
                }}
                className="w-full text-center py-3 px-2 bg-slate-50 border-2 border-emerald-500 rounded-2xl text-2xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                placeholder="40"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500">
                Qtl
              </span>
            </div>

            <button
              type="button"
              onClick={() => onQuantityChange((quantityQuintals || 0) + 5)}
              className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 flex items-center justify-center text-xl font-bold cursor-pointer transition-all shrink-0"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Preset Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {PRESET_QUANTITIES.map((qty) => (
              <button
                key={qty}
                type="button"
                onClick={() => onQuantityChange(qty)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  quantityQuintals === qty
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {qty} Qtl
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'hi' ? 'पीछे' : lang === 'mr' ? 'मागे' : 'Back'}</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex-1 sm:flex-initial px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{lang === 'hi' ? 'AI मूल्य अनुमान देखें' : lang === 'mr' ? 'AI किंमत अंदाज पहा' : 'Continue to Price Estimation'}</span>
          <ArrowRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
