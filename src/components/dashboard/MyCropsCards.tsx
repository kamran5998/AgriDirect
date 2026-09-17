import React, { useState } from 'react';
import {
  Sprout,
  Plus,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { Badge, TrendBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { FarmerProfile } from '../../types';

interface MyCropsCardsProps {
  profile: FarmerProfile;
  onAddCropClick: () => void;
  onSellNowClick: (cropName: string) => void;
}

export const MyCropsCards: React.FC<MyCropsCardsProps> = ({
  profile,
  onAddCropClick,
  onSellNowClick,
}) => {
  // Pre-mapped crop metadata
  const CROP_META: Record<
    string,
    { icon: string; price: number; change: number; demand: 'Surge' | 'High' | 'Moderate'; mandi: string }
  > = {
    'Wheat (Sharbati / Lokwan)': {
      icon: '🌾',
      price: 2860,
      change: 2.8,
      demand: 'Surge',
      mandi: 'Sehore APMC Mandi',
    },
    'Soybean (Yellow Seed)': {
      icon: '🌱',
      price: 4680,
      change: 1.5,
      demand: 'High',
      mandi: 'Dewas Krishi Mandi',
    },
    'Basmati Rice (Pusa 1121/1509)': {
      icon: '🍚',
      price: 3850,
      change: 2.4,
      demand: 'Surge',
      mandi: 'Karnal Basmati Hub',
    },
    'Cotton (Shankar-6 Staple)': {
      icon: '☁️',
      price: 7240,
      change: 1.9,
      demand: 'High',
      mandi: 'Rajkot APMC Market',
    },
    'Mustard Seed (Sarson)': {
      icon: '🌻',
      price: 5490,
      change: 1.2,
      demand: 'Moderate',
      mandi: 'Bharatpur Mustard Market',
    },
  };

  const farmerCrops = profile.selectedCrops.map((cropName) => {
    const meta = CROP_META[cropName] || {
      icon: '🌾',
      price: 2800,
      change: 1.5,
      demand: 'High',
      mandi: profile.selectedMandis[0] || 'Primary Mandi',
    };
    const qty = parseInt(profile.harvestVolumes[cropName] || '100', 10);
    const totalValuation = qty * meta.price;

    return {
      name: cropName,
      qty,
      ...meta,
      totalValuation,
    };
  });

  const totalPortfolioValue = farmerCrops.reduce((acc, c) => acc + c.totalValuation, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Crop Inventory
            </span>
            <Badge variant="emerald" size="sm">
              Portfolio Value: ₹{totalPortfolioValue.toLocaleString()}
            </Badge>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1 font-['Outfit',sans-serif]">
            My Farm Produce & Valuations
          </h3>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onAddCropClick}
          icon={<Plus className="w-4 h-4" />}
          className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 self-start sm:self-auto"
        >
          Add / Update Crop
        </Button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {farmerCrops.map((crop) => (
          <div
            key={crop.name}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all relative overflow-hidden"
          >
            <div>
              {/* Top Row: Icon, Name, Demand Badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl shadow-2xs">
                    {crop.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {crop.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{crop.mandi}</p>
                  </div>
                </div>

                <TrendBadge change={crop.change} size="sm" />
              </div>

              {/* Stats Box */}
              <div className="my-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Recorded Quantity
                  </span>
                  <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                    {crop.qty} <span className="text-xs font-normal text-slate-500 font-sans">Quintals</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Current Spot Rate
                  </span>
                  <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                    ₹{crop.price.toLocaleString()} <span className="text-xs font-normal text-slate-500 font-sans">/ q</span>
                  </div>
                </div>
              </div>

              {/* Total Estimated Value */}
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-500 font-medium">Estimated Lot Valuation:</span>
                <span className="font-extrabold text-emerald-700 font-mono text-sm">
                  ₹{crop.totalValuation.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onSellNowClick(crop.name)}
                className="w-full font-bold shadow-xs text-xs"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                iconPosition="right"
              >
                Sell at Current Rate
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
