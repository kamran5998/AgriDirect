import React from 'react';
import { X, MapPin, Calendar, CheckCircle2, ShieldCheck, Truck, Scale, SendHorizontal, Eye, Camera, Image as ImageIcon, Info } from 'lucide-react';
import { Language } from '../farmer-app/types';
import { BUYER_TRANSLATIONS } from './types';
import { FarmerListing } from '../../data/directMarketData';

interface ViewListingModalProps {
  isOpen: boolean;
  listing: FarmerListing | null;
  onClose: () => void;
  onSendRequest: (listing: FarmerListing) => void;
  lang: Language;
}

export const ViewListingModal: React.FC<ViewListingModalProps> = ({
  isOpen,
  listing,
  onClose,
  onSendRequest,
  lang,
}) => {
  const t = BUYER_TRANSLATIONS[lang] || BUYER_TRANSLATIONS.en;

  if (!isOpen || !listing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-black">
              🌾
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit',sans-serif]">
                {listing.cropName} ({listing.variety})
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Lot Ref: #{listing.id} • Posted {listing.createdAt}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop Photo Evidence Section */}
        {listing.cropImageUrl ? (
          <div className="space-y-1.5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-64 flex items-center justify-center">
              <img
                src={listing.cropImageUrl}
                alt={`${listing.cropName} produce inspection`}
                className="w-full max-h-64 object-contain"
              />
              <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-1.5 border border-white/20">
                <Camera className="w-3 h-3 text-emerald-400" />
                <span>Visual Crop Lot Evidence</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 flex items-center gap-1 px-1">
              <Info className="w-3 h-3 text-slate-400 shrink-0" />
              Visual produce photo uploaded by farmer for visual assessment (does not replace lab testing).
            </p>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex items-center gap-2.5 text-xs text-slate-500">
            <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="font-semibold block text-slate-700">No crop image uploaded</span>
              <span className="text-[10px] text-slate-400">Produce quality is based on farmer grade self-declaration.</span>
            </div>
          </div>
        )}

        {/* Highlight Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Available Lot
            </span>
            <span className="text-base font-black text-slate-900 font-mono">
              {listing.quantityQuintals} Qtl
            </span>
            <span className="text-[10px] text-slate-500 block">
              ≈ {(listing.quantityQuintals / 10).toFixed(1)} MT
            </span>
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-200/80 rounded-2xl">
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">
              Asking Price
            </span>
            <span className="text-base font-black text-indigo-900 font-mono">
              ₹{listing.expectedPricePerQuintal.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-indigo-700 block font-semibold">
              /Quintal
            </span>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
              Total Lot Value
            </span>
            <span className="text-base font-black text-emerald-900 font-mono">
              ₹{(listing.quantityQuintals * listing.expectedPricePerQuintal).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-700 block font-medium">
              Gross Valuation
            </span>
          </div>
        </div>

        {/* Quality & Lot Specifications */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider font-['Outfit',sans-serif]">
            Quality & Specifications
          </h4>

          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-400 block font-medium">Quality Grade:</span>
              <span className="font-bold text-slate-900">{listing.qualityGrade}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Quality Remarks:</span>
              <span className="font-bold text-slate-900 truncate block">{listing.qualityRemarks || 'Clean Sun-Dried Lot'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Dispatch Readiness:</span>
              <span className="font-bold text-slate-900">{listing.availableDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Preferred Delivery:</span>
              <span className="font-bold text-slate-900">{listing.deliveryOption}</span>
            </div>
          </div>
        </div>

        {/* Farmer & Location Info */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider font-['Outfit',sans-serif]">
            Origin & Farmer Verification
          </h4>

          <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-950">{listing.farmerName || 'Rajinder Singh (Verified Farmer)'}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-blue-200 text-blue-800 text-[9px] font-black">
                  Verified Farmer
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-800">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{listing.locationVillage}, District {listing.district}, {listing.state}</span>
              </div>
              <p className="text-[11px] text-blue-700">
                Aadhaar e-KYC verified • Land record synced with MP Bhulekh • Escrow rating: 4.9/5.0
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onSendRequest(listing);
            }}
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer font-['Outfit',sans-serif]"
          >
            <SendHorizontal className="w-4 h-4" />
            <span>Send Purchase Offer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
