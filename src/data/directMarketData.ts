import type { OrderLifecycleStep, BuyerPaymentStatus } from '../api/buyerApi';

export interface VerifiedBuyer {
  id: string;
  name: string;
  legalEntity: string;
  type: 'Corporate Food Processor' | 'Agri Export House' | 'Govt & FPO Collective' | 'Solvent & Oil Mill' | 'Certified Seed Company';
  logoText: string;
  badgeType: 'Govt Certified' | 'Corporate KYC' | 'e-NAM Registered' | 'A+ Escrow Rating';
  cropTarget: string;
  varietySpec: string;
  volumeWantedQuintals: number;
  minOrderQuintals: number;
  priceOfferedPerQuintal: number;
  localApmcBenchmark: number;
  premiumPerQuintal: number;
  location: string;
  district: string;
  state: string;
  distanceKm: number;
  pickupPreference: 'Farm-gate Pickup Available' | 'Mandi Depot Delivery' | 'Both Available';
  settlementTerms: 'Instant Digital Escrow' | 'Same-day Bank NEFT' | '48-Hour Bank Transfer';
  qualitySpecs: {
    maxMoisture: string;
    foreignMatterLimit: string;
    grainDamageLimit: string;
    admixtureTolerance: string;
  };
  kycVerification: {
    gstin: string;
    enamMemberId: string;
    fssaiLicense: string;
    yearsInProcurement: number;
    totalTonnageProcured: string;
    rating: number;
    reviewsCount: number;
  };
  procurementStatus: 'Active Tender' | 'Urgent Requirement' | 'Contract Open';
  expiresInDays: number;
}

export interface FarmerListing {
  id: string;
  farmerId?: number;
  cropName: string;
  variety: string;
  quantityQuintals: number;
  expectedPricePerQuintal: number;
  qualityGrade: 'Grade A' | 'Grade B' | 'Grade C' | 'Grade A Premium' | 'FAQ Standard' | 'Organic Certified' | 'Commercial Bulk' | string;
  moisturePercent?: number;
  foreignMatterPercent?: number;
  grainDamagePercent?: number;
  qualityRemarks?: string;
  cropImageUrl?: string;
  farmerName?: string;
  locationVillage: string;
  district: string;
  state: string;
  distanceKm?: number;
  verificationBadge?: boolean;
  availableDate: string;
  deliveryOption: 'Farm-gate Pickup Only' | 'Farmer Delivery to Depot' | 'Flexible' | string;
  fpoLotId?: string;
  status: 'Active & Matching' | 'In Negotiation' | 'Under Inspection' | 'Sold' | 'Deal Closed' | string;
  rawStatus?: string;
  matchedBuyersCount: number;
  viewsCount: number;
  createdAt: string;
}

