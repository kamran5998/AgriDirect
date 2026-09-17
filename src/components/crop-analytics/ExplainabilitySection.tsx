import React from 'react';
import {
  HelpCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  CloudSun,
  Building2,
  Scale,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { CropAnalyticsProfile } from '../../data/cropAnalyticsData';
import { Badge } from '../common/Badge';

interface ExplainabilitySectionProps {
  data: CropAnalyticsProfile;
}

export const ExplainabilitySection: React.FC<ExplainabilitySectionProps> = ({ data }) => {
  const { explainability } = data;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Demand & Tenders':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'Seasonality':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'Weather & Yield':
        return <CloudSun className="w-4 h-4 text-blue-600" />;
      case 'Govt Policy':
        return <Scale className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
              Why this insight? (Transparent & Explainable AI)
            </h3>
            <Badge variant="emerald" size="sm">
              Trust Score: {explainability.overallConfidence}%
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Breakdown of real-world contributing drivers, weightages, and APMC historical metrics powering this forecast.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Primary Driver: {explainability.primaryDriver}
          </span>
        </div>
      </div>

      {/* 4 Factor Contribution Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {explainability.factors.map((factor) => {
          const isPos = factor.impact === 'positive';

          return (
            <div
              key={factor.id}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Category & Weight Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    {getCategoryIcon(factor.category)}
                    <span>{factor.title}</span>
                  </div>

                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                    {factor.weight}
                  </span>
                </div>

                {/* Progress Bar of Weight Contribution */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full my-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${factor.impactPercentage}%` }}
                  />
                </div>

                {/* Simple Description */}
                <p className="text-xs text-slate-600 leading-relaxed mt-2">
                  {factor.description}
                </p>
              </div>

              {/* Bottom Tag */}
              <div className="pt-2.5 mt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Domain: {factor.category}</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Factor
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Methodology Footer Note */}
      <div className="p-4 rounded-xl bg-slate-100 text-slate-700 text-xs flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          Our forecasting model cross-references 10+ years of historical APMC seasonal pricing, live electronic truck weighment volumes from e-NAM, verified rainfall anomalies from IMD, and forward corporate buyer purchase tenders. Predictions are updated every 30 minutes.
        </p>
      </div>

    </div>
  );
};
