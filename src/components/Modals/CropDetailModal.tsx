import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, MapPin, Truck, ShieldCheck, CheckCircle2, DollarSign, Calendar, BarChart2, Building2 } from 'lucide-react';
import { CropMarketItem } from '../../types';
import { Button } from '../common/Button';
import { Badge, TrendBadge } from '../common/Badge';

interface CropDetailModalProps {
  crop: CropMarketItem | null;
  onClose: () => void;
  onConnectBuyer?: (crop: CropMarketItem) => void;
}

export const CropDetailModal: React.FC<CropDetailModalProps> = ({ crop, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'buyers'>('overview');
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  if (!crop) return null;

  const handleRequestQuote = () => {
    setQuoteSuccess(true);
    setTimeout(() => {
      setQuoteSuccess(false);
      onClose();
    }, 2000);
  };

  // Generate comparison mandis
  const comparisonMandis = [
    { name: crop.mandi, state: crop.state, price: crop.currentPrice, distance: '0 km (Local)', netGain: 'Benchmark' },
    { name: 'Regional Apex APMC', state: crop.state, price: crop.currentPrice + 160, distance: '45 km', netGain: '+₹115/q (Net of Freight)' },
    { name: 'Export Processing Zone Hub', state: 'Inter-State Hub', price: crop.currentPrice + 310, distance: '120 km', netGain: '+₹190/q (Net of Freight)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative border-b border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Badge variant="emerald" size="sm">
              {crop.category}
            </Badge>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-300 font-medium">{crop.variety}</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Mandi Feed
            </span>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">{crop.name}</h3>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {crop.mandi}, {crop.district} ({crop.state})
              </p>
            </div>

            <div className="text-right">
              <div className="text-3xl font-extrabold text-white font-mono">
                ₹{crop.currentPrice.toLocaleString()}
                <span className="text-xs font-normal text-slate-300 ml-1 font-sans">/ Quintal</span>
              </div>
              <div className="flex items-center justify-end gap-2 mt-1">
                <TrendBadge change={crop.change} size="sm" />
                <span className="text-[11px] text-slate-400">Modal Spot Price</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs inside modal */}
          <div className="flex gap-4 mt-6 border-b border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 transition-colors border-b-2 ${
                activeTab === 'overview'
                  ? 'border-emerald-400 text-emerald-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Market Overview
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`pb-2.5 transition-colors border-b-2 ${
                activeTab === 'comparison'
                  ? 'border-emerald-400 text-emerald-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Inter-Mandi Arbitrage
            </button>
            <button
              onClick={() => setActiveTab('buyers')}
              className={`pb-2.5 transition-colors border-b-2 ${
                activeTab === 'buyers'
                  ? 'border-emerald-400 text-emerald-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Verified Buyers ({crop.activeBuyers})
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {quoteSuccess ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Purchase Inquiry Broadcasted</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Verified institutional buyers for <strong>{crop.name}</strong> at <strong>{crop.mandi}</strong> have been notified of your lot availability.
              </p>
            </div>
          ) : activeTab === 'overview' ? (
            <>
              {/* Key Price Indicators */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-medium text-slate-500">Day Min Price</div>
                  <div className="text-lg font-bold text-slate-800 mt-0.5 font-mono">₹{crop.minPrice.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Floor rate recorded</div>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                  <div className="text-[11px] font-semibold text-emerald-800">Modal Spot Price</div>
                  <div className="text-lg font-bold text-emerald-700 mt-0.5 font-mono">₹{crop.currentPrice.toLocaleString()}</div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">Weighted average</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-medium text-slate-500">Day Max Price</div>
                  <div className="text-lg font-bold text-slate-800 mt-0.5 font-mono">₹{crop.maxPrice.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Top-grade auction</div>
                </div>
              </div>

              {/* Quality & Arrival Context */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Quality & Grading Benchmark
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Assay Grade</span>
                    <span className="font-semibold text-slate-800">{crop.qualityGrade}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Demand Intensity</span>
                    <span className="font-bold text-emerald-600">{crop.demandIndex}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Standard Moisture Limit</span>
                    <span className="font-medium text-slate-800">≤ 12.0%</span>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-600" />
                    Arrivals & Logistics Context
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Today's Arrivals</span>
                    <span className="font-semibold text-slate-800">{crop.arrivalVolume}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Arrival Trend</span>
                    <span className="font-medium text-slate-800">Steady (+4% vs yesterday)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Last Agmarknet Feed</span>
                    <span className="font-mono text-slate-600">{crop.lastUpdated}</span>
                  </div>
                </div>
              </div>

              {/* 7-Day Trend Chart Simulation */}
              <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">7-Day Price Movement Track</h5>
                    <p className="text-xs text-emerald-400 font-semibold mt-0.5">Consistently trending above 30-day moving average</p>
                  </div>
                  <Badge variant="emerald" size="sm">
                    +₹{(crop.sparkline[crop.sparkline.length - 1] - crop.sparkline[0])} / q 7-Day Gain
                  </Badge>
                </div>

                {/* SVG Visual Bar Graph */}
                <div className="flex items-end gap-3 h-28 pt-4 pb-1 border-b border-slate-800">
                  {crop.sparkline.map((val, idx) => {
                    const min = Math.min(...crop.sparkline) * 0.95;
                    const max = Math.max(...crop.sparkline) * 1.05;
                    const heightPercent = Math.max(15, ((val - min) / (max - min)) * 100);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="text-[10px] font-mono text-slate-400 group-hover:text-emerald-400 transition-colors">
                          ₹{val}
                        </div>
                        <div 
                          className="w-full bg-emerald-500/80 hover:bg-emerald-400 rounded-t transition-all"
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                        <div className="text-[9px] text-slate-500 mt-1 font-mono">D-{7 - idx}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : activeTab === 'comparison' ? (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <strong>Regional Arbitrage Opportunity:</strong> Transporting your {crop.name} to higher-demand processing hubs can yield up to ₹190/quintal after accounting for diesel freight.
              </div>

              <div className="space-y-2.5">
                {comparisonMandis.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                      idx === 0 ? 'bg-slate-50 border-slate-300' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {item.name}
                        {idx === 0 && <Badge variant="slate" size="sm">Local Mandi</Badge>}
                      </div>
                      <div className="text-slate-500 mt-0.5">{item.state} • Distance: {item.distance}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 font-mono text-sm">₹{item.price.toLocaleString()} / q</div>
                      <div className="font-semibold text-emerald-600 mt-0.5">{item.netGain}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                <strong>{crop.activeBuyers} Institutional Buyers</strong> currently have active procurement mandates for {crop.name}.
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      A
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">AgroFoods Processing Ltd (Export Unit)</div>
                      <div className="text-slate-500">Requirement: 500 Quintals • Grade A • Payment: 24h Escrow</div>
                    </div>
                  </div>
                  <Badge variant="emerald" size="sm">Offer: ₹{crop.currentPrice + 40}/q</Badge>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      K
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Kisan Agro Cooperative Federation</div>
                      <div className="text-slate-500">Requirement: 1,200 Quintals • Standard FAQ • Gate Pickup Available</div>
                    </div>
                  </div>
                  <Badge variant="blue" size="sm">Offer: ₹{crop.currentPrice}/q</Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            Powered by <strong>AgriDirect Live Mandi Engine</strong>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={handleRequestQuote}>
              Connect with Verified Buyers
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
