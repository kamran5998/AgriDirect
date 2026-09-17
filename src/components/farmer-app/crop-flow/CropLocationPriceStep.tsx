import React, { useState, useEffect } from 'react';
import {
  MapPin,
  TrendingUp,
  Sparkles,
  Edit2,
  Check,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Building2,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
} from 'lucide-react';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { Language } from '../types';
import { cropAiService } from '../../../api/cropAiService';

interface CropLocationPriceStepProps {
  cropName: string;
  variety: string;
  qualityGrade: string;
  quantityQuintals: number;
  locationVillage: string;
  district: string;
  state: string;
  expectedPrice: number;
  lang: Language;
  onUpdateLocation: (village: string, district: string, state: string) => void;
  onUpdateExpectedPrice: (price: number) => void;
  onBack: () => void;
  onProceedToReview: () => void;
}

const INDIAN_STATES: Record<string, string[]> = {
  'Madhya Pradesh': ['Sehore', 'Indore', 'Bhopal', 'Ujjain', 'Dewas', 'Hoshangabad', 'Vidisha', 'Raisen'],
  'Punjab': ['Ludhiana', 'Khanna', 'Patiala', 'Amritsar', 'Bathinda', 'Jalandhar', 'Sangrur'],
  'Haryana': ['Karnal', 'Kurukshetra', 'Ambala', 'Hisar', 'Sirsa', 'Rohtak', 'Panipat'],
  'Maharashtra': ['Akola', 'Nagpur', 'Amravati', 'Nashik', 'Lasalgaon', 'Latur', 'Pune', 'Solapur'],
  'Rajasthan': ['Kota', 'Alwar', 'Sri Ganganagar', 'Jaipur', 'Bikaner', 'Baran', 'Bharatpur'],
  'Gujarat': ['Rajkot', 'Gondal', 'Surat', 'Ahmedabad', 'Amreli', 'Junagadh', 'Bhavnagar'],
  'Uttar Pradesh': ['Kanpur', 'Agra', 'Aligarh', 'Mathura', 'Bareilly', 'Varanasi', 'Lucknow'],
};

