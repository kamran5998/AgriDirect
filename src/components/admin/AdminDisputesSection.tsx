import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Search,
  Check,
  X,
  FileText,
  User,
  Scale,
} from 'lucide-react';
import { DisputeTicket } from '../../data/directMarketData';
import { farmerApi } from '../../api/farmerApi';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface AdminDisputesSectionProps {
  onShowToast?: (msg: string) => void;
}

export const AdminDisputesSection: React.FC<AdminDisputesSectionProps> = ({ onShowToast }) => {
  const [disputes, setDisputes] = useState<DisputeTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDispute, setSelectedDispute] = useState<DisputeTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const loadDisputes = async () => {
    try {
      const data = await farmerApi.getDisputes();
      if (Array.isArray(data)) {
        const normalized: DisputeTicket[] = data.map((d: any) => ({
          id: d.id,
          tradeId: d.tradeId || d.trade_id || 'REQ-101',
          gatePassId: d.gatePassId || d.gate_pass_id,
          complainantId: d.complainantId || d.complainant_id || d.farmer_id || 1,
          complainantName: d.complainantName || d.complainant_name || (d.farmer_id ? `Farmer #${d.farmer_id}` : 'Farmer Partner'),
          complainantRole: d.complainantRole || d.complainant_role || 'farmer',
          respondentName: d.respondentName || d.respondent_name || (d.buyer_id ? `Buyer #${d.buyer_id}` : 'Procurement Partner'),
          category: d.category || d.reason || 'Quality Dispute',
          description: d.description || d.reason || 'Trade dispute logged for mediation.',
          evidenceNotes: d.evidenceNotes || d.evidence_notes,
          status: String(d.status || 'OPEN').toUpperCase().replace('_', ' ') as any,
          resolutionNotes: d.resolutionNotes || d.resolution_notes,
          resolvedBy: d.resolvedBy || d.resolved_by,
          createdAt: d.createdAt || (d.created_at ? new Date(d.created_at).toLocaleString() : 'Recent'),
          updatedAt: d.updatedAt || d.updated_at || '',
        }));
        setDisputes(normalized);
      } else {
        setDisputes([]);
      }
    } catch (err) {
      console.error('Failed to load disputes:', err);
      setDisputes([]);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const handleResolve = async (disputeId: string | number, resolutionStatus: 'RESOLVED_FARMER_FAVOR' | 'RESOLVED_BUYER_FAVOR' | 'CLOSED_MUTUAL') => {
    setIsResolving(true);
    try {
      await farmerApi.resolveDispute(disputeId, {
        status: resolutionStatus,
        resolutionNotes: resolutionNotes || `Mediation completed with settlement code ${resolutionStatus}.`,
      });
      if (onShowToast) onShowToast(`Dispute #${disputeId} resolved successfully.`);
      setSelectedDispute(null);
      setResolutionNotes('');
      await loadDisputes();
    } catch (err) {
      console.error('Failed to resolve dispute:', err);
      if (onShowToast) onShowToast(`Failed to resolve dispute #${disputeId}.`);
    } finally {
      setIsResolving(false);
    }
  };

  const filtered = disputes.filter(
    (d) =>
      String(d.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.complainantName && d.complainantName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.respondentName && d.respondentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.category && d.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <Badge variant="rose" size="sm">
              Trade Grievance & Arbitration Redressal
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-['Outfit',sans-serif] mt-1">
            APMC & AgriDirect Trade Dispute Mediation
          </h2>
          <p className="text-xs text-slate-500">
            Review contested quality grades, weighbridge mismatches, and lock/release escrow settlements under fair trade bylaws.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search dispute ref, farmer, buyer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Disputes Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Active Grievance Tickets ({filtered.length})
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No grievance tickets matching criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((d) => (
              <div key={d.id} className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {d.id}
                    </span>
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                      {d.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      d.status === 'OPEN' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {d.status}
                    </span>
                    <span className="text-[11px] text-slate-400">{d.createdAt}</span>
                  </div>

                  <div className="text-xs text-slate-800">
                    <strong>Complainant:</strong> {d.complainantName} • <strong>Respondent:</strong> {d.respondentName}
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    {d.description}
                  </p>

                  {d.evidenceNotes && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-slate-400" />
                      <span>Evidence: {d.evidenceNotes}</span>
                    </div>
                  )}

                  {d.resolutionNotes && (
                    <div className="text-[11px] text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      Resolution: {d.resolutionNotes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {d.status === 'OPEN' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedDispute(d)}
                      icon={<Scale className="w-3.5 h-3.5" />}
                      className="font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Mediate & Resolve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RESOLUTION MODAL */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-purple-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                    Mediate Dispute {selectedDispute.id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Complainant: {selectedDispute.complainantName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDispute(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-800">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div><strong>Trade ID:</strong> {selectedDispute.tradeId}</div>
                <div><strong>Category:</strong> {selectedDispute.category}</div>
                <div><strong>Summary:</strong> {selectedDispute.description}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mediation Ruling & Escrow Directive
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Enter official ruling, moisture compensation adjustment, or escrow release verdict..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <div className="text-[11px] font-bold text-slate-500">Select Resolution Verdict:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleResolve(selectedDispute.id, 'RESOLVED_FARMER_FAVOR')}
                    disabled={isResolving}
                    className="p-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-center cursor-pointer"
                  >
                    In Favor of Farmer (Release Escrow)
                  </button>

                  <button
                    onClick={() => handleResolve(selectedDispute.id, 'RESOLVED_BUYER_FAVOR')}
                    disabled={isResolving}
                    className="p-2 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-center cursor-pointer"
                  >
                    In Favor of Buyer (Refund Escrow)
                  </button>

                  <button
                    onClick={() => handleResolve(selectedDispute.id, 'CLOSED_MUTUAL')}
                    disabled={isResolving}
                    className="p-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold text-center cursor-pointer"
                  >
                    Mutual Compromise / Re-inspection
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
