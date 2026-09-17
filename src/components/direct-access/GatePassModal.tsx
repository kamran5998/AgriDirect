import React from 'react';
import {
  X,
  QrCode,
  ShieldCheck,
  Building,
  MapPin,
  Calendar,
  Truck,
  CheckCircle2,
  Printer,
  Download,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface GatePassModalProps {
  gatePassId: string | null;
  buyerName: string | null;
  onClose: () => void;
}

export const GatePassModal: React.FC<GatePassModalProps> = ({
  gatePassId,
  buyerName,
  onClose,
}) => {
  if (!gatePassId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col text-slate-900">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-['Outfit',sans-serif]">
                Electronic Mandi Gate Pass
              </h3>
              <p className="text-[10px] text-emerald-200">
                Govt e-NAM & APMC Ingress Authorization
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gate Pass Slip Body */}
        <div className="p-6 space-y-5">
          
          {/* QR Code Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 text-center space-y-2">
            <div className="w-40 h-40 bg-white border border-slate-300 rounded-2xl p-2.5 mx-auto flex items-center justify-center shadow-xs">
              <div className="w-full h-full border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-1">
                <QrCode className="w-20 h-20 text-slate-900" />
                <span className="text-[9px] font-mono text-slate-500 font-bold">SCAN AT WEIGHBRIDGE</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Gate Pass Reference ID</span>
              <span className="text-base font-mono font-black text-slate-900 tracking-wider">
                {gatePassId}
              </span>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-2 text-xs divide-y divide-slate-100">
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Authorized Buyer:</span>
              <span className="font-bold text-slate-900">{buyerName || 'Patanjali Agro Foods'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Authorized Farmer:</span>
              <span className="font-semibold text-slate-900">Rajinder Singh (Sehore)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Vehicle Mode:</span>
              <span className="font-semibold text-slate-900">Assisted Farm Truck Dispatch</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Escrow Security:</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Funds Held in Bank Escrow
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
            <strong>Security Notice:</strong> Present this digital pass at the entrance weighbridge. Moisture reading and gross weight will automatically sync to your farmer portal.
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              window.print();
            }}
            icon={<Printer className="w-3.5 h-3.5" />}
            className="font-bold text-xs"
          >
            Print / Save Pass
          </Button>
        </div>

      </div>
    </div>
  );
};
