import React, { useState } from 'react';
import { UserCheck, DatabaseZap, Cpu, CheckCircle, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { WORKFLOW_STEPS } from '../data/marketData';
import { Card } from './common/Card';
import { Badge } from './common/Badge';

export const HowItWorks: React.FC<{ onStartFlow: () => void }> = ({ onStartFlow }) => {
  const [selectedStep, setSelectedStep] = useState(0);

  const iconComponents: Record<string, React.ReactNode> = {
    UserCheck: <UserCheck className="w-6 h-6 text-emerald-600" />,
    DatabaseZap: <DatabaseZap className="w-6 h-6 text-blue-600" />,
    Cpu: <Cpu className="w-6 h-6 text-purple-600" />,
    CheckCircle: <CheckCircle className="w-6 h-6 text-emerald-600" />,
  };

  return (
    <section id="how-it-works" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider border border-blue-200">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            Simple 4-Step Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight font-['Outfit',sans-serif]">
            How Market Access Works for Every Farmer
          </h2>
          <p className="text-base text-slate-600 font-normal">
            From field harvest to maximized net profit in four transparent, data-verified stages.
          </p>
        </div>

        {/* 4-Step Visual Flow Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {WORKFLOW_STEPS.map((step, index) => {
            const isCurrent = selectedStep === index;
            return (
              <div
                key={step.stepNumber}
                onClick={() => setSelectedStep(index)}
                className={`relative rounded-2xl p-6 border transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-slate-900 text-white border-slate-800 shadow-xl ring-2 ring-emerald-500/30'
                    : 'bg-slate-50 text-slate-900 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                {/* Step Number & Icon */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-2xl font-black font-mono tracking-wider ${
                        isCurrent ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {step.stepNumber}
                    </span>
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                        isCurrent
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                      }`}
                    >
                      {iconComponents[step.icon]}
                    </div>
                  </div>

                  <div
                    className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${
                      isCurrent ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {step.phase}
                  </div>

                  <h3
                    className={`text-base font-bold tracking-tight mb-2.5 ${
                      isCurrent ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {step.title}
                  </h3>

                  <p
                    className={`text-xs leading-relaxed mb-4 ${
                      isCurrent ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>

                {/* Deliverable Badge */}
                <div
                  className={`pt-3 border-t text-[11px] font-medium flex items-center gap-1.5 ${
                    isCurrent ? 'border-slate-800 text-emerald-300' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Output: {step.deliverable}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Workflow Summary Callout */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-lg font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Guaranteed Transparent Trade Execution
            </h4>
            <p className="text-xs text-slate-300 max-w-xl">
              No hidden commission deductions, zero unrecorded weighbridge losses, and 100% verified bank settlement within 24 hours of gate delivery.
            </p>
          </div>

          <button
            type="button"
            onClick={onStartFlow}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Start Step 1: Crop Discovery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
