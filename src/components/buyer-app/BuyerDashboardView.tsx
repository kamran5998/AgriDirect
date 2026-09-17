import React from 'react';
import {
  FileText,
  Sprout,
  SendHorizontal,
  Plus,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  PackageCheck,
  CreditCard,
  Wheat,
  Scale,
  Building2,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { Language } from '../farmer-app/types';
import { BuyerCompanyProfile, BUYER_TRANSLATIONS, BuyerTab } from './types';
import { BuyerRequirementItem, BuyerRequestItem, OrderLifecycleStep, BuyerPaymentStatus } from '../../api/buyerApi';
import { FarmerListing } from '../../data/directMarketData';

interface BuyerDashboardViewProps {
  profile: BuyerCompanyProfile;
  lang: Language;
  requirements: BuyerRequirementItem[];
  listings: FarmerListing[];
  requests: BuyerRequestItem[];
  onNavigateTab: (tab: BuyerTab) => void;
  onOpenPostRequirement: () => void;
  onOpenSendRequest: (listing: FarmerListing) => void;
  onOpenViewListing: (listing: FarmerListing) => void;
}

export const BuyerDashboardView: React.FC<BuyerDashboardViewProps> = ({
  profile,
  lang,
  requirements,
  listings,
  requests,
  onNavigateTab,
  onOpenPostRequirement,
  onOpenSendRequest,
  onOpenViewListing,
}) => {
  const t = BUYER_TRANSLATIONS[lang] || BUYER_TRANSLATIONS.en;

  const activeRequirements = requirements.filter((r) => r.status === 'open');
  const totalVolumeReq = activeRequirements.reduce((acc, r) => acc + (r.quantityRequired || 0), 0);
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const acceptedRequests = requests.filter((r) => r.status === 'accepted');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome & Quick Action Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
              <span>Direct Farm-Gate Procurement Dashboard</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-['Outfit',sans-serif] tracking-tight">
              Welcome back, {profile.businessName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Source verified crop lots directly from farmers with transparent weighment, digital escrow security, and instant gate pass generation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenPostRequirement}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer font-['Outfit',sans-serif]"
            >
              <Plus className="w-4 h-4" />
              <span>{t.postRequirement}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('listings')}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>{t.farmerListings}</span>
              <ArrowRight className="w-4 h-4 text-indigo-300" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Simple Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Active Tenders */}
        <div
          onClick={() => onNavigateTab('requirements')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 font-['Outfit',sans-serif]">
              {t.activeTenders}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {activeRequirements.length}
          </div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">
            {totalVolumeReq.toLocaleString('en-IN')} Qtl target volume
          </div>
        </div>

        {/* Card 2: Matching Lots */}
        <div
          onClick={() => onNavigateTab('listings')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 font-['Outfit',sans-serif]">
              {t.matchingLots}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {listings.length}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Nearby verified farmer lots
          </div>
        </div>

        {/* Card 3: My Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 font-['Outfit',sans-serif]">
              My Orders & Trades
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {requests.length}
          </div>
          <div className="text-[11px] text-indigo-700 font-semibold mt-1 flex items-center gap-1">
            <span>{requests.filter(r => (r.orderStatus || 'Order Placed') !== 'Order Completed').length} active in fulfillment</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 4: Settlement Rating & Security */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 font-['Outfit',sans-serif]">
              Escrow Settlement
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            100%
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Bank Escrow Protected
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Active Procurement Requirements */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                Active Procurement Tenders
              </h3>
            </div>
            <button
              type="button"
              onClick={onOpenPostRequirement}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post New</span>
            </button>
          </div>

          {activeRequirements.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No active requirements posted yet. Click "+ Post New" to publish a requirement tender.
            </div>
          ) : (
            <div className="space-y-3">
              {activeRequirements.slice(0, 3).map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900 font-['Outfit',sans-serif]">
                      {req.cropName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      Open Tender
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400">Target Volume: </span>
                      <strong className="text-slate-900 font-mono">{req.quantityRequired} Qtl</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400">Target Rate: </span>
                      <strong className="text-indigo-700 font-mono font-bold">
                        ₹{req.expectedPrice.toLocaleString('en-IN')}/Qtl
                      </strong>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 col-span-2">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{req.location}</span>
                    </div>
                  </div>
                </div>
              ))}

              {activeRequirements.length > 3 && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('requirements')}
                  className="w-full py-2.5 text-center text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  View all {activeRequirements.length} requirements →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Column 2: Recommended Matching Farmer Lots */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Sprout className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                Nearby Matching Farmer Lots
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('listings')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No farmer listings available at this moment.
            </div>
          ) : (
            <div className="space-y-3">
              {listings.slice(0, 3).map((lot) => (
                <div
                  key={lot.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-slate-900 font-['Outfit',sans-serif]">
                        {lot.cropName}
                      </span>
                      <span className="text-xs text-slate-500 font-medium ml-1">
                        ({lot.variety})
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                      {lot.qualityGrade}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Available: </span>
                      <strong className="text-slate-900 font-mono">{lot.quantityQuintals} Qtl</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Asking: </span>
                      <strong className="text-emerald-700 font-mono font-bold">
                        ₹{lot.expectedPricePerQuintal.toLocaleString('en-IN')}/Qtl
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{lot.locationVillage}, {lot.district}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenViewListing(lot)}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenSendRequest(lot)}
                        className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer font-['Outfit',sans-serif]"
                      >
                        Send Offer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section: Buyer My Orders & Live Trade Lifecycle */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
                <span>My Orders & Fulfillment Lifecycle</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black">
                  {requests.length} Orders
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Direct farm-gate trades showing order ID, farmer, quantity, value, lifecycle stage, and payment status
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Open Orders Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No orders placed yet. Browse farmer listings to initiate farm-gate crop orders.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold font-['Outfit',sans-serif]">
                  <th className="pb-3 pr-4">Order ID</th>
                  <th className="pb-3 pr-4">Farmer (Seller)</th>
                  <th className="pb-3 pr-4">Crop</th>
                  <th className="pb-3 pr-4">Quantity</th>
                  <th className="pb-3 pr-4">Order Amount</th>
                  <th className="pb-3 pr-4">Order Status</th>
                  <th className="pb-3 pr-4">Payment Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.slice(0, 5).map((order) => {
                  const orderIdStr = order.orderId || `ADP-ORD-${String(order.id).padStart(5, '0')}`;
                  const currentOrderStep: OrderLifecycleStep = order.orderStatus || 'Order Placed';
                  const currentPaymentStatus: BuyerPaymentStatus = order.paymentStatus || 'Pending';
                  const agreedPrice = Number(order.counterPrice || order.offeredPrice || 0);
                  const orderAmount = Number(order.quantity || 0) * agreedPrice;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Order ID */}
                      <td className="py-3.5 pr-4">
                        <div className="font-mono font-bold text-slate-900">{orderIdStr}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </td>

                      {/* Farmer Name */}
                      <td className="py-3.5 pr-4">
                        <div className="font-bold text-slate-800 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate max-w-[140px]">{order.farmerName || 'Verified Farmer'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate max-w-[140px]">{order.farmerLocation || 'Sehore, MP'}</span>
                        </div>
                      </td>

                      {/* Crop */}
                      <td className="py-3.5 pr-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <Wheat className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{order.cropName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{order.variety || 'Sharbati Lokwan'}</div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 pr-4 font-mono font-black text-slate-900">
                        {order.quantity} Qtl
                      </td>

                      {/* Order / Trade Amount */}
                      <td className="py-3.5 pr-4 font-mono font-black text-indigo-700">
                        ₹{orderAmount.toLocaleString('en-IN')}
                      </td>

                      {/* Current Order Status */}
                      <td className="py-3.5 pr-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200/80 font-bold text-[11px] whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                          <span>{currentOrderStep}</span>
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 pr-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-[11px] whitespace-nowrap border ${
                            currentPaymentStatus === 'Successful'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : currentPaymentStatus === 'Processing'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : currentPaymentStatus === 'Failed'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {currentPaymentStatus === 'Successful' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {currentPaymentStatus === 'Processing' && <Clock className="w-3 h-3 text-blue-600" />}
                          {currentPaymentStatus === 'Failed' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                          {currentPaymentStatus === 'Pending' && <Clock className="w-3 h-3 text-amber-600" />}
                          <span>{currentPaymentStatus}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => onNavigateTab('orders')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Track</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 3: Recent Outgoing Trade Offers */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <SendHorizontal className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
              Recent Direct Purchase Offers & Negotiations
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('requests')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({requests.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No trade requests sent yet. Browse farmer listings above and send your first purchase offer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold font-['Outfit',sans-serif]">
                  <th className="pb-3 pr-4">Lot / Crop</th>
                  <th className="pb-3 pr-4">Farmer & Origin</th>
                  <th className="pb-3 pr-4">Offer Rate</th>
                  <th className="pb-3 pr-4">Quantity</th>
                  <th className="pb-3 pr-4">Total Contract</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 text-right">Gate Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.slice(0, 4).map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="font-bold text-slate-900">{req.cropName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Ref #{req.id}</div>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-600">
                      <div className="font-medium text-slate-800">{req.farmerName}</div>
                      <div className="text-[11px] text-slate-400">{req.farmerLocation}</div>
                    </td>
                    <td className="py-3.5 pr-4 font-mono font-bold text-slate-900">
                      ₹{req.offeredPrice.toLocaleString('en-IN')}/Qtl
                    </td>
                    <td className="py-3.5 pr-4 font-mono text-slate-700">
                      {req.quantity} Qtl
                    </td>
                    <td className="py-3.5 pr-4 font-mono font-bold text-indigo-700">
                      ₹{req.totalValue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 pr-4">
                      {req.status === 'accepted' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Accepted</span>
                        </span>
                      ) : req.status === 'countered' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                          <AlertCircle className="w-3 h-3" />
                          <span>Counter: ₹{req.counterPrice}/Qtl</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                          <Clock className="w-3 h-3" />
                          <span>Pending Response</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right font-mono text-xs">
                      {req.gatePassId ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                          {req.gatePassId}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
