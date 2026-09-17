import React, { useState } from 'react';
import {
  Map,
  Compass,
  Building2,
  TrendingUp,
  Activity,
  Flame,
  Layers,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Info,
} from 'lucide-react';
import { REGIONAL_HEATMAP_DATA, RegionalHeatmapCluster } from '../../data/marketIntelligenceData';
import { Badge } from '../common/Badge';

export const MarketHeatmap: React.FC = () => {
  const [selectedCluster, setSelectedCluster] = useState<RegionalHeatmapCluster>(
    REGIONAL_HEATMAP_DATA[0]
  );
  const [filterSentiment, setFilterSentiment] = useState<'All' | 'Bullish' | 'Neutral'>('All');

  const filteredClusters =
    filterSentiment === 'All'
      ? REGIONAL_HEATMAP_DATA
      : REGIONAL_HEATMAP_DATA.filter((c) => c.sentiment === filterSentiment);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
              National Agrarian Heatmap & Trading Intensity
            </h3>
            <Badge variant="purple" size="sm">
              Geographic Liquidity Index
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visualizing regional trading volumes, arrival surges, and price momentum across major Indian agricultural basins.
          </p>
        </div>

        {/* Sentiment Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {(['All', 'Bullish', 'Neutral'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterSentiment(s)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterSentiment === s
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {s === 'All' ? 'All Corridors' : `${s} Momentum`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Heatmap Visual Matrix (Interactive Regional Nodes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClusters.map((cluster) => {
          const isSelected = selectedCluster.id === cluster.id;
          const isSurge = cluster.activityIndex >= 90;
          const isHigh = cluster.activityIndex >= 80 && cluster.activityIndex < 90;

          return (
            <div
              key={cluster.id}
              onClick={() => setSelectedCluster(cluster)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-800 shadow-lg ring-2 ring-emerald-500/50 -translate-y-0.5'
                  : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              {/* Heat bar indicator */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  isSurge
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500'
                    : isHigh
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                    : 'bg-slate-300'
                }`}
              />

              <div>
                {/* Zone & Activity Tag */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider ${
                      isSelected ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {cluster.state}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cluster.activityLabel === 'Surge Activity'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : cluster.activityLabel === 'High Liquidity'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-700/50 text-slate-300'
                    }`}
                  >
                    {cluster.activityLabel} ({cluster.activityIndex}/100)
                  </span>
                </div>

                <h4
                  className={`text-sm font-bold tracking-tight ${
                    isSelected ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {cluster.regionName}
                </h4>
                <p
                  className={`text-xs mt-0.5 line-clamp-1 ${
                    isSelected ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {cluster.zone}
                </p>

                {/* Dominant Crops */}
                <div className="my-3.5 flex flex-wrap gap-1">
                  {cluster.dominantCrops.map((crop) => (
                    <span
                      key={crop}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-slate-800 text-slate-200 border border-slate-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {crop}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Metrics Strip */}
              <div
                className={`pt-3 border-t text-xs grid grid-cols-2 gap-2 font-mono ${
                  isSelected ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'
                }`}
              >
                <div>
                  <span className="text-[10px] block font-sans opacity-70">Daily Arrivals</span>
                  <span className="font-bold">{cluster.totalArrivalTodayQtl.toLocaleString()} q</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] block font-sans opacity-70">Active Mandis</span>
                  <span className="font-bold">{cluster.activeMandisCount} Hubs</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Corridor Deep Inspection Panel */}
      <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Regional Trading Intelligence Brief
            </span>
          </div>
          <h4 className="text-base font-bold text-white">
            {selectedCluster.regionName} ({selectedCluster.state})
          </h4>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Leading regional benchmark mandi is <strong>{selectedCluster.topMandi}</strong> trading at{' '}
            <strong className="text-emerald-400 font-mono">₹{selectedCluster.topPrice.toLocaleString()}/q</strong> with a 24h momentum of{' '}
            <strong className="text-white font-mono">+{selectedCluster.avgPriceIndex}%</strong>. Total aggregated daily arrival across {selectedCluster.activeMandisCount} active APMC yards is {selectedCluster.totalArrivalTodayQtl.toLocaleString()} quintals.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center font-mono">
            <span className="text-[10px] text-slate-400 uppercase font-sans block">Liquidity Rating</span>
            <span className="text-lg font-extrabold text-emerald-400">{selectedCluster.activityIndex} / 100</span>
          </div>
        </div>
      </div>

    </div>
  );
};
