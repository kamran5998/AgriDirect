import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  ArrowRight,
  ShieldCheck,
  Wheat,
  Scale,
  MapPin,
  RefreshCw,
  Info,
  Calendar,
  Layers,
  Award,
  Tag,
  Check,
  Warehouse,
  Boxes,
  Percent,
} from 'lucide-react';
import { FarmerProfile } from '../../types';
import { Language, TRANSLATIONS, FarmerTab } from './types';
import { recommendationApi, RecommendationResponse } from '../../api/recommendationApi';
import { predictionApi, PricePredictionResponse } from '../../api/predictionApi';
import { useConnectivity } from '../../context/ConnectivityContext';
import { offlineStorage } from '../../services/offlineStorageService';
import { LastSyncedBadge } from '../common/LastSyncedBadge';
import {
  getCropRegistryEntry,
  MASTER_CROP_REGISTRY,
} from '../../utils/voiceLanguageParser';

interface AdvisorViewProps {
  profile: FarmerProfile;
  lang: Language;
  onNavigateTab: (tab: FarmerTab) => void;
  onSelectBuyerCrop?: (cropName: string) => void;
  onUpdateProfileCrops?: (
    crops: string[],
    volumes: Record<string, string>,
    state?: string,
    district?: string
  ) => void;
}

// Crop ID lookup for backend API
const CROP_ID_MAP: Record<string, number> = {
  wheat: 1,
  'wheat (sharbati)': 1,
  'wheat (lokwan)': 1,
  soybean: 2,
  'soybean (yellow)': 2,
  cotton: 3,
  'cotton (shankar-6)': 3,
  'basmati rice': 4,
  rice: 4,
  paddy: 4,
  mustard: 5,
  'mustard seed': 5,
  gram: 5,
  chana: 5,
  maize: 5,
  'red chili': 5,
  tomato: 5,
  onion: 5,
  turmeric: 5,
  potato: 5,
  apple: 5,
};

interface AdviceDataState {
  action: 'HOLD' | 'SELL';
  daysToWait: number;
  currentPrice: number;
  expectedPrice: number;
  priceRangeLower: number;
  priceRangeUpper: number;
  potentialGainPerQtl: number;
  potentialGainPercent: number;
  totalLotBenefit: number;
  confidenceRating: 'High' | 'Moderate';
  confidenceScore: number;
  sellingWindow: string;
  reasons: string[];
  bestMarketName: string;
  cropDisplayName: string;
  varietyDisplayName?: string;
  source: 'ml_live' | 'recommendation_engine' | 'benchmark';
}

