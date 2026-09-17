import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  MapPin,
  Clock,
  ArrowUpDown,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { MarketPriceRecord } from '../../data/marketIntelligenceData';
import { Badge, TrendBadge } from '../common/Badge';

interface LiveMarketPricesTableProps {
  records: MarketPriceRecord[];
  selectedForComparison: string[];
  onToggleCompare: (recordId: string) => void;
  onSelectCropDetail: (record: MarketPriceRecord) => void;
}

export const LiveMarketPricesTable: React.FC<LiveMarketPricesTableProps> = ({
  records,
  selectedForComparison,
  onToggleCompare,
  onSelectCropDetail,
}) => {
  const [sortField, setSortField] = useState<keyof MarketPriceRecord>('currentPrice');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: keyof MarketPriceRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedRecords = [...records].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return 0;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Table Header Strip */}
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
              Live Commodity & APMC Spot Price Matrix
            </h3>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live Agmarknet Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Select items using checkboxes to compare multiple mandis side-by-side.
          </p>
        </div>

        {selectedForComparison.length > 0 && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-bold text-emerald-800">
              {selectedForComparison.length} Markets Selected
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">(Max 4)</span>
          </div>
        )}
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">
              <th className="py-3 px-3 text-center w-10">Compare</th>
              <th
                onClick={() => handleSort('cropName')}
                className="py-3 px-3 cursor-pointer hover:text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Commodity & Variety</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('mandi')}
                className="py-3 px-3 cursor-pointer hover:text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Market (Mandi)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('currentPrice')}
                className="py-3 px-3 text-right cursor-pointer hover:text-slate-700 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Current Spot</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-right hidden md:table-cell">Min - Max Band</th>
              <th className="py-3 px-3 text-right hidden lg:table-cell">Modal / Avg</th>
              <th
                onClick={() => handleSort('change')}
                className="py-3 px-3 text-center cursor-pointer hover:text-slate-700 transition-colors"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>24h Change</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Demand</th>
              <th className="py-3 px-3 text-center hidden sm:table-cell">7D Trend</th>
              <th className="py-3 px-3 text-right hidden xl:table-cell">Arrivals</th>
              <th className="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-medium">
            {sortedRecords.map((item) => {
              const isSelected = selectedForComparison.includes(item.id);
              const minVal = Math.min(...item.sparkline);
              const maxVal = Math.max(...item.sparkline);
              const range = maxVal - minVal || 1;

              // Sparkline points SVG
              const svgPoints = item.sparkline
                .map((val, idx) => {
                  const x = (idx / (item.sparkline.length - 1)) * 64;
                  const y = 20 - ((val - minVal) / range) * 16;
                  return `${x},${y}`;
                })
                .join(' ');

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    isSelected ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  {/* Compare Checkbox */}
                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={() => onToggleCompare(item.id)}
                      className="text-slate-400 hover:text-emerald-600 cursor-pointer p-1"
                      title={isSelected ? 'Remove from Comparison' : 'Add to Comparison'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                      )}
                    </button>
                  </td>

                  {/* Commodity & Variety */}
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{item.cropName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[170px]">
                      {item.variety}
                    </div>
                  </td>

                  {/* Mandi & Location */}
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate max-w-[150px]">{item.mandi}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {item.district}, {item.state}
                      </span>
                    </div>
                  </td>

                  {/* Current Spot Price */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="font-extrabold text-slate-900 font-mono text-sm">
                      ₹{item.currentPrice.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">/ quintal</div>
                  </td>

                  {/* Min - Max Band */}
                  <td className="py-3.5 px-3 text-right hidden md:table-cell">
                    <div className="font-mono text-xs text-slate-600 font-semibold">
                      ₹{item.minPrice} - ₹{item.maxPrice}
                    </div>
                    <div className="text-[10px] text-slate-400">Trading Spread</div>
                  </td>

                  {/* Modal / Avg */}
                  <td className="py-3.5 px-3 text-right hidden lg:table-cell">
                    <div className="font-mono text-xs text-slate-800 font-bold">
                      ₹{item.avgPrice.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">Modal Quote</div>
                  </td>

                  {/* 24h Change */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="flex flex-col items-center">
                      <TrendBadge change={item.change} size="sm" />
                      <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {item.changeAmount >= 0 ? `+₹${item.changeAmount}` : `-₹${Math.abs(item.changeAmount)}`}
                      </span>
                    </div>
                  </td>

                  {/* Demand Level */}
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.demandLevel === 'Surge'
                          ? 'bg-purple-100 text-purple-700'
                          : item.demandLevel === 'High'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.demandLevel === 'Moderate'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.demandLevel}
                    </span>
                  </td>

                  {/* 7D Trend Sparkline */}
                  <td className="py-3.5 px-3 text-center hidden sm:table-cell">
                    <div className="w-16 h-6 mx-auto">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 64 24">
                        <polyline
                          fill="none"
                          stroke={item.change >= 0 ? '#10b981' : '#ef4444'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={svgPoints}
                        />
                      </svg>
                    </div>
                  </td>

                  {/* Arrivals & Last Updated */}
                  <td className="py-3.5 px-3 text-right hidden xl:table-cell">
                    <div className="font-mono font-bold text-slate-800 text-xs">
                      {item.arrivalVolume.toLocaleString()} q
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{item.lastUpdated}</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={() => onSelectCropDetail(item)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-lg text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
