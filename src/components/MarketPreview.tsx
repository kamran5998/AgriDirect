import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, TrendingUp, TrendingDown, MapPin, Eye, Radio, Sparkles, RefreshCw } from 'lucide-react';
import { CROP_MARKET_DATA } from '../data/marketData';
import { CropCategory, CropMarketItem } from '../types';
import { Badge, TrendBadge } from './common/Badge';
import { Button } from './common/Button';

interface MarketPreviewProps {
  onSelectCrop: (crop: CropMarketItem) => void;
  onOpenGetStarted: () => void;
}

export const MarketPreview: React.FC<MarketPreviewProps> = ({ onSelectCrop, onOpenGetStarted }) => {
  const [selectedCategory, setSelectedCategory] = useState<CropCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [sortField, setSortField] = useState<'price' | 'change' | 'name'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [lastRefreshed, setLastRefreshed] = useState('Just now');

  const categories: CropCategory[] = ['All', 'Grains', 'Pulses', 'Vegetables', 'Fruits', 'Cash Crops', 'Oilseeds'];

  const states = ['All States', 'Madhya Pradesh', 'Haryana', 'Gujarat', 'Rajasthan', 'Maharashtra', 'Andhra Pradesh', 'Karnataka', 'Tamil Nadu', 'Bihar', 'Delhi (NCR)'];

  const filteredCrops = useMemo(() => {
    return CROP_MARKET_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesState = selectedState === 'All States' || item.state === selectedState;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.mandi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.district.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesState && matchesSearch;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'price') {
        comparison = a.currentPrice - b.currentPrice;
      } else if (sortField === 'change') {
        comparison = a.change - b.change;
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [selectedCategory, selectedState, searchQuery, sortField, sortOrder]);

  const toggleSort = (field: 'price' | 'change' | 'name') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleRefresh = () => {
    setLastRefreshed('Updated 2s ago');
  };

  return (
    <section id="markets" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Radio className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
              Live Commodity Exchange Feeds
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight font-['Outfit',sans-serif]">
              National Mandi Price Intelligence Terminal
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl font-normal">
              Explore real-time modal spot prices, arrival volumes, and historical 7-day trajectories across major APMC markets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lastRefreshed}</span>
            </button>
            <Button variant="primary" size="md" onClick={onOpenGetStarted}>
              Track My Specific Mandi
            </Button>
          </div>
        </div>

        {/* Filters and Controls Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 mb-6 space-y-4">
          
          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar & State Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-slate-100">
            
            <div className="sm:col-span-8 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by crop name (e.g. Wheat, Basmati), variety, or APMC mandi..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="sm:col-span-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Live Market Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              
              {/* Table Head */}
              <thead className="bg-slate-900 text-slate-200 border-b border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-emerald-400 transition-colors"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Crop & Standard Variety</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Market / APMC Mandi</th>
                  <th
                    className="py-3.5 px-4 text-right cursor-pointer hover:text-emerald-400 transition-colors"
                    onClick={() => toggleSort('price')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Current Spot Price</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 text-center cursor-pointer hover:text-emerald-400 transition-colors"
                    onClick={() => toggleSort('change')}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>24h Change</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-center hidden md:table-cell">7-Day Trend</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">Daily Arrivals</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell text-center">Buyer Demand</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-100">
                {filteredCrops.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                        <Search className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-700">No matching commodities found</p>
                      <p className="text-xs text-slate-400 mt-0.5">Try adjusting your category filter or search query.</p>
                    </td>
                  </tr>
                ) : (
                  filteredCrops.map((crop) => {
                    const isPositive = crop.change >= 0;
                    return (
                      <tr
                        key={crop.id}
                        onClick={() => onSelectCrop(crop)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        {/* Crop Name & Variety */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {crop.name}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span>{crop.variety}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500 font-medium">{crop.category}</span>
                          </div>
                        </td>

                        {/* Mandi & Location */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                            {crop.mandi}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {crop.district}, {crop.state}
                          </div>
                        </td>

                        {/* Current Spot Price */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-bold text-slate-900 font-mono text-sm">
                            ₹{crop.currentPrice.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Range: ₹{crop.minPrice} - ₹{crop.maxPrice}
                          </div>
                        </td>

                        {/* 24h Change */}
                        <td className="py-3.5 px-4 text-center">
                          <TrendBadge change={crop.change} size="sm" />
                        </td>

                        {/* 7-Day Sparkline Mini Chart */}
                        <td className="py-3.5 px-4 hidden md:table-cell">
                          <div className="flex items-end justify-center gap-1 h-6 w-20 mx-auto">
                            {crop.sparkline.map((pt, i) => {
                              const min = Math.min(...crop.sparkline) * 0.98;
                              const max = Math.max(...crop.sparkline) * 1.02;
                              const height = Math.max(15, ((pt - min) / (max - min)) * 100);
                              return (
                                <div
                                  key={i}
                                  className={`w-1.5 rounded-xs transition-all ${
                                    isPositive ? 'bg-emerald-500/70 group-hover:bg-emerald-600' : 'bg-rose-400/70 group-hover:bg-rose-500'
                                  }`}
                                  style={{ height: `${height}%` }}
                                ></div>
                              );
                            })}
                          </div>
                        </td>

                        {/* Daily Arrivals */}
                        <td className="py-3.5 px-4 hidden lg:table-cell">
                          <div className="font-medium text-slate-800">{crop.arrivalVolume}</div>
                          <div className="text-[10px] text-slate-400">{crop.lastUpdated}</div>
                        </td>

                        {/* Buyer Demand */}
                        <td className="py-3.5 px-4 hidden sm:table-cell text-center">
                          <Badge
                            variant={
                              crop.demandIndex === 'Surge'
                                ? 'emerald'
                                : crop.demandIndex === 'High'
                                ? 'blue'
                                : 'slate'
                            }
                            size="sm"
                          >
                            {crop.demandIndex} ({crop.activeBuyers})
                          </Badge>
                        </td>

                        {/* Action CTA */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCrop(crop);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <strong>{filteredCrops.length}</strong> of <strong>{CROP_MARKET_DATA.length}</strong> active benchmark commodities.
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>All prices normalized to Standard Indian Quintal (100 kg)</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
