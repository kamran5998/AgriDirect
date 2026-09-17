import React, { useState, useEffect } from 'react';
import { Sprout, MapPin, LogOut, Bell, MessageSquare } from 'lucide-react';
import { Language } from './types';
import { FarmerProfile } from '../../types';
import { LanguageSelector } from '../common/LanguageSelector';
import { ConnectivityIndicator } from '../common/ConnectivityIndicator';
import { notificationApi } from '../../api/notificationApi';

interface FarmerHeaderProps {
  profile: FarmerProfile;
  lang: Language;
  onToggleLang?: () => void;
  onSelectLang?: (lang: Language) => void;
  onSignOut: () => void;
  onOpenAlerts?: () => void;
}

export const FarmerHeader: React.FC<FarmerHeaderProps> = ({
  profile,
  lang,
  onToggleLang,
  onSelectLang,
  onSignOut,
  onOpenAlerts,
}) => {
  const [unreadCount, setUnreadCount] = useState<number>(3);

  useEffect(() => {
    notificationApi.getNotifications().then((notifs) => {
      setUnreadCount(notifs.filter((n) => !n.isRead).length);
    }).catch(() => {});
  }, []);

  const handleSelectLang = (newLang: Language) => {
    if (onSelectLang) {
      onSelectLang(newLang);
    } else if (onToggleLang) {
      onToggleLang();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Sprout className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-['Outfit',sans-serif] truncate">
                AgriDirect <span className="text-emerald-600">Pulse</span>
              </span>
              <span className="hidden xs:inline-flex bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-emerald-200 shrink-0">
                {lang === 'mr' ? 'शेतकरी' : lang === 'hi' ? 'किसान' : 'Kisan'}
              </span>
              <span className="hidden sm:inline-flex bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-slate-200 shrink-0">
                ID: {profile.kisanId || profile.platformId || 'ADP-FMR-10001'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-500 font-medium truncate">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-[200px]">
                {profile.district}, {profile.state}
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: Connectivity Indicator, Alerts Button, Global Language Selector & Signout */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Production Offline-First Connectivity Indicator */}
          <ConnectivityIndicator lang={lang} />

          {/* Simulated SMS/WhatsApp Price & Offer Alerts Trigger */}
          {onOpenAlerts && (
            <button
              type="button"
              onClick={onOpenAlerts}
              className="relative p-2 sm:p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 font-bold text-xs transition-colors cursor-pointer"
              title="View Simulated SMS / WhatsApp Price & Offer Alerts"
            >
              <Bell className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline text-emerald-900 font-bold">Alerts</span>
              {unreadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Global 3-Language Selector: English | हिंदी | मराठी */}
          <LanguageSelector
            currentLang={lang}
            onSelectLang={handleSelectLang}
            showIcon={true}
          />

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={onSignOut}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer border border-slate-200 shrink-0"
            title={lang === 'mr' ? 'बाहेर पडा' : lang === 'hi' ? 'लॉग आउट' : 'Sign Out'}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
