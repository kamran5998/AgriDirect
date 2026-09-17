import React, { useState } from 'react';
import {
  Filter,
  Search,
  Calendar,
  MapPin,
  Sprout,
  Building2,
  RotateCcw,
  Sparkles,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';
import { Badge } from '../common/Badge';

export interface MarketFilterState {
  crop: string;
  state: string;
  district: string;
  market: string;
  dateRange: string;
  preset: string;
  searchQuery: string;
}

interface MarketOverviewFiltersProps {
  filters: MarketFilterState;
  onFilterChange: (newFilters: Partial<MarketFilterState>) => void;
  onResetFilters: () => void;
  totalRecordsCount: number;
}

export const MarketOverviewFilters: React.FC<MarketOverviewFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalRecordsCount,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const CROP_OPTIONS = [
    'All Crops',
    'Wheat',
    'Basmati Rice',
    'Soybean',
    'Cotton',
    'Mustard Seed',
    'Chana (Gram)',
    'Red Chili',
    'Turmeric',
    'Tomato',
    'Onion',
    'Potato',
    'Maize',
  ];

  const STATE_OPTIONS = [
    'All States',
    'Madhya Pradesh',
    'Punjab',
    'Haryana',
    'Gujarat',
    'Maharashtra',
    'Rajasthan',
    'Andhra Pradesh',
    'Karnataka',
    'Tamil Nadu',
    'Uttar Pradesh',
  ];

  const DISTRICT_MAP: Record<string, string[]> = {
    'Madhya Pradesh': ['All Districts', 'Sehore', 'Indore', 'Dewas', 'Bhopal', 'Ujjain'],
    'Punjab': ['All Districts', 'Ludhiana', 'Patiala', 'Fazilka', 'Bathinda'],
    'Haryana': ['All Districts', 'Karnal', 'Kurukshetra', 'Ambala', 'Sirsa'],
    'Gujarat': ['All Districts', 'Rajkot', 'Surat', 'Amreli', 'Junagadh'],
    'Maharashtra': ['All Districts', 'Nashik', 'Latur', 'Akola', 'Ahmednagar'],
    'Rajasthan': ['All Districts', 'Bharatpur', 'Alwar', 'Kota', 'Sri Ganganagar'],
    'Andhra Pradesh': ['All Districts', 'Guntur', 'Kurnool', 'Krishna'],
    'Karnataka': ['All Districts', 'Kolar', 'Davangere', 'Belagavi'],
    'Tamil Nadu': ['All Districts', 'Erode', 'Salem', 'Coimbatore'],
    'Uttar Pradesh': ['All Districts', 'Agra', 'Aligarh', 'Mathura'],
  };

  const districtList =
    filters.state !== 'All States' && DISTRICT_MAP[filters.state]
      ? DISTRICT_MAP[filters.state]
      : ['All Districts', 'Sehore', 'Indore', 'Karnal', 'Ludhiana', 'Rajkot', 'Nashik', 'Latur', 'Guntur'];

  const DATE_RANGES = [
    { id: 'today', label: 'Today (Live)' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '3m', label: 'Last 3 Months' },
    { id: 'ytd', label: 'Year-to-Date' },
  ];

  const PRESETS = [
    { id: 'all', label: 'All Commodities' },
    { id: 'gainers', label: '🔥 Top Gainers (>2%)' },
    { id: 'high-vol', label: '📦 High Arrival Volume' },
    { id: 'surge-demand', label: '⚡ Surge Demand' },
    { id: 'msp-beat', label: '🏆 Above MSP' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
      
      {/* Top Title & Preset Chips */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold shadow-xs">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Market Query & Intelligence Filters
              </h3>
              <Badge variant="emerald" size="sm">
                {totalRecordsCount} APMC Feeds Filtered
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500">
              Filter across 2,400+ national APMC mandis, electronic auction yards, and spot terminals.
            </p>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => onFilterChange({ preset: p.id })}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filters.preset === p.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={onResetFilters}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5-Field Top Filter Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        
        {/* 1. Crop Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>Commodity / Crop</span>
          </label>
          <select
            value={filters.crop}
            onChange={(e) => onFilterChange({ crop: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
          >
            {CROP_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* 2. State Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>State</span>
          </label>
          <select
            value={filters.state}
            onChange={(e) => onFilterChange({ state: e.target.value, district: 'All Districts' })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
          >
            {STATE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* 3. District Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            <span>District / Region</span>
          </label>
          <select
            value={filters.district}
            onChange={(e) => onFilterChange({ district: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
          >
            {districtList.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Market / Mandi Type */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Market Category</span>
          </label>
          <select
            value={filters.market}
            onChange={(e) => onFilterChange({ market: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
          >
            <option value="All Mandis">All APMC & Terminals</option>
            <option value="e-NAM Integrated">e-NAM Digital Yards Only</option>
            <option value="Private Logistics Hubs">Private Institutional Hubs</option>
            <option value="Nearby (<50km)">Nearby Radius (&lt;50km)</option>
          </select>
        </div>

        {/* 5. Date Range */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            <span>Historical Window</span>
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange({ dateRange: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
          >
            {DATE_RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Global Quick Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
          placeholder="Quick search by commodity, variety (e.g. Sharbati, Pusa 1121), mandi yard, or state..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
        />
      </div>

    </div>
  );
};
