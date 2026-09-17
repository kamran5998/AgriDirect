import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  Truck,
  IndianRupee,
  ShieldCheck,
  Download,
  QrCode,
  Star,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  Send,
  HelpCircle,
  X,
  History,
  Check,
  Package,
} from 'lucide-react';
import { DirectSupplyRequest, CompletedDeal, DisputeTicket } from '../../data/directMarketData';
import { farmerApi } from '../../api/farmerApi';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface RequestsAndDealsSectionProps {
  requests: DirectSupplyRequest[];
  completedDeals: CompletedDeal[];
  onAcceptCounterOffer: (requestId: string) => void;
  onViewGatePass: (gatePassId: string, buyerName: string) => void;
  onRefreshRequests?: () => void;
}

export const RequestsAndDealsSection: React.FC<RequestsAndDealsSectionProps> = ({
  requests,
  completedDeals,
  onAcceptCounterOffer,
  onViewGatePass,
  onRefreshRequests,
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'deals'>('requests');
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);

  // Dispute modal state
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [selectedTradeForDispute, setSelectedTradeForDispute] = useState<DirectSupplyRequest | null>(null);
  const [disputeCategory, setDisputeCategory] = useState<'Quality Dispute' | 'Payment Issue' | 'Quantity Mismatch' | 'Delivery Issue' | 'Other'>('Quality Dispute');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState('');
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);

  // Logistics update modal / state
  const [updatingLogisticsId, setUpdatingLogisticsId] = useState<string | null>(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);

  const handleOpenDispute = (req: DirectSupplyRequest) => {
    setSelectedTradeForDispute(req);
    setDisputeCategory('Quality Dispute');
    setDisputeDescription('');
    setDisputeEvidence('');
    setDisputeSubmitted(false);
    setDisputeModalOpen(true);
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTradeForDispute) return;

    try {
      await farmerApi.raiseDispute({
        tradeId: selectedTradeForDispute.id,
        gatePassId: selectedTradeForDispute.gatePassId,
        respondentName: selectedTradeForDispute.buyerName,
        category: disputeCategory,
        description: disputeDescription,
        evidenceNotes: disputeEvidence || 'Farmer self-assessment evidence notes',
      });
      setDisputeSubmitted(true);
      setTimeout(() => {
        setDisputeModalOpen(false);
        if (onRefreshRequests) onRefreshRequests();
      }, 1500);
    } catch (err) {
      console.error('Error submitting dispute:', err);
    }
  };

  const handleUpdateLogistics = async (req: DirectSupplyRequest, nextStatus: any) => {
    setUpdatingLogisticsId(req.id);
    try {
      await farmerApi.updateTradeLogistics(req.id, {
        status: nextStatus,
        transporter_name: req.logistics?.transporter_name || 'Kisan Rail & Road Logistics',
        vehicle_type: req.logistics?.vehicle_type || 'Mini-Truck (10T)',
        pickup_location: req.logistics?.pickup_location || 'Ashta Yard, Sehore',
        delivery_location: req.logistics?.delivery_location || 'ITC Processing Hub',
      });
      if (onRefreshRequests) onRefreshRequests();
    } catch (err) {
      console.error('Failed to update logistics:', err);
    } finally {
      setUpdatingLogisticsId(null);
    }
  };

  const handleUpdatePayment = async (
    req: DirectSupplyRequest,
    nextStage: 'PAYMENT_INITIATED' | 'ESCROW_HELD' | 'PAYMENT_RELEASED'
  ) => {
    setUpdatingPaymentId(req.id);
    try {
      await farmerApi.updateTradePayment(req.id, {
        status: nextStage,
        actorRole: 'Buyer',
      });
      if (onRefreshRequests) onRefreshRequests();
    } catch (err) {
      console.error('Failed to update payment:', err);
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Switcher Tab Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="emerald" size="sm">
            SIH26132 Market Linkage Pipeline
          </Badge>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif] tracking-tight mt-1">
            Negotiations, Logistics & Settlements
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent end-to-end lifecycle tracking: Quality matching, logistics coordination, digital escrow, and grievance management.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 shrink-0">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Active Proposals & Trades ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('deals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'deals'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Completed Contracts ({completedDeals.length})
          </button>
        </div>
      </div>

      {/* TAB 1: ACTIVE REQUESTS & PROPOSALS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No active supply proposals</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Browse verified buyer tenders in the marketplace to send direct supply proposals.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {requests.map((req) => {
                const isAccepted = req.status === 'Offer Accepted' || req.status === 'accepted';
                const isCounter = req.status === 'Counter-Offer Received' || req.status === 'countered';
                const isExpanded = expandedTradeId === req.id;
                const totalValue = req.totalContractValue || req.quantityOfferedQuintals * req.offeredPricePerQuintal;

                const logisticsStatus = req.logistics?.status || (isAccepted ? 'SCHEDULED' : 'REQUESTED');
                const normalizeStage = (status: any): 'OFFER_ACCEPTED' | 'PAYMENT_INITIATED' | 'ESCROW_HELD' | 'PAYMENT_RELEASED' => {
                  const s = String(status || '').toUpperCase().trim().replace(/[\s-]+/g, '_');
                  if (s === 'PAYMENT_RELEASED' || s === 'RELEASED' || s === 'SETTLED' || s === 'FULLY_PAID' || s === 'COMPLETED' || s === 'PAID') return 'PAYMENT_RELEASED';
                  if (s === 'ESCROW_HELD' || s === 'ESCROW_LOCKED' || s === 'IN_ESCROW' || s === 'QUALITY_VERIFIED') return 'ESCROW_HELD';
                  if (s === 'PAYMENT_INITIATED' || s === 'ADVANCE_PAID' || s === 'PARTIALLY_PAID' || s === 'INITIATED') return 'PAYMENT_INITIATED';
                  return 'OFFER_ACCEPTED';
                };
                const paymentStage = normalizeStage(req.payment?.status);
                const escrowHeldAmount = paymentStage === 'ESCROW_HELD' ? totalValue : 0;
                const disbursedAmount = paymentStage === 'PAYMENT_RELEASED' ? totalValue : 0;

                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col gap-4 hover:border-slate-300 transition-all"
                  >
                    {/* Top Row: Identifier, Badges, Values */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Left Block */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {req.id}
                          </span>

                          {isAccepted && (
                            <Badge variant="emerald" size="sm" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                              Trade Contract Active
                            </Badge>
                          )}
                          {isCounter && (
                            <Badge variant="purple" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
                              Counter-Offer Received
                            </Badge>
                          )}
                          {!isAccepted && !isCounter && (
                            <Badge variant="slate" size="sm" icon={<Clock className="w-3.5 h-3.5" />}>
                              Under Review
                            </Badge>
                          )}

                          {req.qualityGrade && (
                            <span className="text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md">
                              {req.qualityGrade}
                            </span>
                          )}

                          {req.qualityMatchStatus && (
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                              req.qualityMatchStatus === 'MATCH' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              QUALITY: {req.qualityMatchStatus}
                            </span>
                          )}

                          <span className="text-[11px] text-slate-400">Submitted {req.submittedAt}</span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <span>{req.buyerName}</span>
                        </h3>

                        <p className="text-xs text-slate-600">
                          Commodity: <strong>{req.cropName}</strong> • {req.pickupType || req.deliveryOption || 'Farm-gate Pickup'}
                        </p>
                      </div>

                      {/* Right Block: Total Price */}
                      <div className="flex flex-col items-start lg:items-end justify-between shrink-0 space-y-1">
                        <div className="text-xs text-slate-400 font-medium">Gross Contract Value</div>
                        <div className="text-2xl font-black text-slate-950 font-mono">
                          ₹{totalValue.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {req.quantityOfferedQuintals}q @ ₹{req.offeredPricePerQuintal}/q
                        </div>
                      </div>

                    </div>

                    {/* Status Message & Gatepass */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900">{req.statusMessage}</div>
                        {req.gatePassId && (
                          <div className="text-[11px] text-emerald-700 font-mono font-bold flex items-center gap-1.5">
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Digital APMC & Depot Gate Pass: <strong>{req.gatePassId}</strong></span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {isCounter && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onAcceptCounterOffer(req.id)}
                            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            className="font-bold shadow-xs"
                          >
                            Accept Counter (₹{req.counterPrice}/q)
                          </Button>
                        )}

                        {req.gatePassId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewGatePass(req.gatePassId!, req.buyerName)}
                            icon={<QrCode className="w-3.5 h-3.5 text-emerald-600" />}
                            className="font-bold border-emerald-300 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100"
                          >
                            Gate Pass
                          </Button>
                        )}

                        <button
                          onClick={() => handleOpenDispute(req)}
                          className="px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Raise Grievance</span>
                        </button>

                        <button
                          onClick={() => setExpandedTradeId(isExpanded ? null : req.id)}
                          className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide Details' : 'Logistics & Ledgers'}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* EXPANDABLE SECTION: LOGISTICS, ESCROW PAYMENT & TIMELINE */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-200 space-y-4 animate-in fade-in duration-200">
                        
                        {/* 1. Logistics Coordination Module */}
                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                              <Truck className="w-4 h-4 text-blue-600" />
                              Logistics Coordination & Freight Tracking
                            </span>
                            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-mono">
                              {logisticsStatus}
                            </span>
                          </div>

                          {/* 4-Step Visual Progress */}
                          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                            {['REQUESTED', 'SCHEDULED', 'IN TRANSIT', 'DELIVERED'].map((step, idx) => {
                              const stepIdx = ['REQUESTED', 'SCHEDULED', 'IN TRANSIT', 'DELIVERED'].indexOf(logisticsStatus);
                              const isPast = stepIdx >= idx;
                              return (
                                <div
                                  key={step}
                                  className={`p-2 rounded-xl border ${
                                    isPast
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-white text-slate-400 border-slate-200'
                                  }`}
                                >
                                  {step}
                                </div>
                              );
                            })}
                          </div>

                          {/* Logistics Info Row */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700 pt-1">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">Pickup Location:</span>
                              <span className="font-bold">{req.logistics?.pickup_location || 'Ashta Farm Shed, Sehore'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">Est. Freight Rate:</span>
                              <span className="font-bold text-blue-900">₹{req.logistics?.estimated_freight || 2800} (₹28/q)</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">Vehicle / Fleet:</span>
                              <span className="font-bold">{req.logistics?.vehicle_type || 'Mini-Truck 10-T'}</span>
                            </div>
                          </div>

                          {/* Quick Logistics Action */}
                          <div className="flex items-center gap-2 pt-2">
                            <span className="text-[11px] text-slate-500 font-medium">Update Logistics Step:</span>
                            {['SCHEDULED', 'IN TRANSIT', 'DELIVERED'].map((st) => (
                              <button
                                key={st}
                                onClick={() => handleUpdateLogistics(req, st)}
                                disabled={updatingLogisticsId === req.id}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-blue-200 bg-white hover:bg-blue-100 text-blue-900 transition-colors cursor-pointer"
                              >
                                Mark {st}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. Digital Escrow & Payment Tracking Module (4-Stage State Machine) */}
                        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                              <IndianRupee className="w-4 h-4 text-emerald-600" />
                              Digital Escrow & Settlement Ledger (4-Stage Flow)
                            </span>
                            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-700 text-white font-mono">
                              {paymentStage.replace(/_/g, ' ')}
                            </span>
                          </div>

                          {/* 4-Step Visual Lifecycle Stepper */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-bold">
                            {[
                              { key: 'OFFER_ACCEPTED', label: '1. Offer Accepted' },
                              { key: 'PAYMENT_INITIATED', label: '2. Payment Initiated' },
                              { key: 'ESCROW_HELD', label: '3. Escrow Held' },
                              { key: 'PAYMENT_RELEASED', label: '4. Payment Released' },
                            ].map((step, idx) => {
                              const stageOrder: Record<string, number> = {
                                OFFER_ACCEPTED: 0,
                                PAYMENT_INITIATED: 1,
                                ESCROW_HELD: 2,
                                PAYMENT_RELEASED: 3,
                              };
                              const isPastOrCurrent = stageOrder[paymentStage] >= idx;
                              return (
                                <div
                                  key={step.key}
                                  className={`p-2 rounded-xl border transition-colors ${
                                    isPastOrCurrent
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                      : 'bg-white text-slate-400 border-slate-200'
                                  }`}
                                >
                                  {step.label}
                                </div>
                              );
                            })}
                          </div>

                          {/* Payment Breakdown Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                            <div className="p-2.5 bg-white rounded-xl border border-emerald-200/80">
                              <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Contract Value</span>
                              <span className="text-base font-black text-slate-900 font-mono">₹{totalValue.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="p-2.5 bg-white rounded-xl border border-emerald-200/80">
                              <span className="text-[10px] text-slate-400 block font-bold uppercase">Escrow Locked (100%)</span>
                              <span className="text-base font-black text-blue-700 font-mono">₹{escrowHeldAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="p-2.5 bg-white rounded-xl border border-emerald-200/80">
                              <span className="text-[10px] text-slate-400 block font-bold uppercase">Farmer Disbursed Payout</span>
                              <span className="text-base font-black text-emerald-700 font-mono">₹{disbursedAmount.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          {/* Sequential Escrow Action */}
                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            <span className="text-[11px] text-slate-600 font-medium">Buyer Escrow Action:</span>
                            {paymentStage === 'OFFER_ACCEPTED' && (
                              <button
                                onClick={() => handleUpdatePayment(req, 'PAYMENT_INITIATED')}
                                disabled={updatingPaymentId === req.id}
                                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-amber-300 bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer shadow-xs"
                              >
                                Step 1: Initiate Payment Order
                              </button>
                            )}
                            {paymentStage === 'PAYMENT_INITIATED' && (
                              <button
                                onClick={() => handleUpdatePayment(req, 'ESCROW_HELD')}
                                disabled={updatingPaymentId === req.id}
                                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-blue-300 bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs"
                              >
                                Step 2: Lock 100% in Digital Escrow
                              </button>
                            )}
                            {paymentStage === 'ESCROW_HELD' && (
                              <button
                                onClick={() => handleUpdatePayment(req, 'PAYMENT_RELEASED')}
                                disabled={updatingPaymentId === req.id}
                                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-emerald-300 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
                              >
                                Step 3: Release Payment to Farmer Bank A/C
                              </button>
                            )}
                            {paymentStage === 'PAYMENT_RELEASED' && (
                              <span className="px-3 py-1 text-xs font-black rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                                ✓ Direct Settlement Complete (T+0 Disbursed)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 3. Transparent Audit Timeline */}
                        {req.timeline && req.timeline.length > 0 && (
                          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                              <History className="w-3.5 h-3.5 text-slate-500" />
                              Transaction Audit Trail
                            </span>
                            <div className="space-y-1.5">
                              {req.timeline.map((t, idx) => (
                                <div key={idx} className="text-xs flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                                  <div>
                                    <span className="font-bold text-slate-900">{t.title}</span>
                                    <span className="text-slate-500 ml-1.5 text-[11px]">({t.timestamp} by {t.actor_name})</span>
                                    <p className="text-[11px] text-slate-600">{t.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPLETED DEALS & SETTLEMENTS */}
      {activeTab === 'deals' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {completedDeals.map((deal) => (
              <div
                key={deal.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="emerald" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                      {deal.paymentStatus}
                    </Badge>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      Ref: {deal.contractRef}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{deal.buyerName}</h3>
                  <p className="text-xs text-slate-500">
                    {deal.cropName} • Delivered on <strong>{deal.deliveryDate}</strong>
                  </p>

                  <div className="flex items-center gap-1 text-xs text-amber-500">
                    {[...Array(deal.ratingGiven)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                    <span className="font-bold text-slate-700 ml-1">5.0 Star Transaction Rating</span>
                  </div>
                </div>

                <div className="flex flex-col items-start lg:items-end justify-between shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 space-y-2">
                  <div className="text-left lg:text-right">
                    <div className="text-xs text-slate-400">Total Net Settlement</div>
                    <div className="text-2xl font-black text-emerald-700 font-mono">
                      ₹{deal.totalSettlement.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {deal.quantityQuintals}q @ ₹{deal.finalPricePerQuintal}/q
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Tax Invoice</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* DISPUTE / GRIEVANCE MODAL */}
      {disputeModalOpen && selectedTradeForDispute && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                    Raise Grievance / Trade Dispute
                  </h3>
                  <p className="text-xs text-slate-500">
                    Governed under AgriDirect Trade Redressal & Mediation Protocol.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDisputeModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {disputeSubmitted ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Grievance Ticket Registered</h4>
                <p className="text-xs text-slate-600">
                  Ticket dispatched to mediation committee. Escrow funds will remain locked during review.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitDispute} className="p-6 space-y-4 text-slate-800">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <div><strong>Trade Ref:</strong> {selectedTradeForDispute.id}</div>
                  <div><strong>Respondent:</strong> {selectedTradeForDispute.buyerName}</div>
                  <div><strong>Commodity:</strong> {selectedTradeForDispute.cropName}</div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dispute Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={disputeCategory}
                    onChange={(e) => setDisputeCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="Quality Dispute">Quality Dispute (Grading / Moisture Discrepancy)</option>
                    <option value="Payment Issue">Payment Issue (Delayed Escrow Release)</option>
                    <option value="Quantity Mismatch">Quantity Mismatch (Weighment Scale Diff)</option>
                    <option value="Delivery Issue">Delivery Issue (Driver Delay / Refusal)</option>
                    <option value="Other">Other Operational Grievance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Describe the Issue in Detail <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={disputeDescription}
                    onChange={(e) => setDisputeDescription(e.target.value)}
                    placeholder="Specify the exact issue, mandi/depot location, and date..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Evidence Notes / Weighbridge Slip / Quality Slip
                  </label>
                  <input
                    type="text"
                    value={disputeEvidence}
                    onChange={(e) => setDisputeEvidence(e.target.value)}
                    placeholder="e.g. Weighbridge slip #8492 shows 102.5q vs invoice 98q"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button variant="outline" size="sm" type="button" onClick={() => setDisputeModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    className="font-bold bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    Submit Grievance
                  </Button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
