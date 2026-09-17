/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ConnectivityIndicator Component
 * Compact non-intrusive status pill in header with interactive diagnostics modal.
 */

import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  CloudUpload,
  CheckCircle2,
  AlertTriangle,
  X,
  Radio,
  Clock,
} from 'lucide-react';
import { useConnectivity } from '../../context/ConnectivityContext';
import { Language, TRANSLATIONS } from '../farmer-app/types';
import { offlineStorage } from '../../services/offlineStorageService';

interface ConnectivityIndicatorProps {
  lang: Language;
}

export const ConnectivityIndicator: React.FC<ConnectivityIndicatorProps> = ({ lang }) => {
  const {
    status,
    isOnline,
    isOffline,
    isSyncing,
    isReconnecting,
    pendingSyncCount,
    lastOnlineTimestamp,
    lastSyncTimestamp,
    triggerSync,
    cacheMetadata,
  } = useConnectivity();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Status configuration
  const getStatusConfig = () => {
    switch (status) {
      case 'ONLINE':
        return {
          label: t.onlineStatus,
          pillClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
          dotClass: 'bg-emerald-600',
          icon: <Wifi className="w-3.5 h-3.5 text-emerald-700" />,
        };
      case 'SYNCING':
        return {
          label: t.syncingStatus,
          pillClass: 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 animate-pulse',
          dotClass: 'bg-amber-500 animate-ping',
          icon: <RefreshCw className="w-3.5 h-3.5 text-amber-700 animate-spin" />,
        };
      case 'RECONNECTING':
        return {
          label: t.reconnectingStatus,
          pillClass: 'bg-sky-50 text-sky-900 border-sky-300 hover:bg-sky-100',
          dotClass: 'bg-sky-500 animate-bounce',
          icon: <Radio className="w-3.5 h-3.5 text-sky-700" />,
        };
      case 'OFFLINE':
      default:
        return {
          label: t.offlineStatus,
          pillClass: 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100',
          dotClass: 'bg-rose-600',
          icon: <WifiOff className="w-3.5 h-3.5 text-rose-700" />,
        };
    }
  };

  const config = getStatusConfig();

  const cacheEntriesList = [
    { key: 'comprehensive_market_prices', name: lang === 'hi' ? 'मंडी भाव रिकॉर्ड' : lang === 'mr' ? 'बाजार भाव नोंदी' : 'Mandi Price Records' },
    { key: 'mandi_directory', name: lang === 'hi' ? 'मंडी यार्ड सूची' : lang === 'mr' ? 'बाजार यार्ड यादी' : 'APMC Mandi Directory' },
    { key: 'verified_buyers_list', name: lang === 'hi' ? 'प्रमाणित खरीदार डायरेक्टरी' : lang === 'mr' ? 'नोंदणीकृत खरेदीदार' : 'Verified Buyer Directory' },
    { key: 'farmer_my_listings', name: lang === 'hi' ? 'मेरी फसल लिस्टिंग' : lang === 'mr' ? 'माझी पीक नोंदणी' : 'My Crop Listings' },
    { key: 'user_notifications', name: lang === 'hi' ? 'अलर्ट एवं सूचनाएं' : lang === 'mr' ? 'अलर्ट व सूचना' : 'Price Alerts & Notifs' },
  ];

  return (
    <>
      {/* Compact Header Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer shadow-2xs ${config.pillClass}`}
        title="Check Connectivity & Offline Cache Status"
      >
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotClass}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotClass}`} />
        </span>
        <span className="hidden sm:inline truncate">{config.label}</span>
        {pendingSyncCount > 0 && (
          <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[10px] font-black" title={`${pendingSyncCount} ${t.pendingSyncBadge}`}>
            {pendingSyncCount}
          </span>
        )}
      </button>

      {/* Diagnostics & Offline Storage Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isOnline ? 'bg-emerald-100 text-emerald-800' : isSyncing ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {config.icon}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                    {t.connectionHealthTitle}
                  </h3>
                  <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                    <span>{status === 'ONLINE' ? '🟢' : status === 'SYNCING' ? '🟠' : '🔴'}</span>
                    <span>{config.label}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Summary Box */}
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              isOnline
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : isSyncing
                ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                : 'bg-rose-50/80 border-rose-200 text-rose-950'
            }`}>
              <div className="font-black flex items-center justify-between">
                <span>
                  {isOnline
                    ? (lang === 'hi' ? 'सक्रिय इंटरनेट कनेक्टेड' : lang === 'mr' ? 'सक्रिय इंटरनेट सुरू आहे' : 'Active Internet Connected')
                    : (lang === 'hi' ? 'ऑफ़लाइन मोड सक्रिय' : lang === 'mr' ? 'ऑफलाइन मोड सुरू आहे' : 'Offline Mode Active')}
                </span>
                <span className="text-[11px] opacity-80">
                  {isOnline ? 'Real-time Live API' : 'IndexedDB Local Cache'}
                </span>
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">
                {isOnline
                  ? (lang === 'hi'
                      ? 'मंडी भाव, AI विश्लेषण और खरीदार सीधे लाइव सर्वर से अपडेट हो रहे हैं।'
                      : lang === 'mr'
                      ? 'बाजार भाव, AI सल्ला आणि खरेदीदार थेट लाइव्ह सर्व्हरवरून अपडेट होत आहेत.'
                      : 'Mandi prices, buyer requirements, and AI forecasts are streaming live from central server.')
                  : t.offlineModeSubtext}
              </p>
            </div>

            {/* Offline Queue State */}
            {pendingSyncCount > 0 && (
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CloudUpload className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="font-extrabold block">
                      {pendingSyncCount} {t.pendingSyncBadge}
                    </span>
                    <span className="text-[10px] text-amber-800">
                      {lang === 'hi' ? 'इंटरनेट मिलते ही स्वतः सर्वर पर जाएंगे' : lang === 'mr' ? 'इंटरनेट येताच सर्व्हरवर पाठवले जातील' : 'Will sync automatically on connection'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* IndexedDB Cache Storage Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.savedDataAvailable} (IndexedDB)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {t.lastSyncedLabel}: {offlineStorage.formatLastSynced(lastSyncTimestamp, lang)}
                </span>
              </div>

              <div className="divide-y divide-slate-100 bg-slate-50 rounded-2xl border border-slate-200 text-xs overflow-hidden">
                {cacheEntriesList.map((entry) => {
                  const meta = cacheMetadata[entry.key];
                  const hasCached = !!meta;
                  const timeAgo = hasCached ? offlineStorage.formatLastSynced(meta.lastUpdated, lang) : null;

                  return (
                    <div key={entry.key} className="p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {hasCached ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className="font-bold text-slate-800">{entry.name}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {hasCached ? timeAgo : (lang === 'hi' ? 'सहेजा नहीं' : lang === 'mr' ? 'साठवलेले नाही' : 'Not cached')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                {lang === 'hi' ? 'बंद करें' : lang === 'mr' ? 'बंद करा' : 'Close'}
              </button>

              <button
                type="button"
                onClick={() => triggerSync()}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? t.syncingStatus : t.syncNowButton}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
