import React from 'react';
import {
  Scale,
  Building2,
  Truck,
  ShieldCheck,
  TrendingUp,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Language, TRANSLATIONS } from './types';

export interface NetRealizationComparisonModalProps {
  cropName: string;
  lotQuantity: number;
  mandiPrice: number;
  mandiDistanceKm: number;
  buyerName: string;
  buyerPrice: number;
  buyerDistanceKm: number;
  buyerPickupType: string;
  lang: Language;
  onClose: () => void;
  onSelectBuyer?: () => void;
}

export const NetRealizationComparisonModal: React.FC<NetRealizationComparisonModalProps> = ({
  cropName,
  lotQuantity,
  mandiPrice,
  mandiDistanceKm,
  buyerName,
  buyerPrice,
  buyerDistanceKm,
  buyerPickupType,
  lang,
  onClose,
  onSelectBuyer,
}) => {
  const t = TRANSLATIONS[lang];
  const lot = lotQuantity > 0 ? lotQuantity : 50;

  // Option A: Local APMC Mandi Deductions
  const mandiFreightPerQtl = Math.round(15 + mandiDistanceKm * 1.25);
  const mandiCessPerQtl = Math.round((mandiPrice * 0.015) * 10) / 10; // 1.5% Mandi Tax / User fee
  const mandiLaborPerQtl = 15; // Unloading & Palledari
  const mandiWeighmentPerQtl = 10; // Weighbridge & arhatiya brokerage
  const mandiTotalDeductions = mandiFreightPerQtl + mandiCessPerQtl + mandiLaborPerQtl + mandiWeighmentPerQtl;
  const mandiNetPerQtl = Math.max(1, mandiPrice - mandiTotalDeductions);
  const mandiTotalNet = Math.round(mandiNetPerQtl * lot);

  // Option B: Direct Verified Buyer Deductions
  const isFarmGatePickup = buyerPickupType.toLowerCase().includes('farm-gate');
  const buyerFreightPerQtl = isFarmGatePickup ? 0 : Math.round(15 + buyerDistanceKm * 1.15);
  const buyerCessPerQtl = 0; // Direct trade exempt under state agriculture act
  const buyerLaborPerQtl = 0; // Handled by buyer logistics
  const buyerWeighmentPerQtl = 0; // Digital weighment covered by buyer
  const buyerTotalDeductions = buyerFreightPerQtl + buyerCessPerQtl + buyerLaborPerQtl + buyerWeighmentPerQtl;
  const buyerNetPerQtl = Math.max(1, buyerPrice - buyerTotalDeductions);
  const buyerTotalNet = Math.round(buyerNetPerQtl * lot);

  // Advantage
  const netPerQtlAdvantage = buyerNetPerQtl - mandiNetPerQtl;
  const totalLotAdvantage = buyerTotalNet - mandiTotalNet;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-5 border border-slate-200 shadow-2xl no-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                <span>Transparent Math</span>
              </span>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                {lot} Quintals Lot
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-950 font-['Outfit',sans-serif]">
              {t.netRealizationComparisonTitle}
            </h2>
            <p className="text-xs text-slate-500">
              Crop: <strong>{cropName}</strong> • Realistic side-by-side net in-hand comparison
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Advantage Highlight Banner */}
        <div className="bg-emerald-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
              {t.directSellingAdvantage}
            </span>
            <div className="text-xl font-black font-mono text-white">
              +{netPerQtlAdvantage >= 0 ? `₹${netPerQtlAdvantage.toFixed(1)}` : `₹0`}{' '}
              <span className="text-xs font-sans font-normal text-emerald-200">/ Quintal</span>
            </div>
            <p className="text-xs text-emerald-200">
              You make <strong>+₹{totalLotAdvantage.toLocaleString('en-IN')} extra</strong> on your {lot} Qtl lot by selling directly!
            </p>
          </div>
          <div className="bg-emerald-800/80 px-4 py-2 rounded-xl border border-emerald-700/60 text-right shrink-0">
            <span className="text-[10px] text-emerald-300 block font-medium">Extra Realization</span>
            <span className="text-lg font-black text-amber-300 font-mono">
              +₹{totalLotAdvantage.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Comparison Side-by-Side Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Option 1: Local Mandi */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5 font-black text-slate-800 text-sm">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>{t.nearbyMandiOption}</span>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                APMC Yard ({mandiDistanceKm} km)
              </span>
            </div>

            {/* Deductions breakdown */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-700 font-bold">
                <span>{t.grossPriceLabel}:</span>
                <span className="font-mono">₹{mandiPrice} / Qtl</span>
              </div>
              <div className="flex justify-between text-rose-700">
                <span>- Transit Freight ({mandiDistanceKm} km):</span>
                <span className="font-mono">-₹{mandiFreightPerQtl} / Qtl</span>
              </div>
              <div className="flex justify-between text-rose-700">
                <span>- {t.mandiCessTaxDeduction}:</span>
                <span className="font-mono">-₹{mandiCessPerQtl} / Qtl</span>
              </div>
              <div className="flex justify-between text-rose-700">
                <span>- {t.loadingUnloadingDeduction}:</span>
                <span className="font-mono">-₹{mandiLaborPerQtl} / Qtl</span>
              </div>
              <div className="flex justify-between text-rose-700">
                <span>- Weighbridge & Brokerage:</span>
                <span className="font-mono">-₹{mandiWeighmentPerQtl} / Qtl</span>
              </div>
            </div>

            {/* Total Net */}
            <div className="pt-2 border-t border-slate-200 space-y-1 bg-white p-3 rounded-xl border">
              <div className="flex justify-between items-baseline">
                <span className="font-black text-slate-700 text-xs">{t.finalNetInHandLabel}:</span>
                <strong className="text-base font-black text-slate-900 font-mono">
                  ₹{mandiNetPerQtl.toFixed(1)} / Qtl
                </strong>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Total Net on {lot} Qtl:</span>
                <span className="font-mono font-bold text-slate-800">₹{mandiTotalNet.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Option 2: Direct Verified Buyer */}
          <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-300 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
              <div className="flex items-center gap-1.5 font-black text-emerald-950 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{buyerName}</span>
              </div>
              <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                {buyerPickupType}
              </span>
            </div>

            {/* Deductions breakdown */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-emerald-950 font-bold">
                <span>{t.grossPriceLabel}:</span>
                <span className="font-mono font-bold">₹{buyerPrice} / Qtl</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>- Transit Freight ({buyerDistanceKm} km):</span>
                <span className="font-mono">
                  {buyerFreightPerQtl > 0 ? `-₹${buyerFreightPerQtl} / Qtl` : '₹0 (Buyer Arranged)'}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>- Mandi Cess & Taxes:</span>
                <span className="font-mono font-bold">₹0 (Govt Exemption)</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>- Loading & Unloading:</span>
                <span className="font-mono font-bold">₹0 (Paid by Buyer)</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>- Weighbridge & Escrow:</span>
                <span className="font-mono font-bold">₹0 (Free Digital)</span>
              </div>
            </div>

            {/* Total Net */}
            <div className="pt-2 border-t border-emerald-200 space-y-1 bg-white p-3 rounded-xl border border-emerald-200">
              <div className="flex justify-between items-baseline">
                <span className="font-black text-emerald-900 text-xs">{t.finalNetInHandLabel}:</span>
                <strong className="text-base font-black text-emerald-700 font-mono">
                  ₹{buyerNetPerQtl.toFixed(1)} / Qtl
                </strong>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Total Net on {lot} Qtl:</span>
                <span className="font-mono font-bold text-emerald-800">₹{buyerTotalNet.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Summary List */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <h4 className="font-black text-slate-800 uppercase text-[10px] tracking-wider">
            Why Direct Selling Yields More In-Hand Cash:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>No middleman commission (saves ~2% brokerage)</span>
            </div>
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Direct farm-gate pickup saves truck transit hassles</span>
            </div>
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>100% Escrow deposit ensures guaranteed bank payment</span>
            </div>
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Zero Mandi market fees / local cess deductions</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            {lang === 'en' ? 'Close' : 'बंद करें'}
          </button>
          {onSelectBuyer && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectBuyer();
              }}
              className="w-2/3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Sell to {buyerName}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
