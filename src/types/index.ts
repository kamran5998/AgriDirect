export type CropCategory = 'All' | 'Grains' | 'Pulses' | 'Vegetables' | 'Fruits' | 'Cash Crops' | 'Oilseeds';

export interface CropMarketItem {
  id: string;
  name: string;
  variety: string;
  category: Exclude<CropCategory, 'All'>;
  mandi: string;
  state: string;
  district: string;
  currentPrice: number; // in ₹ / Quintal
  unit: string;
  minPrice: number;
  maxPrice: number;
  change: number; // percentage (+2.4 or -1.2)
  trend: 'up' | 'down' | 'stable';
  arrivalVolume: string;
  qualityGrade: 'FAQ (Fair Average Quality)' | 'Grade A Premium' | 'Export Grade' | 'Standard';
  demandIndex: 'Surge' | 'High' | 'Moderate' | 'Steady';
  activeBuyers: number;
  sparkline: number[];
  lastUpdated: string;
}

export interface MarketStat {
  id: string;
  label: string;
  value: string;
  metricPrefix?: string;
  subtext: string;
  change: string;
  isPositive: boolean;
  iconName: string;
}

export interface PlatformFeature {
  id: string;
  title: string;
  category: string;
  description: string;
  tag: string;
  icon: string;
  badgeColor: string;
  keyCapability: string;
  dataPoints: { label: string; value: string }[];
}

export interface WorkflowStep {
  stepNumber: string;
  title: string;
  phase: string;
  actor: string;
  description: string;
  deliverable: string;
  icon: string;
}

export interface ImpactItem {
  metric: string;
  value: string;
  context: string;
  growth: string;
  icon: string;
}

export interface TestimonialStory {
  id: string;
  name: string;
  location: string;
  role: string;
  cropFocus: string;
  incomeBoost: string;
  quote: string;
  avatarUrl: string;
  verifiedFPO: boolean;
}

export interface TickerItem {
  crop: string;
  mandi: string;
  price: number;
  change: number;
  unit: string;
}

export type UserRole = 'farmer' | 'buyer' | 'admin';

export type AppScreen = 'landing' | 'login' | 'register' | 'role-select' | 'farmer-onboarding' | 'dashboard-preview' | 'dashboard' | 'market-intelligence' | 'crop-analytics' | 'direct-market' | 'admin-dashboard';

export interface FarmerProfile {
  fullName: string;
  mobileNumber: string;
  email: string;
  kisanId?: string;
  platformId?: string;
  state: string;
  district: string;
  village: string;
  pincode: string;
  farmSize: string;
  farmingType: string;
  experienceYears: string;
  preferredLanguage: string;
  selectedCrops: string[];
  harvestVolumes: Record<string, string>;
  selectedMandis: string[];
  transportWillingness: string;
  hasWarehouseStorage: boolean;
  smsAlertsEnabled: boolean;
  whatsappAlertsEnabled: boolean;
}

