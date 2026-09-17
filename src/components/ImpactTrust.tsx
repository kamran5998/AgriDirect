import React from 'react';
import { Coins, TrendingUp, Shield, Clock, CheckCircle2, Quote, Award, Building, UserCheck } from 'lucide-react';
import { IMPACT_METRICS, TESTIMONIALS } from '../data/marketData';
import { Card } from './common/Card';
import { Badge } from './common/Badge';

export const ImpactTrust: React.FC = () => {
  const iconMap: Record<string, React.ReactNode> = {
    Coins: <Coins className="w-6 h-6 text-emerald-600" />,
    TrendingUp: <TrendingUp className="w-6 h-6 text-emerald-600" />,
    Shield: <Shield className="w-6 h-6 text-blue-600" />,
    Clock: <Clock className="w-6 h-6 text-purple-600" />,
  };

  return (
    <section id="impact" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-emerald-700" />
            Empowering Rural Prosperity
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight font-['Outfit',sans-serif]">
            Measurable Economic Impact for Farmers & FPOs
          </h2>
          <p className="text-base text-slate-600 font-normal">
            By democratizing market data and enabling direct buyer linkage, we ensure the value created in the field stays in the farmer's pocket.
          </p>
        </div>

        {/* 4 Big Impact Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {IMPACT_METRICS.map((item, idx) => (
            <Card
              key={idx}
              className="p-6 bg-slate-50/70 border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 shadow-2xs border border-slate-200/80">
                  {iconMap[item.icon]}
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {item.metric}
                </div>
                <div className="text-sm font-bold text-slate-800 mt-1">
                  {item.value}
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {item.context}
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-200/60 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{item.growth}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Farmer Testimonials & Case Studies */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                Verified Field Outcomes
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Real stories from cultivators and agricultural cooperatives using our platform.</p>
            </div>
            <Badge variant="emerald" size="md">
              Field-Verified Records
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <Card
                key={t.id}
                className="p-6 bg-white border-slate-200 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={t.avatarUrl}
                        alt={t.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900">{t.name}</div>
                        <div className="text-xs text-slate-500">{t.location}</div>
                      </div>
                    </div>
                    {t.verifiedFPO && (
                      <Badge variant="blue" size="sm">
                        Verified FPO
                      </Badge>
                    )}
                  </div>

                  {/* Impact Highlight Badge */}
                  <div className="mb-3.5 p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-xs font-semibold text-emerald-800">
                    {t.incomeBoost}
                  </div>

                  {/* Quote */}
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                  Crop: <span className="text-slate-700 font-semibold">{t.cropFocus}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Institutional Trust & Compliance Bar */}
        <div className="p-8 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            <div className="space-y-1">
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400">Institutional Governance</div>
              <h4 className="text-lg font-bold text-white tracking-tight">Built on Trust, Fairness & Open Standards</h4>
              <p className="text-xs text-slate-300">
                Adhering to national digital agriculture architecture guidelines and sovereign data privacy standards.
              </p>
            </div>

            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Agmarknet Open API
                </div>
                <p className="text-[11px] text-slate-300">Direct spot rate sync from national agriculture portal.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                  <Building className="w-4 h-4 text-blue-400" />
                  e-NAM Standard
                </div>
                <p className="text-[11px] text-slate-300">Interoperable with unified national agriculture market.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 col-span-2 sm:col-span-1">
                <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                  <UserCheck className="w-4 h-4 text-purple-400" />
                  KYC Verified
                </div>
                <p className="text-[11px] text-slate-300">All institutional buyers rigorously audited & insured.</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
