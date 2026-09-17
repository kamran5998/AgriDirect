import React, { useState, useEffect } from 'react';
import { Language } from '../farmer-app/types';
import { BuyerCompanyProfile, BuyerTab } from './types';
import { BuyerHeader } from './BuyerHeader';
import { BuyerNav } from './BuyerNav';
import { BuyerDashboardView } from './BuyerDashboardView';
import { BuyerRequirementsView } from './BuyerRequirementsView';
import { BuyerFarmerListingsView } from './BuyerFarmerListingsView';
import { BuyerRequestsView } from './BuyerRequestsView';
import { BuyerOrdersView } from './BuyerOrdersView';
import { BuyerNotificationsView, BuyerNotificationItem } from './BuyerNotificationsView';
import { PostRequirementModal } from './PostRequirementModal';
import { SendRequestModal } from './SendRequestModal';
import { ViewListingModal } from './ViewListingModal';
import {
  buyerApi,
  BuyerRequirementItem,
  BuyerRequestItem,
  OrderLifecycleStep,
  BuyerPaymentStatus,
  PostRequirementPayload,
  SendBuyerRequestPayload,
} from '../../api/buyerApi';
import { FARMER_LISTINGS_DATA, FarmerListing } from '../../data/directMarketData';

interface BuyerAppProps {
  lang: Language;
  onToggleLang: () => void;
  onSelectLang?: (lang: Language) => void;
  onSwitchToFarmer: () => void;
  onSignOut: () => void;
}

const DEFAULT_BUYER_PROFILE: BuyerCompanyProfile = {
  id: 'buyer-01',
  businessName: 'Patanjali Agro Processing Ltd',
  contactPerson: 'Anil Agarwal (Procurement Head)',
  mobileNumber: '9823456789',
  email: 'procurement@patanjaliagro.com',
  gstin: '23AABCP1928K1Z5',
  enamId: 'ENAM-MP-IND-0042',
  category: 'Corporate Food Processor',
  location: 'Ashta-Sehore Hub, Madhya Pradesh',
  district: 'Sehore',
  state: 'Madhya Pradesh',
  pincode: '466116',
  verificationStatus: 'Verified Institutional Buyer',
  escrowRating: '4.9/5.0',
  totalProcuredTonnage: '14,200 MT',
};

const INITIAL_NOTIFICATIONS: BuyerNotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Trade Offer Accepted by Farmer',
    message: 'Farmer Rajinder Singh Patel accepted your offer of ₹2,920/Qtl for 150 Qtl Sharbati Wheat. Gate pass GP-SEH-9941 is ready.',
    timestamp: '15 mins ago',
    type: 'trade',
    isRead: false,
    actionTab: 'requests',
  },
  {
    id: 'notif-2',
    title: 'Counter-Offer Received',
    message: 'Mukesh Choudhary proposed a counter-rate of ₹4,780/Qtl for 80 Qtl Soybean (JS-9560) in Ichhawar.',
    timestamp: '2 hours ago',
    type: 'trade',
    isRead: false,
    actionTab: 'requests',
  },
  {
    id: 'notif-3',
    title: 'New High-Quality Crop Lot Available',
    message: 'New 200 Quintal Sharbati Wheat lot listed by Bherunda Farmer Producer Company in Sehore.',
    timestamp: '5 hours ago',
    type: 'lot',
    isRead: false,
    actionTab: 'listings',
  },
  {
    id: 'notif-4',
    title: 'Mandi Market Intelligence Alert',
    message: 'Soybean arrivals in Dewas & Ujjain mandis increased by 18%. Modal rates stabilized at ₹4,750/Qtl.',
    timestamp: '1 day ago',
    type: 'price',
    isRead: true,
    actionTab: 'dashboard',
  },
];

