import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  UserX,
  Eye,
  Building,
  Users,
  Award,
  Sparkles,
} from 'lucide-react';
import { VerificationRequest, VERIFICATION_QUEUE_DATA } from '../../data/adminData';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface AdminUserVerificationProps {
  onVerificationProcessed?: (id: string, approved: boolean) => void;
}

export const AdminUserVerification: React.FC<AdminUserVerificationProps> = ({
  onVerificationProcessed,
}) => {
  const [queue, setQueue] = useState<VerificationRequest[]>(VERIFICATION_QUEUE_DATA);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    const item = queue.find((q) => q.id === id);
    setQueue((prev) => prev.filter((q) => q.id !== id));
    setSelectedRequest(null);
    setToast(`Verified credentials for ${item?.userName || 'Applicant'}. Accreditation issued.`);
    setTimeout(() => setToast(null), 3000);
    if (onVerificationProcessed) onVerificationProcessed(id, true);
  };

  const handleReject = (id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
    setSelectedRequest(null);
    setToast('Application marked for resubmission with documentation feedback.');
    setTimeout(() => setToast(null), 3000);
    if (onVerificationProcessed) onVerificationProcessed(id, false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" size="sm">KYC Workbench</Badge>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif] tracking-tight mt-1">
            Farmer & Buyer Accreditation Queue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Authenticate land records (Khatauni), Kisan Credit Cards, GSTIN registrations, and bank escrow authorization letters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-center min-w-[120px]">
            <span className="text-[10px] font-bold text-purple-800 uppercase block">Pending Audit</span>
            <span className="text-lg font-black text-purple-950 font-mono">{queue.length} Requests</span>
          </div>
        </div>
      </div>

      {/* Queue Cards */}
      {queue.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Verification Queue Clear</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All submitted producer land records and institutional buyer certificates have been processed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {queue.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between gap-5 hover:border-slate-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                      req.userType === 'farmer' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {req.userType === 'farmer' ? <Users className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 leading-tight">
                          {req.userName}
                        </h3>
                        <Badge variant={req.userType === 'farmer' ? 'emerald' : 'blue'} size="sm">
                          {req.userType === 'farmer' ? 'Farmer KYC' : 'Buyer KYC'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {req.entityName || req.location} • {req.contactNumber}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {req.id}
                  </span>
                </div>

                {/* Submitted Documents Inspection */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Submitted Verification Docs</span>
                  {req.submittedDocs.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-700">{doc.docName}</span>
                      <span className="font-mono text-emerald-700 font-bold">{doc.docNumber} ({doc.status})</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-600 italic bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                  "{req.notes}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-emerald-700">{req.riskScore}</span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(req.id)}
                    icon={<UserX className="w-3.5 h-3.5 text-red-500" />}
                    className="font-bold text-xs"
                  >
                    Request Info
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(req.id)}
                    icon={<UserCheck className="w-3.5 h-3.5" />}
                    className="font-bold text-xs shadow-xs"
                  >
                    Approve & Verify
                  </Button>
                </div>
              </div>

            </div>
          ))}
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