export const AdvisorView: React.FC<AdvisorViewProps> = ({
  profile,
  lang,
  onNavigateTab,
  onUpdateProfileCrops,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Selected crop & variety state
  const initialCrop = profile.selectedCrops?.[0] || 'Wheat';
  const initialCropEntry = getCropRegistryEntry(initialCrop) || MASTER_CROP_REGISTRY[0];

  const [selectedCrop, setSelectedCrop] = useState<string>(initialCropEntry.canonicalName);
  const [selectedVariety, setSelectedVariety] = useState<string>(
    initialCropEntry.defaultVariety || initialCropEntry.varieties[0]?.name || ''
  );
  const [selectedQuantity, setSelectedQuantity] = useState<string>(
    profile.harvestVolumes?.[initialCrop] || profile.harvestVolume || '25'
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    profile.district || initialCropEntry.defaultMandi.district
  );
  const [selectedState, setSelectedState] = useState<string>(
    profile.state || initialCropEntry.defaultMandi.state
  );

  // UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [advice, setAdvice] = useState<AdviceDataState | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showVarietySelector, setShowVarietySelector] = useState<boolean>(false);

  // Feature 3: Storage-Aware Sell vs Hold State
  const [storageType, setStorageType] = useState<'ON_FARM' | 'WDRA_WAREHOUSE' | 'NO_STORAGE'>('ON_FARM');
  const [holdingDays, setHoldingDays] = useState<number>(7);

  const quantityNum = parseFloat(selectedQuantity) || 25;

  // Derive active Crop Profile from Master Registry
  const activeCropRegistry = useMemo(() => {
    return getCropRegistryEntry(selectedCrop) || MASTER_CROP_REGISTRY[0];
  }, [selectedCrop]);

  // Derive crop ID
  const cropId = useMemo(() => {
    const key = selectedCrop.toLowerCase().trim();
    for (const [name, id] of Object.entries(CROP_ID_MAP)) {
      if (key.includes(name) || name.includes(key)) {
        return id;
      }
    }
    return 1;
  }, [selectedCrop]);

  // Connectivity state
  const { isOffline } = useConnectivity();
  const [cachedTimestamp, setCachedTimestamp] = useState<number | null>(null);

  // Fetch prediction and recommendations
  const fetchAdvice = async () => {
    setLoading(true);
    setError(null);
    const cacheKey = `advisor_${cropId}_${selectedDistrict.toLowerCase().replace(/\s+/g, '_')}`;

    try {
      if (isOffline) {
        const cached = await offlineStorage.getCachedItem<AdviceDataState>(cacheKey);
        if (cached && cached.data) {
          setAdvice(cached.data);
          setCachedTimestamp(cached.lastUpdated);
          setLoading(false);
          return;
        }
      }

      // 1. Fetch market recommendations
      const recPromise = recommendationApi
        .getMarketRecommendations({
          crop_id: cropId,
          quantity_quintals: quantityNum,
          farmer_district: selectedDistrict,
          farmer_state: selectedState,
        })
        .catch(() => null);

      // 2. Fetch ML price prediction (7-day forecast)
      const predPromise = predictionApi.getPrediction(cropId, 1, 7).catch(() => null);

      const [recData, predData] = await Promise.all([recPromise, predPromise]);

      // Calculate synthesized advice
      const synthesized = buildAdvisorDecision(
        recData,
        predData,
        selectedCrop,
        selectedVariety,
        quantityNum,
        selectedDistrict,
        selectedState,
        lang
      );
      setAdvice(synthesized);
      const now = Date.now();
      setCachedTimestamp(now);
      await offlineStorage.setCachedItem(cacheKey, synthesized, 'server_live');
    } catch (err) {
      console.warn('Error fetching advisory, checking offline cache:', err);
      const cached = await offlineStorage.getCachedItem<AdviceDataState>(cacheKey);
      if (cached && cached.data) {
        setAdvice(cached.data);
        setCachedTimestamp(cached.lastUpdated);
      } else {
        const fallback = buildAdvisorDecision(
          null,
          null,
          selectedCrop,
          selectedVariety,
          quantityNum,
          selectedDistrict,
          selectedState,
          lang
        );
        setAdvice(fallback);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, [selectedCrop, selectedVariety, quantityNum, selectedDistrict, selectedState, lang, isOffline]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Voice Assistant TTS Handler (Speaks the active advice)
  const speakTextOutLoud = (textToSpeak: string, targetLang: Language) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = targetLang === 'hi' ? 'hi-IN' : targetLang === 'mr' ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleToggleVoiceAssistant = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!advice) return;

    let voiceText = '';
    const fullCropTitle = advice.varietyDisplayName
      ? `${advice.cropDisplayName} (${advice.varietyDisplayName})`
      : advice.cropDisplayName;

    if (lang === 'hi') {
      const actionText =
        advice.action === 'HOLD'
          ? `${advice.daysToWait} दिन रुकने की सलाह है।`
          : 'आज ही बेचने की सलाह है।';
      const gainText =
        advice.potentialGainPerQtl > 0
          ? `अनुमानित भाव ₹${advice.expectedPrice} प्रति क्विंटल है, जिससे प्रति क्विंटल ₹${advice.potentialGainPerQtl} का लाभ हो सकता है।`
          : `वर्तमान भाव ₹${advice.currentPrice} प्रति क्विंटल उच्चतम स्तर पर है।`;
      const reasonsText = advice.reasons.slice(0, 2).join('। ');

      voiceText = `${fullCropTitle} के लिए AI सलाह। ${actionText} ${gainText} मुख्य कारण: ${reasonsText}।`;
    } else if (lang === 'mr') {
      const actionText =
        advice.action === 'HOLD'
          ? `${advice.daysToWait} दिवस थांबण्याचा सल्ला आहे.`
          : 'आजच विकण्याचा सल्ला आहे.';
      const gainText =
        advice.potentialGainPerQtl > 0
          ? `अपेक्षित भाव ₹${advice.expectedPrice} प्रति क्विंटल असून प्रति क्विंटल ₹${advice.potentialGainPerQtl} चा नफा होऊ शकतो.`
          : `सध्याचा भाव ₹${advice.currentPrice} प्रति क्विंटल योग्य पातळीवर आहे.`;
      const reasonsText = advice.reasons.slice(0, 2).join('. ');

      voiceText = `${fullCropTitle} पिकासाठी AI सल्ला. ${actionText} ${gainText} कारणे: ${reasonsText}.`;
    } else {
      const actionText =
        advice.action === 'HOLD'
          ? `We recommend waiting ${advice.daysToWait} days.`
          : 'We recommend selling now today.';
      const gainText =
        advice.potentialGainPerQtl > 0
          ? `Expected price is ₹${advice.expectedPrice} per quintal, offering a potential gain of ₹${advice.potentialGainPerQtl} per quintal.`
          : `Current price of ₹${advice.currentPrice} per quintal is at its optimal rate.`;
      const reasonsText = advice.reasons.slice(0, 2).join('. ');

      voiceText = `AI Selling Advisor for ${fullCropTitle}. ${actionText} ${gainText} Key reasons: ${reasonsText}.`;
    }

    speakTextOutLoud(voiceText, lang);
  };

  // Switch crop
  const handleSelectCrop = (cropCanonicalName: string) => {
    const entry = getCropRegistryEntry(cropCanonicalName);
    if (!entry) return;

    setSelectedCrop(entry.canonicalName);
    const defaultVar = entry.defaultVariety || entry.varieties[0]?.name || '';
    setSelectedVariety(defaultVar);

    // Update parent profile if provided
    if (onUpdateProfileCrops) {
      onUpdateProfileCrops(
        [entry.canonicalName],
        { [entry.canonicalName]: selectedQuantity },
        entry.defaultMandi.state,
        entry.defaultMandi.district
      );
    }
  };

  // Switch variety
  const handleSelectVariety = (varietyName: string) => {
    setSelectedVariety(varietyName);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-12">
      {/* Top Active Crop & Variety Header Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold">
            <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <Wheat className="w-4 h-4 text-amber-400" />
              <span className="text-white font-extrabold">
                {activeCropRegistry.names[lang] || activeCropRegistry.canonicalName}
              </span>
            </span>

            {selectedVariety && (
              <span className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/40 text-xs font-semibold">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedVariety}</span>
              </span>
            )}

            <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <Scale className="w-4 h-4 text-sky-400" />
              <span>
                {selectedQuantity} {t.quintal}
              </span>
            </span>

            <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>
                {selectedDistrict}, {selectedState}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowVarietySelector((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 hover:bg-emerald-900/80 px-3 py-1.5 rounded-xl border border-emerald-500/30 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {lang === 'hi' ? 'किस्म / फसल बदलें' : lang === 'mr' ? 'वाण / पीक बदला' : 'Change Variety / Crop'}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Crop Switcher Pill Chips (Instant 1-Click for all registered crops) */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
            {lang === 'hi' ? 'त्वरित फसल चयन:' : lang === 'mr' ? 'त्वरित पीक निवड:' : 'Select Crop / Commodity:'}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {MASTER_CROP_REGISTRY.map((c) => {
              const isSelected = c.canonicalName === selectedCrop;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCrop(c.canonicalName)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  <span>{c.names[lang] || c.canonicalName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Specific Variety Selector Expansion */}
        {(showVarietySelector || (activeCropRegistry.varieties && activeCropRegistry.varieties.length > 1)) && (
          <div className="pt-2 border-t border-slate-800/80 bg-slate-950/40 p-3 rounded-2xl">
            <div className="text-[11px] font-bold text-emerald-400 mb-2 flex items-center justify-between">
              <span>
                {lang === 'hi'
                  ? `${activeCropRegistry.names.hi} की किस्में:`
                  : lang === 'mr'
                  ? `${activeCropRegistry.names.mr} चे वाण:`
                  : `${activeCropRegistry.canonicalName} Varieties:`}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                {lang === 'hi'
                  ? 'सटीक सलाह के लिए अपनी किस्म चुनें'
                  : lang === 'mr'
                  ? 'अचूक सल्ल्यासाठी वाण निवडा'
                  : 'Select exact variety for tailored rates'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {activeCropRegistry.varieties.map((v) => {
                const isVarSelected = v.name === selectedVariety;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSelectVariety(v.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isVarSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
                    }`}
                  >
                    {isVarSelected && <Check className="w-3 h-3 text-emerald-400" />}
                    <span>{v.names[lang] || v.name}</span>
                    {v.spotPriceBenchmark && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        (₹{v.spotPriceBenchmark})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-xs">
          <RefreshCw className="w-9 h-9 text-emerald-600 animate-spin mx-auto" />
          <div className="text-base font-extrabold text-slate-800">{t.loadingAdvisor}</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {lang === 'hi'
              ? `${selectedCrop} (${selectedVariety}) के लिए मंडी भाव, 7-दिवसीय मूल्य रुझान और मांग का विश्लेषण जारी है...`
              : lang === 'mr'
              ? `${selectedCrop} (${selectedVariety}) साठी बाजार भाव, ७-दिवसीय कल आणि मागणीचे विश्लेषण करत आहोत...`
              : `Analyzing spot rates, transit costs, and 7-day price curves for ${selectedCrop} (${selectedVariety})...`}
          </p>
        </div>
      )}

      {/* Error / Fallback State */}
      {!loading && error && (
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchAdvice}
            className="px-3 py-1 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 cursor-pointer shrink-0"
          >
            {t.retryButton}
          </button>
        </div>
      )}

      {!loading && advice && (
        <>
          {/* HERO SECTION: AI Selling Advisor Recommendation */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 relative overflow-hidden">
            {/* Top Row: Hero Title & Voice Action */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AgriDirect Intelligence</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-['Outfit',sans-serif] tracking-tight">
                  {t.aiSellingAdvisor}
                </h1>
              </div>

              {/* Action Buttons: Last Synced Badge + Voice Readout */}
              <div className="flex flex-wrap items-center gap-2">
                <LastSyncedBadge
                  timestamp={cachedTimestamp}
                  lang={lang}
                  isOffline={isOffline}
                  onRefresh={fetchAdvice}
                />

                {/* Voice Readout Button */}
                <button
                  type="button"
                  onClick={handleToggleVoiceAssistant}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow-xs ${
                    isSpeaking
                      ? 'bg-rose-500 text-white hover:bg-rose-600 animate-pulse'
                      : 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100 active:bg-emerald-200'
                  }`}
                  title={isSpeaking ? t.speakingNow : t.speakAdvice}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>{t.stopSpeaking}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-emerald-700" />
                      <span>{t.speakAdvice}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* LARGE HERO RECOMMENDATION BANNER */}
            <div
              className={`rounded-3xl p-6 sm:p-8 text-center transition-all ${
                advice.action === 'HOLD'
                  ? 'bg-gradient-to-b from-indigo-900 to-slate-950 text-white shadow-md'
                  : 'bg-gradient-to-b from-emerald-800 to-slate-950 text-white shadow-md'
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3 bg-white/10 text-white/90 border border-white/15">
                {advice.action === 'HOLD' ? (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span>Optimal Selling Timing</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Peak Selling Opportunity</span>
                  </>
                )}
              </div>

              {/* Large Text Display */}
              <div className="text-3xl sm:text-5xl font-black font-['Outfit',sans-serif] tracking-tight text-white mb-2">
                {advice.action === 'HOLD' ? (
                  lang === 'hi' ? (
                    `${advice.daysToWait} दिन रुकें (WAIT ${advice.daysToWait} DAYS)`
                  ) : lang === 'mr' ? (
                    `${advice.daysToWait} दिवस थांबा (WAIT ${advice.daysToWait} DAYS)`
                  ) : (
                    `WAIT ${advice.daysToWait} DAYS`
                  )
                ) : (
                  lang === 'hi' ? (
                    'आज ही बेचें (SELL NOW)'
                  ) : lang === 'mr' ? (
                    'आजच विका (SELL NOW)'
                  ) : (
                    'SELL NOW'
                  )
                )}
              </div>

              {/* Sub-headline explanation in Hero */}
              <p className="text-sm sm:text-base font-medium text-slate-200 max-w-xl mx-auto">
                {advice.action === 'HOLD' ? (
                  lang === 'hi'
                    ? `अनुमान है कि अगले ${advice.daysToWait} दिनों में भाव ₹${advice.potentialGainPerQtl}/क्विंटल तक बढ़ सकते हैं।`
                    : lang === 'mr'
                    ? `पुढील ${advice.daysToWait} दिवसांत दर ₹${advice.potentialGainPerQtl}/क्विंटलने वाढण्याची शक्यता आहे.`
                    : `Holding for ${advice.daysToWait} days is projected to earn you +₹${advice.potentialGainPerQtl}/quintal more.`
                ) : (
                  lang === 'hi'
                    ? 'वर्तमान भाव इस सप्ताह के उच्चतम स्तर पर हैं। आज बेचने से जोखिम मुक्त अधिकतम लाभ मिलेगा।'
                    : lang === 'mr'
                    ? 'सध्याचा दर या आठवड्यातील उच्चांकावर आहे. आज विकल्यास कमाल नफा मिळेल.'
                    : 'Current spot price and demand are at their peak. Selling today locks in optimal profit.'
                )}
              </p>

              {/* Total Lot Financial Benefit Pill */}
              {advice.totalLotBenefit > 0 && (
                <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-2xl bg-white/10 border border-white/20 text-xs sm:text-sm font-black text-amber-200">
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>
                    +₹{advice.totalLotBenefit.toLocaleString('en-IN')} {t.totalLotBenefit} ({quantityNum} Qtl)
                  </span>
                </div>
              )}
            </div>

            {/* CORE ADVISORY METRICS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-1">
              {/* Metric 1: Current Price */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {t.currentPriceLabel}
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-950 font-['Outfit',sans-serif] mt-1">
                  ₹{advice.currentPrice.toLocaleString('en-IN')}
                  <span className="text-xs font-bold text-slate-500 ml-1">/q</span>
                </div>
                <div className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                  {advice.bestMarketName}
                </div>
              </div>

              {/* Metric 2: Expected Price */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {t.expectedPriceLabel}
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-700 font-['Outfit',sans-serif] mt-1">
                  ₹{advice.expectedPrice.toLocaleString('en-IN')}
                  <span className="text-xs font-bold text-emerald-600 ml-1">/q</span>
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Target modal rate
                </div>
              </div>

              {/* Metric 3: Potential Gain / Loss */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {t.potentialGainLossLabel}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  {advice.potentialGainPerQtl >= 0 ? (
                    <span className="text-xl sm:text-2xl font-black text-emerald-700 font-['Outfit',sans-serif] flex items-center gap-1">
                      <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
                      +₹{advice.potentialGainPerQtl}
                    </span>
                  ) : (
                    <span className="text-xl sm:text-2xl font-black text-rose-700 font-['Outfit',sans-serif] flex items-center gap-1">
                      <TrendingDown className="w-5 h-5 text-rose-600 shrink-0" />
                      -₹{Math.abs(advice.potentialGainPerQtl)}
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-600">
                    ({advice.potentialGainPercent >= 0 ? `+${advice.potentialGainPercent}%` : `${advice.potentialGainPercent}%`})
                  </span>
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Per quintal difference
                </div>
              </div>

              {/* Metric 4: Expected Price Range */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {t.priceRangeLabel}
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 font-['Outfit',sans-serif] mt-1">
                  ₹{advice.priceRangeLower.toLocaleString('en-IN')} – ₹{advice.priceRangeUpper.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Confidence band (₹/q)
                </div>
              </div>

              {/* Metric 5: Confidence */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {t.confidenceLabel}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>
                      {advice.confidenceRating === 'High' ? t.highConfidence : t.moderateConfidence} ({advice.confidenceScore}%)
                    </span>
                  </span>
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Based on regional data fit
                </div>
              </div>

              {/* Metric 6: Recommended Selling Window */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {t.sellingWindowLabel}
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 font-['Outfit',sans-serif] mt-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{advice.sellingWindow}</span>
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Best window for dispatch
                </div>
              </div>
            </div>

            {/* SECTION: "WHY?" - EXPLAINABLE REASONS */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                  ?
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-950 font-['Outfit',sans-serif]">
                  {t.whyHeading}
                </h2>
              </div>

              {/* 3-4 Plain Language Understandable Bullet Reasons */}
              <div className="space-y-2.5">
                {advice.reasons.map((reason, index) => (
                  <div
                    key={index}
                    className="bg-slate-50/90 rounded-2xl p-3.5 sm:p-4 border border-slate-200/70 flex items-start gap-3 transition-colors hover:bg-slate-100/70"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                      {reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* FEATURE 3: STORAGE-AWARE SELL VS HOLD DECISION ENGINE & SIMULATOR */}
            {(() => {
              const storageCostPerDay = storageType === 'WDRA_WAREHOUSE' ? 0.60 : storageType === 'ON_FARM' ? 0.35 : 0;
              const storageCostTotal = Math.round(storageCostPerDay * holdingDays * quantityNum);
              const shrinkageLossRate = storageType === 'WDRA_WAREHOUSE' ? 0.002 : storageType === 'ON_FARM' ? 0.008 : 0.035;
              const shrinkageLossAmount = Math.round(advice.expectedPrice * shrinkageLossRate * quantityNum);
              const grossGainTotal = Math.max(0, (advice.expectedPrice - advice.currentPrice) * quantityNum);
              const netGainAfterStorageTotal = grossGainTotal - storageCostTotal - shrinkageLossAmount;
              const isStorageProfitable = netGainAfterStorageTotal > 0 && advice.action === 'HOLD';

              return (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-black text-xs">
                        <Warehouse className="w-3.5 h-3.5" />
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-slate-950 font-['Outfit',sans-serif]">
                        {t.storageAdvisorTitle}
                      </h2>
                    </div>

                    {/* Viability Verdict Badge */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${
                      isStorageProfitable
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                        : 'bg-amber-100 text-amber-950 border-amber-300'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isStorageProfitable ? t.storageViabilityProfitable : t.storageViabilitySellNow}</span>
                    </span>
                  </div>

                  {/* Storage Type & Horizon Controls */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-3.5">
                    
                    {/* Storage Type Selector */}
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-2">
                        {lang === 'en' ? 'Select Storage Facility:' : lang === 'hi' ? 'भंडारण सुविधा चुनें:' : 'साठवणूक प्रकार निवडा:'}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setStorageType('ON_FARM')}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            storageType === 'ON_FARM'
                              ? 'bg-white border-emerald-600 shadow-xs ring-1 ring-emerald-500'
                              : 'bg-slate-100/80 border-slate-200 text-slate-700 hover:bg-white'
                          }`}
                        >
                          <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <Boxes className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{t.onFarmStorageType}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">₹10.5/q/mo • 0.8% loss</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStorageType('WDRA_WAREHOUSE')}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            storageType === 'WDRA_WAREHOUSE'
                              ? 'bg-white border-emerald-600 shadow-xs ring-1 ring-emerald-500'
                              : 'bg-slate-100/80 border-slate-200 text-slate-700 hover:bg-white'
                          }`}
                        >
                          <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <Warehouse className="w-3.5 h-3.5 text-sky-600" />
                            <span>{t.warehouseStorageType}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">₹18/q/mo • e-NWR Safe</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStorageType('NO_STORAGE')}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            storageType === 'NO_STORAGE'
                              ? 'bg-white border-rose-600 shadow-xs ring-1 ring-rose-500'
                              : 'bg-slate-100/80 border-slate-200 text-slate-700 hover:bg-white'
                          }`}
                        >
                          <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>{lang === 'en' ? 'No Storage / Open Field' : lang === 'hi' ? 'खुले में / बिना गोदाम' : 'विना साठवणूक'}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">₹0 rent • High Spoilage Risk</div>
                        </button>
                      </div>
                    </div>

                    {/* Holding Horizon Selector */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                      <span className="text-xs font-bold text-slate-700">
                        {lang === 'en' ? 'Planned Holding Duration:' : lang === 'hi' ? 'रुकने की अवधि:' : 'थांबण्याचा कालावधी:'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {[7, 15, 30].map((days) => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => setHoldingDays(days)}
                            className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                              holdingDays === days
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            {days} {lang === 'en' ? 'Days' : lang === 'hi' ? 'दिन' : 'दिवस'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Net Financial Payoff Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-500">{t.projectedGrossGain}</div>
                        <div className="text-sm font-black text-emerald-700 mt-0.5">+₹{grossGainTotal.toLocaleString('en-IN')}</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-500">{t.holdingCostLabel}</div>
                        <div className="text-sm font-black text-slate-800 mt-0.5">-₹{storageCostTotal.toLocaleString('en-IN')}</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-500">
                          {lang === 'en' ? 'Moisture/Loss' : lang === 'hi' ? 'वजन / नमी कटौती' : 'घट / ओलावा'}
                        </div>
                        <div className="text-sm font-black text-rose-700 mt-0.5">-₹{shrinkageLossAmount.toLocaleString('en-IN')}</div>
                      </div>

                      <div className={`p-2.5 rounded-xl border ${
                        netGainAfterStorageTotal > 0 ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'
                      }`}>
                        <div className="text-[10px] font-black text-slate-700">{t.netGainAfterStorage}</div>
                        <div className={`text-sm font-black mt-0.5 ${netGainAfterStorageTotal > 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
                          {netGainAfterStorageTotal >= 0 ? `+₹${netGainAfterStorageTotal.toLocaleString('en-IN')}` : `-₹${Math.abs(netGainAfterStorageTotal).toLocaleString('en-IN')}`}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}

            {/* CLEAR STATISTICAL ADVISORY DISCLAIMER */}
            <div className="pt-2">
              <div className="bg-slate-100/80 rounded-2xl p-3.5 border border-slate-200/80 flex items-start gap-2.5 text-slate-600 text-xs">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">{t.aiDisclaimer}</p>
              </div>
            </div>
          </div>

          {/* PRIMARY ACTION CTA: "Find Verified Buyers" */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigateTab('buyers')}
              className="w-full py-4 sm:py-4.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer group"
            >
              <span>{t.findVerifiedBuyers}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="text-center text-xs text-slate-500 font-medium pt-2">
              {lang === 'hi'
                ? `सीधे प्रमाणित मिलर्स और थोक खरीदारों से ${selectedCrop} का सौदा पक्का करें।`
                : lang === 'mr'
                ? `थेट नोंदणीकृत खरेदीदारांशी ${selectedCrop} चा व्यवहार करा.`
                : `Connect directly with verified corporate buyers for ${selectedCrop}.`}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Builds clean, explainable selling advice from recommendation + ML prediction data.
 * Pure logic without leaking formulas or complex ML terms.
 */
function buildAdvisorDecision(
  recData: RecommendationResponse | null,
  predData: PricePredictionResponse | null,
  cropName: string,
  varietyName: string,
  quantityNum: number,
  district: string,
  state: string,
  lang: Language
): AdviceDataState {
  const cropEntry = getCropRegistryEntry(cropName) || MASTER_CROP_REGISTRY[0];
  const varietyEntry = cropEntry.varieties.find((v) => v.name === varietyName) || cropEntry.varieties[0];

  const topRec = recData?.recommendations?.[0];
  const benchmarkSpot = varietyEntry?.spotPriceBenchmark || cropEntry.spotPriceBenchmark;
  const spotPrice = topRec?.spot_price_per_qtl || recData?.regional_benchmark_spot_price || benchmarkSpot;
  const bestMandiName = topRec?.market_name || `${district} Mandi Yard`;

  // Determine action & target price
  let predictedPrice = spotPrice;
  let rangeLower = Math.round(spotPrice * 0.98);
  let rangeUpper = Math.round(spotPrice * 1.02);
  let confidenceScore = 88;
  let confidenceRating: 'High' | 'Moderate' = 'High';
  let daysToWait = cropEntry.daysToWait || 3;
  let action: 'HOLD' | 'SELL' = cropEntry.defaultAction || 'HOLD';

  if (predData && predData.has_sufficient_data && predData.predicted_price) {
    predictedPrice = Number(predData.predicted_price);
    rangeLower = Number(predData.predicted_range?.lower_bound) || Math.round(predictedPrice * 0.98);
    rangeUpper = Number(predData.predicted_range?.upper_bound) || Math.round(predictedPrice * 1.02);
    confidenceScore = Math.round(predData.model_confidence_score) || 88;
    confidenceRating = predData.model_confidence_rating?.toLowerCase().includes('high') ? 'High' : 'Moderate';
    daysToWait = predData.horizon_days || 3;

    if (predictedPrice - spotPrice >= 30) {
      action = 'HOLD';
    } else {
      action = 'SELL';
      daysToWait = 0;
    }
  } else {
    action = cropEntry.defaultAction;
    daysToWait = cropEntry.daysToWait;
    if (action === 'HOLD') {
      predictedPrice = spotPrice + (cropEntry.gainPerQtl || 90);
      rangeLower = spotPrice + Math.round((cropEntry.gainPerQtl || 90) * 0.6);
      rangeUpper = spotPrice + Math.round((cropEntry.gainPerQtl || 90) * 1.4);
    } else {
      predictedPrice = spotPrice;
      rangeLower = spotPrice - 20;
      rangeUpper = spotPrice + 15;
    }
  }

  const potentialGainPerQtl = action === 'HOLD' ? Math.max(0, predictedPrice - spotPrice) : 0;
  const potentialGainPercent =
    spotPrice > 0 ? parseFloat(((potentialGainPerQtl / spotPrice) * 100).toFixed(1)) : 0;
  const totalLotBenefit = Math.round(potentialGainPerQtl * quantityNum);

  // Selling Window Text
  let sellingWindow = 'In next 3-5 days';
  if (action === 'SELL') {
    sellingWindow = lang === 'hi' ? 'आज (तुरंत)' : lang === 'mr' ? 'आज (तातडीने)' : 'Today (Immediate)';
  } else {
    sellingWindow =
      lang === 'hi'
        ? `अगले ${daysToWait} से ${daysToWait + 2} दिनों में`
        : lang === 'mr'
        ? `पुढील ${daysToWait} ते ${daysToWait + 2} दिवसांत`
        : `In next ${daysToWait}-${daysToWait + 2} days`;
  }

  // Retrieve crop/variety specific plain-language reasons
  const cropReasons = cropEntry.reasons[lang] || cropEntry.reasons.en;
  const reasons = [...cropReasons];

  return {
    action,
    daysToWait,
    currentPrice: spotPrice,
    expectedPrice: predictedPrice,
    priceRangeLower: rangeLower,
    priceRangeUpper: rangeUpper,
    potentialGainPerQtl,
    potentialGainPercent,
    totalLotBenefit,
    confidenceRating,
    confidenceScore,
    sellingWindow,
    reasons,
    bestMarketName: bestMandiName,
    cropDisplayName: cropEntry.names[lang] || cropEntry.canonicalName,
    varietyDisplayName: varietyEntry?.names[lang] || varietyEntry?.name,
    source: predData?.has_sufficient_data ? 'ml_live' : 'recommendation_engine',
  };
}

export default AdvisorView;
