import React, { useState } from 'react';
import {
  Sprout,
  Search,
  MapPin,
  ShieldCheck,
  Truck,
  IndianRupee,
  Scale,
  SendHorizontal,
  Eye,
  Filter,
  CheckCircle2,
  Calendar,
  Camera,
  Image as ImageIcon,
  X,
  ZoomIn,
} from 'lucide-react';
import { Language } from '../farmer-app/types';
import { BUYER_TRANSLATIONS } from './types';
import { FarmerListing } from '../../data/directMarketData';

interface BuyerFarmerListingsViewProps {
  lang: Language;
  listings: FarmerListing[];
  isLoading: boolean;
  onOpenViewListing: (listing: FarmerListing) => void;
  onOpenSendRequest: (listing: FarmerListing) => void;
}

export const BuyerFarmerListingsView: React.FC<BuyerFarmerListingsViewProps> = ({
  lang,
  listings,
  isLoading,
  onOpenViewListing,
  onOpenSendRequest,
}) => {
  const t = BUYER_TRANSLATIONS[lang] || BUYER_TRANSLATIONS.en;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [maxDistance, setMaxDistance] = useState<number>(100);
  const [previewImageListing, setPreviewImageListing] = useState<FarmerListing | null>(null);

  const cropsList = Array.from(new Set(listings.map((l) => l.cropName)));

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.locationVillage.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCrop = selectedCrop === 'all' || item.cropName === selectedCrop;
    const matchesVerified = !verifiedOnly || item.verificationBadge;
    const matchesDistance = (item.distanceKm || 20) <= maxDistance;

    return matchesSearch && matchesCrop && matchesVerified && matchesDistance;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
              <Sprout className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-['Outfit',sans-serif]">
              {t.farmerListings}
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Browse verified crop lots ready for harvest and farm-gate procurement from local farmers and FPOs.
          </p>
        </div>

        <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3.5 py-2 rounded-2xl border border-slate-200">
          Showing <span className="text-slate-900 font-mono font-black">{filteredListings.length}</span> available lots
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crop, variety, village..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Crop Selector */}
          <div>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Crops ({listings.length})</option>
              {cropsList.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>

          {/* Distance Filter */}
          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 shrink-0">Max Dist:</span>
            <input
              type="range"
              min="10"
              max="150"
              step="10"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <span className="text-xs font-black text-slate-800 font-mono shrink-0">
              {maxDistance}km
            </span>
          </div>

          {/* Verified Toggle Button */}
          <button
            type="button"
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              verifiedOnly
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Farmers Only</span>
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2 text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>{t.loading}</span>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Sprout className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="text-sm font-bold text-slate-700">No matching farmer listings found</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria, crop selection, or expanding distance radius.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCrop('all');
              setVerifiedOnly(false);
              setMaxDistance(150);
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((lot) => {
            const totalValue = lot.quantityQuintals * lot.expectedPricePerQuintal;

            return (
              <div
                key={lot.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Crop, Variety & Quality */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                          {lot.cropName}
                        </h3>
                        <span className="text-xs font-bold text-slate-500">
                          ({lot.variety})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{lot.locationVillage}, {lot.district}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black shrink-0">
                        {lot.qualityGrade}
                      </span>
                      {lot.fpoLotId && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-[9px] font-bold shrink-0">
                          FPO Lot Pooled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Crop Image Thumbnail or Fallback */}
                  {lot.cropImageUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group">
                      <img
                        src={lot.cropImageUrl}
                        alt={`${lot.cropName} lot`}
                        className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewImageListing(lot)}
                        className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold backdrop-blur-2xs cursor-pointer"
                      >
                        <ZoomIn className="w-4 h-4" />
                        <span>Inspect Produce</span>
                      </button>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white flex items-center gap-1">
                        <Camera className="w-3 h-3 text-emerald-400" />
                        <span>Visual Produce Photo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-2 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-slate-300" />
                        <span>No crop image uploaded</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Standard Grade</span>
                    </div>
                  )}

                  {/* Quality Remarks / Specs Row if present */}
                  {lot.qualityRemarks && (
                    <div className="text-[11px] text-slate-600 bg-slate-50/80 border border-slate-200/60 px-2.5 py-1.5 rounded-xl truncate">
                      <strong className="text-slate-700">Remarks:</strong> {lot.qualityRemarks}
                    </div>
                  )}

                  {/* Lot Economics Grid */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Available Lot
                      </span>
                      <span className="text-base font-black text-slate-900 font-mono">
                        {lot.quantityQuintals} Qtl
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        ≈ {(lot.quantityQuintals / 10).toFixed(1)} MT
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Asking Price
                      </span>
                      <span className="text-base font-black text-emerald-700 font-mono">
                        ₹{lot.expectedPricePerQuintal.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        /Quintal
                      </span>
                    </div>
                  </div>

                  {/* Verification & Distance Badges */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-blue-700 font-semibold text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Aadhaar & Land Verified</span>
                      </div>

                      <span className="font-mono font-bold text-slate-600 text-[11px] bg-slate-100 px-2 py-0.5 rounded-md">
                        {lot.distanceKm || 18} km away
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Truck className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{lot.deliveryOption}</span>
                      </div>
                      <span className="text-slate-400 font-mono">Ready {lot.availableDate}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenViewListing(lot)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.viewListing}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenSendRequest(lot)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer font-['Outfit',sans-serif]"
                  >
                    <SendHorizontal className="w-3.5 h-3.5" />
                    <span>{t.sendRequest}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Inspection Lightbox Modal */}
      {previewImageListing && previewImageListing.cropImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                  {previewImageListing.cropName} ({previewImageListing.variety})
                </h3>
                <p className="text-xs text-slate-500">
                  {previewImageListing.locationVillage}, {previewImageListing.district} • {previewImageListing.qualityGrade}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImageListing(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-80 flex items-center justify-center">
              <img
                src={previewImageListing.cropImageUrl}
                alt="Produce inspection preview"
                className="w-full max-h-80 object-contain"
              />
            </div>

            <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-xl text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Visual Crop-Quality Evidence</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                This image provides visual evidence to inspect grain luster, cleanliness, and overall produce condition prior to sending an offer. It does not replace laboratory quality verification.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPreviewImageListing(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  const lot = previewImageListing;
                  setPreviewImageListing(null);
                  onOpenSendRequest(lot);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
              >
                <SendHorizontal className="w-3.5 h-3.5" />
                <span>Send Procurement Offer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
