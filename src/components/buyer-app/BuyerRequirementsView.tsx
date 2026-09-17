import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  MapPin,
  Calendar,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Language } from '../farmer-app/types';
import { BUYER_TRANSLATIONS } from './types';
import { BuyerRequirementItem } from '../../api/buyerApi';

interface BuyerRequirementsViewProps {
  lang: Language;
  requirements: BuyerRequirementItem[];
  isLoading: boolean;
  onOpenPostRequirement: () => void;
  onUpdateStatus: (id: number, status: 'open' | 'fulfilled' | 'cancelled') => Promise<void>;
  onDeleteRequirement: (id: number) => Promise<void>;
}

export const BuyerRequirementsView: React.FC<BuyerRequirementsViewProps> = ({
  lang,
  requirements,
  isLoading,
  onOpenPostRequirement,
  onUpdateStatus,
  onDeleteRequirement,
}) => {
  const t = BUYER_TRANSLATIONS[lang] || BUYER_TRANSLATIONS.en;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'fulfilled' | 'cancelled'>('all');
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredRequirements = requirements.filter((item) => {
    const matchesSearch =
      item.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: number, status: 'open' | 'fulfilled' | 'cancelled') => {
    setActionError(null);
    try {
      await onUpdateStatus(id, status);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update requirement status.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this procurement requirement?')) {
      return;
    }
    setActionError(null);
    try {
      await onDeleteRequirement(id);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete requirement.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-['Outfit',sans-serif]">
              {t.requirements}
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage your standing procurement tenders, target pricing, and depot delivery locations.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenPostRequirement}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer font-['Outfit',sans-serif] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.postRequirement}</span>
        </button>
      </div>

      {/* Action Error Alert */}
      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100/70 p-3 rounded-2xl border border-slate-200/80">
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop, depot location, or specification..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(['all', 'open', 'fulfilled', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {st === 'all' ? 'All Tenders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Requirements List */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2 text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>{t.loading}</span>
        </div>
      ) : filteredRequirements.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="text-sm font-bold text-slate-700">No procurement requirements found</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'Try clearing your search query or status filter.'
              : 'Post your first procurement requirement tender to broadcast your demand to farmers.'}
          </p>
          <button
            type="button"
            onClick={onOpenPostRequirement}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Requirement</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequirements.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-5 border transition-all space-y-4 shadow-xs hover:shadow-md flex flex-col justify-between ${
                item.status === 'open'
                  ? 'border-slate-200 hover:border-indigo-300'
                  : item.status === 'fulfilled'
                  ? 'border-emerald-200 bg-emerald-50/20 opacity-90'
                  : 'border-rose-200 bg-rose-50/20 opacity-75'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                      {item.cropName}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Ref: #{item.id} • Posted {item.createdAt}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      item.status === 'open'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.status === 'fulfilled'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Target Volume
                    </span>
                    <span className="text-sm font-black text-slate-900 font-mono">
                      {item.quantityRequired} Qtl
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      ≈ {(item.quantityRequired / 10).toFixed(1)} MT
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Max Price
                    </span>
                    <span className="text-sm font-black text-indigo-700 font-mono">
                      ₹{item.expectedPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      /Quintal
                    </span>
                  </div>
                </div>

                {/* Location & Date */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>

                  {item.requiredDate && (
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Needed by: {item.requiredDate}</span>
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-[11px] text-slate-500 bg-slate-100/70 p-2 rounded-xl border border-slate-200/50 line-clamp-2">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {item.status === 'open' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'fulfilled')}
                        className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Mark as Fulfilled"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Fulfilled</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'cancelled')}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Cancel Tender"
                      >
                        <XCircle className="w-3 h-3 text-slate-500" />
                        <span>Close</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.id, 'open')}
                      className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Re-Open Tender</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete Requirement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
