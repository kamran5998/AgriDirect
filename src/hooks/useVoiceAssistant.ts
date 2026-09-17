import { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from '../components/farmer-app/types';

export interface VoiceAssistantHookOptions {
  lang: Language;
  onResult?: (transcript: string) => void;
  continuous?: boolean;
}

export interface VoiceAssistantState {
  isSupported: boolean;
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  speakText: (text: string, onEnd?: () => void) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

// BCP 47 Language mapping
export const VOICE_LANGUAGE_CODES: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
};

export function useVoiceAssistant({
  lang,
  onResult,
  continuous = false,
}: VoiceAssistantHookOptions): VoiceAssistantState {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  // Check support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(Boolean(SpeechRecognition));
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore error when already stopped
      }
      setIsListening(false);
      setIsProcessing(false);
    }
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');
    setInterimTranscript('');

    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        lang === 'hi'
          ? 'इस ब्राउज़र में वॉइस रिकग्निशन समर्थित नहीं है।'
          : lang === 'mr'
          ? 'या ब्राउझरमध्ये व्हॉइस ओळख उपलब्ध नाही.'
          : 'Speech recognition is not supported in this browser. Please type directly.'
      );
      return;
    }

    try {
      // Abort any existing recognition instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = VOICE_LANGUAGE_CODES[lang] || 'en-IN';
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setIsProcessing(false);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        setIsProcessing(true);
        let finalStr = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalStr += res[0].transcript;
          } else {
            interimStr += res[0].transcript;
          }
        }

        if (interimStr) {
          setInterimTranscript(interimStr);
        }

        if (finalStr) {
          const cleaned = finalStr.trim();
          setTranscript(cleaned);
          setInterimTranscript('');
          setIsProcessing(false);
          if (onResultRef.current) {
            onResultRef.current(cleaned);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setIsProcessing(false);

        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setError(
            lang === 'hi'
              ? 'माइक्रोफोन अनुमति अस्वीकृत है। कृपया ब्राउज़र सेटिंग्स में माइक अनुमति दें।'
              : lang === 'mr'
              ? 'मायक्रोफोन परवानगी नाकारली आहे. कृपया ब्राउझरमध्ये परवानगी द्या.'
              : 'Microphone permission denied. Please allow microphone access or type directly.'
          );
        } else if (event.error === 'no-speech') {
          setError(
            lang === 'hi'
              ? 'कोई आवाज़ सुनाई नहीं दी। पुनः प्रयास करें।'
              : lang === 'mr'
              ? 'कोणताही आवाज ऐकू आला नाही. पुन्हा प्रयत्न करा.'
              : 'No speech detected. Please tap and speak again.'
          );
        } else if (event.error === 'network') {
          setError(
            lang === 'hi'
              ? 'नेटवर्क समस्या। कृपया सीधे टाइप करें।'
              : lang === 'mr'
              ? 'नेटवर्क समस्या. कृपया थेट टाइप करा.'
              : 'Network issue during voice recognition. You can continue typing.'
          );
        } else {
          setError(
            lang === 'hi'
              ? 'वॉइस सेवा में समस्या। कृपया टाइप करें।'
              : lang === 'mr'
              ? 'व्हॉइस सेवेमध्ये अडचण. कृपया टाइप करा.'
              : `Voice error (${event.error}). Please type directly.`
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setIsProcessing(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
      setIsProcessing(false);
      setError(
        lang === 'hi'
          ? 'माइक शुरू नहीं हो सका। कृपया सीधे टाइप करें।'
          : lang === 'mr'
          ? 'माइक सुरू करता आला नाही. कृपया थेट टाइप करा.'
          : 'Could not start voice recognition. Please continue typing.'
      );
    }
  }, [lang, continuous]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  // Text to Speech Helper
  const speakText = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = VOICE_LANGUAGE_CODES[lang] || 'en-IN';
      utterance.rate = 0.95;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [lang]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isSupported,
    isListening,
    isProcessing,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    speakText,
    stopSpeaking,
    isSpeaking,
  };
}
