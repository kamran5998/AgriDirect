import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  SlidersHorizontal,
  Compass,
  LineChart as LineChartIcon,
  Flame,
  Award,
  HelpCircle,
  RefreshCw,
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { CROP_ANALYTICS_DATASET, CropAnalyticsProfile } from '../../data/cropAnalyticsData';
import { CropSelectorBar } from './CropSelectorBar';
import { CropOverviewKpis } from './CropOverviewKpis';
import { PriceForecastChart } from './PriceForecastChart';
import { DemandInsightsCard } from './DemandInsightsCard';
import { MarketOpportunityGrid } from './MarketOpportunityGrid';
import { DataDrivenInsightCards } from './DataDrivenInsightCards';
import { ExplainabilitySection } from './ExplainabilitySection';

interface CropAnalyticsTerminalProps {
  onBackToDashboard?: () => void;
}

export const CropAnalyticsTerminal: React.FC<CropAnalyticsTerminalProps> = ({
  onBackToDashboard,
}) => {
  const [selectedCropId, setSelectedCropId] = useState<string>('wheat-sharbati');
  const [selectedState, setSelectedState] = useState<string>('Madhya Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Sehore');
  const [selectedMandi, setSelectedMandi] = useState<string>('Sehore APMC Yard');
  const [activeTab, setActiveTab] = useState<'all' | 'forecast' | 'demand' | 'opportunities' | 'explainability'>('all');
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
      showToast('Crop analytics and price forecast model re-computed.');
    }, 600);
  };

  // Get active crop profile
  const cropData: CropAnalyticsProfile =
    CROP_ANALYTICS_DATASET[selectedCropId] || CROP_ANALYTICS_DATASET['wheat-sharbati'];

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      
      {/* Terminal Title Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="purple" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
              Crop Intelligence & Future Forecast AI
            </Badge>
            <span className="text-xs text-slate-400 font-mono">
              Model: ARIMA-XGBoost Hybrid v2.6 • Real-Time Predictive Feed
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-['Outfit',sans-serif]">
            Crop Analytics, Price Projections & Demand Insights
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Empowering cultivators with probabilistic price trajectory forecasts, seasonal demand cycles, optimal destination arbitrage, and transparent factor explainability.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Re-run Forecast</span>
          </button>

          <button
            onClick={() => showToast('Crop forecast report downloaded.')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Forecast</span>
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Full Analytics Suite', icon: <SlidersHorizontal className="w-4 h-4" /> },
          { id: 'forecast', label: '30-Day Price Forecast', icon: <LineChartIcon className="w-4 h-4" /> },
          { id: 'demand', label: 'Institutional Demand', icon: <Flame className="w-4 h-4" /> },
          { id: 'opportunities', label: 'Market Opportunity Ranking', icon: <Award className="w-4 h-4" /> },
          { id: 'explainability', label: 'Why This Insight?', icon: <HelpCircle className="w-4 h-4" /> },
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

      {/* 1. Crop Selector Bar */}
      <CropSelectorBar
        selectedCropId={selectedCropId}
        onSelectCropId={(id) => {
          setSelectedCropId(id);
          showToast(`Switched analytics target to ${CROP_ANALYTICS_DATASET[id]?.cropName}`);
        }}
        selectedState={selectedState}
        onSelectState={setSelectedState}
        selectedDistrict={selectedDistrict}
        onSelectDistrict={setSelectedDistrict}
        selectedMandi={selectedMandi}
        onSelectMandi={setSelectedMandi}
        onResetToDefaults={() => {
          setSelectedCropId('wheat-sharbati');
          setSelectedState('Madhya Pradesh');
          setSelectedDistrict('Sehore');
          setSelectedMandi('Sehore APMC Yard');
        }}
      />

      {/* 2. Crop Overview KPIs */}
      <CropOverviewKpis data={cropData} />

      {/* 3. Price Forecast Chart */}
      {(activeTab === 'all' || activeTab === 'forecast') && (
        <PriceForecastChart data={cropData} />
      )}

      {/* 4. Demand Insights Card */}
      {(activeTab === 'all' || activeTab === 'demand') && (
        <DemandInsightsCard data={cropData} />
      )}

      {/* 5. Market Opportunity Grid */}
      {(activeTab === 'all' || activeTab === 'opportunities') && (
        <MarketOpportunityGrid
          data={cropData}
          onSelectOpportunityMandi={(opp) => {
            showToast(`Selected ${opp.mandi} for net freight arbitrage optimization.`);
          }}
        />
      )}

      {/* 6. Data-Driven Insight Cards */}
      {(activeTab === 'all' || activeTab === 'forecast') && (
        <DataDrivenInsightCards data={cropData} />
      )}

      {/* 7. Explainability Section ("Why this insight?") */}
      {(activeTab === 'all' || activeTab === 'explainability') && (
        <ExplainabilitySection data={cropData} />
      )}

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
