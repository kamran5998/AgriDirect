import { Language } from '../farmer-app/types';

export type BuyerTab = 'dashboard' | 'requirements' | 'listings' | 'requests' | 'orders' | 'notifications';

export interface BuyerCompanyProfile {
  id: string;
  buyerId?: string;
  platformId?: string;
  businessName: string;
  contactPerson: string;
  mobileNumber: string;
  email: string;
  gstin: string;
  enamId: string;
  category: 'Corporate Food Processor' | 'Solvent & Oil Mill' | 'Agri Export House' | 'Govt & FPO Collective' | 'Certified Seed Company';
  location: string;
  district: string;
  state: string;
  pincode: string;
  verificationStatus: 'Verified Institutional Buyer' | 'KYC Under Review' | 'Government Approved';
  escrowRating: string;
  totalProcuredTonnage: string;
}

export interface BuyerTranslationStrings {
  buyerAppTitle: string;
  buyerSubtitle: string;
  dashboard: string;
  requirements: string;
  farmerListings: string;
  sentRequests: string;
  notifications: string;
  postRequirement: string;
  sendRequest: string;
  viewListing: string;
  activeTenders: string;
  matchingLots: string;
  recentRequests: string;
  procurementBudget: string;
  crop: string;
  quantity: string;
  expectedPrice: string;
  maxPrice: string;
  preferredLocation: string;
  requiredDate: string;
  distance: string;
  farmerLocation: string;
  verificationStatus: string;
  status: string;
  actions: string;
  noDataFound: string;
  loading: string;
  switchToFarmer: string;
  signOut: string;
  verifiedBadge: string;
}

export const BUYER_TRANSLATIONS: Record<Language, BuyerTranslationStrings> = {
  en: {
    buyerAppTitle: 'AgriDirect Buyer Portal',
    buyerSubtitle: 'Institutional Procurement & Direct Farm-Gate Sourcing',
    dashboard: 'Dashboard',
    requirements: 'Post Requirements',
    farmerListings: 'Purchase offers',
    sentRequests: 'Manage Offers',
    notifications: 'Alerts',
    postRequirement: 'Post Requirement',
    sendRequest: 'Send Purchase Offer',
    viewListing: 'View Lot Details',
    activeTenders: 'Active Tenders',
    matchingLots: 'Matching Lots',
    recentRequests: 'Recent Offers',
    procurementBudget: 'Procurement Volume',
    crop: 'Crop',
    quantity: 'Quantity (Qtl)',
    expectedPrice: 'Expected Price',
    maxPrice: 'Max Target Price (₹/Qtl)',
    preferredLocation: 'Preferred Depot / Location',
    requiredDate: 'Required By Date',
    distance: 'Distance',
    farmerLocation: 'Farmer Location',
    verificationStatus: 'Verification Status',
    status: 'Status',
    actions: 'Actions',
    noDataFound: 'No records found matching criteria',
    loading: 'Loading procurement data...',
    switchToFarmer: 'Switch to Farmer View',
    signOut: 'Sign Out',
    verifiedBadge: 'Verified Institutional Buyer',
  },
  hi: {
    buyerAppTitle: 'एग्रीडायरेक्ट व्यापारी पोर्टल',
    buyerSubtitle: 'संस्थागत खरीद एवं सीधा खेत-गेट सौदा',
    dashboard: 'डैशबोर्ड',
    requirements: 'खरीद आवश्यकताएं',
    farmerListings: 'किसान फसलें',
    sentRequests: 'भेजे गए प्रस्ताव',
    notifications: 'सूचनाएं',
    postRequirement: 'नई मांग दर्ज करें',
    sendRequest: 'खरीद प्रस्ताव भेजें',
    viewListing: 'फसल विवरण देखें',
    activeTenders: 'सक्रिय मांग',
    matchingLots: 'उपलब्ध फसल लॉट',
    recentRequests: 'हाल के प्रस्ताव',
    procurementBudget: 'खरीद मात्रा',
    crop: 'फसल',
    quantity: 'मात्रा (क्विंटल)',
    expectedPrice: 'अपेक्षित भाव',
    maxPrice: 'अधिकतम लक्ष्य भाव (₹/क्विंटल)',
    preferredLocation: 'पसंदीदा केंद्र / स्थान',
    requiredDate: 'आवश्यकता की तारीख',
    distance: 'दूरी',
    farmerLocation: 'किसान का स्थान',
    verificationStatus: 'सत्यापन स्थिति',
    status: 'स्थिति',
    actions: 'कार्रवाई',
    noDataFound: 'कोई रिकॉर्ड नहीं मिला',
    loading: 'डेटा लोड हो रहा है...',
    switchToFarmer: 'किसान दृश्य पर जाएं',
    signOut: 'लॉग आउट',
    verifiedBadge: 'सत्यापित संस्थागत क्रेता',
  },
  mr: {
    buyerAppTitle: 'अ‍ॅग्रीडायरेक्ट व्यापारी पोर्टल',
    buyerSubtitle: 'संस्थात्मक खरेदी आणि थेट शेतमाल प्रापण',
    dashboard: 'डॅशबोर्ड',
    requirements: 'खरेदी गरजा',
    farmerListings: 'शेतकरी पीक यादी',
    sentRequests: 'पाठवलेल्या मागण्या',
    notifications: 'सूचना',
    postRequirement: 'नवीन मागणी नोंदवा',
    sendRequest: 'खरेदी प्रस्ताव पाठवा',
    viewListing: 'तपशील पहा',
    activeTenders: 'सक्रिय मागण्या',
    matchingLots: 'उपलब्ध पीक लॉट',
    recentRequests: 'नुकतेच प्रस्ताव',
    procurementBudget: 'खरेदी प्रमाण',
    crop: 'पीक',
    quantity: 'प्रमाण (क्विंटल)',
    expectedPrice: 'अपेक्षित दर',
    maxPrice: 'कमाल लक्ष्य दर (₹/क्विंटल)',
    preferredLocation: 'पसंतीचे केंद्र / ठिकाण',
    requiredDate: 'आवश्यक तारीख',
    distance: 'अंतर',
    farmerLocation: 'शेतकऱ्याचे ठिकाण',
    verificationStatus: 'पडताळणी स्थिती',
    status: 'स्थिती',
    actions: 'कृती',
    noDataFound: 'माहिती उपलब्ध नाही',
    loading: 'माहिती लोड होत आहे...',
    switchToFarmer: 'शेतकरी मोडवर जा',
    signOut: 'लॉग आऊट',
    verifiedBadge: 'प्रमाणित संस्थात्मक खरेदीदार',
  },
};
