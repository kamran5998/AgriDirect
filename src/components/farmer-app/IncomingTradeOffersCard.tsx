import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Sparkles,
  QrCode,
  Building2,
  Wheat,
  MapPin,
  IndianRupee,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Send,
  X,
  Eye,
  ChevronDown,
  ChevronUp,
  Package,
} from 'lucide-react';
import { farmerApi } from '../../api/farmerApi';
import { DirectSupplyRequest } from '../../data/directMarketData';
import { Language } from './types';
import { TradePaymentStatusTracker } from '../trades/TradePaymentStatusTracker';

interface IncomingTradeOffersCardProps {
  lang?: Language;
  onRefreshParent?: () => void;
  onOpenGatePassModal?: (gatePassId: string, buyerName: string) => void;
  onNavigateTab?: (tab: any) => void;
}

export const IncomingTradeOffersCard: React.FC<IncomingTradeOffersCardProps> = ({
  lang = 'en',
  onRefreshParent,
  onOpenGatePassModal,
  onNavigateTab,
}) => {
  const [requests, setRequests] = useState<DirectSupplyRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal / Panel State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeTabFilter, setActiveTabFilter] = useState<'pending' | 'all'>('pending');

  // Action processing state
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<{
    text: string;
    gatePassId?: string;
    remainingQty?: number;
  } | null>(null);

  // Counter Offer Modal State
  const [counterModalRequest, setCounterModalRequest] = useState<DirectSupplyRequest | null>(null);
  const [counterPrice, setCounterPrice] = useState<string>('');
  const [counterQty, setCounterQty] = useState<string>('');
  const [counterMessage, setCounterMessage] = useState<string>('');
  const [counterSubmitting, setCounterSubmitting] = useState<boolean>(false);
  const [counterError, setCounterError] = useState<string | null>(null);

  // Volume Mismatch Resolution Modal State
  const [volumeMismatchModal, setVolumeMismatchModal] = useState<{
    req: DirectSupplyRequest;
    requestedQty: number;
    availableQty: number;
  } | null>(null);

  // Rejection confirmation state
  const [rejectModalRequest, setRejectModalRequest] = useState<DirectSupplyRequest | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [rejectSubmitting, setRejectSubmitting] = useState<boolean>(false);

  // Gate Pass Details Quick View
  const [selectedGatePass, setSelectedGatePass] = useState<{
    gatePassId: string;
    buyerName: string;
    cropName: string;
    quantity: number;
    price: number;
  } | null>(null);

  // Expanded Payment Status Tracker for accepted deals
  const [expandedPaymentId, setExpandedPaymentId] = useState<number | string | null>(null);

  // 1. Fetch Real Requests from Backend API
  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await farmerApi.getFarmerRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load farmer incoming requests:', err);
      setErrorMessage(err?.message || 'Unable to connect to trade server. Please check your network.');
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Derive Actionable Pending Requests
  const pendingRequests = requests.filter((r) => {
    const s = (r.status || r.rawStatus || '').toLowerCase();
    return s === 'pending' || s === 'submitted' || s === 'under review' || s === 'open';
  });

  const pendingCount = pendingRequests.length;

  // Derive Non-pending items (accepted, countered, rejected, etc.)
  const pastRequests = requests.filter((r) => {
    const s = (r.status || r.rawStatus || '').toLowerCase();
    return s !== 'pending' && s !== 'submitted' && s !== 'under review' && s !== 'open';
  });

  // Display list based on active filter
  const displayedRequests = activeTabFilter === 'pending' ? pendingRequests : requests;

  // 2. Handle Accept Action (with optional overrideQty for lot balance resolution)
  const handleAccept = async (req: DirectSupplyRequest, overrideQty?: number) => {
    if (processingId) return; // Prevent duplicate clicks
    setProcessingId(req.id);
    setActionSuccessMessage(null);

    const targetQty = overrideQty !== undefined && overrideQty > 0 ? overrideQty : req.quantityOfferedQuintals;

    try {
      const res = await farmerApi.updateFarmerRequest(req.id, {
        status: 'accepted',
        acceptQuantity: overrideQty !== undefined && overrideQty > 0 ? overrideQty : undefined,
      });

      const gatePass = res?.gatePassId || res?.gate_pass_id || res?.data?.gatePassId || req.gatePassId;
      const remaining = res?.remainingListingQuantity ?? res?.remainingQuantity;

      setActionSuccessMessage({
        text: `Trade offer accepted for ${targetQty} Qtl of ${req.cropName} from ${req.buyerName}!`,
        gatePassId: gatePass,
        remainingQty: typeof remaining === 'number' ? remaining : undefined,
      });

      if (volumeMismatchModal) setVolumeMismatchModal(null);
      await loadRequests();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || err?.message || '';
      const details = err?.response?.data?.details;

      // Handle volume mismatch error gracefully with interactive resolution modal
      if (errMsg.includes('exceeds available listing lot volume') || errMsg.includes('exceeds') || details?.availableQuantity !== undefined) {
        const availableQty = details?.availableQuantity !== undefined 
          ? Number(details.availableQuantity) 
          : typeof req.availableListingQuantity === 'number' 
          ? req.availableListingQuantity 
          : 137;

        setVolumeMismatchModal({
          req,
          requestedQty: req.quantityOfferedQuintals,
          availableQty,
        });
      } else {
        alert(`Failed to accept request: ${errMsg || 'Server error'}`);
      }
    } finally {
      setProcessingId(null);
    }
  };

  // 3. Handle Counter Offer Submit
  const handleOpenCounterModal = (req: DirectSupplyRequest, initialQty?: number) => {
    const defaultQty = initialQty ?? (typeof req.availableListingQuantity === 'number' 
      ? Math.min(req.quantityOfferedQuintals, req.availableListingQuantity) 
      : req.quantityOfferedQuintals);

    setCounterModalRequest(req);
    setCounterPrice(String(req.farmerExpectedPrice || Math.round(req.offeredPricePerQuintal * 1.03)));
    setCounterQty(String(defaultQty));
    setCounterMessage(`Can supply ${defaultQty} Qtl of Grade A ${req.cropName} with assisted farm-gate loading.`);
    setCounterError(null);
  };

  const handleSubmitCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterModalRequest) return;

    const parsedPrice = parseFloat(counterPrice);
    if (!parsedPrice || parsedPrice <= 0) {
      setCounterError('Please enter a valid counter price per Quintal.');
      return;
    }

    const parsedQty = parseFloat(counterQty);
    if (!parsedQty || parsedQty <= 0) {
      setCounterError('Please enter a valid supply quantity in Quintals.');
      return;
    }

    setCounterSubmitting(true);
    setCounterError(null);

    try {
      await farmerApi.updateFarmerRequest(counterModalRequest.id, {
        status: 'countered',
        counterPrice: parsedPrice,
        counterQuantity: parsedQty,
        message: counterMessage.trim() || undefined,
      });

      setActionSuccessMessage({
        text: `Counter-offer of ₹${parsedPrice.toLocaleString('en-IN')}/Qtl for ${parsedQty} Qtl transmitted to ${counterModalRequest.buyerName}.`,
      });

      setCounterModalRequest(null);
      if (volumeMismatchModal) setVolumeMismatchModal(null);
      await loadRequests();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      setCounterError(err?.response?.data?.error || err?.message || 'Failed to submit counter offer.');
    } finally {
      setCounterSubmitting(false);
    }
  };

  // 4. Handle Reject Action
  const handleOpenRejectModal = (req: DirectSupplyRequest) => {
    setRejectModalRequest(req);
    setRejectReason('Offered price is below current harvest cost.');
  };

  const handleSubmitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalRequest) return;

    setRejectSubmitting(true);
    try {
      await farmerApi.updateFarmerRequest(rejectModalRequest.id, {
        status: 'rejected',
        message: rejectReason.trim() || 'Declined by farmer',
      });

      setActionSuccessMessage({
        text: `Offer #${rejectModalRequest.id} from ${rejectModalRequest.buyerName} was declined.`,
      });

      setRejectModalRequest(null);
      await loadRequests();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      alert(`Failed to reject offer: ${err?.message || 'Server error'}`);
    } finally {
      setRejectSubmitting(false);
    }
  };

  return (
    <>
      {/* ============================================================ */}
      {/* 1. COMPACT FARMER DASHBOARD CARD                             */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 transition-all hover:border-slate-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Left Block: Icon + Titles */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
              isLoading
                ? 'bg-slate-100 text-slate-400'
                : pendingCount > 0
                ? 'bg-amber-500 text-white shadow-xs animate-bounce-subtle'
                : 'bg-slate-100 text-slate-600'
            }`}>
              <Bell className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit',sans-serif] tracking-tight">
                  {lang === 'hi' ? 'खरीदारों के व्यापार प्रस्ताव' : lang === 'mr' ? 'खरेदीदारांचे व्यापार प्रस्ताव' : 'Incoming Trade Offers'}
                </h3>

                {/* Real Pending Offer Count Badge */}
                {isLoading ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Checking offers...</span>
                  </span>
                ) : pendingCount > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                    <span>
                      {pendingCount} {pendingCount === 1 ? 'Pending Offer' : 'Pending Offers'}
                    </span>
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                    0 Pending
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {isLoading
                  ? 'Connecting to live market orderbook...'
                  : pendingCount > 0
                  ? (lang === 'hi' ? 'आपकी प्रतिक्रिया की प्रतीक्षा में प्रत्यक्ष खरीदार बोलियां' : 'Direct buyer purchase bids waiting for your response')
                  : (lang === 'hi' ? 'वर्तमान में कोई लंबित प्रस्ताव नहीं है' : 'No new buyer proposals waiting for your review')}
              </p>
            </div>
          </div>

          {/* Right Action: View Offers Button & Orders Lifecycle Button */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('orders')}
                className="px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Package className="w-4 h-4 text-emerald-600" />
                <span>Orders & Lifecycle</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(true);
                setActiveTabFilter(pendingCount > 0 ? 'pending' : 'all');
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                pendingCount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white ring-4 ring-emerald-600/15'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>
                {lang === 'hi' ? 'प्रस्ताव देखें' : lang === 'mr' ? 'प्रस्ताव पहा' : 'View Offers'}
              </span>
              {pendingCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-emerald-800 text-[11px] font-black flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Action Success / Gate Pass Notification Alert inside Card */}
        {actionSuccessMessage && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start justify-between gap-3 text-xs text-emerald-950 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">{actionSuccessMessage.text}</p>
                {actionSuccessMessage.gatePassId && (
                  <div className="flex items-center gap-1.5 text-emerald-800 font-mono font-bold pt-0.5">
                    <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Gate Pass Generated: <strong>{actionSuccessMessage.gatePassId}</strong></span>
                  </div>
                )}
                {typeof actionSuccessMessage.remainingQty === 'number' && (
                  <div className="text-slate-600 text-[11px]">
                    Remaining lot inventory: <strong>{actionSuccessMessage.remainingQty} Qtl</strong>
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccessMessage(null)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={loadRequests}
              className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 cursor-pointer shrink-0"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2. FULL OFFERS MODAL & ACTIONS VIEW                         */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-slate-950 font-['Outfit',sans-serif]">
                      {lang === 'hi' ? 'खरीदार व्यापार प्रस्ताव' : 'Incoming Buyer Trade Offers'}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
                      Live Backend
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review institutional buyer purchase orders, negotiate counter-rates, and generate digital gate passes.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Filter Sub-Header & Refresh Button */}
            <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTabFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTabFilter === 'pending'
                      ? 'bg-amber-100 text-amber-900 font-black border border-amber-300 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Pending Action ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTabFilter === 'all'
                      ? 'bg-slate-900 text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  All Offers ({requests.length})
                </button>
              </div>

              <button
                type="button"
                onClick={loadRequests}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold cursor-pointer disabled:opacity-50"
                title="Refresh from server"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Scrollable Offers List */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">
              
              {/* Skeleton Loading State */}
              {isLoading && (
                <div className="space-y-4">
                  {[1, 2].map((k) => (
                    <div key={k} className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3 animate-pulse">
                      <div className="h-4 bg-slate-200 rounded-md w-1/3" />
                      <div className="h-8 bg-slate-100 rounded-md w-full" />
                      <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && displayedRequests.length === 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Wheat className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                    {activeTabFilter === 'pending'
                      ? 'No incoming trade offers yet.'
                      : 'No trade offers recorded.'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    New buyer proposals will appear here as corporate buyers and institutional millers submit procurement bids for your active lots.
                  </p>
                </div>
              )}

              {/* Real Offers Cards */}
              {!isLoading && displayedRequests.map((req) => {
                const s = (req.status || req.rawStatus || '').toLowerCase();
                const isPending = s === 'pending' || s === 'submitted' || s === 'under review' || s === 'open';
                const isAccepted = s === 'accepted' || s === 'offer accepted';
                const isCountered = s === 'countered' || s === 'counter-offer received';
                const isRejected = s === 'rejected';
                const isCompleted = s === 'completed';
                const isCancelled = s === 'cancelled';

                const totalValue = req.totalContractValue || req.quantityOfferedQuintals * req.offeredPricePerQuintal;
                const isCurrentProcessing = processingId === req.id;

                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4 hover:border-slate-300 transition-all"
                  >
                    {/* Top Row: Buyer Name, Status Badge, Reference ID */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                            REQ #{req.id}
                          </span>
                          
                          {/* Status Pill */}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>Pending Your Decision</span>
                            </span>
                          )}
                          {isAccepted && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>Accepted & Locked</span>
                            </span>
                          )}
                          {isCountered && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-900 border border-purple-300">
                              <Sparkles className="w-3 h-3 text-purple-700" />
                              <span>Counter Offer Sent</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Rejected</span>
                            </span>
                          )}
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-white">
                              <span>Deal Completed</span>
                            </span>
                          )}
                          {isCancelled && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                              <span>Cancelled (Lot Sold)</span>
                            </span>
                          )}

                          <span className="text-[11px] text-slate-400">
                            {req.submittedAt || req.proposedDate}
                          </span>
                        </div>

                        <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2 pt-0.5">
                          <Building2 className="w-4 h-4 text-slate-600" />
                          <span>{req.buyerName}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verified Buyer</span>
                          </span>
                        </h4>
                      </div>

                      {/* Right Total Value Display */}
                      <div className="flex flex-col sm:items-end">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Total Trade Value
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-slate-950 font-mono">
                          ₹{totalValue.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Middle Grid: Offer Specifications */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Commodity</span>
                        <strong className="text-slate-900 text-xs font-bold block truncate">
                          {req.cropName} {req.variety ? `(${req.variety})` : ''}
                        </strong>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Quantity</span>
                        <strong className="text-slate-900 text-xs font-bold block">
                          {req.quantityOfferedQuintals} Quintals
                        </strong>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Offered Rate</span>
                        <strong className="text-emerald-700 text-xs font-black font-mono block">
                          ₹{req.offeredPricePerQuintal.toLocaleString('en-IN')}/Qtl
                        </strong>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Delivery Option</span>
                        <strong className="text-slate-900 text-xs font-bold block truncate">
                          {req.pickupType || 'Farm-gate Pickup'}
                        </strong>
                      </div>
                    </div>

                    {/* Lot Volume Availability Notice / Warning */}
                    {typeof req.availableListingQuantity === 'number' && req.quantityOfferedQuintals > req.availableListingQuantity && (
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-start justify-between gap-3 text-xs text-amber-950">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <p className="font-bold text-amber-900">
                              Volume Exceeds Remaining Lot Balance
                            </p>
                            <p className="text-[11px] text-amber-800">
                              Buyer requested <strong>{req.quantityOfferedQuintals} Qtl</strong>, but remaining lot inventory is <strong>{req.availableListingQuantity} Qtl</strong>.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAccept(req, req.availableListingQuantity)}
                          disabled={isCurrentProcessing}
                          className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white font-black rounded-xl text-[11px] shrink-0 cursor-pointer shadow-xs"
                        >
                          Accept Available ({req.availableListingQuantity} Qtl)
                        </button>
                      </div>
                    )}

                    {/* Extra Notes & Quality Match if available */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-3 flex-wrap">
                        {req.qualityGrade && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <Package className="w-3 h-3 text-amber-700" />
                            <span>{req.qualityGrade}</span>
                          </span>
                        )}
                        {req.farmerLocation && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{req.farmerLocation}</span>
                          </span>
                        )}
                        {req.counterPrice && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                            <span>Counter Proposed: ₹{req.counterPrice}/Qtl</span>
                          </span>
                        )}
                      </div>

                      {/* Status Message */}
                      <span className="text-[11px] font-medium text-slate-500 italic">
                        "{req.statusMessage}"
                      </span>
                    </div>

                    {/* Digital Gate Pass Section if generated */}
                    {req.gatePassId && (
                      <div className="p-3.5 bg-emerald-50/80 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <QrCode className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-emerald-950">Official Depot / Mandi Gate Pass</div>
                            <div className="font-mono font-bold text-emerald-800 text-[11px]">
                              Pass ID: <strong>{req.gatePassId}</strong>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenGatePassModal) {
                              onOpenGatePassModal(req.gatePassId!, req.buyerName);
                            } else {
                              setSelectedGatePass({
                                gatePassId: req.gatePassId!,
                                buyerName: req.buyerName,
                                cropName: req.cropName,
                                quantity: req.quantityOfferedQuintals,
                                price: req.offeredPricePerQuintal,
                              });
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-bold hover:bg-emerald-100 cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                          <span>View Digital Pass</span>
                        </button>
                      </div>
                    )}

                    {/* Escrow & Payment Lifecycle Panel for Accepted Deals */}
                    {isAccepted && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-700" />
                            <div>
                              <span className="text-xs font-black text-emerald-950 block">
                                Digital Escrow Status: {req.payment?.status || 'ESCROW_HELD'}
                              </span>
                              <span className="text-[11px] text-emerald-700">
                                Trade Value: ₹{(req.quantityOfferedQuintals * req.offeredPricePerQuintal).toLocaleString('en-IN')} (T+0 Clearance)
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedPaymentId(expandedPaymentId === req.id ? null : req.id)
                            }
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                          >
                            <span>{expandedPaymentId === req.id ? 'Hide Lifecycle' : 'Track Escrow Payment'}</span>
                            {expandedPaymentId === req.id ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {expandedPaymentId === req.id && (
                          <div className="mt-3 animate-fadeIn">
                            <TradePaymentStatusTracker
                              tradeId={req.id}
                              cropName={req.cropName}
                              variety="Grade A Lokwan"
                              quantity={req.quantityOfferedQuintals}
                              unitPrice={req.offeredPricePerQuintal}
                              buyerName={req.buyerName}
                              gatePassId={req.gatePassId}
                              payment={req.payment}
                              userRole="farmer"
                              onPaymentUpdated={(updated) => {
                                setRequests((prev) =>
                                  prev.map((r) => (r.id === req.id ? { ...r, payment: updated as any } : r))
                                );
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* ACTION BUTTONS: Visible for Pending Requests */}
                    {isPending && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
                        
                        {/* Reject Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenRejectModal(req)}
                          disabled={isCurrentProcessing}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>

                        {/* Counter Offer Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenCounterModal(req)}
                          disabled={isCurrentProcessing}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-300 cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                          <span>Counter Offer</span>
                        </button>

                        {/* Accept Available or Standard Accept Button */}
                        {typeof req.availableListingQuantity === 'number' && req.quantityOfferedQuintals > req.availableListingQuantity ? (
                          <button
                            type="button"
                            onClick={() => handleAccept(req, req.availableListingQuantity)}
                            disabled={isCurrentProcessing}
                            className="px-5 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-xs cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {isCurrentProcessing ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Confirming...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Accept Available ({req.availableListingQuantity} Qtl)</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAccept(req)}
                            disabled={isCurrentProcessing}
                            className="px-5 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-xs cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {isCurrentProcessing ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Confirming...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Accept Offer (₹{req.offeredPricePerQuintal}/Qtl)</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>AgriDirect Pulse Direct Settlement Engine</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. COUNTER OFFER MODAL                                       */}
      {/* ============================================================ */}
      {counterModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                  Send Counter Offer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCounterModalRequest(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Offer Context Summary */}
            <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-200 text-xs space-y-1">
              <div className="text-purple-950 font-bold">
                Buyer: <strong>{counterModalRequest.buyerName}</strong>
              </div>
              <div className="text-purple-900">
                Crop: {counterModalRequest.cropName} • {counterModalRequest.quantityOfferedQuintals} Qtl
              </div>
              <div className="text-purple-800">
                Buyer's Initial Bid: <strong>₹{counterModalRequest.offeredPricePerQuintal}/Qtl</strong>
              </div>
            </div>

            <form onSubmit={handleSubmitCounter} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Counter Rate (₹/Qtl) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      value={counterPrice}
                      onChange={(e) => setCounterPrice(e.target.value)}
                      required
                      min="100"
                      max="50000"
                      placeholder="2980"
                      className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supply Qty (Qtl) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={counterQty}
                      onChange={(e) => setCounterQty(e.target.value)}
                      required
                      min="1"
                      max="100000"
                      placeholder="137"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500">
                Total proposed trade value: <strong>₹{((parseFloat(counterPrice) || 0) * (parseFloat(counterQty) || 0)).toLocaleString('en-IN')}</strong>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Optional Message to Buyer
                </label>
                <textarea
                  rows={2}
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  placeholder="e.g. Can supply Grade A Sharbati with immediate barn pickup..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {counterError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{counterError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCounterModalRequest(null)}
                  disabled={counterSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={counterSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-black text-white bg-purple-700 hover:bg-purple-800 active:bg-purple-900 cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {counterSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Transmit Counter Offer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3.5 VOLUME MISMATCH RESOLUTION MODAL                         */}
      {/* ============================================================ */}
      {volumeMismatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                    Lot Volume Adjustment Required
                  </h3>
                  <span className="text-[11px] text-amber-800 font-semibold">
                    Offer exceeds available listing lot volume
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVolumeMismatchModal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Buyer Entity:</span>
                <span className="font-bold text-slate-900">{volumeMismatchModal.req.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Commodity:</span>
                <span className="font-bold text-slate-900">{volumeMismatchModal.req.cropName}</span>
              </div>
              <div className="flex justify-between border-t border-amber-200/60 pt-1.5">
                <span className="text-slate-600">Requested Volume:</span>
                <span className="font-black text-rose-700 font-mono">{volumeMismatchModal.requestedQty} Quintals</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Available Lot Inventory:</span>
                <span className="font-black text-emerald-800 font-mono">{volumeMismatchModal.availableQty} Quintals</span>
              </div>
              <div className="flex justify-between border-t border-amber-200/60 pt-1.5">
                <span className="text-slate-600">Offered Rate:</span>
                <span className="font-black text-slate-900 font-mono">₹{volumeMismatchModal.req.offeredPricePerQuintal}/Qtl</span>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              The buyer placed an offer for {volumeMismatchModal.requestedQty} Qtl, but your remaining uncommitted lot balance is {volumeMismatchModal.availableQty} Qtl. How would you like to proceed?
            </p>

            <div className="space-y-2 pt-2">
              {volumeMismatchModal.availableQty > 0 ? (
                <button
                  type="button"
                  onClick={() => handleAccept(volumeMismatchModal.req, volumeMismatchModal.availableQty)}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept Available Balance ({volumeMismatchModal.availableQty} Qtl at ₹{volumeMismatchModal.req.offeredPricePerQuintal}/Qtl)</span>
                </button>
              ) : (
                <div className="p-2.5 bg-rose-50 text-rose-800 rounded-xl text-xs font-bold text-center">
                  This listing lot is already fully committed (0 Qtl remaining).
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const req = volumeMismatchModal.req;
                    const avail = volumeMismatchModal.availableQty;
                    setVolumeMismatchModal(null);
                    handleOpenCounterModal(req, avail > 0 ? avail : undefined);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                  <span>Send Counter Offer</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const req = volumeMismatchModal.req;
                    setVolumeMismatchModal(null);
                    handleOpenRejectModal(req);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Decline Offer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. REJECTION MODAL                                          */}
      {/* ============================================================ */}
      {rejectModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                  Decline Trade Offer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalRequest(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to decline the trade offer of <strong>₹{rejectModalRequest.offeredPricePerQuintal}/Qtl</strong> for <strong>{rejectModalRequest.quantityOfferedQuintals} Qtl</strong> from <strong>{rejectModalRequest.buyerName}</strong>?
            </p>

            <form onSubmit={handleSubmitReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Declining (Optional)
                </label>
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Price too low, lot committed elsewhere..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRejectModalRequest(null)}
                  disabled={rejectSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Keep Offer
                </button>
                <button
                  type="submit"
                  disabled={rejectSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {rejectSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Declining...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Confirm Decline</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. GATE PASS QUICK MODAL                                    */}
      {/* ============================================================ */}
      {selectedGatePass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Verified e-NAM & APMC Depot Gate Pass
              </span>
              <h3 className="text-xl font-black text-slate-950 font-mono mt-2">
                {selectedGatePass.gatePassId}
              </h3>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Buyer Entity</span>
                <span className="font-bold text-slate-900">{selectedGatePass.buyerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Commodity Lot</span>
                <span className="font-bold text-slate-900">{selectedGatePass.cropName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Accepted Quantity</span>
                <span className="font-bold text-slate-900">{selectedGatePass.quantity} Quintals</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contract Rate</span>
                <span className="font-bold text-emerald-700 font-mono">₹{selectedGatePass.price}/Qtl</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Present this digital pass at the depot weighbridge for electronic batch validation and automated escrow disbursement.
            </p>

            <button
              type="button"
              onClick={() => setSelectedGatePass(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs cursor-pointer shadow-xs"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </>
  );
};
