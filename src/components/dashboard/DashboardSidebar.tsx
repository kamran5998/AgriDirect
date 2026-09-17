import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Sprout,
  Sparkles,
  Building,
  Bookmark,
  Bell,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { FarmerProfile } from '../../types';

export type DashboardViewType =
  | 'dashboard'
  | 'market-prices'
  | 'my-crops'
  | 'market-insights'
  | 'buyers'
  | 'saved-markets'
  | 'notifications'
  | 'profile'
  | 'settings';

interface DashboardSidebarProps {
  currentView: DashboardViewType;
  onSelectView: (view: DashboardViewType) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  profile: FarmerProfile;
  onSignOut: () => void;
  unreadNotificationsCount: number;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  currentView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  profile,
  onSignOut,
  unreadNotificationsCount,
}) => {
  const navItems = [
    { id: 'dashboard' as DashboardViewType, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'market-prices' as DashboardViewType, label: 'Market Prices', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'my-crops' as DashboardViewType, label: 'My Crops', icon: <Sprout className="w-5 h-5" />, badge: `${profile.selectedCrops.length}` },
    { id: 'market-insights' as DashboardViewType, label: 'Market Insights', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'buyers' as DashboardViewType, label: 'Buyers & Tenders', icon: <Building className="w-5 h-5" />, badge: '2 New' },
    { id: 'saved-markets' as DashboardViewType, label: 'Saved Markets', icon: <Bookmark className="w-5 h-5" /> },
    {
      id: 'notifications' as DashboardViewType,
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount}` : undefined,
      badgeColor: 'emerald' as const,
    },
    { id: 'profile' as DashboardViewType, label: 'Farmer Profile', icon: <User className="w-5 h-5" /> },
    { id: 'settings' as DashboardViewType, label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside
      className={`bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800 transition-all duration-300 z-30 shrink-0 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Logo & Collapse Toggle */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-600/30">
                <Sprout className="w-5 h-5" />
              </div>
              <div className="truncate">
                <span className="font-bold tracking-tight text-white font-['Outfit',sans-serif] text-base">
                  AgriDirect<span className="text-emerald-400">Pulse</span>
                </span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white mx-auto shadow-md">
              <Sprout className="w-5 h-5" />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                } ${isCollapsed ? 'justify-center px-2' : 'justify-between'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-emerald-700 text-white'
                        : item.badgeColor === 'emerald'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Farmer Account Strip & Sign Out */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        {!isCollapsed && (
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-emerald-700/40 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-500/20">
                {profile.fullName.split(' ').map((n) => n[0]).join('') || 'K'}
              </div>
              <div className="truncate text-left">
                <div className="text-xs font-bold text-white truncate">{profile.fullName}</div>
                <div className="text-[10px] text-slate-400 truncate">{profile.district}, {profile.state}</div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onSignOut}
          title={isCollapsed ? 'Sign Out / Return to Public View' : undefined}
          className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span>Sign Out & Landing</span>}
        </button>
      </div>
    </aside>
  );
};
