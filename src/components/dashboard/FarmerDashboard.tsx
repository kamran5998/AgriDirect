import React, { useState } from 'react';
import {
  Sprout,
  Sun,
  CloudRain,
  Wind,
  Sparkles,
  TrendingUp,
  MapPin,
  Building2,
  Bell,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { FarmerProfile, CropMarketItem } from '../../types';
import { DashboardSidebar, DashboardViewType } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { MarketOverviewKpis } from './MarketOverviewKpis';
import { PriceTrendChart } from './PriceTrendChart';
import { MarketComparisonTable } from './MarketComparisonTable';
import { MyCropsCards } from './MyCropsCards';
import { MarketAlertsList, MarketAlertItem } from './MarketAlertsList';
import { QuickActions } from './QuickActions';
import { AddCropModal } from './AddCropModal';
import { MarketPricesView } from './views/MarketPricesView';
import { BuyersView } from './views/BuyersView';
import { MarketInsightsView } from './views/MarketInsightsView';
import { SavedMarketsView } from './views/SavedMarketsView';
import { FarmerProfileView } from './views/FarmerProfileView';
import { MarketIntelligenceTerminal } from '../market-intelligence/MarketIntelligenceTerminal';
import { CropAnalyticsTerminal } from '../crop-analytics/CropAnalyticsTerminal';
import { DirectMarketAccessTerminal } from '../direct-access/DirectMarketAccessTerminal';
import { IncomingTradeOffersCard } from '../farmer-app/IncomingTradeOffersCard';
import { CropDetailModal } from '../Modals/CropDetailModal';
import { CROP_MARKET_DATA } from '../../data/marketData';

interface FarmerDashboardProps {
  profile: FarmerProfile;
  onUpdateProfile: (updated: Partial<FarmerProfile>) => void;
  onNavigateHome: () => void;
  onSignOut: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  profile,
  onUpdateProfile,
  onNavigateHome,
  onSignOut,
}) => {
  const [currentView, setCurrentView] = useState<DashboardViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState(false);
  const [selectedCropForDetail, setSelectedCropForDetail] = useState<CropMarketItem | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setNotificationToast(message);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  const handleAddCrop = (cropName: string, quantityQuintals: string) => {
    const updatedCrops = profile.selectedCrops.includes(cropName)
      ? profile.selectedCrops
      : [...profile.selectedCrops, cropName];

    const updatedVolumes = {
      ...profile.harvestVolumes,
      [cropName]: quantityQuintals,
    };

    onUpdateProfile({
      selectedCrops: updatedCrops,
      harvestVolumes: updatedVolumes,
    });
    showToast(`Added ${quantityQuintals}q of ${cropName} to your portfolio.`);
  };

  const handleSellNow = (cropName: string) => {
    setCurrentView('buyers');
    showToast(`Showing direct institutional buyer tenders for ${cropName}.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      
      {/* 1. Desktop & Mobile Sidebar */}
      <div className={`hidden lg:block shrink-0 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="fixed top-0 bottom-0 left-0">
          <DashboardSidebar
            currentView={currentView}
            onSelectView={(v) => setCurrentView(v)}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            profile={profile}
            onSignOut={onSignOut}
            unreadNotificationsCount={3}
          />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/70 backdrop-blur-xs">
          <div className="w-72 h-full bg-slate-900">
            <DashboardSidebar
              currentView={currentView}
              onSelectView={(v) => {
                setCurrentView(v);
                setMobileMenuOpen(false);
              }}
              isCollapsed={false}
              onToggleCollapse={() => setMobileMenuOpen(false)}
              profile={profile}
              onSignOut={onSignOut}
              unreadNotificationsCount={3}
            />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <DashboardHeader
          profile={profile}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onSearch={(q) => {
            if (q.trim().length > 0 && currentView !== 'market-prices') {
              setCurrentView('market-prices');
            }
          }}
          unreadCount={3}
          onOpenNotifications={() => setCurrentView('notifications')}
          onOpenProfile={() => setCurrentView('profile')}
        />

        {/* Scrollable Dashboard View */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8 flex-grow">
          
          {/* VIEW: MAIN DASHBOARD */}
          {currentView === 'dashboard' && (
            <>
              {/* 1. Welcome & Contextual Intelligence Section */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
                <div className="space-y-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      National Kisan Dashboard
                    </span>
                    <Badge variant="emerald" size="sm">
                      Kisan ID: MP-SEH-8821
                    </Badge>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight font-['Outfit',sans-serif]">
                    Namaste, {profile.fullName.split(' ')[0]} ji!
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                    Wheat spot prices at <strong>{profile.selectedMandis[0] || 'Sehore APMC'}</strong> opened strong today at <strong className="text-slate-900 font-mono">₹2,860/q (+2.8%)</strong>. 2 institutional corporate buyers have placed active purchase contracts for Grade A grain.
                  </p>
                </div>

                {/* Weather & Soil Quick Micro-Widget */}
                <div className="relative z-10 flex items-center gap-3 bg-slate-50 border border-slate-200/90 rounded-2xl p-4 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>31°C Sunny</span>
                      <span className="text-[10px] text-slate-400 font-normal">• {profile.district}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Optimal drying weather (Moisture: 10.4%)
                    </div>
                  </div>
                </div>
              </div>

              {/* Real Backend Incoming Trade Offers Entry Card */}
              <IncomingTradeOffersCard />

              {/* 2. Market Overview (4 KPI Cards) */}
              <MarketOverviewKpis farmerPrimaryMandi={profile.selectedMandis[0] || 'Sehore APMC'} />

              {/* 3. Interactive Price Trend Chart */}
              <PriceTrendChart />

              {/* 4. Inter-Mandi Market Comparison & Net Arbitrage */}
              <MarketComparisonTable
                onSelectMandi={(mandi) => {
                  showToast(`Selected ${mandi.mandi} for net freight arbitrage calculation.`);
                }}
              />

              {/* 5. My Crops Cards (Harvest Portfolio & Valuations) */}
              <MyCropsCards
                profile={profile}
                onAddCropClick={() => setIsAddCropModalOpen(true)}
                onSellNowClick={handleSellNow}
              />

              {/* 6. Live Market Alerts Feed */}
              <MarketAlertsList
                onAlertAction={(alert) => {
                  if (alert.type === 'demand') {
                    setCurrentView('buyers');
                  } else {
                    setCurrentView('market-prices');
                  }
                }}
              />

              {/* 7. Quick Actions Block */}
              <QuickActions
                onCheckPrices={() => setCurrentView('market-prices')}
                onAddCrop={() => setIsAddCropModalOpen(true)}
                onFindBuyers={() => setCurrentView('buyers')}
                onExploreInsights={() => setCurrentView('market-insights')}
              />
            </>
          )}

          {/* VIEW: MARKET PRICES & INTELLIGENCE */}
          {currentView === 'market-prices' && (
            <MarketIntelligenceTerminal />
          )}

          {/* VIEW: MY CROPS */}
          {currentView === 'my-crops' && (
            <div className="space-y-6">
              <MyCropsCards
                profile={profile}
                onAddCropClick={() => setIsAddCropModalOpen(true)}
                onSellNowClick={handleSellNow}
              />
            </div>
          )}

          {/* VIEW: DIRECT MARKET ACCESS & BUYERS */}
          {currentView === 'buyers' && (
            <DirectMarketAccessTerminal
              farmerDistrict={profile.district}
              farmerState={profile.state}
            />
          )}

          {/* VIEW: MARKET INSIGHTS & DECISION SUPPORT RECOMMENDATIONS */}
          {currentView === 'market-insights' && (
            <div className="space-y-6">
              <MarketInsightsView />
            </div>
          )}

          {/* VIEW: SAVED MARKETS */}
          {currentView === 'saved-markets' && <SavedMarketsView />}

          {/* VIEW: NOTIFICATIONS */}
          {currentView === 'notifications' && (
            <MarketAlertsList
              onAlertAction={(alert) => {
                if (alert.type === 'demand') setCurrentView('buyers');
                else setCurrentView('market-prices');
              }}
            />
          )}

          {/* VIEW: PROFILE & SETTINGS */}
          {(currentView === 'profile' || currentView === 'settings') && (
            <FarmerProfileView
              profile={profile}
              onUpdateProfile={(updated) => {
                onUpdateProfile(updated);
                showToast('Farmer profile and alerts updated.');
              }}
            />
          )}

        </main>
      </div>

      {/* Interactive Add Crop Modal */}
      <AddCropModal
        isOpen={isAddCropModalOpen}
        onClose={() => setIsAddCropModalOpen(false)}
        onSaveCrop={handleAddCrop}
        existingCrops={profile.selectedCrops}
      />

      {/* Crop Detail Modal */}
      <CropDetailModal
        crop={selectedCropForDetail}
        onClose={() => setSelectedCropForDetail(null)}
      />

      {/* Floating Action Toast */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notificationToast}</span>
        </div>
      )}

    </div>
  );
};
