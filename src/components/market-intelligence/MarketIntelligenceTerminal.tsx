import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  SlidersHorizontal,
  Compass,
  LineChart as LineChartIcon,
  Scale,
  Search,
  Download,
  Share2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  COMPREHENSIVE_MARKET_PRICES,
  MarketPriceRecord,
} from '../../data/marketIntelligenceData';
import { MarketOverviewFilters, MarketFilterState } from './MarketOverviewFilters';
import { LiveMarketPricesTable } from './LiveMarketPricesTable';
import { MultiMarketComparison } from './MultiMarketComparison';
import { PriceTrendAnalytics } from './PriceTrendAnalytics';
import { MarketHeatmap } from './MarketHeatmap';
import { MarketInsightCards } from './MarketInsightCards';
import { CropDetailModal } from '../Modals/CropDetailModal';
import { CropMarketItem } from '../../types';

interface MarketIntelligenceTerminalProps {
  onBackToDashboard?: () => void;
}

export const MarketIntelligenceTerminal: React.FC<MarketIntelligenceTerminalProps> = ({
  onBackToDashboard,
}) => {
  // Filter state
  const [filters, setFilters] = useState<MarketFilterState>({
    crop: 'All Crops',
    state: 'All States',
    district: 'All Districts',
    market: 'All Mandis',
    dateRange: 'today',
    preset: 'all',
    searchQuery: '',
  });

  // Active sub-tab for focused view
  const [activeTab, setActiveTab] = useState<'all' | 'prices' | 'analytics' | 'comparison' | 'heatmap'>('all');

  // Selected comparison IDs
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>(['mp-1', 'mp-2', 'mp-3']);
  const [selectedCropForModal, setSelectedCropForModal] = useState<CropMarketItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Market feeds re-synchronized from AGMARKNET & e-NAM (0.04s)');
    }, 600);
  };

  const handleToggleCompare = (id: string) => {
    if (selectedForComparison.includes(id)) {
      setSelectedForComparison(selectedForComparison.filter((item) => item !== id));
      showToast('Removed market from comparison.');
    } else {
      if (selectedForComparison.length >= 4) {
        showToast('Maximum 4 markets can be compared simultaneously.');
        return;
      }
      setSelectedForComparison([...selectedForComparison, id]);
      showToast('Added market to comparison matrix.');
    }
  };

  const handleResetFilters = () => {
    setFilters({
      crop: 'All Crops',
      state: 'All States',
      district: 'All Districts',
      market: 'All Mandis',
      dateRange: 'today',
      preset: 'all',
      searchQuery: '',
    });
    showToast('Filters reset to default.');
  };

  // Filter records
  const filteredRecords = COMPREHENSIVE_MARKET_PRICES.filter((record) => {
    // Crop filter
    if (filters.crop !== 'All Crops' && !record.cropName.toLowerCase().includes(filters.crop.toLowerCase())) {
      return false;
    }
    // State filter
    if (filters.state !== 'All States' && record.state !== filters.state) {
      return false;
    }
    // District filter
    if (filters.district !== 'All Districts' && record.district !== filters.district) {
      return false;
    }
    // Search query
    if (filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        record.cropName.toLowerCase().includes(q) ||
        record.variety.toLowerCase().includes(q) ||
        record.mandi.toLowerCase().includes(q) ||
        record.state.toLowerCase().includes(q) ||
        record.district.toLowerCase().includes(q);
      if (!match) return false;
    }
    // Preset filters
    if (filters.preset === 'gainers' && record.change < 2.0) return false;
    if (filters.preset === 'high-vol' && record.arrivalVolume < 5000) return false;
    if (filters.preset === 'surge-demand' && record.demandLevel !== 'Surge') return false;
    if (filters.preset === 'msp-beat' && (!record.mspBenchmark || record.currentPrice <= record.mspBenchmark)) return false;

    return true;
  });

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      
      {/* Terminal Title Bar & Live Refresh Controls */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="emerald" size="sm" icon={<Activity className="w-3.5 h-3.5" />}>
              National APMC Exchange Terminal
            </Badge>
            <span className="text-xs text-slate-400 font-mono">
              Feed ID: AGRI-MKT-2026 • 2,480+ Mandis Live
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-['Outfit',sans-serif]">
            Real-Time Agricultural Market Intelligence & Arbitrage
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Institutional-grade price discovery, multi-mandi freight realization algorithms, and predictive liquidity analytics designed for cultivators, FPOs, and procurement desks.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Feeds</span>
          </button>

          <button
            onClick={() => showToast('Exported CSV of filtered mandi records.')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Terminal View Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Full Terminal Dashboard', icon: <SlidersHorizontal className="w-4 h-4" /> },
          { id: 'prices', label: 'Live Spot Price Matrix', icon: <Activity className="w-4 h-4" /> },
          { id: 'analytics', label: 'Price Trends & Moving Averages', icon: <LineChartIcon className="w-4 h-4" /> },
          { id: 'comparison', label: 'Multi-Market Arbitrage', icon: <Scale className="w-4 h-4" /> },
          { id: 'heatmap', label: 'National Heatmap & Liquidity', icon: <Compass className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-950 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. Top Filters Bar */}
      <MarketOverviewFilters
        filters={filters}
        onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
        onResetFilters={handleResetFilters}
        totalRecordsCount={filteredRecords.length}
      />

      {/* 2. Insight Cards */}
      {(activeTab === 'all' || activeTab === 'prices') && <MarketInsightCards />}

      {/* 3. Live Market Prices Table */}
      {(activeTab === 'all' || activeTab === 'prices') && (
        <LiveMarketPricesTable
          records={filteredRecords}
          selectedForComparison={selectedForComparison}
          onToggleCompare={handleToggleCompare}
          onSelectCropDetail={(rec) => {
            // Convert to CropMarketItem for Modal
            setSelectedCropForModal({
              id: rec.id,
              name: `${rec.cropName} (${rec.variety.split(' ')[0]})`,
              variety: rec.variety,
              category: rec.category as any,
              mandi: rec.mandi,
              state: rec.state,
              district: rec.district,
              currentPrice: rec.currentPrice,
              unit: '₹ / Quintal',
              minPrice: rec.minPrice,
              maxPrice: rec.maxPrice,
              change: rec.change,
              trend: rec.change >= 0 ? 'up' : 'down',
              arrivalVolume: `${rec.arrivalVolume.toLocaleString()} Quintals`,
              qualityGrade: rec.qualityGrade,
              demandIndex: rec.demandLevel as any,
              activeBuyers: rec.activeBuyers,
              sparkline: rec.sparkline,
              lastUpdated: rec.lastUpdated,
            });
          }}
        />
      )}

      {/* 4. Multi-Market Comparison */}
      {(activeTab === 'all' || activeTab === 'comparison') && (
        <MultiMarketComparison
          allRecords={COMPREHENSIVE_MARKET_PRICES}
          selectedIds={selectedForComparison}
          onRemoveMarket={(id) => setSelectedForComparison((prev) => prev.filter((i) => i !== id))}
          onAddMarket={(id) => setSelectedForComparison((prev) => [...prev, id])}
          onClearAll={() => setSelectedForComparison([])}
        />
      )}

      {/* 5. Price Trend Analytics */}
      {(activeTab === 'all' || activeTab === 'analytics') && <PriceTrendAnalytics />}

      {/* 6. Market Heatmap */}
      {(activeTab === 'all' || activeTab === 'heatmap') && <MarketHeatmap />}

      {/* Crop Inspection Modal */}
      <CropDetailModal
        crop={selectedCropForModal}
        onClose={() => setSelectedCropForModal(null)}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
