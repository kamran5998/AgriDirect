export interface AdminKPIs {
  totalFarmers: number;
  activeFarmers: number;
  registeredBuyers: number;
  trackedMarkets: number;
  cropsTracked: number;
  activeListings: number;
  dailyTradingVolumeMT: number;
  apiSyncHealth: number; // e.g. 99.8%
}

export interface AdminFarmerRecord {
  id: string;
  farmerId: string;
  fullName: string;
  mobile: string;
  village: string;
  district: string;
  state: string;
  landSizeAcres: string;
  primaryCrops: string[];
  verificationStatus: 'Verified (KCC & Aadhaar)' | 'Pending Review' | 'Flagged';
  kycDocType: 'Kisan Credit Card' | 'Land Record (Khatauni)' | 'Aadhaar e-KYC';
  totalLotsListed: number;
  totalVolumeSoldQuintals: number;
  registrationDate: string;
  lastActive: string;
}

export interface AdminBuyerRecord {
  id: string;
  buyerId: string;
  companyName: string;
  entityType: 'Corporate Processor' | 'Export House' | 'Govt & FPO Collective' | 'Solvent Mill' | 'Seed Enterprise';
  contactPerson: string;
  mobile: string;
  email: string;
  location: string;
  district: string;
  state: string;
  gstin: string;
  enamMemberId: string;
  fssaiNumber: string;
  verificationStatus: 'Verified & Certified' | 'Pending Audit' | 'Suspended';
  activeTendersCount: number;
  totalProcuredMT: number;
  escrowRating: string;
  joinedDate: string;
}

export interface AdminMarketFeedRecord {
  id: string;
  marketName: string;
  district: string;
  state: string;
  cropName: string;
  variety: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  dailyArrivalsMT: number;
  lastSyncTimestamp: string;
  syncSource: 'Agmarknet Real-time API' | 'e-NAM Gateway' | 'State Mandi Board EDI' | 'Manual Override';
  status: 'Live Synced' | 'Ingestion Lag (15m)' | 'Anomaly Flagged' | 'Offline';
  confidenceScore: number;
}

export interface AdminSystemAlert {
  id: string;
  timestamp: string;
  type: 'security' | 'price-anomaly' | 'kyc-submission' | 'api-sync' | 'mandi-notice' | 'tender-created';
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  entityRef?: string;
  resolved: boolean;
}

export interface VerificationRequest {
  id: string;
  userType: 'farmer' | 'buyer';
  userName: string;
  entityName?: string;
  contactNumber: string;
  location: string;
  appliedDate: string;
  submittedDocs: {
    docName: string;
    docNumber: string;
    status: 'Verified Valid' | 'Awaiting OCR Check' | 'Manual Review Required';
  }[];
  notes: string;
  riskScore: 'Low Risk (Score 98/100)' | 'Medium Risk' | 'Flagged';
}

export const ADMIN_KPIS: AdminKPIs = {
  totalFarmers: 148520,
  activeFarmers: 94230,
  registeredBuyers: 3840,
  trackedMarkets: 2418,
  cropsTracked: 156,
  activeListings: 14920,
  dailyTradingVolumeMT: 48500,
  apiSyncHealth: 99.85,
};

