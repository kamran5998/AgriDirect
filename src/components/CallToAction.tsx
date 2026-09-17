import React from 'react';
import { ArrowRight, CheckCircle2, Sprout, Building, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from './common/Button';

interface CallToActionProps {
  onOpenGetStarted: () => void;
  onOpenLogin: () => void;
}

export const CallToAction: React.FC<CallToActionProps> = ({ onOpenGetStarted, onOpenLogin }) => {
  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Join 45,000+ Progressive Cultivators & FPOs
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto font-['Outfit',sans-serif] leading-tight">
          Ready to Make Smarter Selling Decisions with <span className="text-emerald-400">Live Market Intelligence</span>?
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-4 leading-relaxed font-normal">
          Start monitoring local and national mandis, analyze price trends, and connect directly with verified buyers — completely free for farmers.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8">
          <Button
            variant="primary"
            size="lg"
            onClick={onOpenGetStarted}
            icon={<ArrowRight className="w-5 h-5" />}
            iconPosition="right"
            className="w-full sm:w-auto shadow-lg shadow-emerald-600/25 text-base px-8 py-3.5"
          >
            Get Started as a Farmer / FPO
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onOpenLogin}
            className="w-full sm:w-auto bg-slate-800 text-white border-slate-700 hover:bg-slate-750 hover:border-slate-600 text-base"
          >
            Buyer / Institutional Login
          </Button>
        </div>

        {/* Benefits Checklist */}
        <div className="pt-10 mt-10 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>100% Free Forever for Individual Cultivators</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>SMS & WhatsApp Price Alerts</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Instant 24-Hour Settlement Guarantee</span>
          </div>
        </div>

      </div>
    </section>
  );
};
