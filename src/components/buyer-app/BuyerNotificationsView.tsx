import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Sprout,
  FileCheck,
  TrendingUp,
  Clock,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { Language } from '../farmer-app/types';
import { BUYER_TRANSLATIONS, BuyerTab } from './types';

export interface BuyerNotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'trade' | 'lot' | 'price' | 'system';
  isRead: boolean;
  actionTab?: BuyerTab;
}

interface BuyerNotificationsViewProps {
  lang: Language;
  notifications: BuyerNotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigateTab: (tab: BuyerTab) => void;
}

export const BuyerNotificationsView: React.FC<BuyerNotificationsViewProps> = ({
  lang,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigateTab,
}) => {
  const t = BUYER_TRANSLATIONS[lang] || BUYER_TRANSLATIONS.en;

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black">
              <Bell className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-['Outfit',sans-serif]">
              {t.notifications} & Real-Time Procurement Alerts
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Stay updated with farmer counter-offers, trade confirmations, new lot arrivals, and gate pass issuances.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'unread' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unread ({notifications.filter((n) => !n.isRead).length})
            </button>
          </div>

          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="px-3.5 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Notifications Feed */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="text-sm font-bold text-slate-700">No alerts at this moment</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You're all caught up! You will be notified when farmers accept your offers or post matching crop lots.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onMarkAsRead(item.id);
                if (item.actionTab) {
                  onNavigateTab(item.actionTab);
                }
              }}
              className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !item.isRead
                  ? 'bg-indigo-50/40 border-indigo-200 shadow-2xs hover:border-indigo-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.type === 'trade'
                      ? 'bg-emerald-100 text-emerald-700'
                      : item.type === 'lot'
                      ? 'bg-blue-100 text-blue-700'
                      : item.type === 'price'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.type === 'trade' && <CheckCircle2 className="w-5 h-5" />}
                  {item.type === 'lot' && <Sprout className="w-5 h-5" />}
                  {item.type === 'price' && <TrendingUp className="w-5 h-5" />}
                  {item.type === 'system' && <FileCheck className="w-5 h-5" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900 font-['Outfit',sans-serif]">
                      {item.title}
                    </h4>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{item.timestamp}</span>
                    {item.actionTab && (
                      <span className="text-indigo-600 font-bold hover:underline">
                        • Tap to view
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!item.isRead && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(item.id);
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 p-1 shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
