import React from 'react';
import {
  Flame,
  TrendingUp,
  Activity,
  Calendar,
  Layers,
  Sparkles,
  Users,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { CropAnalyticsProfile } from '../../data/cropAnalyticsData';
import { Badge } from '../common/Badge';

interface DemandInsightsCardProps {
  data: CropAnalyticsProfile;
}

export const DemandInsightsCard: React.FC<DemandInsightsCardProps> = ({ data }) => {
  const { demandTrend, marketAvailability } = data;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
              Institutional Demand Dynamics & Absorption Trends
            </h3>
            <Badge variant="purple" size="sm">
              Liquidity Momentum
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking buyer bids, procurement contracts, and seasonal consumption cycles across food processors and millers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-purple-800 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
            {demandTrend.trendDirection}
          </span>
        </div>
      </div>

      {/* 3 Metric Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        
        {/* 1. Current Demand Score */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span>Current Demand Rating</span>
            <span className="font-bold text-purple-700">Present Cycle</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {demandTrend.currentScore}
            </span>
            <span className="text-slate-400">/ 100 Index</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Derived from active bidding depth across {marketAvailability.activeBuyersCount} registered institutional buyers.
          </p>
        </div>

        {/* 2. Projected Demand Next Month */}
        <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-2">
          <div className="flex justify-between items-center text-purple-800 font-semibold">
            <span>30-Day Projected Demand</span>
            <span className="font-bold text-emerald-700 font-mono">
              +{demandTrend.predictedScoreNextMonth - demandTrend.currentScore} pts
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-950 font-mono">
              {demandTrend.predictedScoreNextMonth}
            </span>
            <span className="text-purple-600">/ 100 (Peak Window)</span>
          </div>
          <p className="text-[11px] text-purple-700">
            Expected to peak during {demandTrend.seasonalPeakMonth}.
          </p>
        </div>

        {/* 3. Historical Seasonal Baseline */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span>5-Year Historical Average</span>
            <span className="text-slate-400">Baseline</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-700 font-mono">
              {demandTrend.historicalAverageScore}
            </span>
            <span className="text-slate-400">/ 100 Normal</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Current year demand is running <strong className="text-emerald-700">+{demandTrend.currentScore - demandTrend.historicalAverageScore}% above</strong> typical 5-year averages.
          </p>
        </div>

      </div>

      {/* Institutional Demand Summary Note */}
      <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 flex items-start gap-3">
        <Building className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Active Procurement Intelligence
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {demandTrend.institutionalDemandNote}
          </p>
        </div>
      </div>

    </div>
  );
};
