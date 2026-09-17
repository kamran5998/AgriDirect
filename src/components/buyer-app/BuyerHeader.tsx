import React from 'react';
import { Building2, ShieldCheck, Bell, LogOut, ArrowLeftRight } from 'lucide-react';
import { Language } from '../farmer-app/types';
import { BuyerCompanyProfile, BUYER_TRANSLATIONS, BuyerTab } from './types';
import { LanguageSelector } from '../common/LanguageSelector';

interface BuyerHeaderProps {
  profile: BuyerCompanyProfile;
  lang: Language;
  unreadNotifsCount: number;
  activeTab: BuyerTab;
  onSelectTab: (tab: BuyerTab) => void;
  onToggleLang: () => void;
  onSelectLang?: (lang: Language) => void;
  onSwitchToFarmer: () => void;
  onSignOut: () => void;
}

export const BuyerHeader: React.FC<BuyerHeaderProps> = ({
  profile,
  lang,
  unreadNotifsCount,
  activeTab,
  onSelectTab,
  onToggleLang,
  onSelectLang,
  onSwitchToFarmer,
  onSignOut,
}) => {
  const t = BUYER_TRANSLATIONS[lang] || BUYER_TRANSLATIONS.en;

  const handleSelectLang = (newLang: Language) => {
    if (onSelectLang) {
      onSelectLang(newLang);
    } else {
      onToggleLang();
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Brand & Buyer Identity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-700 to-blue-900 flex items-center justify-center text-white shadow-xs font-black text-lg">
                <Building2 className="w-5 h-5 text-indigo-200" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                    {profile.businessName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    <span>{t.verifiedBadge || 'KYC Verified'}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium flex-wrap">
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 text-[10px]">
                    ID: {profile.buyerId || profile.platformId || 'ADP-BYR-20001'}
                  </span>
                  <span>•</span>
                  <span>{profile.category}</span>
                  <span>•</span>
                  <span>GSTIN: {profile.gstin}</span>
                  <span>•</span>
                  <span className="text-slate-600">{profile.location}</span>
                </div>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                type="button"
                onClick={() => onSelectTab('notifications')}
                className={`relative p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors ${
                  activeTab === 'notifications' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : ''
                }`}
                title={t.notifications}
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              <LanguageSelector
                currentLang={lang}
                onSelectLang={handleSelectLang}
                compact={true}
                showIcon={false}
              />
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Notification Bell Button */}
            <button
              type="button"
              onClick={() => onSelectTab('notifications')}
              className={`relative px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bell className="w-4 h-4 text-indigo-600" />
              <span>{t.notifications}</span>
              {unreadNotifsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Global Language Switcher */}
            <LanguageSelector
              currentLang={lang}
              onSelectLang={handleSelectLang}
              showIcon={true}
            />

            {/* Switch Role Button */}
            <button
              type="button"
              onClick={onSwitchToFarmer}
              className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title={t.switchToFarmer}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.switchToFarmer}</span>
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={onSignOut}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title={t.signOut}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
