/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { FarmerProfile, UserRole } from './types';
import { FarmerTab, Language } from './components/farmer-app/types';
import { FarmerHeader } from './components/farmer-app/FarmerHeader';
import { FarmerNav } from './components/farmer-app/FarmerNav';
import { AdvisorView } from './components/farmer-app/AdvisorView';
import { MarketRatesView } from './components/farmer-app/MarketRatesView';
import { VerifiedBuyersView } from './components/farmer-app/VerifiedBuyersView';
import { MyCropsView } from './components/farmer-app/MyCropsView';
import { FarmerOrdersView } from './components/farmer-app/FarmerOrdersView';
import { SimpleLoginView } from './components/farmer-app/SimpleLoginView';
import { BuyerApp } from './components/buyer-app/BuyerApp';
import { AdminDashboardTerminal } from './components/admin/AdminDashboardTerminal';
import { AlertNotificationCenterModal } from './components/alerts/AlertNotificationCenterModal';
import { ConnectivityBanner } from './components/common/ConnectivityBanner';

export default function App() {
  const { user, isAuthenticated, logout, updateFarmerProfile, switchRole } = useAuth();
  
  // App Navigation & Language State
  const [activeTab, setActiveTab] = useState<FarmerTab>('advisor');
  const [language, setLanguage] = useState<Language>('en');
  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (user?.role as UserRole) || 'farmer';
  });

  // Farmer Profile State
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile>(() => {
    return {
      fullName: user?.fullName || 'Rajinder Singh Patel',
      mobileNumber: user?.mobileNumber || '+91 98765 43210',
      email: user?.email || 'rajinder.singh@farmmail.in',
      state: user?.state || 'Madhya Pradesh',
      district: user?.district || 'Sehore',
      village: 'Ashta',
      pincode: '466116',
      farmSize: '5-10 Acres',
      farmingType: 'Conventional High-Yield',
      experienceYears: '10+ Years',
      preferredLanguage: 'Hindi (हिन्दी)',
      selectedCrops: ['Wheat (Sharbati)', 'Soybean (Yellow)'],
      harvestVolumes: { 'Wheat (Sharbati)': '150', 'Soybean (Yellow)': '80' },
      selectedMandis: ['Sehore APMC Mandi', 'Indore Grain Market'],
      transportWillingness: 'Up to 100 km',
      hasWarehouseStorage: true,
      smsAlertsEnabled: true,
      whatsappAlertsEnabled: true,
    };
  });

  // Sync profile & role when auth user updates
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        setCurrentRole('admin');
      } else if (user.role === 'buyer') {
        setCurrentRole('buyer');
      } else if (user.role === 'farmer') {
        setCurrentRole('farmer');
      }
      setFarmerProfile((prev) => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        mobileNumber: user.mobileNumber || prev.mobileNumber,
        state: user.state || prev.state,
        district: user.district || prev.district,
        ...(user.farmerProfile || {}),
      }));
    }
  }, [user]);

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : prev === 'hi' ? 'mr' : 'en'));
  };

  const handleSelectLanguage = (newLang: Language) => {
    setLanguage(newLang);
  };

  const handleSignOut = () => {
    logout();
    setIsLoggedOut(true);
  };

  const handleLoginSuccess = (destinationTab: FarmerTab, userRole: UserRole) => {
    setIsLoggedOut(false);
    if (userRole === 'admin') {
      setCurrentRole('admin');
    } else if (userRole === 'buyer') {
      setCurrentRole('buyer');
    } else {
      setCurrentRole('farmer');
      setActiveTab(destinationTab);
    }
  };

  const handleUpdateCrops = (
    crops: string[],
    volumes: Record<string, string>,
    state?: string,
    district?: string
  ) => {
    setFarmerProfile((prev) => ({
      ...prev,
      selectedCrops: crops,
      harvestVolumes: volumes,
      state: state || prev.state,
      district: district || prev.district,
    }));
    updateFarmerProfile({
      selectedCrops: crops,
      harvestVolumes: volumes,
      state: state || farmerProfile.state,
      district: district || farmerProfile.district,
    });
  };

  // 1. Simple Login View if signed out or unauthenticated
  if (isLoggedOut || !isAuthenticated) {
    return (
      <SimpleLoginView
        lang={language}
        onSelectLang={handleSelectLanguage}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // 2. Admin Control Dashboard (Strictly protected by JWT role verification)
  if (currentRole === 'admin' && user?.role === 'admin') {
    return (
      <AdminDashboardTerminal
        onNavigateHome={() => setCurrentRole('admin')}
        onNavigateToFarmerDashboard={() => setCurrentRole('farmer')}
        onNavigateToBuyerDashboard={() => setCurrentRole('buyer')}
        onSignOut={handleSignOut}
      />
    );
  }

  // 3. Buyer / Institutional Miller Workspace
  if (currentRole === 'buyer') {
    return (
      <BuyerApp
        lang={language}
        onToggleLang={handleToggleLanguage}
        onSelectLang={handleSelectLanguage}
        onSwitchToFarmer={() => {
          switchRole('farmer');
          setCurrentRole('farmer');
        }}
        onSignOut={handleSignOut}
      />
    );
  }

  // 4. Main Farmer-First Application Layout
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-500 selection:text-white pb-20 sm:pb-8">
      {/* Clean Top Header with Global 3-Language Toggle (English | हिंदी | मराठी) */}
      <FarmerHeader
        profile={farmerProfile}
        lang={language}
        onToggleLang={handleToggleLanguage}
        onSelectLang={handleSelectLanguage}
        onSignOut={handleSignOut}
        onOpenAlerts={() => setIsAlertsModalOpen(true)}
      />

      {/* Simulated SMS & WhatsApp Price & Offer Alerts Modal */}
      <AlertNotificationCenterModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        lang={language}
        onNavigateTab={(tab) => {
          if (tab === 'advisor' || tab === 'markets' || tab === 'buyers' || tab === 'my-crops' || tab === 'orders') {
            setActiveTab(tab as FarmerTab);
          }
        }}
      />

      {/* Desktop Navigation Sub-Header */}
      <FarmerNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        lang={language}
      />

      {/* Main Single-Column Farmer Content Canvas */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 flex-grow">
        {/* Real-time Connectivity Status & Offline Notification Banner */}
        <ConnectivityBanner lang={language} className="mb-4 sm:mb-5" />

        {/* TAB 1: AI Selling Advisor (Answers WHEN & WHERE to Sell) */}
        {activeTab === 'advisor' && (
          <AdvisorView
            profile={farmerProfile}
            lang={language}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onUpdateProfileCrops={handleUpdateCrops}
          />
        )}

        {/* TAB 2: Market Rates (Answers WHERE to Sell) */}
        {activeTab === 'markets' && (
          <MarketRatesView
            profile={farmerProfile}
            lang={language}
            onSelectMandiForSelling={() => setActiveTab('advisor')}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onUpdateProfileCrops={handleUpdateCrops}
          />
        )}

        {/* TAB 3: Verified Buyers (Answers WHOM to Sell to) */}
        {activeTab === 'buyers' && (
          <VerifiedBuyersView
            profile={farmerProfile}
            lang={language}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* TAB 4: My Crops (Harvest Portfolio & Valuations) */}
        {activeTab === 'my-crops' && (
          <MyCropsView
            profile={farmerProfile}
            lang={language}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onUpdateProfileCrops={handleUpdateCrops}
          />
        )}

        {/* TAB 5: Orders & Trade Lifecycle (Role-Specific Farmer View) */}
        {activeTab === 'orders' && (
          <FarmerOrdersView
            lang={language}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSwitchToBuyer={() => {
              switchRole('buyer');
              setCurrentRole('buyer');
            }}
          />
        )}
      </main>

      {/* Footer Branding with Quick Switcher */}
      <footer className="hidden sm:block py-6 border-t border-slate-200 text-center text-xs text-slate-400">
        <div className="flex items-center justify-center gap-3">
          <span>AgriDirect Pulse • Direct Farmer-First Selling Advisory & Procurement Grid</span>
          <span>•</span>
          <button
            type="button"
            onClick={() => {
              switchRole('buyer');
              setCurrentRole('buyer');
            }}
            className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
          >
            Switch to Buyer / Miller Portal →
          </button>
          {user?.role === 'admin' && (
            <>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  switchRole('admin');
                  setCurrentRole('admin');
                }}
                className="text-purple-600 hover:text-purple-800 font-bold hover:underline cursor-pointer"
              >
                Switch to Admin Dashboard →
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
