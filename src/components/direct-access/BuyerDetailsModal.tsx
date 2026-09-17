import React from 'react';
import {
  X,
  ShieldCheck,
  Building,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  Truck,
  Award,
  FileText,
  Star,
  ArrowRight,
  TrendingUp,
  Percent,
  Layers,
  Scale,
  Sparkles,
} from 'lucide-react';
import { VerifiedBuyer } from '../../data/directMarketData';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface BuyerDetailsModalProps {
  buyer: VerifiedBuyer | null;
  onClose: () => void;
  onOpenSupplyOffer: (buyer: VerifiedBuyer) => void;
}

export const BuyerDetailsModal: React.FC<BuyerDetailsModalProps> = ({
  buyer,
  onClose,
  onOpenSupplyOffer,
}) => {
  if (!buyer) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-600/20">
              {buyer.logoText}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 leading-tight font-['Outfit',sans-serif]">
                  {buyer.name}
                </h3>
                <Badge variant="emerald" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                  {buyer.badgeType}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {buyer.legalEntity} • {buyer.type}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow text-slate-800">
          
          {/* Key Offer Banner */}
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Active Direct Purchase Tender
              </span>
              <div className="text-2xl sm:text-3xl font-black font-['Outfit',sans-serif] tracking-tight">
                ₹{buyer.priceOfferedPerQuintal.toLocaleString()}
                <span className="text-xs sm:text-sm font-normal text-emerald-200 ml-1.5 font-sans">
                  / Quintal (Net Farm-gate / Depot)
                </span>
              </div>
              <div className="text-xs text-emerald-300 flex items-center gap-2">
                <span className="font-semibold text-white bg-emerald-700/60 px-2 py-0.5 rounded">
                  +₹{buyer.premiumPerQuintal}/q Premium
                </span>
                <span>vs Local APMC Spot rate (₹{buyer.localApmcBenchmark}/q)</span>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-emerald-800/80 pt-3 sm:pt-0 sm:pl-6 shrink-0">
              <div className="text-xs text-emerald-200">Required Quantity</div>
              <div className="text-xl font-bold font-mono text-white">
                {buyer.volumeWantedQuintals} <span className="text-xs text-slate-300">Quintals</span>
              </div>
              <div className="text-[11px] text-emerald-400 mt-0.5">
                Min. Lot: {buyer.minOrderQuintals}q • {buyer.procurementStatus}
              </div>
            </div>
          </div>

          {/* Verification & KYC Credentials */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Government & Legal Credentials
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">GSTIN Registration</span>
                <span className="font-mono font-bold text-slate-900">{buyer.kycVerification.gstin}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">e-NAM Member ID</span>
                <span className="font-mono font-bold text-emerald-700">{buyer.kycVerification.enamMemberId}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">FSSAI Procurement License</span>
                <span className="font-mono font-bold text-slate-900">{buyer.kycVerification.fssaiLicense}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">Procurement History</span>
                <span className="font-bold text-slate-900">{buyer.kycVerification.totalTonnageProcured} ({buyer.kycVerification.yearsInProcurement} yrs)</span>
              </div>
            </div>
          </div>

          {/* Quality Standards & Testing Specifications */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-600" />
              Required Quality Specs & Lab Tolerances
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                <span className="text-slate-500 block text-[11px]">Maximum Moisture</span>
                <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">{buyer.qualitySpecs.maxMoisture}</span>
                <span className="text-[10px] text-blue-600">Digital moisture meter test</span>
              </div>
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                <span className="text-slate-500 block text-[11px]">Foreign Matter Limit</span>
                <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">{buyer.qualitySpecs.foreignMatterLimit}</span>
                <span className="text-[10px] text-blue-600">Free from stones/dust</span>
              </div>
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                <span className="text-slate-500 block text-[11px]">Damaged / Broken Grains</span>
                <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">{buyer.qualitySpecs.grainDamageLimit}</span>
                <span className="text-[10px] text-blue-600">FAQ standard sorting</span>
              </div>
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                <span className="text-slate-500 block text-[11px]">Other Crop Admixture</span>
                <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">{buyer.qualitySpecs.admixtureTolerance}</span>
                <span className="text-[10px] text-blue-600">Single-variety lot</span>
              </div>
            </div>
          </div>

          {/* Logistics, Pickup & Settlement Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Truck className="w-4 h-4 text-purple-600" />
                <span>Logistics & Delivery Mode</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                <strong>{buyer.pickupPreference}</strong>. Buyer provides assisted weighing scale calibration at farm gate for lots exceeding 100 quintals.
              </p>
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Depot: {buyer.location} ({buyer.distanceKm} km from your village)</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Payment & Escrow Protection</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                <strong>{buyer.settlementTerms}</strong>. Payment is locked in certified escrow upon dispatch and auto-credited directly to farmer bank account upon electronic weight receipt.
              </p>
              <div className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                <span>Verified 100% On-Time Payment Record</span>
              </div>
            </div>
          </div>

          {/* Farmer Reviews & Feedback Rating */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bold text-slate-900">{buyer.kycVerification.rating} / 5.0</span>
              <span className="text-slate-500">({buyer.kycVerification.reviewsCount} verified farmer ratings)</span>
            </div>

            <div className="text-[11px] text-slate-500">
              Tender active for next <strong className="text-slate-900">{buyer.expiresInDays} days</strong>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <Button variant="outline" size="md" onClick={onClose}>
            Close
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              onClose();
              onOpenSupplyOffer(buyer);
            }}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="font-bold shadow-md shadow-emerald-600/20"
          >
            Send Direct Supply Offer
          </Button>
        </div>

      </div>
    </div>
  );
};
