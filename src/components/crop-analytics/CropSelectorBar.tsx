import React from 'react';
import {
  Sprout,
  MapPin,
  Building2,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { CROP_SELECTOR_OPTIONS } from '../../data/cropAnalyticsData';
import { Badge } from '../common/Badge';

interface CropSelectorBarProps {
  selectedCropId: string;
  onSelectCropId: (id: string) => void;
  selectedState: string;
  onSelectState: (state: string) => void;
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
  selectedMandi: string;
  onSelectMandi: (mandi: string) => void;
  onResetToDefaults: () => void;
}

export const CropSelectorBar: React.FC<CropSelectorBarProps> = ({
  selectedCropId,
  onSelectCropId,
  selectedState,
  onSelectState,
  selectedDistrict,
  onSelectDistrict,
  selectedMandi,
  onSelectMandi,
  onResetToDefaults,
}) => {
  const selectedOption =
    CROP_SELECTOR_OPTIONS.find((c) => c.id === selectedCropId) || CROP_SELECTOR_OPTIONS[0];

  const ALL_STATES = [
    'Madhya Pradesh',
    'Gujarat',
    'Haryana',
    'Punjab',
    'Maharashtra',
    'Rajasthan',
    'Karnataka',
    'Andhra Pradesh',
  ];

  const DISTRICT_MAP: Record<string, string[]> = {
    'Madhya Pradesh': ['Sehore', 'Indore', 'Dewas', 'Bhopal', 'Ujjain', 'Harda'],
    'Gujarat': ['Rajkot', 'Surendranagar', 'Amreli', 'Surat', 'Junagadh'],
    'Haryana': ['Karnal', 'Kurukshetra', 'Ambala', 'Sirsa', 'Panipat'],
    'Punjab': ['Ludhiana', 'Patiala', 'Fazilka', 'Bathinda', 'Amritsar'],
    'Maharashtra': ['Latur', 'Nashik', 'Akola', 'Ahmednagar'],
    'Rajasthan': ['Bharatpur', 'Alwar', 'Kota', 'Sri Ganganagar'],
    'Karnataka': ['Kolar', 'Davangere', 'Belagavi'],
    'Andhra Pradesh': ['Guntur', 'Kurnool', 'Krishna'],
  };

  const currentDistricts = DISTRICT_MAP[selectedState] || ['Sehore', 'Indore', 'Dewas'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
      
      {/* Top Header Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold shadow-xs">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Crop Analytics & Forecast Parameter Selection
              </h3>
              <Badge variant="purple" size="sm">
                Predictive AI Engine
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500">
              Select commodity, origin district, and benchmark terminal to generate probabilistic price forecasts and demand models.
            </p>
          </div>
        </div>

        {/* Quick Commodity Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CROP_SELECTOR_OPTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                onSelectCropId(c.id);
                onSelectState(c.state);
                onSelectDistrict(c.district);
                onSelectMandi(c.defaultMandi);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCropId === c.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>🌾 {c.name}</span>
              <span className="text-[10px] opacity-80 hidden sm:inline">({c.variety.split(' ')[0]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3-Field Selection Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        
        {/* 1. Crop Selection */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>Target Crop & Variety</span>
          </label>
          <select
            value={selectedCropId}
            onChange={(e) => {
              const newId = e.target.value;
              const match = CROP_SELECTOR_OPTIONS.find((c) => c.id === newId);
              if (match) {
                onSelectCropId(newId);
                onSelectState(match.state);
                onSelectDistrict(match.district);
                onSelectMandi(match.defaultMandi);
              }
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
          >
            {CROP_SELECTOR_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - {c.variety}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Location (State & District) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Location (State / District)</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <select
              value={selectedState}
              onChange={(e) => {
                const newState = e.target.value;
                onSelectState(newState);
                const firstDistrict = DISTRICT_MAP[newState]?.[0] || 'Sehore';
                onSelectDistrict(firstDistrict);
              }}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer text-xs"
            >
              {ALL_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => onSelectDistrict(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer text-xs"
            >
              {currentDistricts.map((dst) => (
                <option key={dst} value={dst}>
                  {dst}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Market (APMC Terminal) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Primary Benchmark APMC</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={selectedMandi}
              onChange={(e) => onSelectMandi(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 text-xs"
              placeholder="e.g. Sehore APMC Yard"
            />
          </div>
        </div>

      </div>

    </div>
  );
};
