import React, { useState, useEffect, useCallback } from 'react';
import {
  Building,
  Sprout,
  FileText,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Store,
  Layers,
} from 'lucide-react';
import {
  VerifiedBuyer,
  FarmerListing,
  DirectSupplyRequest,
  CompletedDeal,
  INITIAL_FARMER_LISTINGS,
  INITIAL_SUPPLY_REQUESTS,
  COMPLETED_DEALS_DATA,
} from '../../data/directMarketData';
import { farmerApi } from '../../api/farmerApi';
import { BuyerMarketplace } from './BuyerMarketplace';
import { MyListingsSection } from './MyListingsSection';
import { RequestsAndDealsSection } from './RequestsAndDealsSection';
import { BuyerDetailsModal } from './BuyerDetailsModal';
import { CreateListingModal } from './CreateListingModal';
import { SupplyOfferModal } from './SupplyOfferModal';
import { StorageFacilitiesSection } from './StorageFacilitiesSection';
import { FpoAggregationSection } from './FpoAggregationSection';
import { GatePassModal } from './GatePassModal';
import { Warehouse, Users } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface DirectMarketAccessTerminalProps {
  farmerDistrict?: string;
  farmerState?: string;
  onBackToDashboard?: () => void;
}

export const DirectMarketAccessTerminal: React.FC<DirectMarketAccessTerminalProps> = ({
  farmerDistrict = 'Sehore',
  farmerState = 'Madhya Pradesh',
  onBackToDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'my-listings' | 'requests-deals' | 'storage' | 'fpo'>('marketplace');
  const [listings, setListings] = useState<FarmerListing[]>([]);
  const [supplyRequests, setSupplyRequests] = useState<DirectSupplyRequest[]>([]);
  const [completedDeals, setCompletedDeals] = useState<CompletedDeal[]>(COMPLETED_DEALS_DATA);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedBuyerForDetails, setSelectedBuyerForDetails] = useState<VerifiedBuyer | null>(null);
  const [selectedBuyerForOffer, setSelectedBuyerForOffer] = useState<VerifiedBuyer | null>(null);
  const [isCreateListingModalOpen, setIsCreateListingModalOpen] = useState(false);
  const [activeGatePass, setActiveGatePass] = useState<{ id: string; buyer: string } | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setActionToast(message);
    setTimeout(() => setActionToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [listingsData, requestsData] = await Promise.all([
        farmerApi.getListings(),
        farmerApi.getFarmerRequests(),
      ]);
      setListings(listingsData);
      setSupplyRequests(requestsData);
    } catch (err) {
      console.error('Failed to load farmer market data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveListing = async (newListing: FarmerListing) => {
    setListings((prev) => [newListing, ...prev.filter((l) => l.id !== newListing.id)]);
    setActiveTab('my-listings');
    showToast(`Published listing for ${newListing.quantityQuintals}q of ${newListing.cropName}. Synchronized to Buyer Marketplace!`);
    await loadData();
  };

  const handleDeleteListing = async (id: string) => {
    await farmerApi.deleteListing(id);
    setListings((prev) => prev.filter((item) => item.id !== id));
    showToast('Crop listing removed from market.');
    await loadData();
  };

  const handleSubmitSupplyOffer = async (newRequest: DirectSupplyRequest) => {
    setSupplyRequests((prev) => [newRequest, ...prev]);
    setActiveTab('requests-deals');
    showToast(`Supply proposal ${newRequest.id} dispatched to ${newRequest.buyerName}.`);
    await loadData();
  };

  const handleAcceptCounterOffer = async (requestId: string) => {
    try {
      await farmerApi.updateFarmerRequest(requestId, { status: 'accepted' });
      showToast('Counter offer accepted! Digital gate pass issued.');
      await loadData();
    } catch (err) {
      console.error('Failed to accept counter offer:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Sub-Navigation */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              National Direct Access Portal
            </span>
            <Badge variant="emerald" size="sm">
              e-NAM & APMC Verified
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Outfit',sans-serif]">
            Direct Market Access & Buyer Matching
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Eliminate commission intermediaries. Sell directly to verified commercial food processors, exporters, and government-backed FPO apex federations with guaranteed escrow payments.
          </p>
        </div>

        {/* Action Button */}
        <div className="relative z-10 shrink-0 flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateListingModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
            className="font-bold shadow-lg shadow-emerald-600/30"
          >
            Create Crop Listing
          </Button>

          {onBackToDashboard && (
            <Button
              variant="outline"
              size="md"
              onClick={onBackToDashboard}
              className="text-white border-slate-700 bg-slate-800/80 hover:bg-slate-700 font-bold"
            >
              Farmer Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Main Terminal Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'marketplace'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Verified Buyer Marketplace</span>
        </button>

        <button
          onClick={() => setActiveTab('my-listings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'my-listings'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>My Crop Listings ({listings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests-deals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'requests-deals'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Proposals & Settlements ({supplyRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'storage'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Warehouse className="w-4 h-4" />
          <span>Scientific Storage & Silos</span>
        </button>

        <button
          onClick={() => setActiveTab('fpo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'fpo'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>FPO Collective Pooling</span>
        </button>
      </div>

      {/* VIEW 1: BUYER MARKETPLACE */}
      {activeTab === 'marketplace' && (
        <BuyerMarketplace
          onSelectBuyerForDetails={(buyer) => setSelectedBuyerForDetails(buyer)}
          onOpenSupplyOffer={(buyer) => setSelectedBuyerForOffer(buyer)}
          farmerDistrict={farmerDistrict}
          farmerState={farmerState}
        />
      )}

      {/* VIEW 2: MY LISTINGS */}
      {activeTab === 'my-listings' && (
        <MyListingsSection
          listings={listings}
          onOpenCreateListing={() => setIsCreateListingModalOpen(true)}
          onViewMatchingBuyers={(cropName) => {
            setActiveTab('marketplace');
          }}
          onDeleteListing={handleDeleteListing}
        />
      )}

      {/* VIEW 3: REQUESTS & DEALS */}
      {activeTab === 'requests-deals' && (
        <RequestsAndDealsSection
          requests={supplyRequests}
          completedDeals={completedDeals}
          onAcceptCounterOffer={handleAcceptCounterOffer}
          onViewGatePass={(gatePassId, buyerName) => {
            setActiveGatePass({ id: gatePassId, buyer: buyerName });
          }}
          onRefreshRequests={loadData}
        />
      )}

      {/* VIEW 4: SCIENTIFIC STORAGE */}
      {activeTab === 'storage' && (
        <StorageFacilitiesSection
          farmerDistrict={farmerDistrict}
          farmerState={farmerState}
        />
      )}

      {/* VIEW 5: FPO AGGREGATION */}
      {activeTab === 'fpo' && (
        <FpoAggregationSection
          farmerDistrict={farmerDistrict}
          farmerState={farmerState}
        />
      )}

      {/* Buyer Details Modal */}
      <BuyerDetailsModal
        buyer={selectedBuyerForDetails}
        onClose={() => setSelectedBuyerForDetails(null)}
        onOpenSupplyOffer={(buyer) => setSelectedBuyerForOffer(buyer)}
      />

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateListingModalOpen}
        onClose={() => setIsCreateListingModalOpen(false)}
        onSaveListing={handleSaveListing}
        farmerDistrict={farmerDistrict}
        farmerState={farmerState}
      />

      {/* Supply Offer Proposal Modal */}
      <SupplyOfferModal
        buyer={selectedBuyerForOffer}
        isOpen={!!selectedBuyerForOffer}
        onClose={() => setSelectedBuyerForOffer(null)}
        onSubmitOffer={handleSubmitSupplyOffer}
        farmerDistrict={farmerDistrict}
      />

      {/* Digital Gate Pass Modal */}
      <GatePassModal
        gatePassId={activeGatePass?.id || null}
        buyerName={activeGatePass?.buyer || null}
        onClose={() => setActiveGatePass(null)}
      />

      {/* Toast Notification */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionToast}</span>
        </div>
      )}

    </div>
  );
};
