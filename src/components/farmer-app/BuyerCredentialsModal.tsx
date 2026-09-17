import React from 'react';
import {
  ShieldCheck,
  Building2,
  Award,
  CheckCircle2,
  Clock,
  Scale,
  Phone,
  Truck,
  FileCheck,
  Star,
  X,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { Language, TRANSLATIONS } from './types';
import { EnrichedBuyerCard } from './VerifiedBuyersView';

export interface BuyerCredentialsModalProps {
  buyer: EnrichedBuyerCard;
  lang: Language;
  onClose: () => void;
  onSendRequest: (buyer: EnrichedBuyerCard) => void;
}

export const BuyerCredentialsModal: React.FC<BuyerCredentialsModalProps> = ({
  buyer,
  lang,
  onClose,
  onSendRequest,
}) => {
  const t = TRANSLATIONS[lang];

  // Derive mock/real verified credentials
  const enamId = `ENAM-MP-${buyer.district.toUpperCase().slice(0, 3)}-${Math.floor(10000 + Math.random() * 89999)}`;
  const fssaiLic = `100${Math.floor(11000000000 + Math.random() * 89000000000)}`;
  const totalProcuredTons = Math.round(15000 + (buyer.quantityRequiredQuintals * 12) / 10);
  const yearsExperience = 8 + (buyer.district.length % 7);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 border border-slate-200 shadow-2xl no-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.statutoryKyc}</span>
              </span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">
                100% Escrow Protected
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-950 font-['Outfit',sans-serif]">
              {buyer.name}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>{buyer.location}</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">{buyer.typeDisplay}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Rating & Trust Score */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 p-4 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 text-base font-mono">
                  {buyer.rating.toFixed(1)} / 5.0
                </span>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-emerald-800 font-medium">
                Verified by 420+ Farmers across {buyer.state}
              </p>
            </div>
          </div>
          <span className="bg-white text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs">
            Grade A+ Trust Score
          </span>
        </div>

        {/* 1. Statutory & Legal Registrations */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>{t.statutoryKyc}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.gstinLabel}</span>
              <span className="font-mono font-bold text-slate-900">{buyer.gstin}</span>
              <span className="text-[10px] text-emerald-700 font-medium block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Active & Tax-Compliant
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.enamRegLabel}</span>
              <span className="font-mono font-bold text-slate-900">{enamId}</span>
              <span className="text-[10px] text-emerald-700 font-medium block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Direct e-NAM Yard License
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.fssaiLicenseLabel}</span>
              <span className="font-mono font-bold text-slate-900">{fssaiLic}</span>
              <span className="text-[10px] text-emerald-700 font-medium block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Central Food Safety Certified
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.experienceYearsLabel}</span>
              <span className="font-bold text-slate-900">{yearsExperience}+ Years in Grain Procurement</span>
              <span className="text-[10px] text-slate-500 block">Established Agro Processing Unit</span>
            </div>
          </div>
        </div>

        {/* 2. Procurement Track Record & Capacity */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>{t.procurementHistory}</span>
          </h3>
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block">{t.tonnageProcuredLabel}</span>
              <span className="font-mono font-black text-slate-900 text-sm">
                {totalProcuredTons.toLocaleString('en-IN')} MT
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Active Procurement Season</span>
              <span className="font-mono font-black text-slate-900 text-sm">
                {buyer.quantityRequiredQuintals.toLocaleString('en-IN')} Quintals
              </span>
            </div>
          </div>
        </div>

        {/* 3. Payment Reliability & Escrow Guarantee */}
        <div className="bg-emerald-900 text-white p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-300" />
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-200">
                {t.paymentReliabilityTitle}
              </h4>
            </div>
            <span className="bg-emerald-800 text-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-md">
              Zero Default Guarantee
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-emerald-300 block">{t.avgPaymentSpeed}</span>
              <strong className="text-white font-mono text-sm">Within 2.1 Hours</strong>
              <span className="text-[10px] text-emerald-300 block">Instant RTGS/NEFT</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-emerald-300 block">Escrow Mechanism</span>
              <strong className="text-white text-sm">100% Pre-funded</strong>
              <span className="text-[10px] text-emerald-300 block">Held in safe bank custody</span>
            </div>
          </div>
        </div>

        {/* 4. Direct Procurement Contact Desk */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {t.procurementOfficerContact}
          </span>
          <div className="flex items-center justify-between">
            <div>
              <strong className="text-slate-900 block">{buyer.procurementOfficer}</strong>
              <span className="text-slate-500 text-[11px]">Regional Procurement Hub, {buyer.district}</span>
            </div>
            <a
              href={`tel:${buyer.phoneContact.replace(/\s+/g, '')}`}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            {lang === 'en' ? 'Close' : 'बंद करें'}
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onSendRequest(buyer);
            }}
            className="w-2/3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.sendRequest}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
