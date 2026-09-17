import React, { useState } from 'react';
import { X, SendHorizontal, IndianRupee, MapPin, ShieldCheck, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Language } from '../farmer-app/types';
import { BUYER_TRANSLATIONS } from './types';
import { FarmerListing } from '../../data/directMarketData';
import { SendBuyerRequestPayload } from '../../api/buyerApi';

interface SendRequestModalProps {
  isOpen: boolean;
  listing: FarmerListing | null;
  onClose: () => void;
  onSubmit: (payload: SendBuyerRequestPayload) => Promise<void>;
  lang: Language;
}

export const SendRequestModal: React.FC<SendRequestModalProps> = ({
  isOpen,
  listing,
  onClose,
  onSubmit,
  lang,
}) => {
  const t = BUYER_TRANSLATIONS[lang] || BUYER_TRANSLATIONS.en;

  const [quantity, setQuantity] = useState<string>(listing ? listing.quantityQuintals.toString() : '50');
  const [offeredPrice, setOfferedPrice] = useState<string>(
    listing ? listing.expectedPricePerQuintal.toString() : '2900'
  );
  const [deliveryOption, setDeliveryOption] = useState<string>(
    listing?.deliveryOption || 'Farm-gate Pickup (Assisted Weighment)'
  );
  const [message, setMessage] = useState<string>(
    'Direct institutional offer. Instant digital escrow payout upon electronic weighbridge validation.'
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync when listing changes
  React.useEffect(() => {
    if (listing) {
      setQuantity(listing.quantityQuintals.toString());
      setOfferedPrice(listing.expectedPricePerQuintal.toString());
      setDeliveryOption(listing.deliveryOption || 'Farm-gate Pickup (Assisted Weighment)');
    }
  }, [listing]);

  if (!isOpen || !listing) return null;

  const qty = parseFloat(quantity) || 0;
  const price = parseFloat(offeredPrice) || 0;
  const totalValue = qty * price;
  const diffPerQtl = price - listing.expectedPricePerQuintal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (qty <= 0 || qty > listing.quantityQuintals) {
      setErrorMessage(`Quantity must be between 1 and ${listing.quantityQuintals} Quintals.`);
      return;
    }

    if (price <= 0) {
      setErrorMessage('Please enter a valid offered price.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        listingId: listing.id,
        cropName: listing.cropName,
        farmerName: 'Rajinder Singh (Verified Farmer)',
        farmerLocation: `${listing.locationVillage}, ${listing.district}`,
        farmerExpectedPrice: listing.expectedPricePerQuintal,
        quantity: qty,
        offeredPrice: price,
        deliveryOption,
        message,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to transmit trade offer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
              <SendHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit',sans-serif]">
                {t.sendRequest}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Direct trade contract proposal to farmer
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

        {/* Selected Lot Summary Card */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 font-['Outfit',sans-serif]">
                {listing.cropName}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ({listing.variety})
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
              {listing.qualityGrade}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{listing.locationVillage}, {listing.district}</span>
            </div>
            <div className="text-right">
              <span>Lot Size: </span>
              <strong className="text-slate-900 font-mono">{listing.quantityQuintals} Qtl</strong>
            </div>
            <div>
              <span>Farmer Asking Price:</span>
            </div>
            <div className="text-right font-mono font-bold text-slate-900">
              ₹{listing.expectedPricePerQuintal.toLocaleString('en-IN')}/Qtl
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Trade Proposal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Offer Quantity */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 font-['Outfit',sans-serif]">
                Quantity to Buy (Max {listing.quantityQuintals} Qtl)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={listing.quantityQuintals}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-hidden font-mono"
                  required
                />
                <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">
                  Qtl
                </span>
              </div>
            </div>

            {/* Offer Price */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 font-['Outfit',sans-serif]">
                Your Offer Price (₹/Qtl)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="100"
                  step="10"
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(e.target.value)}
                  className="w-full pl-8 pr-12 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-hidden font-mono"
                  required
                />
                <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">
                  /Qtl
                </span>
              </div>
            </div>
          </div>

          {/* Rate Difference Comparison */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between text-xs">
            <div className="text-indigo-900 font-medium">
              <span>Total Contract Value: </span>
              <strong className="font-mono text-sm font-black text-indigo-950">
                ₹{totalValue.toLocaleString('en-IN')}
              </strong>
            </div>

            <div className="text-right">
              {diffPerQtl === 0 ? (
                <span className="font-bold text-emerald-700">Matches asking rate</span>
              ) : diffPerQtl > 0 ? (
                <span className="font-bold text-emerald-700">+₹{diffPerQtl}/q premium</span>
              ) : (
                <span className="font-bold text-amber-700">₹{Math.abs(diffPerQtl)}/q below asking</span>
              )}
            </div>
          </div>

          {/* Delivery & Logistics Method */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 font-['Outfit',sans-serif]">
              Logistics & Delivery Mode
            </label>
            <select
              value={deliveryOption}
              onChange={(e) => setDeliveryOption(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-hidden cursor-pointer"
            >
              <option value="Farm-gate Pickup (Assisted Weighment)">
                Farm-gate Pickup (Buyer arranges truck + electronic scale)
              </option>
              <option value="Farmer Delivery to Depot">
                Farmer Delivery to Buyer Depot / Plant
              </option>
              <option value="Flexible (Mutual Agreement)">
                Flexible (Coordinate upon acceptance)
              </option>
            </select>
          </div>

          {/* Message / Special Instructions */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 font-['Outfit',sans-serif]">
              Proposal Note / Terms
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-hidden resize-none"
              placeholder="Add payment terms, dispatch timeframe, or moisture allowances..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-xs hover:shadow-md transition-all disabled:opacity-50 cursor-pointer font-['Outfit',sans-serif]"
            >
              {isSubmitting ? (
                <span>Transmitting Offer...</span>
              ) : (
                <>
                  <SendHorizontal className="w-4 h-4" />
                  <span>Transmit Offer (₹{totalValue.toLocaleString('en-IN')})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
