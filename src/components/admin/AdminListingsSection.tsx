import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Sprout,
  MapPin,
  Calendar,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Eye,
  Tag,
} from 'lucide-react';
import { adminApi, AdminListingItem } from '../../api/adminApi';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface AdminListingsSectionProps {
  onShowToast?: (msg: string) => void;
}

export const AdminListingsSection: React.FC<AdminListingsSectionProps> = ({ onShowToast }) => {
  const [listings, setListings] = useState<AdminListingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedListing, setSelectedListing] = useState<AdminListingItem | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listListings({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setListings(data);
    } catch (err) {
      console.error('Failed to load listings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

  const filteredListings = useMemo(() => {
    if (!searchQuery.trim()) return listings;
    const q = searchQuery.toLowerCase();
    return listings.filter(
      (item) =>
        item.crop_name.toLowerCase().includes(q) ||
        item.farmer_name.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.quality.toLowerCase().includes(q)
    );
  }, [listings, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Active
          </span>
        );
      case 'in_negotiation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            In Negotiation
          </span>
        );
      case 'sold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Sold Lot
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="emerald" size="sm">Direct Marketplace Roster</Badge>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif] tracking-tight mt-1">
            Farmer Direct Crop Listings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit farm-gate sale lots, verified harvest availability, reserve prices, and grade standards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchListings}
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            className="font-bold text-xs"
          >
            Refresh
          </Button>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center min-w-[120px]">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Lots</span>
            <span className="text-lg font-black text-emerald-950 font-mono">{listings.length} Lots</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop, farmer name, quality grade, or village location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="all">All Lots</option>
              <option value="active">Active Only</option>
              <option value="in_negotiation">In Negotiation</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase text-slate-400">
                <th className="py-3.5 px-4 font-bold">Crop & Quality Grade</th>
                <th className="py-3.5 px-4 font-bold">Producer</th>
                <th className="py-3.5 px-4 font-bold">Available Quantity</th>
                <th className="py-3.5 px-4 font-bold">Expected Price</th>
                <th className="py-3.5 px-4 font-bold">Location</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    Loading crop lot listings...
                  </td>
                </tr>
              ) : filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No crop lot listings found.
                  </td>
                </tr>
              ) : (
                filteredListings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xs shrink-0">
                          <Sprout className="w-4 h-4 text-emerald-700" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{item.crop_name}</span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {item.quality} • Lot #{item.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{item.farmer_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.farmer_phone}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{item.quantity} Qtl</span>
                      <span className="text-[10px] text-slate-400">≈ {(item.quantity / 10).toFixed(1)} MT</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-extrabold text-emerald-700 block">
                        ₹{item.expected_price.toLocaleString('en-IN')}/Qtl
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Total ₹{(item.quantity * item.expected_price).toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{item.location}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedListing(item)}
                        icon={<Eye className="w-3.5 h-3.5" />}
                        className="font-bold text-xs"
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lot Inspection Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedListing.crop_name}</h3>
                <p className="text-xs text-slate-400 font-mono">Lot #{selectedListing.id} • Posted by {selectedListing.farmer_name}</p>
              </div>
              <button
                onClick={() => setSelectedListing(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Producer Contact:</span>
                <span className="font-bold text-slate-900">{selectedListing.farmer_phone}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Available Volume:</span>
                <span className="font-mono font-bold text-slate-900">{selectedListing.quantity} Quintals ({(selectedListing.quantity / 10).toFixed(1)} MT)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Expected Reserve Price:</span>
                <span className="font-mono font-extrabold text-emerald-700">₹{selectedListing.expected_price.toLocaleString('en-IN')} / Quintal</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Quality Specification:</span>
                <span className="font-bold text-slate-800">{selectedListing.quality}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Pickup Location:</span>
                <span className="font-medium text-slate-900">{selectedListing.location}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Availability Date:</span>
                <span className="font-mono text-slate-800">{selectedListing.availability_date}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedListing(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
