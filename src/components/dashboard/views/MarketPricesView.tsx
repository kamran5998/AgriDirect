import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  TrendingUp,
  MapPin,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Badge, TrendBadge } from '../../common/Badge';
import { Button } from '../../common/Button';
import { CROP_MARKET_DATA } from '../../../data/marketData';
import { CropMarketItem } from '../../../types';

interface MarketPricesViewProps {
  onSelectCrop: (crop: CropMarketItem) => void;
}

export const MarketPricesView: React.FC<MarketPricesViewProps> = ({ onSelectCrop }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All States');

  const categories = ['All', 'Grains', 'Oilseeds', 'Pulses', 'Cash Crops', 'Vegetables'];
  const states = ['All States', 'Madhya Pradesh', 'Punjab', 'Haryana', 'Gujarat', 'Maharashtra', 'Rajasthan'];

  const filteredCrops = CROP_MARKET_DATA.filter((crop) => {
    const matchesSearch =
      crop.name.toLowerCase().includes(search.toLowerCase()) ||
      crop.mandi.toLowerCase().includes(search.toLowerCase()) ||
      crop.variety.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || crop.category === category;
    const matchesState = selectedState === 'All States' || crop.state === selectedState;
    return matchesSearch && matchesCategory && matchesState;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="emerald" size="sm">National Mandi Exchange</Badge>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 font-['Outfit',sans-serif]">
            Real-Time APMC Spot & Modal Prices
          </h2>
          <p className="text-xs text-slate-500">
            Live prices synchronized from AGMARKNET & e-NAM electronic trading platforms.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commodity name, variety or mandi..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* State Filter */}
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                category === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Prices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCrops.map((crop) => (
          <div
            key={crop.id}
            onClick={() => onSelectCrop(crop)}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 p-5 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {crop.category} • {crop.qualityGrade.split(' ')[0]}
                </span>
                <TrendBadge change={crop.change} size="sm" />
              </div>

              <h3 className="text-base font-bold text-slate-900">{crop.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {crop.mandi} ({crop.state})
              </p>

              <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Spot Rate</span>
                  <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                    ₹{crop.currentPrice.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ q</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Daily Arrival</span>
                  <div className="text-xs font-bold text-slate-700 font-mono mt-0.5">{crop.arrivalVolume}</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">{crop.activeBuyers} Active Buyers</span>
              <span className="font-bold text-emerald-700 hover:underline flex items-center gap-1">
                Details & Depth →
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
