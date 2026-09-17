import React from 'react';
import { Sprout, Phone, Mail, MapPin, Globe, ShieldCheck, Twitter, Linkedin, Youtube, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigateTo: (sectionId: string) => void;
  onOpenGetStarted: () => void;
  onOpenLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTo, onOpenGetStarted, onOpenLogin }) => {
  return (
    <footer id="contact" className="bg-slate-950 text-slate-400 border-t border-slate-900 text-xs">
      {/* Top Banner with Helpline */}
      <div className="border-b border-slate-900 bg-slate-900/60 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-white">Farmer Support & Kisan Call Desk:</span>
            <span className="font-mono text-emerald-400 font-bold">1800-419-AGRI (Toll Free, 24/7)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Available in Hindi, Punjabi, Marathi, Telugu, Tamil, Kannada, Gujarati & English</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1: Brand & Bio (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-['Outfit',sans-serif]">
                AgriDirect<span className="text-emerald-500">Pulse</span>
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-sm">
              Real-time agricultural market intelligence, predictive spot pricing, and direct market access bridging farmers, cooperatives, and verified institutional buyers across India.
            </p>

            <div className="pt-2 flex items-center gap-3 text-slate-400">
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Platform Navigation</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigateTo('home')} className="hover:text-emerald-400 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTo('about')} className="hover:text-emerald-400 transition-colors">
                  Market Snapshot & Coverage
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTo('features')} className="hover:text-emerald-400 transition-colors">
                  Intelligence Features
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTo('how-it-works')} className="hover:text-emerald-400 transition-colors">
                  How It Works (4 Steps)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTo('markets')} className="hover:text-emerald-400 transition-colors">
                  Live Commodity Table
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTo('impact')} className="hover:text-emerald-400 transition-colors">
                  Farmer Economic Impact
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Commodities & Mandis */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Key Commodities</h4>
            <ul className="space-y-2">
              <li><span className="hover:text-emerald-400 cursor-pointer">Sharbati & Lokwan Wheat</span></li>
              <li><span className="hover:text-emerald-400 cursor-pointer">Pusa Basmati (1121 / 1509)</span></li>
              <li><span className="hover:text-emerald-400 cursor-pointer">Yellow Soybean & Mustard Seed</span></li>
              <li><span className="hover:text-emerald-400 cursor-pointer">Shankar-6 Cotton & Desi Chana</span></li>
              <li><span className="hover:text-emerald-400 cursor-pointer">Nashik Onion & Kolar Tomato</span></li>
              <li><span className="hover:text-emerald-400 cursor-pointer">Guntur Chili & Salem Turmeric</span></li>
            </ul>
          </div>

          {/* Col 4: Contact & Office */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Institutional Contact</h4>
            <div className="space-y-2.5 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Krishi Bhavan Innovation Hub, New Delhi, India 110001</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>support@agridirectpulse.org</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>+91 (11) 2338-AGRI</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenGetStarted}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                <span>Partner with our FPO Network</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar with Copyright & Compliance */}
        <div className="pt-12 mt-12 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <div>
            © {new Date().getFullYear()} AgriDirect Pulse™ Platform. All rights reserved. Compliant with Open Agriculture Data Standards.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-200 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-200 cursor-pointer">Terms of Fair Trade</span>
            <span className="hover:text-slate-200 cursor-pointer">Agmarknet Disclaimer</span>
            <span className="hover:text-slate-200 cursor-pointer">Security Protocol</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
