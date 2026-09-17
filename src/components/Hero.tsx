import React, { useState } from 'react';
import { ArrowRight, TrendingUp, ShieldCheck, MapPin, Building2, Sparkles, CheckCircle2, ChevronRight, Activity, ArrowUpRight, BarChart3, Clock } from 'lucide-react';
import { Button } from './common/Button';
import { Badge, TrendBadge } from './common/Badge';

interface HeroProps {
  onOpenGetStarted: () => void;
  onExploreMarkets: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenGetStarted, onExploreMarkets }) => {
  const [selectedCropIndex, setSelectedCropIndex] = useState(0);

  const heroPreviews = [
    {
      crop: 'Wheat (Sharbati Grade)',
      mandi: 'Sehore APMC Mandi, MP',
      modalPrice: 2860,
      yesterdayPrice: 2780,
      change: 2.8,
      recommendedAction: 'SELL TODAY',
      actionReason: 'Peak demand window before northern arrivals surge',
      netGainVsMiddleman: '+₹240 / Quintal',
      verifiedBuyersCount: 28,
      moistureSpec: '11.5% (Export Spec)',
      sparkline: [2680, 2720, 2750, 2780, 2810, 2840, 2860],
    },
    {
      crop: 'Pusa Basmati 1121',
      mandi: 'Karnal Grain Hub, Haryana',
      modalPrice: 4320,
      yesterdayPrice: 4180,
      change: 3.4,
      recommendedAction: 'HOLD 48H',
      actionReason: 'Middle-east export tender opening Thursday',
      netGainVsMiddleman: '+₹380 / Quintal',
      verifiedBuyersCount: 44,
      moistureSpec: '12.0% (FAQ Grade)',
      sparkline: [4080, 4120, 4190, 4220, 4200, 4280, 4320],
    },
    {
      crop: 'Cotton (Shankar-6 Staple)',
      mandi: 'Rajkot APMC, Gujarat',
      modalPrice: 7240,
      yesterdayPrice: 7100,
      change: 1.9,
      recommendedAction: 'DISPATCH TO PORT',
      actionReason: 'Direct spinning mill purchase order open',
      netGainVsMiddleman: '+₹450 / Quintal',
      verifiedBuyersCount: 36,
      moistureSpec: '8.5% Moisture',
      sparkline: [6980, 7040, 7090, 7150, 7120, 7190, 7240],
    },
  ];

  const current = heroPreviews[selectedCropIndex];

  return (
    <section id="home" className="relative pt-12 pb-20 lg:pt-16 lg:pb-24 overflow-hidden bg-slate-900 text-white">
      {/* Background Subtle Gradient & Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Government & Real-Time Sync Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>2,480+ Mandis Live Aggregation</span>
              <span className="text-emerald-300">•</span>
              <span className="text-slate-300 font-normal">Agmarknet & e-NAM Synchronized</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] font-['Outfit',sans-serif]">
              Real-Time <span className="text-emerald-400">Market Intelligence</span> & Direct Access for Farmers
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
              Empowering farmers and Producer Organizations (FPOs) with verified mandi spot rates, predictive price momentum, inter-district market arbitrage, and instant direct access to verified institutional buyers.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={onOpenGetStarted}
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
                className="shadow-lg shadow-emerald-600/25 text-base"
              >
                Get Started Free
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={onExploreMarkets}
                icon={<BarChart3 className="w-5 h-5 text-emerald-400" />}
                className="bg-slate-800/80 hover:bg-slate-800 text-white border-slate-700 hover:border-slate-600 text-base"
              >
                Explore Live Markets
              </Button>
            </div>

            {/* Trust Badges Row */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Middleman Exploitation</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400 shrink-0" />
                <span>15-Min Live Price Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>100% Escrow Payments</span>
              </div>
            </div>

          </div>

          {/* Right Column: Premium Interactive Terminal Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-950/90 rounded-2xl border border-slate-800 shadow-2xl p-5 sm:p-6 backdrop-blur-xl relative">
              
              {/* Card Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="text-xs font-mono text-slate-400 ml-2">AGRI-TERMINAL // v2.4</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  <Clock className="w-3 h-3" />
                  Live Spot Rate
                </div>
              </div>

              {/* Crop Selector Tabs */}
              <div className="flex gap-1.5 my-4 p-1 bg-slate-900 rounded-lg border border-slate-800">
                {heroPreviews.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedCropIndex(idx)}
                    className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all truncate text-center ${
                      selectedCropIndex === idx
                        ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.crop.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Active Commodity Header */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white tracking-tight">{current.crop}</h3>
                  <TrendBadge change={current.change} size="sm" />
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {current.mandi}
                </p>
              </div>

              {/* Price Display */}
              <div className="my-5 p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-baseline justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Current Modal Price</div>
                  <div className="text-3xl font-extrabold text-white font-mono mt-0.5">
                    ₹{current.modalPrice.toLocaleString()}
                    <span className="text-xs font-normal text-slate-400 ml-1 font-sans">/ Quintal</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Net Profit Uplift</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                    {current.netGainVsMiddleman}
                  </div>
                </div>
              </div>

              {/* Sparkline Visual Strip */}
              <div className="space-y-1.5 mb-5">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>7-Day Price Trajectory</span>
                  <span className="text-emerald-400 font-mono">+₹{current.modalPrice - current.sparkline[0]} / q</span>
                </div>
                <div className="flex items-end gap-1.5 h-12 pt-2">
                  {current.sparkline.map((val, i) => {
                    const min = Math.min(...current.sparkline) * 0.98;
                    const max = Math.max(...current.sparkline) * 1.02;
                    const height = Math.max(20, ((val - min) / (max - min)) * 100);
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-emerald-500/60 hover:bg-emerald-400 rounded-t transition-all cursor-pointer"
                        style={{ height: `${height}%` }}
                        title={`Day ${i + 1}: ₹${val}`}
                      ></div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendation Callout */}
              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/70 space-y-1 mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Market Advisory: {current.recommendedAction}
                  </span>
                  <span className="text-[11px] text-slate-300">{current.verifiedBuyersCount} Buyers Active</span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  {current.actionReason}. Spec: <span className="text-white font-medium">{current.moistureSpec}</span>.
                </p>
              </div>

              {/* Interactive Action Trigger */}
              <button
                type="button"
                onClick={onOpenGetStarted}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>View Full Market Depth & Match Buyers</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
