export type FarmerTab = 'advisor' | 'markets' | 'buyers' | 'my-crops' | 'orders';

export type Language = 'en' | 'hi' | 'mr';

export interface TranslationStrings {
  appName: string;
  tagline: string;
  loginTagline: string;
  advisorTab: string;
  marketsTab: string;
  buyersTab: string;
  myCropsTab: string;
  ordersTab: string;
  whenToSell: string;
  whereToSell: string;
  whomToSell: string;
  holdAdvice: string;
  sellAdvice: string;
  todayRate: string;
  netInHand: string;
  freightCost: string;
  distance: string;
  demandHigh: string;
  demandSurge: string;
  verifiedBuyer: string;
  contactBuyer: string;
  addCrop: string;
  myHarvestValue: string;
  quintal: string;
  disclaimer: string;
  farmerRoleTitle: string;
  buyerRoleTitle: string;
  farmerIdentifierPlaceholder: string;
  buyerIdentifierPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  loginButtonText: string;
  registerText: string;
  forgotPasswordText: string;
  voiceAssistantButtonText: string;
  voiceListeningTitle: string;
  quickDemoLogin: string;
  cropScreenHeading: string;
  cropScreenSubtitle: string;
  selectCropLabel: string;
  quantityLabel: string;
  locationLabel: string;
  stateLabel: string;
  districtLabel: string;
  speakInsteadOfTyping: string;
  checkBestSellingOptions: string;
  customQuantityLabel: string;
  otherCropPlaceholder: string;
  voicePromptExample: string;
  analyzingOptions: string;
  // Screen 3: Live Market Intelligence
  todaysMarket: string;
  currentMarketPrice: string;
  priceUnit: string;
  priceDirection: string;
  increasing: string;
  decreasing: string;
  stable: string;
  demandLevel: string;
  highDemand: string;
  mediumDemand: string;
  lowDemand: string;
  nearbyMarketComparison: string;
  marketCol: string;
  priceCol: string;
  distanceCol: string;
  estimatedNetPriceCol: string;
  sevenDayPriceTrend: string;
  demandIndicator: string;
  marketAlert: string;
  getAISellingAdvice: string;
  mockDataNotice: string;
  liveDataNotice: string;
  changeCropDetails: string;
  bestMandiPill: string;
  freightDeductionInfo: string;
  loadingMarketData: string;
  errorLoadingMarkets: string;
  retryButton: string;
  noMarketsFound: string;
  // Screen 4: AI Selling Advisor
  aiSellingAdvisor: string;
  heroSellNow: string;
  heroWaitDays: string;
  currentPriceLabel: string;
  expectedPriceLabel: string;
  priceRangeLabel: string;
  potentialGainLossLabel: string;
  confidenceLabel: string;
  sellingWindowLabel: string;
  whyHeading: string;
  findVerifiedBuyers: string;
  speakAdvice: string;
  speakingNow: string;
  aiDisclaimer: string;
  highConfidence: string;
  moderateConfidence: string;
  immediateWindow: string;
  loadingAdvisor: string;
  errorAdvisor: string;
  totalLotBenefit: string;
  // Screen 5: Verified Buyers
  verifiedBuyersTitle: string;
  verifiedBuyersSubtitle: string;
  bestMatch: string;
  requiredCrop: string;
  requiredQuantity: string;
  offeredPrice: string;
  distanceKm: string;
  estimatedTransportCost: string;
  estimatedNetRealization: string;
  sendRequest: string;
  sendingRequest: string;
  requestSentSuccess: string;
  buyerTypeLabel: string;
  foodProcessor: string;
  miller: string;
  institutionalBuyer: string;
  speakBuyersAdvice: string;
  speakingBuyersNow: string;
  loadingBuyers: string;
  errorBuyers: string;
  noBuyersFoundForCrop: string;
  allCropsFilter: string;
  lotNetValue: string;
  netInHandPerQtl: string;
  // Voice Assistant Global Controls
  voiceTapToSpeak: string;
  voiceListening: string;
  voiceProcessing: string;
  voiceRecognizedText: string;
  voiceUnavailable: string;
  voiceMicPermissionDenied: string;
  voiceClear: string;
  voiceRetry: string;
  voiceApplyText: string;
  // Market Price Inline Editor
  editCropModalTitle: string;
  cancelBtn: string;
  confirmUpdateRates: string;
  selectCropPrompt: string;
  quantityInQuintals: string;
  mandiLocation: string;
  // Feature 1: Quality Matching & Breakdown
  qualityMatchingTitle: string;
  matchScoreLabel: string;
  whyBuyerMatches: string;
  cropVarietyFit: string;
  qualityMoistureFit: string;
  volumeOrderFit: string;
  logisticsFit: string;
  priceBenefitFit: string;
  qualityGradeLabel: string;
  moistureLevelLabel: string;
  maxMoistureSpec: string;
  strongMatch: string;
  goodMatch: string;
  moderateMatch: string;
  // Feature 2: Arrival Volumes
  dailyArrivalVolume: string;
  arrivalTrendLabel: string;
  heavySupply: string;
  moderateSupply: string;
  leanSupply: string;
  arrivalImpactTitle: string;
  // Feature 3: Storage-Aware Selling Advisor
  storageAdvisorTitle: string;
  holdingCostLabel: string;
  projectedGrossGain: string;
  storageCostPerMonth: string;
  netGainAfterStorage: string;
  storageViabilityProfitable: string;
  storageViabilitySellNow: string;
  warehouseStorageType: string;
  onFarmStorageType: string;
  fpoSiloType: string;
  bookWarehouseSlot: string;
  // Feature 4: Buyer Credentials & Payment Reliability
  buyerCredentialsTitle: string;
  statutoryKyc: string;
  gstinLabel: string;
  enamRegLabel: string;
  fssaiLicenseLabel: string;
  procurementHistory: string;
  tonnageProcuredLabel: string;
  experienceYearsLabel: string;
  paymentReliabilityTitle: string;
  escrowGuaranteed: string;
  avgPaymentSpeed: string;
  procurementOfficerContact: string;
  // Feature 5: Net Realization Comparison
  netRealizationComparisonTitle: string;
  nearbyMandiOption: string;
  directBuyerOption: string;
  grossPriceLabel: string;
  mandiCessTaxDeduction: string;
  loadingUnloadingDeduction: string;
  finalNetInHandLabel: string;
  directSellingAdvantage: string;
  // Feature 6: Transparent Transaction Summary
  transactionSummaryTitle: string;
  lifecycleStage1: string;
  lifecycleStage2: string;
  lifecycleStage3: string;
  lifecycleStage4: string;
  lifecycleStage5: string;
  lifecycleStage6: string;
  lifecycleStage7: string;
  lifecycleStage8: string;
  viewCompleteDealSummary: string;
  // Step 1-4: Offline-First & Connectivity Mode Localization
  onlineStatus: string;
  offlineStatus: string;
  syncingStatus: string;
  reconnectingStatus: string;
  backOnlineStatus: string;
  offlineModeBanner: string;
  offlineModeSubtext: string;
  lastSyncedLabel: string;
  lastUpdatedLabel: string;
  syncNowButton: string;
  noSavedDataTitle: string;
  noSavedDataDesc: string;
  offlineAiNotice: string;
  offlineOfferSavedNotice: string;
  offlineListingSavedNotice: string;
  pendingSyncBadge: string;
  connectionHealthTitle: string;
  savedDataAvailable: string;
}

