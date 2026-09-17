import React, { useState } from 'react';
import {
  Sprout,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Building2,
  Phone,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Bell,
  RefreshCw,
  Eye,
  CheckCircle2,
  DollarSign,
  Truck,
  Layers,
  Award,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge, TrendBadge } from '../common/Badge';
import { FarmerProfile, UserRole } from '../../types';
import { CROP_MARKET_DATA } from '../../data/marketData';

interface DashboardPreviewProps {
  profile: FarmerProfile;
  role: UserRole;
  onNavigateHome: () => void;
  onSignOut: () => void;
}

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({
  profile,
  role,
  onNavigateHome,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'tenders' | 'arbitrage'>('watchlist');
  const [acceptedTenderId, setAcceptedTenderId] = useState<string | null>(null);

  // Filter crops matching farmer's selection or fallback to top items
  const farmerCrops = CROP_MARKET_DATA.filter((c) =>
    profile.selectedCrops.some((sc) => c.name.toLowerCase().includes(sc.toLowerCase().split(' ')[0]))
  );
  const displayCrops = farmerCrops.length > 0 ? farmerCrops : CROP_MARKET_DATA.slice(0, 3);

  const matchedTenders = [
    {
      id: 'tender-101',
      buyer: 'Patanjali Agro Processing Unit',
      crop: 'Wheat (Sharbati Grade A)',
      volumeNeeded: '200 Quintals',
      offeredPrice: 2920,
      benchmarkPrice: 2860,
      premium: '+₹60 / Quintal above Mandi',
      location: 'Sehore Industrial Hub (14 km)',
      paymentTerms: '24-Hour Direct Escrow Bank Transfer',
      verified: true,
    },
    {
      id: 'tender-102',
      buyer: 'ITC e-Choupal Sourcing Desk',
      crop: 'Soybean (Yellow Seed)',
      volumeNeeded: '150 Quintals',
      offeredPrice: 4740,
      benchmarkPrice: 4680,
      premium: '+₹60 / Quintal above Mandi',
      location: 'Dewas Procurement Yard (32 km)',
      paymentTerms: 'Immediate Digital Weighment & Settlement',
      verified: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white font-['Outfit',sans-serif]">
                  AgriDirect<span className="text-emerald-400">Terminal</span>
                </span>
                <Badge variant="emerald" size="sm">
                  {role.toUpperCase()} SESSION
                </Badge>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                e-NAM & AGMARKNET Sync: Operational
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Public Landing View
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSignOut}
              className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow space-y-6">
        
        {/* Farmer Profile Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl shadow-xs border border-emerald-200">
              {profile.fullName.split(' ').map((n) => n[0]).join('') || 'K'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{profile.fullName}</h1>
                <Badge variant="emerald" size="sm">
                  Verified Producer
                </Badge>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {profile.village}, {profile.district} ({profile.state}) • Farm Size: {profile.farmSize}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Primary APMC</span>
              <span className="font-bold text-slate-800">{profile.selectedMandis[0] || 'Sehore APMC'}</span>
            </div>

            <div className="bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Daily Alerts</span>
              <span className="font-bold text-emerald-800">SMS & WhatsApp Active</span>
            </div>
          </div>
        </div>

        {/* Advisory Callout */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 border border-slate-700 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="emerald" size="sm" icon={<Sparkles className="w-3 h-3 text-emerald-400" />}>
                  Live Selling Recommendation
                </Badge>
                <span className="text-xs text-slate-400">• Updated 15 mins ago</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Peak Demand Alert: Sharbati Wheat at Sehore APMC & ITC e-Choupal
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Modal spot rates are currently trading at <strong>₹2,860/q</strong> (+2.8% above 30-day average). Verified corporate buyers are offering up to <strong>₹2,920/q</strong> for Grade A low-moisture lots with 24-hour escrow clearing.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('tenders')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer self-start md:self-auto"
            >
              <span>View 2 Direct Buyer Offers</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'watchlist'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            My Tracked Commodities ({displayCrops.length})
          </button>
          <button
            onClick={() => setActiveTab('tenders')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'tenders'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            Institutional Buyer Tenders ({matchedTenders.length})
          </button>
        </div>

        {/* Tab 1: Watchlist */}
        {activeTab === 'watchlist' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {displayCrops.map((crop) => (
              <div
                key={crop.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {crop.category}
                    </span>
                    <TrendBadge change={crop.change} size="sm" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{crop.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {crop.mandi}
                  </p>

                  <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Spot Price</span>
                      <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                        ₹{crop.currentPrice.toLocaleString()} <span className="text-[10px] font-normal text-slate-500 font-sans">/ q</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Demand</span>
                      <div className="text-xs font-bold text-emerald-600 mt-0.5">{crop.demandIndex}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{crop.activeBuyers} Buyers Active</span>
                  <span className="font-semibold text-emerald-700 hover:underline cursor-pointer">
                    View Mandi Depth →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Direct Buyer Tenders */}
        {activeTab === 'tenders' && (
          <div className="space-y-4">
            {matchedTenders.map((tender) => {
              const isAccepted = acceptedTenderId === tender.id;
              return (
                <div
                  key={tender.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="emerald" size="sm">
                        KYC-Verified Buyer
                      </Badge>
                      <span className="text-xs font-semibold text-emerald-700">{tender.premium}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{tender.buyer}</h3>
                    <p className="text-xs text-slate-600">
                      Requirement: <strong>{tender.volumeNeeded}</strong> of <strong>{tender.crop}</strong> • {tender.location}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {tender.paymentTerms}
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-start md:items-end justify-between shrink-0">
                    <div className="text-2xl font-extrabold text-slate-900 font-mono">
                      ₹{tender.offeredPrice.toLocaleString()}
                      <span className="text-xs font-normal text-slate-500 font-sans ml-1">/ Quintal</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 mb-3">
                      Benchmark Mandi Rate: ₹{tender.benchmarkPrice}/q
                    </div>

                    {isAccepted ? (
                      <div className="px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Purchase Order Contract Initiated!
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => setAcceptedTenderId(tender.id)}
                        className="font-bold shadow-sm"
                      >
                        Accept & Lock Price Deal
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

    </div>
  );
};
