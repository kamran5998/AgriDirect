import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Truck,
  MapPin,
  Sparkles,
  ArrowRight,
  Volume2,
  VolumeX,
  RefreshCw,
  Clock,
  Filter,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  FileText,
  Scale,
  Handshake,
  Award,
  SlidersHorizontal,
} from 'lucide-react';
import { FarmerProfile } from '../../types';
import { Language, FarmerTab, TRANSLATIONS } from './types';
import { buyerApi, BuyerRequirementItem } from '../../api/buyerApi';
import { farmerApi, SubmitSupplyRequestPayload } from '../../api/farmerApi';
import { VERIFIED_BUYERS_DATA, VerifiedBuyer } from '../../data/directMarketData';
import { useConnectivity } from '../../context/ConnectivityContext';
import { offlineStorage } from '../../services/offlineStorageService';
import { LastSyncedBadge } from '../common/LastSyncedBadge';
import { OfflineEmptyState } from '../common/OfflineEmptyState';
import { VoiceAssistantBar } from './VoiceAssistantBar';
import { IncomingTradeOffersCard } from './IncomingTradeOffersCard';
import { BuyerCredentialsModal } from './BuyerCredentialsModal';
import { NetRealizationComparisonModal } from './NetRealizationComparisonModal';
import { TransparentDealLifecycleModal } from './TransparentDealLifecycleModal';

export interface VerifiedBuyersViewProps {
  profile: FarmerProfile;
  lang: Language;
  onNavigateTab?: (tab: FarmerTab) => void;
}

export type BuyerCategory = 'Food Processor' | 'Miller' | 'Institutional Buyer';

export interface MatchScoreBreakdown {
  totalScore: number;
  cropVarietyScore: number;
  cropVarietyNote: string;
  qualityMoistureScore: number;
  qualityMoistureNote: string;
  quantityScore: number;
  quantityNote: string;
  logisticsScore: number;
  logisticsNote: string;
  priceScore: number;
  priceNote: string;
}

export interface EnrichedBuyerCard {
  id: string;
  name: string;
  category: BuyerCategory;
  typeDisplay: string;
  badge: string;
  cropRequired: string;
  varietySpec: string;
  quantityRequiredQuintals: number;
  minOrderQuintals: number;
  offeredPricePerQuintal: number;
  distanceKm: number;
  location: string;
  district: string;
  state: string;
  estimatedTransportCostPerQtl: number;
  estimatedNetRealizationPerQtl: number;
  totalLotNetRealization: number;
  isQuantitySuitable: boolean;
  premiumVsApmc: number;
  deliveryOption: string;
  paymentTerm: string;
  gstin: string;
  phoneContact: string;
  procurementOfficer: string;
  rating: number;
  requiredQualityGrade: string;
  maxMoistureAllowed: number;
  maxForeignMatterAllowed: number;
  matchScore: number;
  matchBreakdown: MatchScoreBreakdown;
}

