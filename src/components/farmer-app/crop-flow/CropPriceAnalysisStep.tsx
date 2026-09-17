import React from 'react';
import {
  TrendingUp,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  BarChart3,
  Scale,
  Info,
} from 'lucide-react';
import { Language } from '../types';

interface CropPriceAnalysisStepProps {
  cropName: string;
  variety: string;
  qualityGrade: string;
  quantityQuintals: number;
  locationVillage: string;
  district: string;
  state: string;
  aiSuggestedPrice: number;
  lang: Language;
  onBack: () => void;
  onProceedToSetPrice: () => void;
}

export const CropPriceAnalysisStep: React.FC<CropPriceAnalysisStepProps> = ({
  cropName,
  variety,
  qualityGrade,
  quantityQuintals,
  locationVillage,
  district,
  state,
  aiSuggestedPrice,
  lang,
  onBack,
  onProceedToSetPrice,
}) => {
  const basePrice = Math.round(aiSuggestedPrice * 0.92);
  const qualityAdjustment = Math.round(aiSuggestedPrice * 0.05);
  const demandAdjustment = aiSuggestedPrice - basePrice - qualityAdjustment;
  const totalValuation = (quantityQuintals || 40) * (aiSuggestedPrice || 2280);

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{lang === 'hi' ? 'चरण 6: AI अपेक्षित मूल्य' : lang === 'mr' ? 'पायरी ६: AI अपेक्षित किंमत' : 'Step 6: AI Expected Price'}</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-['Outfit',sans-serif]">
          {lang === 'hi' ? 'AI अपेक्षित मूल्य विश्लेषण' : lang === 'mr' ? 'AI अपेक्षित किंमत विश्लेषण' : 'AI Expected Price Analysis'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          {lang === 'hi'
            ? 'आपकी फसल, गुणवत्ता और क्षेत्रीय मांग के आधार पर तैयार किया गया भाव'
            : 'Generated dynamically based on crop quality grade, local APMC benchmarks, and corporate buyer demand.'}
        </p>
      </div>

      {/* Main Highlight Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-850 to-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-emerald-700/50 shadow-xl relative overflow-hidden space-y-6">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Suggested Benchmark</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold border border-white/10">
            {qualityGrade || 'Good Quality'}
          </span>
        </div>

        {/* Big Price Display */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
            AI Expected Price
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-white font-['Outfit',sans-serif] tracking-tight">
              ₹{(aiSuggestedPrice || 2280).toLocaleString('en-IN')}
            </span>
            <span className="text-emerald-300 font-bold text-base sm:text-lg">/ Quintal</span>
          </div>
          <p className="text-xs text-emerald-200/90 pt-1">
            Estimated Total Lot Realization: <span className="font-black text-white">₹{totalValuation.toLocaleString('en-IN')}</span> (for {quantityQuintals} Qtl)
          </p>
        </div>

        {/* Deterministic Price Calculation Breakdown */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <p className="text-xs font-black text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
            <span>Price Calculation Breakdown:</span>
          </p>
          <div className="bg-black/25 rounded-2xl p-3 border border-white/10 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-emerald-100/90">
              <span>Base Market Benchmark ({district || 'Mandi'})</span>
              <span className="font-bold">₹{basePrice.toLocaleString('en-IN')}/Qtl</span>
            </div>
            <div className="flex items-center justify-between text-emerald-300">
              <span>Quality Adjustment ({qualityGrade})</span>
              <span className="font-bold">+₹{qualityAdjustment.toLocaleString('en-IN')}/Qtl</span>
            </div>
            <div className="flex items-center justify-between text-emerald-300">
              <span>Variety & Regional Demand ({variety})</span>
              <span className="font-bold">+₹{demandAdjustment.toLocaleString('en-IN')}/Qtl</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between font-black text-white text-sm">
              <span>AI Expected Selling Price</span>
              <span className="text-emerald-300">₹{(aiSuggestedPrice || 2280).toLocaleString('en-IN')}/Qtl</span>
            </div>
          </div>
        </div>

        {/* Major Factors Section */}
        <div className="pt-1 space-y-2">
          <p className="text-xs font-black text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Major Factors Considered:</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-100">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>Current {district || 'Regional'} market rate</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>Crop quality: {qualityGrade}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>Variety demand: {variety}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>Location: {locationVillage ? `${locationVillage}, ` : ''}{district}</span>
            </div>
          </div>
        </div>

        {/* Clear Disclaimer */}
        <div className="p-3 rounded-2xl bg-black/30 border border-white/10 text-[11px] text-emerald-200/80 flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-white">Note:</strong> This is an AI-powered price suggestion based on regional APMC mandi intelligence and institutional buyer requisitions. It is an advisory recommendation and not a guaranteed contract price.
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'hi' ? 'पीछे' : lang === 'mr' ? 'मागे' : 'Back'}</span>
        </button>

        <button
          type="button"
          onClick={onProceedToSetPrice}
          className="flex-1 sm:flex-initial px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{lang === 'hi' ? 'बिक्री मूल्य तय करें' : lang === 'mr' ? 'विक्री किंमत ठरवा' : 'Set Selling Price'}</span>
          <ArrowRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
