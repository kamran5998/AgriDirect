import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  TrendingUp,
  TrendingDown,
  Truck,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Badge, TrendBadge } from '../common/Badge';
import { Button } from '../common/Button';

interface MarketComparisonItem {
  id: string;
  mandi: string;
  location: string;
  crop: string;
  variety: string;
  currentPrice: number;
  benchmarkPrice: number;
  change: number;
  demand: 'Surge' | 'High' | 'Moderate' | 'Steady';
  distanceKm: number;
  transportCostPerQtl: number;
  netRealization: number;
  status: 'Auction Active' | 'Trading Normal' | 'Auction Closing';
  arrivals: string;
}

const COMPARISON_DATA: MarketComparisonItem[] = [
  {
    id: 'comp-1',
    mandi: 'Sehore APMC Mandi',
    location: 'Sehore, MP',
    crop: 'Wheat',
    variety: 'Sharbati (Grade A)',
    currentPrice: 2860,
    benchmarkPrice: 2860,
    change: 2.8,
    demand: 'Surge',
    distanceKm: 8,
    transportCostPerQtl: 25,
    netRealization: 2835,
    status: 'Auction Active',
    arrivals: '4,200 q',
  },
  {
    id: 'comp-2',
    mandi: 'Indore Grain Terminal',
    location: 'Indore, MP',
    crop: 'Wheat',
    variety: 'Sharbati (Grade A)',
    currentPrice: 2980,
    benchmarkPrice: 2860,
    change: 3.4,
    demand: 'Surge',
    distanceKm: 58,
    transportCostPerQtl: 65,
    netRealization: 2915, // +80/q Net Profit over local
    status: 'Auction Active',
    arrivals: '12,500 q',
  },
  {
    id: 'comp-3',
    mandi: 'Dewas Krishi Mandi',
    location: 'Dewas, MP',
    crop: 'Wheat',
    variety: 'Lokwan Milling',
    currentPrice: 2820,
    benchmarkPrice: 2860,
    change: 1.2,
    demand: 'High',
    distanceKm: 36,
    transportCostPerQtl: 45,
    netRealization: 2775,
    status: 'Trading Normal',
    arrivals: '3,800 q',
  },
  {
    id: 'comp-4',
    mandi: 'Bhopal Karond Mandi',
    location: 'Bhopal, MP',
    crop: 'Wheat',
    variety: 'Sharbati (FAQ)',
    currentPrice: 2890,
    benchmarkPrice: 2860,
    change: 2.1,
    demand: 'High',
    distanceKm: 42,
    transportCostPerQtl: 50,
    netRealization: 2840,
    status: 'Auction Active',
    arrivals: '5,100 q',
  },
  {
    id: 'comp-5',
    mandi: 'Ujjain APMC Yard',
    location: 'Ujjain, MP',
    crop: 'Wheat',
    variety: 'Lokwan Heavy',
    currentPrice: 2810,
    benchmarkPrice: 2860,
    change: -0.6,
    demand: 'Moderate',
    distanceKm: 85,
    transportCostPerQtl: 95,
    netRealization: 2715,
    status: 'Trading Normal',
    arrivals: '6,400 q',
  },
];

interface MarketComparisonTableProps {
  onSelectMandi?: (mandi: MarketComparisonItem) => void;
}

