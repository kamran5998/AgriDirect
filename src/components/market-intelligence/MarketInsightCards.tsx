import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Building2,
  AlertCircle,
  Flame,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { MARKET_INSIGHT_BULLETINS } from '../../data/marketIntelligenceData';
import { Badge } from '../common/Badge';

export const MarketInsightCards: React.FC = () => {
  const { topGainers, topDecliners, highDemandCrops, activeHubs } = MARKET_INSIGHT_BULLETINS;

  return (
    <div className="space-y-4">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Algorithmic Market Intelligence
          </span>
          <Badge variant="emerald" size="sm">
            Live Feed
          </Badge>
        </div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1 font-['Outfit',sans-serif]">
          Key Market Movements & Institutional Buying Shifts
        </h3>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Rising Prices (Top Gainers) */}
        <div className="bg-white rounded-2xl border border-emerald-200/80 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Top Bullish Crops
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 mb-2">Rising Prices</h4>

            <div className="space-y-2.5 divide-y divide-slate-100 text-xs">
              {topGainers.slice(0, 3).map((item, idx) => (
                <div key={idx} className={idx > 0 ? 'pt-2' : ''}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.crop}</span>
                    <span className="font-mono font-extrabold text-emerald-700">{item.change}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{item.price} • {item.mandi.split(' ')[0]}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-1">{item.reason}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center justify-between cursor-pointer hover:underline">
            <span>View all gainers</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* 2. Falling Prices (Top Decliners) */}
        <div className="bg-white rounded-2xl border border-amber-200/80 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <TrendingDown className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Supply Glut Watch
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 mb-2">Price Corrections</h4>

            <div className="space-y-2.5 divide-y divide-slate-100 text-xs">
              {topDecliners.slice(0, 3).map((item, idx) => (
                <div key={idx} className={idx > 0 ? 'pt-2' : ''}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.crop}</span>
                    <span className="font-mono font-extrabold text-amber-700">{item.change}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{item.price} • {item.mandi.split(' ')[0]}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-1">{item.reason}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] font-bold text-amber-800 flex items-center justify-between cursor-pointer hover:underline">
            <span>Holding recommendations</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* 3. High-Demand Crops */}
        <div className="bg-white rounded-2xl border border-purple-200/80 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Buyer Deficit
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 mb-2">High-Demand Crops</h4>

            <div className="space-y-2.5 divide-y divide-slate-100 text-xs">
              {highDemandCrops.slice(0, 3).map((item, idx) => (
                <div key={idx} className={idx > 0 ? 'pt-2' : ''}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.crop}</span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                      {item.deficitRating}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex justify-between">
                    <span>{item.buyerCount} Vetted Buyers</span>
                    <span className="font-bold text-emerald-700 font-mono">{item.targetPremium}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] font-bold text-purple-700 flex items-center justify-between cursor-pointer hover:underline">
            <span>Browse buyer tenders</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* 4. Active Trading Hubs */}
        <div className="bg-white rounded-2xl border border-blue-200/80 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Highest Liquidity
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 mb-2">Active APMC Hubs</h4>

            <div className="space-y-2.5 divide-y divide-slate-100 text-xs">
              {activeHubs.slice(0, 3).map((item, idx) => (
                <div key={idx} className={idx > 0 ? 'pt-2' : ''}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate max-w-[130px]">{item.name}</span>
                    <span className="font-mono font-bold text-slate-800">{item.turnoverToday}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex justify-between">
                    <span>{item.state}</span>
                    <span className="text-emerald-700 font-medium">{item.arrivals}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] font-bold text-blue-700 flex items-center justify-between cursor-pointer hover:underline">
            <span>View electronic weighbridges</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

      </div>

    </div>
  );
};