export const ADMIN_FARMERS_DATA: AdminFarmerRecord[] = [
  {
    id: 'f-01',
    farmerId: 'FARM-MP-8401',
    fullName: 'Rajinder Singh Solanki',
    mobile: '+91 98765 43210',
    village: 'Ashta Village',
    district: 'Sehore',
    state: 'Madhya Pradesh',
    landSizeAcres: '8.5 Acres',
    primaryCrops: ['Wheat (Sharbati)', 'Soybean (JS-9560)', 'Chana'],
    verificationStatus: 'Verified (KCC & Aadhaar)',
    kycDocType: 'Kisan Credit Card',
    totalLotsListed: 12,
    totalVolumeSoldQuintals: 450,
    registrationDate: '14 Jan 2025',
    lastActive: '12 mins ago',
  },
  {
    id: 'f-02',
    farmerId: 'FARM-PB-9120',
    fullName: 'Gurpreet Singh Mann',
    mobile: '+91 98140 88219',
    village: 'Samana Rural',
    district: 'Patiala',
    state: 'Punjab',
    landSizeAcres: '18 Acres',
    primaryCrops: ['Basmati Rice (Pusa 1121)', 'Wheat (HD-2967)'],
    verificationStatus: 'Verified (KCC & Aadhaar)',
    kycDocType: 'Land Record (Khatauni)',
    totalLotsListed: 22,
    totalVolumeSoldQuintals: 1200,
    registrationDate: '02 Feb 2025',
    lastActive: '1 hour ago',
  },
  {
    id: 'f-03',
    farmerId: 'FARM-MH-6031',
    fullName: 'Anil Dashrath Patil',
    mobile: '+91 94220 71920',
    village: 'Pachora Tehsil',
    district: 'Jalgaon',
    state: 'Maharashtra',
    landSizeAcres: '6.0 Acres',
    primaryCrops: ['Cotton (Shankar-6)', 'Soybean', 'Maize'],
    verificationStatus: 'Verified (KCC & Aadhaar)',
    kycDocType: 'Aadhaar e-KYC',
    totalLotsListed: 8,
    totalVolumeSoldQuintals: 280,
    registrationDate: '19 Mar 2025',
    lastActive: '3 hours ago',
  },
  {
    id: 'f-04',
    farmerId: 'FARM-RJ-3319',
    fullName: 'Bhanwar Lal Meena',
    mobile: '+91 94142 99014',
    village: 'Niwai Block',
    district: 'Tonk',
    state: 'Rajasthan',
    landSizeAcres: '11.2 Acres',
    primaryCrops: ['Mustard (Sarson)', 'Moong', 'Bajra'],
    verificationStatus: 'Pending Review',
    kycDocType: 'Land Record (Khatauni)',
    totalLotsListed: 4,
    totalVolumeSoldQuintals: 140,
    registrationDate: '18 Aug 2026',
    lastActive: '22 mins ago',
  },
  {
    id: 'f-05',
    farmerId: 'FARM-GJ-4481',
    fullName: 'Kiranbhai Patel',
    mobile: '+91 98251 33091',
    village: 'Gondal Sub-district',
    district: 'Rajkot',
    state: 'Gujarat',
    landSizeAcres: '14 Acres',
    primaryCrops: ['Groundnut (Bold)', 'Cotton', 'Cumin'],
    verificationStatus: 'Verified (KCC & Aadhaar)',
    kycDocType: 'Kisan Credit Card',
    totalLotsListed: 15,
    totalVolumeSoldQuintals: 620,
    registrationDate: '10 Nov 2024',
    lastActive: 'Just now',
  },
  {
    id: 'f-06',
    farmerId: 'FARM-UP-5512',
    fullName: 'Rameshwar Yadav',
    mobile: '+91 97931 44021',
    village: 'Chandausi Outskirts',
    district: 'Sambhal',
    state: 'Uttar Pradesh',
    landSizeAcres: '5.0 Acres',
    primaryCrops: ['Wheat', 'Potato', 'Mentha'],
    verificationStatus: 'Pending Review',
    kycDocType: 'Aadhaar e-KYC',
    totalLotsListed: 2,
    totalVolumeSoldQuintals: 90,
    registrationDate: '19 Aug 2026',
    lastActive: '5 hours ago',
  },
];

