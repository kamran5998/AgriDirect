import React, { useState } from 'react';
import {
  Users,
  Sprout,
  Building,
  Store,
  FileText,
  MessageSquare,
  Bell,
  Activity,
  Shield,
  CheckCircle2,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { AdminUsersSection } from './AdminUsersSection';
import { AdminFarmerManagement } from './AdminFarmerManagement';
import { AdminBuyerManagement } from './AdminBuyerManagement';
import { AdminMarketDataManagement } from './AdminMarketDataManagement';
import { AdminListingsSection } from './AdminListingsSection';
import { AdminBuyerRequestsSection } from './AdminBuyerRequestsSection';
import { AdminNotificationsSection } from './AdminNotificationsSection';
import { AdminSystemHealthSection } from './AdminSystemHealthSection';
import { AdminDisputesSection } from './AdminDisputesSection';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Scale } from 'lucide-react';

interface AdminDashboardTerminalProps {
  onNavigateHome?: () => void;
  onNavigateToFarmerDashboard?: () => void;
  onNavigateToBuyerDashboard?: () => void;
  onSignOut?: () => void;
}

export const AdminDashboardTerminal: React.FC<AdminDashboardTerminalProps> = ({
  onNavigateHome,
  onNavigateToFarmerDashboard,
  onNavigateToBuyerDashboard,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<string>('users');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const navItems = [
    { id: 'users', label: '1. Users', icon: <Users className="w-4 h-4" /> },
    { id: 'farmers', label: '2. Farmers', icon: <Sprout className="w-4 h-4" /> },
    { id: 'buyers', label: '3. Buyers', icon: <Building className="w-4 h-4" /> },
    { id: 'market-data', label: '4. Market Data', icon: <Store className="w-4 h-4" /> },
    { id: 'listings', label: '5. Listings', icon: <FileText className="w-4 h-4" /> },
    { id: 'buyer-requests', label: '6. Buyer Requests', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'notifications', label: '7. Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'disputes', label: '8. Dispute Mediation', icon: <Scale className="w-4 h-4 text-rose-400" /> },
    { id: 'system-health', label: '9. System Health', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        
        {/* Left Brand Identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-purple-600/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold text-white tracking-tight font-['Outfit',sans-serif]">
                AgriDirect <span className="text-purple-400">Admin Dashboard</span>
              </span>
              <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                Administration & Integration Layer
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              National Agricultural Direct Market & Telemetry Governance
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5">
          {onNavigateToFarmerDashboard && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToFarmerDashboard}
              className="text-white border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold"
            >
              Farmer View
            </Button>
          )}

          {onNavigateToBuyerDashboard && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToBuyerDashboard}
              className="text-white border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold"
            >
              Buyer View
            </Button>
          )}

          {onSignOut && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSignOut}
              icon={<LogOut className="w-3.5 h-3.5" />}
              className="text-slate-300 border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold"
            >
              Sign Out
            </Button>
          )}

          {/* Admin Badge */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-purple-900 text-purple-200 font-black flex items-center justify-center text-xs border border-purple-700">
              AD
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-slate-200 block leading-tight">Admin System</span>
              <span className="text-[10px] text-emerald-400 font-mono">Authenticated</span>
            </div>
          </div>
        </div>

      </header>

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-grow space-y-6">
        
        {/* Navigation Tabs Bar - 8 Specific Admin Tabs */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-1.5 flex items-center gap-1.5 overflow-x-auto shadow-lg scrollbar-thin">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === item.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Admin Sub-Views */}
        <div className="text-slate-900">
          {activeTab === 'users' && (
            <AdminUsersSection onShowToast={showToast} />
          )}

          {activeTab === 'farmers' && (
            <AdminFarmerManagement
              onVerifyFarmer={(id) => showToast(`Farmer ${id} verified & KCC approved.`)}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'buyers' && (
            <AdminBuyerManagement
              onVerifyBuyer={(id) => showToast(`Buyer ${id} approved & corporate escrow activated.`)}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'market-data' && (
            <AdminMarketDataManagement onShowToast={showToast} />
          )}

          {activeTab === 'listings' && (
            <AdminListingsSection onShowToast={showToast} />
          )}

          {activeTab === 'buyer-requests' && (
            <AdminBuyerRequestsSection onShowToast={showToast} />
          )}

          {activeTab === 'notifications' && (
            <AdminNotificationsSection onShowToast={showToast} />
          )}

          {activeTab === 'disputes' && (
            <AdminDisputesSection onShowToast={showToast} />
          )}

          {activeTab === 'system-health' && (
            <AdminSystemHealthSection onShowToast={showToast} />
          )}
        </div>

      </div>

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
