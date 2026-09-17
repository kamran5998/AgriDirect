import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Sparkles,
  MapPin,
  Scale,
  IndianRupee,
  Building,
  Truck,
  ArrowLeft,
  UploadCloud,
  Check,
  Wheat,
} from 'lucide-react';
import { Language } from '../types';
import { useConnectivity } from '../../../context/ConnectivityContext';

interface CropReviewPublishStepProps {
  imagePreview: string;
  cropName: string;
  variety: string;
  qualityGrade: string;
  qualityScore: number;
  quantityQuintals: number;
  locationVillage: string;
  district: string;
  state: string;
  pincode?: string;
  sellingPrice: number;
  isPublishing: boolean;
  publishError: string | null;
  publishSuccess: boolean;
  lang: Language;
  onEditSection: (step: number) => void;
  onConfirmPublish: () => void;
  onFinish: () => void;
}

export const CropReviewPublishStep: React.FC<CropReviewPublishStepProps> = ({
  imagePreview,
  cropName,
  variety,
  qualityGrade,
  qualityScore,
  quantityQuintals,
  locationVillage,
  district,
  state,
  pincode,
  sellingPrice,
  isPublishing,
  publishError,
  publishSuccess,
  lang,
  onEditSection,
  onConfirmPublish,
  onFinish,
}) => {
  const { isOffline } = useConnectivity();
  const totalValue = (quantityQuintals || 40) * (sellingPrice || 2280);

  if (publishSuccess) {
    return (
      <div className="space-y-6 max-w-xl mx-auto py-8 text-center">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-lg animate-bounce ${
          isOffline ? 'bg-amber-100 text-amber-600 shadow-amber-600/20' : 'bg-emerald-100 text-emerald-600 shadow-emerald-600/20'
        }`}>
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
            isOffline ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {isOffline ? 'Offline Draft Saved' : 'Live in Direct Marketplace'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit',sans-serif]">
            {isOffline
              ? (lang === 'hi' ? 'फ़सल लॉट ऑफ़लाइन सहेजा गया!' : lang === 'mr' ? 'पीक लॉट ऑफलाइन सेव्ह झाले!' : 'Crop Lot Saved Offline!')
              : (lang === 'hi' ? 'फ़सल लॉट सफलतापूर्वक प्रकाशित हुआ!' : lang === 'mr' ? 'पीक लॉट यशस्वीरित्या प्रकाशित!' : 'Crop Lot Published Successfully!')}
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {isOffline
              ? (lang === 'hi'
                  ? 'आपका लॉट सुरक्षित रूप से स्थानीय फोन मेमोरी में सहेजा गया है। इंटरनेट चालू होते ही यह स्वतः लाइव हो जाएगा।'
                  : lang === 'mr'
                  ? 'आपला लॉट सुरक्षितपणे फोनमध्ये सेव्ह झाला आहे. इंटरनेट परत आल्यावर तो आपोआप लाईव्ह होईल.'
                  : 'Your harvest listing is safely saved in local storage. It will automatically publish and notify buyers when connectivity resumes.')
              : (lang === 'hi'
                  ? 'आपका फ़सल लॉट प्रकाशित होते ही बाज़ार में लाइव हो गया है! सत्यापित खरीदार अब बोली लगा सकते हैं।'
                  : 'Your crop lot will be live in the marketplace after publishing! Verified corporate millers and local FPOs in your region have been notified.')}
          </p>
        </div>

        {/* Summary Card */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-3xl max-w-md mx-auto text-left flex items-center gap-3.5">
          <img src={imagePreview} alt={cropName} className="w-16 h-16 rounded-2xl object-cover border border-emerald-300 shadow-xs shrink-0" />
          <div className="text-xs space-y-0.5">
            <p className="text-sm font-black text-slate-900">{cropName} ({variety})</p>
            <p className="text-emerald-800 font-bold">{quantityQuintals} Quintals • ₹{sellingPrice.toLocaleString('en-IN')}/Qtl</p>
            <p className="text-slate-500">{locationVillage}, {district}, {state}</p>
          </div>
        </div>

        <div className="pt-4 flex justify-center gap-3">
          <button
            type="button"
            onClick={onFinish}
            className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
          >
            {lang === 'hi' ? 'मेरी फसलें देखें' : lang === 'mr' ? 'माझी पिके पहा' : 'View in My Crops'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{lang === 'hi' ? 'चरण 8: समीक्षा और प्रकाशन' : lang === 'mr' ? 'पायरी ८: आढावा आणि प्रकाशन' : 'Step 8: Review & Publish'}</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-['Outfit',sans-serif]">
          {lang === 'hi' ? 'फ़सल लॉट की समीक्षा करें' : lang === 'mr' ? 'पीक लॉटची पडताळणी करा' : 'Review Crop Lot Details'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          {lang === 'hi'
            ? 'प्रकाशन से पहले सभी विवरणों की जांच करें। किसी भी खंड को बदलने के लिए एडिट दबाएं।'
            : 'Check all details before publishing. Click Edit on any section to modify.'}
        </p>
      </div>

      {/* Error Alert */}
      {publishError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 font-bold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{publishError}</span>
        </div>
      )}

      {/* Complete Review Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-200 shadow-sm space-y-5">
        {/* Crop Photo & Basic Info */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
          <div className="flex items-center gap-3.5">
            <img
              src={imagePreview}
              alt="Crop Lot"
              className="w-14 h-14 rounded-2xl object-cover border border-emerald-300 shadow-xs shrink-0"
            />
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase">Crop & Variety</span>
              <p className="text-base font-black text-slate-900">{cropName} - {variety}</p>
              <p className="text-xs font-bold text-emerald-700">
                Quality: {qualityGrade} ({qualityScore}/100)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onEditSection(3)}
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>

        {/* Section Breakdown Grid */}
        <div className="space-y-2.5 text-xs">
          {/* Location Section */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Location</span>
                <p className="text-xs font-black text-slate-900 mt-0.5">
                  {locationVillage}, {district}, {state} {pincode ? `(${pincode})` : ''}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onEditSection(4)}
              className="text-emerald-700 hover:text-emerald-800 font-bold text-xs flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          {/* Quantity Section */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Scale className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Quantity</span>
                <p className="text-xs font-black text-slate-900 mt-0.5">{quantityQuintals} Quintals</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onEditSection(5)}
              className="text-emerald-700 hover:text-emerald-800 font-bold text-xs flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          {/* Selling Price Section */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <IndianRupee className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Selling Price</span>
                <p className="text-xs font-black text-slate-900 mt-0.5">₹{sellingPrice.toLocaleString('en-IN')} / Quintal</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onEditSection(7)}
              className="text-emerald-700 hover:text-emerald-800 font-bold text-xs flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        {/* Total Lot Realization Banner */}
        <div className="p-4 rounded-2xl bg-emerald-700 text-white flex items-center justify-between shadow-md shadow-emerald-700/20">
          <div>
            <p className="text-xs font-medium text-emerald-200">Total Lot Expected Value</p>
            <p className="text-[11px] text-emerald-300">
              {quantityQuintals} Qtl × ₹{sellingPrice.toLocaleString('en-IN')}/Qtl
            </p>
          </div>
          <span className="text-xl sm:text-2xl font-black font-['Outfit',sans-serif]">
            ₹{totalValue.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Note on publication */}
        <p className="text-[11px] text-slate-500 text-center">
          {lang === 'hi'
            ? '🚀 आपका फ़सल लॉट प्रकाशित होते ही बाज़ार में लाइव हो जाएगा!'
            : '🚀 Your crop lot will be live in the marketplace after publishing!'}
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={isPublishing}
          onClick={() => onEditSection(7)}
          className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'hi' ? 'पीछे' : lang === 'mr' ? 'मागे' : 'Back'}</span>
        </button>

        <button
          type="button"
          disabled={isPublishing}
          onClick={onConfirmPublish}
          className={`flex-1 sm:flex-initial px-8 py-3.5 rounded-2xl text-white font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
            isOffline
              ? 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 shadow-amber-600/30'
              : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-emerald-600/30'
          }`}
        >
          {isPublishing ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>
                {isOffline
                  ? (lang === 'hi' ? 'सहेज रहे हैं...' : 'Saving Draft...')
                  : (lang === 'hi' ? 'प्रकाशित हो रहा है...' : 'Publishing...')}
              </span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              <span>
                {isOffline
                  ? (lang === 'hi' ? 'ऑफ़लाइन ड्राफ्ट सहेजें' : lang === 'mr' ? 'ऑफलाइन मसुदा जतन करा' : 'Save Lot Offline')
                  : (lang === 'hi' ? 'फ़सल लॉट प्रकाशित करें' : lang === 'mr' ? 'पीक लॉट प्रकाशित करा' : 'Publish Crop Lot')}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
