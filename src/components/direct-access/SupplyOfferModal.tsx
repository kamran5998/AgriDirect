import React, { useState } from 'react';
import {
  X,
  Send,
  Building,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Truck,
  IndianRupee,
  Scale,
  Sparkles,
  MapPin,
  Clock,
} from 'lucide-react';
import { VerifiedBuyer, DirectSupplyRequest } from '../../data/directMarketData';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface SupplyOfferModalProps {
  buyer: VerifiedBuyer | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitOffer: (request: DirectSupplyRequest) => void;
  farmerDistrict?: string;
}

export const SupplyOfferModal: React.FC<SupplyOfferModalProps> = ({
  buyer,
  isOpen,
  onClose,
  onSubmitOffer,
  farmerDistrict = 'Sehore',
}) => {
  if (!isOpen || !buyer) return null;

  const [quantity, setQuantity] = useState(String(Math.min(buyer.volumeWantedQuintals, 100)));
  const [offerPrice, setOfferPrice] = useState(String(buyer.priceOfferedPerQuintal));
  const [pickupType, setPickupType] = useState(buyer.pickupPreference === 'Mandi Depot Delivery' ? 'Farmer Delivery to Mandi Hub' : 'Farm-gate Assisted Pickup');
  const [dispatchDate, setDispatchDate] = useState('Within 3 Days (Immediate)');
  const [sampleMethod, setSampleMethod] = useState('Instant On-Farm Digital Moisture & Grain Test');
  const [farmerNotes, setFarmerNotes] = useState('Lot is stored in dry covered shed. Moisture tested at 10.4%. Ready for dispatch.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numQuantity = parseFloat(quantity) || 0;
  const numPrice = parseFloat(offerPrice) || 0;
  const totalValue = numQuantity * numPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newRequest: DirectSupplyRequest = {
        id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        buyerId: buyer.id,
        buyerName: buyer.name,
        cropName: `${buyer.cropTarget} (${buyer.varietySpec})`,
        quantityOfferedQuintals: numQuantity,
        offeredPricePerQuintal: numPrice,
        buyerPostedPrice: buyer.priceOfferedPerQuintal,
        totalContractValue: totalValue,
        pickupType,
        proposedDate: dispatchDate,
        status: numPrice <= buyer.priceOfferedPerQuintal ? 'Offer Accepted' : 'Under Review',
        statusMessage: numPrice <= buyer.priceOfferedPerQuintal
          ? 'Buyer auto-accepted rate matching their posted tender. Gate pass generated.'
          : 'Proposal dispatched to procurement officer. Response guaranteed within 4 hours.',
        submittedAt: 'Just now',
        gatePassId: numPrice <= buyer.priceOfferedPerQuintal ? `GP-${farmerDistrict.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      };

      setIsSubmitting(false);
      onSubmitOffer(newRequest);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center shadow-md shadow-emerald-600/20">
              {buyer.logoText}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                  Submit Supply Proposal
                </h3>
                <Badge variant="emerald" size="sm">KYC Verified</Badge>
              </div>
              <p className="text-xs text-slate-500">
                To: <strong className="text-slate-800">{buyer.name}</strong> • {buyer.cropTarget} Tender
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-grow text-slate-800">
          
          {/* Buyer Target Summary */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Buyer Requirement</span>
              <span className="font-bold text-slate-900">{buyer.cropTarget} ({buyer.varietySpec})</span>
              <span className="text-slate-500 block text-[11px]">Tender Total: {buyer.volumeWantedQuintals}q (Min. {buyer.minOrderQuintals}q)</span>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Posted Buyer Tender Rate</span>
              <span className="text-lg font-black text-emerald-700 font-mono">₹{buyer.priceOfferedPerQuintal}</span>
              <span className="text-slate-500 text-[11px] font-normal font-sans"> / quintal</span>
            </div>
          </div>

          {/* Offer Quantity & Quoted Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quantity to Supply (Quintals) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={buyer.minOrderQuintals}
                  max={buyer.volumeWantedQuintals}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                  Quintals
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Min tender order: {buyer.minOrderQuintals}q
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Quoted Price (₹ / Quintal) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="500"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">/ q</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-medium mt-1 block">
                {numPrice === buyer.priceOfferedPerQuintal
                  ? '✓ Matching buyer tender rate (Fast-track auto approval)'
                  : numPrice > buyer.priceOfferedPerQuintal
                  ? `+₹${numPrice - buyer.priceOfferedPerQuintal}/q counter-quote (Reviewed by procurement manager)`
                  : 'Discounted quote'}
              </span>
            </div>
          </div>

          {/* Real-time Calculation Summary Card */}
          <div className="bg-emerald-950 text-white rounded-2xl p-4 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Total Gross Contract Value
              </span>
              <div className="text-2xl font-black font-mono text-white mt-0.5">
                ₹{totalValue.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-300">
                {numQuantity} quintals @ ₹{numPrice}/quintal
              </span>
            </div>

            <div className="text-right text-xs text-emerald-200 border-l border-emerald-800/80 pl-4">
              <div className="font-semibold text-white">0% Platform Fee</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Digital Escrow Protected</div>
            </div>
          </div>

          {/* Pickup and Dispatch Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Logistics Fulfillment Mode
              </label>
              <select
                value={pickupType}
                onChange={(e) => setPickupType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer"
              >
                <option value="Farm-gate Assisted Pickup">Farm-gate Assisted Truck Pickup</option>
                <option value="Farmer Delivery to Mandi Hub">Farmer Delivery to Mandi Hub (+₹30/q Freight Allowance)</option>
                <option value="Self-Arranged Shared Transport">Self-Arranged Shared Transport</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Proposed Dispatch Schedule
              </label>
              <select
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer"
              >
                <option value="Within 24 Hours (Immediate)">Within 24 Hours (Immediate)</option>
                <option value="Within 3 Days (Immediate)">Within 3 Days</option>
                <option value="Next Monday (Standard)">Next Monday (Standard)</option>
                <option value="Within 7 Days">Within 7 Days</option>
              </select>
            </div>
          </div>

          {/* Quality Testing & Sampling */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Quality Assurance & Sampling Method
            </label>
            <select
              value={sampleMethod}
              onChange={(e) => setSampleMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer"
            >
              <option value="Instant On-Farm Digital Moisture & Grain Test">Instant On-Farm Digital Moisture & Grain Test (Free)</option>
              <option value="Pre-approved Certified Warehouse Lab Report">Pre-approved Certified Warehouse Lab Report</option>
              <option value="Sample Testing at Delivery Yard">Sample Testing at Delivery Yard</option>
            </select>
          </div>

          {/* Farmer Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Additional Notes for Buyer Procurement Officer
            </label>
            <textarea
              rows={2}
              value={farmerNotes}
              onChange={(e) => setFarmerNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Grain moisture report available, stored in concrete silo..."
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isSubmitting}
              icon={isSubmitting ? undefined : <Send className="w-4 h-4" />}
              className="font-bold shadow-md shadow-emerald-600/20"
            >
              {isSubmitting ? 'Transmitting Proposal...' : 'Transmit Supply Proposal'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};
