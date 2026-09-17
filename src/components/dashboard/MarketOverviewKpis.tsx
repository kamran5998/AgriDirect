import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Award,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface MarketOverviewKpisProps {
  farmerPrimaryMandi: string;
}

export const MarketOverviewKpis: React.FC<MarketOverviewKpisProps> = ({
  farmerPrimaryMandi,
}) => {
  const kpis = [
    {
      id: 'avg-price',
      title: 'Average Mandi Price',
      value: '₹2,680',
      unit: '/ quintal',
      subtext: 'Weighted avg across 8 tracked mandis',
      change: '+1.8%',
      isPositive: true,
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
      accent: 'emerald',
      sparkline: [2600, 2620, 2610, 2640, 2655, 2670, 2680],
    },
    {
      id: 'best-price',
      title: 'Best Available Price',
      value: '₹2,920',
      unit: '/ quintal',
      subtext: 'ITC e-Choupal / Indore Hub (Grade A)',
      change: '+₹240/q Arbitrage',
      isPositive: true,
      icon: <Award className="w-5 h-5 text-blue-600" />,
      accent: 'blue',
      badge: 'Arbitrage Opportunity',
      sparkline: [2800, 2820, 2850, 2870, 2890, 2900, 2920],
    },
    {
      id: 'price-change',
      title: "Today's Price Trend",
      value: '+₹75',
      unit: 'today (+2.8%)',
      subtext: `At ${farmerPrimaryMandi}`,
      change: 'Strong Bullish Trend',
      isPositive: true,
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
      accent: 'emerald',
      sparkline: [2785, 2800, 2810, 2830, 2845, 2850, 2860],
    },
    {
      id: 'active-markets',
      title: 'Active Mandis in Radius',
      value: '8 Mandis',
      unit: 'within 100 km',
      subtext: '54,200 quintals total daily arrival',
      change: '100% Ingestion Live',
      isPositive: true,
      icon: <Building2 className="w-5 h-5 text-purple-600" />,
      accent: 'purple',
      sparkline: [6, 7, 7, 8, 8, 8, 8],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {kpi.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  kpi.accent === 'emerald'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : kpi.accent === 'blue'
                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                    : 'bg-purple-50 text-purple-600 border border-purple-100'
                }`}
              >
                {kpi.icon}
              </div>
            </div>

            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {kpi.value}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {kpi.unit}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
              {kpi.subtext}
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{kpi.change}</span>
            </div>

            {/* Mini SVG Sparkline */}
            <div className="w-16 h-6">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 60 20">
                <polyline
                  fill="none"
                  stroke={kpi.accent === 'blue' ? '#3B82F6' : kpi.accent === 'purple' ? '#8B5CF6' : '#10B981'}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={kpi.sparkline
                    .map((val, idx) => {
                      const min = Math.min(...kpi.sparkline);
                      const max = Math.max(...kpi.sparkline);
                      const range = max - min || 1;
                      const x = (idx / (kpi.sparkline.length - 1)) * 58 + 1;
                      const y = 18 - ((val - min) / range) * 14;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
