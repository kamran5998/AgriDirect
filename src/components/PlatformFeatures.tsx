import React, { useState } from 'react';
import { TrendingUp, LineChart, Scale, Award, Handshake, CheckCircle2, ArrowRight, Sparkles, ChevronRight, Layers } from 'lucide-react';
import { PLATFORM_FEATURES } from '../data/marketData';
import { Card } from './common/Card';
import { Badge } from './common/Badge';
import { PlatformFeature } from '../types';

interface PlatformFeaturesProps {
  onSelectFeature?: (feature: PlatformFeature) => void;
  onOpenGetStarted: () => void;
}

export const PlatformFeatures: React.FC<PlatformFeaturesProps> = ({ onSelectFeature, onOpenGetStarted }) => {
  const [activeFeatureId, setActiveFeatureId] = useState<string>(PLATFORM_FEATURES[0].id);

  const iconMap: Record<string, React.ReactNode> = {
    TrendingUp: <TrendingUp className="w-5 h-5 text-emerald-600" />,
    LineChart: <LineChart className="w-5 h-5 text-blue-600" />,
    Scale: <Scale className="w-5 h-5 text-amber-600" />,
    Award: <Award className="w-5 h-5 text-purple-600" />,
    Handshake: <Handshake className="w-5 h-5 text-emerald-600" />,
    CheckCircle2: <CheckCircle2 className="w-5 h-5 text-indigo-600" />,
  };

  const getBadgeVariant = (color: string): 'emerald' | 'blue' | 'amber' | 'purple' => {
    switch (color) {
      case 'blue': return 'blue';
      case 'amber': return 'amber';
      case 'purple': return 'purple';
      default: return 'emerald';
    }
  };

  return (
    <section id="features" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-emerald-700" />
            Core Technology Pillars
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight font-['Outfit',sans-serif]">
            Engineered for Precision Agricultural Decisions
          </h2>
          <p className="text-base text-slate-600 leading-relaxed font-normal">
            Transforming raw, fragmented mandi updates into clear, high-conviction selling strategies and direct buyer connections.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLATFORM_FEATURES.map((feature) => {
            const isSelected = activeFeatureId === feature.id;
            return (
              <Card
                key={feature.id}
                hoverEffect={true}
                onClick={() => {
                  setActiveFeatureId(feature.id);
                  if (onSelectFeature) onSelectFeature(feature);
                }}
                className={`p-6 transition-all flex flex-col justify-between cursor-pointer border ${
                  isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-md bg-white' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Card Header: Icon & Category Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200/80">
                      {iconMap[feature.icon]}
                    </div>
                    <Badge variant={getBadgeVariant(feature.badgeColor)} size="sm">
                      {feature.tag}
                    </Badge>
                  </div>

                  {/* Title & Category */}
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {feature.category}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-5">
                    {feature.description}
                  </p>
                </div>

                <div>
                  {/* Micro Data Points */}
                  <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs mb-4 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                    {feature.dataPoints.map((dp, idx) => (
                      <div key={idx}>
                        <span className="text-[10px] text-slate-500 block">{dp.label}</span>
                        <span className="font-bold text-slate-900 font-mono text-xs">{dp.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer capability link */}
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                    <span className="text-[11px] truncate max-w-[200px] text-slate-500 font-normal">
                      {feature.keyCapability}
                    </span>
                    <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Feature Bottom Action */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={onOpenGetStarted}
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-5 py-2.5 rounded-xl border border-emerald-200 transition-all cursor-pointer"
          >
            <span>Experience Real-Time Market Intelligence on Your Crops</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