export const ADMIN_BUYERS_DATA: AdminBuyerRecord[] = [
  {
    id: 'b-01',
    buyerId: 'BUY-CORP-010',
    companyName: 'Patanjali Agro Processing Ltd',
    entityType: 'Corporate Processor',
    contactPerson: 'Vikram Acharya (Head Procurement)',
    mobile: '+91 98110 55012',
    email: 'procurement@patanjaliayurved.org',
    location: 'Sehore Industrial Depot',
    district: 'Sehore',
    state: 'Madhya Pradesh',
    gstin: '23AAACP8921M1Z4',
    enamMemberId: 'ENAM-MP-PROC-881',
    fssaiNumber: '10014022002781',
    verificationStatus: 'Verified & Certified',
    activeTendersCount: 4,
    totalProcuredMT: 8400,
    escrowRating: 'AAA (Zero Default)',
    joinedDate: '12 Jan 2024',
  },
  {
    id: 'b-02',
    buyerId: 'BUY-CORP-022',
    companyName: 'ITC e-Choupal Agri Business Div',
    entityType: 'Corporate Processor',
    contactPerson: 'Sanjay Deshmukh (Zonal Manager)',
    mobile: '+91 98220 44019',
    email: 'agri.procurement@itc.in',
    location: 'Dewas Logistics Hub',
    district: 'Dewas',
    state: 'Madhya Pradesh',
    gstin: '23AAACI1920L1Z8',
    enamMemberId: 'ENAM-MP-PROC-104',
    fssaiNumber: '10012011000145',
    verificationStatus: 'Verified & Certified',
    activeTendersCount: 6,
    totalProcuredMT: 22000,
    escrowRating: 'AAA (Zero Default)',
    joinedDate: '08 Mar 2023',
  },
  {
    id: 'b-03',
    buyerId: 'BUY-MILL-031',
    companyName: 'Adani Wilmar Solvents & Oils',
    entityType: 'Solvent Mill',
    contactPerson: 'Naveen Jindal',
    mobile: '+91 97120 99014',
    email: 'crushing.leads@adaniwilmar.in',
    location: 'Indore Bypass Industrial Terminal',
    district: 'Indore',
    state: 'Madhya Pradesh',
    gstin: '24AAACA1299P1ZK',
    enamMemberId: 'ENAM-GJ-PROC-540',
    fssaiNumber: '10013021000492',
    verificationStatus: 'Verified & Certified',
    activeTendersCount: 3,
    totalProcuredMT: 31000,
    escrowRating: 'AA+ Escrow Verified',
    joinedDate: '15 Jun 2024',
  },
  {
    id: 'b-04',
    buyerId: 'BUY-EXP-044',
    companyName: 'KRBL Basmati India (India Gate)',
    entityType: 'Export House',
    contactPerson: 'Harish Chadha',
    mobile: '+91 98112 00194',
    email: 'export.grain@krblindia.com',
    location: 'Karnal Milling Depot / Alwar Hub',
    district: 'Alwar',
    state: 'Rajasthan',
    gstin: '06AAACK2910J1Z5',
    enamMemberId: 'ENAM-HR-PROC-719',
    fssaiNumber: '10012064000012',
    verificationStatus: 'Verified & Certified',
    activeTendersCount: 5,
    totalProcuredMT: 45000,
    escrowRating: 'AAA (Zero Default)',
    joinedDate: '20 Sep 2023',
  },
  {
    id: 'b-05',
    buyerId: 'BUY-FPO-058',
    companyName: 'Madhya Bharat FPO Apex Federation',
    entityType: 'Govt & FPO Collective',
    contactPerson: 'Dr. R.K. Sharma (MD)',
    mobile: '+91 94250 88201',
    email: 'md@madhyabharatfpo.org',
    location: 'Ujjain FPO Aggregation Center',
    district: 'Ujjain',
    state: 'Madhya Pradesh',
    gstin: '23AAICM4091K1ZX',
    enamMemberId: 'ENAM-MP-FPO-019',
    fssaiNumber: '10019022001923',
    verificationStatus: 'Verified & Certified',
    activeTendersCount: 2,
    totalProcuredMT: 3800,
    escrowRating: 'State NABARD Backed',
    joinedDate: '01 Nov 2024',
  },
  {
    id: 'b-06',
    buyerId: 'BUY-PEND-092',
    companyName: 'Sunrise Agro Commodities Exim',
    entityType: 'Export House',
    contactPerson: 'Mahesh Agarwal',
    mobile: '+91 98200 11920',
    email: 'info@sunriseagroexim.com',
    location: 'Navi Mumbai Port Hub',
    district: 'Thane',
    state: 'Maharashtra',
    gstin: '27AABCS9910K1ZV',
    enamMemberId: 'Pending Verification',
    fssaiNumber: '10022022008401',
    verificationStatus: 'Pending Audit',
    activeTendersCount: 0,
    totalProcuredMT: 0,
    escrowRating: 'Under Bank KYC',
    joinedDate: '18 Aug 2026',
  },
];

