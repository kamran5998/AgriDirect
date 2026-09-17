import React from 'react';
import { Building2, Sprout, Activity, ShieldCheck, TrendingUp, CheckCircle, Radio } from 'lucide-react';
import { MARKET_STATS } from '../data/marketData';
import { Card } from './common/Card';
import { Badge } from './common/Badge';

export const MarketSnapshot: React.FC<{ onExploreClick?: () => void }> = ({ onExploreClick }) => {
  const iconMap: Record<string, React.ReactNode> = {
    Building2: <Building2 className="w-6 h-6 text-emerald-600" />,
    Sprout: <Sprout className="w-6 h-6 text-emerald-600" />,
    Activity: <Activity className="w-6 h-6 text-blue-600" />,
    ShieldCheck: <ShieldCheck className="w-6 h-6 text-purple-600" />,
  };

  return (
    <section id="about" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Real-Time National Mandi Grid
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
              Market Snapshot & Data Coverage
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Continuously aggregated across regulated APMC yards, state agricultural boards, and institutional commodity exchanges.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Network Health: <strong>100% Operational</strong></span>
            <span className="text-slate-300">•</span>
            <span>Latency: <strong>0.4s</strong></span>
          </div>
        </div>

        {/* 4 Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MARKET_STATS.map((stat) => (
            <Card
              key={stat.id}
              hoverEffect={true}
              className="p-6 relative overflow-hidden group border-slate-200/90"
            >
              {/* Subtle accent corner */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-bl-full pointer-events-none group-hover:bg-emerald-100/60 transition-colors"></div>

              <div className="flex items-center justify-between mb-4 relative">
                <div className="w-12 h-12 rounded-xl bg-slate-100/90 flex items-center justify-center group-hover:bg-white group-hover:shadow-xs transition-all border border-slate-200/60">
                  {iconMap[stat.iconName]}
                </div>
                <Badge variant={stat.isPositive ? 'emerald' : 'blue'} size="sm">
                  {stat.change}
                </Badge>
              </div>

              <div className="relative">
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-slate-800 mt-1">
                  {stat.label}
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-normal">
                  {stat.subtext}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Integration Bar */}
        <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Direct API integrations with <strong>AGMARKNET</strong>, <strong>e-NAM</strong>, State Warehousing Corporations, and <strong>NCDEX Spot</strong> feeds.
            </span>
          </div>
          <button
            onClick={onExploreClick}
            className="text-emerald-700 font-semibold hover:text-emerald-800 hover:underline shrink-0 cursor-pointer"
          >
            View Active Mandi Coverage Directory →
          </button>
        </div>

      </div>
    </section>
  );
};
