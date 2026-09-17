import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { AdminBuyerRecord, ADMIN_BUYERS_DATA } from '../../data/adminData';
import { adminApi, AdminBuyerItem } from '../../api/adminApi';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface AdminBuyerManagementProps {
  onVerifyBuyer?: (id: string) => void;
  onShowToast?: (msg: string) => void;
}

export const AdminBuyerManagement: React.FC<AdminBuyerManagementProps> = ({
  onVerifyBuyer,
  onShowToast,
}) => {
  const [buyersList, setBuyersList] = useState<AdminBuyerRecord[]>(ADMIN_BUYERS_DATA);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBuyerModal, setSelectedBuyerModal] = useState<AdminBuyerRecord | null>(null);

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listBuyers({
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'All' ? (statusFilter.includes('Verified') ? 'verified' : 'pending') : undefined,
      });
      if (data && data.length > 0) {
        const mapped: AdminBuyerRecord[] = data.map((b: AdminBuyerItem) => ({
          id: String(b.id),
          buyerId: `BYR-IN-${String(b.id).padStart(4, '0')}`,
          companyName: b.business_name || b.name,
          entityType: 'Corporate Processor',
          contactPerson: b.name,
          mobile: b.phone,
          email: b.email || 'buyer@agridirect.in',
          gstin: '23AAACH7789J1ZM',
          location: b.location || 'Central India',
          district: 'Indore',
          state: 'Madhya Pradesh',
          verificationStatus: b.verification_status === 'verified' ? 'Verified & Certified' : 'Pending Audit',
          fssaiNumber: '10018022008745',
          enamMemberId: 'ENAM-MH-PROC-882',
          escrowRating: 'AAA+ Sovereign Bonded',
          totalProcuredMT: (b.total_requests || 1) * 240,
          activeTendersCount: b.total_requests || 2,
          joinedDate: b.created_at ? b.created_at.slice(0, 10) : '2026-01-10',
        }));
        setBuyersList(mapped);
      }
    } catch (err) {
      console.error('Failed to load buyers from API', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  const filteredBuyers = useMemo(() => {
    return buyersList.filter((b) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = b.companyName.toLowerCase().includes(q);
        const matchesId = b.buyerId.toLowerCase().includes(q);
        const matchesGstin = b.gstin.toLowerCase().includes(q);
        const matchesPerson = b.contactPerson.toLowerCase().includes(q);
        const matchesLocation = b.location.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesGstin && !matchesPerson && !matchesLocation) return false;
      }

      if (entityFilter !== 'All' && b.entityType !== entityFilter) {
        return false;
      }

      if (statusFilter !== 'All' && b.verificationStatus !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [buyersList, searchQuery, entityFilter, statusFilter]);

  const handleApproveBuyer = async (id: string) => {
    try {
      await adminApi.updateBuyerVerification(parseInt(id) || 1, 'verified');
    } catch (err) {
      console.error('Approve buyer API error', err);
    }

    setBuyersList((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, verificationStatus: 'Verified & Certified', enamMemberId: 'ENAM-MH-PROC-991' } : b
      )
    );
    if (selectedBuyerModal && selectedBuyerModal.id === id) {
      setSelectedBuyerModal((prev) => prev ? { ...prev, verificationStatus: 'Verified & Certified' } : null);
    }
    if (onShowToast) onShowToast(`Buyer #${id} accredited and e-NAM escrow activated.`);
    if (onVerifyBuyer) onVerifyBuyer(id);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="blue" size="sm">Procurement Registry</Badge>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif] tracking-tight mt-1">
            Institutional Buyer & Aggregator Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage corporate food processors, exporters, and FPO apex federations with GST/e-NAM escrow accreditation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBuyers}
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            className="font-bold text-xs"
          >
            Refresh
          </Button>
          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-center min-w-[120px]">
            <span className="text-[10px] font-bold text-blue-800 uppercase block">Total Buyers</span>
            <span className="text-lg font-black text-blue-950 font-mono">{buyersList.length} Verified</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Company Name, GSTIN, e-NAM ID, Contact Person, or Hub..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Entity Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700">
            <span className="text-slate-400">Entity:</span>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Corporate Processor">Corporate Processor</option>
              <option value="Export House">Export House</option>
              <option value="Govt & FPO Collective">Govt & FPO Collective</option>
              <option value="Solvent Mill">Solvent Mill</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Verified & Certified">Verified & Certified</option>
              <option value="Pending Audit">Pending Audit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Buyer Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase text-slate-400">
                <th className="py-3.5 px-4 font-bold">Buyer Company & Legal Identity</th>
                <th className="py-3.5 px-4 font-bold">Category</th>
                <th className="py-3.5 px-4 font-bold">Location & Hub</th>
                <th className="py-3.5 px-4 font-bold">Verification Status</th>
                <th className="py-3.5 px-4 font-bold">Tenders & Throughput</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredBuyers.map((buyer) => {
                const isVerified = buyer.verificationStatus === 'Verified & Certified';

                return (
                  <tr key={buyer.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Buyer Identity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 font-black flex items-center justify-center text-xs shrink-0">
                          {buyer.companyName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{buyer.companyName}</span>
                          <span className="font-mono text-[10px] text-slate-400">GST: {buyer.gstin}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-semibold text-slate-800 block">{buyer.entityType}</span>
                      <span className="text-[10px] text-slate-400">{buyer.contactPerson}</span>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-900 block">{buyer.district}, {buyer.state}</span>
                      <span className="text-[10px] text-slate-400">{buyer.location}</span>
                    </td>

                    {/* Verification Status */}
                    <td className="py-3.5 px-4">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          {buyer.escrowRating}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          Pending Audit
                        </span>
                      )}
                    </td>

                    {/* Tenders & Volume */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{(buyer.totalProcuredMT).toLocaleString()} MT Procured</span>
                      <span className="text-[10px] text-blue-700 font-semibold">{buyer.activeTendersCount} Active Tenders</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedBuyerModal(buyer)}
                          icon={<Eye className="w-3.5 h-3.5" />}
                          className="font-bold text-xs"
                        >
                          Dossier
                        </Button>
                        {!isVerified && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApproveBuyer(buyer.id)}
                            icon={<UserCheck className="w-3.5 h-3.5" />}
                            className="font-bold text-xs"
                          >
                            Approve
                          </Button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Buyer Details Modal */}
      {selectedBuyerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedBuyerModal.companyName}</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedBuyerModal.buyerId} • {selectedBuyerModal.entityType}</p>
              </div>
              <button
                onClick={() => setSelectedBuyerModal(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">GSTIN Registration:</span>
                <span className="font-mono font-bold text-slate-900">{selectedBuyerModal.gstin}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">e-NAM Member ID:</span>
                <span className="font-mono font-bold text-emerald-700">{selectedBuyerModal.enamMemberId}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">FSSAI License:</span>
                <span className="font-mono font-bold text-slate-900">{selectedBuyerModal.fssaiNumber}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Authorized Officer:</span>
                <span className="font-semibold text-slate-900">{selectedBuyerModal.contactPerson} ({selectedBuyerModal.mobile})</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Escrow Security Rating:</span>
                <span className="font-bold text-emerald-700">{selectedBuyerModal.escrowRating}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedBuyerModal(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
