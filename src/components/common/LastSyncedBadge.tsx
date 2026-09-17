/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Reusable LastSyncedBadge Component
 * Shows timestamp of cached data when offline or viewing non-realtime datasets.
 */

import React from 'react';
import { Database, Clock, WifiOff, RefreshCw } from 'lucide-react';
import { Language, TRANSLATIONS } from '../farmer-app/types';
import { offlineStorage } from '../../services/offlineStorageService';

interface LastSyncedBadgeProps {
  timestamp: number | null | undefined;
  lang: Language;
  source?: 'server_live' | 'local_seed' | 'user_draft' | 'fallback' | string;
  isOffline?: boolean;
  onRefresh?: () => void;
  className?: string;
  compact?: boolean;
}

export const LastSyncedBadge: React.FC<LastSyncedBadgeProps> = ({
  timestamp,
  lang,
  source = 'server_live',
  isOffline = false,
  onRefresh,
  className = '',
  compact = false,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const timeFormatted = offlineStorage.formatLastSynced(timestamp, lang);

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
          isOffline
            ? 'bg-amber-100/90 text-amber-900 border border-amber-300'
            : 'bg-slate-100 text-slate-600 border border-slate-200'
        } ${className}`}
        title={`${t.lastSyncedLabel}: ${timeFormatted} (${source})`}
      >
        {isOffline ? <WifiOff className="w-3 h-3 text-amber-700" /> : <Clock className="w-3 h-3 text-slate-500" />}
        <span>{t.lastSyncedLabel}: {timeFormatted}</span>
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold ${
        isOffline
          ? 'bg-amber-50 text-amber-900 border border-amber-200'
          : 'bg-slate-50 text-slate-700 border border-slate-200'
      } ${className}`}
    >
      <div className="flex items-center gap-1 text-[11px] font-bold">
        {isOffline ? (
          <Database className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        ) : (
          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        )}
        <span className="text-slate-500">{t.lastSyncedLabel}:</span>
        <span className="font-extrabold text-slate-900">{timeFormatted}</span>
      </div>

      {isOffline && (
        <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.2 rounded">
          {lang === 'hi' ? 'कैश्ड' : lang === 'mr' ? 'साठवलेला' : 'Cached'}
        </span>
      )}

      {onRefresh && !isOffline && (
        <button
          type="button"
          onClick={onRefresh}
          className="ml-1 p-0.5 text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
