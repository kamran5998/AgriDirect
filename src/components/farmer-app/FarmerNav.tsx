import React from 'react';
import { Sparkles, Store, Building2, Wheat, PackageCheck } from 'lucide-react';
import { FarmerTab, Language, TRANSLATIONS } from './types';

interface FarmerNavProps {
  activeTab: FarmerTab;
  onSelectTab: (tab: FarmerTab) => void;
  lang: Language;
}

export const FarmerNav: React.FC<FarmerNavProps> = ({
  activeTab,
  onSelectTab,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  const navItems = [
    {
      id: 'advisor' as FarmerTab,
      label: t.advisorTab,
      sublabel: 'When & Where',
      icon: Sparkles,
      color: 'emerald',
    },
    {
      id: 'markets' as FarmerTab,
      label: t.marketsTab,
      sublabel: 'Nearby Mandis',
      icon: Store,
      color: 'emerald',
    },
    {
      id: 'buyers' as FarmerTab,
      label: t.buyersTab,
      sublabel: 'Direct Buyers',
      icon: Building2,
      color: 'emerald',
    },
    {
      id: 'my-crops' as FarmerTab,
      label: t.myCropsTab,
      sublabel: 'My Harvest',
      icon: Wheat,
      color: 'emerald',
    },
    {
      id: 'orders' as FarmerTab,
      label: t.ordersTab,
      sublabel: 'Live Lifecycle',
      icon: PackageCheck,
      color: 'emerald',
    },
  ];

  return (
    <>
      {/* 1. Desktop Tab Nav Bar (Top Sub-Header) */}
      <div className="hidden sm:block bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex-1 py-3.5 px-3 flex items-center justify-center gap-2.5 font-bold text-sm transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Mobile Bottom Navigation Bar (Fixed bottom for one-thumb reachability) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-2 safe-area-pb">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all cursor-pointer min-w-[72px] ${
                  isActive
                    ? 'text-emerald-700 font-bold bg-emerald-50'
                    : 'text-slate-500 font-medium hover:text-slate-900'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 stroke-[2.5]' : 'text-slate-400'}`} />
                  {isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                  )}
                </div>
                <span className="text-[11px] mt-1 tracking-tight leading-none whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