export const TRANSLATIONS: Record<Language, TranslationStrings> = {
  en: {
    appName: 'AgriDirect Pulse',
    tagline: 'Smart Selling Advice for Farmers',
    loginTagline: 'AI-powered market decisions for farmers',
    advisorTab: 'AI Advisor',
    marketsTab: 'Market Price',
    buyersTab: 'Verified Buyers',
    myCropsTab: 'My Crop',
    ordersTab: 'Orders & Trades',
    whenToSell: 'WHEN should I sell?',
    whereToSell: 'WHERE should I sell?',
    whomToSell: 'WHOM should I sell to?',
    holdAdvice: 'HOLD Crop for Better Rates',
    sellAdvice: 'SELL NOW for Optimal Price',
    todayRate: "Today's Mandi Rate",
    netInHand: 'Net in Hand (after transport)',
    freightCost: 'Transport Cost',
    distance: 'Distance',
    demandHigh: 'High Demand',
    demandSurge: 'Surge Demand 🔥',
    verifiedBuyer: 'Verified Buyer',
    contactBuyer: 'Sell to Buyer / Call',
    addCrop: '+ Add Crop',
    myHarvestValue: 'Total Portfolio Value',
    quintal: 'Quintal',
    disclaimer: 'Advisory Note: Prices and forecasts are market estimates to help you plan. Confirm final quality with mandi agents.',
    farmerRoleTitle: 'Farmer / FPO',
    buyerRoleTitle: 'Buyer / Miller',
    farmerIdentifierPlaceholder: 'Mobile Number or Kisan ID',
    buyerIdentifierPlaceholder: 'Mobile Number or Business ID / GSTIN',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    loginButtonText: 'Secure Login',
    registerText: 'New here? Register account',
    forgotPasswordText: 'Forgot Password?',
    voiceAssistantButtonText: 'Speak to Login (Voice Assistant)',
    voiceListeningTitle: 'Voice Assistant Active',
    quickDemoLogin: 'Quick 1-Tap Demo Credentials',
    cropScreenHeading: 'Tell us about your crop',
    cropScreenSubtitle: "We'll find the best selling options for you.",
    selectCropLabel: '1. Select Crop',
    quantityLabel: '2. Quantity',
    locationLabel: '3. Location',
    stateLabel: 'State',
    districtLabel: 'City / District',
    speakInsteadOfTyping: 'Speak instead of typing',
    checkBestSellingOptions: 'Check Best Selling Options',
    customQuantityLabel: 'Custom quantity (Quintals)',
    otherCropPlaceholder: 'Enter crop name (e.g. Mustard, Gram, Maize)',
    voicePromptExample: 'Try saying: "Wheat 25 quintal Sehore Madhya Pradesh"',
    analyzingOptions: 'Finding best selling options & market rates...',
    // Screen 3: Live Market Intelligence
    todaysMarket: "Today's Market",
    currentMarketPrice: 'Current Market Price',
    priceUnit: '₹ / Quintal',
    priceDirection: 'Price Direction',
    increasing: 'Increasing ↗',
    decreasing: 'Decreasing ↘',
    stable: 'Stable →',
    demandLevel: 'Demand Level',
    highDemand: 'High',
    mediumDemand: 'Medium',
    lowDemand: 'Low',
    nearbyMarketComparison: 'Nearby Market Comparison',
    marketCol: 'Market',
    priceCol: 'Price',
    distanceCol: 'Distance',
    estimatedNetPriceCol: 'Estimated Net Price',
    sevenDayPriceTrend: '7-Day Price Trend',
    demandIndicator: 'Demand Indicator',
    marketAlert: 'Market Alert',
    getAISellingAdvice: 'Get AI Selling Advice',
    mockDataNotice: 'Simulated / Benchmark Data',
    liveDataNotice: 'Live AGMARKNET Feed',
    changeCropDetails: 'Edit Crop / Quantity',
    bestMandiPill: 'Best Net Realization',
    freightDeductionInfo: 'Estimated net realization calculated after transport freight deduction.',
    loadingMarketData: 'Fetching live market intelligence & prices...',
    errorLoadingMarkets: 'Unable to fetch real-time market data. Displaying latest regional benchmarks.',
    retryButton: 'Retry',
    noMarketsFound: 'No nearby mandis found for this crop and location.',
    // Screen 4: AI Selling Advisor
    aiSellingAdvisor: 'AI Selling Advisor',
    heroSellNow: 'SELL NOW',
    heroWaitDays: 'WAIT 3 DAYS',
    currentPriceLabel: 'Current Price',
    expectedPriceLabel: 'Expected Price',
    priceRangeLabel: 'Expected Price Range',
    potentialGainLossLabel: 'Potential Gain / Loss',
    confidenceLabel: 'Confidence',
    sellingWindowLabel: 'Recommended Selling Window',
    whyHeading: 'Why?',
    findVerifiedBuyers: 'Find Verified Buyers',
    speakAdvice: 'Listen to AI Advice (Voice)',
    speakingNow: 'Speaking Advice...',
    aiDisclaimer: 'AI forecasts are estimates for decision support and are not guaranteed prices.',
    highConfidence: 'High Confidence',
    moderateConfidence: 'Moderate Confidence',
    immediateWindow: 'Today (Immediate)',
    loadingAdvisor: 'Analyzing prices, demand, and forecasting selling advice...',
    errorAdvisor: 'Unable to connect to live advisor. Showing regional benchmark decision.',
    totalLotBenefit: 'estimated net benefit on your lot',
    // Screen 5: Verified Buyers
    verifiedBuyersTitle: 'Verified Buyers',
    verifiedBuyersSubtitle: 'Direct institutional procurement with best net realization after transport.',
    bestMatch: 'Best Match',
    requiredCrop: 'Required Crop',
    requiredQuantity: 'Required Quantity',
    offeredPrice: 'Offered Price',
    distanceKm: 'Distance',
    estimatedTransportCost: 'Est. Transport Cost',
    estimatedNetRealization: 'Est. Net Realization',
    sendRequest: 'Send Request',
    sendingRequest: 'Sending Request...',
    requestSentSuccess: 'Purchase Request Sent Successfully!',
    buyerTypeLabel: 'Buyer Type',
    foodProcessor: 'Food Processor',
    miller: 'Miller',
    institutionalBuyer: 'Institutional Buyer',
    speakBuyersAdvice: 'Listen to Best Buyers (Voice)',
    speakingBuyersNow: 'Speaking Buyer Recommendations...',
    loadingBuyers: 'Fetching verified buyers and live procurement tenders...',
    errorBuyers: 'Unable to load live buyer tenders. Showing verified regional partners.',
    noBuyersFoundForCrop: 'No verified buyers currently requesting this crop in your radius.',
    allCropsFilter: 'All Crops',
    lotNetValue: 'Total Lot Net Realization',
    netInHandPerQtl: 'Net in hand / Qtl',
    // Voice Assistant Global Controls
    voiceTapToSpeak: 'Tap to speak',
    voiceListening: 'Listening...',
    voiceProcessing: 'Understanding your request...',
    voiceRecognizedText: 'Recognized speech:',
    voiceUnavailable: 'Speech recognition is not supported in this browser. Please type or select directly.',
    voiceMicPermissionDenied: 'Microphone access denied. Please allow microphone permissions in your browser or type directly.',
    voiceClear: 'Clear',
    voiceRetry: 'Speak Again',
    voiceApplyText: 'Use This Input',
    // Market Price Inline Editor
    editCropModalTitle: 'Edit Crop & Quantity',
    cancelBtn: 'Cancel',
    confirmUpdateRates: 'Confirm & Update Rates',
    selectCropPrompt: 'Choose Crop',
    quantityInQuintals: 'Quantity (in Quintals)',
    mandiLocation: 'Mandi Location / District',
    // Feature 1: Quality Matching & Breakdown
    qualityMatchingTitle: 'Quality & Requirement Match',
    matchScoreLabel: 'Match Score',
    whyBuyerMatches: 'Why this buyer matches',
    cropVarietyFit: 'Crop & Variety Match',
    qualityMoistureFit: 'Quality Grade & Moisture Spec',
    volumeOrderFit: 'Lot Quantity & Min Order Fit',
    logisticsFit: 'Farm-gate Logistics & Distance',
    priceBenefitFit: 'Price Premium Realization',
    qualityGradeLabel: 'Quality Grade',
    moistureLevelLabel: 'Moisture Level',
    maxMoistureSpec: 'Max Moisture Allowed',
    strongMatch: 'Strong Match',
    goodMatch: 'Good Match',
    moderateMatch: 'Moderate Fit',
    // Feature 2: Arrival Volumes
    dailyArrivalVolume: 'Daily Mandi Arrivals',
    arrivalTrendLabel: 'Arrival Volume Trend',
    heavySupply: 'Heavy Supply Surge',
    moderateSupply: 'Moderate Arrivals',
    leanSupply: 'Lean / Tight Supply',
    arrivalImpactTitle: 'Arrivals & Price Correlation',
    // Feature 3: Storage-Aware Selling Advisor
    storageAdvisorTitle: 'Storage Cost vs. Holding Gain Analysis',
    holdingCostLabel: 'Est. Warehouse Cost',
    projectedGrossGain: 'Projected Price Surge',
    storageCostPerMonth: 'Storage Rate (₹/Qtl/Month)',
    netGainAfterStorage: 'Net Profit After Storage Fees',
    storageViabilityProfitable: 'Holding is highly profitable after storage fees',
    storageViabilitySellNow: 'Sell Now recommended: price gain does not cover holding fees',
    warehouseStorageType: 'Scientific Warehouse (WDRA / CWC / MPSWC)',
    onFarmStorageType: 'On-Farm Covered Storage',
    fpoSiloType: 'FPO Modern Silo / Metal Bin',
    bookWarehouseSlot: 'Book Storage Facility',
    // Feature 4: Buyer Credentials & Payment Reliability
    buyerCredentialsTitle: 'Verified Buyer Credentials & Statutory KYC',
    statutoryKyc: 'Statutory Verification',
    gstinLabel: 'GSTIN Number',
    enamRegLabel: 'e-NAM Member Registration',
    fssaiLicenseLabel: 'FSSAI Central License',
    procurementHistory: 'Procurement Track Record',
    tonnageProcuredLabel: 'Total Procurement Volume',
    experienceYearsLabel: 'Procurement Experience',
    paymentReliabilityTitle: 'Payment Reliability & Escrow Guarantee',
    escrowGuaranteed: '100% Escrow Backed Protection',
    avgPaymentSpeed: 'Avg Settlement Time',
    procurementOfficerContact: 'Procurement Officer Desk',
    // Feature 5: Net Realization Comparison
    netRealizationComparisonTitle: 'Net Farmer Realization: Mandi vs. Direct Buyer',
    nearbyMandiOption: 'Nearby APMC Mandi',
    directBuyerOption: 'Verified Buyer (Farm-Gate)',
    grossPriceLabel: 'Gross Offered Price',
    mandiCessTaxDeduction: 'Mandi Cess / Tax (1.5%)',
    loadingUnloadingDeduction: 'Loading & Handling Labour',
    finalNetInHandLabel: 'Final Net in Hand',
    directSellingAdvantage: 'Direct Selling Premium Benefit',
    // Feature 6: Transparent Transaction Summary
    transactionSummaryTitle: 'Transparent End-to-End Deal Lifecycle',
    lifecycleStage1: 'Lot Created & AI Graded',
    lifecycleStage2: 'Buyer Match & Offer Accepted',
    lifecycleStage3: 'Escrow Payment Deposited',
    lifecycleStage4: 'Digital Gate Pass Issued',
    lifecycleStage5: 'Farm-Gate Logistics Dispatched',
    lifecycleStage6: 'Electronic Weighment Verified',
    lifecycleStage7: 'Escrow Released to Bank (NEFT)',
    lifecycleStage8: 'Transaction Settled & GST Invoice',
    viewCompleteDealSummary: 'View Complete Deal Lifecycle',
    // Step 1-4: Offline-First & Connectivity Mode Localization
    onlineStatus: 'Online',
    offlineStatus: 'Offline Mode',
    syncingStatus: 'Syncing...',
    reconnectingStatus: 'Reconnecting...',
    backOnlineStatus: 'Back Online',
    offlineModeBanner: 'Offline Mode — Using saved data',
    offlineModeSubtext: 'Showing last saved prices and buyer records. Full live trading & AI sync when reconnected.',
    lastSyncedLabel: 'Last synced',
    lastUpdatedLabel: 'Last updated',
    syncNowButton: 'Sync Now',
    noSavedDataTitle: 'No internet connection and no saved data available.',
    noSavedDataDesc: 'Connect to the internet once to load and cache live Mandi rates and buyer listings for your region.',
    offlineAiNotice: 'Live AI Selling Advisor requires active connectivity. Showing rule-based advisory from last synced rates.',
    offlineOfferSavedNotice: 'Offline Mode: Offer draft saved locally. It will automatically transmit once internet returns.',
    offlineListingSavedNotice: 'Crop listing draft saved locally. It will automatically publish when back online.',
    pendingSyncBadge: 'Changes waiting to sync',
    connectionHealthTitle: 'Network & Offline Storage Status',
    savedDataAvailable: 'Saved local data available',
  },
  hi: {
    appName: 'एग्रीडायरेक्ट पल्स',
    tagline: 'किसानों के लिए सटीक मंडी सलाह',
    loginTagline: 'किसानों के लिए AI-सक्षम मंडी निर्णय',
    advisorTab: 'AI मंडी सलाह',
    marketsTab: 'मंडी भाव (Market Price)',
    buyersTab: 'प्रमाणित खरीदार',
    myCropsTab: 'मेरी फसल',
    ordersTab: 'मेरे ऑर्डर्स व सौदे',
    whenToSell: 'कब बेचना चाहिए?',
    whereToSell: 'कहाँ बेचना चाहिए?',
    whomToSell: 'किसे बेचना चाहिए?',
    holdAdvice: '3 दिन रुकें — बेहतर भाव मिलेगा',
    sellAdvice: 'आज ही बेचें — उत्तम भाव उपलब्ध',
    todayRate: 'आज का मंडी भाव',
    netInHand: 'शुद्ध बचत (भाड़ा काटकर)',
    freightCost: 'अनुमानित भाड़ा',
    distance: 'दूरी',
    demandHigh: 'उच्च मांग',
    demandSurge: 'बंपर मांग 🔥',
    verifiedBuyer: 'प्रमाणित खरीदार',
    contactBuyer: 'खरीदार से संपर्क करें',
    addCrop: '+ नई फसल जोड़ें',
    myHarvestValue: 'कुल फसल का अनुमानित मूल्य',
    quintal: 'क्विंटल',
    disclaimer: 'सलाह सूचना: सभी अनुमान मंडी ट्रेंड्स पर आधारित हैं। अंतिम सौदा करने से पहले मंडी में फसल की गुणवत्ता अवश्य जांचें।',
    farmerRoleTitle: 'किसान / FPO',
    buyerRoleTitle: 'खरीदार / मिलर्स',
    farmerIdentifierPlaceholder: 'मोबाइल नंबर या किसान आईडी',
    buyerIdentifierPlaceholder: 'मोबाइल नंबर या व्यापार आईडी / GSTIN',
    passwordLabel: 'पासवर्ड',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    loginButtonText: 'सुरक्षित लॉगिन करें',
    registerText: 'नया खाता बनाएं / रजिस्टर करें',
    forgotPasswordText: 'पासवर्ड भूल गए?',
    voiceAssistantButtonText: 'बोलकर लॉगिन करें (वॉइस असिस्टेंट)',
    voiceListeningTitle: 'वॉइस असिस्टेंट सक्रिय है',
    quickDemoLogin: '1-क्लिक टेस्ट क्रेडेंशियल्स',
    cropScreenHeading: 'अपनी फसल के बारे में बताएं',
    cropScreenSubtitle: 'हम आपके लिए बिक्री के सर्वोत्तम विकल्प खोजेंगे।',
    selectCropLabel: '1. फसल चुनें',
    quantityLabel: '2. मात्रा',
    locationLabel: '3. स्थान',
    stateLabel: 'राज्य',
    districtLabel: 'शहर / जिला',
    speakInsteadOfTyping: 'टाइप करने के बजाय बोलें',
    checkBestSellingOptions: 'बिक्री के सर्वोत्तम विकल्प देखें',
    customQuantityLabel: 'अन्य मात्रा (क्विंटल)',
    otherCropPlaceholder: 'फसल का नाम लिखें (उदा. सरसों, चना, मक्का)',
    voicePromptExample: 'बोलकर देखें: "गेहूं 50 क्विंटल सीहोर मध्य प्रदेश"',
    analyzingOptions: 'सर्वोत्तम मंडी एवं खरीदार खोजे जा रहे हैं...',
    // Screen 3: Live Market Intelligence
    todaysMarket: 'आज का बाजार',
    currentMarketPrice: 'वर्तमान मंडी भाव',
    priceUnit: '₹ / क्विंटल',
    priceDirection: 'भाव की दिशा',
    increasing: 'बढ़ रहा है ↗',
    decreasing: 'घट रहा है ↘',
    stable: 'स्थिर →',
    demandLevel: 'मांग का स्तर',
    highDemand: 'उच्च',
    mediumDemand: 'मध्यम',
    lowDemand: 'कम',
    nearbyMarketComparison: 'नजदीकी मंडी तुलना',
    marketCol: 'मंडी',
    priceCol: 'मंडी भाव',
    distanceCol: 'दूरी',
    estimatedNetPriceCol: 'अनुमानित शुद्ध भाव',
    sevenDayPriceTrend: 'पिछले 7 दिनों का ट्रेंड',
    demandIndicator: 'मांग सूचक',
    marketAlert: 'मंडी अलर्ट',
    getAISellingAdvice: 'AI बिक्री सलाह प्राप्त करें',
    mockDataNotice: 'सिम्युलेटेड / बेंचमार्क डेटा',
    liveDataNotice: 'लाइव एगमार्कनेट डेटा',
    changeCropDetails: 'फसल / मात्रा बदलें',
    bestMandiPill: 'सर्वश्रेष्ठ शुद्ध बचत',
    freightDeductionInfo: 'अनुमानित शुद्ध भाव भाड़ा व परिवहन खर्च काटकर निकाला गया है।',
    loadingMarketData: 'ताजा मंडी भाव और दूरी की गणना हो रही है...',
    errorLoadingMarkets: 'मंडी डेटा लोड नहीं हो सका। क्षेत्रीय बेंचमार्क भाव प्रदर्शित किए जा रहे हैं।',
    retryButton: 'पुनः प्रयास करें',
    noMarketsFound: 'इस फसल और स्थान के लिए कोई नजदीकी मंडी नहीं मिली।',
    // Screen 4: AI Selling Advisor
    aiSellingAdvisor: 'AI बिक्री सलाहकार',
    heroSellNow: 'आज ही बेचें (SELL NOW)',
    heroWaitDays: '3 दिन रुकें (WAIT 3 DAYS)',
    currentPriceLabel: 'वर्तमान भाव',
    expectedPriceLabel: 'अनुमानित भाव',
    priceRangeLabel: 'अनुमानित भाव दायरा',
    potentialGainLossLabel: 'संभावित लाभ / हानि',
    confidenceLabel: 'विश्वसनीयता (Confidence)',
    sellingWindowLabel: 'सर्वोत्तम बिक्री समय',
    whyHeading: 'यह सलाह क्यों? (Why?)',
    findVerifiedBuyers: 'प्रमाणित खरीदार खोजें',
    speakAdvice: 'AI सलाह सुनें (वॉइस)',
    speakingNow: 'सलाह बोली जा रही है...',
    aiDisclaimer: 'AI अनुमान निर्णय सहायता के लिए हैं और गारंटीकृत मूल्य नहीं हैं।',
    highConfidence: 'उच्च विश्वसनीयता',
    moderateConfidence: 'मध्यम विश्वसनीयता',
    immediateWindow: 'आज (तुरंत)',
    loadingAdvisor: 'भाव, मांग और भविष्य के अनुमान का विश्लेषण हो रहा है...',
    errorAdvisor: 'सलाह लोड नहीं हो सकी। क्षेत्रीय बेंचमार्क निर्णय दिखाया जा रहा है।',
    totalLotBenefit: 'आपकी कुल फसल पर अनुमानित अतिरिक्त लाभ',
    // Screen 5: Verified Buyers
    verifiedBuyersTitle: 'प्रमाणित खरीदार एवं मिलर्स',
    verifiedBuyersSubtitle: 'भाड़ा काटकर उच्चतम शुद्ध बचत के साथ सीधे खरीदारों को बेचें।',
    bestMatch: 'सर्वश्रेष्ठ मैच (Best Match)',
    requiredCrop: 'मांग फसल',
    requiredQuantity: 'मांग मात्रा',
    offeredPrice: 'प्रस्तावित भाव',
    distanceKm: 'दूरी',
    estimatedTransportCost: 'अनुमानित भाड़ा',
    estimatedNetRealization: 'अनुमानित शुद्ध भाव',
    sendRequest: 'अनुरोध भेजें',
    sendingRequest: 'अनुरोध भेजा जा रहा है...',
    requestSentSuccess: 'खरीद अनुरोध सफलतापूर्वक भेजा गया!',
    buyerTypeLabel: 'खरीदार का प्रकार',
    foodProcessor: 'खाद्य प्रसंस्करण इकाई',
    miller: 'दाल / आटा मिलर',
    institutionalBuyer: 'संस्थागत खरीदार',
    speakBuyersAdvice: 'सर्वश्रेष्ठ खरीदार सुनें (वॉइस)',
    speakingBuyersNow: 'खरीदार विकल्प बोले जा रहे हैं...',
    loadingBuyers: 'प्रमाणित खरीदार और मांग लोड हो रही है...',
    errorBuyers: 'लाइव खरीदार लोड नहीं हो सके। प्रमाणित क्षेत्रीय साझेदार दिखाए जा रहे हैं।',
    noBuyersFoundForCrop: 'आपके क्षेत्र में इस फसल के लिए अभी कोई प्रमाणित खरीदार उपलब्ध नहीं है।',
    allCropsFilter: 'सभी फसलें',
    lotNetValue: 'कुल फसल शुद्ध प्राप्ति',
    netInHandPerQtl: 'हाथ में शुद्ध भाव / क्विंटल',
    // Voice Assistant Global Controls
    voiceTapToSpeak: 'बोलने के लिए दबाएं',
    voiceListening: 'सुन रहे हैं...',
    voiceProcessing: 'आपकी बात समझ रहे हैं...',
    voiceRecognizedText: 'पहचानी गई आवाज़:',
    voiceUnavailable: 'इस ब्राउज़र में वॉइस सुविधा उपलब्ध नहीं है। कृपया सीधे टाइप या चयन करें।',
    voiceMicPermissionDenied: 'माइक की अनुमति अस्वीकृत है। कृपया ब्राउज़र में माइक की अनुमति दें या सीधे टाइप करें।',
    voiceClear: 'साफ़ करें',
    voiceRetry: 'फिर से बोलें',
    voiceApplyText: 'यह जानकारी लागू करें',
    // Market Price Inline Editor
    editCropModalTitle: 'फसल और मात्रा बदलें',
    cancelBtn: 'रद्द करें',
    confirmUpdateRates: 'पुष्टि करें और भाव देखें',
    selectCropPrompt: 'फसल चुनें',
    quantityInQuintals: 'मात्रा (क्विंटल में)',
    mandiLocation: 'मंडी स्थान / जिला',
    // Feature 1: Quality Matching & Breakdown
    qualityMatchingTitle: 'गुणवत्ता एवं मांग मिलान',
    matchScoreLabel: 'मैच स्कोर',
    whyBuyerMatches: 'यह खरीदार क्यों उपयुक्त है?',
    cropVarietyFit: 'फसल और किस्म मिलान',
    qualityMoistureFit: 'गुणवत्ता ग्रेड और नमी मापदंड',
    volumeOrderFit: 'मात्रा और न्यूनतम लॉट आकार',
    logisticsFit: 'खेत से सीधी ढुलाई व दूरी',
    priceBenefitFit: 'प्रीमियम भाव शुद्ध लाभ',
    qualityGradeLabel: 'गुणवत्ता ग्रेड',
    moistureLevelLabel: 'नमी का स्तर',
    maxMoistureSpec: 'अधिकतम मान्य नमी',
    strongMatch: 'उत्कृष्ट मैच',
    goodMatch: 'अच्छा मैच',
    moderateMatch: 'मध्यम मैच',
    // Feature 2: Arrival Volumes
    dailyArrivalVolume: 'दैनिक मंडी आवक (Arrivals)',
    arrivalTrendLabel: 'मंडी आवक ट्रेंड',
    heavySupply: 'भारी आवक (Heavy Supply)',
    moderateSupply: 'मध्यम आवक',
    leanSupply: 'कम आवक (Tight Supply)',
    arrivalImpactTitle: 'मंडी आवक और भाव का प्रभाव',
    // Feature 3: Storage-Aware Selling Advisor
    storageAdvisorTitle: 'भंडारण खर्च बनाम भविष्य में भाव वृद्धि विश्लेषण',
    holdingCostLabel: 'अनुमानित वेयरहाउस खर्च',
    projectedGrossGain: 'अनुमानित भाव वृद्धि',
    storageCostPerMonth: 'भंडारण दर (₹/क्विंटल/माह)',
    netGainAfterStorage: 'भंडारण शुल्क काटकर शुद्ध मुनाफा',
    storageViabilityProfitable: 'भंडारण खर्च काटकर भी फसल रोकना अत्यधिक लाभदायक है',
    storageViabilitySellNow: 'आज बेचना बेहतर है: भाव वृद्धि भंडारण खर्च से कम है',
    warehouseStorageType: 'वैज्ञानिक वेयरहाउस (MPSWC / CWC गोदाम)',
    onFarmStorageType: 'घर/खेत का ढका हुआ भंडारण',
    fpoSiloType: 'FPO आधुनिक साइलो / स्टील बिन',
    bookWarehouseSlot: 'वेयरहाउस में स्थान बुक करें',
    // Feature 4: Buyer Credentials & Payment Reliability
    buyerCredentialsTitle: 'प्रमाणित खरीदार विवरण एवं वैधानिक KYC',
    statutoryKyc: 'वैधानिक सत्यापन',
    gstinLabel: 'GSTIN नंबर',
    enamRegLabel: 'ई-नाम सदस्य पंजीकरण',
    fssaiLicenseLabel: 'FSSAI केंद्रीय लाइसेंस',
    procurementHistory: 'खरीद का ऐतिहासिक ट्रैक रिकॉर्ड',
    tonnageProcuredLabel: 'कुल संचित खरीद मात्रा',
    experienceYearsLabel: 'खरीद क्षेत्र में अनुभव',
    paymentReliabilityTitle: 'भुगतान विश्वसनीयता एवं एस्क्रो सुरक्षा',
    escrowGuaranteed: '100% डिजिटल एस्क्रो भुगतान गारंटी',
    avgPaymentSpeed: 'औसत भुगतान ट्रांसफर समय',
    procurementOfficerContact: 'क्षेत्रीय खरीद अधिकारी संपर्क',
    // Feature 5: Net Realization Comparison
    netRealizationComparisonTitle: 'किसान की शुद्ध बचत: मंडी बनाम सीधा खरीदार',
    nearbyMandiOption: 'नजदीकी APMC मंडी',
    directBuyerOption: 'प्रमाणित खरीदार (खेत से सीधा)',
    grossPriceLabel: 'प्रस्तावित सकल भाव',
    mandiCessTaxDeduction: 'मंडी शुल्क व टैक्स (1.5%)',
    loadingUnloadingDeduction: 'हम्माली, तुलाई व मजदूरी',
    finalNetInHandLabel: 'हाथ में शुद्ध बचत (Net in Hand)',
    directSellingAdvantage: 'सीधे बेचने पर कुल अतिरिक्त लाभ',
    // Feature 6: Transparent Transaction Summary
    transactionSummaryTitle: 'पारदर्शी सम्पूर्ण सौदा एवं भुगतान चक्र',
    lifecycleStage1: 'लॉट तैयार व AI गुणवत्ता ग्रेडिंग',
    lifecycleStage2: 'खरीदार मिलान व प्रस्ताव स्वीकृत',
    lifecycleStage3: 'एस्क्रो खाते में 100% राशि जमा',
    lifecycleStage4: 'डिजिटल गेट पास जारी (QR कोड)',
    lifecycleStage5: 'खेत से वाहन रवानगी (GPS ट्रैकिंग)',
    lifecycleStage6: 'इलेक्ट्रॉनिक कांटा पर्ची तुलाई',
    lifecycleStage7: 'बैंक खाते में सीधा भुगतान (NEFT)',
    lifecycleStage8: 'सौदा पूर्ण व GST पक्का बिल',
    viewCompleteDealSummary: 'सौदा जीवनचक्र का विवरण देखें',
    // Step 1-4: Offline-First & Connectivity Mode Localization (Hindi)
    onlineStatus: 'ऑनलाइन',
    offlineStatus: 'ऑफ़लाइन मोड',
    syncingStatus: 'सिंक हो रहा है...',
    reconnectingStatus: 'पुनः कनेक्ट हो रहा है...',
    backOnlineStatus: 'ऑनलाइन वापस',
    offlineModeBanner: 'ऑफ़लाइन मोड — सहेजे गए डेटा का उपयोग',
    offlineModeSubtext: 'अंतिम सुरक्षित मंडी भाव व खरीदार सूची दिखाई जा रही है। नेटवर्क आने पर स्वतः नया डेटा सिंक होगा।',
    lastSyncedLabel: 'अंतिम सिंक',
    lastUpdatedLabel: 'अंतिम अपडेट',
    syncNowButton: 'अभी सिंक करें',
    noSavedDataTitle: 'कोई इंटरनेट कनेक्शन नहीं है और कोई सहेजा गया डेटा उपलब्ध नहीं है।',
    noSavedDataDesc: 'अपने क्षेत्र के लाइव मंडी भाव और खरीदार सूची लोड करने के लिए एक बार इंटरनेट से कनेक्ट करें।',
    offlineAiNotice: 'लाइव AI सलाहकार के लिए इंटरनेट आवश्यक है। अंतिम सहेजे गए भावों से गणना की गई नियम-आधारित सलाह दिखाई जा रही है।',
    offlineOfferSavedNotice: 'ऑफ़लाइन मोड: प्रस्ताव ड्राफ्ट स्थानीय रूप से सुरक्षित किया गया। इंटरनेट आते ही स्वतः भेजा जाएगा।',
    offlineListingSavedNotice: 'फसल लिस्टिंग सुरक्षित हुई। ऑनलाइन आते ही प्रकाशित होगी।',
    pendingSyncBadge: 'सिंक के लिए प्रतीक्षारत बदलाव',
    connectionHealthTitle: 'नेटवर्क व ऑफ़लाइन डेटा स्थिति',
    savedDataAvailable: 'सुरक्षित स्थानीय डेटा उपलब्ध',
  },
  mr: {
    appName: 'अ‍ॅग्रीडायरेक्ट पल्स',
    tagline: 'शेतकऱ्यांसाठी अचूक बाजारपेठ सल्ला',
    loginTagline: 'शेतकऱ्यांसाठी AI-आधारित बाजारपेठ निर्णय',
    advisorTab: 'AI बाजार सल्ला',
    marketsTab: 'बाजार भाव (Market Price)',
    buyersTab: 'नोंदणीकृत खरेदीदार',
    myCropsTab: 'माझे पीक',
    ordersTab: 'माझे ऑर्डर्स व सौदे',
    whenToSell: 'कधी विकावे?',
    whereToSell: 'कुठे विकावे?',
    whomToSell: 'कोणाला विकावे?',
    holdAdvice: 'काही दिवस थांबा — जास्त भाव मिळेल',
    sellAdvice: 'आजच विका — योग्य दर उपलब्ध',
    todayRate: 'आजचा बाजार भाव',
    netInHand: 'हातात येणारी रक्कम (वाहतूक खर्च वजा)',
    freightCost: 'वाहतूक खर्च',
    distance: 'अंतर',
    demandHigh: 'जास्त मागणी',
    demandSurge: 'प्रचंड मागणी 🔥',
    verifiedBuyer: 'प्रमाणित खरेदीदार',
    contactBuyer: 'खरेदीदाराशी संपर्क साधा',
    addCrop: '+ नवीन पीक जोडा',
    myHarvestValue: 'एकूण पीक मूल्य',
    quintal: 'क्विंटल',
    disclaimer: 'सल्ला टीप: सर्व माहिती बाजार विश्लेषणावर आधारित आहे. खरेदीपूर्वी प्रतवारी तपासा.',
    farmerRoleTitle: 'शेतकरी / FPO',
    buyerRoleTitle: 'खरेदीदार / मिलर्स',
    farmerIdentifierPlaceholder: 'मोबाईल नंबर किंवा शेतकरी आयडी',
    buyerIdentifierPlaceholder: 'मोबाईल नंबर किंवा व्यवसाय आयडी / GSTIN',
    passwordLabel: 'पासवर्ड',
    passwordPlaceholder: 'तुमचा पासवर्ड टाका',
    loginButtonText: 'सुरक्षित लॉगिन',
    registerText: 'नवीन खाते तयार करा',
    forgotPasswordText: 'पासवर्ड विसरलात?',
    voiceAssistantButtonText: 'बोलून लॉगिन करा (व्हॉइस असिस्टंट)',
    voiceListeningTitle: 'व्हॉइस असिस्टंट सुरू आहे',
    quickDemoLogin: '१-क्लिक चाचणी लॉगिन',
    cropScreenHeading: 'तुमच्या पिकाबद्दल माहिती द्या',
    cropScreenSubtitle: 'आम्ही तुमच्यासाठी विक्रीचे सर्वोत्तम पर्याय शोधू.',
    selectCropLabel: '१. पीक निवडा',
    quantityLabel: '२. प्रमाण',
    locationLabel: '३. ठिकाण',
    stateLabel: 'राज्य',
    districtLabel: 'शहर / जिल्हा',
    speakInsteadOfTyping: 'टाईप करण्याऐवजी बोला',
    checkBestSellingOptions: 'विक्रीचे सर्वोत्तम पर्याय तपासा',
    customQuantityLabel: 'इतर प्रमाण (क्विंटल)',
    otherCropPlaceholder: 'पिकाचे नाव टाका (उदा. मोहरी, हरभरा, मका)',
    voicePromptExample: 'बोलून पहा: "गहू २५ क्विंटल नाशिक महाराष्ट्र"',
    analyzingOptions: 'सर्वोत्तम बाजारपेठ आणि खरेदीदार शोधत आहोत...',
    // Screen 3: Live Market Intelligence
    todaysMarket: 'आजचा बाजार',
    currentMarketPrice: 'सध्याचा बाजार भाव',
    priceUnit: '₹ / क्विंटल',
    priceDirection: 'दराची दिशा',
    increasing: 'वाढत आहे ↗',
    decreasing: 'कमी होत आहे ↘',
    stable: 'स्थिर →',
    demandLevel: 'मागणी पातळी',
    highDemand: 'जास्त',
    mediumDemand: 'मध्यम',
    lowDemand: 'कमी',
    nearbyMarketComparison: 'नजीकच्या बाजारपेठांची तुलना',
    marketCol: 'बाजारपेठ (मंडी)',
    priceCol: 'बाजार भाव',
    distanceCol: 'अंतर',
    estimatedNetPriceCol: 'अंदाजे निव्वळ दर',
    sevenDayPriceTrend: 'गेल्या ७ दिवसांचा कल',
    demandIndicator: 'मागणी निर्देशक',
    marketAlert: 'बाजार सूचना',
    getAISellingAdvice: 'AI विक्री सल्ला मिळवा',
    mockDataNotice: 'चाचणी / बेंचमार्क डेटा',
    liveDataNotice: 'थेट एगमार्कनेट डेटा',
    changeCropDetails: 'पीक / प्रमाण बदला',
    bestMandiPill: 'सर्वोत्तम निव्वळ नफा',
    freightDeductionInfo: 'वाहतूक व भाडे खर्च वजा करून अंदाजे निव्वळ दर काढला आहे.',
    loadingMarketData: 'थेट बाजार भाव आणि अंतर मोजत आहोत...',
    errorLoadingMarkets: 'माहिती उपलब्ध नाही. प्रादेशिक बेंचमार्क दर दाखवत आहोत.',
    retryButton: 'पुन्हा प्रयत्न करा',
    noMarketsFound: 'या पिकासाठी नजीकच्या बाजारपेठा सापडल्या नाहीत.',
    // Screen 4: AI Selling Advisor
    aiSellingAdvisor: 'AI विक्री सल्लागार',
    heroSellNow: 'आजच विका (SELL NOW)',
    heroWaitDays: '३ दिवस थांबा (WAIT 3 DAYS)',
    currentPriceLabel: 'सध्याचा दर',
    expectedPriceLabel: 'अपेक्षित दर',
    priceRangeLabel: 'अपेक्षित दर श्रेणी',
    potentialGainLossLabel: 'संभाव्य नफा / तोटा',
    confidenceLabel: 'विश्वासार्हता (Confidence)',
    sellingWindowLabel: 'योग्य विक्री कालावधी',
    whyHeading: 'हा सल्ला का? (Why?)',
    findVerifiedBuyers: 'प्रमाणित खरेदीदार शोधा',
    speakAdvice: 'AI सल्ला ऐका (व्हॉइस)',
    speakingNow: 'सल्ला वाचून दाखवत आहे...',
    aiDisclaimer: 'AI अंदाज निर्णय सहाय्यासाठी आहेत आणि हमी दिलेले दर नाहीत.',
    highConfidence: 'उच्च विश्वासार्हता',
    moderateConfidence: 'मध्यम विश्वासार्हता',
    immediateWindow: 'आज (तातडीने)',
    loadingAdvisor: 'भाव, मागणी आणि भविष्यातील अंदाजाचे विश्लेषण सुरू आहे...',
    errorAdvisor: 'सल्ला लोड करता आला नाही. प्रादेशिक बेंचमार्क निर्णय दाखवला जात आहे.',
    totalLotBenefit: 'तुमच्या एकूण पिकावर अंदाजे अतिरिक्त नफा',
    // Screen 5: Verified Buyers
    verifiedBuyersTitle: 'नोंदणीकृत खरेदीदार आणि मिलर्स',
    verifiedBuyersSubtitle: 'वाहतूक खर्च वजा करून सर्वोत्तम निव्वळ दराने थेट खरेदीदारांना विका.',
    bestMatch: 'सर्वोत्तम पर्याय (Best Match)',
    requiredCrop: 'मागणी पीक',
    requiredQuantity: 'मागणी प्रमाण',
    offeredPrice: 'प्रस्तावित दर',
    distanceKm: 'अंतर',
    estimatedTransportCost: 'अंदाजे वाहतूक खर्च',
    estimatedNetRealization: 'अंदाजे निव्वळ दर',
    sendRequest: 'विनंती पाठवा',
    sendingRequest: 'विनंती पाठवत आहोत...',
    requestSentSuccess: 'खरेदी विनंती यशस्वीरित्या पाठवली गेली!',
    buyerTypeLabel: 'खरेदीदाराचा प्रकार',
    foodProcessor: 'अन्न प्रक्रिया युनिट',
    miller: 'दाल / फ्लोअर मिलर',
    institutionalBuyer: 'संस्थात्मक खरेदीदार',
    speakBuyersAdvice: 'सर्वोत्तम खरेदीदार ऐका (व्हॉइस)',
    speakingBuyersNow: 'खरेदीदार माहिती वाचून दाखवत आहे...',
    loadingBuyers: 'नोंदणीकृत खरेदीदार आणि मागणी लोड करत आहोत...',
    errorBuyers: 'माहिती उपलब्ध नाही. प्रादेशिक नोंदणीकृत खरेदीदार दाखवत आहोत.',
    noBuyersFoundForCrop: 'या पिकासाठी तुमच्या परिसरात सध्या खरेदीदार उपलब्ध नाहीत.',
    allCropsFilter: 'सर्व पिके',
    lotNetValue: 'एकूण पीक निव्वळ नफा',
    netInHandPerQtl: 'हातात मिळणारा निव्वळ दर / क्विंटल',
    // Voice Assistant Global Controls
    voiceTapToSpeak: 'बोलण्यासाठी दाबा',
    voiceListening: 'ऐकत आहोत...',
    voiceProcessing: 'तुमची विनंती समजून घेत आहोत...',
    voiceRecognizedText: 'ओळखलेला आवाज:',
    voiceUnavailable: 'या ब्राउझरमध्ये व्हॉइस सुविधा उपलब्ध नाही. कृपया थेट टाईप करा किंवा निवडा.',
    voiceMicPermissionDenied: 'मायक्रोफोन परवानगी नाकारली आहे. कृपया ब्राउझरमध्ये परवानगी द्या किंवा थेट टाईप करा.',
    voiceClear: 'साफ करा',
    voiceRetry: 'पुन्हा बोला',
    voiceApplyText: 'ही माहिती वापरा',
    // Market Price Inline Editor
    editCropModalTitle: 'पीक आणि प्रमाण बदला',
    cancelBtn: 'रद्द करा',
    confirmUpdateRates: 'निश्चित करा आणि दर पहा',
    selectCropPrompt: 'पीक निवडा',
    quantityInQuintals: 'प्रमाण (क्विंटल मध्ये)',
    mandiLocation: 'बाजारपेठ स्थान / जिल्हा',
    // Feature 1: Quality Matching & Breakdown
    qualityMatchingTitle: 'गुणवत्ता आणि मागणी जुळवणी',
    matchScoreLabel: 'मॅच स्कोअर',
    whyBuyerMatches: 'हा खरेदीदार का योग्य आहे?',
    cropVarietyFit: 'पीक आणि वाण जुळवणी',
    qualityMoistureFit: 'गुणवत्ता ग्रेड व ओलावा प्रमाण',
    volumeOrderFit: 'प्रमाण व किमान लॉट आकार',
    logisticsFit: 'शेतातून थेट वाहतूक व अंतर',
    priceBenefitFit: 'प्रीमियम निव्वळ नफा',
    qualityGradeLabel: 'गुणवत्ता श्रेणी',
    moistureLevelLabel: 'ओलावा पातळी',
    maxMoistureSpec: 'कमाल स्वीकार्य ओलावा',
    strongMatch: 'उत्कृष्ट पर्याय',
    goodMatch: 'चांगला पर्याय',
    moderateMatch: 'मध्यम पर्याय',
    // Feature 2: Arrival Volumes
    dailyArrivalVolume: 'दैनिक बाजार आवक (Arrivals)',
    arrivalTrendLabel: 'बाजार आवक कल',
    heavySupply: 'मोठ्या प्रमाणावर आवक',
    moderateSupply: 'मध्यम आवक',
    leanSupply: 'कमी / मर्यादित आवक',
    arrivalImpactTitle: 'बाजार आवक आणि दरावरील परिणाम',
    // Feature 3: Storage-Aware Selling Advisor
    storageAdvisorTitle: 'गोदाम खर्च विरुद्ध भविष्यातील नफा विश्लेषण',
    holdingCostLabel: 'अंदाजे वेअरहाऊस खर्च',
    projectedGrossGain: 'अपेक्षित भाव वाढ',
    storageCostPerMonth: 'गोदाम दर (₹/क्विंटल/महिना)',
    netGainAfterStorage: 'गोदाम खर्च वजा जाता निव्वळ नफा',
    storageViabilityProfitable: 'गोदाम खर्च वजा करूनही पीक साठवणे फायदेशीर आहे',
    storageViabilitySellNow: 'आजच विकणे योग्य: भाव वाढ गोदाम खर्चापेक्षा कमी आहे',
    warehouseStorageType: 'वैज्ञानिक वेअरहाऊस (सरकारी गोदाम)',
    onFarmStorageType: 'घर/शेतातील सुरक्षित साठवणूक',
    fpoSiloType: 'FPO आधुनिक सायलो / स्टील बिन',
    bookWarehouseSlot: 'वेअरहाऊसमध्ये जागा बुक करा',
    // Feature 4: Buyer Credentials & Payment Reliability
    buyerCredentialsTitle: 'नोंदणीकृत खरेदीदार माहिती व कायदेशीर KYC',
    statutoryKyc: 'कायदेशीर पडताळणी',
    gstinLabel: 'GSTIN क्रमांक',
    enamRegLabel: 'ई-नाम सदस्य नोंदणी',
    fssaiLicenseLabel: 'FSSAI केंद्रीय परवाना',
    procurementHistory: 'खरेदीचा ऐतिहासिक ट्रॅक रेकॉर्ड',
    tonnageProcuredLabel: 'एकूण खरेदी प्रमाण',
    experienceYearsLabel: 'खरेदी क्षेत्रातील अनुभव',
    paymentReliabilityTitle: 'पेमेंट विश्वासार्हता आणि एस्क्रो हमी',
    escrowGuaranteed: '१००% डिजिटल एस्क्रो सुरक्षितता',
    avgPaymentSpeed: 'सरासरी पेमेंट वर्ग वेळ',
    procurementOfficerContact: 'प्रादेशिक खरेदी अधिकारी संपर्क',
    // Feature 5: Net Realization Comparison
    netRealizationComparisonTitle: 'शेतकऱ्याचा निव्वळ नफा: बाजारपेठ विरुद्ध थेट खरेदीदार',
    nearbyMandiOption: 'नजीकची APMC बाजारपेठ',
    directBuyerOption: 'नोंदणीकृत खरेदीदार (शेतातून थेट)',
    grossPriceLabel: 'प्रस्तावित एकूण दर',
    mandiCessTaxDeduction: 'बाजार शुल्क व कर (१.५%)',
    loadingUnloadingDeduction: 'हमाली, तोलाई व मजुरी',
    finalNetInHandLabel: 'हातात मिळणारी निव्वळ रक्कम',
    directSellingAdvantage: 'थेट विक्रीचा अतिरिक्त निव्वळ नफा',
    // Feature 6: Transparent Transaction Summary
    transactionSummaryTitle: 'पारदर्शक संपूर्ण व्यवहार व पेमेंट चक्र',
    lifecycleStage1: 'लॉट तयार व AI गुणवत्ता तपासणी',
    lifecycleStage2: 'खरेदीदार निवड व ऑफर मान्य',
    lifecycleStage3: 'एस्क्रो खात्यात १००% रक्कम जमा',
    lifecycleStage4: 'डिजिटल गेट पास जारी (QR कोड)',
    lifecycleStage5: 'शेतातून वाहन रवाना (GPS ट्रॅकिंग)',
    lifecycleStage6: 'इलेक्ट्रॉनिक वजन काटा पावती',
    lifecycleStage7: 'बँक खात्यात थेट पेमेंट जमा (NEFT)',
    lifecycleStage8: 'व्यवहार पूर्ण व GST पक्के बिल',
    viewCompleteDealSummary: 'संपूर्ण व्यवहार तपशील पहा',
    // Step 1-4: Offline-First & Connectivity Mode Localization (Marathi)
    onlineStatus: 'ऑनलाइन',
    offlineStatus: 'ऑफलाइन मोड',
    syncingStatus: 'सिंक होत आहे...',
    reconnectingStatus: 'पुन्हा जोडणी होत आहे...',
    backOnlineStatus: 'पुन्हा ऑनलाइन',
    offlineModeBanner: 'ऑफलाइन मोड — साठवलेला डेटा वापरत आहे',
    offlineModeSubtext: 'शेवटचे साठवलेले बाजार भाव व खरेदीदार माहिती दाखवत आहे. इंटरनेट जोडणी झाल्यावर नवीन डेटा आपोआप सिंक होईल.',
    lastSyncedLabel: 'शेवटचे सिंक',
    lastUpdatedLabel: 'शेवटचे अपडेट',
    syncNowButton: 'आता सिंक करा',
    noSavedDataTitle: 'कोणतेही इंटरनेट नाही आणि साठवलेला डेटा उपलब्ध नाही.',
    noSavedDataDesc: 'आपल्या भागातील चालू बाजार भाव आणि खरेदीदारांची माहिती लोड करण्यासाठी एकदा इंटरनेटने कनेक्ट व्हा.',
    offlineAiNotice: 'लाइव्ह AI सल्ल्यासाठी इंटरनेट आवश्यक आहे. शेवटच्या साठवलेल्या भावांवर आधारित नियमबद्ध सल्ला दाखवत आहे.',
    offlineOfferSavedNotice: 'ऑफलाइन मोड: खरेदीदार ऑफर स्थानिकरित्या सेव्ह झाली. इंटरनेट उपलब्ध झाल्यावर पाठवली जाईल.',
    offlineListingSavedNotice: 'पीक नोंदणी मसुदा सुरक्षित केला. ऑनलाइन आल्यावर प्रसिद्ध केला जाईल.',
    pendingSyncBadge: 'सिंकसाठी प्रलंबित नोंदी',
    connectionHealthTitle: 'नेटवर्क व ऑफलाइन डेटा स्थिती',
    savedDataAvailable: 'सुरक्षित स्थानिक डेटा उपलब्ध',
  },
};
