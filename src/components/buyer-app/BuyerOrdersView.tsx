import React, { useState } from 'react';
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
} from 'lucide-react';
import { Language } from '../farmer-app/types';
import { BuyerRequestItem, OrderLifecycleStep, BuyerPaymentStatus } from '../../api/buyerApi';
import { BuyerTab } from './types';

interface BuyerOrdersViewProps {
  lang: Language;
  orders: BuyerRequestItem[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onUpdateOrderStatus: (orderId: string | number, newStatus: OrderLifecycleStep, notes?: string) => Promise<void>;
  onUpdatePaymentStatus: (
    orderId: string | number,
    paymentStatus: BuyerPaymentStatus,
    options?: { paymentMethod?: string; notes?: string }
  ) => Promise<void>;
  onNavigateTab: (tab: BuyerTab) => void;
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

export const BuyerOrdersView: React.FC<BuyerOrdersViewProps> = ({
  lang,
  orders,
  isLoading,
  onRefresh,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | BuyerPaymentStatus>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Payment Modal State
  const [paymentModalOrder, setPaymentModalOrder] = useState<BuyerRequestItem | null>(null);
  const [selectedPayAction, setSelectedPayAction] = useState<BuyerPaymentStatus>('Successful');
  const [payMethod, setPayMethod] = useState<string>('Digital Escrow Bank Clearance (T+0)');
  const [payNotes, setPayNotes] = useState<string>('');

  // Gate Pass Modal
  const [activeGatePass, setActiveGatePass] = useState<BuyerRequestItem | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to determine step position: -1 before, 0 current, 1 upcoming
  const getStepStatus = (currentStatus: OrderLifecycleStep, stepToCheck: OrderLifecycleStep) => {
    const currentIndex = LIFECYCLE_STEPS.findIndex((s) => s.step === currentStatus);
    const checkIndex = LIFECYCLE_STEPS.findIndex((s) => s.step === stepToCheck);
    if (checkIndex < currentIndex) return 'completed';
    if (checkIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  // Next step calculation
  const getNextStep = (currentStatus: OrderLifecycleStep): OrderLifecycleStep | null => {
    const currentIndex = LIFECYCLE_STEPS.findIndex((s) => s.step === currentStatus);
    if (currentIndex >= 0 && currentIndex < LIFECYCLE_STEPS.length - 1) {
      return LIFECYCLE_STEPS[currentIndex + 1].step;
    }
    return null;
  };

  const handleAdvanceStep = async (order: BuyerRequestItem, nextStep: OrderLifecycleStep) => {
    setActionLoadingId(order.id);
    try {
      await onUpdateOrderStatus(order.id, nextStep, `Buyer advanced order stage to "${nextStep}".`);
    } catch (err: any) {
      alert(err.message || 'Failed to update order step.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleQuickPaymentUpdate = async (
    order: BuyerRequestItem,
    targetStatus: BuyerPaymentStatus,
    notes?: string
  ) => {
    setActionLoadingId(order.id);
    try {
      await onUpdatePaymentStatus(order.id, targetStatus, {
        paymentMethod: 'Digital Escrow Bank Clearance (T+0)',
        notes: notes || `Payment status updated to "${targetStatus}".`,
      });
      setPaymentModalOrder(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update payment status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const submitPaymentModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalOrder) return;
    setActionLoadingId(paymentModalOrder.id);
    try {
      await onUpdatePaymentStatus(paymentModalOrder.id, selectedPayAction, {
        paymentMethod: payMethod,
        notes: payNotes || `Payment status marked as ${selectedPayAction}.`,
      });
      setPaymentModalOrder(null);
      setPayNotes('');
    } catch (err: any) {
      alert(err.message || 'Payment operation failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    // Search
    const q = searchTerm.toLowerCase().trim();
    if (q) {
      const matchId = String(o.id).toLowerCase().includes(q) || (o.orderId && o.orderId.toLowerCase().includes(q));
      const matchCrop = (o.cropName || '').toLowerCase().includes(q) || (o.variety || '').toLowerCase().includes(q);
      const matchFarmer = (o.farmerName || '').toLowerCase().includes(q);
      if (!matchId && !matchCrop && !matchFarmer) return false;
    }

    // Status filter
    const orderStatus = o.orderStatus || 'Order Placed';
    if (statusFilter === 'active') {
      if (orderStatus === 'Order Completed' || o.status === 'rejected' || o.status === 'cancelled') return false;
    } else if (statusFilter === 'completed') {
      if (orderStatus !== 'Order Completed') return false;
    }

    // Payment filter
    const payStatus = o.paymentStatus || 'Pending';
    if (paymentFilter !== 'all') {
      if (payStatus !== paymentFilter) return false;
    }

    return true;
  });

  // Calculate high-level metrics
  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter((o) => (o.orderStatus || 'Order Placed') !== 'Order Completed').length;
  const completedOrdersCount = orders.filter((o) => (o.orderStatus || 'Order Placed') === 'Order Completed').length;
  const pendingPaymentCount = orders.filter((o) => (o.paymentStatus || 'Pending') === 'Pending' || (o.paymentStatus || 'Pending') === 'Failed').length;
  const totalVolumeQuintals = orders.reduce((acc, o) => acc + (Number(o.quantity) || 0), 0);
  const totalValueRupees = orders.reduce((acc, o) => {
    const price = Number(o.counterPrice || o.offeredPrice || 0);
    return acc + (Number(o.quantity) || 0) * price;
  }, 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black shadow-xs">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit',sans-serif]">
                  My Orders & Procurement Lifecycle
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Track real-time trade contracts, multi-step order lifecycle, and digital escrow payments
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Status'}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('listings')}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Procure More Crops</span>
            </button>
          </div>
        </div>

        {/* KPI Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Orders</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
              {totalOrdersCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
              {totalVolumeQuintals.toLocaleString('en-IN')} Qtl volume
            </div>
          </div>

          <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100">
            <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Active Pipeline</div>
            <div className="text-xl sm:text-2xl font-black text-blue-900 font-mono mt-0.5">
              {activeOrdersCount}
            </div>
            <div className="text-[11px] text-blue-700 mt-0.5 font-medium">In transit & fulfillment</div>
          </div>

          <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-100">
            <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Awaiting Payment</div>
            <div className="text-xl sm:text-2xl font-black text-amber-900 font-mono mt-0.5">
              {pendingPaymentCount}
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5 font-medium">Escrow deposit pending</div>
          </div>

          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100">
            <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Total Procurement</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-900 font-mono mt-0.5">
              ₹{(totalValueRupees / 100000).toFixed(2)}L
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">
              {completedOrdersCount} orders completed
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, crop, or farmer..."
            className="w-full pl-9.5 pr-4 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter pills */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'active' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({activeOrdersCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'completed' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({completedOrdersCount})
            </button>
          </div>

          {/* Payment filter dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium text-slate-500">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All States</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Successful">Successful</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm text-slate-600 font-medium">Fetching verified buyer orders and lifecycle state...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-12 sm:p-16 rounded-3xl border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <PackageCheck className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">No Orders Found</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                ? 'No orders match your active filter criteria. Try clearing search filters.'
                : 'You have not initiated or finalized any direct purchase orders yet. Browse farmer crop lots to begin procurement.'}
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPaymentFilter('all');
                onNavigateTab('listings');
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Browse Farmer Lots</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const orderIdStr = order.orderId || `ADP-ORD-${String(order.id).padStart(5, '0')}`;
            const currentOrderStep: OrderLifecycleStep = order.orderStatus || 'Order Placed';
            const currentPaymentStatus: BuyerPaymentStatus = order.paymentStatus || 'Pending';
            const agreedPrice = Number(order.counterPrice || order.offeredPrice || 0);
            const totalValue = Number(order.quantity || 0) * agreedPrice;
            const nextStep = getNextStep(currentOrderStep);
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
              >
                {/* Header Row */}
                <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Order ID badge */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 text-white font-mono text-xs font-black tracking-wide">
                        <span>{orderIdStr}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(orderIdStr, `order-${order.id}`)}
                          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Copy Order ID"
                        >
                          {copiedId === `order-${order.id}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </span>

                      {/* Electronic Gate Pass Pill */}
                      {order.gatePassId && (
                        <button
                          type="button"
                          onClick={() => setActiveGatePass(order)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-all cursor-pointer"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>Gate Pass: {order.gatePassId}</span>
                        </button>
                      )}

                      {/* Date */}
                      <span className="text-[11px] text-slate-500 font-medium">
                        Placed: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Dual Status Badges: Order Status & Payment Status */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Order Status Badge */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200/80 text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                        <span className="text-slate-500 font-medium text-[11px]">Order:</span>
                        <span>{currentOrderStep}</span>
                      </div>

                      {/* Payment Status Badge */}
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                          currentPaymentStatus === 'Successful'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : currentPaymentStatus === 'Processing'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : currentPaymentStatus === 'Failed'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {currentPaymentStatus === 'Successful' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {currentPaymentStatus === 'Processing' && <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />}
                        {currentPaymentStatus === 'Failed' && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                        {currentPaymentStatus === 'Pending' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                        <span className="opacity-70 font-medium text-[11px]">Payment:</span>
                        <span>{currentPaymentStatus}</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200/70">
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Farmer (Seller)</div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{order.farmerName || 'Rajinder Singh'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{order.farmerLocation || 'Sehore, MP'}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Crop & Variety</div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                        <Wheat className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{order.cropName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {order.variety || 'Sharbati Lokwan'} • {order.qualityGrade || 'Grade A'}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Volume (Qtl)</div>
                      <div className="text-xs sm:text-sm font-black text-slate-900 font-mono mt-0.5">
                        {order.quantity} Qtl
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        @ ₹{agreedPrice.toLocaleString('en-IN')}/Qtl
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order Value</div>
                      <div className="text-xs sm:text-sm font-black text-indigo-700 font-mono mt-0.5">
                        ₹{totalValue.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {order.deliveryOption || 'Farm-gate Pickup'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body: 8-Step Lifecycle Timeline */}
                <div className="p-5 sm:p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-['Outfit',sans-serif]">
                      <Truck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Order Fulfillment Lifecycle (8-Step Progression)</span>
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Current: <strong className="text-indigo-600">{currentOrderStep}</strong>
                    </span>
                  </div>

                  {/* Desktop Timeline Flow */}
                  <div className="hidden lg:grid grid-cols-8 gap-1.5 relative py-2">
                    {LIFECYCLE_STEPS.map((s, idx) => {
                      const StepIcon = s.icon;
                      const status = getStepStatus(currentOrderStep, s.step);

                      return (
                        <div key={s.step} className="flex flex-col items-center text-center relative group">
                          {/* Connector Line */}
                          {idx < LIFECYCLE_STEPS.length - 1 && (
                            <div
                              className={`absolute top-4 left-1/2 w-full h-0.5 -z-0 ${
                                status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'
                              }`}
                            />
                          )}

                          {/* Node Circle */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold relative z-10 transition-all ${
                              status === 'completed'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : status === 'current'
                                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-sm scale-110'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {status === 'completed' ? (
                              <Check className="w-4 h-4 text-white stroke-[2.5]" />
                            ) : (
                              <StepIcon className="w-3.5 h-3.5" />
                            )}
                          </div>

                          {/* Label */}
                          <div className="mt-2 space-y-0.5">
                            <div
                              className={`text-[11px] leading-tight font-bold ${
                                status === 'completed'
                                  ? 'text-emerald-700'
                                  : status === 'current'
                                  ? 'text-indigo-900 font-black'
                                  : 'text-slate-400'
                              }`}
                            >
                              {s.label}
                            </div>
                            <div className="text-[9px] text-slate-400 hidden xl:block leading-none">
                              {s.shortDesc}
                            </div>
                          </div>

                          {/* Current marker badge */}
                          {status === 'current' && (
                            <span className="mt-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] font-black rounded-md uppercase tracking-wider">
                              Active
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobile/Tablet Horizontal Scrollable Timeline */}
                  <div className="lg:hidden flex items-start gap-3 overflow-x-auto pb-3 pt-1 no-scrollbar">
                    {LIFECYCLE_STEPS.map((s, idx) => {
                      const StepIcon = s.icon;
                      const status = getStepStatus(currentOrderStep, s.step);

                      return (
                        <div
                          key={s.step}
                          className={`flex-shrink-0 w-28 p-2.5 rounded-2xl border text-center transition-all ${
                            status === 'current'
                              ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-200'
                              : status === 'completed'
                              ? 'bg-emerald-50/40 border-emerald-200'
                              : 'bg-slate-50 border-slate-200 opacity-60'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                              status === 'completed'
                                ? 'bg-emerald-600 text-white'
                                : status === 'current'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {status === 'completed' ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <div
                            className={`text-[11px] font-bold leading-tight ${
                              status === 'current'
                                ? 'text-indigo-900 font-black'
                                : status === 'completed'
                                ? 'text-emerald-800'
                                : 'text-slate-500'
                            }`}
                          >
                            {s.label}
                          </div>
                          {status === 'current' && (
                            <span className="inline-block mt-1 text-[9px] font-black text-indigo-600 uppercase">
                              Current
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Bar & Controls */}
                  <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Left: Quick Payment Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {currentPaymentStatus === 'Pending' || currentPaymentStatus === 'Failed' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentModalOrder(order);
                            setSelectedPayAction('Successful');
                          }}
                          disabled={actionLoadingId === order.id}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Now (Digital Escrow)</span>
                        </button>
                      ) : currentPaymentStatus === 'Processing' ? (
                        <button
                          type="button"
                          onClick={() => handleQuickPaymentUpdate(order, 'Successful', 'Escrow verification cleared.')}
                          disabled={actionLoadingId === order.id}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm Escrow Clearance</span>
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Escrow Secured (₹{totalValue.toLocaleString('en-IN')})</span>
                        </div>
                      )}

                      {/* Payment Options Menu button */}
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentModalOrder(order);
                          setSelectedPayAction(currentPaymentStatus);
                        }}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        title="Manage Payment State"
                      >
                        Manage Escrow
                      </button>
                    </div>

                    {/* Right: Order Lifecycle Progression */}
                    <div className="flex items-center gap-2">
                      {nextStep && currentOrderStep !== 'Order Completed' ? (
                        <button
                          type="button"
                          onClick={() => handleAdvanceStep(order, nextStep)}
                          disabled={actionLoadingId === order.id}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                        >
                          {actionLoadingId === order.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                          )}
                          <span>Advance to: {nextStep}</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-black">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Order Complete</span>
                        </span>
                      )}

                      {/* Expand Details Toggle */}
                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                        title={isExpanded ? 'Collapse Details' : 'Expand Details'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Order Audit & Gate Pass Section */}
                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-slate-200/80 bg-slate-50 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-5 sm:p-6 rounded-b-3xl space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Escrow & Bank Ledger */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-200">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Digital Escrow & Bank Settlement</span>
                          </h4>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-100">
                              <span className="text-slate-500">Payment Status:</span>
                              <span className="font-bold text-slate-900">{currentPaymentStatus}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                              <span className="text-slate-500">Settlement Method:</span>
                              <span className="font-medium text-slate-800">
                                {order.payment?.payment_method || 'Digital Escrow Bank Clearance (T+0)'}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                              <span className="text-slate-500">Escrow Token:</span>
                              <span className="font-mono text-slate-800">
                                {order.payment?.escrow_token || 'ESC-SEH-0941'}
                              </span>
                            </div>
                            {order.payment && (order.payment as any).bank_reference_utr && (
                              <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500">Bank UTR Reference:</span>
                                <span className="font-mono font-bold text-emerald-700">
                                  {(order.payment as any).bank_reference_utr}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Logistics & Transporter Details */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-200">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Logistics & Weighment Route</span>
                          </h4>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-100">
                              <span className="text-slate-500">Logistics State:</span>
                              <span className="font-bold text-slate-900">{order.logistics?.status || 'SCHEDULED'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                              <span className="text-slate-500">Pickup Location:</span>
                              <span className="text-slate-800 font-medium truncate max-w-[200px]">
                                {order.logistics?.pickup_location || order.farmerLocation || 'Farmer Barn, Sehore'}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                              <span className="text-slate-500">Delivery Depot:</span>
                              <span className="text-slate-800 font-medium truncate max-w-[200px]">
                                {order.logistics?.delivery_location || `${order.buyerName} Central Depot`}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                              <span className="text-slate-500">Vehicle Type:</span>
                              <span className="text-slate-800 font-medium">
                                {order.logistics?.vehicle_type || 'Mini Commercial Truck (3 Ton)'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step Switcher for Testing/Demonstration */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800">
                            Manual Step Progression (Lifecycle Controller)
                          </span>
                          <span className="text-[11px] text-slate-500">Select any stage to transition order</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {LIFECYCLE_STEPS.map((s) => (
                            <button
                              key={s.step}
                              type="button"
                              onClick={() => handleAdvanceStep(order, s.step)}
                              disabled={actionLoadingId === order.id}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                                currentOrderStep === s.step
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Audit Event Timeline Logs */}
                      {order.timeline && order.timeline.length > 0 && (
                        <div className="bg-white p-4 rounded-2xl border border-slate-200">
                          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Order Audit Log
                          </h5>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {order.timeline.map((ev, i) => (
                              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <strong className="text-slate-800 font-bold">{ev.title}</strong>
                                    <span className="text-[10px] text-slate-400">
                                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-slate-500 text-[11px] mt-0.5">{ev.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Transition Modal */}
      {paymentModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 animate-scaleUp">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Manage Escrow Payment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitPaymentModal} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {paymentModalOrder.orderId || `ADP-ORD-${paymentModalOrder.id}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Crop & Farmer:</span>
                  <span className="font-bold text-slate-800">
                    {paymentModalOrder.cropName} • {paymentModalOrder.farmerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contract Total:</span>
                  <span className="font-mono font-black text-indigo-700">
                    ₹{(
                      Number(paymentModalOrder.quantity) *
                      Number(paymentModalOrder.counterPrice || paymentModalOrder.offeredPrice || 0)
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Target Payment Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Pending', 'Processing', 'Successful', 'Failed'] as BuyerPaymentStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedPayAction(st)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${
                        selectedPayAction === st
                          ? st === 'Successful'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                            : st === 'Processing'
                            ? 'bg-blue-50 border-blue-500 text-blue-800'
                            : st === 'Failed'
                            ? 'bg-rose-50 border-rose-500 text-rose-800'
                            : 'bg-amber-50 border-amber-500 text-amber-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Method / Gateway Channel
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Digital Escrow Bank Clearance (T+0)">Digital Escrow Bank Clearance (T+0)</option>
                  <option value="Corporate RTGS / NEFT Instant Lock">Corporate RTGS / NEFT Instant Lock</option>
                  <option value="e-NAM Integrated Settlement Gateway">e-NAM Integrated Settlement Gateway</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Audit Notes (Optional)
                </label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Authorized by Chief Procurement Officer"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaymentModalOrder(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId !== null}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {actionLoadingId !== null ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Save Status Transition</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gate Pass Modal */}
      {activeGatePass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Electronic Farm-Gate Pass</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{activeGatePass.gatePassId}</p>
            </div>

            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200/80 inline-block mx-auto">
              {/* Simulated QR Code */}
              <div className="w-40 h-40 bg-white p-3 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-2">
                <QrCode className="w-24 h-24 text-slate-800" />
                <span className="text-[10px] font-mono text-slate-500">Scan at Weighbridge</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 text-left bg-slate-50 p-3 rounded-xl space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Crop:</span>
                <span className="font-bold">{activeGatePass.cropName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Volume:</span>
                <span className="font-bold">{activeGatePass.quantity} Qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Farmer:</span>
                <span className="font-bold">{activeGatePass.farmerName}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveGatePass(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
