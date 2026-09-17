import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Bell,
  User,
  Radio,
  ChevronDown,
  Sparkles,
  Menu,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { FarmerProfile } from '../../types';

interface DashboardHeaderProps {
  profile: FarmerProfile;
  onOpenMobileMenu: () => void;
  onSearch: (query: string) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  profile,
  onOpenMobileMenu,
  onSearch,
  unreadCount,
  onOpenNotifications,
  onOpenProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 sticky top-0 z-20 shadow-2xs px-4 sm:px-6 flex items-center justify-between gap-4">
      
      {/* Left: Mobile Menu Toggle & Global Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search crops, mandis, buyers or MSP rates..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Right Controls: Location, Live Status, Notification Bell, User Avatar */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Live Mandi Status (Desktop) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono text-[11px]">e-NAM / Mandi: Live</span>
        </div>

        {/* Location Indicator */}
        <div className="relative">
          <button
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate max-w-[130px] hidden sm:inline">
              {profile.district}, {profile.state}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showLocationPicker && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-40 text-xs space-y-2">
              <div className="font-bold text-slate-900">Current Farm Operational Base</div>
              <p className="text-slate-500 text-[11px]">
                {profile.village}, Tehsil Ashta, {profile.district}
              </p>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-700">
                Primary Mandi: {profile.selectedMandis[0] || 'Sehore APMC'}
              </div>
              <button
                onClick={() => setShowLocationPicker(false)}
                className="w-full py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold text-center hover:bg-emerald-700 cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          title="View Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Farmer Profile Avatar */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 pl-2 border-l border-slate-200 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center border border-emerald-300">
            {profile.fullName.split(' ').map((n) => n[0]).join('') || 'K'}
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
              <span>{profile.fullName}</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Verified Cultivator</div>
          </div>
        </button>

      </div>
    </header>
  );
};
