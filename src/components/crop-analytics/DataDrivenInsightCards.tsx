import React from 'react';
import {
  TrendingUp,
  Flame,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
} from 'lucide-react';
import { CropAnalyticsProfile } from '../../data/cropAnalyticsData';
import { Badge } from '../common/Badge';

interface DataDrivenInsightCardsProps {
  data: CropAnalyticsProfile;
}

export const DataDrivenInsightCards: React.FC<DataDrivenInsightCardsProps> = ({ data }) => {
  const { priceTrendInsight, demandInsight, marketOpportunityInsight } = data.insights;

  return (
    <div className="space-y-4">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Automated Agricultural Advisory
          </span>
          <Badge variant="emerald" size="sm">
            AI Generated
          </Badge>
        </div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1 font-['Outfit',sans-serif]">
          Data-Driven Crop Recommendations & Selling Strategy
        </h3>
      </div>

      {/* 3 Large Structured Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Price Trend Insight */}
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {priceTrendInsight.confidence}% Confidence
              </span>
            </div>

            <span className="text-[10px] font-extrabold uppercase text-slate-400">
              Price Trajectory Advisory
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-1 mb-2">
              {priceTrendInsight.headline}
            </h4>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-950 my-3 leading-relaxed">
              <strong>Actionable Tip:</strong> {priceTrendInsight.actionableAdvice}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs flex items-center justify-between text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Horizon: {priceTrendInsight.horizon}
            </span>
            <span className="font-bold text-emerald-700 font-mono">
              +{priceTrendInsight.expectedChangePercent}% Target
            </span>
          </div>
        </div>

        {/* Card 2: Demand Insight */}
        <div className="bg-white rounded-2xl border border-purple-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                {demandInsight.procurementTendersCount} Open Tenders
              </span>
            </div>

            <span className="text-[10px] font-extrabold uppercase text-slate-400">
              Procurement Appetite
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-1 mb-2">
              {demandInsight.headline}
            </h4>

            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-purple-950 my-3 leading-relaxed">
              {demandInsight.demandSummary}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs flex items-center justify-between text-slate-500">
            <span>{demandInsight.buyerActivity}</span>
          </div>
        </div>

        {/* Card 3: Market Opportunity Insight */}
        <div className="bg-white rounded-2xl border border-blue-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                +₹{marketOpportunityInsight.extraProfitPerQtl}/q Surplus
              </span>
            </div>

            <span className="text-[10px] font-extrabold uppercase text-slate-400">
              Logistics & Arbitrage
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-1 mb-2">
              {marketOpportunityInsight.headline}
            </h4>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-950 my-3 leading-relaxed">
              <strong>Logistics Advice:</strong> {marketOpportunityInsight.logisticsAdvice}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs flex items-center justify-between text-slate-500">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              {marketOpportunityInsight.bestMarket}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