export const BuyerApp: React.FC<BuyerAppProps> = ({
  lang,
  onToggleLang,
  onSelectLang,
  onSwitchToFarmer,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<BuyerTab>('dashboard');
  const [profile] = useState<BuyerCompanyProfile>(DEFAULT_BUYER_PROFILE);

  const [requirements, setRequirements] = useState<BuyerRequirementItem[]>([]);
  const [listings, setListings] = useState<FarmerListing[]>([]);
  const [requests, setRequests] = useState<BuyerRequestItem[]>([]);
  const [notifications, setNotifications] = useState<BuyerNotificationItem[]>(INITIAL_NOTIFICATIONS);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPostRequirementOpen, setIsPostRequirementOpen] = useState<boolean>(false);
  const [selectedListingForOffer, setSelectedListingForOffer] = useState<FarmerListing | null>(null);
  const [selectedListingForView, setSelectedListingForView] = useState<FarmerListing | null>(null);

  // Load backend data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reqData, tradeData, listingsData] = await Promise.all([
        buyerApi.getRequirements(),
        buyerApi.getBuyerRequests(),
        buyerApi.getFarmerListings(true),
      ]);
      setRequirements(reqData);
      setRequests(tradeData);
      setListings(listingsData);
    } catch (err) {
      console.error('Failed to load buyer procurement data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Requirement CRUD
  const handlePostRequirement = async (payload: PostRequirementPayload) => {
    const created = await buyerApi.createRequirement(payload);
    setRequirements((prev) => [created, ...prev]);

    // Add alert notification
    const newNotif: BuyerNotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Procurement Requirement Published',
      message: `Tender for ${payload.quantityRequired} Qtl ${payload.cropName} at ₹${payload.expectedPrice}/Qtl broadcasted to registered farmers.`,
      timestamp: 'Just now',
      type: 'system',
      isRead: false,
      actionTab: 'requirements',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleUpdateRequirementStatus = async (
    id: number,
    status: 'open' | 'fulfilled' | 'cancelled'
  ) => {
    await buyerApi.updateRequirementStatus(id, status);
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const handleDeleteRequirement = async (id: number) => {
    await buyerApi.deleteRequirement(id);
    setRequirements((prev) => prev.filter((r) => r.id !== id));
  };

  // Send Buyer Request
  const handleSendBuyerRequest = async (payload: SendBuyerRequestPayload) => {
    try {
      const newRequest = await buyerApi.sendBuyerRequest(payload);
      const [updatedRequests, updatedListings] = await Promise.all([
        buyerApi.getBuyerRequests(),
        buyerApi.getFarmerListings(true),
      ]);
      setRequests(updatedRequests.length > 0 ? updatedRequests : (prev) => [newRequest, ...prev]);
      setListings(updatedListings);

      const newNotif: BuyerNotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Purchase Offer Transmitted',
        message: `Your direct purchase proposal of ₹${payload.offeredPrice}/Qtl for ${payload.quantity} Qtl ${payload.cropName} sent to farmer.`,
        timestamp: 'Just now',
        type: 'trade',
        isRead: false,
        actionTab: 'requests',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    } catch (err) {
      console.error('Failed to send buyer request:', err);
    }
  };

  const handleUpdateRequestStatus = async (
    requestId: string | number,
    status: 'pending' | 'accepted' | 'countered' | 'rejected' | 'completed',
    message?: string
  ) => {
    try {
      await buyerApi.updateRequestStatus(requestId, status, message);
      const [updatedRequests, updatedListings] = await Promise.all([
        buyerApi.getBuyerRequests(),
        buyerApi.getFarmerListings(true),
      ]);
      setRequests(updatedRequests);
      setListings(updatedListings);
    } catch (err) {
      console.error('Failed to update request status:', err);
    }
  };

  // Order Lifecycle Progression & Payment
  const handleUpdateOrderStatus = async (
    orderId: string | number,
    newStatus: OrderLifecycleStep,
    notes?: string
  ) => {
    try {
      await buyerApi.updateOrderStatus(orderId, newStatus, notes);
      await loadData();
    } catch (err) {
      console.error('Failed to update order status:', err);
      throw err;
    }
  };

  const handleUpdatePaymentStatus = async (
    orderId: string | number,
    paymentStatus: BuyerPaymentStatus,
    options?: { paymentMethod?: string; notes?: string }
  ) => {
    try {
      await buyerApi.updateOrderPaymentStatus(orderId, paymentStatus, options);
      await loadData();
    } catch (err) {
      console.error('Failed to update payment status:', err);
      throw err;
    }
  };

  // Notifications
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-100 selection:text-indigo-900 font-['Outfit',sans-serif]">
      {/* Buyer Header with Global 3-Language Selector */}
      <BuyerHeader
        profile={profile}
        lang={lang}
        unreadNotifsCount={unreadNotifsCount}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onToggleLang={onToggleLang}
        onSelectLang={onSelectLang}
        onSwitchToFarmer={onSwitchToFarmer}
        onSignOut={onSignOut}
      />

      {/* Navigation Tabs */}
      <BuyerNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        lang={lang}
        requirementsCount={requirements.filter((r) => r.status === 'open').length}
        listingsCount={listings.length}
        requestsCount={requests.length}
        ordersCount={requests.length}
        unreadNotifsCount={unreadNotifsCount}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <BuyerDashboardView
            profile={profile}
            lang={lang}
            requirements={requirements}
            listings={listings}
            requests={requests}
            onNavigateTab={setActiveTab}
            onOpenPostRequirement={() => setIsPostRequirementOpen(true)}
            onOpenSendRequest={(lot) => setSelectedListingForOffer(lot)}
            onOpenViewListing={(lot) => setSelectedListingForView(lot)}
          />
        )}

        {activeTab === 'orders' && (
          <BuyerOrdersView
            lang={lang}
            orders={requests}
            isLoading={isLoading}
            onRefresh={loadData}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'requirements' && (
          <BuyerRequirementsView
            lang={lang}
            requirements={requirements}
            isLoading={isLoading}
            onOpenPostRequirement={() => setIsPostRequirementOpen(true)}
            onUpdateStatus={handleUpdateRequirementStatus}
            onDeleteRequirement={handleDeleteRequirement}
          />
        )}

        {activeTab === 'listings' && (
          <BuyerFarmerListingsView
            lang={lang}
            listings={listings}
            isLoading={isLoading}
            onOpenViewListing={(lot) => setSelectedListingForView(lot)}
            onOpenSendRequest={(lot) => setSelectedListingForOffer(lot)}
          />
        )}

        {activeTab === 'requests' && (
          <BuyerRequestsView
            lang={lang}
            requests={requests}
            isLoading={isLoading}
            onUpdateStatus={handleUpdateRequestStatus}
          />
        )}

        {activeTab === 'notifications' && (
          <BuyerNotificationsView
            lang={lang}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onNavigateTab={setActiveTab}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span>AgriDirect Pulse • Institutional Procurement Module</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">FastAPI & MySQL Connected</span>
          </div>
          <div className="text-slate-400">
            Escrow Secured • e-NAM & APMC Compliant
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PostRequirementModal
        isOpen={isPostRequirementOpen}
        onClose={() => setIsPostRequirementOpen(false)}
        onSubmit={handlePostRequirement}
        lang={lang}
      />

      <SendRequestModal
        isOpen={!!selectedListingForOffer}
        listing={selectedListingForOffer}
        onClose={() => setSelectedListingForOffer(null)}
        onSubmit={handleSendBuyerRequest}
        lang={lang}
      />

      <ViewListingModal
        isOpen={!!selectedListingForView}
        listing={selectedListingForView}
        onClose={() => setSelectedListingForView(null)}
        onSendRequest={(lot) => {
          setSelectedListingForView(null);
          setSelectedListingForOffer(lot);
        }}
        lang={lang}
      />
    </div>
  );
};