export const CropLocationPriceStep: React.FC<CropLocationPriceStepProps> = ({
  cropName,
  variety,
  qualityGrade,
  quantityQuintals,
  locationVillage,
  district,
  state,
  expectedPrice,
  lang,
  onUpdateLocation,
  onUpdateExpectedPrice,
  onBack,
  onProceedToReview,
}) => {
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [tempVillage, setTempVillage] = useState(locationVillage);
  const [tempDistrict, setTempDistrict] = useState(district);
  const [tempState, setTempState] = useState(state);

  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'detected' | 'fallback' | null>(null);

  // Price intelligence data
  const priceAnalysis = cropAiService.getPriceAnalysisForCrop(cropName, district);

  // Initialize or align suggested price if not set
  useEffect(() => {
    if (!expectedPrice || expectedPrice === 0) {
      onUpdateExpectedPrice(priceAnalysis.suggested);
    }
  }, [cropName, district]);

  // Attempt auto GPS detection on mount if not yet detected
  useEffect(() => {
    if (!gpsStatus && 'geolocation' in navigator) {
      setIsDetectingGps(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsDetectingGps(false);
          setGpsStatus('detected');
          // In real browser, reverse geocode coordinates or confirm current village
          setTempVillage((prev) => prev || 'Ashta Village');
        },
        (error) => {
          setIsDetectingGps(false);
          setGpsStatus('fallback');
        },
        { timeout: 3000 }
      );
    }
  }, []);

  const handleSaveLocation = () => {
    onUpdateLocation(tempVillage, tempDistrict, tempState);
    setIsEditingLocation(false);
  };

  const handleGpsRefresh = () => {
    setIsDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDetectingGps(false);
          setGpsStatus('detected');
        },
        () => {
          setIsDetectingGps(false);
          setGpsStatus('fallback');
        },
        { timeout: 3000 }
      );
    } else {
      setIsDetectingGps(false);
      setGpsStatus('fallback');
    }
  };

  const totalLotValue = (quantityQuintals || 0) * (expectedPrice || 0);

  const t = {
    title:
      lang === 'hi' ? 'स्थान व अपेक्षित मूल्य' : lang === 'mr' ? 'स्थान आणि अपेक्षित किंमत' : 'Farm Location & Market Price',
    subtitle:
      lang === 'hi'
        ? 'जीपीएस स्थान और मौजूदा मंडी भाव के आधार पर AI द्वारा अनुशंसित दर'
        : lang === 'mr'
        ? 'GPS स्थान आणि चालू बाजारभावानुसार AI ने सुचवलेला दर'
        : 'Location detection and dynamic APMC market benchmark price analysis.',
    locationTitle: lang === 'hi' ? 'फ़ार्म गेट स्थान' : lang === 'mr' ? 'शेत स्थान' : 'Farm Location (Pickup Gate)',
    gpsAuto: lang === 'hi' ? 'जीपीएस द्वारा पहचाना गया' : lang === 'mr' ? 'GPS द्वारे शोधले' : 'GPS Auto-Detected',
    editLocation: lang === 'hi' ? 'स्थान बदलें' : lang === 'mr' ? 'स्थान बदला' : 'Change Location',
    saveLocation: lang === 'hi' ? 'स्थान सुरक्षित करें' : lang === 'mr' ? 'स्थान जतन करा' : 'Save Location',
    marketRateTitle: lang === 'hi' ? 'वर्तमान मंडी भाव रेंज' : lang === 'mr' ? 'चालू बाजारभाव' : 'Current Market Rate Range',
    aiSuggestedTitle: lang === 'hi' ? 'AI अनुशंसित मूल्य' : lang === 'mr' ? 'AI सुचवलेली किंमत' : 'AI Suggested Expected Price',
    yourExpectedPrice:
      lang === 'hi' ? 'आपका अपेक्षित मूल्य (प्रति क्विंटल)' : lang === 'mr' ? 'तुमची अपेक्षित किंमत (प्रति क्विंटल)' : 'Your Expected Price (per Quintal)',
    lotValueTitle: lang === 'hi' ? 'कुल फ़सल अनुमानित मूल्य' : lang === 'mr' ? 'एकूण पिकाचे अंदाजित मूल्य' : 'Total Lot Valuation',
    disclaimer:
      lang === 'hi'
        ? 'नोट: AI मूल्य केवल क्षेत्रीय मंडी भाव और अनुमानित गुणवत्ता पर आधारित सलाह है। आप अपनी मर्जी से दर तय कर सकते हैं।'
        : lang === 'mr'
        ? 'टीप: AI किंमत केवळ चालू बाजारभाव आणि गुणवत्तेवर आधारित सल्ला आहे. आपण आपला दर स्वतः ठरवू शकता.'
        : 'Note: The AI suggested price is based on local APMC spot rates and visual grade assessment. You have full freedom to set your own expected price.',
    backBtn: lang === 'hi' ? '← मात्रा बदलें' : lang === 'mr' ? '← प्रमाण बदला' : '← Back',
    nextBtn:
      lang === 'hi' ? 'समीक्षा करें और पोस्ट करें →' : lang === 'mr' ? 'तपासा आणि पोस्ट करा →' : 'Review & Publish →',
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Step Banner */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Step 4: Location & Market Intelligence</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-['Outfit',sans-serif]">
          {t.title}
        </h2>
        <p className="text-xs text-slate-500">{t.subtitle}</p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
        {/* 1. Location Section */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black text-slate-900 font-['Outfit',sans-serif]">
                {t.locationTitle}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                {gpsStatus === 'detected' ? t.gpsAuto : 'Profile Location'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingLocation(!isEditingLocation)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>{isEditingLocation ? 'Cancel' : t.editLocation}</span>
            </button>
          </div>

          {!isEditingLocation ? (
            <div className="text-sm font-extrabold text-slate-900 flex items-center justify-between">
              <span>
                {locationVillage}, {district}, {state}
              </span>
              <button
                type="button"
                onClick={handleGpsRefresh}
                title="Refresh GPS"
                className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-200/60 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">State</label>
                  <select
                    value={tempState}
                    onChange={(e) => {
                      setTempState(e.target.value);
                      const districts = INDIAN_STATES[e.target.value] || [];
                      if (districts.length > 0) setTempDistrict(districts[0]);
                    }}
                    className="w-full text-xs font-medium p-2 rounded-xl bg-white border border-slate-300"
                  >
                    {Object.keys(INDIAN_STATES).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">District</label>
                  <select
                    value={tempDistrict}
                    onChange={(e) => setTempDistrict(e.target.value)}
                    className="w-full text-xs font-medium p-2 rounded-xl bg-white border border-slate-300"
                  >
                    {(INDIAN_STATES[tempState] || [district]).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Village / Town</label>
                  <input
                    type="text"
                    value={tempVillage}
                    onChange={(e) => setTempVillage(e.target.value)}
                    placeholder="Village name"
                    className="w-full text-xs font-medium p-2 rounded-xl bg-white border border-slate-300"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveLocation}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t.saveLocation}</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Live Market Intelligence Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              {t.marketRateTitle}
            </span>
            <div className="text-lg font-black text-slate-900 font-mono mt-1">
              ₹{priceAnalysis.min.toLocaleString('en-IN')} – ₹{priceAnalysis.max.toLocaleString('en-IN')}
              <span className="text-xs text-slate-500 font-normal"> / Qtl</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
              Ref: {priceAnalysis.mandiName}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                {t.aiSuggestedTitle}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-lg font-black text-emerald-950 font-mono mt-1">
              ₹{priceAnalysis.suggested.toLocaleString('en-IN')}
              <span className="text-xs text-emerald-800 font-normal"> / Qtl</span>
            </div>
            <span className="text-[11px] text-emerald-800 font-medium block mt-0.5">
              Based on {qualityGrade} quality assessment
            </span>
          </div>
        </div>

        {/* 3. Farmer Expected Price Input */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              {t.yourExpectedPrice}
            </label>
            <button
              type="button"
              onClick={() => onUpdateExpectedPrice(priceAnalysis.suggested)}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
            >
              Use AI Suggested (₹{priceAnalysis.suggested})
            </button>
          </div>

          <div className="relative flex items-center">
            <div className="absolute left-4 text-lg font-black text-slate-400">₹</div>
            <input
              type="number"
              min="500"
              max="50000"
              step="10"
              value={expectedPrice || ''}
              onChange={(e) => onUpdateExpectedPrice(Number(e.target.value))}
              placeholder="e.g. 2280"
              className="w-full text-xl sm:text-2xl font-black text-slate-900 py-3 pl-9 pr-24 rounded-2xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-mono"
            />
            <div className="absolute right-4 text-xs font-bold text-slate-500 bg-slate-200/80 px-2.5 py-1.5 rounded-xl pointer-events-none">
              / Quintal
            </div>
          </div>
        </div>

        {/* 4. Total Lot Estimated Valuation Banner */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              {t.lotValueTitle}
            </span>
            <span className="text-xs text-slate-300">
              {quantityQuintals} Qtl × ₹{expectedPrice || 0}/Qtl
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            ₹{totalLotValue.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Advisory Disclaimer */}
      <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">{t.disclaimer}</p>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backBtn}</span>
        </button>

        <Button
          variant="primary"
          size="md"
          onClick={onProceedToReview}
          disabled={!expectedPrice || expectedPrice <= 0}
          icon={<ArrowRight className="w-4 h-4" />}
          className="font-bold shadow-md shadow-emerald-600/20"
        >
          {t.nextBtn}
        </Button>
      </div>
    </div>
  );
};
