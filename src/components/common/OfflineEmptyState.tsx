/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * OfflineEmptyState Component
 * Displays a friendly, helpful localized empty state when internet is unavailable
 * and no cached records exist in local IndexedDB storage.
 */

import React from 'react';
import { WifiOff, RefreshCw, Smartphone, HardDriveDownload } from 'lucide-react';
import { Language, TRANSLATIONS } from '../farmer-app/types';

interface OfflineEmptyStateProps {
  lang: Language;
  title?: string;
  description?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export const OfflineEmptyState: React.FC<OfflineEmptyStateProps> = ({
  lang,
  title,
  description,
  onRetry,
  isRetrying = false,
  className = '',
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const displayTitle = title || t.noSavedDataTitle;
  const displayDesc = description || t.noSavedDataDesc;

  return (
    <div
      className={`bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 text-center max-w-lg mx-auto shadow-xs space-y-5 my-6 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
        <WifiOff className="w-8 h-8 stroke-[1.75]" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg sm:text-xl font-black text-slate-950 font-['Outfit',sans-serif]">
          {displayTitle}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
          {displayDesc}
        </p>
      </div>

      {/* Helpful rural low-connectivity tip */}
      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-left text-xs text-slate-600 flex items-start gap-2.5">
        <Smartphone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-black text-slate-900 block mb-0.5">
            {lang === 'hi'
              ? 'ऑफ़लाइन सुझाव (Offline Tip)'
              : lang === 'mr'
              ? 'ऑफलाइन टीप (Offline Tip)'
              : 'Offline Tip'}
          </span>
          <span className="text-[11px] text-slate-500">
            {lang === 'hi'
              ? 'जब भी इंटरनेट मिले, ऐप एक बार खोलें। मंडी भाव व खरीदार स्वतः फ़ोन में सुरक्षित हो जाएंगे।'
              : lang === 'mr'
              ? 'इंटरनेट उपलब्ध असताना एकदा अ‍ॅप उघडा. बाजार भाव व खरेदीदार फोनमध्ये आपोआप सेव्ह होतील.'
              : 'Whenever connectivity is available, opening the app will automatically cache mandi rates and buyers for offline access.'}
          </span>
        </div>
      </div>

      {onRetry && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-black transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? (t.syncingStatus || 'Checking...') : (t.retryButton || 'Try Connecting Again')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
