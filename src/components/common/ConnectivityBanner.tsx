/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ConnectivityBanner Component
 * Non-intrusive banner informing the farmer when in Offline Mode, Reconnecting,
 * or Syncing queued actions.
 */

import React, { useState } from 'react';
import { WifiOff, RefreshCw, Radio, CheckCircle2, X, Database } from 'lucide-react';
import { useConnectivity } from '../../context/ConnectivityContext';
import { Language, TRANSLATIONS } from '../farmer-app/types';
import { offlineStorage } from '../../services/offlineStorageService';

interface ConnectivityBannerProps {
  lang: Language;
  className?: string;
}

export const ConnectivityBanner: React.FC<ConnectivityBannerProps> = ({ lang, className = '' }) => {
  const { status, isOffline, isSyncing, isReconnecting, pendingSyncCount, lastSyncTimestamp, triggerSync } = useConnectivity();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Don't render banner if online and no pending sync items
  if (status === 'ONLINE' && pendingSyncCount === 0) {
    return null;
  }

  if (isDismissed && status !== 'OFFLINE') {
    return null;
  }

  return (
    <div
      className={`rounded-2xl p-3 sm:p-3.5 border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs ${
        isOffline
          ? 'bg-rose-50 border-rose-200 text-rose-950'
          : isSyncing
          ? 'bg-amber-50 border-amber-200 text-amber-950'
          : 'bg-sky-50 border-sky-200 text-sky-950'
      } ${className}`}
    >
      <div className="flex items-start sm:items-center gap-2.5 min-w-0">
        <div className={`p-1.5 rounded-xl shrink-0 ${
          isOffline ? 'bg-rose-100 text-rose-700' : isSyncing ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
        }`}>
          {isOffline ? (
            <WifiOff className="w-4 h-4" />
          ) : isSyncing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Radio className="w-4 h-4 animate-pulse" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black text-slate-900 font-['Outfit',sans-serif]">
              {isOffline
                ? t.offlineModeBanner
                : isSyncing
                ? t.syncingStatus
                : t.reconnectingStatus}
            </span>

            {isOffline && lastSyncTimestamp && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-md border border-rose-200">
                <Database className="w-3 h-3 text-slate-400" />
                <span>{t.lastSyncedLabel}: {offlineStorage.formatLastSynced(lastSyncTimestamp, lang)}</span>
              </span>
            )}

            {pendingSyncCount > 0 && (
              <span className="text-[10px] font-extrabold bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-md">
                {pendingSyncCount} {t.pendingSyncBadge}
              </span>
            )}
          </div>

          <p className="text-[11px] opacity-85 leading-snug mt-0.5">
            {isOffline
              ? t.offlineModeSubtext
              : isSyncing
              ? (lang === 'hi' ? 'ताजा मंडी भाव और खरीदार जानकारी सिंक की जा रही है...' : lang === 'mr' ? 'नवीन बाजार भाव व खरेदीदार माहिती सिंक होत आहे...' : 'Synchronizing latest mandi rates and queued transactions...')
              : (lang === 'hi' ? 'इंटरनेट कनेक्शन जांचा जा रहा है...' : lang === 'mr' ? 'इंटरनेट जोडणी तपासली जात आहे...' : 'Verifying internet reachability...')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          type="button"
          onClick={() => triggerSync()}
          disabled={isSyncing}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-extrabold text-xs transition-all cursor-pointer shadow-2xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 text-emerald-700 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? t.syncingStatus : t.syncNowButton}</span>
        </button>

        {!isOffline && (
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
