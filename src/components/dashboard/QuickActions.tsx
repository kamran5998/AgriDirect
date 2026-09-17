import React from 'react';
import {
  TrendingUp,
  Plus,
  Building,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface QuickActionsProps {
  onCheckPrices: () => void;
  onAddCrop: () => void;
  onFindBuyers: () => void;
  onExploreInsights: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onCheckPrices,
  onAddCrop,
  onFindBuyers,
  onExploreInsights,
}) => {
  const actions = [
    {
      id: 'check-prices',
      title: 'Check Market Prices',
      subtitle: 'Live spot & modal rates across 2,400+ APMCs',
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-200',
      action: onCheckPrices,
    },
    {
      id: 'add-crop',
      title: 'Add / Update Crop',
      subtitle: 'Log harvested inventory and lot size for alerts',
      icon: <Plus className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 hover:bg-blue-100/70 border-blue-200',
      action: onAddCrop,
    },
    {
      id: 'find-buyers',
      title: 'Find Verified Buyers',
      subtitle: 'Direct procurement tenders from millers & retailers',
      icon: <Building className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50 hover:bg-purple-100/70 border-purple-200',
      action: onFindBuyers,
    },
    {
      id: 'explore-insights',
      title: 'Explore Insights & Forecasts',
      subtitle: 'Arrival volume dynamics and AI sell advisories',
      icon: <Sparkles className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 hover:bg-amber-100/70 border-amber-200',
      action: onExploreInsights,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Quick Operational Actions
        </h3>
        <span className="text-[11px] text-slate-400">One-click terminal tools</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={act.action}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${act.bg}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center">
                {act.icon}
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {act.title}
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {act.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
