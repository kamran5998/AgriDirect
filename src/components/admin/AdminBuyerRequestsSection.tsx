import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Building,
  Sprout,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  MessageSquare,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { adminApi, AdminBuyerRequestItem } from '../../api/adminApi';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface AdminBuyerRequestsSectionProps {
  onShowToast?: (msg: string) => void;
}

export const AdminBuyerRequestsSection: React.FC<AdminBuyerRequestsSectionProps> = ({ onShowToast }) => {
  const [requests, setRequests] = useState<AdminBuyerRequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<AdminBuyerRequestItem | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listBuyerRequests({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setRequests(data);
    } catch (err) {
      console.error('Failed to load buyer requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests;
    const q = searchQuery.toLowerCase();
    return requests.filter(
      (r) =>
        r.buyer_business_name.toLowerCase().includes(q) ||
        r.buyer_name.toLowerCase().includes(q) ||
        r.crop_name.toLowerCase().includes(q) ||
        (r.message && r.message.toLowerCase().includes(q))
    );
  }, [requests, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Accepted
          </span>
        );
      case 'counter_offer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            Counter-Offer
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            Rejected
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
          <Badge variant="blue" size="sm">Procurement Proposals</Badge>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif] tracking-tight mt-1">
            Buyer Trade Proposals & Requests
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor institutional buyer purchase orders, counter-proposals, and farm-gate direct transaction pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRequests}
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            className="font-bold text-xs"
          >
            Refresh
          </Button>
          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-center min-w-[120px]">
            <span className="text-[10px] font-bold text-blue-800 uppercase block">Total Requests</span>
            <span className="text-lg font-black text-blue-950 font-mono">{requests.length} Proposals</span>
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
            placeholder="Search by buyer company, officer name, crop, or terms..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
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
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="counter_offer">Counter-Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase text-slate-400">
                <th className="py-3.5 px-4 font-bold">Buyer Company</th>
                <th className="py-3.5 px-4 font-bold">Target Crop Lot</th>
                <th className="py-3.5 px-4 font-bold">Requested Volume</th>
                <th className="py-3.5 px-4 font-bold">Trade Status</th>
                <th className="py-3.5 px-4 font-bold">Proposal Terms / Message</th>
                <th className="py-3.5 px-4 font-bold">Date</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading buyer proposals...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No buyer requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-xs shrink-0">
                          <Building className="w-4 h-4 text-blue-700" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{req.buyer_business_name}</span>
                          <span className="text-[10px] text-slate-400">{req.buyer_name} • Req #{req.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900 block">{req.crop_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Lot #{req.listing_id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{req.quantity} Qtl</span>
                      <span className="text-[10px] text-slate-400">≈ {(req.quantity / 10).toFixed(1)} MT</span>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(req.status)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <p className="line-clamp-2 max-w-[240px] text-[11px] leading-relaxed">
                        {req.message || 'Standard contract terms with pickup and escrow payment.'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {req.created_at ? new Date(req.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      }) : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequest(req)}
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

      {/* Request Inspection Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Trade Proposal #{selectedRequest.id}</h3>
                <p className="text-xs text-slate-400">{selectedRequest.buyer_business_name}</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Target Commodity:</span>
                <span className="font-bold text-slate-900">{selectedRequest.crop_name} (Lot #{selectedRequest.listing_id})</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Requested Volume:</span>
                <span className="font-mono font-bold text-slate-900">{selectedRequest.quantity} Quintals</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Proposal Status:</span>
                <div>{getStatusBadge(selectedRequest.status)}</div>
              </div>
              <div className="py-2">
                <span className="text-slate-500 block mb-1 font-bold">Proposal Terms & Notes:</span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed">
                  {selectedRequest.message || 'No additional conditions specified.'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedRequest(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
