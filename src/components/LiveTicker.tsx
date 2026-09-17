import React from 'react';
import { TrendingUp, TrendingDown, Radio } from 'lucide-react';
import { LIVE_TICKER_DATA } from '../data/marketData';

export const LiveTicker: React.FC<{ onCropSelect?: (cropName: string) => void }> = ({ onCropSelect }) => {
  // Duplicate array for seamless infinite marquee loop
  const tickerItems = [...LIVE_TICKER_DATA, ...LIVE_TICKER_DATA];

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white overflow-hidden py-2 text-xs font-mono select-none">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
        {/* Live Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          LIVE MANDI FEED
        </div>

        {/* Marquee Scroller */}
        <div className="relative overflow-hidden w-full">
          <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
            {tickerItems.map((item, index) => {
              const isPositive = item.change >= 0;
              return (
                <div
                  key={`${item.crop}-${index}`}
                  onClick={() => onCropSelect && onCropSelect(item.crop)}
                  className="inline-flex items-center gap-2 cursor-pointer hover:text-emerald-400 transition-colors group"
                >
                  <span className="font-semibold text-slate-200 group-hover:text-white font-sans text-xs">
                    {item.crop}
                  </span>
                  <span className="text-[11px] text-slate-400">({item.mandi})</span>
                  <span className="font-bold text-slate-100">
                    ₹{item.price.toLocaleString()} {item.unit}
                  </span>
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isPositive ? `+${item.change}%` : `${item.change}%`}
                  </span>
                  <span className="text-slate-700 ml-2">•</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
