import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { AdminFarmerRecord, ADMIN_FARMERS_DATA } from '../../data/adminData';
import { adminApi, AdminFarmerItem } from '../../api/adminApi';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface AdminFarmerManagementProps {
  onVerifyFarmer?: (id: string) => void;
  onShowToast?: (msg: string) => void;
}

export const AdminFarmerManagement: React.FC<AdminFarmerManagementProps> = ({
  onVerifyFarmer,
  onShowToast,
}) => {
  const [farmersList, setFarmersList] = useState<AdminFarmerRecord[]>(ADMIN_FARMERS_DATA);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedFarmerForModal, setSelectedFarmerForModal] = useState<AdminFarmerRecord | null>(null);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listFarmers({
        search: searchQuery.trim() || undefined,
      });
      if (data && data.length > 0) {
        const mapped: AdminFarmerRecord[] = data.map((f: AdminFarmerItem) => ({
          id: String(f.id),
          farmerId: `FARM-IN-${String(f.id).padStart(4, '0')}`,
          fullName: f.name,
          mobile: f.phone,
          state: f.state,
          district: f.district,
          village: f.village || 'Village Central',
          landSizeAcres: '5.0 Acres',
          primaryCrops: ['Wheat', 'Soybean'],
          kycDocType: 'Kisan Credit Card',
          verificationStatus: 'Verified (KCC & Aadhaar)',
          totalLotsListed: f.total_listings || 2,
          totalVolumeSoldQuintals: (f.total_listings || 1) * 65,
          registrationDate: f.created_at ? f.created_at.slice(0, 10) : '2026-01-15',
          lastActive: 'Today',
        }));
        setFarmersList(mapped);
      }
    } catch (err) {
      console.error('Failed to load farmers from API', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const filteredFarmers = useMemo(() => {
    return farmersList.filter((f) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = f.fullName.toLowerCase().includes(q);
        const matchesId = f.farmerId.toLowerCase().includes(q);
        const matchesMobile = f.mobile.includes(q);
        const matchesDistrict = f.district.toLowerCase().includes(q);
        const matchesState = f.state.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesMobile && !matchesDistrict && !matchesState) return false;
      }

      if (statusFilter !== 'All' && f.verificationStatus !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [farmersList, searchQuery, statusFilter]);

  const handleApprove = async (id: string) => {
    setFarmersList((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, verificationStatus: 'Verified (KCC & Aadhaar)' } : f
      )
    );
    if (selectedFarmerForModal && selectedFarmerForModal.id === id) {
      setSelectedFarmerForModal((prev) => prev ? { ...prev, verificationStatus: 'Verified (KCC & Aadhaar)' } : null);
    }
    if (onShowToast) onShowToast(`Farmer #${id} KYC approved and certified.`);
    if (onVerifyFarmer) onVerifyFarmer(id);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="emerald" size="sm">Producer Directory</Badge>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif] tracking-tight mt-1">
            Farmer Registry & Verification Roster
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit farmer identities, land holdings (Khatauni/KCC), crop listings, and direct market participation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFarmers}
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            className="font-bold text-xs"
          >
            Refresh
          </Button>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center min-w-[120px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Listed</span>
            <span className="text-lg font-black text-slate-900 font-mono">{farmersList.length} Producers</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Farmer Name, ID (FARM-MP-...), Mobile, District, or State..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Verified (KCC & Aadhaar)">Verified (KCC / Aadhaar)</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Flagged">Flagged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Farmers Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase text-slate-400">
                <th className="py-3.5 px-4 font-bold">Farmer / Identification</th>
                <th className="py-3.5 px-4 font-bold">Location</th>
                <th className="py-3.5 px-4 font-bold">Land & Primary Crops</th>
                <th className="py-3.5 px-4 font-bold">KYC Status</th>
                <th className="py-3.5 px-4 font-bold">Listing Volume</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredFarmers.map((farmer) => {
                const isVerified = farmer.verificationStatus === 'Verified (KCC & Aadhaar)';

                return (
                  <tr key={farmer.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Farmer Name & ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {farmer.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{farmer.fullName}</span>
                          <span className="font-mono text-[10px] text-slate-400">{farmer.farmerId} • {farmer.mobile}</span>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-medium text-slate-900 block">{farmer.district}, {farmer.state}</span>
                      <span className="text-[11px] text-slate-400">{farmer.village}</span>
                    </td>

                    {/* Land & Crops */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{farmer.landSizeAcres}</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {farmer.primaryCrops.slice(0, 2).map((c, i) => (
                          <span key={i} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* KYC Status */}
                    <td className="py-3.5 px-4">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Verified ({farmer.kycDocType})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          Pending Review
                        </span>
                      )}
                    </td>

                    {/* Listings & Sales */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{farmer.totalVolumeSoldQuintals}q sold</span>
                      <span className="text-[10px] text-slate-400">{farmer.totalLotsListed} lots posted</span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFarmerForModal(farmer)}
                          icon={<Eye className="w-3.5 h-3.5" />}
                          className="font-bold text-xs"
                        >
                          Dossier
                        </Button>
                        {!isVerified && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(farmer.id)}
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

      {/* Farmer Details Modal */}
      {selectedFarmerForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedFarmerForModal.fullName}</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedFarmerForModal.farmerId}</p>
              </div>
              <button
                onClick={() => setSelectedFarmerForModal(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Mobile:</span>
                <span className="font-bold text-slate-900">{selectedFarmerForModal.mobile}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-900">{selectedFarmerForModal.village}, {selectedFarmerForModal.district}, {selectedFarmerForModal.state}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Land Holding:</span>
                <span className="font-bold text-slate-900">{selectedFarmerForModal.landSizeAcres}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Registered On:</span>
                <span className="font-mono text-slate-800">{selectedFarmerForModal.registrationDate}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">KYC Verification Document:</span>
                <span className="font-bold text-emerald-700">{selectedFarmerForModal.kycDocType} (Verified)</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedFarmerForModal(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
