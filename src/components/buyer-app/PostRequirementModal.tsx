import React, { useState } from 'react';
import { X, Plus, Calendar, MapPin, IndianRupee, Scale, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Language } from '../farmer-app/types';
import { BUYER_TRANSLATIONS } from './types';
import { PostRequirementPayload } from '../../api/buyerApi';

interface PostRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: PostRequirementPayload) => Promise<void>;
  lang: Language;
}

const AVAILABLE_CROPS = [
  { id: 1, name: 'Wheat (Sharbati / Lokwan)', basePrice: 2920 },
  { id: 2, name: 'Soybean (Yellow Seed)', basePrice: 4800 },
  { id: 3, name: 'Cotton (Medium / Long Staple)', basePrice: 7200 },
  { id: 4, name: 'Mustard / Rapeseed', basePrice: 5600 },
  { id: 5, name: 'Basmati Paddy (Pusa 1121)', basePrice: 4100 },
  { id: 6, name: 'Chana (Bengal Gram / Desi)', basePrice: 5850 },
  { id: 7, name: 'Maize (Industrial Starch FAQ)', basePrice: 2280 },
  { id: 8, name: 'Tur / Arhar (Red Gram)', basePrice: 7900 },
];

const PREFERRED_DEPOTS = [
  'Sehore Industrial Hub / Ashta Depot',
  'Dewas Logistics Hub & Plant',
  'Indore Bypass Processing Terminal',
  'Ujjain Grain Aggregation Depot',
  'Khandwa Direct Sourcing Center',
  'Bhopal Mandideep Plant Gate',
  'Farm-gate Direct (Assisted Logistics)',
];

export const PostRequirementModal: React.FC<PostRequirementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  lang,
}) => {
  const t = BUYER_TRANSLATIONS[lang] || BUYER_TRANSLATIONS.en;

  const [cropId, setCropId] = useState<number>(1);
  const [quantityRequired, setQuantityRequired] = useState<string>('500');
  const [expectedPrice, setExpectedPrice] = useState<string>('2940');
  const [location, setLocation] = useState<string>(PREFERRED_DEPOTS[0]);
  const [requiredDate, setRequiredDate] = useState<string>(
    new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('Instant digital escrow settlement upon quality verification at weighbridge');
  const [qualityGrade, setQualityGrade] = useState<string>('Grade A (Premium)');
  const [maxMoisturePercent, setMaxMoisturePercent] = useState<string>('12.0');
  const [maxForeignMatterPercent, setMaxForeignMatterPercent] = useState<string>('1.5');
  const [deliveryOption, setDeliveryOption] = useState<'Depot Delivery' | 'Farm-gate Pickup'>('Depot Delivery');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedCrop = AVAILABLE_CROPS.find((c) => c.id === cropId) || AVAILABLE_CROPS[0];

  const handleCropChange = (id: number) => {
    setCropId(id);
    const crop = AVAILABLE_CROPS.find((c) => c.id === id);
    if (crop) {
      setExpectedPrice(crop.basePrice.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const qty = parseFloat(quantityRequired);
    const price = parseFloat(expectedPrice);

    if (isNaN(qty) || qty <= 0) {
      setErrorMessage('Please enter a valid procurement quantity in quintals.');
      return;
    }

    if (isNaN(price) || price <= 0) {
      setErrorMessage('Please enter a valid target price per quintal.');
      return;
    }

    if (!location.trim()) {
      setErrorMessage('Please specify preferred depot or delivery location.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        cropId,
        cropName: selectedCrop.name,
        quantityRequired: qty,
        expectedPrice: price,
        location,
        requiredDate,
        notes: `${notes} (Quality: ${qualityGrade}, Max Moisture: ${maxMoisturePercent}%, Max Foreign Matter: ${maxForeignMatterPercent}%)`,
        qualityGrade,
        maxMoisturePercent: parseFloat(maxMoisturePercent) || 12.0,
        maxForeignMatterPercent: parseFloat(maxForeignMatterPercent) || 1.5,
        deliveryOption,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to post requirement. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalBudgetEst = (parseFloat(quantityRequired) || 0) * (parseFloat(expectedPrice) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 font-['Outfit',sans-serif]">
              {t.postRequirement}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Publish target procurement volume & price target for registered farmers
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 font-['Outfit',sans-serif]">
              1. {t.crop}
            </label>
            <select
              value={cropId}
              onChange={(e) => handleCropChange(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-hidden cursor-pointer"
            >
              {AVAILABLE_CROPS.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name} (Benchmark: ₹{crop.basePrice.toLocaleString('en-IN')}/Qtl)
                </option>
              ))}
            </select>
          </div>

          {/* Quantity and Target Price Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 font-['Outfit',sans-serif]">
                2. {t.quantity}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={quantityRequired}
                  onChange={(e) => setQuantityRequired(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-hidden font-mono"
                  required
                />
                <span className="absolute right-3.5 top-3.5 text-xs font-bold text-slate-400">
                  Qtl
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                ≈ {((parseFloat(quantityRequired) || 0) / 10).toFixed(1)} Metric Tonnes
              </p>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 font-['Outfit',sans-serif]">
                3. {t.maxPrice}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-xs font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="100"
                  step="10"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(e.target.value)}
                  placeholder="e.g. 2940"
                  className="w-full pl-8 pr-12 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-hidden font-mono"
                  required
                />
                <span className="absolute right-3.5 top-3.5 text-xs font-bold text-slate-400">
                  /Qtl
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
                Est. Lot Value: ₹{totalBudgetEst.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Preferred Location */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 font-['Outfit',sans-serif]">
              4. {t.preferredLocation}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                list="depot-options"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sehore Hub or Mandideep Plant"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-hidden"
                required
              />
              <datalist id="depot-options">
                {PREFERRED_DEPOTS.map((d, i) => (
                  <option key={i} value={d} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Required Date */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 font-['Outfit',sans-serif]">
              5. {t.requiredDate}
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="date"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-hidden font-mono"
                required
              />
            </div>
          </div>

          {/* Quality Specifications */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider block font-['Outfit',sans-serif]">
              6. Quality Parameters & Delivery Logistics
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Quality Grade</label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900"
                >
                  <option value="Grade A (Premium)">Grade A (Premium Export Quality)</option>
                  <option value="Grade B (Standard FAQ)">Grade B (Standard Fair Average Quality)</option>
                  <option value="Grade C (Feed / Industrial)">Grade C (Feed / Industrial Processing)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Delivery / Pickup Mode</label>
                <select
                  value={deliveryOption}
                  onChange={(e) => setDeliveryOption(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900"
                >
                  <option value="Depot Delivery">Buyer Depot Delivery (Farmer Freight)</option>
                  <option value="Farm-gate Pickup">Farm-gate Direct (Buyer Arranged Transport)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Max Moisture (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={maxMoisturePercent}
                  onChange={(e) => setMaxMoisturePercent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold font-mono"
                  placeholder="12.0"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Max Foreign Matter (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={maxForeignMatterPercent}
                  onChange={(e) => setMaxForeignMatterPercent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold font-mono"
                  placeholder="1.5"
                />
              </div>
            </div>
          </div>

          {/* Quality & Settlement Notes */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 font-['Outfit',sans-serif]">
              7. Settlement & Additional Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Instant digital escrow payment upon weighbridge inspection"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-xs hover:shadow-md transition-all disabled:opacity-50 cursor-pointer font-['Outfit',sans-serif]"
            >
              {isSubmitting ? (
                <span>Publishing Tender...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Publish Requirement</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