export const ADMIN_MARKET_FEEDS: AdminMarketFeedRecord[] = [
  {
    id: 'feed-01',
    marketName: 'Sehore APMC Terminal',
    district: 'Sehore',
    state: 'Madhya Pradesh',
    cropName: 'Wheat',
    variety: 'Sharbati FAQ',
    modalPrice: 2860,
    minPrice: 2750,
    maxPrice: 2980,
    dailyArrivalsMT: 1240,
    lastSyncTimestamp: '3 mins ago (07:22 AM)',
    syncSource: 'Agmarknet Real-time API',
    status: 'Live Synced',
    confidenceScore: 99.4,
  },
  {
    id: 'feed-02',
    marketName: 'Dewas APMC Yard',
    district: 'Dewas',
    state: 'Madhya Pradesh',
    cropName: 'Soybean',
    variety: 'Yellow Seed',
    modalPrice: 4680,
    minPrice: 4520,
    maxPrice: 4820,
    dailyArrivalsMT: 890,
    lastSyncTimestamp: '5 mins ago (07:20 AM)',
    syncSource: 'e-NAM Gateway',
    status: 'Live Synced',
    confidenceScore: 98.9,
  },
  {
    id: 'feed-03',
    marketName: 'Indore (Choithram) Mandi',
    district: 'Indore',
    state: 'Madhya Pradesh',
    cropName: 'Mustard Seed',
    variety: 'Sarson Standard',
    modalPrice: 5490,
    minPrice: 5350,
    maxPrice: 5640,
    dailyArrivalsMT: 1650,
    lastSyncTimestamp: '2 mins ago (07:23 AM)',
    syncSource: 'Agmarknet Real-time API',
    status: 'Live Synced',
    confidenceScore: 99.8,
  },
  {
    id: 'feed-04',
    marketName: 'Khanna Grain Market',
    district: 'Ludhiana',
    state: 'Punjab',
    cropName: 'Basmati Paddy',
    variety: 'Pusa 1121 Aged',
    modalPrice: 3980,
    minPrice: 3820,
    maxPrice: 4180,
    dailyArrivalsMT: 3100,
    lastSyncTimestamp: '12 mins ago (07:13 AM)',
    syncSource: 'State Mandi Board EDI',
    status: 'Live Synced',
    confidenceScore: 97.5,
  },
  {
    id: 'feed-05',
    marketName: 'Gondal APMC Terminal',
    district: 'Rajkot',
    state: 'Gujarat',
    cropName: 'Cotton',
    variety: 'Shankar-6',
    modalPrice: 7150,
    minPrice: 6980,
    maxPrice: 7380,
    dailyArrivalsMT: 2200,
    lastSyncTimestamp: '8 mins ago (07:17 AM)',
    syncSource: 'Agmarknet Real-time API',
    status: 'Live Synced',
    confidenceScore: 99.1,
  },
  {
    id: 'feed-06',
    marketName: 'Akola Cotton & Pulse Yard',
    district: 'Akola',
    state: 'Maharashtra',
    cropName: 'Chana (Bengal Gram)',
    variety: 'Desi Bold',
    modalPrice: 5800,
    minPrice: 5650,
    maxPrice: 5950,
    dailyArrivalsMT: 950,
    lastSyncTimestamp: '18 mins ago (07:07 AM)',
    syncSource: 'e-NAM Gateway',
    status: 'Ingestion Lag (15m)',
    confidenceScore: 94.2,
  },
  {
    id: 'feed-07',
    marketName: 'Tonk APMC Market',
    district: 'Tonk',
    state: 'Rajasthan',
    cropName: 'Mustard Seed',
    variety: 'High Oil Sarson',
    modalPrice: 5610,
    minPrice: 5480,
    maxPrice: 5760,
    dailyArrivalsMT: 1100,
    lastSyncTimestamp: '4 mins ago (07:21 AM)',
    syncSource: 'Agmarknet Real-time API',
    status: 'Live Synced',
    confidenceScore: 98.7,
  },
  {
    id: 'feed-08',
    marketName: 'Kota Grain & Spice Mandi',
    district: 'Kota',
    state: 'Rajasthan',
    cropName: 'Soybean',
    variety: 'Yellow Seed FAQ',
    modalPrice: 4720,
    minPrice: 4590,
    maxPrice: 4860,
    dailyArrivalsMT: 1420,
    lastSyncTimestamp: '6 mins ago (07:19 AM)',
    syncSource: 'Agmarknet Real-time API',
    status: 'Live Synced',
    confidenceScore: 99.2,
  },
];

