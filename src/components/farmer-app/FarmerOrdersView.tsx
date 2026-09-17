import React, { useState, useEffect, useCallback } from 'react';
import {
  PackageCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  IndianRupee,
  Truck,
  ShieldCheck,
  Scale,
  MapPin,
  ChevronRight,
  ArrowRight,
  FileText,
  Check,
  X,
  AlertTriangle,
  QrCode,
  Search,
  Filter,
  Sparkles,
  Building2,
  UserCheck,
  Wheat,
  Copy,
  ChevronDown,
  ChevronUp,
  CreditCard,
  SendHorizontal,
  ArrowLeftRight,
} from 'lucide-react';
import { farmerApi } from '../../api/farmerApi';
import { DirectSupplyRequest } from '../../data/directMarketData';
import { OrderLifecycleStep, BuyerPaymentStatus } from '../../api/buyerApi';
import { Language, FarmerTab } from './types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface FarmerOrdersViewProps {
  lang: Language;
  onNavigateTab?: (tab: FarmerTab) => void;
  onSwitchToBuyer?: () => void;
}

const LIFECYCLE_STEPS: { step: OrderLifecycleStep; label: string; icon: any; shortDesc: string }[] = [
  { step: 'Order Placed', label: 'Order Placed', icon: FileText, shortDesc: 'Purchase offer sent' },
  { step: 'Offer Accepted', label: 'Offer Accepted', icon: UserCheck, shortDesc: 'Farmer finalized deal' },
  { step: 'Payment', label: 'Payment', icon: CreditCard, shortDesc: 'Digital Escrow secured' },
  { step: 'Pickup Scheduled', label: 'Pickup Scheduled', icon: Truck, shortDesc: 'Freight vehicle assigned' },
  { step: 'Crop Picked Up', label: 'Crop Picked Up', icon: Wheat, shortDesc: 'Loaded from farm-gate' },
  { step: 'Quality/Weighment', label: 'Quality/Weighment', icon: Scale, shortDesc: 'Assisted weighbridge test' },
  { step: 'Delivered', label: 'Delivered', icon: Building2, shortDesc: 'Received at buyer depot' },
  { step: 'Order Completed', label: 'Order Completed', icon: CheckCircle2, shortDesc: 'Escrow released to farmer' },
];

