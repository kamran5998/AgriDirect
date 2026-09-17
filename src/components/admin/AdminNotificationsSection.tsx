import React, { useState, useEffect } from 'react';
import {
  Bell,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Clock,
} from 'lucide-react';
import { adminApi, AdminNotificationItem } from '../../api/adminApi';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface AdminNotificationsSectionProps {
  onShowToast?: (msg: string) => void;
}

export const AdminNotificationsSection: React.FC<AdminNotificationsSectionProps> = ({ onShowToast }) => {
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (typeFilter === 'all') return true;
    return n.type === typeFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'price_alert':
        return <TrendingUp className="w-4 h-4 text-amber-600" />;
      case 'offer_accepted':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'kyc_update':
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      case 'buyer_request':
        return <FileText className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'price_alert':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Price Surge Alert</span>;
      case 'offer_accepted':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Trade Settled</span>;
      case 'kyc_update':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">KYC Status</span>;
      case 'buyer_request':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Buyer Tender</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">System Notice</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" size="sm">System Audit & Telemetry</Badge>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif] tracking-tight mt-1">
            Platform Notifications & Alerts Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit stream of price volatility spikes, contract agreements, counter-offers, and automated escrow logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            className="font-bold text-xs"
          >
            Refresh Feed
          </Button>
          <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-center min-w-[120px]">
            <span className="text-[10px] font-bold text-purple-800 uppercase block">Events Logged</span>
            <span className="text-lg font-black text-purple-950 font-mono">{notifications.length} Events</span>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['all', 'price_alert', 'offer_accepted', 'buyer_request', 'system_notice'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                typeFilter === t
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'all' ? 'All Alerts' : t.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
            Loading alert log stream...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            No notification records found in this category.
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div key={n.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                {getTypeIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {getTypeBadge(n.type)}
                  <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono ml-auto">
                    {n.created_at ? new Date(n.created_at).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : ''}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {n.message}
                </p>

                <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    Recipient: <strong className="text-slate-700">{n.user_name} (ID #{n.user_id})</strong>
                  </span>
                  <span>•</span>
                  <span className={n.is_read ? 'text-slate-400' : 'text-purple-600 font-bold'}>
                    {n.is_read ? 'Acknowledged' : 'Unread'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
