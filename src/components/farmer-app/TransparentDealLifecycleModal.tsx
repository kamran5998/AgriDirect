import React from 'react';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  QrCode,
  Truck,
  Scale,
  CreditCard,
  FileText,
  X,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { Language, TRANSLATIONS } from './types';

export interface DealLifecycleItem {
  id: string;
  cropName: string;
  quantityQuintals: number;
  offeredPricePerQuintal: number;
  buyerName: string;
  status: 'COMPLETED' | 'IN_TRANSIT' | 'ESCROW_HELD' | 'OFFER_ACCEPTED';
  date: string;
  escrowRef?: string;
  gatePassId?: string;
  weighmentSlipId?: string;
  bankUtr?: string;
}

export interface TransparentDealLifecycleModalProps {
  deal?: DealLifecycleItem;
  lang: Language;
  onClose: () => void;
}

export const TransparentDealLifecycleModal: React.FC<TransparentDealLifecycleModalProps> = ({
  deal,
  lang,
  onClose,
}) => {
  const t = TRANSLATIONS[lang];

  const defaultDeal: DealLifecycleItem = deal || {
    id: 'TRD-2026-9182',
    cropName: 'Sharbati Wheat (Grade A)',
    quantityQuintals: 50,
    offeredPricePerQuintal: 2950,
    buyerName: 'Patanjali Agro Processing Ltd',
    status: 'COMPLETED',
    date: '28 Aug 2026',
    escrowRef: 'ESC-MP-98214',
    gatePassId: 'GP-2026-SEH-042',
    weighmentSlipId: 'WGH-78410-MP',
    bankUtr: 'PUNBH26240981723',
  };

  const totalAmount = defaultDeal.quantityQuintals * defaultDeal.offeredPricePerQuintal;

  const stages = [
    {
      number: 1,
      title: t.lifecycleStage1,
      desc: 'Quality parameter scan: Moisture 10.4%, Grade A Premium, Foreign matter < 1.0%',
      icon: Scale,
      status: 'completed',
      timestamp: 'Day 1 • 09:30 AM',
    },
    {
      number: 2,
      title: t.lifecycleStage2,
      desc: `Matched with ${defaultDeal.buyerName} at ₹${defaultDeal.offeredPricePerQuintal}/Qtl`,
      icon: Building2,
      status: 'completed',
      timestamp: 'Day 1 • 11:15 AM',
    },
    {
      number: 3,
      title: t.lifecycleStage3,
      desc: `Buyer deposited ₹${totalAmount.toLocaleString('en-IN')} in digital Escrow (Ref: ${defaultDeal.escrowRef})`,
      icon: ShieldCheck,
      status: 'completed',
      timestamp: 'Day 1 • 02:40 PM',
    },
    {
      number: 4,
      title: t.lifecycleStage4,
      desc: `Digital Gate Pass QR generated (ID: ${defaultDeal.gatePassId})`,
      icon: QrCode,
      status: 'completed',
      timestamp: 'Day 2 • 08:00 AM',
    },
    {
      number: 5,
      title: t.lifecycleStage5,
      desc: 'Assigned Commercial Truck (MP-04-HE-8921) dispatched for farm-gate pickup',
      icon: Truck,
      status: 'completed',
      timestamp: 'Day 2 • 10:30 AM',
    },
    {
      number: 6,
      title: t.lifecycleStage6,
      desc: `Electronic weighbridge slip verified (Net: ${defaultDeal.quantityQuintals} Qtl, Slip: ${defaultDeal.weighmentSlipId})`,
      icon: Scale,
      status: 'completed',
      timestamp: 'Day 2 • 01:15 PM',
    },
    {
      number: 7,
      title: t.lifecycleStage7,
      desc: `Escrow released ₹${totalAmount.toLocaleString('en-IN')} via RTGS/NEFT (UTR: ${defaultDeal.bankUtr})`,
      icon: CreditCard,
      status: 'completed',
      timestamp: 'Day 2 • 02:30 PM',
    },
    {
      number: 8,
      title: t.lifecycleStage8,
      desc: 'Digital tax invoice & purchase receipt generated. Deal closed with 0% dispute.',
      icon: FileText,
      status: 'completed',
      timestamp: 'Day 2 • 02:45 PM',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-5 border border-slate-200 shadow-2xl no-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Audit Trail</span>
              </span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md">
                {defaultDeal.id}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-950 font-['Outfit',sans-serif]">
              {t.transactionSummaryTitle}
            </h2>
            <p className="text-xs text-slate-500">
              {defaultDeal.cropName} • {defaultDeal.quantityQuintals} Qtl • Buyer: <strong>{defaultDeal.buyerName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Lot Value</span>
            <strong className="text-slate-900 font-mono text-sm font-black">
              ₹{totalAmount.toLocaleString('en-IN')}
            </strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Agreed Rate</span>
            <strong className="text-slate-900 font-mono text-sm">
              ₹{defaultDeal.offeredPricePerQuintal}/Qtl
            </strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Method</span>
            <strong className="text-emerald-700 text-xs font-bold block">100% Escrow Bank</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Settlement Status</span>
            <span className="inline-block bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
              RELEASED & SETTLED
            </span>
          </div>
        </div>

        {/* 8-Stage Timeline */}
        <div className="space-y-3 relative before:absolute before:top-3 before:bottom-3 before:left-4 before:w-0.5 before:bg-emerald-200">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div key={stage.number} className="relative flex items-start gap-4 pl-1">
                {/* Node circle */}
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs z-10">
                  <CheckCircle2 className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200/90 flex-grow text-xs space-y-1 hover:border-emerald-300 transition-colors shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{stage.title}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{stage.timestamp}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Guarantee Note */}
        <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>
            Every stage is digitally signed, timestamped, and cryptographically verified under the AgriDirect Pulse Escrow Protocol.
          </span>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
        >
          {lang === 'en' ? 'Close Transaction View' : 'बंद करें'}
        </button>
      </div>
    </div>
  );
};
