import React, { useState } from 'react';
import {
  Award,
  Building2,
  MapPin,
  Truck,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { CropAnalyticsProfile, MarketOpportunityItem } from '../../data/cropAnalyticsData';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface MarketOpportunityGridProps {
  data: CropAnalyticsProfile;
  onSelectOpportunityMandi?: (opp: MarketOpportunityItem) => void;
}

export const MarketOpportunityGrid: React.FC<MarketOpportunityGridProps> = ({
  data,
  onSelectOpportunityMandi,
}) => {
  const [selectedTier, setSelectedTier] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredOpportunities =
    selectedTier === 'all'
      ? data.opportunities
      : data.opportunities.filter((opp) => opp.opportunityTier === selectedTier);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
      
      {/* Header & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
              Regional Market Opportunity & Net Arbitrage Ranking
            </h3>
            <Badge variant="emerald" size="sm">
              Freight Adjusted
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Markets ranked by net gate realization (Offered Spot Rate minus Freight & Handling expenses).
          </p>
        </div>

        {/* Tier Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {(['all', 'high', 'medium', 'low'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                selectedTier === tier
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tier === 'all' ? 'All Tiers' : `${tier} Opportunity`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Opportunity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOpportunities.map((opp) => {
          const isHigh = opp.opportunityTier === 'high';
          const isMed = opp.opportunityTier === 'medium';
          const isLow = opp.opportunityTier === 'low';

          return (
            <div
              key={opp.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all relative ${
                isHigh
                  ? 'bg-emerald-50/30 border-emerald-300 shadow-sm ring-2 ring-emerald-500/20'
                  : isMed
                  ? 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                  : 'bg-slate-50/70 border-slate-200 opacity-80'
              }`}
            >
              {/* Top Tier Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    isHigh
                      ? 'bg-emerald-600 text-white'
                      : isMed
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {opp.opportunityTier.toUpperCase()} OPPORTUNITY ({opp.score}/100)
                </span>

                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  {opp.distanceKm} km
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{opp.mandi}</span>
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {opp.district}, {opp.state}
                </p>

                {/* Price Matrix Details */}
                <div className="my-4 space-y-2 text-xs divide-y divide-slate-100">
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-slate-500">Offered Spot Rate:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{opp.spotPrice.toLocaleString()} / q
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-slate-500">Freight Overhead:</span>
                    <span className="font-mono font-bold text-amber-700">
                      -₹{opp.freightPerQtl} / q
                    </span>
                  </div>

                  {/* Net Payout Box */}
                  <div
                    className={`p-3 rounded-xl border mt-2 flex justify-between items-baseline ${
                      isHigh
                        ? 'bg-emerald-100/60 border-emerald-300'
                        : 'bg-slate-100/80 border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-600 block">
                        Net Payout (Post Freight)
                      </span>
                      <span className="text-[10px] text-slate-400">At Farm Gate</span>
                    </div>
                    <div className="font-mono text-base font-extrabold text-emerald-900">
                      ₹{opp.netRealization.toLocaleString()} <span className="text-xs font-normal">/ q</span>
                    </div>
                  </div>
                </div>

                {/* Recommendation Note */}
                <div className="text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-lg border border-slate-100 leading-snug">
                  {opp.recommendationNote}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <Button
                  variant={isHigh ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onSelectOpportunityMandi?.(opp)}
                  className="w-full font-bold text-xs"
                >
                  {isHigh ? 'Select & Book Transport' : 'Inspect Mandi Depth'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