export const MarketComparisonTable: React.FC<MarketComparisonTableProps> = ({
  onSelectMandi,
}) => {
  const [filterCrop, setFilterCrop] = useState<string>('Wheat');
  const [selectedItemForArbitrage, setSelectedItemForArbitrage] = useState<MarketComparisonItem | null>(null);

  // Baseline local net realization
  const localMandi = COMPARISON_DATA[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
      
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Inter-Mandi Comparison & Net Arbitrage
            </span>
            <Badge variant="blue" size="sm">
              Distance-Adjusted Net Gain
            </Badge>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1 font-['Outfit',sans-serif]">
            Compare Prices Across Regional Mandis
          </h3>
          <p className="text-xs text-slate-500">
            Calculates transport costs automatically to reveal your actual net payout after freight.
          </p>
        </div>

        {/* Crop Filter Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Crop:</span>
          <select
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="Wheat">🌾 Wheat (Sharbati)</option>
            <option value="Soybean">🌱 Soybean (Yellow)</option>
            <option value="Basmati">🍚 Basmati 1121</option>
          </select>
        </div>
      </div>

      {/* Comparison Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/70">
              <th className="py-3 px-4 rounded-l-xl">Market / APMC</th>
              <th className="py-3 px-3">Crop Variety</th>
              <th className="py-3 px-3 text-right">Spot Price</th>
              <th className="py-3 px-3 text-center">24h Trend</th>
              <th className="py-3 px-3 text-center">Demand</th>
              <th className="py-3 px-3 text-center">Distance & Freight</th>
              <th className="py-3 px-3 text-right">Net Realization</th>
              <th className="py-3 px-4 text-center rounded-r-xl">Status & Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {COMPARISON_DATA.map((item) => {
              const netDifference = item.netRealization - localMandi.netRealization;
              const isBestNet = netDifference > 0;

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isBestNet ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  {/* Mandi Name */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{item.mandi}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{item.location}</span>
                    </div>
                  </td>

                  {/* Crop & Variety */}
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-800">{item.crop}</div>
                    <div className="text-[11px] text-slate-500">{item.variety}</div>
                  </td>

                  {/* Spot Price */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="font-extrabold text-slate-900 font-mono text-sm">
                      ₹{item.currentPrice.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">/ quintal</div>
                  </td>

                  {/* 24h Trend */}
                  <td className="py-3.5 px-3 text-center">
                    <TrendBadge change={item.change} size="sm" />
                  </td>

                  {/* Demand */}
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.demand === 'Surge'
                          ? 'bg-purple-100 text-purple-700'
                          : item.demand === 'High'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.demand}
                    </span>
                  </td>

                  {/* Distance & Freight */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="font-bold text-slate-800 flex items-center justify-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.distanceKm} km</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      -₹{item.transportCostPerQtl}/q freight
                    </div>
                  </td>

                  {/* Net Realization */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="font-extrabold text-slate-900 font-mono text-sm">
                      ₹{item.netRealization.toLocaleString()}
                    </div>
                    {netDifference > 0 ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        +₹{netDifference}/q extra profit
                      </span>
                    ) : netDifference === 0 ? (
                      <span className="text-[10px] text-slate-400">Local Benchmark</span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        -₹{Math.abs(netDifference)}/q lower
                      </span>
                    )}
                  </td>

                  {/* Status & Action */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => setSelectedItemForArbitrage(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isBestNet
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isBestNet ? 'Lock Arbitrage' : 'View Details'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Arbitrage Calculator Modal */}
      {selectedItemForArbitrage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Freight & Net Realization Breakdown
                </h4>
                <p className="text-xs text-slate-500">
                  {selectedItemForArbitrage.mandi} ({selectedItemForArbitrage.distanceKm} km from farm)
                </p>
              </div>
              <Badge variant="emerald" size="sm">
                Verified Mandi
              </Badge>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="text-slate-600">Offered Spot Price:</span>
                <span className="font-mono font-bold text-slate-900">
                  ₹{selectedItemForArbitrage.currentPrice} / quintal
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="text-slate-600">Estimated Transport / Freight Cost:</span>
                <span className="font-mono font-bold text-amber-700">
                  -₹{selectedItemForArbitrage.transportCostPerQtl} / quintal
                </span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-baseline">
                <span className="font-bold text-emerald-900">Net Farmer Gate Payout:</span>
                <span className="font-mono text-lg font-extrabold text-emerald-700">
                  ₹{selectedItemForArbitrage.netRealization} / quintal
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 text-white text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Arbitrage Recommendation</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Transporting 100 quintals to {selectedItemForArbitrage.mandi} yields an estimated{' '}
                <strong className="text-white">
                  +₹{((selectedItemForArbitrage.netRealization - localMandi.netRealization) * 100).toLocaleString()}
                </strong>{' '}
                in total extra profit after all diesel and driver fees.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setSelectedItemForArbitrage(null)}
                className="w-1/3"
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setSelectedItemForArbitrage(null)}
                className="w-2/3 font-bold"
              >
                Book Transport Partner
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
