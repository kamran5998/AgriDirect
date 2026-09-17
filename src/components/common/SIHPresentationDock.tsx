import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Server,
  Database,
  Cpu,
  ChevronUp,
  ChevronDown,
  LayoutDashboard,
  TrendingUp,
  Store,
  Building,
  Shield,
  Sprout,
  CheckCircle2,
  Globe,
  ExternalLink,
  Code,
  X,
} from 'lucide-react';
import { AppScreen } from '../../types';
import { Badge } from './Badge';
import { Button } from './Button';

interface SIHPresentationDockProps {
  currentScreen: AppScreen;
  onNavigateScreen: (screen: AppScreen) => void;
}

export const SIHPresentationDock: React.FC<SIHPresentationDockProps> = ({
  currentScreen,
  onNavigateScreen,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showArchModal, setShowArchModal] = useState(false);
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');

  const screens: { id: AppScreen; label: string; icon: React.ReactNode; tag: string }[] = [
    { id: 'landing', label: 'Public Portal', icon: <Sprout className="w-3.5 h-3.5" />, tag: 'Home' },
    { id: 'dashboard', label: 'Farmer Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" />, tag: 'Core UX' },
    { id: 'market-intelligence', label: 'Live Mandi Grid', icon: <Store className="w-3.5 h-3.5" />, tag: '2,418 APMCs' },
    { id: 'crop-analytics', label: 'AI Forecasting', icon: <TrendingUp className="w-3.5 h-3.5" />, tag: 'ML Insights' },
    { id: 'direct-market', label: 'Direct Buyers', icon: <Building className="w-3.5 h-3.5" />, tag: 'Marketplace' },
    { id: 'admin-dashboard', label: 'Admin Ops', icon: <Shield className="w-3.5 h-3.5" />, tag: 'National Telemetry' },
    { id: 'farmer-onboarding', label: 'Onboarding Flow', icon: <Layers className="w-3.5 h-3.5" />, tag: '5-Step KYC' },
  ];

  return (
    <>
      {/* Floating Presentation Bar */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 max-w-5xl w-[96%] sm:w-auto">
        <div className="bg-slate-900/95 text-white backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl p-2 sm:px-3 sm:py-2 transition-all">
          
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Platform Brand Badge */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 font-['Outfit',sans-serif]">
                    AgriDirect Pulse Console
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <span className="text-[9px] text-slate-400 block -mt-0.5">
                  National Agricultural Market Intelligence
                </span>
              </div>
            </div>

            {/* Quick Screen Switcher Pills (Desktop) */}
            <div className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              {screens.slice(0, 6).map((s) => {
                const isActive = currentScreen === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => onNavigateScreen(s.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {s.icon}
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              
              {/* Architecture Blueprint Button */}
              <button
                onClick={() => setShowArchModal(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-950/80 text-purple-300 hover:bg-purple-900 border border-purple-700/80 text-xs font-bold transition-all cursor-pointer"
                title="View Technical Stack Architecture"
              >
                <Server className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Tech Stack</span>
              </button>

              {/* Expand all button for Mobile/Tablet */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex md:hidden items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <span>Views</span>
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>

          </div>

          {/* Expanded Drawer for mobile/tablet */}
          {isExpanded && (
            <div className="md:hidden mt-2 pt-2 border-t border-slate-800 grid grid-cols-2 gap-1.5 animate-fadeIn">
              {screens.map((s) => {
                const isActive = currentScreen === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      onNavigateScreen(s.id);
                      setIsExpanded(false);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white font-black'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {s.icon}
                      <span>{s.label}</span>
                    </div>
                    <span className="text-[9px] opacity-70 font-mono">{s.tag}</span>
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* SIH Technical Stack Architecture Modal */}
      {showArchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-2xl w-full p-6 sm:p-7 border border-slate-800 shadow-2xl space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-['Outfit',sans-serif]">
                    Enterprise System Architecture Blueprint
                  </h3>
                  <p className="text-xs text-slate-400">
                    Production-Grade Tier-4 Agricultural Intelligence Platform
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowArchModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Architecture Flow Diagram */}
            <div className="space-y-3 text-xs">
              
              {/* Tier 1: Frontend */}
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> 1. Presentation Tier (React 19 + TypeScript + Tailwind)
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">Mobile-First PWA</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Role-based views (Farmer, Buyer, APMC Admin), sub-second real-time SVG charting, offline-ready local storage cache, and multilingual localization.
                </p>
              </div>

              {/* Tier 2: Backend */}
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-400 flex items-center gap-1.5">
                    <Server className="w-4 h-4" /> 2. API & Ingestion Service (Python FastAPI / REST)
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">Async Ingestion</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Asynchronous ETL pipelines connecting to Govt Agmarknet API, e-NAM Gateways, and State Mandi EDI boards with automated anomaly detection.
                </p>
              </div>

              {/* Tier 3: ML Intelligence */}
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-400 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" /> 3. Predictive Intelligence (LightGBM + Prophet + LSTM)
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">94.8% Backtested Accuracy</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Multi-horizon price trend forecasting (7d/15d/30d), weather shock impact modeling, and optimal hold-vs-sell profit maximizer algorithms.
                </p>
              </div>

              {/* Tier 4: Database */}
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Database className="w-4 h-4" /> 4. Data Warehouse (MySQL / PostgreSQL / Redis)
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">Timeseries Optimized</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Historical 10-year mandi arrival volumes, GIS geo-coordinates of 2,418 APMC yards, farmer KYC hashes, and buyer escrow audit records.
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>National Agricultural Intelligence & Direct Trade Infrastructure.</span>
              <Button variant="primary" size="sm" onClick={() => setShowArchModal(false)}>
                Close Blueprint
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
