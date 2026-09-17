import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Activity,
  MapPin,
  Sprout,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Calendar,
  Filter,
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const AdminMarketAnalyticsSection: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'volume' | 'price' | 'demand'>('volume');

  // Regional activity dataset
  const stateActivity = [
    { state: 'Madhya Pradesh', mandis: 312, volumeMT: 14200, avgWheat: 2860, avgSoybean: 4680, growth: '+6.4%', share: '29.3%' },
    { state: 'Punjab', mandis: 198, volumeMT: 11800, avgWheat: 2820, avgSoybean: 4590, growth: '+4.1%', share: '24.3%' },
    { state: 'Maharashtra', mandis: 284, volumeMT: 8900, avgWheat: 2790, avgSoybean: 4720, growth: '+8.2%', share: '18.4%' },
    { state: 'Rajasthan', mandis: 240, volumeMT: 7600, avgWheat: 2810, avgSoybean: 4640, growth: '+5.0%', share: '15.7%' },
    { state: 'Gujarat', mandis: 180, volumeMT: 6000, avgWheat: 2840, avgSoybean: 4610, growth: '+9.1%', share: '12.3%' },
  ];

  // Commodity demand breakdown
  const cropDemand = [
    { crop: 'Wheat', totalTonnageMT: 18500, buyersActive: 420, avgPrice: 2860, demandRating: 'Very High (118% target)' },
    { crop: 'Soybean', totalTonnageMT: 12400, buyersActive: 310, avgPrice: 4680, demandRating: 'High (104% target)' },
    { crop: 'Mustard Seed', totalTonnageMT: 9200, buyersActive: 195, avgPrice: 5490, demandRating: 'High (98% target)' },
    { crop: 'Cotton (Kapas)', totalTonnageMT: 5800, buyersActive: 140, avgPrice: 7150, demandRating: 'Moderate (92% target)' },
    { crop: 'Basmati Paddy', totalTonnageMT: 4600, buyersActive: 85, avgPrice: 3980, demandRating: 'Strong Export (112% target)' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Controls Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="emerald" size="sm">National Market Telemetry</Badge>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif] tracking-tight mt-1">
            Macro Agricultural Analytics & Price Movements
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated market throughput, arrival trends, and institutional demand curves across 2,418 APMCs.
          </p>
        </div>

        {/* Time range switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 shrink-0">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last Quarter'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: 2 Analytical Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Regional Arrival Volume Throughput */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Regional Daily Arrival Volume</h3>
                <span className="text-[11px] text-slate-400">Total: 48,500 MT / Day</span>
              </div>
            </div>
            <Badge variant="emerald" size="sm">+6.8% vs last month</Badge>
          </div>

          {/* Simulated Bar Chart */}
          <div className="space-y-3 pt-2">
            {stateActivity.map((item) => (
              <div key={item.state} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{item.state} ({item.mandis} APMCs)</span>
                  <span className="font-mono font-bold text-slate-900">{item.volumeMT.toLocaleString()} MT ({item.share})</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                  <div
                    className="bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: item.share }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Peak arrivals reported in Central & Western belts due to early rabi clearances.</span>
            <span className="font-bold text-emerald-700">99.8% Weighment Verified</span>
          </div>
        </div>

        {/* CHART 2: Commodity Index Price Movements */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">30-Day Commodity Price Trajectory</h3>
                <span className="text-[11px] text-slate-400">Weighted National Average Benchmark</span>
              </div>
            </div>
            <Badge variant="blue" size="sm">Indexed to APMC Modal</Badge>
          </div>

          {/* Visual SVG Price Trend */}
          <div className="pt-2">
            <div className="h-44 w-full bg-slate-50/70 rounded-2xl border border-slate-200/80 p-3 flex flex-col justify-between relative overflow-hidden">
              {/* Horizontal Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none opacity-20">
                <div className="border-b border-slate-400 w-full"></div>
                <div className="border-b border-slate-400 w-full"></div>
                <div className="border-b border-slate-400 w-full"></div>
                <div className="border-b border-slate-400 w-full"></div>
              </div>

              {/* Simulated Curves */}
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                {/* Wheat Line (Emerald) */}
                <path
                  d="M0,35 Q20,32 40,28 T80,20 T100,16"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Soybean Line (Blue) */}
                <path
                  d="M0,25 Q20,29 40,24 T80,30 T100,26"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Mustard Line (Amber) */}
                <path
                  d="M0,45 Q20,40 40,36 T80,32 T100,28"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2"
                  strokeDasharray="3 2"
                />
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[9px] font-bold text-slate-400 pt-1">
                <span>Day 1 (20 Jul)</span>
                <span>Day 10 (30 Jul)</span>
                <span>Day 20 (09 Aug)</span>
                <span>Today (19 Aug)</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between text-xs pt-3 gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                <span className="font-bold text-slate-800">Wheat (Sharbati): ₹2,860/q (+4.2%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span className="font-bold text-slate-800">Soybean: ₹4,680/q (+1.8%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="font-bold text-slate-800">Mustard: ₹5,490/q (+3.5%)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Institutional Demand & Regional Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">National Commodity Procurement Demand</h3>
              <span className="text-[11px] text-slate-400">Institutional buyer tenders vs local mandi absorption</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-400">
                <th className="pb-3 font-bold">Commodity</th>
                <th className="pb-3 font-bold">Total Demand (MT)</th>
                <th className="pb-3 font-bold">Active Buyer Tenders</th>
                <th className="pb-3 font-bold">National Modal Price</th>
                <th className="pb-3 font-bold">Market Absorption Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {cropDemand.map((row) => (
                <tr key={row.crop} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 font-bold text-slate-900">{row.crop}</td>
                  <td className="py-3 font-mono font-bold">{row.totalTonnageMT.toLocaleString()} MT</td>
                  <td className="py-3 font-mono">{row.buyersActive} buyers</td>
                  <td className="py-3 font-mono font-bold text-emerald-700">₹{row.avgPrice.toLocaleString()}/q</td>
                  <td className="py-3">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200/80 font-bold text-[11px]">
                      {row.demandRating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