export const FarmerOrdersView: React.FC<FarmerOrdersViewProps> = ({
  lang,
  onNavigateTab,
  onSwitchToBuyer,
}) => {
  const [orders, setOrders] = useState<DirectSupplyRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | BuyerPaymentStatus>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Payment Modal State
  const [paymentModalOrder, setPaymentModalOrder] = useState<DirectSupplyRequest | null>(null);
  const [selectedPayAction, setSelectedPayAction] = useState<BuyerPaymentStatus>('Successful');
  const [payMethod, setPayMethod] = useState<string>('Digital Escrow Clearance (T+0)');
  const [payNotes, setPayNotes] = useState<string>('');

  // Gate Pass Modal
  const [activeGatePass, setActiveGatePass] = useState<DirectSupplyRequest | null>(null);

  // Counter Offer Modal State
  const [counterModalOrder, setCounterModalOrder] = useState<DirectSupplyRequest | null>(null);
  const [counterPrice, setCounterPrice] = useState<string>('');
  const [counterQty, setCounterQty] = useState<string>('');
  const [counterMessage, setCounterMessage] = useState<string>('');
  const [counterSubmitting, setCounterSubmitting] = useState<boolean>(false);

  const loadOrders = useCallback(async () => {
    try {
      const data = await farmerApi.getFarmerRequests();
      setOrders(data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load farmer orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadOrders();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Step position helper
  const getStepStatus = (currentStatus?: OrderLifecycleStep, stepToCheck?: OrderLifecycleStep) => {
    const cur = currentStatus || 'Order Placed';
    const currentIndex = LIFECYCLE_STEPS.findIndex((s) => s.step === cur);
    const checkIndex = LIFECYCLE_STEPS.findIndex((s) => s.step === stepToCheck);
    if (checkIndex < currentIndex) return 'completed';
    if (checkIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const getNextStep = (currentStatus?: OrderLifecycleStep): OrderLifecycleStep | null => {
    const cur = currentStatus || 'Order Placed';
    const currentIndex = LIFECYCLE_STEPS.findIndex((s) => s.step === cur);
    if (currentIndex >= 0 && currentIndex < LIFECYCLE_STEPS.length - 1) {
      return LIFECYCLE_STEPS[currentIndex + 1].step;
    }
    return null;
  };

  // Handle stage advancement by Farmer
  const handleAdvanceStep = async (order: DirectSupplyRequest, nextStep: OrderLifecycleStep) => {
    setActionLoadingId(order.id);
    try {
      await farmerApi.updateOrderStatus(order.id, nextStep, `Status updated to ${nextStep} by Farmer.`);
      await loadOrders();
    } catch (err: any) {
      console.error('Failed to advance order step:', err);
      alert(err?.response?.data?.error || err?.message || 'Failed to update order status');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle payment status change by Farmer
  const handleConfirmPaymentStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalOrder) return;
    setActionLoadingId(paymentModalOrder.id);
    try {
      await farmerApi.updatePaymentStatus(paymentModalOrder.id, selectedPayAction, {
        paymentMethod: payMethod,
        notes: payNotes || `Farmer verified payment status transition to ${selectedPayAction}.`,
      });
      setPaymentModalOrder(null);
      setPayNotes('');
      await loadOrders();
    } catch (err: any) {
      console.error('Failed to update payment status:', err);
      alert(err?.response?.data?.error || err?.message || 'Failed to update payment status');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Farmer accepts proposal (Order Placed -> Offer Accepted)
  const handleFarmerAcceptOffer = async (order: DirectSupplyRequest) => {
    setActionLoadingId(order.id);
    try {
      await farmerApi.updateFarmerRequest(order.id, {
        status: 'accepted',
        message: 'Farmer accepted the procurement terms and locked the lot inventory.',
      });
      await loadOrders();
    } catch (err: any) {
      console.error('Failed to accept offer:', err);
      alert(err?.response?.data?.error || err?.message || 'Failed to accept offer');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Farmer sends counter offer
  const handleSubmitCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterModalOrder) return;
    const p = parseFloat(counterPrice);
    const q = parseFloat(counterQty);
    if (!p || p <= 0 || !q || q <= 0) {
      alert('Please enter a valid rate and quantity.');
      return;
    }
    setCounterSubmitting(true);
    try {
      await farmerApi.updateFarmerRequest(counterModalOrder.id, {
        status: 'countered',
        counterPrice: p,
        counterQuantity: q,
        message: counterMessage.trim() || undefined,
      });
      setCounterModalOrder(null);
      await loadOrders();
    } catch (err: any) {
      console.error('Failed to counter offer:', err);
      alert(err?.response?.data?.error || err?.message || 'Failed to submit counter offer');
    } finally {
      setCounterSubmitting(false);
    }
  };

  // Filtering
  const filteredOrders = orders.filter((order) => {
    const currentStep = order.orderStatus || 'Order Placed';
    const isCompleted = currentStep === 'Order Completed' || order.status === 'completed';

    if (statusFilter === 'active' && isCompleted) return false;
    if (statusFilter === 'completed' && !isCompleted) return false;

    const currentPay = order.paymentStatus || 'Pending';
    if (paymentFilter !== 'all' && currentPay !== paymentFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchId = (order.orderId || order.id || '').toLowerCase().includes(q);
      const matchBuyer = (order.buyerName || '').toLowerCase().includes(q);
      const matchCrop = (order.cropName || '').toLowerCase().includes(q);
      const matchVariety = (order.variety || '').toLowerCase().includes(q);
      if (!matchId && !matchBuyer && !matchCrop && !matchVariety) return false;
    }

    return true;
  });

  // Stats calculation
  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter((o) => (o.orderStatus || 'Order Placed') !== 'Order Completed' && o.status !== 'completed').length;
  const completedOrdersCount = orders.filter((o) => (o.orderStatus || 'Order Placed') === 'Order Completed' || o.status === 'completed').length;
  const totalVolume = orders.reduce((sum, o) => sum + Number(o.quantityOfferedQuintals || 0), 0);
  const totalTradeValue = orders.reduce((sum, o) => {
    const p = o.counterPrice || o.offeredPricePerQuintal || 0;
    return sum + (o.quantityOfferedQuintals || 0) * p;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                <Wheat className="w-3.5 h-3.5 text-emerald-700" />
                <span>Farmer View (Seller / Farm-Gate Producer)</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Unified 8-Stage Direct Trade Lifecycle Pipeline
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-['Outfit',sans-serif]">
              My Orders & Trade Lifecycle
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Track real-time order stages from purchase offer to digital escrow release. Status and payment updates synchronize bi-directionally between Farmer and Buyer in real-time.
            </p>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Status'}</span>
            </button>

            {onSwitchToBuyer && (
              <button
                onClick={onSwitchToBuyer}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Switch to Buyer View</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time sync confirmation pill */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Single Source of Truth: Central synchronized ledger active. Last verified: {lastRefreshed.toLocaleTimeString()}</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            {totalOrdersCount} Total Contract Records Found
          </span>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Trade Contracts</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalOrdersCount}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{totalVolume} Qtl committed volume</span>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200/80 bg-emerald-50/20 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Active In-Progress</span>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">{activeOrdersCount}</div>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">Pipeline stages in motion</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Fully Completed</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{completedOrdersCount}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Delivered & funds settled</span>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200/80 bg-amber-50/20 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Total Contract Realization</span>
          <div className="text-2xl font-black text-amber-900 mt-1 font-mono">₹{totalTradeValue.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-amber-700 mt-0.5 block">Secured via Digital Escrow</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, Buyer name, crop, or variety..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            {(['all', 'active', 'completed'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setStatusFilter(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === mode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode === 'all' ? 'All Orders' : mode === 'active' ? 'Active' : 'Completed'}
              </button>
            ))}
          </div>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold focus:outline-hidden focus:border-emerald-500 cursor-pointer shrink-0"
          >
            <option value="all">Payment: All</option>
            <option value="Pending">Payment: Pending</option>
            <option value="Processing">Payment: Processing</option>
            <option value="Successful">Payment: Successful</option>
            <option value="Failed">Payment: Failed</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Loading synchronized order records...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <PackageCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No matching trade orders found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                ? 'Try adjusting your search or filters to locate specific trade contracts.'
                : 'Proposals sent to verified buyers and incoming direct purchase requests will appear here with live tracking.'}
            </p>
          </div>
          {onNavigateTab && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigateTab('buyers')}
              className="cursor-pointer"
            >
              Browse Verified Buyers & Tenders
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const currentStep: OrderLifecycleStep = order.orderStatus || 'Order Placed';
            const nextStep = getNextStep(currentStep);
            const isCompleted = currentStep === 'Order Completed' || order.status === 'completed';
            const paymentStatus: BuyerPaymentStatus = order.paymentStatus || 'Pending';
            const price = Number(order.counterPrice || order.offeredPricePerQuintal || 0);
            const totalVal = Number(order.totalValue || order.totalContractValue || order.quantityOfferedQuintals * price);
            const isExpanded = expandedOrderId === order.id;
            const isLoadingThisAction = actionLoadingId === order.id;
            const displayOrderId = order.orderId || `ADP-ORD-${String(order.id).padStart(5, '0')}`;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5 hover:border-slate-300 transition-all"
              >
                {/* 1. Header: Order ID, Buyer info, Status & Payment Badges */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-slate-700 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <span>{displayOrderId}</span>
                        <button
                          onClick={() => handleCopy(displayOrderId, `order-${order.id}`)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Copy Order ID"
                        >
                          {copiedId === `order-${order.id}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </span>

                      {/* Current Lifecycle Stage Pill */}
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                        isCompleted
                          ? 'bg-slate-900 text-white'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Stage: {currentStep}</span>
                      </span>

                      {/* Payment Status Pill */}
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border ${
                        paymentStatus === 'Successful'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : paymentStatus === 'Processing'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : paymentStatus === 'Failed'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-amber-50 text-amber-900 border-amber-300'
                      }`}>
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Payment: {paymentStatus}</span>
                      </span>

                      {order.qualityGrade && (
                        <span className="text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-md">
                          {order.qualityGrade}
                        </span>
                      )}
                    </div>

                    {/* Buyer Details */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <div className="flex items-center gap-1.5 text-sm font-extrabold text-slate-900">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                        <span>Buyer: {order.buyerName}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500">
                        {order.cropName} ({order.variety || 'Standard Quality'})
                      </span>
                      {order.gatePassId && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                            Gate Pass: #{order.gatePassId}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Financial Values Summary */}
                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 px-4 shrink-0">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Agreed Rate</span>
                      <span className="text-sm font-black text-slate-900 font-mono">
                        ₹{price.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-500">/Qtl</span>
                      </span>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Lot Volume</span>
                      <span className="text-sm font-black text-slate-900 font-mono">
                        {order.quantityOfferedQuintals} <span className="text-xs font-normal text-slate-500">Qtl</span>
                      </span>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Value</span>
                      <span className="text-base font-black text-emerald-700 font-mono">
                        ₹{totalVal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Visual 8-Stage Order Lifecycle Tracker */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Order Fulfillment Progress (Synchronized with Buyer)
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Step {LIFECYCLE_STEPS.findIndex((s) => s.step === currentStep) + 1} of 8
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                    {LIFECYCLE_STEPS.map((s, idx) => {
                      const StepIcon = s.icon;
                      const status = getStepStatus(currentStep, s.step);
                      const isCur = status === 'current';
                      const isDone = status === 'completed';

                      return (
                        <div
                          key={s.step}
                          className={`rounded-2xl p-2.5 border transition-all flex flex-col justify-between ${
                            isCur
                              ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                              : isDone
                              ? 'bg-slate-50 border-emerald-200/80 text-slate-800'
                              : 'bg-slate-50/50 border-slate-200/60 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              0{idx + 1}
                            </span>
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            {isCur && <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>}
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <StepIcon className={`w-3.5 h-3.5 shrink-0 ${
                                isCur ? 'text-emerald-700' : isDone ? 'text-emerald-600' : 'text-slate-400'
                              }`} />
                              <span className={`text-[11px] font-extrabold truncate ${
                                isCur ? 'text-emerald-950 font-black' : isDone ? 'text-slate-900' : 'text-slate-500'
                              }`}>
                                {s.label}
                              </span>
                            </div>
                            <p className="text-[9px] text-slate-500 line-clamp-1">{s.shortDesc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Farmer Role-Specific Action Strip */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Farmer Role Action & Controls
                    </span>
                    <p className="text-xs text-slate-700 font-medium">
                      {currentStep === 'Order Placed' && 'Buyer has sent a formal purchase order. Review terms and accept or send a counter-rate.'}
                      {currentStep === 'Offer Accepted' && 'Deal finalized! Awaiting buyer to deposit digital escrow payment.'}
                      {currentStep === 'Payment' && 'Digital Escrow secured. Ready to schedule farm-gate vehicle arrival.'}
                      {currentStep === 'Pickup Scheduled' && 'Transport vehicle assigned. Confirm loading when truck arrives at farm-gate.'}
                      {currentStep === 'Crop Picked Up' && 'Crop in transit. Proceed to confirm assisted weighment and quality moisture verification.'}
                      {currentStep === 'Quality/Weighment' && 'Weighbridge slip verified. Confirm handover and unloading at buyer depot.'}
                      {currentStep === 'Delivered' && 'Grain safely received at depot. Confirm final settlement to release escrow funds.'}
                      {currentStep === 'Order Completed' && 'Trade contract fully completed. Escrow disbursed to your verified bank account.'}
                    </p>
                  </div>

                  {/* Interactive Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {/* If step is Order Placed */}
                    {currentStep === 'Order Placed' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isLoadingThisAction}
                          onClick={() => handleFarmerAcceptOffer(order)}
                          className="cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          <span>Accept Offer & Lock Lot</span>
                        </Button>
                        <button
                          onClick={() => {
                            setCounterModalOrder(order);
                            setCounterPrice(String(price));
                            setCounterQty(String(order.quantityOfferedQuintals));
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
                        >
                          Send Counter Offer
                        </button>
                      </>
                    )}

                    {/* If step is Offer Accepted */}
                    {currentStep === 'Offer Accepted' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isLoadingThisAction}
                        onClick={() => handleAdvanceStep(order, 'Payment')}
                        className="cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        <span>Confirm Escrow Payment</span>
                      </Button>
                    )}

                    {/* If step is Payment */}
                    {currentStep === 'Payment' && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isLoadingThisAction}
                        onClick={() => handleAdvanceStep(order, 'Pickup Scheduled')}
                        className="cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5 mr-1" />
                        <span>Schedule Farm-Gate Pickup</span>
                      </Button>
                    )}

                    {/* If step is Pickup Scheduled */}
                    {currentStep === 'Pickup Scheduled' && (
                      <>
                        <button
                          onClick={() => setActiveGatePass(order)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 cursor-pointer flex items-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>View Gate Pass (QR)</span>
                        </button>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isLoadingThisAction}
                          onClick={() => handleAdvanceStep(order, 'Crop Picked Up')}
                          className="cursor-pointer"
                        >
                          <Wheat className="w-3.5 h-3.5 mr-1" />
                          <span>Confirm Crop Loaded</span>
                        </Button>
                      </>
                    )}

                    {/* If step is Crop Picked Up */}
                    {currentStep === 'Crop Picked Up' && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isLoadingThisAction}
                        onClick={() => handleAdvanceStep(order, 'Quality/Weighment')}
                        className="cursor-pointer"
                      >
                        <Scale className="w-3.5 h-3.5 mr-1" />
                        <span>Verify Weighment Slip</span>
                      </Button>
                    )}

                    {/* If step is Quality/Weighment */}
                    {currentStep === 'Quality/Weighment' && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isLoadingThisAction}
                        onClick={() => handleAdvanceStep(order, 'Delivered')}
                        className="cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5 mr-1" />
                        <span>Confirm Depot Delivery</span>
                      </Button>
                    )}

                    {/* If step is Delivered */}
                    {currentStep === 'Delivered' && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isLoadingThisAction}
                        onClick={() => handleAdvanceStep(order, 'Order Completed')}
                        className="cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        <span>Complete Trade & Release Escrow</span>
                      </Button>
                    )}

                    {/* Payment Status Modal Trigger */}
                    <button
                      onClick={() => {
                        setPaymentModalOrder(order);
                        setSelectedPayAction(order.paymentStatus || 'Successful');
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                      <span>Manage Payment</span>
                    </button>

                    {/* Toggle Details / Timeline */}
                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 cursor-pointer flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Hide Audit' : 'Audit Trail'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 4. Expandable Timeline Audit Log */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Synchronized Audit Trail & Verification Events
                    </h5>

                    {Array.isArray(order.timeline) && order.timeline.length > 0 ? (
                      <div className="space-y-2 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                        {order.timeline.map((event: any, idx: number) => (
                          <div key={idx} className="relative flex items-start gap-3 pl-7 text-xs">
                            <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                            <div className="flex-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-extrabold text-slate-900">{event.title}</span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Recent'}
                                </span>
                              </div>
                              <p className="text-slate-600 mt-0.5">{event.description}</p>
                              {event.actor_role && (
                                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700">
                                  Action by: {event.actor_name ? `${event.actor_name} (${event.actor_role})` : event.actor_role}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No historical audit events logged yet.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Update Modal */}
      {paymentModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">Manage Payment Status</h4>
                  <p className="text-xs text-slate-500">Order #{paymentModalOrder.orderId || paymentModalOrder.id}</p>
                </div>
              </div>
              <button
                onClick={() => setPaymentModalOrder(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPaymentStatus} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Select Updated Payment Status:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Pending', 'Processing', 'Successful', 'Failed'] as BuyerPaymentStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSelectedPayAction(status)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${
                        selectedPayAction === status
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Payment Channel / Instrument:</label>
                <input
                  type="text"
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Verification Remarks / Notes:</label>
                <textarea
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Verified electronic escrow bank receipt..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPaymentModalOrder(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={actionLoadingId === paymentModalOrder.id}
                >
                  {actionLoadingId === paymentModalOrder.id ? 'Updating...' : 'Save & Broadcast Status'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Electronic Gate Pass Modal */}
      {activeGatePass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">Electronic Farm-Gate Pass</h4>
                  <p className="text-xs text-slate-500">Authorized e-NAM Digital Transit Document</p>
                </div>
              </div>
              <button
                onClick={() => setActiveGatePass(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-500 uppercase">Gate Pass No:</span>
                <span className="font-mono font-black text-indigo-700 text-sm">
                  #{activeGatePass.gatePassId || 'GP-SEH-9921'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Buyer / Destination:</span>
                <span className="font-bold text-slate-900">{activeGatePass.buyerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Crop & Variety:</span>
                <span className="font-bold text-slate-900">{activeGatePass.cropName} ({activeGatePass.variety || 'Grade A'})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Certified Quantity:</span>
                <span className="font-bold text-slate-900">{activeGatePass.quantityOfferedQuintals} Quintals</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Farm Pickup Yard:</span>
                <span className="font-bold text-slate-900">Ashta Barn, Sehore, MP</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Logistics Provider:</span>
                <span className="font-bold text-slate-900">Kisan Rail & Road Freight</span>
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="w-32 h-32 mx-auto bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                <QrCode className="w-20 h-20 text-slate-700" />
              </div>
              <p className="text-[11px] text-slate-500">Scan at weighbridge terminal or depot entrance for instant biometric check-in.</p>
            </div>

            <div className="flex items-center justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveGatePass(null)}
              >
                Close Pass
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Counter Offer Modal */}
      {counterModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-extrabold text-slate-900">Propose Counter Offer</h4>
                <p className="text-xs text-slate-500">Buyer: {counterModalOrder.buyerName}</p>
              </div>
              <button
                onClick={() => setCounterModalOrder(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCounter} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Counter Rate (₹/Qtl):</label>
                  <input
                    type="number"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-emerald-500 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Available Qty (Qtl):</label>
                  <input
                    type="number"
                    value={counterQty}
                    onChange={(e) => setCounterQty(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-emerald-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Message to Buyer:</label>
                <textarea
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  placeholder="e.g. Moisture is only 11.2%, premium quality..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCounterModalOrder(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={counterSubmitting}
                >
                  {counterSubmitting ? 'Sending...' : 'Transmit Counter Offer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
