import React from 'react';
import {
  Users,
  Building,
  Store,
  Sprout,
  FileText,
  TrendingUp,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Layers,
  Database,
  BarChart3,
} from 'lucide-react';
import { ADMIN_KPIS, AdminKPIs } from '../../data/adminData';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface AdminOverviewSectionProps {
  onNavigateToTab: (tabId: string) => void;
  onRefreshData?: () => void;
}

export const AdminOverviewSection: React.FC<AdminOverviewSectionProps> = ({
  onNavigateToTab,
  onRefreshData,
}) => {
  const kpis = ADMIN_KPIS;

  const cards = [
    {
      id: 'total-farmers',
      title: 'Total Registered Farmers',
      value: kpis.totalFarmers.toLocaleString(),
      subtext: '+1,420 new this week',
      delta: '+4.8%',
      isPositive: true,
      icon: <Users className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 text-emerald-950 border-emerald-200/80',
      actionTab: 'farmers',
    },
    {
      id: 'active-farmers',
      title: 'Active Monthly Farmers',
      value: kpis.activeFarmers.toLocaleString(),
      subtext: '63.4% platform engagement',
      delta: '+7.2%',
      isPositive: true,
      icon: <Activity className="w-5 h-5 text-teal-600" />,
      bg: 'bg-teal-50 text-teal-950 border-teal-200/80',
      actionTab: 'farmers',
    },
    {
      id: 'registered-buyers',
      title: 'Verified Institutional Buyers',
      value: kpis.registeredBuyers.toLocaleString(),
      subtext: '98.2% KYC compliance rate',
      delta: '+12.5%',
      isPositive: true,
      icon: <Building className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 text-blue-950 border-blue-200/80',
      actionTab: 'buyers',
    },
    {
      id: 'tracked-mandis',
      title: 'Tracked APMC Mandis',
      value: kpis.trackedMarkets.toLocaleString(),
      subtext: 'Across 28 States & UTs',
      delta: '100% Sync',
      isPositive: true,
      icon: <Store className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50 text-purple-950 border-purple-200/80',
      actionTab: 'mandi-feeds',
    },
    {
      id: 'crops-tracked',
      title: 'Commodities Tracked',
      value: kpis.cropsTracked.toLocaleString(),
      subtext: 'Grains, Oilseeds, Pulses & Cash',
      delta: '+4 added',
      isPositive: true,
      icon: <Sprout className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 text-amber-950 border-amber-200/80',
      actionTab: 'analytics',
    },
    {
      id: 'active-listings',
      title: 'Active Crop Lot Listings',
      value: kpis.activeListings.toLocaleString(),
      subtext: `≈ ${(kpis.dailyTradingVolumeMT).toLocaleString()} MT Total Volume`,
      delta: '+18.4%',
      isPositive: true,
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 text-indigo-950 border-indigo-200/80',
      actionTab: 'farmers',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Government Platform Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700/50">
              National Agricultural Intelligence Network
            </span>
            <span className="text-[10px] text-slate-300">Govt of India EDI Gateway</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Outfit',sans-serif]">
            National Agri-Market Intelligence Operations Center
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Real-time telemetry monitoring 2,418 APMC mandis, 148,000+ registered farmers, institutional procurement pipelines, and Agmarknet API ingestion streams.
          </p>
        </div>

        {/* Live Ingestion Health Status Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold">Agmarknet Sync Health:</span>
              <span className="font-mono font-extrabold text-emerald-400">{kpis.apiSyncHealth}%</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Avg Ingestion Latency: <strong>1.18s</strong> • 0 API errors in 24h
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={onRefreshData}
            icon={<RefreshCw className="w-4 h-4" />}
            className="font-bold shadow-md shadow-emerald-600/30"
          >
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {/* 6 Primary Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => onNavigateToTab(card.actionTab)}
            className={`p-5 rounded-3xl border shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 ${card.bg}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  {card.title}
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight mt-1">
                  {card.value}
                </div>
              </div>

              <div className="w-11 h-11 rounded-2xl bg-white shadow-xs flex items-center justify-center shrink-0">
                {card.icon}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-black/5">
              <span className="text-slate-600 font-medium">{card.subtext}</span>
              <span className="font-bold text-emerald-700 bg-white/90 px-2 py-0.5 rounded-md flex items-center gap-0.5 shadow-2xs">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {card.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Operations Quick-Access Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Verification Queue Preview */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="purple" size="sm">Action Required</Badge>
              <span className="text-xs font-bold text-purple-700 font-mono">3 Pending</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">User KYC Verification Queue</h3>
            <p className="text-xs text-slate-500">
              Review Land Records (Khatauni), KCC passbooks, and Buyer GSTIN accreditation requests.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateToTab('verification')}
            className="w-full justify-center font-bold text-purple-800 border-purple-200 bg-purple-50/50 hover:bg-purple-100"
          >
            Open Verification Queue
          </Button>
        </div>

        {/* APMC Feed Monitor */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="emerald" size="sm">2,418 Active</Badge>
              <span className="text-xs font-bold text-emerald-700 font-mono">99.8% Online</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Mandi Price Ingestion Feeds</h3>
            <p className="text-xs text-slate-500">
              Live modal rate ingestion from Agmarknet API, e-NAM gateways, and State Mandi Boards.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateToTab('mandi-feeds')}
            className="w-full justify-center font-bold text-emerald-800 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100"
          >
            Manage Data Feeds
          </Button>
        </div>

        {/* System Activity & Audit Trail */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="slate" size="sm">Real-time Stream</Badge>
              <span className="text-xs font-bold text-slate-500 font-mono">Audit Active</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">System Logs & Volatility Alerts</h3>
            <p className="text-xs text-slate-500">
              Automated anomaly detection, price volatility triggers, and bank escrow settlements.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateToTab('alerts')}
            className="w-full justify-center font-bold text-slate-800 border-slate-200 bg-slate-50 hover:bg-slate-100"
          >
            View System Activity Log
          </Button>
        </div>

      </div>

    </div>
  );
};