export const FARMER_LISTINGS_DATA: FarmerListing[] = [
  {
    id: 'list-101',
    cropName: 'Wheat',
    variety: 'Sharbati Premium Gold Grade',
    quantityQuintals: 150,
    expectedPricePerQuintal: 2920,
    qualityGrade: 'Grade A Premium',
    moisturePercent: 10.4,
    farmerName: 'Rajinder Singh Patel',
    locationVillage: 'Ashta Village, Sehore',
    district: 'Sehore',
    state: 'Madhya Pradesh',
    distanceKm: 14,
    verificationBadge: true,
    availableDate: 'Ready for Immediate Dispatch',
    deliveryOption: 'Flexible',
    status: 'Active & Matching',
    matchedBuyersCount: 4,
    viewsCount: 28,
    createdAt: 'Yesterday',
  },
  {
    id: 'list-102',
    cropName: 'Soybean',
    variety: 'Yellow Seed (JS-9560)',
    quantityQuintals: 80,
    expectedPricePerQuintal: 4780,
    qualityGrade: 'FAQ Standard',
    moisturePercent: 9.8,
    farmerName: 'Mukesh Choudhary',
    locationVillage: 'Ichhawar Village, Sehore',
    district: 'Sehore',
    state: 'Madhya Pradesh',
    distanceKm: 22,
    verificationBadge: true,
    availableDate: 'Available from 25 Aug',
    deliveryOption: 'Farm-gate Pickup Only',
    status: 'Active & Matching',
    matchedBuyersCount: 3,
    viewsCount: 19,
    createdAt: '3 days ago',
  },
  {
    id: 'list-103',
    cropName: 'Mustard / Rapeseed',
    variety: 'Pusa Bold High-Oil',
    quantityQuintals: 120,
    expectedPricePerQuintal: 5540,
    qualityGrade: 'Grade A Premium',
    moisturePercent: 7.9,
    farmerName: 'Bherunda Farmer Producer Co.',
    locationVillage: 'Nasrullaganj, Sehore',
    district: 'Sehore',
    state: 'Madhya Pradesh',
    distanceKm: 38,
    verificationBadge: true,
    availableDate: 'Ready for Immediate Dispatch',
    deliveryOption: 'Farmer Delivery to Depot',
    status: 'Active & Matching',
    matchedBuyersCount: 5,
    viewsCount: 42,
    createdAt: '2 days ago',
  },
  {
    id: 'list-104',
    cropName: 'Cotton',
    variety: 'Shankar-6 Long Staple',
    quantityQuintals: 95,
    expectedPricePerQuintal: 7200,
    qualityGrade: 'Grade A Premium',
    moisturePercent: 8.2,
    farmerName: 'Devendra Gurjar (FPO)',
    locationVillage: 'Sonkatch, Dewas',
    district: 'Dewas',
    state: 'Madhya Pradesh',
    distanceKm: 46,
    verificationBadge: true,
    availableDate: 'Ready for Immediate Dispatch',
    deliveryOption: 'Farm-gate Pickup Only',
    status: 'Active & Matching',
    matchedBuyersCount: 2,
    viewsCount: 16,
    createdAt: 'Today',
  },
  {
    id: 'list-105',
    cropName: 'Basmati Paddy',
    variety: 'Pusa 1121 Export Grade',
    quantityQuintals: 200,
    expectedPricePerQuintal: 4050,
    qualityGrade: 'Grade A Premium',
    moisturePercent: 11.8,
    farmerName: 'Kailash Verma & Sons',
    locationVillage: 'Hoshangabad Road, Raisen',
    district: 'Raisen',
    state: 'Madhya Pradesh',
    distanceKm: 58,
    verificationBadge: true,
    availableDate: 'Available from 28 Aug',
    deliveryOption: 'Flexible',
    status: 'Active & Matching',
    matchedBuyersCount: 6,
    viewsCount: 55,
    createdAt: '1 day ago',
  },
  {
    id: 'list-106',
    cropName: 'Chana (Bengal Gram)',
    variety: 'Desi Bold / Dollar Chana',
    quantityQuintals: 110,
    expectedPricePerQuintal: 5800,
    qualityGrade: 'FAQ Standard',
    moisturePercent: 9.2,
    farmerName: 'Om Prakash Meena',
    locationVillage: 'Biaora, Rajgarh',
    district: 'Rajgarh',
    state: 'Madhya Pradesh',
    distanceKm: 74,
    verificationBadge: false,
    availableDate: 'Ready for Immediate Dispatch',
    deliveryOption: 'Farm-gate Pickup Only',
    status: 'Active & Matching',
    matchedBuyersCount: 3,
    viewsCount: 21,
    createdAt: '4 days ago',
  },
];

export interface DirectSupplyRequest {
  id: string;
  listingId?: number | string;
  buyerId: string | number;
  buyerName: string;
  farmerId?: number;
  farmerName?: string;
  farmerLocation?: string;
  cropName: string;
  variety?: string;
  quantityOfferedQuintals: number;
  offeredPricePerQuintal: number;
  farmerExpectedPrice?: number;
  buyerPostedPrice: number;
  totalContractValue: number;
  pickupType: string;
  deliveryOption?: string;
  proposedDate: string;
  qualityGrade?: string;
  qualityMatchScore?: number;
  qualityMatchStatus?: 'MATCH' | 'PARTIAL MATCH' | 'NOT MATCHED';
  status: 'Submitted' | 'Under Review' | 'Counter-Offer Received' | 'Offer Accepted' | 'Inspection Scheduled' | 'pending' | 'accepted' | 'countered' | 'rejected' | 'completed' | string;
  orderId?: string;
  orderStatus?: OrderLifecycleStep;
  paymentStatus?: BuyerPaymentStatus;
  totalValue?: number;
  statusMessage: string;
  submittedAt: string;
  counterPrice?: number;
  availableListingQuantity?: number;
  isOverAvailableQuantity?: boolean;
  gatePassId?: string;
  logistics?: {
    status: 'REQUESTED' | 'SCHEDULED' | 'PICKED UP' | 'IN TRANSIT' | 'DELIVERED';
    pickup_location: string;
    delivery_location: string;
    pickup_date: string;
    vehicle_type: string;
    estimated_freight: number;
    actual_freight?: number;
    transporter_name?: string;
    contact_number?: string;
  };
  payment?: {
    status: 'PENDING' | 'ADVANCE PAID' | 'PARTIALLY PAID' | 'FULLY PAID';
    total_trade_value: number;
    amount_paid: number;
    remaining_amount: number;
    payment_due_date: string;
    payment_method: string;
    escrow_token: string;
  };
  timeline?: Array<{
    event_type: string;
    title: string;
    description: string;
    timestamp: string;
    actor_name: string;
    actor_role: string;
  }>;
}

