import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Flame,
  Building2,
  Warehouse,
  Users,
  Layers,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { CropAnalyticsProfile } from '../../data/cropAnalyticsData';
import { Badge, TrendBadge } from '../common/Badge';

interface CropOverviewKpisProps {
  data: CropAnalyticsProfile;
}

export const CropOverviewKpis: React.FC<CropOverviewKpisProps> = ({ data }) => {
  const sparklineData = data.forecastSeries
    .filter((p) => !p.isForecast && p.actualPrice)
    .map((p) => p.actualPrice as number);

  const minPrice = Math.min(...sparklineData);
  const maxPrice = Math.max(...sparklineData);
  const range = maxPrice - minPrice || 1;

  const sparklineSvgPoints = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * 96;
      const y = 32 - ((val - minPrice) / range) * 24;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* KPI 1: Current Spot Price & 24h/7d Change */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Current Spot Benchmark
            </span>
            <TrendBadge change={data.change24h} size="sm" />
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              ₹{data.currentPrice.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">/ quintal</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
            <span>Trading Band:</span>
            <span className="font-mono font-bold text-slate-700">
              ₹{data.minPrice} - ₹{data.maxPrice}
            </span>
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">7-Day Trajectory</span>
          <span className="font-mono font-bold text-emerald-700">+{data.change7d}% Net</span>
        </div>
      </div>

      {/* KPI 2: Real-Time Demand Index & Deficit Rating */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Demand Appetite Index
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                data.demandLevel === 'Surge'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {data.demandLevel} Demand
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-900 font-mono tracking-tight">
              {data.demandScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${data.demandScore}%` }}
            />
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            Active Bidders
          </span>
          <span className="font-bold text-slate-800">
            {data.marketAvailability.activeBuyersCount} Verified Buyers
          </span>
        </div>
      </div>

      {/* KPI 3: Market Availability & Inflow Liquidity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Terminal Liquidity
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              {data.marketAvailability.status}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {data.marketAvailability.dailyArrivalQtl.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">q Arrivals Today</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
            <Warehouse className="w-3.5 h-3.5 text-slate-400" />
            <span>Warehouse Capacity:</span>
            <span className="font-mono font-bold text-slate-700">
              {data.marketAvailability.warehouseCapacityUsedPercent}% Used
            </span>
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">Open E-Auctions</span>
          <span className="font-bold text-blue-700">
            {data.marketAvailability.activeAuctions} Live Bidding Lots
          </span>
        </div>
      </div>

      {/* KPI 4: Historical Baseline Sparkline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between relative overflow-hidden">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              15-Day Historical Momentum
            </span>
            <Badge variant="neutral" size="sm">
              Spot Track
            </Badge>
          </div>

          {/* SVG Sparkline */}
          <div className="w-full h-12 my-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 96 36">
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparklineSvgPoints}
              />
            </svg>
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">Primary Mandi</span>
          <span className="font-bold text-slate-900 truncate max-w-[130px]">
            {data.defaultMandi}
          </span>
        </div>
      </div>

    </div>
  );
};
