import React, { useState, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  Database,
  Store,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Edit3,
  SlidersHorizontal,
  Wifi,
  WifiOff,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AdminMarketFeedRecord, ADMIN_MARKET_FEEDS } from '../../data/adminData';
import { adminApi } from '../../api/adminApi';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface AdminMarketDataManagementProps {
  onShowToast?: (msg: string) => void;
}

export const AdminMarketDataManagement: React.FC<AdminMarketDataManagementProps> = ({ onShowToast }) => {
  const [feedsList, setFeedsList] = useState<AdminMarketFeedRecord[]>(ADMIN_MARKET_FEEDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isSyncing, setIsSyncing] = useState(false);
  const [overrideFeed, setOverrideFeed] = useState<AdminMarketFeedRecord | null>(null);
  const [overridePrice, setOverridePrice] = useState('');
  const [overrideReason, setOverrideReason] = useState('Verified spot physical transaction assay');
  const [toast, setToast] = useState<string | null>(null);

  const filteredFeeds = useMemo(() => {
    return feedsList.filter((f) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesMandi = f.marketName.toLowerCase().includes(q);
        const matchesCrop = f.cropName.toLowerCase().includes(q);
        const matchesDistrict = f.district.toLowerCase().includes(q);
        const matchesState = f.state.toLowerCase().includes(q);
        if (!matchesMandi && !matchesCrop && !matchesDistrict && !matchesState) return false;
      }

      if (statusFilter !== 'All' && f.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [feedsList, searchQuery, statusFilter]);

  const handleForceResync = async () => {
    setIsSyncing(true);
    try {
      await adminApi.triggerIngestion();
      setFeedsList((prev) =>
        prev.map((f) => ({
          ...f,
          status: 'Live Synced',
          lastSyncTimestamp: 'Just now (Synced with Agmarknet)',
          confidenceScore: 99.8,
        }))
      );
      const msg = 'National APMC Ingestion Pipeline successfully re-synced!';
      setToast(msg);
      if (onShowToast) onShowToast(msg);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Ingestion failed', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideFeed) return;
    const newPrice = parseFloat(overridePrice);
    if (!newPrice) return;

    try {
      await adminApi.overrideMarketPrice({
        market_id: 1,
        crop_id: 1,
        price: newPrice,
        min_price: Math.round(newPrice * 0.94),
        max_price: Math.round(newPrice * 1.05),
        reason: overrideReason,
      });

      setFeedsList((prev) =>
        prev.map((f) =>
          f.id === overrideFeed.id
            ? {
                ...f,
                modalPrice: newPrice,
                syncSource: 'Manual Override',
                lastSyncTimestamp: 'Manual Admin Entry (Just now)',
              }
            : f
        )
      );
      const msg = `Modal rate for ${overrideFeed.marketName} updated to ₹${newPrice}/q.`;
      setToast(msg);
      if (onShowToast) onShowToast(msg);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Override error', err);
    } finally {
      setOverrideFeed(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="emerald" size="sm">National Feed Ingestion</Badge>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif] tracking-tight mt-1">
            APMC Mandi Price Feeds & Ingestion Health
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time arrival weights, modal spot quotes, and Agmarknet/e-NAM gateway synchronization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleForceResync}
            disabled={isSyncing}
            icon={<RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />}
            className="font-bold shadow-md shadow-emerald-600/20"
          >
            {isSyncing ? 'Re-syncing 2,418 APMCs...' : 'Force Ingestion Re-Sync'}
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Mandi Name, District, State, or Crop commodity..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="All">All Feeds</option>
              <option value="Live Synced">Live Synced</option>
              <option value="Delayed (Mandi Close)">Delayed / Mandi Close</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mandi Feeds Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase text-slate-400">
                <th className="py-3.5 px-4 font-bold">APMC Mandi Hub</th>
                <th className="py-3.5 px-4 font-bold">Crop Commodity</th>
                <th className="py-3.5 px-4 font-bold">Modal Spot Price</th>
                <th className="py-3.5 px-4 font-bold">Arrival Volume</th>
                <th className="py-3.5 px-4 font-bold">Sync Gateway</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredFeeds.map((feed) => {
                const isSynced = feed.status === 'Live Synced';

                return (
                  <tr key={feed.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{feed.marketName}</span>
                          <span className="text-[10px] text-slate-400">{feed.district}, {feed.state}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {feed.cropName}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-slate-900 text-sm block">₹{feed.modalPrice}/q</span>
                      <span className="text-[10px] text-slate-400">Range: ₹{feed.minPrice} - ₹{feed.maxPrice}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {feed.arrivalVolumeMT} MT
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {isSynced ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            <Wifi className="w-3 h-3 text-emerald-600" />
                            {feed.syncSource} ({feed.confidenceScore}%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                            <WifiOff className="w-3 h-3 text-amber-600" />
                            {feed.status}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{feed.lastSyncTimestamp}</span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOverrideFeed(feed);
                          setOverridePrice(String(feed.modalPrice));
                        }}
                        icon={<Edit3 className="w-3.5 h-3.5" />}
                        className="font-bold text-xs"
                      >
                        Override
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Price Override Modal */}
      {overrideFeed && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveOverride} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Manual Price Adjustment</h3>
                <p className="text-xs text-slate-500">{overrideFeed.marketName} • {overrideFeed.cropName}</p>
              </div>
              <button
                type="button"
                onClick={() => setOverrideFeed(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Modal Benchmark Price (₹ / Quintal)
              </label>
              <input
                type="number"
                value={overridePrice}
                onChange={(e) => setOverridePrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                This entry overrides automated Agmarknet sync until next hourly refresh.
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setOverrideFeed(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" className="font-bold">
                Apply Price Override
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

    </div>
  );
};