export interface StorageFacility {
  id: number;
  name: string;
  location: string;
  district: string;
  state: string;
  distanceKm: number;
  totalCapacityMt: number;
  availableCapacityMt: number;
  estimatedCostPerQtlMonth: number;
  storageType: 'Scientific Warehouse' | 'Cold Storage' | 'Metal Silo' | 'Covered Shed';
  accreditation: string;
  insuranceCovered: boolean;
  contactPhone: string;
  isSampleData: boolean;
}

export interface StorageBooking {
  id: number;
  facilityId: number;
  facilityName: string;
  farmerId: number;
  farmerName: string;
  cropName: string;
  quantityQuintals: number;
  requiredDurationDays: number;
  location: string;
  estimatedCostTotal: number;
  status: 'REQUESTED' | 'CONFIRMED' | 'ACTIVE' | 'RELEASED';
  createdAt: string;
}

export interface DisputeTicket {
  id: number;
  tradeId: number | string;
  gatePassId?: string;
  complainantId: number;
  complainantName: string;
  complainantRole: 'farmer' | 'buyer' | 'fpo';
  respondentName: string;
  category: 'Payment Issue' | 'Quality Dispute' | 'Quantity Mismatch' | 'Delivery Issue' | 'Buyer Issue' | 'Seller Issue' | 'Other';
  description: string;
  evidenceNotes?: string;
  status: 'OPEN' | 'UNDER REVIEW' | 'RESOLVED';
  resolutionNotes?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FpoAggregatedLot {
  id: string;
  fpoName: string;
  fpoDistrict: string;
  fpoState: string;
  cropName: string;
  variety: string;
  qualityGrade: string;
  totalAggregatedQuantity: number;
  contributingFarmersCount: number;
  targetPricePerQuintal: number;
  contributions: Array<{
    farmer_id: number;
    farmer_name: string;
    quantity: number;
    listing_id?: number;
  }>;
  status: 'OPEN_FOR_INSTITUTIONAL_BID' | 'CONTRACTED' | 'FULFILLED';
  createdAt: string;
}

export const STORAGE_FACILITIES_SEED: StorageFacility[] = [
  {
    id: 1,
    name: 'MP State Warehousing Corp (MPSWC) - Sehore Yard',
    location: 'Station Road, Sehore',
    district: 'Sehore',
    state: 'Madhya Pradesh',
    distanceKm: 9,
    totalCapacityMt: 8500,
    availableCapacityMt: 2100,
    estimatedCostPerQtlMonth: 12,
    storageType: 'Scientific Warehouse',
    accreditation: 'WDRA Certified & e-NWR Linked',
    insuranceCovered: true,
    contactPhone: '+91 7562 224150',
    isSampleData: true,
  },
  {
    id: 2,
    name: 'Central Warehousing Corporation (CWC) - Bhopal Hub',
    location: 'Nisatpura Industrial Area, Bhopal',
    district: 'Bhopal',
    state: 'Madhya Pradesh',
    distanceKm: 36,
    totalCapacityMt: 25000,
    availableCapacityMt: 6400,
    estimatedCostPerQtlMonth: 14,
    storageType: 'Scientific Warehouse',
    accreditation: 'Govt CWC Grade-I Warehouse',
    insuranceCovered: true,
    contactPhone: '+91 755 2748900',
    isSampleData: true,
  },
  {
    id: 3,
    name: 'Kisan Samriddhi Agri Silos & Cold Chamber',
    location: 'Ashta Bypass, Sehore',
    district: 'Sehore',
    state: 'Madhya Pradesh',
    distanceKm: 14,
    totalCapacityMt: 4000,
    availableCapacityMt: 1100,
    estimatedCostPerQtlMonth: 16,
    storageType: 'Metal Silo',
    accreditation: 'NABARD Assisted FPO Silo',
    insuranceCovered: true,
    contactPhone: '+91 7562 239800',
    isSampleData: true,
  },
];

export interface CompletedDeal {
  id: string;
  contractRef: string;
  buyerName: string;
  cropName: string;
  quantityQuintals: number;
  finalPricePerQuintal: number;
  totalSettlement: number;
  deliveryDate: string;
  paymentStatus: 'Escrow Released to Bank' | 'Settled via NEFT' | 'Tax Invoice Generated';
  ratingGiven: number;
  gatePassNumber: string;
}

export const VERIFIED_BUYERS_DATA: VerifiedBuyer[] = [
  {
    id: 'buy-01',
    name: 'Patanjali Agro Processing Ltd',
    legalEntity: 'Patanjali Foods Limited (Procurement Div)',
    type: 'Corporate Food Processor',
    logoText: 'PA',
    badgeType: 'Corporate KYC',
    cropTarget: 'Wheat',
    varietySpec: 'Sharbati / Lokwan (Luster Grade A)',
    volumeWantedQuintals: 1200,
    minOrderQuintals: 50,
    priceOfferedPerQuintal: 2940,
    localApmcBenchmark: 2860,
    premiumPerQuintal: 80,
    location: 'Sehore Industrial Hub, MP',
    district: 'Sehore',
    state: 'Madhya Pradesh',
    distanceKm: 14,
    pickupPreference: 'Farm-gate Pickup Available',
    settlementTerms: 'Instant Digital Escrow',
    qualitySpecs: {
      maxMoisture: '11.0%',
      foreignMatterLimit: '0.75%',
      grainDamageLimit: '1.2%',
      admixtureTolerance: '2.0%',
    },
    kycVerification: {
      gstin: '23AAACP8921M1Z4',
      enamMemberId: 'ENAM-MP-PROC-881',
      fssaiLicense: '10014022002781',
      yearsInProcurement: 12,
      totalTonnageProcured: '84,000 MT',
      rating: 4.9,
      reviewsCount: 428,
    },
    procurementStatus: 'Urgent Requirement',
    expiresInDays: 3,
  },
  {
    id: 'buy-02',
    name: 'ITC e-Choupal Procurement Division',
    legalEntity: 'ITC Agri Business Division (ABD)',
    type: 'Corporate Food Processor',
    logoText: 'ITC',
    badgeType: 'Govt Certified',
    cropTarget: 'Soybean',
    varietySpec: 'Yellow Seed (Oil Content > 18.5%)',
    volumeWantedQuintals: 850,
    minOrderQuintals: 40,
    priceOfferedPerQuintal: 4760,
    localApmcBenchmark: 4680,
    premiumPerQuintal: 80,
    location: 'Dewas Logistics Hub, MP',
    district: 'Dewas',
    state: 'Madhya Pradesh',
    distanceKm: 32,
    pickupPreference: 'Both Available',
    settlementTerms: 'Same-day Bank NEFT',
    qualitySpecs: {
      maxMoisture: '10.0%',
      foreignMatterLimit: '1.0%',
      grainDamageLimit: '1.5%',
      admixtureTolerance: '1.8%',
    },
    kycVerification: {
      gstin: '23AAACI1920L1Z8',
      enamMemberId: 'ENAM-MP-PROC-104',
      fssaiLicense: '10012011000145',
      yearsInProcurement: 24,
      totalTonnageProcured: '220,000 MT',
      rating: 4.95,
      reviewsCount: 1250,
    },
    procurementStatus: 'Active Tender',
    expiresInDays: 7,
  },
  {
    id: 'buy-03',
    name: 'Adani Wilmar Solvents & Oils',
    legalEntity: 'Adani Wilmar Limited (Fortune Oils)',
    type: 'Solvent & Oil Mill',
    logoText: 'AW',
    badgeType: 'A+ Escrow Rating',
    cropTarget: 'Mustard Seed',
    varietySpec: 'Sarson (Oil Content > 41.5%)',
    volumeWantedQuintals: 2000,
    minOrderQuintals: 100,
    priceOfferedPerQuintal: 5580,
    localApmcBenchmark: 5490,
    premiumPerQuintal: 90,
    location: 'Indore Bypass Industrial Terminal, MP',
    district: 'Indore',
    state: 'Madhya Pradesh',
    distanceKm: 48,
    pickupPreference: 'Mandi Depot Delivery',
    settlementTerms: 'Instant Digital Escrow',
    qualitySpecs: {
      maxMoisture: '8.0%',
      foreignMatterLimit: '1.2%',
      grainDamageLimit: '1.0%',
      admixtureTolerance: '2.0%',
    },
    kycVerification: {
      gstin: '24AAACA1299P1ZK',
      enamMemberId: 'ENAM-GJ-PROC-540',
      fssaiLicense: '10013021000492',
      yearsInProcurement: 18,
      totalTonnageProcured: '310,000 MT',
      rating: 4.85,
      reviewsCount: 890,
    },
    procurementStatus: 'Active Tender',
    expiresInDays: 5,
  },
  {
    id: 'buy-04',
    name: 'Olam Agri Global Exporters',
    legalEntity: 'Olam Agro India Private Limited',
    type: 'Agri Export House',
    logoText: 'OA',
    badgeType: 'e-NAM Registered',
    cropTarget: 'Cotton',
    varietySpec: 'Shankar-6 (29-30mm Staple length)',
    volumeWantedQuintals: 1500,
    minOrderQuintals: 75,
    priceOfferedPerQuintal: 7280,
    localApmcBenchmark: 7150,
    premiumPerQuintal: 130,
    location: 'Khandwa Ginning Terminal, MP',
    district: 'Khandwa',
    state: 'Madhya Pradesh',
    distanceKm: 82,
    pickupPreference: 'Farm-gate Pickup Available',
    settlementTerms: 'Instant Digital Escrow',
    qualitySpecs: {
      maxMoisture: '8.5%',
      foreignMatterLimit: '2.0%',
      grainDamageLimit: '1.0%',
      admixtureTolerance: '1.5%',
    },
    kycVerification: {
      gstin: '07AAAC00821M1Z1',
      enamMemberId: 'ENAM-ND-PROC-901',
      fssaiLicense: '10016011000301',
      yearsInProcurement: 15,
      totalTonnageProcured: '145,000 MT',
      rating: 4.9,
      reviewsCount: 510,
    },
    procurementStatus: 'Contract Open',
    expiresInDays: 12,
  },
  {
    id: 'buy-05',
    name: 'KRBL Basmati India (India Gate)',
    legalEntity: 'KRBL Limited (Basmati Rice Division)',
    type: 'Agri Export House',
    logoText: 'KR',
    badgeType: 'Corporate KYC',
    cropTarget: 'Basmati Paddy',
    varietySpec: 'Pusa 1121 / 1509 Aged Grade',
    volumeWantedQuintals: 2500,
    minOrderQuintals: 100,
    priceOfferedPerQuintal: 4120,
    localApmcBenchmark: 3980,
    premiumPerQuintal: 140,
    location: 'Karnal Milling Depot / Alwar Hub',
    district: 'Alwar',
    state: 'Rajasthan',
    distanceKm: 160,
    pickupPreference: 'Mandi Depot Delivery',
    settlementTerms: 'Same-day Bank NEFT',
    qualitySpecs: {
      maxMoisture: '12.5%',
      foreignMatterLimit: '0.5%',
      grainDamageLimit: '1.0%',
      admixtureTolerance: '1.0%',
    },
    kycVerification: {
      gstin: '06AAACK2910J1Z5',
      enamMemberId: 'ENAM-HR-PROC-719',
      fssaiLicense: '10012064000012',
      yearsInProcurement: 30,
      totalTonnageProcured: '450,000 MT',
      rating: 4.92,
      reviewsCount: 1620,
    },
    procurementStatus: 'Active Tender',
    expiresInDays: 9,
  },
  {
    id: 'buy-06',
    name: 'Madhya Bharat FPO Apex Federation',
    legalEntity: 'Madhya Bharat Producer Co. Ltd (NABARD / SFAC)',
    type: 'Govt & FPO Collective',
    logoText: 'MB',
    badgeType: 'Govt Certified',
    cropTarget: 'Chana (Bengal Gram)',
    varietySpec: 'Desi Bold / Dollar Chana FAQ',
    volumeWantedQuintals: 900,
    minOrderQuintals: 30,
    priceOfferedPerQuintal: 5880,
    localApmcBenchmark: 5800,
    premiumPerQuintal: 80,
    location: 'Ujjain FPO Aggregation Center, MP',
    district: 'Ujjain',
    state: 'Madhya Pradesh',
    distanceKm: 56,
    pickupPreference: 'Farm-gate Pickup Available',
    settlementTerms: 'Instant Digital Escrow',
    qualitySpecs: {
      maxMoisture: '9.5%',
      foreignMatterLimit: '1.0%',
      grainDamageLimit: '1.5%',
      admixtureTolerance: '2.0%',
    },
    kycVerification: {
      gstin: '23AAICM4091K1ZX',
      enamMemberId: 'ENAM-MP-FPO-019',
      fssaiLicense: '10019022001923',
      yearsInProcurement: 7,
      totalTonnageProcured: '38,000 MT',
      rating: 4.88,
      reviewsCount: 290,
    },
    procurementStatus: 'Active Tender',
    expiresInDays: 4,
  },
];

export const INITIAL_SUPPLY_REQUESTS: DirectSupplyRequest[] = [
  {
    id: 'REQ-8821',
    buyerId: 'buy-01',
    buyerName: 'Patanjali Agro Processing Ltd',
    cropName: 'Wheat (Sharbati Grade A)',
    quantityOfferedQuintals: 100,
    offeredPricePerQuintal: 2940,
    buyerPostedPrice: 2940,
    totalContractValue: 294000,
    pickupType: 'Farm-gate Pickup (Assisted Weighment)',
    proposedDate: '24 Aug 2026',
    status: 'Offer Accepted',
    statusMessage: 'Buyer accepted offer rate. Gate pass & truck dispatch scheduled.',
    submittedAt: 'Today, 09:30 AM',
    gatePassId: 'GP-SEH-9941',
  },
  {
    id: 'REQ-8820',
    buyerId: 'buy-02',
    buyerName: 'ITC e-Choupal Procurement Division',
    cropName: 'Soybean (Yellow Seed)',
    quantityOfferedQuintals: 60,
    offeredPricePerQuintal: 4780,
    buyerPostedPrice: 4760,
    totalContractValue: 285600,
    pickupType: 'Farmer Delivery to Dewas Hub',
    proposedDate: '26 Aug 2026',
    status: 'Counter-Offer Received',
    counterPrice: 4760,
    statusMessage: 'Buyer countered at ₹4,760/q with free unloading & moisture allowance.',
    submittedAt: 'Yesterday, 04:15 PM',
  },
];

export const COMPLETED_DEALS_DATA: CompletedDeal[] = [
  {
    id: 'deal-01',
    contractRef: 'DIR-CNT-2026-MP-0491',
    buyerName: 'Patanjali Agro Processing Ltd',
    cropName: 'Wheat (Sharbati Grade A)',
    quantityQuintals: 80,
    finalPricePerQuintal: 2900,
    totalSettlement: 232000,
    deliveryDate: '12 Jul 2026',
    paymentStatus: 'Escrow Released to Bank',
    ratingGiven: 5,
    gatePassNumber: 'GP-SEH-8102',
  },
  {
    id: 'deal-02',
    contractRef: 'DIR-CNT-2026-MP-0312',
    buyerName: 'ITC e-Choupal Procurement Division',
    cropName: 'Chana (Desi Bold)',
    quantityQuintals: 50,
    finalPricePerQuintal: 5750,
    totalSettlement: 287500,
    deliveryDate: '28 May 2026',
    paymentStatus: 'Settled via NEFT',
    ratingGiven: 5,
    gatePassNumber: 'GP-DEW-6411',
  },
];

export const INITIAL_FARMER_LISTINGS = FARMER_LISTINGS_DATA;


