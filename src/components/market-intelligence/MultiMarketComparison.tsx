import React, { useState } from 'react';
import {
  Scale,
  Building2,
  MapPin,
  Truck,
  TrendingUp,
  Award,
  Sparkles,
  CheckCircle2,
  X,
  Plus,
  ArrowRight,
  Info,
} from 'lucide-react';
import { MarketPriceRecord } from '../../data/marketIntelligenceData';
import { Badge, TrendBadge } from '../common/Badge';
import { Button } from '../common/Button';

interface MultiMarketComparisonProps {
  allRecords: MarketPriceRecord[];
  selectedIds: string[];
  onRemoveMarket: (id: string) => void;
  onAddMarket: (id: string) => void;
  onClearAll: () => void;
}

export const MultiMarketComparison: React.FC<MultiMarketComparisonProps> = ({
  allRecords,
  selectedIds,
  onRemoveMarket,
  onAddMarket,
  onClearAll,
}) => {
  // If fewer than 2 items are selected, pick default 3 comparison mandis for Wheat
  const effectiveIds =
    selectedIds.length >= 2
      ? selectedIds
      : ['mp-1', 'mp-2', 'mp-3'];

  const comparedItems = allRecords.filter((r) => effectiveIds.includes(r.id));

  // Find best net realization
  const netValues = comparedItems.map((c) => c.currentPrice - c.estimatedFreightPerQtl);
  const maxNetValue = Math.max(...netValues);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
              Multi-Market Comparison & Logistics Arbitrage
            </h3>
            <Badge variant="amber" size="sm">
              {comparedItems.length} Mandis Side-by-Side
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Compare offered prices, transport freight, and market liquidity across regional APMC yards to maximize net farmer gate realization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              Reset Selection
            </button>
          )}
        </div>
      </div>

      {/* Side-by-Side Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {comparedItems.map((item) => {
          const netRealization = item.currentPrice - item.estimatedFreightPerQtl;
          const isBest = netRealization === maxNetValue;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all relative ${
                isBest
                  ? 'bg-emerald-50/40 border-emerald-300 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {/* Best Arbitrage Badge */}
              {isBest && (
                <div className="absolute -top-3 left-4 bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span>HIGHEST NET PAYOUT</span>
                </div>
              )}

              <div>
                {/* Header: Mandi & Close Button */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{item.mandi}</span>
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.district}, {item.state}
                    </p>
                  </div>

                  <button
                    onClick={() => onRemoveMarket(item.id)}
                    className="text-slate-300 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="Remove from comparison"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Commodity Tag */}
                <div className="p-2.5 bg-slate-100/70 rounded-xl text-xs font-semibold text-slate-800 mb-4 flex items-center justify-between">
                  <span>
                    🌾 {item.cropName} ({item.variety})
                  </span>
                  <TrendBadge change={item.change} size="sm" />
                </div>

                {/* Comparison Metrics List */}
                <div className="space-y-2.5 text-xs">
                  {/* Spot Price */}
                  <div className="flex justify-between items-baseline py-1 border-b border-slate-100">
                    <span className="text-slate-500">Offered Spot Rate:</span>
                    <span className="font-mono font-extrabold text-slate-900 text-sm">
                      ₹{item.currentPrice.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">/ q</span>
                    </span>
                  </div>

                  {/* Distance & Freight */}
                  <div className="flex justify-between items-baseline py-1 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      Distance ({item.distanceKm} km):
                    </span>
                    <span className="font-mono font-bold text-amber-700">
                      -₹{item.estimatedFreightPerQtl} / q
                    </span>
                  </div>

                  {/* Demand Level */}
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">Buyer Demand:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.demandLevel === 'Surge'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.demandLevel} ({item.activeBuyers} Buyers)
                    </span>
                  </div>

                  {/* Daily Arrivals */}
                  <div className="flex justify-between items-baseline py-1 border-b border-slate-100">
                    <span className="text-slate-500">Daily Arrival Volume:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {item.arrivalVolume.toLocaleString()} Quintals
                    </span>
                  </div>

                  {/* Net Realization Box */}
                  <div
                    className={`p-3.5 rounded-xl border mt-3 flex justify-between items-baseline ${
                      isBest
                        ? 'bg-emerald-100/60 border-emerald-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] uppercase font-extrabold text-slate-600 block">
                        Net Payout (Post Freight)
                      </span>
                      <span className="text-[10px] text-slate-400">At Farm Gate</span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-base font-extrabold text-emerald-800">
                        ₹{netRealization.toLocaleString()} <span className="text-xs font-normal text-slate-600">/ q</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <Button
                  variant={isBest ? 'primary' : 'outline'}
                  size="sm"
                  className="w-full font-bold shadow-2xs text-xs"
                >
                  {isBest ? 'Route Transport Here' : 'View Mandi Yard Depth'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