export const ADMIN_SYSTEM_ALERTS: AdminSystemAlert[] = [
  {
    id: 'ALT-1092',
    timestamp: '07:24 AM',
    type: 'price-anomaly',
    severity: 'warning',
    title: 'Price Volatility Spike in Cotton Shankar-6 (+4.2%)',
    description: 'Rajkot Gondal terminal experienced +₹280/q jump due to sudden spinning mill bulk procurement tenders.',
    entityRef: 'Gondal APMC (GJ)',
    resolved: false,
  },
  {
    id: 'ALT-1091',
    timestamp: '07:18 AM',
    type: 'kyc-submission',
    severity: 'info',
    title: 'New Institutional Buyer KYC Dossier Submitted',
    description: 'Sunrise Agro Commodities Exim submitted GSTIN & FSSAI certificates for escrow accreditation.',
    entityRef: 'Sunrise Agro (MH)',
    resolved: false,
  },
  {
    id: 'ALT-1090',
    timestamp: '07:05 AM',
    type: 'api-sync',
    severity: 'success',
    title: 'National Agmarknet Ingestion Sync Completed',
    description: '2,418 APMC mandi price feeds successfully synced. Ingestion latency 1.2s across 156 commodities.',
    entityRef: 'Agmarknet Cloud API',
    resolved: true,
  },
  {
    id: 'ALT-1089',
    timestamp: '06:45 AM',
    type: 'tender-created',
    severity: 'info',
    title: 'Large Institutional Tender Published (1,200 Quintals)',
    description: 'Patanjali Agro Processing posted verified direct purchase tender for Sharbati Wheat @ ₹2,940/q.',
    entityRef: 'Patanjali Foods (MP)',
    resolved: true,
  },
  {
    id: 'ALT-1088',
    timestamp: '06:12 AM',
    type: 'mandi-notice',
    severity: 'warning',
    title: 'Akola Mandi Ingestion Delay Alert',
    description: 'Akola yard gateway reported 18-minute ingestion lag due to local APMC server maintenance.',
    entityRef: 'Akola APMC (MH)',
    resolved: false,
  },
  {
    id: 'ALT-1087',
    timestamp: '05:30 AM',
    type: 'security',
    severity: 'success',
    title: 'Daily Automated Escrow Reconciliation Completed',
    description: '₹4.82 Crore worth of farmer contract payouts validated with zero balance discrepancy across 28 Partner Banks.',
    entityRef: 'NPCI / RBI Escrow Gateway',
    resolved: true,
  },
];

export const VERIFICATION_QUEUE_DATA: VerificationRequest[] = [
  {
    id: 'VER-F-881',
    userType: 'farmer',
    userName: 'Bhanwar Lal Meena',
    contactNumber: '+91 94142 99014',
    location: 'Niwai, Tonk, Rajasthan',
    appliedDate: '18 Aug 2026 (Yesterday)',
    submittedDocs: [
      { docName: 'Khatauni Land Record (Khasra 412/1)', docNumber: 'RJ-TONK-2024-819', status: 'Verified Valid' },
      { docName: 'Aadhaar Card UIDAI Match', docNumber: 'XXXX-XXXX-8821', status: 'Verified Valid' },
      { docName: 'Bank Passbook / Cancelled Cheque', docNumber: 'SBI-Niwai-4401', status: 'Awaiting OCR Check' },
    ],
    notes: 'Farmer owns 11.2 acres verified on Rajasthan Apna Khata portal. Eligible for Direct Seller Tier 1.',
    riskScore: 'Low Risk (Score 98/100)',
  },
  {
    id: 'VER-B-412',
    userType: 'buyer',
    userName: 'Mahesh Agarwal',
    entityName: 'Sunrise Agro Commodities Exim',
    contactNumber: '+91 98200 11920',
    location: 'Thane / Navi Mumbai, Maharashtra',
    appliedDate: '18 Aug 2026 (Yesterday)',
    submittedDocs: [
      { docName: 'GSTIN Registration Certificate', docNumber: '27AABCS9910K1ZV', status: 'Verified Valid' },
      { docName: 'FSSAI Central Procurement License', docNumber: '10022022008401', status: 'Verified Valid' },
      { docName: 'Bank Escrow Guarantee (₹25 Lakhs)', docNumber: 'HDFC-ESC-88190', status: 'Manual Review Required' },
    ],
    notes: 'Corporate exporter applying for Basmati & Soybean direct lot procurement. Requires escrow limits audit.',
    riskScore: 'Low Risk (Score 98/100)',
  },
  {
    id: 'VER-F-882',
    userType: 'farmer',
    userName: 'Rameshwar Yadav',
    contactNumber: '+91 97931 44021',
    location: 'Chandausi, Sambhal, Uttar Pradesh',
    appliedDate: '19 Aug 2026 (Today)',
    submittedDocs: [
      { docName: 'Kisan Credit Card (KCC Passbook)', docNumber: 'PNB-KCC-99014', status: 'Verified Valid' },
      { docName: 'Aadhaar e-KYC DigiLocker', docNumber: 'XXXX-XXXX-3312', status: 'Verified Valid' },
    ],
    notes: 'KCC active with PNB Sambhal branch. Potato & Wheat producer.',
    riskScore: 'Low Risk (Score 98/100)',
  },
];
