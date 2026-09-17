import React from 'react';
import { LayoutDashboard, FileText, Sprout, SendHorizontal, Bell, PackageCheck } from 'lucide-react';
import { Language } from '../farmer-app/types';
import { BuyerTab, BUYER_TRANSLATIONS } from './types';

interface BuyerNavProps {
  activeTab: BuyerTab;
  onSelectTab: (tab: BuyerTab) => void;
  lang: Language;
  requirementsCount?: number;
  listingsCount?: number;
  requestsCount?: number;
  ordersCount?: number;
  unreadNotifsCount?: number;
}

export const BuyerNav: React.FC<BuyerNavProps> = ({
  activeTab,
  onSelectTab,
  lang,
  requirementsCount = 0,
  listingsCount = 0,
  requestsCount = 0,
  ordersCount = 0,
  unreadNotifsCount = 0,
}) => {
  const t = BUYER_TRANSLATIONS[lang] || BUYER_TRANSLATIONS.en;

  const ordersLabel = lang === 'hi' ? 'मेरे ऑर्डर्स' : lang === 'mr' ? 'माझे ऑर्डर्स' : 'My Orders';

  const NAV_ITEMS: { id: BuyerTab; label: string; icon: React.FC<{ className?: string }>; count?: number }[] = [
    {
      id: 'dashboard',
      label: t.dashboard,
      icon: LayoutDashboard,
    },
    {
      id: 'orders',
      label: ordersLabel,
      icon: PackageCheck,
      count: ordersCount,
    },
    {
      id: 'requirements',
      label: t.requirements,
      icon: FileText,
      count: requirementsCount,
    },
    {
      id: 'listings',
      label: t.farmerListings,
      icon: Sprout,
      count: listingsCount,
    },
    {
      id: 'requests',
      label: t.sentRequests,
      icon: SendHorizontal,
      count: requestsCount,
    },
    {
      id: 'notifications',
      label: t.notifications,
      icon: Bell,
      count: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer font-['Outfit',sans-serif] ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? item.id === 'notifications'
                          ? 'bg-rose-500 text-white'
                          : 'bg-white/20 text-white'
                        : item.id === 'notifications'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
