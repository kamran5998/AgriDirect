import React from 'react';
import { Globe } from 'lucide-react';
import { Language } from '../farmer-app/types';

export interface LanguageSelectorProps {
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  className?: string;
  compact?: boolean;
  variant?: 'light' | 'dark' | 'emerald' | 'subtle';
  showIcon?: boolean;
}

export const LANGUAGE_OPTIONS: { id: Language; label: string; nativeLabel: string; code: string }[] = [
  { id: 'en', label: 'English', nativeLabel: 'English', code: 'EN' },
  { id: 'hi', label: 'Hindi', nativeLabel: 'हिंदी', code: 'HI' },
  { id: 'mr', label: 'Marathi', nativeLabel: 'मराठी', code: 'MR' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLang,
  onSelectLang,
  className = '',
  compact = false,
  variant = 'light',
  showIcon = true,
}) => {
  return (
    <div
      className={`inline-flex items-center rounded-2xl p-1 transition-all ${
        variant === 'dark'
          ? 'bg-slate-900/90 border border-slate-800 shadow-xs'
          : variant === 'emerald'
          ? 'bg-emerald-950/40 border border-emerald-500/30'
          : variant === 'subtle'
          ? 'bg-slate-100/80 border border-slate-200/80'
          : 'bg-white border border-slate-200/90 shadow-xs'
      } ${className}`}
      role="group"
      aria-label="Language selector / भाषा चुनें / भाषा निवडा"
    >
      {showIcon && !compact && (
        <div className="pl-2 pr-1.5 flex items-center text-slate-400">
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
        </div>
      )}

      <div className="flex items-center gap-1">
        {LANGUAGE_OPTIONS.map((opt) => {
          const isActive = currentLang === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectLang(opt.id)}
              className={`relative px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl font-bold transition-all cursor-pointer select-none text-xs ${
                compact ? 'text-[11px] px-2 py-0.5' : 'text-xs'
              } ${
                isActive
                  ? variant === 'dark'
                    ? 'bg-purple-600 text-white shadow-xs font-black'
                    : 'bg-emerald-600 text-white shadow-xs font-black ring-1 ring-emerald-700/20'
                  : variant === 'dark'
                  ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
              }`}
              title={`${opt.label} (${opt.nativeLabel})`}
              aria-pressed={isActive}
            >
              <span className="font-['Plus_Jakarta_Sans',sans-serif]">
                {compact ? opt.code : opt.nativeLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
