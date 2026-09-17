import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  ArrowRight,
  Receipt,
  FileCheck2,
  Lock,
  Unlock,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Banknote,
  Send,
  UserCheck,
  Scale,
  Download,
  Share2,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export type PaymentStep = 'OFFER_ACCEPTED' | 'PAYMENT_INITIATED' | 'ESCROW_HELD' | 'PAYMENT_RELEASED';

export interface PaymentDetailsData {
  status:
    | 'OFFER_ACCEPTED'
    | 'PAYMENT_INITIATED'
    | 'ESCROW_HELD'
    | 'PAYMENT_RELEASED'
    | 'PENDING'
    | 'ADVANCE PAID'
    | 'ADVANCE_PAID'
    | 'PARTIALLY PAID'
    | 'QUALITY_VERIFIED'
    | 'FULLY PAID'
    | 'FULLY_PAID'
    | string;
  total_trade_value: number;
  amount_paid: number;
  remaining_amount: number;
  advance_amount?: number;
  escrow_held_amount?: number;
  payment_due_date?: string;
  payment_method?: string;
  escrow_token?: string;
  bank_reference_utr?: string;
  quality_verification_notes?: string;
  last_transition_by?: string;
  history?: Array<{
    trade_id?: number | string;
    previous_status?: string;
    new_status?: string;
    status: string;
    amount: number;
    timestamp: string;
    note: string;
    actor: string;
    reference_id?: string;
  }>;
  updated_at?: string;
}

interface TradePaymentStatusTrackerProps {
  tradeId: number | string;
  cropName: string;
  variety?: string;
  quantity: number;
  unitPrice: number;
  buyerName: string;
  farmerName?: string;
  gatePassId?: string | null;
  payment?: PaymentDetailsData;
  userRole?: 'farmer' | 'buyer' | 'admin';
  onPaymentUpdated?: (updatedPayment: PaymentDetailsData) => void;
}

