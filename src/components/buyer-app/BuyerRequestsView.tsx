import React, { useState } from 'react';
import {
  SendHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileCheck,
  MapPin,
  IndianRupee,
  Truck,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { Language } from '../farmer-app/types';
import { BUYER_TRANSLATIONS } from './types';
import { BuyerRequestItem } from '../../api/buyerApi';

interface BuyerRequestsViewProps {
  lang: Language;
  requests: BuyerRequestItem[];
  isLoading: boolean;
  onUpdateStatus: (
    requestId: string | number,
    status: 'pending' | 'accepted' | 'countered' | 'rejected' | 'completed',
    message?: string
  ) => Promise<void>;
}

export const BuyerRequestsView: React.FC<BuyerRequestsViewProps> = ({
  lang,
  requests,
  isLoading,
  onUpdateStatus,
}) => {
  const t = BUYER_TRANSLATIONS[lang] || BUYER_TRANSLATIONS.en;

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activePassModal, setActivePassModal] = useState<BuyerRequestItem | null>(null);

  const filteredRequests = requests.filter((r) => {
    if (selectedStatus === 'all') return true;
    return r.status === selectedStatus;
  });

  const handleAcceptCounter = async (req: BuyerRequestItem) => {
    if (!req.counterPrice) return;
    try {
      await onUpdateStatus(
        req.id,
        'accepted',
        `Buyer agreed to counter-offer price of ₹${req.counterPrice}/Qtl. Gate pass generated.`
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelRequest = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to cancel this purchase offer?')) return;
    try {
      await onUpdateStatus(id, 'rejected', 'Offer cancelled by buyer.');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black">
              <SendHorizontal className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-['Outfit',sans-serif]">
              {t.sentRequests} & Direct Trade Negotiations
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Track all direct purchase proposals, counter-offers from farmers, and electronic gate passes.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['all', 'pending', 'accepted', 'countered', 'rejected'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all cursor-pointer ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Offers' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2 text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>{t.loading}</span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <SendHorizontal className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="text-sm font-bold text-slate-700">No offers found</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse the Purchase offers tab and send your first direct farm-gate purchase proposal.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-indigo-200 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                      {req.cropName}
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-slate-900 text-white font-bold">
                      {req.orderId || `ADP-ORD-${String(req.id).padStart(5, '0')}`}
                    </span>
                    {req.orderStatus && (
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold">
                        Lifecycle: {req.orderStatus}
                      </span>
                    )}
                    {req.paymentStatus && (
                      <span
                        className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${
                          req.paymentStatus === 'Successful'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : req.paymentStatus === 'Processing'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : req.paymentStatus === 'Failed'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        Payment: {req.paymentStatus}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">{req.farmerName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{req.farmerLocation}</span>
                    </span>
                    <span>•</span>
                    <span className="text-slate-400 font-mono">Date: {req.createdAt}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  {req.status === 'accepted' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Trade Confirmed</span>
                    </span>
                  ) : req.status === 'countered' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Farmer Counter-Offer: ₹{req.counterPrice}/Qtl</span>
                    </span>
                  ) : req.status === 'rejected' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Closed / Cancelled</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>Awaiting Farmer Response</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Offer Financials Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Quantity
                  </span>
                  <span className="text-sm font-black text-slate-900 font-mono">
                    {req.quantity} Qtl
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Your Offered Rate
                  </span>
                  <span className="text-sm font-black text-slate-900 font-mono">
                    ₹{req.offeredPrice.toLocaleString('en-IN')}/Qtl
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Total Contract Value
                  </span>
                  <span className="text-sm font-black text-indigo-700 font-mono">
                    ₹{req.totalValue.toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Logistics Mode
                  </span>
                  <span className="text-xs font-semibold text-slate-700 truncate block">
                    {req.deliveryOption}
                  </span>
                </div>
              </div>

              {/* Status Message / Note */}
              {req.statusMessage && (
                <div className="p-3 bg-indigo-50/50 rounded-xl text-xs text-indigo-900 flex items-start gap-2 border border-indigo-100">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Latest Update: </span>
                    <span>{req.statusMessage}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] text-slate-400 font-medium">
                  {req.gatePassId && (
                    <span className="text-emerald-700 font-bold font-mono">
                      e-Gate Pass: {req.gatePassId}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {req.status === 'countered' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAcceptCounter(req)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-2xs transition-all cursor-pointer font-['Outfit',sans-serif]"
                      >
                        Accept Counter Rate (₹{req.counterPrice}/Qtl)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCancelRequest(req.id)}
                        className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {req.status === 'accepted' && (
                    <button
                      type="button"
                      onClick={() => setActivePassModal(req)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>View Gate Pass</span>
                    </button>
                  )}

                  {req.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleCancelRequest(req.id)}
                      className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Withdraw Offer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gate Pass Modal */}
      {activePassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                  Electronic Gate Pass & Dispatch Note
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePassModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Pass Number:</span>
                <span className="font-bold text-emerald-700">{activePassModal.gatePassId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Crop Lot:</span>
                <span className="font-bold text-slate-900">{activePassModal.cropName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Volume:</span>
                <span className="font-bold text-slate-900">{activePassModal.quantity} Quintals</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Farmer:</span>
                <span className="font-bold text-slate-900">{activePassModal.farmerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Escrow Security:</span>
                <span className="font-bold text-blue-700">₹{activePassModal.totalValue.toLocaleString('en-IN')} Secured</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-blue-50/70 p-3 rounded-xl border border-blue-100">
              Valid for entry at buyer weighbridge and direct farm-gate collection. Present QR code or Pass Number upon truck arrival.
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActivePassModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
