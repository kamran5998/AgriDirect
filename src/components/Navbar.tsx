import React, { useState } from 'react';
import { Sprout, Menu, X, Shield, ChevronRight, Activity, Building, UserCheck } from 'lucide-react';
import { Button } from './common/Button';
import { Badge } from './common/Badge';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenGetStarted: () => void;
  onOpenDashboard?: () => void;
  onOpenMarketIntelligence?: () => void;
  onOpenCropAnalytics?: () => void;
  onOpenDirectMarket?: () => void;
  onOpenAdminDashboard?: () => void;
  onNavigateTo: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLogin,
  onOpenGetStarted,
  onOpenDashboard,
  onOpenMarketIntelligence,
  onOpenCropAnalytics,
  onOpenDirectMarket,
  onOpenAdminDashboard,
  onNavigateTo,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'About', id: 'about' },
    { label: 'Features', id: 'features' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Markets', id: 'markets' },
    { label: 'Impact', id: 'impact' },
    { label: 'Contact', id: 'contact' },
  ];

  const handleNavClick = (id: string) => {
    onNavigateTo(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Platform Name */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleNavClick('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:bg-emerald-700 transition-colors">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-950 font-['Outfit',sans-serif]">
                  AgriDirect<span className="text-emerald-600">Pulse</span>
                </span>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 tracking-wide">
                  Gov & APMC Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Market Intelligence & Direct Access Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            {onOpenAdminDashboard && (
              <button
                onClick={onOpenAdminDashboard}
                className="px-2.5 py-1.5 text-xs font-bold text-purple-900 bg-purple-100/80 hover:bg-purple-200 border border-purple-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5 text-purple-700" />
                <span>Admin Ops</span>
              </button>
            )}
            {onOpenDirectMarket && (
              <button
                onClick={onOpenDirectMarket}
                className="px-2.5 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>Direct Buyers</span>
              </button>
            )}
            {onOpenCropAnalytics && (
              <button
                onClick={onOpenCropAnalytics}
                className="px-2.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                <span>Crop Analytics</span>
              </button>
            )}
            {onOpenMarketIntelligence && (
              <button
                onClick={onOpenMarketIntelligence}
                className="px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <Activity className="w-3.5 h-3.5 text-slate-600" />
                <span>Live Prices</span>
              </button>
            )}
            {onOpenDashboard && (
              <button
                onClick={onOpenDashboard}
                className="px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-slate-600" />
                <span>Portal</span>
              </button>
            )}
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Login
            </button>
            <Button
              variant="primary"
              size="md"
              onClick={onOpenGetStarted}
              icon={<ChevronRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenGetStarted}
              className="sm:hidden"
            >
              Get Started
            </Button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors text-left"
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="w-full justify-center"
            >
              Terminal Login
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenGetStarted();
              }}
              className="w-full justify-center"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