export const TradePaymentStatusTracker: React.FC<TradePaymentStatusTrackerProps> = ({
  tradeId,
  cropName,
  variety,
  quantity,
  unitPrice,
  buyerName,
  farmerName = 'Rajinder Singh',
  gatePassId,
  payment: initialPayment,
  userRole = 'farmer',
  onPaymentUpdated,
}) => {
  const totalValue = quantity * unitPrice;

  const [payment, setPayment] = useState<PaymentDetailsData>(
    initialPayment || {
      status: 'OFFER_ACCEPTED',
      total_trade_value: totalValue,
      amount_paid: 0,
      remaining_amount: totalValue,
      escrow_held_amount: 0,
      payment_due_date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
      payment_method: 'Digital Escrow Bank Clearance (T+0)',
      escrow_token: `ESC-${String(tradeId).padStart(4, '0')}-${Date.now().toString().slice(-4)}`,
      updated_at: new Date().toISOString(),
    }
  );

  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Determine current active 4-step index (0 to 3)
  const getStepIndex = (status: string): number => {
    const s = String(status || '').toUpperCase().trim().replace(/[\s-]+/g, '_');
    if (s === 'PAYMENT_RELEASED' || s === 'RELEASED' || s === 'SETTLED' || s === 'FULLY_PAID' || s === 'COMPLETED' || s === 'PAID') return 3;
    if (s === 'ESCROW_HELD' || s === 'ESCROW_LOCKED' || s === 'IN_ESCROW' || s === 'QUALITY_VERIFIED') return 2;
    if (s === 'PAYMENT_INITIATED' || s === 'ADVANCE_PAID' || s === 'PARTIALLY_PAID' || s === 'INITIATED') return 1;
    return 0; // OFFER_ACCEPTED or PENDING or UNPAID
  };

  const currentStepIndex = getStepIndex(payment.status);

  // Transition handler
  const handleTransitionStatus = async (
    targetStatus: 'PAYMENT_INITIATED' | 'ESCROW_HELD' | 'PAYMENT_RELEASED',
    customNotes?: string
  ) => {
    setLoading(true);
    try {
      const payload: any = {
        status: targetStatus,
        notes: customNotes,
        actorName: userRole === 'farmer' ? farmerName : userRole === 'buyer' ? buyerName : 'AgriDirect Escrow Clearing Officer',
        actorRole: userRole === 'farmer' ? 'Farmer' : userRole === 'buyer' ? 'Buyer' : 'Escrow Authority',
      };

      const res = await apiClient.patch<any>(`/trades/${tradeId}/payment`, payload);
      const updated = res?.trade?.payment || res?.data?.payment || res?.payment;

      if (updated) {
        setPayment(updated);
        if (onPaymentUpdated) onPaymentUpdated(updated);
      } else {
        // Fallback local update
        const now = new Date().toISOString();
        const nextPayment: PaymentDetailsData = {
          ...payment,
          status: targetStatus,
          updated_at: now,
        };
        if (targetStatus === 'ESCROW_HELD') {
          nextPayment.escrow_held_amount = totalValue;
          nextPayment.amount_paid = 0;
          nextPayment.remaining_amount = totalValue;
        } else if (targetStatus === 'PAYMENT_RELEASED') {
          nextPayment.escrow_held_amount = 0;
          nextPayment.amount_paid = totalValue;
          nextPayment.remaining_amount = 0;
          nextPayment.bank_reference_utr = `UTR-SBIN${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        }
        setPayment(nextPayment);
        if (onPaymentUpdated) onPaymentUpdated(nextPayment);
      }

      setFeedbackMessage(
        targetStatus === 'PAYMENT_INITIATED'
          ? '✓ Payment clearing order initiated via Escrow channel.'
          : targetStatus === 'ESCROW_HELD'
          ? '✓ 100% Funds locked in RBI-Regulated Digital Escrow.'
          : '✓ Direct instant payout credited to Farmer Bank Account!'
      );
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to advance payment status:', err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      id: 'OFFER_ACCEPTED',
      title: 'Offer Accepted',
      subtitle: 'Contract & Gate Pass Issued',
      desc: `Agreed ₹${unitPrice.toLocaleString('en-IN')}/Qtl for ${quantity} Qtl.`,
      icon: FileCheck2,
    },
    {
      id: 'PAYMENT_INITIATED',
      title: 'Payment Initiated',
      subtitle: 'Escrow Clearing Order Placed',
      desc: 'Buyer initiates payment clearing workflow.',
      icon: CreditCard,
    },
    {
      id: 'ESCROW_HELD',
      title: 'Escrow Held',
      subtitle: '100% Funds Secured in Vault',
      desc: `₹${totalValue.toLocaleString('en-IN')} held safely in Digital Escrow.`,
      icon: Lock,
    },
    {
      id: 'PAYMENT_RELEASED',
      title: 'Payment Released',
      subtitle: 'Bank A/C Credited (T+0)',
      desc: 'Full payout credited via NEFT/IMPS.',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit',sans-serif]">
              Digital Escrow & Trade Payment Lifecycle
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                currentStepIndex === 3
                  ? 'bg-emerald-100 text-emerald-800'
                  : currentStepIndex === 2
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {payment.status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Contract #{tradeId} • {quantity} Qtl {cropName} ({variety || 'Lokwan Grade A'}) • Buyer: {buyerName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowReceiptModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5 text-slate-600" />
            <span>Escrow Slip</span>
          </button>
        </div>
      </div>

      {/* 4-Step Stepper Progress Bar */}
      <div className="relative">
        <div className="hidden md:block absolute top-6 left-8 right-8 h-1 bg-slate-200 -z-0">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(currentStepIndex / 3) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`p-3 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-200/50 shadow-xs'
                    : isCompleted
                    ? 'bg-white border-emerald-200'
                    : 'bg-slate-50/70 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex md:flex-col items-center md:items-center gap-3 md:gap-2 text-left md:text-center">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 font-black text-xs transition-colors ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>

                  <div className="min-w-0 flex-1 md:w-full">
                    <div className="text-xs font-black text-slate-900 truncate">{step.title}</div>
                    <div className="text-[10px] font-bold text-emerald-700 truncate">{step.subtitle}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight hidden sm:block">{step.desc}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Breakdown & Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Agreed Contract Value</span>
          <div className="text-lg font-black text-slate-900 mt-0.5">
            ₹{totalValue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500">₹{unitPrice.toLocaleString('en-IN')} × {quantity} Qtl</span>
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Escrow Held Funds</span>
          <div className="text-lg font-black text-emerald-700 mt-0.5 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            ₹{(payment.escrow_held_amount || (currentStepIndex === 2 ? totalValue : 0)).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">100% Protected Vault</span>
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Farmer Disbursed Amount</span>
          <div className="text-lg font-black text-indigo-700 mt-0.5">
            ₹{(payment.amount_paid || (currentStepIndex === 3 ? totalValue : 0)).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold">
            {currentStepIndex === 3 ? 'Direct Bank Settlement (T+0)' : 'Pending Final Release'}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bank Settlement Ref (UTR)</span>
          <div className="text-xs font-mono font-black text-slate-900 mt-1 truncate">
            {payment.bank_reference_utr || (currentStepIndex === 3 ? 'UTR-SBIN8291049281' : 'Pending Release')}
          </div>
          <span className="text-[10px] text-slate-500">Escrow ID: {payment.escrow_token || 'ESC-2026-9481'}</span>
        </div>
      </div>

      {/* Interactive Simulation & State Transition Trigger Bar */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs sm:text-sm font-black text-indigo-950">
              Interactive 4-Stage Payment State Simulation
            </h4>
          </div>
          <span className="text-[11px] text-indigo-700 font-bold">
            Simulate sequential payment lifecycle
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {currentStepIndex === 0 && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleTransitionStatus('PAYMENT_INITIATED')}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Step 1: Initiate Payment Order</span>
            </button>
          )}

          {currentStepIndex === 1 && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleTransitionStatus('ESCROW_HELD')}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Step 2: Lock 100% in Digital Escrow</span>
            </button>
          )}

          {currentStepIndex === 2 && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleTransitionStatus('PAYMENT_RELEASED')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Step 3: Release Payment to Farmer Bank A/C</span>
            </button>
          )}

          {currentStepIndex === 3 && (
            <div className="flex items-center gap-2 text-emerald-800 bg-emerald-100/80 px-3 py-1.5 rounded-xl text-xs font-black">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                ✓ Settlement Complete • ₹{totalValue.toLocaleString('en-IN')} Released (UTR:{' '}
                {payment.bank_reference_utr || 'UTR-SBIN8291049281'})
              </span>
            </div>
          )}
        </div>

        {feedbackMessage && (
          <div className="p-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>

      {/* Collapsible Payment History Audit Trail */}
      <div>
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center justify-between w-full text-xs font-bold text-slate-700 hover:text-slate-900 py-1 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Payment Audit Trail & Escrow History ({payment.history?.length || 1} records)</span>
          </div>
          {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showHistory && (
          <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 animate-fadeIn">
            {payment.history && payment.history.length > 0 ? (
              payment.history.map((h, i) => (
                <div key={i} className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900">{h.status.replace(/_/g, ' ')}</div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{h.note}</p>
                    <span className="text-[10px] text-slate-400">Actor: {h.actor}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic p-2">
                Escrow state created at {payment.updated_at || 'initial trade agreement'}.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Escrow Settlement Slip Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="text-center border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2 font-black">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">Digital Escrow Settlement Voucher</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Voucher Ref: {payment.escrow_token || 'ESC-2026-9481'}</p>
            </div>

            <div className="space-y-3 py-4 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Contract Number</span>
                <span className="font-bold text-slate-900">#REQ-{tradeId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Seller / Farmer</span>
                <span className="font-bold text-slate-900">{farmerName} (Sehore, MP)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Procuring Buyer</span>
                <span className="font-bold text-slate-900">{buyerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Commodity & Quantity</span>
                <span className="font-bold text-slate-900">{quantity} Quintal {cropName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Agreed Rate</span>
                <span className="font-bold text-slate-900">₹{unitPrice.toLocaleString('en-IN')}/Qtl</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Settlement Value</span>
                <span className="font-black text-emerald-700 text-sm">₹{totalValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Bank UTR Reference</span>
                <span className="font-mono font-bold text-slate-900">
                  {payment.bank_reference_utr || 'UTR-SBIN8291049281 (Generated)'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Clearing Status</span>
                <span className="font-bold text-emerald-700">T+0 Instant Verified</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradePaymentStatusTracker;
