import React, { useState } from 'react';
import {
  Sparkles,
  Edit3,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  IndianRupee,
  Scale,
} from 'lucide-react';
import { Language } from '../types';

interface CropSellingPriceStepProps {
  cropName: string;
  quantityQuintals: number;
  aiSuggestedPrice: number;
  sellingPrice: number;
  lang: Language;
  onSellingPriceChange: (price: number) => void;
  onBack: () => void;
  onProceedToReview: () => void;
}

export const CropSellingPriceStep: React.FC<CropSellingPriceStepProps> = ({
  cropName,
  quantityQuintals,
  aiSuggestedPrice,
  sellingPrice,
  lang,
  onSellingPriceChange,
  onBack,
  onProceedToReview,
}) => {
  const [pricingMode, setPricingMode] = useState<'ai' | 'custom'>(
    sellingPrice === aiSuggestedPrice ? 'ai' : 'custom'
  );
  const [customPriceInput, setCustomPriceInput] = useState<string>(
    String(sellingPrice || aiSuggestedPrice || 2280)
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSelectAiPrice = () => {
    setPricingMode('ai');
    onSellingPriceChange(aiSuggestedPrice);
  };

  const handleSelectCustomPrice = () => {
    setPricingMode('custom');
    const num = parseFloat(customPriceInput);
    if (!isNaN(num) && num > 0) {
      onSellingPriceChange(num);
    }
  };

  const handleCustomPriceInputChange = (val: string) => {
    setCustomPriceInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      onSellingPriceChange(num);
      setValidationError(null);
    }
  };

  const handleReview = () => {
    const finalPrice = pricingMode === 'ai' ? aiSuggestedPrice : parseFloat(customPriceInput);
    if (!finalPrice || isNaN(finalPrice) || finalPrice <= 0) {
      setValidationError('Please specify a valid selling price greater than 0.');
      return;
    }
    setValidationError(null);
    onSellingPriceChange(finalPrice);
    onProceedToReview();
  };

  const currentEffectivePrice = pricingMode === 'ai' ? aiSuggestedPrice : parseFloat(customPriceInput) || 0;
  const totalValuation = (quantityQuintals || 40) * currentEffectivePrice;

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
          <span>{lang === 'hi' ? 'चरण 7: बिक्री मूल्य तय करें' : lang === 'mr' ? 'पायरी ७: विक्री किंमत निश्चित करा' : 'Step 7: Set Selling Price'}</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-['Outfit',sans-serif]">
          {lang === 'hi' ? 'अपना बिक्री मूल्य चुनें' : lang === 'mr' ? 'तुमची विक्री किंमत निवडा' : 'Set Your Selling Price'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          {lang === 'hi'
            ? 'आप AI द्वारा अनुशंसित मूल्य चुन सकते हैं या अपना मनचाहा मूल्य तय कर सकते हैं'
            : 'Choose the AI recommendation or override with your custom desired price.'}
        </p>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 font-bold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Price Option Selection Cards */}
      <div className="space-y-4">
        {/* OPTION 1: Use AI Expected Price */}
        <div
          onClick={handleSelectAiPrice}
          className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative ${
            pricingMode === 'ai'
              ? 'border-emerald-600 bg-emerald-50/50 shadow-md shadow-emerald-600/10'
              : 'border-slate-200 bg-white hover:border-emerald-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  pricingMode === 'ai'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {pricingMode === 'ai' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Option 1: Use AI Expected Price</span>
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Optimal competitive rate for fast match with verified institutional millers
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-emerald-900 font-['Outfit',sans-serif]">
                ₹{aiSuggestedPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-bold text-emerald-700 block">/ Qtl</span>
            </div>
          </div>
        </div>

        {/* OPTION 2: Set My Own Price */}
        <div
          onClick={handleSelectCustomPrice}
          className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative ${
            pricingMode === 'custom'
              ? 'border-emerald-600 bg-emerald-50/50 shadow-md shadow-emerald-600/10'
              : 'border-slate-200 bg-white hover:border-emerald-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  pricingMode === 'custom'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {pricingMode === 'custom' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-black text-slate-900 uppercase tracking-wider">
                  <Edit3 className="w-3.5 h-3.5 text-slate-700" />
                  <span>Option 2: Set My Own Price</span>
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your desired reserve selling price per quintal
                </p>
              </div>
            </div>
          </div>

          {/* Custom Price Input Form */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">
                ₹
              </span>
              <input
                type="number"
                min="500"
                step="10"
                value={customPriceInput}
                onFocus={() => setPricingMode('custom')}
                onChange={(e) => handleCustomPriceInputChange(e.target.value)}
                placeholder="2300"
                className="w-full pl-8 pr-14 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-black text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                / Qtl
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              (e.g., ₹2,300)
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Lot Valuation Calculation Banner */}
      <div className="p-4 rounded-2xl bg-emerald-100/60 border border-emerald-300/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
            ₹
          </div>
          <div>
            <p className="text-xs font-black text-emerald-950">Total Expected Lot Revenue</p>
            <p className="text-[11px] text-emerald-800">
              {quantityQuintals} Quintals × ₹{currentEffectivePrice.toLocaleString('en-IN')}/Qtl
            </p>
          </div>
        </div>
        <span className="text-lg sm:text-xl font-black text-emerald-950 font-['Outfit',sans-serif]">
          ₹{totalValuation.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Short message */}
      <p className="text-center text-xs text-slate-500 font-medium">
        {lang === 'hi'
          ? 'ℹ️ आप लिस्टिंग प्रकाशित करने से पहले किसी भी समय मूल्य बदल सकते हैं।'
          : 'You can change the price anytime before publishing.'}
      </p>

      {/* Navigation Buttons */}
      <div className="pt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'hi' ? 'पीछे' : lang === 'mr' ? 'मागे' : 'Back'}</span>
        </button>

        <button
          type="button"
          onClick={handleReview}
          className="flex-1 sm:flex-initial px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{lang === 'hi' ? 'विवरण की समीक्षा करें' : lang === 'mr' ? 'माहिती तपासा' : 'Review Listing'}</span>
          <ArrowRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