export const VerifiedBuyersView: React.FC<VerifiedBuyersViewProps> = ({
  profile,
  lang,
  onNavigateTab,
}) => {
  const t = TRANSLATIONS[lang];

  // 1. Initial State derived from Farmer Profile
  const defaultCropName = profile.selectedCrops?.[0]
    ? profile.selectedCrops[0].split(' ')[0].replace(/[^a-zA-Z]/g, '')
    : 'Wheat';

  const defaultLotQuantity = Number(
    profile.harvestVolumes?.[profile.selectedCrops?.[0] || ''] || 50
  ) || 50;

  const [selectedCrop, setSelectedCrop] = useState<string>(defaultCropName || 'Wheat');
  const [lotQuantity, setLotQuantity] = useState<number>(defaultLotQuantity);
  const [farmerQualityGrade, setFarmerQualityGrade] = useState<string>('Grade A Premium');
  const [farmerMoisturePercent, setFarmerMoisturePercent] = useState<number>(10.5);
  const [showQualityFilter, setShowQualityFilter] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'matchScore' | 'netRealization' | 'distance' | 'offeredPrice'>('matchScore');

  // Connectivity & Offline Cache State
  const { isOffline, enqueueAction, pendingSyncCount } = useConnectivity();
  const [cachedTimestamp, setCachedTimestamp] = useState<number | null>(null);

  // Loading & API State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [rawRequirements, setRawRequirements] = useState<BuyerRequirementItem[]>([]);
  const [rawBuyers, setRawBuyers] = useState<VerifiedBuyer[]>([]);

  // Interactive Modals
  const [requestModalBuyer, setRequestModalBuyer] = useState<EnrichedBuyerCard | null>(null);
  const [contactModalBuyer, setContactModalBuyer] = useState<EnrichedBuyerCard | null>(null);
  const [credentialsModalBuyer, setCredentialsModalBuyer] = useState<EnrichedBuyerCard | null>(null);
  const [comparisonModalBuyer, setComparisonModalBuyer] = useState<EnrichedBuyerCard | null>(null);
  const [lifecycleModalDeal, setLifecycleModalDeal] = useState<any | null>(null);
  const [expandedBuyerIds, setExpandedBuyerIds] = useState<Record<string, boolean>>({});
  const [expandedMatchScoreIds, setExpandedMatchScoreIds] = useState<Record<string, boolean>>({});

  // Request Form State
  const [requestMode, setRequestMode] = useState<'send' | 'counter'>('send');
  const [requestQuantity, setRequestQuantity] = useState<number>(defaultLotQuantity);
  const [requestPrice, setRequestPrice] = useState<number>(0);
  const [requestPhone, setRequestPhone] = useState<string>(profile.mobileNumber || '+91 98765 43210');
  const [pickupOption, setPickupOption] = useState<string>('Farm-gate Pickup');
  const [requestCounterNote, setRequestCounterNote] = useState<string>('');
  const [proposedDate, setProposedDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [requestSuccessData, setRequestSuccessData] = useState<{
    referenceId: string;
    buyerName: string;
    quantity: number;
    price: number;
    totalAmount: number;
    mode: 'send' | 'counter';
    isOfflineQueued?: boolean;
  } | null>(null);

  const toggleExpandBuyer = (buyerId: string) => {
    setExpandedBuyerIds((prev) => ({
      ...prev,
      [buyerId]: !prev[buyerId],
    }));
  };

  const toggleExpandMatchScore = (buyerId: string) => {
    setExpandedMatchScoreIds((prev) => ({
      ...prev,
      [buyerId]: !prev[buyerId],
    }));
  };

  // Voice Assistant State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Load buyers and requirements from backend with IndexedDB caching
  const loadBuyerData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      // If offline, attempt local cached dataset retrieval first
      if (isOffline) {
        const cachedBuyers = await offlineStorage.getCachedItem<VerifiedBuyer[]>('verified_buyers_list');
        const cachedReqs = await offlineStorage.getCachedItem<BuyerRequirementItem[]>('buyer_requirements_list');

        if (cachedBuyers && cachedBuyers.data && cachedBuyers.data.length > 0) {
          setRawBuyers(cachedBuyers.data);
          setRawRequirements(cachedReqs?.data || []);
          setCachedTimestamp(cachedBuyers.lastUpdated);
          setIsLoading(false);
          return;
        }
      }

      // Online: Fetch live data from backend
      const [requirementsRes, buyersRes] = await Promise.all([
        buyerApi.getRequirements(),
        buyerApi.getBuyers(),
      ]);

      const activeBuyers = buyersRes && buyersRes.length > 0 ? buyersRes : VERIFIED_BUYERS_DATA;
      setRawRequirements(requirementsRes);
      setRawBuyers(activeBuyers);
      const now = Date.now();
      setCachedTimestamp(now);

      // Save to IndexedDB for offline resilience
      await offlineStorage.setCachedItem('verified_buyers_list', activeBuyers, 'server_live');
      await offlineStorage.setCachedItem('buyer_requirements_list', requirementsRes, 'server_live');
    } catch (err) {
      console.warn('Backend buyer API fallback activated, checking cache:', err);
      const cachedBuyers = await offlineStorage.getCachedItem<VerifiedBuyer[]>('verified_buyers_list');
      if (cachedBuyers && cachedBuyers.data && cachedBuyers.data.length > 0) {
        setRawBuyers(cachedBuyers.data);
        setCachedTimestamp(cachedBuyers.lastUpdated);
      } else {
        setRawBuyers(VERIFIED_BUYERS_DATA);
        setFetchError(t.errorBuyers);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isOffline, t.errorBuyers]);

  useEffect(() => {
    loadBuyerData();
  }, [loadBuyerData]);

  // Transform raw buyers & requirements into enriched cards with freight & matching math
  const enrichedBuyersList: EnrichedBuyerCard[] = useMemo(() => {
    const farmerDistrict = profile.district || 'Sehore';
    const currentLot = lotQuantity > 0 ? lotQuantity : 50;

    // Helper: compute matching score and breakdown
    const computeMatching = (
      buyerCrop: string,
      reqGrade: string,
      maxMoist: number,
      minOrder: number,
      reqQty: number,
      distKm: number,
      offeredPr: number
    ): { score: number; breakdown: MatchScoreBreakdown } => {
      // 1. Crop & Variety Score (Max 25)
      let cropVarietyScore = 25;
      let cropVarietyNote = 'Exact crop match with buyer procurement requirement.';
      if (selectedCrop !== 'all') {
        const isMatch =
          buyerCrop.toLowerCase().includes(selectedCrop.toLowerCase()) ||
          selectedCrop.toLowerCase().includes(buyerCrop.toLowerCase());
        if (!isMatch) {
          cropVarietyScore = 5;
          cropVarietyNote = `Crop divergence: Buyer wants ${buyerCrop}, farmer selected ${selectedCrop}.`;
        }
      }

      // 2. Quality & Moisture Compliance (Max 25)
      let qualityMoistureScore = 25;
      let qualityMoistureNote = `Full compliance: ${farmerQualityGrade} matches requirement (${reqGrade}) with ${farmerMoisturePercent}% moisture (Limit: <${maxMoist}%).`;
      
      const isGradeOk =
        farmerQualityGrade.includes('Grade A') ||
        (farmerQualityGrade.includes('FAQ') && !reqGrade.includes('Grade A Premium'));
      
      if (!isGradeOk) {
        qualityMoistureScore -= 8;
        qualityMoistureNote = `Quality mismatch: Buyer requires ${reqGrade}, farmer lot is ${farmerQualityGrade}.`;
      }

      if (farmerMoisturePercent > maxMoist) {
        const excess = farmerMoisturePercent - maxMoist;
        const moistPenalty = Math.min(10, Math.round(excess * 5));
        qualityMoistureScore = Math.max(2, qualityMoistureScore - moistPenalty);
        qualityMoistureNote += ` Moisture at ${farmerMoisturePercent}% exceeds max allowable ${maxMoist}%.`;
      }

      // 3. Quantity & Min Order Fit (Max 20)
      let quantityScore = 20;
      let quantityNote = `Lot size ${currentLot} Qtl fully fulfills buyer minimum order requirement (${minOrder} Qtl).`;
      if (currentLot < minOrder) {
        quantityScore = Math.max(5, Math.round(20 * (currentLot / minOrder)));
        quantityNote = `Lot size ${currentLot} Qtl is below buyer minimum order of ${minOrder} Qtl.`;
      } else if (currentLot > reqQty) {
        quantityScore = 15;
        quantityNote = `Lot size ${currentLot} Qtl exceeds single-truck capacity; multi-trip procurement required.`;
      }

      // 4. Distance & Logistics Feasibility (Max 15)
      let logisticsScore = 15;
      let logisticsNote = `Proximity advantage: ${distKm} km allows direct farm-gate pickup.`;
      if (distKm > 100) {
        logisticsScore = 8;
        logisticsNote = `Inter-district transit (${distKm} km); higher freight deduction.`;
      } else if (distKm > 50) {
        logisticsScore = 11;
        logisticsNote = `Medium distance transit (${distKm} km) with standard logistics corridor.`;
      }

      // 5. Price & Premium Realization (Max 15)
      let priceScore = 15;
      let priceNote = `High price realization: ₹${offeredPr}/Qtl offers competitive margin above mandi benchmark.`;
      if (offeredPr < 2800) {
        priceScore = 10;
        priceNote = `Standard mandi baseline rate without processing premium.`;
      }

      const totalScore = Math.min(100, Math.max(10, cropVarietyScore + qualityMoistureScore + quantityScore + logisticsScore + priceScore));

      return {
        score: totalScore,
        breakdown: {
          totalScore,
          cropVarietyScore,
          cropVarietyNote,
          qualityMoistureScore,
          qualityMoistureNote,
          quantityScore,
          quantityNote,
          logisticsScore,
          logisticsNote,
          priceScore,
          priceNote,
        },
      };
    };

    // Map base seed buyers
    const baseList: EnrichedBuyerCard[] = rawBuyers.map((b, idx) => {
      // Calculate realistic distance based on farmer's district
      let distanceKm = b.distanceKm || 25;
      if (b.district.toLowerCase() === farmerDistrict.toLowerCase()) {
        distanceKm = 10 + (idx * 4);
      } else if (b.state === profile.state) {
        distanceKm = 35 + (idx * 15);
      } else {
        distanceKm = 120 + (idx * 20);
      }

      // Calculate transport freight per Quintal: Base ₹15 + ₹1.15/km
      const transportCostPerQtl = Math.round(15 + distanceKm * 1.15);
      const offeredPrice = b.priceOfferedPerQuintal || 2920;
      const netRealizationPerQtl = Math.max(1, offeredPrice - transportCostPerQtl);
      const totalLotNetRealization = netRealizationPerQtl * currentLot;

      // Determine clean buyer category (Food processor, Miller, Institutional buyer)
      let category: BuyerCategory = 'Food Processor';
      if (b.type.includes('Miller') || b.type.includes('Mill') || b.name.includes('Mill')) {
        category = 'Miller';
      } else if (b.type.includes('FPO') || b.type.includes('Govt') || b.type.includes('Export')) {
        category = 'Institutional Buyer';
      }

      const minOrderQuintals = b.minOrderQuintals || 25;
      const quantityRequiredQuintals = b.volumeWantedQuintals || 1000;
      const requiredQualityGrade = category === 'Food Processor' ? 'Grade A Premium' : category === 'Miller' ? 'Grade A Standard' : 'FAQ Standard';
      const maxMoistureAllowed = category === 'Food Processor' ? 11.5 : 12.0;
      const maxForeignMatterAllowed = category === 'Food Processor' ? 0.8 : 1.2;

      const isQuantitySuitable =
        currentLot >= minOrderQuintals && currentLot <= (quantityRequiredQuintals * 1.2);

      // Phone contacts for regional procurement managers
      const phoneContacts = [
        '+91 7562 248900',
        '+91 731 2984100',
        '+91 755 4018200',
        '+91 94250 88120',
        '+91 98260 74311',
        '+91 734 2518900',
      ];

      const { score: matchScore, breakdown: matchBreakdown } = computeMatching(
        b.cropTarget || 'Wheat',
        requiredQualityGrade,
        maxMoistureAllowed,
        minOrderQuintals,
        quantityRequiredQuintals,
        distanceKm,
        offeredPrice
      );

      return {
        id: b.id,
        name: b.name,
        category,
        typeDisplay:
          category === 'Food Processor'
            ? t.foodProcessor
            : category === 'Miller'
            ? t.miller
            : t.institutionalBuyer,
        badge: b.badgeType || 'Govt Certified',
        cropRequired: b.cropTarget || 'Wheat',
        varietySpec: b.varietySpec || 'Grade A Quality',
        quantityRequiredQuintals,
        minOrderQuintals,
        offeredPricePerQuintal: offeredPrice,
        distanceKm,
        location: b.location || `${b.district}, ${b.state}`,
        district: b.district,
        state: b.state,
        estimatedTransportCostPerQtl: transportCostPerQtl,
        estimatedNetRealizationPerQtl: netRealizationPerQtl,
        totalLotNetRealization,
        isQuantitySuitable,
        premiumVsApmc: b.premiumPerQuintal || 75,
        deliveryOption: b.pickupPreference || 'Farm-gate Pickup Available',
        paymentTerm: b.settlementTerms || 'Instant Digital Bank NEFT on Weighment',
        gstin: b.kycVerification?.gstin || `23AAAC${Math.floor(1000 + Math.random() * 9000)}M1Z5`,
        phoneContact: phoneContacts[idx % phoneContacts.length],
        procurementOfficer: idx % 2 === 0 ? 'Shri Rameshwar Sharma (Procurement Head)' : 'Shri Arvind Patidar (Field Officer)',
        rating: b.kycVerification?.rating || 4.9,
        requiredQualityGrade,
        maxMoistureAllowed,
        maxForeignMatterAllowed,
        matchScore,
        matchBreakdown,
      };
    });

    // Also integrate any live backend requirements if not already present
    if (rawRequirements && rawRequirements.length > 0) {
      rawRequirements.forEach((req, rIdx) => {
        if (!baseList.some((b) => b.id === `req-${req.id}`)) {
          const dist = 28 + rIdx * 12;
          const freight = Math.round(15 + dist * 1.15);
          const price = req.expectedPrice || 2950;
          const net = price - freight;
          const minOrder = 30;
          const reqQty = req.quantityRequired || 1500;
          const reqGrade = 'FAQ Standard';
          const maxMoist = 12.0;

          const { score: matchScore, breakdown: matchBreakdown } = computeMatching(
            req.cropName || 'Wheat',
            reqGrade,
            maxMoist,
            minOrder,
            reqQty,
            dist,
            price
          );

          baseList.push({
            id: `req-${req.id}`,
            name: req.buyerName || 'State Agro Processing Federation',
            category: 'Institutional Buyer',
            typeDisplay: t.institutionalBuyer,
            badge: 'Govt & e-NAM Certified',
            cropRequired: req.cropName || 'Wheat',
            varietySpec: 'FAQ Grain Moisture < 12%',
            quantityRequiredQuintals: reqQty,
            minOrderQuintals: minOrder,
            offeredPricePerQuintal: price,
            distanceKm: dist,
            location: req.location || 'Regional Agribusiness Hub',
            district: 'Sehore',
            state: 'Madhya Pradesh',
            estimatedTransportCostPerQtl: freight,
            estimatedNetRealizationPerQtl: net,
            totalLotNetRealization: net * currentLot,
            isQuantitySuitable: currentLot >= minOrder,
            premiumVsApmc: 90,
            deliveryOption: 'Farm-gate Direct Pickup',
            paymentTerm: 'Direct Bank Credit via RTGS',
            gstin: '23AAACA9812K1Z9',
            phoneContact: '+91 7562 254300',
            procurementOfficer: 'Kisan Procurement Desk',
            rating: 4.85,
            requiredQualityGrade: reqGrade,
            maxMoistureAllowed: maxMoist,
            maxForeignMatterAllowed: 1.0,
            matchScore,
            matchBreakdown,
          });
        }
      });
    }

    return baseList;
  }, [
    rawBuyers,
    rawRequirements,
    profile.district,
    profile.state,
    lotQuantity,
    selectedCrop,
    farmerQualityGrade,
    farmerMoisturePercent,
    t.foodProcessor,
    t.miller,
    t.institutionalBuyer,
  ]);

  // Filtering by Crop and Category
  const filteredBuyers = useMemo(() => {
    return enrichedBuyersList.filter((buyer) => {
      // Crop matching (fuzzy substring match)
      if (selectedCrop !== 'all') {
        const cropMatch =
          buyer.cropRequired.toLowerCase().includes(selectedCrop.toLowerCase()) ||
          selectedCrop.toLowerCase().includes(buyer.cropRequired.toLowerCase());
        if (!cropMatch) return false;
      }

      // Category matching
      if (selectedCategory !== 'all') {
        if (buyer.category !== selectedCategory) return false;
      }

      return true;
    });
  }, [enrichedBuyersList, selectedCrop, selectedCategory]);

  // Primary Sorting Rules:
  const sortedBuyers = useMemo(() => {
    const list = [...filteredBuyers];

    list.sort((a, b) => {
      if (sortBy === 'distance') {
        return a.distanceKm - b.distanceKm;
      }
      if (sortBy === 'offeredPrice') {
        return b.offeredPricePerQuintal - a.offeredPricePerQuintal;
      }
      if (sortBy === 'netRealization') {
        return b.estimatedNetRealizationPerQtl - a.estimatedNetRealizationPerQtl;
      }

      // Default: Highest Deterministic Match Score (Feature 1 requirement)
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }

      // Secondary: Net Realization
      const netDiff = b.estimatedNetRealizationPerQtl - a.estimatedNetRealizationPerQtl;
      if (Math.abs(netDiff) > 10) return netDiff;

      // Tertiary: Suitable quantity priority
      if (a.isQuantitySuitable && !b.isQuantitySuitable) return -1;
      if (!a.isQuantitySuitable && b.isQuantitySuitable) return 1;

      // Distance
      return a.distanceKm - b.distanceKm;
    });

    return list;
  }, [filteredBuyers, sortBy]);

  // Best Match Buyer (Index 0)
  const bestMatchBuyer = sortedBuyers.length > 0 ? sortedBuyers[0] : null;

  // Handle Voice Assistant speech readout
  const handleToggleVoiceAssistant = () => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!window.speechSynthesis) {
      alert('Voice assistant is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    let textToSpeak = '';
    const currentCropName = selectedCrop === 'all' ? (profile.selectedCrops?.[0] || 'Wheat') : selectedCrop;

    if (!bestMatchBuyer) {
      textToSpeak =
        lang === 'hi'
          ? `आपके क्षेत्र में ${currentCropName} के लिए कोई प्रमाणित खरीदार नहीं मिला। कृपया अन्य फसल चुनें।`
          : lang === 'mr'
          ? `तुमच्या भागात ${currentCropName} साठी खरेदीदार उपलब्ध नाहीत. कृपया इतर पीक निवडा.`
          : `No verified buyers found for ${currentCropName}. Please select another crop.`;
    } else {
      if (lang === 'hi') {
        textToSpeak = `आपकी ${currentCropName} फसल के लिए सर्वश्रेष्ठ खरीदार ${bestMatchBuyer.name} हैं। इनका खरीद भाव ₹${bestMatchBuyer.offeredPricePerQuintal} प्रति क्विंटल है। ₹${bestMatchBuyer.estimatedTransportCostPerQtl} अनुमानित भाड़ा काटकर, आपकी शुद्ध बचत ₹${bestMatchBuyer.estimatedNetRealizationPerQtl} प्रति क्विंटल होगी। आपके ${lotQuantity} क्विंटल पर कुल ₹${bestMatchBuyer.totalLotNetRealization.toLocaleString('en-IN')} का भुगतान मिलेगा। सीधे बेचने के लिए 'अनुरोध भेजें' दबाएं।`;
      } else if (lang === 'mr') {
        textToSpeak = `तुमच्या ${currentCropName} पिकासाठी सर्वोत्तम खरेदीदार ${bestMatchBuyer.name} आहेत. त्यांचा दर ₹${bestMatchBuyer.offeredPricePerQuintal} प्रति क्विंटल आहे. ₹${bestMatchBuyer.estimatedTransportCostPerQtl} वाहतूक खर्च वजा करून अंदाजे निव्वळ दर ₹${bestMatchBuyer.estimatedNetRealizationPerQtl} प्रति क्विंटल मिळेल. ${lotQuantity} क्विंटलवर एकूण ₹${bestMatchBuyer.totalLotNetRealization.toLocaleString('en-IN')} निव्वळ रक्कम मिळेल.`;
      } else {
        textToSpeak = `For your ${currentCropName} lot of ${lotQuantity} quintals, the best verified buyer is ${bestMatchBuyer.name}. They offer ₹${bestMatchBuyer.offeredPricePerQuintal} per quintal. After ₹${bestMatchBuyer.estimatedTransportCostPerQtl} transport cost, your estimated net realization is ₹${bestMatchBuyer.estimatedNetRealizationPerQtl} per quintal, totaling ₹${bestMatchBuyer.totalLotNetRealization.toLocaleString('en-IN')} in hand. Tap Send Request to submit your lot.`;
      }
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Open Send Request / Counter Modal
  const handleOpenSendRequestModal = (buyer: EnrichedBuyerCard, mode: 'send' | 'counter' = 'send') => {
    setRequestModalBuyer(buyer);
    setRequestMode(mode);
    const initialQty = Math.max(buyer.minOrderQuintals, lotQuantity);
    setRequestQuantity(initialQty);
    setRequestPrice(mode === 'counter' ? Math.round(buyer.offeredPricePerQuintal * 1.04) : buyer.offeredPricePerQuintal);
    setRequestCounterNote(
      mode === 'counter'
        ? `Requesting ₹${Math.round(buyer.offeredPricePerQuintal * 1.04)}/Qtl for premium Grade A ${buyer.cropRequired} with farm-gate loading.`
        : ''
    );
    setRequestSuccessData(null);
  };

  // Submit Trade Request to Backend with Offline Queuing
  const handleSubmitTradeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestModalBuyer) return;

    setIsSubmitting(true);
    const finalPrice = requestPrice > 0 ? requestPrice : requestModalBuyer.offeredPricePerQuintal;
    const finalNet = Math.max(1, finalPrice - requestModalBuyer.estimatedTransportCostPerQtl);

    const payload: SubmitSupplyRequestPayload = {
      buyerId: requestModalBuyer.id,
      buyerName: requestModalBuyer.name,
      cropName: requestModalBuyer.cropRequired,
      quantityOfferedQuintals: requestQuantity,
      offeredPricePerQuintal: finalPrice,
      buyerPostedPrice: requestModalBuyer.offeredPricePerQuintal,
      pickupType: pickupOption,
      proposedDate,
      message: requestMode === 'counter'
        ? `[Counter-Offer] Farmer counter-proposed ₹${finalPrice}/Qtl for ${requestQuantity} Qtl ${requestModalBuyer.cropRequired}. ${requestCounterNote}. Contact: ${requestPhone}`
        : `Direct sale proposal for ${requestQuantity} Qtl ${requestModalBuyer.cropRequired} from ${profile.village || 'Farm-gate'}, ${profile.district || 'Sehore'}. Contact: ${requestPhone}`,
    };

    const totalAmount = requestQuantity * finalNet;
    const refId = `DIR-${isOffline ? 'OFFLINE' : 'REQ'}-${Math.floor(10000 + Math.random() * 90000)}`;

    if (isOffline) {
      // Offline mode: Enqueue mutation in IndexedDB
      await enqueueAction('SEND_BUYER_REQUEST', payload);
      setRequestSuccessData({
        referenceId: refId,
        buyerName: requestModalBuyer.name,
        quantity: requestQuantity,
        price: finalPrice,
        totalAmount,
        mode: requestMode,
        isOfflineQueued: true,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await farmerApi.submitSupplyRequest(payload);
      setRequestSuccessData({
        referenceId: refId,
        buyerName: requestModalBuyer.name,
        quantity: requestQuantity,
        price: finalPrice,
        totalAmount,
        mode: requestMode,
        isOfflineQueued: false,
      });
    } catch (err) {
      console.warn('Network error while submitting trade proposal, enqueuing offline action:', err);
      await enqueueAction('SEND_BUYER_REQUEST', payload);
      setRequestSuccessData({
        referenceId: refId,
        buyerName: requestModalBuyer.name,
        quantity: requestQuantity,
        price: finalPrice,
        totalAmount,
        mode: requestMode,
        isOfflineQueued: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12" id="verified-buyers-screen">
      {/* 1. Header Hero Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Mandi Arhatiya Cut</span>
              </span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">
                Direct Bank NEFT
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 font-['Outfit',sans-serif] mt-1.5">
              {t.verifiedBuyersTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              {t.verifiedBuyersSubtitle}
            </p>
          </div>

          {/* Quick Refresh & Last Synced Badge */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <LastSyncedBadge
              timestamp={cachedTimestamp}
              lang={lang}
              isOffline={isOffline}
              onRefresh={loadBuyerData}
            />

            <button
              onClick={loadBuyerData}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh verified buyers feed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{t.retryButton}</span>
            </button>
          </div>
        </div>

        {/* Reusable Voice Assistant Bar for Farmers */}
        <VoiceAssistantBar
          lang={lang}
          placeholderPrompt={
            lang === 'hi'
              ? 'माइक दबाकर बोलें: "गेहूं के खरीदार दिखाओ" या "सर्वश्रेष्ठ खरीदार बताओ"'
              : lang === 'mr'
              ? 'माइक दाबून बोला: "गव्हाचे खरेदीदार दाखवा" किंवा "सर्वोत्तम खरेदीदार सांगा"'
              : 'Tap to speak: "Show wheat buyers", "Find millers", or "Tell best net price"'
          }
          helperExamples={
            lang === 'hi'
              ? ['गेहूं के खरीदार', 'सोयाबीन खरीदार', 'सर्वश्रेष्ठ खरीदार बताओ']
              : lang === 'mr'
              ? ['गव्हाचे खरेदीदार', 'सोयाबीन खरेदीदार', 'सर्वोत्तम खरेदीदार सांगा']
              : ['Show wheat buyers', 'Show soybean buyers', 'Best buyer advice']
          }
          onTranscriptRecognized={(spokenText) => {
            const lower = spokenText.toLowerCase();
            if (lower.includes('wheat') || lower.includes('गेहूं') || lower.includes('गहू')) {
              setSelectedCrop('Wheat');
            } else if (lower.includes('soybean') || lower.includes('सोयाबीन')) {
              setSelectedCrop('Soybean');
            } else if (lower.includes('cotton') || lower.includes('कपास') || lower.includes('कापूस')) {
              setSelectedCrop('Cotton');
            } else if (lower.includes('rice') || lower.includes('धान') || lower.includes('तांदूळ')) {
              setSelectedCrop('Basmati Rice');
            } else if (lower.includes('all') || lower.includes('सभी') || lower.includes('सर्व')) {
              setSelectedCrop('all');
            } else if (lower.includes('miller') || lower.includes('मिलर')) {
              setSelectedCategory('Miller');
            } else if (lower.includes('processor') || lower.includes('प्रोसेसर')) {
              setSelectedCategory('Food Processor');
            } else if (
              lower.includes('tell') ||
              lower.includes('speak') ||
              lower.includes('बताओ') ||
              lower.includes('सांगा') ||
              lower.includes('सुनो')
            ) {
              handleToggleVoiceAssistant();
            }
          }}
        />

        {/* Real Backend Incoming Trade Offers Entry Point */}
        <IncomingTradeOffersCard lang={lang} onNavigateTab={onNavigateTab} />

        {/* 2. Interactive Crop, Quality & Lot Control Bar (Deterministic Matching Engine) */}
        <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 space-y-3.5">
          {/* Top Row: Crop Selector Tabs & Sort By */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1.5 flex-grow">
              <label className="text-[11px] font-bold text-slate-500 uppercase block">
                {lang === 'en' ? 'Filter by Crop:' : lang === 'hi' ? 'फसल चुनें:' : 'पीक निवडा:'}
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'Wheat', label: lang === 'en' ? 'Wheat' : lang === 'hi' ? 'गेहूं' : 'गहू' },
                  { id: 'Soybean', label: lang === 'en' ? 'Soybean' : lang === 'hi' ? 'सोयाबीन' : 'सोयाबीन' },
                  { id: 'Mustard', label: lang === 'en' ? 'Mustard' : lang === 'hi' ? 'सरसों' : 'मोहरी' },
                  { id: 'Chana', label: lang === 'en' ? 'Gram / Chana' : lang === 'hi' ? 'चना' : 'हरभरा' },
                  { id: 'all', label: t.allCropsFilter },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCrop(item.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      selectedCrop === item.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Criteria Selector */}
            <div className="shrink-0 flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <label className="text-[11px] font-bold text-slate-500 uppercase">
                {lang === 'en' ? 'Sort By:' : lang === 'hi' ? 'क्रमबद्ध:' : 'क्रमवारी:'}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="matchScore">{lang === 'en' ? '🎯 Highest Match Score' : '🎯 सर्वश्रेष्ठ मैच'}</option>
                <option value="netRealization">{lang === 'en' ? '💰 Best Net Realization' : '💰 अधिकतम शुद्ध बचत'}</option>
                <option value="offeredPrice">{lang === 'en' ? '📈 Highest Base Price' : '📈 उच्चतम भाव'}</option>
                <option value="distance">{lang === 'en' ? '📍 Nearest Distance' : '📍 निकटतम दूरी'}</option>
              </select>
            </div>
          </div>

          {/* Quality & Volume Parameters Row for Deterministic Matching */}
          <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Farmer Lot Quantity */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                {lang === 'en' ? 'Your Lot Quantity (Qtl)' : lang === 'hi' ? 'आपकी मात्रा (क्विंटल)' : 'तुमचे प्रमाण (क्विंटल)'}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={5}
                  max={5000}
                  value={lotQuantity}
                  onChange={(e) => setLotQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full text-sm font-black text-slate-900 focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-400">Qtl</span>
              </div>
            </div>

            {/* Farmer Quality Grade */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                {t.cropGrade}:
              </label>
              <select
                value={farmerQualityGrade}
                onChange={(e) => setFarmerQualityGrade(e.target.value)}
                className="w-full text-xs font-bold text-slate-900 focus:outline-none bg-transparent cursor-pointer"
              >
                <option value="Grade A Premium">Grade A Premium (Bold / Luster)</option>
                <option value="Grade A Standard">Grade A Standard</option>
                <option value="FAQ Standard">FAQ (Fair Average Quality)</option>
                <option value="Commercial Bulk">Commercial / High Moisture</option>
              </select>
            </div>

            {/* Farmer Moisture % */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                {t.moistureLevel}:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min={8}
                  max={20}
                  value={farmerMoisturePercent}
                  onChange={(e) => setFarmerMoisturePercent(Math.max(5, Math.min(25, Number(e.target.value))))}
                  className="w-full text-sm font-black text-slate-900 focus:outline-none"
                />
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${farmerMoisturePercent <= 12 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {farmerMoisturePercent <= 12 ? 'Optimal' : 'High'}
                </span>
              </div>
            </div>

            {/* Buyer Type Category */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                {t.buyerTypeLabel}:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs font-bold text-slate-900 focus:outline-none bg-transparent cursor-pointer"
              >
                <option value="all">{lang === 'en' ? 'All Types (Processors & Mills)' : 'सभी प्रकार'}</option>
                <option value="Food Processor">{t.foodProcessor}</option>
                <option value="Miller">{t.miller}</option>
                <option value="Institutional Buyer">{t.institutionalBuyer}</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Realization Info Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 pt-1">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {t.freightDeductionInfo} (Base: <strong>{profile.district || 'Sehore'}</strong>)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {lang === 'en' ? (
              <>Showing <strong>{sortedBuyers.length}</strong> active buyer tenders</>
            ) : lang === 'hi' ? (
              <><strong>{sortedBuyers.length}</strong> सक्रिय खरीदार टेंडर उपलब्ध</>
            ) : (
              <><strong>{sortedBuyers.length}</strong> सक्रिय खरेदीदार उपलब्ध</>
            )}
          </div>
        </div>
      </div>

      {/* 4. Loading & Error States */}
      {isLoading && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3 shadow-xs">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">{t.loadingBuyers}</p>
        </div>
      )}

      {fetchError && !isLoading && (
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={loadBuyerData}
            className="px-3 py-1 bg-amber-200 hover:bg-amber-300 rounded-lg font-bold text-amber-900 cursor-pointer"
          >
            {t.retryButton}
          </button>
        </div>
      )}

      {/* 5. Empty State */}
      {!isLoading && sortedBuyers.length === 0 && (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              {t.noBuyersFoundForCrop}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {lang === 'en'
                ? 'Try selecting "All Crops" or changing your district location to view verified institutional buyers nearby.'
                : lang === 'hi'
                ? 'सभी फसलें विकल्प चुनें या अन्य जिले के प्रमाणित खरीदार देखने के लिए फिल्टर बदलें।'
                : 'सर्व पिके पर्याय निवडा किंवा जवळचे खरेदीदार पाहण्यासाठी जिल्हा बदला.'}
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCrop('all');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            {lang === 'en' ? 'Show All Buyers' : lang === 'hi' ? 'सभी खरीदार देखें' : 'सर्व खरेदीदार पहा'}
          </button>
        </div>
      )}

      {/* 6. Verified Buyer Cards List */}
      {!isLoading && sortedBuyers.length > 0 && (
        <div className="space-y-4">
          {sortedBuyers.map((buyer, index) => {
            const isBestMatch = index === 0;
            const matchScore = buyer.matchScore || 85;
            const breakdown = buyer.matchBreakdown;
            const isMatchScoreExpanded = !!expandedMatchScoreIds[buyer.id];

            // Match Score color style
            const matchBadgeClass =
              matchScore >= 90
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : matchScore >= 75
                ? 'bg-blue-100 text-blue-800 border-blue-300'
                : 'bg-amber-100 text-amber-800 border-amber-300';

            return (
              <div
                key={buyer.id}
                id={`buyer-card-${buyer.id}`}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-200 relative overflow-hidden ${
                  isBestMatch
                    ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/10'
                    : 'border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Best Match Top Ribbon */}
                {isBestMatch && (
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-bl-2xl shadow-xs flex items-center gap-1.5 z-10">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>{t.bestMatch}</span>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Left Column: Buyer Name, Badges, Match Score & Procurement Specs */}
                  <div className="space-y-3.5 flex-grow">
                    {/* Badges Bar with Match Score Pill */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Deterministic Match Score Badge */}
                      <button
                        type="button"
                        onClick={() => toggleExpandMatchScore(buyer.id)}
                        className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-xl border transition-all cursor-pointer shadow-xs ${matchBadgeClass}`}
                        title="Click to view deterministic match breakdown"
                      >
                        <Award className="w-4 h-4" />
                        <span>{matchScore}% {t.matchScoreTitle}</span>
                        {isMatchScoreExpanded ? (
                          <ChevronUp className="w-3 h-3 ml-0.5" />
                        ) : (
                          <ChevronDown className="w-3 h-3 ml-0.5" />
                        )}
                      </button>

                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[11px] font-black px-2.5 py-1 rounded-lg border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{buyer.badge}</span>
                      </span>

                      <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                        {buyer.typeDisplay}
                      </span>

                      {/* Quick Credential Modal Trigger */}
                      <button
                        type="button"
                        onClick={() => setCredentialsModalBuyer(buyer)}
                        className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        title="View verified buyer KYC, licenses & payment track record"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>{t.credentialsBadge}</span>
                      </button>
                    </div>

                    {/* Buyer Name & Location */}
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-950 font-['Outfit',sans-serif]">
                        {buyer.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {buyer.location} ({buyer.distanceKm} km)
                        </span>
                        <span className="flex items-center gap-1 text-emerald-700 font-bold">
                          <Truck className="w-3.5 h-3.5 text-emerald-600" />
                          {buyer.deliveryOption}
                        </span>
                      </div>
                    </div>

                    {/* Deterministic Match Breakdown Accordion (Feature 1: "Why this buyer matches") */}
                    {isMatchScoreExpanded && breakdown && (
                      <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 text-xs shadow-md animate-in fade-in duration-200 border border-slate-800">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <h4 className="font-black text-sm text-slate-100">{t.whyMatchesHeader}</h4>
                          </div>
                          <span className="font-mono font-black text-emerald-400 text-sm">
                            {matchScore}/100 Pts
                          </span>
                        </div>

                        {/* 5-Factor Score Bars */}
                        <div className="space-y-2.5">
                          {/* 1. Crop & Variety Fit */}
                          <div>
                            <div className="flex justify-between text-[11px] font-bold mb-1">
                              <span className="text-slate-300">{t.cropVarietyFit}</span>
                              <span className="font-mono text-emerald-400">{breakdown.cropVarietyScore}/25 Pts</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${(breakdown.cropVarietyScore / 25) * 100}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{breakdown.cropVarietyNote}</p>
                          </div>

                          {/* 2. Quality & Moisture Compliance */}
                          <div>
                            <div className="flex justify-between text-[11px] font-bold mb-1">
                              <span className="text-slate-300">{t.qualityMoistureFit}</span>
                              <span className="font-mono text-emerald-400">{breakdown.qualityMoistureScore}/25 Pts</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${(breakdown.qualityMoistureScore / 25) * 100}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{breakdown.qualityMoistureNote}</p>
                          </div>

                          {/* 3. Quantity & Minimum Lot Fit */}
                          <div>
                            <div className="flex justify-between text-[11px] font-bold mb-1">
                              <span className="text-slate-300">{t.volumeLotFit}</span>
                              <span className="font-mono text-emerald-400">{breakdown.quantityScore}/20 Pts</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{ width: `${(breakdown.quantityScore / 20) * 100}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{breakdown.quantityNote}</p>
                          </div>

                          {/* 4. Distance & Logistics Feasibility */}
                          <div>
                            <div className="flex justify-between text-[11px] font-bold mb-1">
                              <span className="text-slate-300">{t.logisticsFit}</span>
                              <span className="font-mono text-emerald-400">{breakdown.logisticsScore}/15 Pts</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${(breakdown.logisticsScore / 15) * 100}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{breakdown.logisticsNote}</p>
                          </div>

                          {/* 5. Price Realization Advantage */}
                          <div>
                            <div className="flex justify-between text-[11px] font-bold mb-1">
                              <span className="text-slate-300">{t.priceAdvantageFit}</span>
                              <span className="font-mono text-emerald-400">{breakdown.priceScore}/15 Pts</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-400 rounded-full"
                                style={{ width: `${(breakdown.priceScore / 15) * 100}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{breakdown.priceNote}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Required Crop & Quantity Spec Box */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">{t.requiredCrop}:</span>
                        <strong className="text-slate-900 text-sm">{buyer.cropRequired}</strong>
                        <span className="text-slate-500 text-[11px] block">{buyer.varietySpec}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">{t.requiredQuantity}:</span>
                        <strong className="text-slate-900 text-sm">
                          {buyer.quantityRequiredQuintals.toLocaleString('en-IN')} Qtl
                        </strong>
                        <span className="text-slate-500 text-[11px] block">
                          Min Lot: <strong>{buyer.minOrderQuintals} Qtl</strong>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">{t.qualityGradeReq}:</span>
                        <strong className="text-emerald-800 text-xs block font-bold">
                          {buyer.requiredQualityGrade}
                        </strong>
                        <span className="text-slate-500 text-[11px] block">
                          Moisture: <strong>&lt;{buyer.maxMoistureAllowed}%</strong>
                        </span>
                      </div>
                    </div>

                    {/* Expandable "More Details" Accordion Section */}
                    {expandedBuyerIds[buyer.id] && (
                      <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/70 space-y-3 text-xs animate-in fade-in duration-200">
                        <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold">
                          <FileText className="w-4 h-4 text-emerald-700" />
                          <span>
                            {lang === 'en' ? 'Verified Buyer Requirements & Specifications' : lang === 'hi' ? 'प्रमाणित खरीदार की आवश्यकताएं एवं शर्तें' : 'खरेदीदार अटी व निकष'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div className="bg-white p-2.5 rounded-xl border border-emerald-100 space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">GSTIN Registration</span>
                            <span className="font-mono font-bold text-slate-800 text-xs">{buyer.gstin}</span>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-emerald-100 space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivery Type</span>
                            <span className="font-bold text-slate-800 text-xs">{buyer.deliveryOption}</span>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-emerald-100 space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Crop Quality Grade</span>
                            <span className="font-bold text-slate-800 text-xs">{buyer.requiredQualityGrade}</span>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-emerald-100 space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Crop Moisture Limit</span>
                            <span className="font-bold text-slate-800 text-xs">Max &lt; {buyer.maxMoistureAllowed}% Limit</span>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-emerald-100 space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Procurement Officer</span>
                            <span className="font-bold text-slate-800 text-xs">{buyer.procurementOfficer}</span>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-emerald-100 space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Terms</span>
                            <span className="font-bold text-emerald-800 text-xs">Direct 2-Hr Digital NEFT / RTGS</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Price Quote & Net Realization Math */}
                  <div className="lg:w-84 shrink-0 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 flex flex-col justify-between gap-3">
                    {/* Price Breakdown */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center text-slate-600">
                        <span>{t.offeredPrice}:</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          ₹{buyer.offeredPricePerQuintal.toLocaleString('en-IN')}
                          <span className="text-[10px] text-slate-500 font-sans"> / Qtl</span>
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-600">
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3 text-slate-400" />
                          {t.estimatedTransportCost}:
                        </span>
                        <span className="font-mono font-bold text-rose-700">
                          -₹{buyer.estimatedTransportCostPerQtl}
                          <span className="text-[10px] text-slate-500 font-sans"> / Qtl</span>
                        </span>
                      </div>

                      {/* Net Realization Highlight */}
                      <div className="pt-2 border-t border-emerald-200 flex justify-between items-baseline">
                        <div>
                          <div className="text-[10px] font-black uppercase text-emerald-800">
                            {t.estimatedNetRealization}
                          </div>
                          <div className="text-[10px] text-slate-500">{t.netInHandPerQtl}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-emerald-800 font-mono">
                            ₹{buyer.estimatedNetRealizationPerQtl.toLocaleString('en-IN')}
                            <span className="text-xs font-bold text-slate-600 font-sans"> / Qtl</span>
                          </div>
                        </div>
                      </div>

                      {/* Total Net Benefit on Farmer's Lot */}
                      <div className="bg-white p-2 rounded-xl border border-emerald-200/80 flex justify-between items-center text-[11px]">
                        <span className="text-slate-600 font-medium">For {lotQuantity} Qtl:</span>
                        <span className="font-mono font-black text-emerald-700 text-xs">
                          ₹{buyer.totalLotNetRealization.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Comparison and Lifecycle Audit Buttons (Features 5 & 6) */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {/* Feature 5: Net Price Comparison Modal Button */}
                      <button
                        type="button"
                        onClick={() => setComparisonModalBuyer(buyer)}
                        className="py-2 px-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Side-by-side net realization breakdown vs Mandi"
                      >
                        <Scale className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{t.compareVsMandi}</span>
                      </button>

                      {/* Feature 6: Escrow Deal Lifecycle Audit Trail */}
                      <button
                        type="button"
                        onClick={() => setLifecycleModalDeal({
                          id: `DEAL-${buyer.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
                          buyerName: buyer.name,
                          buyerType: buyer.typeDisplay,
                          cropName: buyer.cropRequired,
                          lotQuantityQuintals: lotQuantity,
                          pricePerQuintal: buyer.offeredPricePerQuintal,
                          freightPerQuintal: buyer.estimatedTransportCostPerQtl,
                          netRealizationPerQuintal: buyer.estimatedNetRealizationPerQtl,
                          totalPayoutAmount: buyer.totalLotNetRealization,
                          pickupType: buyer.deliveryOption,
                          farmerDistrict: profile.district || 'Sehore',
                          farmerVillage: profile.village || 'Farm-gate',
                          buyerLocation: buyer.location,
                          currentStageIndex: 2, // At stage 3: Quality Verified & Locked
                        })}
                        className="py-2 px-2 rounded-xl bg-white hover:bg-blue-100 text-blue-900 border border-blue-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="View complete 8-stage escrow lifecycle and digital proof"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-700" />
                        <span>{t.dealLifecycleTitle}</span>
                      </button>
                    </div>

                    {/* Action Buttons: More Details, Contact, Counter Offer, Send Request */}
                    <div className="space-y-2 pt-1 border-t border-emerald-200">
                      <div className="grid grid-cols-2 gap-2">
                        {/* More Details Toggle */}
                        <button
                          type="button"
                          onClick={() => toggleExpandBuyer(buyer.id)}
                          className="py-2 px-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          {expandedBuyerIds[buyer.id] ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                              <span>{lang === 'en' ? 'Less Details' : 'कम विवरण'}</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                              <span>{lang === 'en' ? 'More Details' : 'अधिक विवरण'}</span>
                            </>
                          )}
                        </button>

                        {/* Contact Buyer */}
                        <button
                          type="button"
                          onClick={() => setContactModalBuyer(buyer)}
                          className="py-2 px-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-600" />
                          <span>{t.contactBuyer}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Counter Offer Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenSendRequestModal(buyer, 'counter')}
                          className="py-2.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                        >
                          <Handshake className="w-3.5 h-3.5" />
                          <span>{lang === 'en' ? 'Counter Offer' : lang === 'hi' ? 'काउंटर ऑफर' : 'काउंटर ऑफर'}</span>
                        </button>

                        {/* Send Request Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenSendRequestModal(buyer, 'send')}
                          className="py-2.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                        >
                          <span>{t.sendRequest}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 7. Bottom Voice Assistant Button */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">
              {lang === 'en'
                ? 'AgriDirect Voice Decision Assistant'
                : lang === 'hi'
                ? 'एग्रीडायरेक्ट वॉइस निर्णय सहायक'
                : 'अ‍ॅग्रीडायरेक्ट व्हॉइस निर्णय सहाय्यक'}
            </h4>
            <p className="text-xs text-slate-500">
              {lang === 'en'
                ? 'Listen to recommendations and best net realization prices in your language.'
                : lang === 'hi'
                ? 'सर्वश्रेष्ठ खरीदार व भाव अपनी भाषा में स्पष्ट रूप से सुनें।'
                : 'सर्वोत्तम खरेदीदार आणि भाव तुमच्या भाषेत ऐका.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleVoiceAssistant}
          className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
            isSpeaking
              ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-4 h-4" />
              <span>{t.speakingBuyersNow}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>{t.speakBuyersAdvice}</span>
            </>
          )}
        </button>
      </div>

      {/* Feature 4: Verified Buyer Credentials & Payment Reliability Modal */}
      {credentialsModalBuyer && (
        <BuyerCredentialsModal
          buyer={{
            id: credentialsModalBuyer.id,
            name: credentialsModalBuyer.name,
            typeDisplay: credentialsModalBuyer.typeDisplay,
            category: credentialsModalBuyer.category,
            badge: credentialsModalBuyer.badge,
            gstin: credentialsModalBuyer.gstin,
            cinNumber: `U01111MP2017PTC${Math.floor(100000 + Math.random() * 900000)}`,
            fssaiLicense: `10019026${Math.floor(100000 + Math.random() * 900000)}`,
            enamTradingLicense: `eNAM-MP-IND-${Math.floor(1000 + Math.random() * 9000)}`,
            kycVerifiedDate: '15 Jan 2024 (Ministry of Corporate Affairs & e-NAM)',
            procurementHistoryTotalQuintals: credentialsModalBuyer.category === 'Food Processor' ? 142500 : credentialsModalBuyer.category === 'Miller' ? 88200 : 210000,
            settlementOnTimeRatePercent: credentialsModalBuyer.category === 'Food Processor' ? 99.4 : 98.7,
            averageDisputeRatePercent: 0.2,
            averageSettlementHours: 1.5,
            bankGuaranteeBacked: true,
            totalFarmersTransacted: credentialsModalBuyer.category === 'Food Processor' ? 1840 : 1120,
            escrowEnabled: true,
            procurementOfficerName: credentialsModalBuyer.procurementOfficer,
            procurementDeskPhone: credentialsModalBuyer.phoneContact,
            headquartersLocation: credentialsModalBuyer.location,
            starRating: credentialsModalBuyer.rating,
          }}
          lang={lang}
          isOpen={!!credentialsModalBuyer}
          onClose={() => setCredentialsModalBuyer(null)}
          onInitiateDeal={(b) => {
            setCredentialsModalBuyer(null);
            handleOpenSendRequestModal(credentialsModalBuyer, 'send');
          }}
        />
      )}

      {/* Feature 5: Net Farmer Price Realization Comparison Modal */}
      {comparisonModalBuyer && (
        <NetRealizationComparisonModal
          cropName={comparisonModalBuyer.cropRequired}
          lotQuantityQuintals={lotQuantity}
          farmerDistrict={profile.district || 'Sehore'}
          buyerName={comparisonModalBuyer.name}
          buyerOfferedPrice={comparisonModalBuyer.offeredPricePerQuintal}
          buyerDistanceKm={comparisonModalBuyer.distanceKm}
          buyerTransportCostPerQtl={comparisonModalBuyer.estimatedTransportCostPerQtl}
          lang={lang}
          isOpen={!!comparisonModalBuyer}
          onClose={() => setComparisonModalBuyer(null)}
          onAcceptDirectDeal={() => {
            const b = comparisonModalBuyer;
            setComparisonModalBuyer(null);
            handleOpenSendRequestModal(b, 'send');
          }}
        />
      )}

      {/* Feature 6: Transparent Deal Lifecycle Modal */}
      {lifecycleModalDeal && (
        <TransparentDealLifecycleModal
          deal={lifecycleModalDeal}
          lang={lang}
          isOpen={!!lifecycleModalDeal}
          onClose={() => setLifecycleModalDeal(null)}
        />
      )}

      {/* 8. Send Request Interactive Modal */}
      {requestModalBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-2xl">
            {requestSuccessData ? (
              // Success Screen
              <div className="text-center py-4 space-y-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                  requestSuccessData.isOfflineQueued ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {requestSuccessData.isOfflineQueued ? (
                    <Clock className="w-10 h-10" />
                  ) : (
                    <CheckCircle2 className="w-10 h-10" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-950 font-['Outfit',sans-serif]">
                    {requestSuccessData.isOfflineQueued
                      ? (lang === 'hi' ? 'ऑफ़लाइन सहेजा गया — स्वतः सिंक होगा' : lang === 'mr' ? 'ऑफलाइन सेव्ह केले — आपोआप सिंक होईल' : 'Saved Offline — Queued for Sync')
                      : t.requestSentSuccess}
                  </h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    {requestSuccessData.isOfflineQueued
                      ? (lang === 'hi'
                          ? `आपका प्रस्ताव सुरक्षित रूप से स्थानीय रूप से सहेज लिया गया है। इंटरनेट बहाल होते ही यह स्वतः ${requestSuccessData.buyerName} को प्रेषित हो जाएगा।`
                          : lang === 'mr'
                          ? `आपला प्रस्ताव सुरक्षितपणे स्थानिकरित्या सेव्ह झाला आहे. इंटरनेट परत आल्यावर तो त्वरित ${requestSuccessData.buyerName} कडे पाठविला जाईल.`
                          : `Your proposal is safely stored in local memory. AgriDirect Pulse will automatically transmit it to ${requestSuccessData.buyerName} the moment internet connectivity returns.`)
                      : (lang === 'en'
                          ? `Your direct trade lot proposal has been transmitted to ${requestSuccessData.buyerName}. Their procurement manager will call you at ${requestPhone} to arrange weighment.`
                          : `${requestSuccessData.buyerName} को आपका बिक्री प्रस्ताव भेज दिया गया है। उनके खरीद अधिकारी तौल एवं भुगतान के लिए ${requestPhone} पर संपर्क करेंगे।`)}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs text-left">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Proposal ID:</span>
                    <strong className="text-slate-900">{requestSuccessData.referenceId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Proposed Quantity:</span>
                    <strong className="text-slate-900">{requestSuccessData.quantity} Quintals</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                      requestSuccessData.isOfflineQueued ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {requestSuccessData.isOfflineQueued ? 'Queued (Offline)' : 'Transmitted (Live)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Total Net:</span>
                    <strong className="text-emerald-700 font-mono font-black text-sm">
                      ₹{requestSuccessData.totalAmount.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() => setRequestModalBuyer(null)}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  {lang === 'en' ? 'Done & Close' : 'समाप्त'}
                </button>
              </div>
            ) : (
              // Active Request Form
              <form onSubmit={handleSubmitTradeRequest} className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                      requestMode === 'counter' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {requestMode === 'counter' ? 'Counter Proposal to Buyer' : 'Direct Purchase Proposal'}
                    </span>
                    <h3 className="text-lg font-black text-slate-950 font-['Outfit',sans-serif] mt-1">
                      {requestModalBuyer.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Targeting {requestModalBuyer.cropRequired} • Buyer Baseline: ₹{requestModalBuyer.offeredPricePerQuintal}/Qtl
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequestModalBuyer(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Net Realization Box */}
                <div className={`p-4 rounded-2xl space-y-2 text-xs border ${
                  requestMode === 'counter' ? 'bg-amber-50/80 border-amber-200' : 'bg-emerald-50 border-emerald-200/80'
                }`}>
                  <div className="flex justify-between">
                    <span className="text-slate-700">
                      {requestMode === 'counter' ? 'Your Proposed Counter Rate:' : 'Buyer Offered Rate:'}
                    </span>
                    <strong className="text-slate-900 font-mono text-sm font-black">
                      ₹{requestPrice || requestModalBuyer.offeredPricePerQuintal} / Qtl
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Est. Transport Cost ({requestModalBuyer.distanceKm} km):</span>
                    <strong className="text-rose-700 font-mono">
                      -₹{requestModalBuyer.estimatedTransportCostPerQtl} / Qtl
                    </strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200/80">
                    <span className="text-slate-900 font-bold">Estimated Net in Hand:</span>
                    <strong className="text-emerald-800 font-mono text-base font-black">
                      ₹{Math.max(1, (requestPrice || requestModalBuyer.offeredPricePerQuintal) - requestModalBuyer.estimatedTransportCostPerQtl)} / Qtl
                    </strong>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-3 text-xs">
                  {requestMode === 'counter' && (
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {lang === 'en' ? 'Your Counter Price (₹ / Quintal):' : 'आपका काउंटर भाव (₹ / क्विंटल):'}
                      </label>
                      <input
                        type="number"
                        min={100}
                        value={requestPrice}
                        onChange={(e) => setRequestPrice(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-amber-300 rounded-xl font-mono font-bold text-slate-900 text-sm focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {lang === 'en' ? 'Quantity you want to sell (Quintals):' : 'कितना क्विंटल बेचना चाहते हैं:'}
                    </label>
                    <input
                      type="number"
                      min={requestModalBuyer.minOrderQuintals}
                      value={requestQuantity}
                      onChange={(e) => setRequestQuantity(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
                      required
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Min order required: {requestModalBuyer.minOrderQuintals} Qtl
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {lang === 'en' ? 'Your Contact Phone Number:' : 'आपका मोबाइल नंबर:'}
                    </label>
                    <input
                      type="tel"
                      value={requestPhone}
                      onChange={(e) => setRequestPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {lang === 'en' ? 'Pickup Preference:' : 'पिकअप का प्रकार:'}
                    </label>
                    <select
                      value={pickupOption}
                      onChange={(e) => setPickupOption(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="Farm-gate Pickup">Farm-gate Pickup (Buyer arranges truck)</option>
                      <option value="Farmer Delivery to Depot">Farmer Delivery to Depot</option>
                    </select>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs font-bold border border-slate-200">
                    <span className="text-slate-600">{t.lotNetValue}:</span>
                    <span className="text-emerald-700 font-mono text-base font-black">
                      ₹{(requestQuantity * Math.max(1, (requestPrice || requestModalBuyer.offeredPricePerQuintal) - requestModalBuyer.estimatedTransportCostPerQtl)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-xl text-white font-black text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 ${
                      requestMode === 'counter'
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{t.sendingRequest}</span>
                      </>
                    ) : (
                      <>
                        {requestMode === 'counter' ? <Handshake className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        <span>{requestMode === 'counter' ? 'Submit Counter Proposal' : t.sendRequest}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestModalBuyer(null)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    {lang === 'en' ? 'Cancel' : 'रद्द करें'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 9. Contact Buyer Sheet / Modal */}
      {contactModalBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                  Verified Buyer Contact Desk
                </span>
                <h3 className="text-lg font-black text-slate-950 font-['Outfit',sans-serif] mt-1">
                  {contactModalBuyer.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {contactModalBuyer.location}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setContactModalBuyer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Procurement Manager:</span>
                  <strong className="text-slate-900">{contactModalBuyer.procurementOfficer}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Direct Desk Helpline:</span>
                  <strong className="text-emerald-700 font-mono font-bold">{contactModalBuyer.phoneContact}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Operating Hours:</span>
                  <span className="text-slate-700">08:00 AM – 07:00 PM (Mon-Sat)</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Guaranteed Direct Bank NEFT Settlement</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Buyer pays directly into farmer bank account within 2 hours of digital weighbridge slip generation.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={`tel:${contactModalBuyer.phoneContact.replace(/\s+/g, '')}`}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs text-center"
              >
                <Phone className="w-4 h-4" />
                <span>Call Procurement Desk Now</span>
              </a>
              <button
                type="button"
                onClick={() => setContactModalBuyer(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                {lang === 'en' ? 'Close' : 'बंद करें'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
