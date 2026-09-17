import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  Building,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Percent,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Star,
  Truck,
} from 'lucide-react';
import { VerifiedBuyer, VERIFIED_BUYERS_DATA } from '../../data/directMarketData';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface BuyerMarketplaceProps {
  onSelectBuyerForDetails: (buyer: VerifiedBuyer) => void;
  onOpenSupplyOffer: (buyer: VerifiedBuyer) => void;
  farmerDistrict?: string;
  farmerState?: string;
}

export const BuyerMarketplace: React.FC<BuyerMarketplaceProps> = ({
  onSelectBuyerForDetails,
  onOpenSupplyOffer,
  farmerDistrict = 'Sehore',
  farmerState = 'Madhya Pradesh',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedBuyerType, setSelectedBuyerType] = useState('All');
  const [maxDistance, setMaxDistance] = useState('100');
  const [minQuantity, setMinQuantity] = useState('0');
  const [sortBy, setSortBy] = useState<'price_desc' | 'distance_asc' | 'rating_desc'>('price_desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const cropOptions = ['All', 'Wheat', 'Soybean', 'Mustard Seed', 'Cotton', 'Basmati Paddy', 'Chana (Bengal Gram)'];
  const buyerTypeOptions = [
    'All',
    'Corporate Food Processor',
    'Agri Export House',
    'Govt & FPO Collective',
    'Solvent & Oil Mill',
  ];

  const filteredBuyers = useMemo(() => {
    return VERIFIED_BUYERS_DATA.filter((buyer) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = buyer.name.toLowerCase().includes(q);
        const matchesCrop = buyer.cropTarget.toLowerCase().includes(q);
        const matchesLocation = buyer.location.toLowerCase().includes(q);
        const matchesEntity = buyer.legalEntity.toLowerCase().includes(q);
        if (!matchesName && !matchesCrop && !matchesLocation && !matchesEntity) return false;
      }

      // Crop
      if (selectedCrop !== 'All' && !buyer.cropTarget.toLowerCase().includes(selectedCrop.toLowerCase().split(' ')[0])) {
        return false;
      }

      // Buyer type
      if (selectedBuyerType !== 'All' && buyer.type !== selectedBuyerType) {
        return false;
      }

      // Distance
      if (buyer.distanceKm > parseInt(maxDistance, 10)) {
        return false;
      }

      // Min Quantity
      if (buyer.volumeWantedQuintals < parseInt(minQuantity, 10)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_desc') return b.priceOfferedPerQuintal - a.priceOfferedPerQuintal;
      if (sortBy === 'distance_asc') return a.distanceKm - b.distanceKm;
      if (sortBy === 'rating_desc') return b.kycVerification.rating - a.kycVerification.rating;
      return 0;
    });
  }, [searchQuery, selectedCrop, selectedBuyerType, maxDistance, minQuantity, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCrop('All');
    setSelectedBuyerType('All');
    setMaxDistance('200');
    setMinQuantity('0');
    setSortBy('price_desc');
  };

  const totalDemandQuintals = useMemo(() => {
    return VERIFIED_BUYERS_DATA.reduce((acc, curr) => acc + curr.volumeWantedQuintals, 0);
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Procurement Metrics */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Verified Institutional Buyer Tenders
            </span>
            <Badge variant="emerald" size="sm">
              0% Middleman Commission
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif] tracking-tight">
            Direct Institutional Procurement Network
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Contract directly with food processors, exporters, and government-backed FPO apex federations with guaranteed digital escrow protection.
          </p>
        </div>

        {/* 3 Quick Metric Badges */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center min-w-[100px]">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Active Tenders</span>
            <span className="text-lg font-black text-emerald-950 font-mono">{VERIFIED_BUYERS_DATA.length}</span>
          </div>
          <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-center min-w-[100px]">
            <span className="text-[10px] font-bold text-purple-800 uppercase block">Open Demand</span>
            <span className="text-lg font-black text-purple-950 font-mono">{(totalDemandQuintals / 10).toFixed(0)} MT</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-center min-w-[100px]">
            <span className="text-[10px] font-bold text-blue-800 uppercase block">Avg Premium</span>
            <span className="text-lg font-black text-blue-950 font-mono">+₹96/q</span>
          </div>
        </div>
      </div>

      {/* Search & Multi-Filter Control Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
        
        {/* Main Search Input & Quick Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by buyer name, crop (Wheat, Soybean), location, or tender entity..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700">
              <span className="text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="price_desc">Highest Price Offered</option>
                <option value="distance_asc">Closest Distance</option>
                <option value="rating_desc">Highest Trust Rating</option>
              </select>
            </div>

            {/* Toggle Advanced Filters Button */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                showAdvancedFilters
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(selectedCrop !== 'All' || selectedBuyerType !== 'All' || maxDistance !== '100') && (
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              )}
            </button>
          </div>

        </div>

        {/* Quick Crop Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 mr-1 shrink-0">Crops:</span>
          {cropOptions.map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCrop === crop
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>

        {/* Advanced Filters Expandable Drawer */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-in slide-in-from-top-1 duration-150">
            <div>
              <label className="block text-slate-500 font-bold mb-1">Buyer Category</label>
              <select
                value={selectedBuyerType}
                onChange={(e) => setSelectedBuyerType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {buyerTypeOptions.map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-bold mb-1">Max Distance Radius ({maxDistance} km)</label>
              <input
                type="range"
                min="15"
                max="200"
                step="5"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                className="w-full accent-emerald-600 cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>15 km</span>
                <span>100 km</span>
                <span>200 km</span>
              </div>
            </div>

            <div className="flex items-end justify-between sm:justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                icon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reset All
              </Button>
            </div>
          </div>
        )}

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <div className="text-xs font-bold text-slate-500">
          Showing <span className="text-slate-900 font-mono">{filteredBuyers.length}</span> verified buyer tenders
        </div>
        <div className="text-[11px] text-slate-400">
          All contracts backed by verified KYC & Digital Escrow
        </div>
      </div>

      {/* Buyer Cards Grid */}
      {filteredBuyers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No buyer tenders matched your filters</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try expanding your distance radius or selecting "All" crops to view tenders across surrounding districts.
          </p>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Reset Search Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredBuyers.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between gap-5 hover:border-slate-300 hover:shadow-md transition-all duration-200"
            >
              {/* Top Row: Buyer Avatar, Name, Verification */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                      {b.logoText}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {b.name}
                        </h3>
                        <Badge variant="emerald" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                          {b.badgeType}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                        {b.type} • {b.kycVerification.yearsInProcurement} yrs active
                      </p>
                    </div>
                  </div>

                  {/* Rating Pill */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold shrink-0">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>{b.kycVerification.rating}</span>
                  </div>
                </div>

                {/* Target Commodity & Volume */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Commodity Needed:</span>
                    <span className="font-bold text-slate-900">{b.cropTarget} ({b.varietySpec})</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Required Tonnage:</span>
                    <span className="font-bold font-mono text-slate-900">{b.volumeWantedQuintals}q (Min lot: {b.minOrderQuintals}q)</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Moisture Standard:</span>
                    <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
                      Max {b.qualitySpecs.maxMoisture}
                    </span>
                  </div>
                </div>

                {/* Location & Settlement Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{b.location} ({b.distanceKm} km)</span>
                  </div>

                  <div className="flex items-center gap-1.5 truncate">
                    <Truck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="truncate">{b.pickupPreference}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Price & Action Strip */}
              <div className="pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-950 font-mono tracking-tight">
                      ₹{b.priceOfferedPerQuintal.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500">/ quintal</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md ml-1">
                      +₹{b.premiumPerQuintal}/q Premium
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    APMC Benchmark: ₹{b.localApmcBenchmark}/q • {b.settlementTerms}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectBuyerForDetails(b)}
                    className="font-bold text-xs"
                  >
                    View Specs
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onOpenSupplyOffer(b)}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                    iconPosition="right"
                    className="font-bold text-xs shadow-xs"
                  >
                    Send Supply Offer
                  </Button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
