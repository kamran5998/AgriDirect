import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Building2,
  Bell,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../common/Badge';

export interface MarketAlertItem {
  id: string;
  type: 'increase' | 'decrease' | 'demand' | 'update';
  title: string;
  description: string;
  mandi: string;
  timeAgo: string;
  actionText: string;
  isRead?: boolean;
}

const SAMPLE_ALERTS: MarketAlertItem[] = [
  {
    id: 'alt-1',
    type: 'increase',
    title: 'Wheat Spot Rate Surge (+3.2%)',
    description: 'Sharbati Wheat at Sehore APMC crossed ₹2,860/q resistance on heavy flour miller procurement.',
    mandi: 'Sehore APMC Mandi',
    timeAgo: '18 mins ago',
    actionText: 'View Order Depth',
  },
  {
    id: 'alt-2',
    type: 'demand',
    title: 'New Institutional Purchase Tender',
    description: 'ITC e-Choupal placed a verified procurement contract for 200q Soybean at ₹4,740/q with 24h bank settlement.',
    mandi: 'Dewas Logistics Hub',
    timeAgo: '45 mins ago',
    actionText: 'Review Contract Offer',
  },
  {
    id: 'alt-3',
    type: 'update',
    title: 'Mandi Auction Schedule Notification',
    description: 'Khanna and Patiala Grain Mandis will commence electronic weighbridge auctions at 9:30 AM today.',
    mandi: 'Khanna Grain Market',
    timeAgo: '2 hours ago',
    actionText: 'View Mandi Notice',
  },
  {
    id: 'alt-4',
    type: 'decrease',
    title: 'Tomato Spot Rate Correction (-4.8%)',
    description: 'Heavy sudden arrivals (14,000+ crates) in Kolar yard led to spot price softening to ₹1,420/q.',
    mandi: 'Kolar APMC Yard',
    timeAgo: '3 hours ago',
    actionText: 'Check Regional Demand',
  },
];

interface MarketAlertsListProps {
  onAlertAction?: (alert: MarketAlertItem) => void;
}

export const MarketAlertsList: React.FC<MarketAlertsListProps> = ({
  onAlertAction,
}) => {
  const [filter, setFilter] = useState<'all' | 'increase' | 'demand' | 'update'>('all');
  const [alerts, setAlerts] = useState<MarketAlertItem[]>(SAMPLE_ALERTS);

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter((a) => a.type === filter);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
      
      {/* Header & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Mandi Feed
            </span>
            <Badge variant="emerald" size="sm">
              Real-Time Push
            </Badge>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1 font-['Outfit',sans-serif]">
            Market Intelligence Alerts
          </h3>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(['all', 'increase', 'demand', 'update'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                filter === cat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat === 'all' ? 'All Alerts' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              alert.type === 'increase'
                ? 'bg-emerald-50/50 border-emerald-200/80 hover:bg-emerald-50'
                : alert.type === 'demand'
                ? 'bg-purple-50/50 border-purple-200/80 hover:bg-purple-50'
                : alert.type === 'decrease'
                ? 'bg-amber-50/50 border-amber-200/80 hover:bg-amber-50'
                : 'bg-blue-50/50 border-blue-200/80 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Icon Box */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  alert.type === 'increase'
                    ? 'bg-emerald-100 text-emerald-700'
                    : alert.type === 'demand'
                    ? 'bg-purple-100 text-purple-700'
                    : alert.type === 'decrease'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {alert.type === 'increase' && <TrendingUp className="w-4 h-4" />}
                {alert.type === 'demand' && <Sparkles className="w-4 h-4" />}
                {alert.type === 'decrease' && <TrendingDown className="w-4 h-4" />}
                {alert.type === 'update' && <Building2 className="w-4 h-4" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{alert.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">• {alert.timeAgo}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{alert.description}</p>
                <div className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span>{alert.mandi}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onAlertAction && onAlertAction(alert)}
              className="text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1 shrink-0 self-end sm:self-center px-3 py-1.5 bg-white rounded-lg border border-slate-200 hover:border-slate-300 shadow-2xs cursor-pointer transition-colors"
            >
              <span>{alert.actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
