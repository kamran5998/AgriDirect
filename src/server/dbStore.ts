import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: number;
  platform_id: string; // Unique AgriDirect ID: ADP-FMR-XXXXXX or ADP-BYR-XXXXXX or ADP-ADM-XXXXXX
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: 'farmer' | 'buyer' | 'admin';
  location: string;
  created_at: string;
}

export interface FarmerProfileRecord {
  id: number;
  user_id: number;
  state: string;
  district: string;
  village: string;
  preferred_markets: number[];
  created_at: string;
}

export interface BuyerProfileRecord {
  id: number;
  user_id: number;
  business_name: string;
  location: string;
  verification_status: string;
  created_at: string;
}

export interface CropRecord {
  id: number;
  name: string;
  category: string;
  description: string;
  created_at: string;
}

export interface QualitySpecs {
  grade: 'Grade A' | 'Grade B' | 'Grade C' | string;
  moisture_percent?: number;
  foreign_matter_percent?: number;
  grain_damage_percent?: number;
  remarks?: string;
}

export interface FarmerListingRecord {
  id: number;
  farmer_id: number;
  farmer_name: string;
  crop_id?: number;
  crop_name: string;
  variety: string;
  quantity_quintals: number;
  expected_price_per_quintal: number;
  quality_grade: string;
  moisture_percent?: number;
  foreign_matter_percent?: number;
  grain_damage_percent?: number;
  quality_remarks?: string;
  crop_image_url?: string;
  location_village: string;
  district: string;
  state: string;
  delivery_option: string;
  available_date: string;
  fpo_lot_id?: string;
  status: 'active' | 'in_negotiation' | 'completed' | 'cancelled';
  views_count: number;
  matched_buyers_count: number;
  created_at: string;
  updated_at: string;
}

export interface LogisticsDetails {
  status: 'REQUESTED' | 'SCHEDULED' | 'PICKED UP' | 'IN TRANSIT' | 'DELIVERED';
  pickup_location: string;
  delivery_location: string;
  pickup_date: string;
  vehicle_type: 'Tractor Trolley (Up to 40 Qtl)' | 'Mini Commercial Truck (3 Ton / 60 Qtl)' | 'Heavy Multi-axle Truck (16 Ton)' | string;
  estimated_freight: number;
  actual_freight?: number;
  transporter_name?: string;
  contact_number?: string;
  updated_at: string;
}

export type PaymentStage =
  | 'OFFER_ACCEPTED'
  | 'PAYMENT_INITIATED'
  | 'ESCROW_HELD'
  | 'PAYMENT_RELEASED';

export type PaymentStatusType =
  | PaymentStage
  | 'PENDING'
  | 'ADVANCE PAID'
  | 'ADVANCE_PAID'
  | 'PARTIALLY PAID'
  | 'PARTIALLY_PAID'
  | 'QUALITY_VERIFIED'
  | 'FULLY PAID'
  | 'FULLY_PAID'
  | 'RELEASED'
  | 'SETTLED'
  | 'COMPLETED'
  | 'UNPAID';

export function normalizePaymentStatus(status: any): PaymentStage {
  const s = String(status || '').toUpperCase().trim().replace(/[\s-]+/g, '_');
  if (
    s === 'PAYMENT_RELEASED' ||
    s === 'RELEASED' ||
    s === 'SETTLED' ||
    s === 'FULLY_PAID' ||
    s === 'COMPLETED' ||
    s === 'PAID'
  ) {
    return 'PAYMENT_RELEASED';
  }
  if (
    s === 'ESCROW_HELD' ||
    s === 'ESCROW_LOCKED' ||
    s === 'IN_ESCROW' ||
    s === 'QUALITY_VERIFIED'
  ) {
    return 'ESCROW_HELD';
  }
  if (
    s === 'PAYMENT_INITIATED' ||
    s === 'ADVANCE_PAID' ||
    s === 'PARTIALLY_PAID' ||
    s === 'INITIATED'
  ) {
    return 'PAYMENT_INITIATED';
  }
  return 'OFFER_ACCEPTED';
}

export const PAYMENT_STAGE_ORDER: Record<PaymentStage, number> = {
  OFFER_ACCEPTED: 1,
  PAYMENT_INITIATED: 2,
  ESCROW_HELD: 3,
  PAYMENT_RELEASED: 4,
};

export const PAYMENT_NEXT_STAGE: Record<PaymentStage, PaymentStage | null> = {
  OFFER_ACCEPTED: 'PAYMENT_INITIATED',
  PAYMENT_INITIATED: 'ESCROW_HELD',
  ESCROW_HELD: 'PAYMENT_RELEASED',
  PAYMENT_RELEASED: null,
};

export interface PaymentHistoryItem {
  trade_id?: number | string;
  previous_status?: string;
  new_status?: string;
  status: string;
  amount: number;
  timestamp: string;
  note: string;
  actor: string;
  reference_id?: string;
}

export interface PaymentDetails {
  status: PaymentStatusType;
  total_trade_value: number;
  amount_total?: number;
  amount_paid: number;
  remaining_amount: number;
  advance_amount?: number;
  escrow_held_amount?: number;
  payment_due_date: string;
  payment_method: string;
  escrow_token: string;
  bank_reference_utr?: string;
  quality_verification_notes?: string;
  last_transition_by?: string;
  history?: PaymentHistoryItem[];
  updated_at: string;
}

export interface NotificationRecord {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'price_alert' | 'offer_alert' | 'trade_alert' | 'payment_alert' | 'gate_pass' | 'system_notice' | string;
  channel?: 'SMS' | 'WHATSAPP' | 'IN_APP';
  crop_name?: string;
  mandi_name?: string;
  price_change?: number;
  trade_id?: number | string;
  gate_pass_id?: string;
  action_tab?: string;
  metadata?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export type OrderLifecycleStep =
  | 'Order Placed'
  | 'Offer Accepted'
  | 'Payment'
  | 'Pickup Scheduled'
  | 'Crop Picked Up'
  | 'Quality/Weighment'
  | 'Delivered'
  | 'Order Completed';

export type BuyerPaymentStatus = 'Pending' | 'Processing' | 'Successful' | 'Failed';

export const ORDER_LIFECYCLE_STEPS: OrderLifecycleStep[] = [
  'Order Placed',
  'Offer Accepted',
  'Payment',
  'Pickup Scheduled',
  'Crop Picked Up',
  'Quality/Weighment',
  'Delivered',
  'Order Completed',
];

export function getDerivedOrderStatus(req: BuyerRequestRecord): OrderLifecycleStep {
  if (req.order_status && ORDER_LIFECYCLE_STEPS.includes(req.order_status)) {
    return req.order_status;
  }
  if (req.status === 'completed') return 'Order Completed';
  if (req.logistics?.status === 'DELIVERED') return 'Delivered';
  if (req.logistics?.status === 'QUALITY_VERIFIED' as any) return 'Quality/Weighment';
  if (req.logistics?.status === 'PICKED UP' || req.logistics?.status === 'IN TRANSIT') return 'Crop Picked Up';
  if (req.logistics?.status === 'SCHEDULED') return 'Pickup Scheduled';
  if (
    req.payment_status === 'Successful' ||
    req.payment?.status === 'PAYMENT_RELEASED' ||
    req.payment?.status === 'ESCROW_HELD' ||
    req.payment?.status === 'FULLY PAID'
  ) {
    return 'Payment';
  }
  if (req.status === 'accepted') return 'Offer Accepted';
  return 'Order Placed';
}

export function getDerivedPaymentStatus(req: BuyerRequestRecord): BuyerPaymentStatus {
  if (
    req.payment_status === 'Pending' ||
    req.payment_status === 'Processing' ||
    req.payment_status === 'Successful' ||
    req.payment_status === 'Failed'
  ) {
    return req.payment_status;
  }
  const rawStatus = String(req.payment?.status || '').toUpperCase().trim().replace(/[\s-]+/g, '_');
  if (
    rawStatus === 'PAYMENT_RELEASED' ||
    rawStatus === 'ESCROW_HELD' ||
    rawStatus === 'FULLY_PAID' ||
    rawStatus === 'SUCCESSFUL' ||
    rawStatus === 'SETTLED'
  ) {
    return 'Successful';
  }
  if (
    rawStatus === 'PAYMENT_INITIATED' ||
    rawStatus === 'ADVANCE_PAID' ||
    rawStatus === 'PARTIALLY_PAID' ||
    rawStatus === 'PROCESSING'
  ) {
    return 'Processing';
  }
  if (rawStatus === 'FAILED') {
    return 'Failed';
  }
  return 'Pending';
}

export interface TimelineEvent {
  event_type: string;
  title: string;
  description: string;
  timestamp: string;
  actor_name: string;
  actor_role: string;
}

export interface BuyerRequestRecord {
  id: number;
  listing_id: number;
  buyer_id: number;
  buyer_name: string;
  farmer_id: number;
  farmer_name?: string;
  crop_name: string;
  variety?: string;
  quantity: number;
  offered_price: number;
  counter_price?: number | null;
  farmer_expected_price?: number;
  farmer_location?: string;
  delivery_option: string;
  message: string;
  quality_grade?: string;
  quality_match_score?: number;
  quality_match_status?: 'MATCH' | 'PARTIAL MATCH' | 'NOT MATCHED';
  status: 'pending' | 'accepted' | 'countered' | 'rejected' | 'completed' | 'cancelled';
  order_status?: OrderLifecycleStep;
  payment_status?: BuyerPaymentStatus;
  status_message?: string;
  gate_pass_id?: string | null;
  logistics?: LogisticsDetails;
  payment?: PaymentDetails;
  timeline?: TimelineEvent[];
  created_at: string;
  updated_at: string;
}

export interface BuyerRequirementRecord {
  id: number;
  buyer_id: number;
  buyer_name: string;
  crop_id?: number;
  crop_name: string;
  variety_spec?: string;
  quantity_required: number;
  min_order_quintals: number;
  expected_price: number;
  required_quality_grade?: string;
  max_moisture_percent?: number;
  max_foreign_matter_percent?: number;
  location: string;
  district: string;
  state: string;
  delivery_option: string;
  payment_term: string;
  badge: string;
  phone_contact: string;
  status: 'open' | 'fulfilled' | 'closed';
  created_at: string;
}

export interface StorageFacilityRecord {
  id: number;
  name: string;
  location: string;
  district: string;
  state: string;
  distance_km?: number;
  distanceKm?: number;
  total_capacity_mt?: number;
  capacity?: number;
  totalCapacityMt?: number;
  available_capacity_mt?: number;
  available_capacity?: number;
  availableCapacityMt?: number;
  rate_per_quintal_per_day?: number;
  estimated_cost_per_qtl_month: number;
  estimatedCostPerQtlMonth?: number;
  storage_type?: 'Scientific Warehouse' | 'Cold Storage' | 'Metal Silo' | 'Covered Shed' | string;
  storageType?: 'Scientific Warehouse' | 'Cold Storage' | 'Metal Silo' | 'Covered Shed' | string;
  accreditation?: string;
  insurance_covered?: boolean;
  insuranceCovered?: boolean;
  verified?: boolean;
  contact_phone?: string;
  contactPhone?: string;
  is_sample_data?: boolean;
  isSampleData?: boolean;
}

export interface StorageBookingRecord {
  id: number;
  facility_id: number;
  facilityId?: number;
  facility_name?: string;
  facilityName?: string;
  farmer_id: number;
  farmerId?: number;
  farmer_name?: string;
  farmerName?: string;
  crop?: string;
  crop_name?: string;
  cropName?: string;
  quantity?: number;
  quantity_quintals?: number;
  quantityQuintals?: number;
  duration_days?: number;
  required_duration_days?: number;
  requiredDurationDays?: number;
  location?: string;
  estimated_cost_total?: number;
  estimatedCostTotal?: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'REQUESTED' | 'CONFIRMED' | 'ACTIVE' | 'RELEASED' | string;
  created_at: string;
  createdAt?: string;
  updated_at?: string;
}

export interface DisputeRecord {
  id: number;
  trade_id: number | string;
  gate_pass_id?: string;
  complainant_id: number;
  complainant_name: string;
  complainant_role: 'farmer' | 'buyer' | 'fpo';
  respondent_name: string;
  category: 'Payment Issue' | 'Quality Dispute' | 'Quantity Mismatch' | 'Delivery Issue' | 'Buyer Issue' | 'Seller Issue' | 'Other';
  description: string;
  evidence_notes?: string;
  status: 'OPEN' | 'UNDER REVIEW' | 'RESOLVED';
  resolution_notes?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FpoAggregatedLotRecord {
  id: string;
  fpo_name: string;
  fpo_district: string;
  fpo_state: string;
  crop_name: string;
  variety: string;
  quality_grade: string;
  total_aggregated_quantity: number;
  contributing_farmers_count: number;
  target_price_per_quintal: number;
  contributions: Array<{
    farmer_id: number;
    farmer_name: string;
    quantity: number;
    listing_id?: number;
  }>;
  status: 'OPEN_FOR_INSTITUTIONAL_BID' | 'CONTRACTED' | 'FULFILLED';
  created_at: string;
}

export interface DatabaseState {
  users: UserRecord[];
  farmer_profiles: FarmerProfileRecord[];
  buyer_profiles: BuyerProfileRecord[];
  crops: CropRecord[];
  farmer_listings: FarmerListingRecord[];
  buyer_requests: BuyerRequestRecord[];
  buyer_requirements: BuyerRequirementRecord[];
  storage_facilities: StorageFacilityRecord[];
  storage_bookings: StorageBookingRecord[];
  disputes: DisputeRecord[];
  fpo_aggregated_lots: FpoAggregatedLotRecord[];
  notifications: NotificationRecord[];
  nextListingId: number;
  nextRequestId: number;
  nextStorageBookingId: number;
  nextDisputeId: number;
  nextNotificationId: number;
}

const DB_FILE_PATH = path.join(process.cwd(), 'database', 'agridirect_store.json');

// ==========================================
// Authentication Security & Unique ID Helpers
// ==========================================

export function hashPassword(password: string): string {
  if (!password) return 'demo_pass_hash';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !password) return false;

  // Backward compatibility with legacy demo seed strings
  if (storedHash === 'demo_pass_hash') {
    const validDemoPasswords = [
      'Kisan@Demo123',
      'Kisan@1234',
      'Buyer@1234',
      'Buyer@Demo123',
      'Admin@1234',
      'Demo@1234',
      '123456',
    ];
    return validDemoPasswords.includes(password);
  }

  if (storedHash.startsWith('scrypt:')) {
    const parts = storedHash.split(':');
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const originalHash = parts[2];
    try {
      const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
      return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(computedHash, 'hex'));
    } catch {
      return false;
    }
  }

  // Direct plaintext match fallback
  return storedHash === password;
}

export function generatePlatformId(role: 'farmer' | 'buyer' | 'admin', existingUsers: UserRecord[] = []): string {
  const prefix = role === 'farmer' ? 'ADP-FMR' : role === 'buyer' ? 'ADP-BYR' : 'ADP-ADM';
  const existingIds = new Set(existingUsers.map((u) => u.platform_id).filter(Boolean));

  for (let attempt = 0; attempt < 100; attempt++) {
    // Generate a 6-digit cryptographic random number
    const randomNum = crypto.randomInt(100000, 999999);
    const candidateId = `${prefix}-${randomNum}`;
    if (!existingIds.has(candidateId)) {
      return candidateId;
    }
  }

  // Fallback timestamp-based deterministic unique ID
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

class DatabaseStore {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadDatabase();
  }

  private getDefaultState(): DatabaseState {
    const now = new Date().toISOString();
    return {
      users: [
        {
          id: 1,
          platform_id: 'ADP-FMR-10001',
          name: 'Rajinder Singh',
          email: 'rajinder.singh@farmmail.in',
          phone: '+919876543210',
          password_hash: hashPassword('Kisan@Demo123'),
          role: 'farmer',
          location: 'Sehore, Madhya Pradesh',
          created_at: now,
        },
        {
          id: 2,
          platform_id: 'ADP-FMR-10002',
          name: 'Balwinder Dhillon',
          email: 'balwinder.punjab@farmmail.in',
          phone: '+919814022334',
          password_hash: hashPassword('Kisan@Demo123'),
          role: 'farmer',
          location: 'Khanna, Ludhiana, Punjab',
          created_at: now,
        },
        {
          id: 3,
          platform_id: 'ADP-FMR-10003',
          name: 'Sehore Kisan Samriddhi FPO',
          email: 'admin@sehorefpo.org',
          phone: '+917562234567',
          password_hash: hashPassword('Kisan@Demo123'),
          role: 'farmer',
          location: 'Ashta, Sehore, MP',
          created_at: now,
        },
        {
          id: 7,
          platform_id: 'ADP-BYR-20001',
          name: 'Anil Agarwal (Patanjali Agro)',
          email: 'procurement@patanjaliagro.com',
          phone: '+919823456789',
          password_hash: hashPassword('Buyer@1234'),
          role: 'buyer',
          location: 'Sehore Industrial Hub, Madhya Pradesh',
          created_at: now,
        },
        {
          id: 8,
          platform_id: 'ADP-BYR-20002',
          name: 'Vikram Oberoi (ITC Agri)',
          email: 'v.oberoi@itcagri.in',
          phone: '+919810011223',
          password_hash: hashPassword('Buyer@1234'),
          role: 'buyer',
          location: 'Indore Depot, Madhya Pradesh',
          created_at: now,
        },
        {
          id: 11,
          platform_id: 'ADP-ADM-00001',
          name: 'Dr. Vivek Sharma',
          email: 'admin.ops@agridirect.gov.in',
          phone: '+919811122233',
          password_hash: hashPassword('Admin@1234'),
          role: 'admin',
          location: 'National Operations, New Delhi',
          created_at: now,
        },
      ],
      farmer_profiles: [
        {
          id: 1,
          user_id: 1,
          state: 'Madhya Pradesh',
          district: 'Sehore',
          village: 'Ashta',
          preferred_markets: [1, 2, 3],
          created_at: now,
        },
        {
          id: 2,
          user_id: 2,
          state: 'Punjab',
          district: 'Ludhiana',
          village: 'Samrala',
          preferred_markets: [4, 5],
          created_at: now,
        },
      ],
      buyer_profiles: [
        {
          id: 1,
          user_id: 7,
          business_name: 'Patanjali Agro Processing Ltd',
          location: 'Sehore Industrial Hub, MP',
          verification_status: 'Platform Verified (Corporate KYC)',
          created_at: now,
        },
        {
          id: 2,
          user_id: 8,
          business_name: 'ITC Foods Agri-Procurement',
          location: 'Indore Logistics Depot, MP',
          verification_status: 'Platform Verified (Corporate KYC)',
          created_at: now,
        },
      ],
      crops: [
        { id: 1, name: 'Wheat', category: 'Grains', description: 'Sharbati / Lokwan high-protein milling wheat', created_at: now },
        { id: 2, name: 'Soybean', category: 'Oilseeds', description: 'Yellow Seed high oil content JS-9560', created_at: now },
        { id: 3, name: 'Basmati Rice', category: 'Grains', description: '1121 Pusa Aged Export Quality', created_at: now },
        { id: 4, name: 'Mustard', category: 'Oilseeds', description: 'High-oil FAQ Sarson Pusa Bold', created_at: now },
        { id: 5, name: 'Cotton', category: 'Cash Crops', description: 'Shankar-6 28-29mm Staple', created_at: now },
        { id: 6, name: 'Chana', category: 'Pulses', description: 'Desi Bold FAQ Chickpea', created_at: now },
      ],
      farmer_listings: [
        {
          id: 101,
          farmer_id: 1,
          farmer_name: 'Rajinder Singh',
          crop_id: 1,
          crop_name: 'Wheat',
          variety: 'Sharbati Premium Gold Grade',
          quantity_quintals: 140,
          expected_price_per_quintal: 2920,
          quality_grade: 'Grade A',
          moisture_percent: 10.5,
          foreign_matter_percent: 0.5,
          grain_damage_percent: 0.8,
          quality_remarks: 'Lustrous, sun-dried golden grains, zero weevil infestation.',
          location_village: 'Ashta Village, Sehore',
          district: 'Sehore',
          state: 'Madhya Pradesh',
          delivery_option: 'Farm-gate Pickup Only',
          available_date: 'Immediate / Ready in Barn',
          status: 'active',
          views_count: 42,
          matched_buyers_count: 3,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 102,
          farmer_id: 1,
          farmer_name: 'Rajinder Singh',
          crop_id: 2,
          crop_name: 'Soybean',
          variety: 'Yellow Seed (JS-9560)',
          quantity_quintals: 75,
          expected_price_per_quintal: 4820,
          quality_grade: 'Grade B',
          moisture_percent: 9.8,
          foreign_matter_percent: 1.2,
          grain_damage_percent: 1.5,
          quality_remarks: 'Standard oil mill grade, clean harvested.',
          location_village: 'Ashta Village, Sehore',
          district: 'Sehore',
          state: 'Madhya Pradesh',
          delivery_option: 'Flexible',
          available_date: 'Ready in 2 Days',
          status: 'active',
          views_count: 28,
          matched_buyers_count: 2,
          created_at: new Date(Date.now() - 43200000).toISOString(),
          updated_at: new Date(Date.now() - 43200000).toISOString(),
        },
        {
          id: 103,
          farmer_id: 2,
          farmer_name: 'Balwinder Dhillon',
          crop_id: 3,
          crop_name: 'Basmati Rice',
          variety: '1121 Pusa Aged Export Quality',
          quantity_quintals: 200,
          expected_price_per_quintal: 3950,
          quality_grade: 'Grade A',
          moisture_percent: 11.2,
          foreign_matter_percent: 0.4,
          grain_damage_percent: 0.5,
          quality_remarks: 'Long grain, moisture within 11.5% export spec.',
          location_village: 'Samrala, Ludhiana',
          district: 'Ludhiana',
          state: 'Punjab',
          delivery_option: 'Farmer Delivery to Depot',
          available_date: 'Immediate',
          status: 'active',
          views_count: 65,
          matched_buyers_count: 4,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ],
      buyer_requests: [
        {
          id: 201,
          listing_id: 101,
          buyer_id: 7,
          buyer_name: 'Patanjali Agro Processing Ltd',
          farmer_id: 1,
          crop_name: 'Wheat',
          variety: 'Sharbati Premium Gold Grade',
          quantity: 40,
          offered_price: 2920,
          counter_price: null,
          farmer_expected_price: 2920,
          farmer_location: 'Ashta Village, Sehore',
          delivery_option: 'Farm-gate Pickup (Assisted Weighment)',
          message: 'Direct institutional purchase contract. Ready for farmgate weighment.',
          quality_grade: 'Grade A',
          quality_match_score: 95,
          quality_match_status: 'MATCH',
          status: 'accepted',
          status_message: 'Trade finalized at ₹2920/Qtl. Gate Pass #GP-SEH-1084 issued.',
          gate_pass_id: 'GP-SEH-1084',
          logistics: {
            status: 'SCHEDULED',
            pickup_location: 'Farmer Barn, Ashta, Sehore',
            delivery_location: 'Patanjali Agro Processing Hub, Sehore',
            pickup_date: '2026-08-25',
            vehicle_type: 'Mini Commercial Truck (3 Ton / 60 Qtl)',
            estimated_freight: 1200,
            actual_freight: 1150,
            transporter_name: 'Sehore Kisan Logistics Fleet #12',
            contact_number: '+91 7562 248911',
            updated_at: now,
          },
          payment: {
            status: 'PAYMENT_INITIATED',
            total_trade_value: 116800,
            amount_paid: 0,
            remaining_amount: 116800,
            escrow_held_amount: 0,
            payment_due_date: '2026-08-27',
            payment_method: 'Digital Escrow Bank Clearance (T+0)',
            escrow_token: 'ESC-PAT-2026-9011',
            history: [
              {
                trade_id: 201,
                previous_status: 'UNPAID',
                new_status: 'OFFER_ACCEPTED',
                status: 'OFFER_ACCEPTED',
                amount: 116800,
                timestamp: new Date(Date.now() - 43200000).toISOString(),
                actor: 'Rajinder Singh',
                note: 'Offer accepted at ₹2,920/Qtl for 40 Qtl.',
                reference_id: 'ESC-PAT-2026-9011',
              },
              {
                trade_id: 201,
                previous_status: 'OFFER_ACCEPTED',
                new_status: 'PAYMENT_INITIATED',
                status: 'PAYMENT_INITIATED',
                amount: 116800,
                timestamp: new Date(Date.now() - 10800000).toISOString(),
                actor: 'Patanjali Agro Processing Ltd',
                note: 'Buyer initiated payment clearing order for 40 Qtl Wheat.',
                reference_id: 'ESC-PAT-2026-9011',
              },
            ],
            updated_at: now,
          },
          timeline: [
            {
              event_type: 'LISTING_CREATED',
              title: 'Farmer Lot Published',
              description: 'Farmer Rajinder Singh published 140 Qtl Sharbati Wheat at ₹2,920/Qtl (Grade A).',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              actor_name: 'Rajinder Singh',
              actor_role: 'Farmer',
            },
            {
              event_type: 'OFFER_RECEIVED',
              title: 'Institutional Purchase Proposal',
              description: 'Patanjali Agro offered ₹2,920/Qtl for 40 Qtl with Farm-gate Pickup.',
              timestamp: new Date(Date.now() - 64800000).toISOString(),
              actor_name: 'Patanjali Agro Processing Ltd',
              actor_role: 'Buyer',
            },
            {
              event_type: 'OFFER_ACCEPTED',
              title: 'Farmer Accepted Proposal',
              description: 'Trade contract confirmed. Digital Gate Pass #GP-SEH-1084 generated.',
              timestamp: new Date(Date.now() - 43200000).toISOString(),
              actor_name: 'Rajinder Singh',
              actor_role: 'Farmer',
            },
            {
              event_type: 'LOGISTICS_SCHEDULED',
              title: 'Transport Arranged',
              description: 'Mini Truck scheduled for pickup from Ashta barn on 25 Aug.',
              timestamp: new Date(Date.now() - 21600000).toISOString(),
              actor_name: 'Patanjali Logistics Dispatch',
              actor_role: 'Transporter',
            },
            {
              event_type: 'ADVANCE_ESCROW',
              title: '20% Advance Escrow Deposited',
              description: '₹23,360 deposited to platform escrow ledger.',
              timestamp: new Date(Date.now() - 10800000).toISOString(),
              actor_name: 'Automated Escrow Protocol',
              actor_role: 'Escrow Ledger',
            },
          ],
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 10800000).toISOString(),
        },
      ],
      buyer_requirements: [
        {
          id: 1,
          buyer_id: 7,
          buyer_name: 'Patanjali Agro Processing Ltd',
          crop_name: 'Wheat',
          variety_spec: 'Sharbati / Lokwan (Max Moisture 11%)',
          quantity_required: 1200,
          min_order_quintals: 25,
          expected_price: 2940,
          required_quality_grade: 'Grade A',
          max_moisture_percent: 11.0,
          max_foreign_matter_percent: 0.8,
          location: 'Sehore Industrial Hub, MP',
          district: 'Sehore',
          state: 'Madhya Pradesh',
          delivery_option: 'Farm-gate Pickup & Depot Drop Available',
          payment_term: 'Instant Escrow Bank Transfer (T+0)',
          badge: 'Platform Verified Corporate Buyer',
          phone_contact: '+91 7562 248900',
          status: 'open',
          created_at: now,
        },
        {
          id: 2,
          buyer_id: 8,
          buyer_name: 'ITC Foods Agri-Procurement',
          crop_name: 'Wheat',
          variety_spec: 'Aashirvaad Grade Lokwan Quality',
          quantity_required: 2500,
          min_order_quintals: 50,
          expected_price: 2960,
          required_quality_grade: 'Grade A',
          max_moisture_percent: 10.5,
          max_foreign_matter_percent: 0.5,
          location: 'Indore Depot, MP',
          district: 'Indore',
          state: 'Madhya Pradesh',
          delivery_option: 'Depot Delivery / Transport Reimbursed',
          payment_term: 'Same Day RTGS Bank Clearance',
          badge: 'Platform Verified Corporate Buyer',
          phone_contact: '+91 731 2984100',
          status: 'open',
          created_at: now,
        },
        {
          id: 3,
          buyer_id: 7,
          buyer_name: 'Patanjali Agro Processing Ltd',
          crop_name: 'Soybean',
          variety_spec: 'Yellow Seed JS-9560 (Oil > 18.5%)',
          quantity_required: 800,
          min_order_quintals: 20,
          expected_price: 4850,
          required_quality_grade: 'Grade B',
          max_moisture_percent: 10.0,
          max_foreign_matter_percent: 1.5,
          location: 'Sehore Industrial Hub, MP',
          district: 'Sehore',
          state: 'Madhya Pradesh',
          delivery_option: 'Farm-gate Pickup Available',
          payment_term: 'Digital Escrow Bank Settlement',
          badge: 'Platform Verified Corporate Buyer',
          phone_contact: '+91 7562 248900',
          status: 'open',
          created_at: now,
        },
      ],
      storage_facilities: [
        {
          id: 1,
          name: 'MP State Warehousing Corp (MPSWC) - Sehore Yard',
          location: 'Station Road, Sehore',
          district: 'Sehore',
          state: 'Madhya Pradesh',
          distance_km: 9,
          total_capacity_mt: 8500,
          available_capacity_mt: 2100,
          estimated_cost_per_qtl_month: 12,
          storage_type: 'Scientific Warehouse',
          accreditation: 'WDRA Certified & e-NWR Linked',
          insurance_covered: true,
          contact_phone: '+91 7562 224150',
          is_sample_data: true,
        },
        {
          id: 2,
          name: 'Central Warehousing Corporation (CWC) - Bhopal Hub',
          location: 'Nisatpura Industrial Area, Bhopal',
          district: 'Bhopal',
          state: 'Madhya Pradesh',
          distance_km: 36,
          total_capacity_mt: 25000,
          available_capacity_mt: 6400,
          estimated_cost_per_qtl_month: 14,
          storage_type: 'Scientific Warehouse',
          accreditation: 'Govt CWC Grade-I Warehouse',
          insurance_covered: true,
          contact_phone: '+91 755 2748900',
          is_sample_data: true,
        },
        {
          id: 3,
          name: 'Kisan Samriddhi Agri Silos & Cold Chamber',
          location: 'Ashta Bypass, Sehore',
          district: 'Sehore',
          state: 'Madhya Pradesh',
          distance_km: 14,
          total_capacity_mt: 4000,
          available_capacity_mt: 1100,
          estimated_cost_per_qtl_month: 16,
          storage_type: 'Metal Silo',
          accreditation: 'NABARD Assisted FPO Silo',
          insurance_covered: true,
          contact_phone: '+91 7562 239800',
          is_sample_data: true,
        },
        {
          id: 4,
          name: 'Indore Agri Terminal Cold & Dry Facility',
          location: 'Sanwer Road Industrial Area, Indore',
          district: 'Indore',
          state: 'Madhya Pradesh',
          distance_km: 68,
          total_capacity_mt: 18000,
          available_capacity_mt: 3800,
          estimated_cost_per_qtl_month: 15,
          storage_type: 'Scientific Warehouse',
          accreditation: 'WDRA Registered',
          insurance_covered: true,
          contact_phone: '+91 731 2894320',
          is_sample_data: true,
        },
      ],
      storage_bookings: [
        {
          id: 1,
          facility_id: 1,
          facility_name: 'MP State Warehousing Corp (MPSWC) - Sehore Yard',
          farmer_id: 1,
          farmer_name: 'Rajinder Singh',
          crop_name: 'Wheat',
          quantity_quintals: 50,
          required_duration_days: 30,
          location: 'Sehore',
          estimated_cost_total: 600,
          status: 'CONFIRMED',
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ],
      disputes: [
        {
          id: 1,
          trade_id: 201,
          gate_pass_id: 'GP-SEH-1084',
          complainant_id: 1,
          complainant_name: 'Rajinder Singh',
          complainant_role: 'farmer',
          respondent_name: 'Patanjali Agro Processing Ltd',
          category: 'Delivery Issue',
          description: 'Pickup truck arrived 2 hours after agreed window due to highway diversion. Driver verified lot successfully.',
          evidence_notes: 'Gate log confirmed arrival at 16:30 hrs.',
          status: 'RESOLVED',
          resolution_notes: 'Transporter acknowledged delay; weighing completed without penalty.',
          resolved_by: 'Dr. Vivek Sharma (Admin Ops)',
          created_at: new Date(Date.now() - 43200000).toISOString(),
          updated_at: new Date(Date.now() - 21600000).toISOString(),
        },
      ],
      fpo_aggregated_lots: [
        {
          id: 'FPO-LOT-SEH-01',
          fpo_name: 'Sehore Kisan Samriddhi FPO',
          fpo_district: 'Sehore',
          fpo_state: 'Madhya Pradesh',
          crop_name: 'Wheat',
          variety: 'Sharbati Lokwan Grade A',
          quality_grade: 'Grade A',
          total_aggregated_quantity: 265,
          contributing_farmers_count: 5,
          target_price_per_quintal: 2930,
          contributions: [
            { farmer_id: 1, farmer_name: 'Rajinder Singh', quantity: 90, listing_id: 101 },
            { farmer_id: 4, farmer_name: 'Kailash Meena', quantity: 60 },
            { farmer_id: 5, farmer_name: 'Rameshwar Patel', quantity: 45 },
            { farmer_id: 6, farmer_name: 'Dinesh Dangi', quantity: 40 },
            { farmer_id: 9, farmer_name: 'Santosh Malviya', quantity: 30 },
          ],
          status: 'OPEN_FOR_INSTITUTIONAL_BID',
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'FPO-LOT-SEH-02',
          fpo_name: 'Malwa Nimar Agro Collective FPO',
          fpo_district: 'Dewas',
          fpo_state: 'Madhya Pradesh',
          crop_name: 'Soybean',
          variety: 'Yellow Seed (JS-9560)',
          quality_grade: 'Grade B',
          total_aggregated_quantity: 180,
          contributing_farmers_count: 4,
          target_price_per_quintal: 4830,
          contributions: [
            { farmer_id: 10, farmer_name: 'Devendra Gurjar', quantity: 70 },
            { farmer_id: 12, farmer_name: 'Mohan Lal Verma', quantity: 50 },
            { farmer_id: 13, farmer_name: 'Shyam Sunder', quantity: 35 },
            { farmer_id: 14, farmer_name: 'Gopal Krishan', quantity: 25 },
          ],
          status: 'OPEN_FOR_INSTITUTIONAL_BID',
          created_at: new Date(Date.now() - 43200000).toISOString(),
        },
      ],
      notifications: [
        {
          id: 1,
          user_id: 1,
          title: 'Indore Mandi Price Spike Alert: Wheat +₹80/Qtl',
          message: 'Indore APMC modal price surged to ₹2,920/Qtl (+₹80 over local benchmark). Demand index: High. Recommended selling window is active.',
          type: 'price_alert',
          channel: 'WHATSAPP',
          crop_name: 'Wheat',
          mandi_name: 'Indore APMC Mandi',
          price_change: 80,
          action_tab: 'markets',
          is_read: false,
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          user_id: 1,
          title: 'Direct Purchase Proposal Received',
          message: 'ITC Foods Agri-Procurement sent direct offer of ₹2,920/Qtl for 140 Qtl Sharbati Wheat lot with assisted farm-gate loading.',
          type: 'offer_alert',
          channel: 'SMS',
          trade_id: 201,
          crop_name: 'Wheat',
          action_tab: 'buyers',
          is_read: false,
          created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          user_id: 1,
          title: 'Digital Escrow Security Locked: ₹4,08,800',
          message: '100% trade value for Contract #REQ-201 is now held in RBI-regulated Digital Escrow bank clearing account. Gate Pass GP-SEH-4821 verified.',
          type: 'payment_alert',
          channel: 'WHATSAPP',
          trade_id: 201,
          gate_pass_id: 'GP-SEH-4821',
          action_tab: 'buyers',
          is_read: false,
          created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        },
        {
          id: 4,
          user_id: 7,
          title: 'Farmer Accepted Direct Proposal',
          message: 'Rajinder Singh accepted your purchase offer for 140 Quintal Sharbati Wheat @ ₹2,920/Qtl. Electronic Gate Pass #GP-SEH-4821 generated.',
          type: 'trade_alert',
          channel: 'WHATSAPP',
          trade_id: 201,
          gate_pass_id: 'GP-SEH-4821',
          is_read: false,
          created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        },
        {
          id: 5,
          user_id: 1,
          title: 'Soybean Rate Alert: +₹140/Qtl Surge',
          message: 'Solvent extraction demand in Ujjain and Sehore pushed Yellow Soybean to ₹4,920/Qtl. Good opportunity to clear lot inventory.',
          type: 'price_alert',
          channel: 'SMS',
          crop_name: 'Soybean',
          mandi_name: 'Sehore APMC Mandi',
          price_change: 140,
          action_tab: 'markets',
          is_read: true,
          created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        },
      ],
      nextListingId: 104,
      nextRequestId: 202,
      nextStorageBookingId: 2,
      nextDisputeId: 2,
      nextNotificationId: 6,
    };
  }

  private loadDatabase(): DatabaseState {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.farmer_listings) && Array.isArray(parsed.buyer_requests)) {
          // Ensure new collections exist in loaded state
          if (!Array.isArray(parsed.storage_facilities)) parsed.storage_facilities = this.getDefaultState().storage_facilities;
          if (!Array.isArray(parsed.storage_bookings)) parsed.storage_bookings = this.getDefaultState().storage_bookings;
          if (!Array.isArray(parsed.disputes)) parsed.disputes = this.getDefaultState().disputes;
          if (!Array.isArray(parsed.fpo_aggregated_lots)) parsed.fpo_aggregated_lots = this.getDefaultState().fpo_aggregated_lots;
          if (!Array.isArray(parsed.notifications)) parsed.notifications = this.getDefaultState().notifications;
          if (!parsed.nextStorageBookingId) parsed.nextStorageBookingId = 2;
          if (!parsed.nextDisputeId) parsed.nextDisputeId = 2;
          if (!parsed.nextNotificationId) parsed.nextNotificationId = 6;

          // Backfill unique platform_id & secure password hashes for legacy users
          if (Array.isArray(parsed.users)) {
            parsed.users.forEach((user: UserRecord) => {
              if (!user.platform_id) {
                if (user.id === 1) user.platform_id = 'ADP-FMR-10001';
                else if (user.id === 2) user.platform_id = 'ADP-FMR-10002';
                else if (user.id === 3) user.platform_id = 'ADP-FMR-10003';
                else if (user.id === 7) user.platform_id = 'ADP-BYR-20001';
                else if (user.id === 8) user.platform_id = 'ADP-BYR-20002';
                else if (user.id === 11) user.platform_id = 'ADP-ADM-00001';
                else user.platform_id = generatePlatformId(user.role || 'farmer', parsed.users);
              }
              if (!user.password_hash || user.password_hash === 'demo_pass_hash') {
                user.password_hash = user.role === 'buyer' ? hashPassword('Buyer@1234') : user.role === 'admin' ? hashPassword('Admin@1234') : hashPassword('Kisan@Demo123');
              }
            });
          }

          // Session-only crop image policy: Clear old uploaded crop images on application/server restart
          parsed.farmer_listings.forEach((listing: FarmerListingRecord) => {
            delete listing.crop_image_url;
            delete (listing as any).cropImageUrl;
            delete (listing as any).imageUrl;
            delete (listing as any).image_url;
          });

          this.saveDatabase(parsed);
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Database load warning (using defaults):', e);
    }
    const defaultState = this.getDefaultState();
    this.saveDatabase(defaultState);
    return defaultState;
  }

  private saveDatabase(stateToSave?: DatabaseState): void {
    const s = stateToSave || this.state;
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(s, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Database write warning:', e);
    }
  }

  // --- Users ---
  public getUsers(): UserRecord[] {
    return [...this.state.users];
  }

  public getUserById(id: number): UserRecord | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  public getUserByPlatformId(platformId: string): UserRecord | undefined {
    if (!platformId) return undefined;
    const cleanId = platformId.trim().toUpperCase();
    return this.state.users.find((u) => u.platform_id && u.platform_id.toUpperCase() === cleanId);
  }

  public getUserByPhone(phone: string): UserRecord | undefined {
    if (!phone) return undefined;
    const clean = phone.replace(/\D/g, '');
    if (!clean) return undefined;
    return this.state.users.find((u) => {
      const uClean = u.phone.replace(/\D/g, '');
      return uClean === clean || uClean.endsWith(clean) || clean.endsWith(uClean);
    });
  }

  public getUserByEmail(email: string): UserRecord | undefined {
    if (!email) return undefined;
    const clean = email.trim().toLowerCase();
    return this.state.users.find((u) => u.email && u.email.trim().toLowerCase() === clean);
  }

  public getUserByIdentifier(identifier: string): UserRecord | undefined {
    if (!identifier) return undefined;
    const trimmed = identifier.trim();

    // 1. Check direct platform ID (e.g. ADP-FMR-XXXXXX, ADP-BYR-XXXXXX, ADP-ADM-XXXXXX)
    const byPlatformId = this.getUserByPlatformId(trimmed);
    if (byPlatformId) return byPlatformId;

    // 2. Check if email
    if (trimmed.includes('@')) {
      const byEmail = this.getUserByEmail(trimmed);
      if (byEmail) return byEmail;
    }

    // 3. Check phone
    const byPhone = this.getUserByPhone(trimmed);
    if (byPhone) return byPhone;

    // 4. Case-insensitive name match fallback
    return this.state.users.find((u) => u.name && u.name.toLowerCase() === trimmed.toLowerCase());
  }

  public verifyUserCredentials(identifier: string, passwordAttempt: string, expectedRole?: 'farmer' | 'buyer' | 'admin'): { user: UserRecord | null; error?: string } {
    const user = this.getUserByIdentifier(identifier);
    if (!user) {
      return { user: null, error: 'User account not found with the provided credentials.' };
    }

    // Strict Role Authorization: Stored role must be authoritative
    if (expectedRole && user.role !== expectedRole) {
      const roleLabel = expectedRole === 'farmer' ? 'Farmer' : expectedRole === 'buyer' ? 'Buyer' : 'Admin';
      const actualRoleLabel = user.role === 'farmer' ? 'Farmer' : user.role === 'buyer' ? 'Buyer' : 'Admin';
      return {
        user: null,
        error: `Role authorization error: This account is registered as ${actualRoleLabel} and cannot sign in through ${roleLabel} portal.`,
      };
    }

    // Verify Password
    const isValid = verifyPassword(passwordAttempt, user.password_hash);
    if (!isValid) {
      return { user: null, error: 'Invalid password. Please check your credentials and try again.' };
    }

    return { user };
  }

  public createUser(data: {
    name: string;
    phone: string;
    email?: string;
    role: 'farmer' | 'buyer' | 'admin';
    location?: string;
    password?: string;
    password_hash?: string;
    platform_id?: string;
  }): UserRecord {
    const newId = this.state.users.length > 0 ? Math.max(...this.state.users.map((u) => u.id)) + 1 : 1;
    const now = new Date().toISOString();
    const generatedId = data.platform_id || generatePlatformId(data.role, this.state.users);
    const passHash = data.password_hash || (data.password ? hashPassword(data.password) : hashPassword('Kisan@Demo123'));

    const newUser: UserRecord = {
      id: newId,
      platform_id: generatedId,
      name: data.name,
      phone: data.phone,
      email: data.email || `${data.role}-${newId}@agridirect.in`,
      password_hash: passHash,
      role: data.role,
      location: data.location || 'Madhya Pradesh',
      created_at: now,
    };
    this.state.users.push(newUser);
    this.saveDatabase();
    return newUser;
  }

  // --- Farmer Listings ---
  public getFarmerListings(farmerId?: number, activeOnly: boolean = false): FarmerListingRecord[] {
    let list = [...this.state.farmer_listings];
    if (farmerId !== undefined) {
      list = list.filter((l) => l.farmer_id === farmerId);
    }
    if (activeOnly) {
      list = list.filter((l) => l.status === 'active' && l.quantity_quintals > 0);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getFarmerListingById(id: number | string): FarmerListingRecord | undefined {
    const numericId = Number(id);
    return this.state.farmer_listings.find((l) => l.id === numericId || String(l.id) === String(id));
  }

  public createFarmerListing(data: {
    farmer_id?: number;
    farmer_name?: string;
    crop_name: string;
    variety: string;
    quantity_quintals: number;
    expected_price_per_quintal: number;
    quality_grade?: string;
    moisture_percent?: number;
    foreign_matter_percent?: number;
    grain_damage_percent?: number;
    quality_remarks?: string;
    crop_image_url?: string;
    cropImageUrl?: string;
    imageUrl?: string;
    location_village?: string;
    district?: string;
    state?: string;
    delivery_option?: string;
    available_date?: string;
    fpo_lot_id?: string;
  }): FarmerListingRecord {
    const id = this.state.nextListingId++;
    const now = new Date().toISOString();

    const newListing: FarmerListingRecord = {
      id,
      farmer_id: data.farmer_id || 1,
      farmer_name: data.farmer_name || 'Rajinder Singh (Verified Farmer)',
      crop_name: data.crop_name,
      variety: data.variety || 'Standard FAQ',
      quantity_quintals: Number(data.quantity_quintals) || 100,
      expected_price_per_quintal: Number(data.expected_price_per_quintal) || 2900,
      quality_grade: data.quality_grade || 'Grade A',
      moisture_percent: data.moisture_percent !== undefined ? Number(data.moisture_percent) : 10.5,
      foreign_matter_percent: data.foreign_matter_percent !== undefined ? Number(data.foreign_matter_percent) : 0.6,
      grain_damage_percent: data.grain_damage_percent !== undefined ? Number(data.grain_damage_percent) : 0.9,
      quality_remarks: data.quality_remarks || 'Self-declared clean lot; visual crop evidence provided.',
      crop_image_url: data.crop_image_url || data.cropImageUrl || data.imageUrl || undefined,
      location_village: data.location_village || 'Sehore, Madhya Pradesh',
      district: data.district || 'Sehore',
      state: data.state || 'Madhya Pradesh',
      delivery_option: data.delivery_option || 'Flexible',
      available_date: data.available_date || 'Immediate / Ready in Barn',
      fpo_lot_id: data.fpo_lot_id,
      status: 'active',
      views_count: 1,
      matched_buyers_count: 3,
      created_at: now,
      updated_at: now,
    };

    this.state.farmer_listings.unshift(newListing);
    this.saveDatabase();
    return newListing;
  }

  public deleteFarmerListing(id: number | string, farmerId?: number): boolean {
    const numericId = Number(id);
    const index = this.state.farmer_listings.findIndex(
      (l) => (l.id === numericId || String(l.id) === String(id)) && (!farmerId || l.farmer_id === farmerId)
    );
    if (index !== -1) {
      this.state.farmer_listings.splice(index, 1);
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- Buyer Requests & Trade Negotiation ---
  public getBuyerRequests(options: { buyerId?: number; farmerId?: number; listingId?: number } = {}): BuyerRequestRecord[] {
    let reqs = [...this.state.buyer_requests];
    if (options.buyerId !== undefined) {
      reqs = reqs.filter((r) => r.buyer_id === options.buyerId);
    }
    if (options.farmerId !== undefined) {
      reqs = reqs.filter((r) => r.farmer_id === options.farmerId);
    }
    if (options.listingId !== undefined) {
      reqs = reqs.filter((r) => r.listing_id === options.listingId);
    }
    return reqs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getBuyerRequestById(id: number | string): BuyerRequestRecord | undefined {
    const numericId = Number(id);
    return this.state.buyer_requests.find((r) => r.id === numericId || String(r.id) === String(id));
  }

  public createBuyerRequest(data: {
    listing_id?: number | string;
    buyer_id?: number;
    buyer_name?: string;
    crop_name?: string;
    variety?: string;
    quantity?: number;
    offered_price?: number;
    delivery_option?: string;
    message?: string;
    quality_grade?: string;
  }): BuyerRequestRecord {
    const id = this.state.nextRequestId++;
    const now = new Date().toISOString();

    const rawQty = data.quantity !== undefined ? Number(data.quantity) : 50;
    if (isNaN(rawQty) || rawQty <= 0) {
      const err: any = new Error(`Invalid requested quantity (${data.quantity}). Quantity must be a positive number greater than zero.`);
      err.statusCode = 400;
      throw err;
    }

    const rawPrice = data.offered_price !== undefined ? Number(data.offered_price) : 2920;
    if (isNaN(rawPrice) || rawPrice <= 0) {
      const err: any = new Error(`Invalid offered price (${data.offered_price}). Price must be a positive number greater than zero.`);
      err.statusCode = 400;
      throw err;
    }

    let listing: FarmerListingRecord | undefined;
    if (data.listing_id !== undefined && data.listing_id !== null && data.listing_id !== '') {
      const numericListingId = Number(data.listing_id);
      listing = this.state.farmer_listings.find(
        (l) => l.id === numericListingId || String(l.id) === String(data.listing_id)
      );
      if (!listing) {
        const err: any = new Error(`Listing lot #${data.listing_id} not found.`);
        err.statusCode = 404;
        throw err;
      }
    }

    const farmerId = listing?.farmer_id || 1;
    const cropName = listing?.crop_name || data.crop_name || 'Wheat';
    const variety = listing?.variety || data.variety || 'Sharbati Lokwan';
    const farmerExpectedPrice = listing?.expected_price_per_quintal || rawPrice;
    const farmerLocation = listing ? `${listing.location_village}, ${listing.district}` : 'Sehore, MP';
    const qualityGrade = listing?.quality_grade || data.quality_grade || 'Grade A';

    // Quality match evaluation
    const qualityMatchScore = qualityGrade.includes('A') ? 95 : qualityGrade.includes('B') ? 80 : 65;
    const qualityMatchStatus: 'MATCH' | 'PARTIAL MATCH' | 'NOT MATCHED' =
      qualityMatchScore >= 85 ? 'MATCH' : qualityMatchScore >= 70 ? 'PARTIAL MATCH' : 'NOT MATCHED';

    const qty = rawQty;
    const price = rawPrice;

    // Validate listing lot availability on creation
    if (listing) {
      if (listing.status === 'completed' || listing.quantity_quintals <= 0) {
        const err: any = new Error(`Cannot submit proposal: Listing lot #${listing.id} is already fully sold out.`);
        err.statusCode = 400;
        throw err;
      }
      if (qty > listing.quantity_quintals) {
        const err: any = new Error(
          `Requested volume (${qty} Qtl) exceeds the available listing lot volume (${listing.quantity_quintals} Qtl). Please specify a quantity up to ${listing.quantity_quintals} Qtl.`
        );
        err.statusCode = 400;
        throw err;
      }
    }

    const totalTradeValue = qty * price;

    const newRequest: BuyerRequestRecord = {
      id,
      listing_id: listing ? listing.id : (data.listing_id ? Number(data.listing_id) : 101),
      buyer_id: data.buyer_id || 7,
      buyer_name: data.buyer_name || 'ITC Foods Agri-Procurement',
      farmer_id: farmerId,
      crop_name: cropName,
      variety,
      quantity: qty,
      offered_price: price,
      counter_price: null,
      farmer_expected_price: farmerExpectedPrice,
      farmer_location: farmerLocation,
      delivery_option: data.delivery_option || 'Farm-gate Pickup (Assisted Weighment)',
      message: data.message || 'Direct purchase proposal sent.',
      quality_grade: qualityGrade,
      quality_match_score: qualityMatchScore,
      quality_match_status: qualityMatchStatus,
      status: 'pending',
      order_status: 'Order Placed',
      payment_status: 'Pending',
      status_message: 'Proposal awaiting farmer review.',
      gate_pass_id: null,
      timeline: [
        {
          event_type: 'ORDER_PLACED',
          title: 'Order Placed',
          description: `Direct purchase proposal of ₹${price}/Qtl for ${qty} Qtl placed.`,
          timestamp: now,
          actor_name: data.buyer_name || 'Buyer',
          actor_role: 'Buyer',
        },
        {
          event_type: 'OFFER_SUBMITTED',
          title: 'Direct Purchase Proposal Transmitted',
          description: `Buyer offered ₹${price}/Qtl for ${qty} Qtl lot.`,
          timestamp: now,
          actor_name: data.buyer_name || 'Buyer',
          actor_role: 'Buyer',
        },
      ],
      created_at: now,
      updated_at: now,
    };

    this.state.buyer_requests.unshift(newRequest);
    this.saveDatabase();
    return newRequest;
  }

  /**
   * Update Request Status with atomic quantity deduction, logistics init, and payment ledger init
   */
  public updateBuyerRequestStatus(
    requestId: number | string,
    action: {
      status: 'pending' | 'accepted' | 'countered' | 'rejected' | 'completed' | 'cancelled';
      message?: string;
      counterPrice?: number | null;
      counterQuantity?: number | null;
      acceptQuantity?: number | null;
      actorUserId?: number;
      actorRole?: string;
    }
  ): { request: BuyerRequestRecord; listing?: FarmerListingRecord } {
    const req = this.getBuyerRequestById(requestId);
    if (!req) {
      const err: any = new Error(`Buyer request with ID ${requestId} not found.`);
      err.statusCode = 404;
      throw err;
    }

    // Role & Ownership Verification
    if (action.actorRole && action.actorRole !== 'admin' && action.actorUserId !== undefined) {
      if (action.actorRole === 'farmer' && req.farmer_id !== action.actorUserId) {
        const err: any = new Error('Forbidden: You do not have permission to modify another farmer\'s trade request.');
        err.statusCode = 403;
        throw err;
      }
      if (action.actorRole === 'buyer' && req.buyer_id !== action.actorUserId) {
        const err: any = new Error('Forbidden: You do not have permission to modify another buyer\'s trade request.');
        err.statusCode = 403;
        throw err;
      }
    }

    const now = new Date().toISOString();

    let listing: FarmerListingRecord | undefined;
    if (req.listing_id) {
      listing = this.getFarmerListingById(req.listing_id);
    }

    if (action.status === 'accepted') {
      // If caller explicitly requested to accept a specific quantity (e.g. remaining lot balance)
      if (action.acceptQuantity !== undefined && action.acceptQuantity !== null && Number(action.acceptQuantity) > 0) {
        const desiredQty = Number(action.acceptQuantity);
        if (listing && desiredQty > listing.quantity_quintals) {
          const err: any = new Error(
            `Specified accept volume (${desiredQty} Qtl) exceeds available listing lot volume (${listing.quantity_quintals} Qtl).`
          );
          err.statusCode = 400;
          err.details = { requestedQuantity: req.quantity, availableQuantity: listing.quantity_quintals };
          throw err;
        }
        req.quantity = desiredQty;
      } else {
        // Standard full volume acceptance check
        if (req.quantity <= 0) {
          const err: any = new Error(`Invalid requested quantity: ${req.quantity} Qtl. Quantity must be greater than zero.`);
          err.statusCode = 400;
          throw err;
        }

        if (listing) {
          if (listing.quantity_quintals <= 0) {
            const err: any = new Error(
              `Cannot accept request: Available lot inventory has already been sold (0 Qtl remaining).`
            );
            err.statusCode = 400;
            err.details = { requestedQuantity: req.quantity, availableQuantity: 0 };
            throw err;
          }

          if (req.quantity > listing.quantity_quintals) {
            const err: any = new Error(
              `Cannot accept request: Requested volume (${req.quantity} Qtl) exceeds available listing lot volume (${listing.quantity_quintals} Qtl).`
            );
            err.statusCode = 400;
            err.details = {
              requestedQuantity: req.quantity,
              availableQuantity: listing.quantity_quintals,
              listingId: listing.id,
              cropName: listing.crop_name,
            };
            throw err;
          }
        }
      }

      req.status = action.status;
      req.order_status = 'Offer Accepted';
      req.payment_status = 'Pending';
      req.updated_at = now;
      if (!Array.isArray(req.timeline)) req.timeline = [];

      // Generate electronic Gate Pass
      const gatePassNumber = Math.floor(1000 + Math.random() * 9000);
      req.gate_pass_id = `GP-SEH-${gatePassNumber}`;
      req.status_message =
        action.message ||
        `Trade contract finalized for ${req.quantity} Qtl at ₹${req.counter_price || req.offered_price}/Qtl. Electronic Gate Pass #${req.gate_pass_id} issued for farm-gate weighment.`;

      const agreedPrice = req.counter_price || req.offered_price;
      const totalTradeVal = req.quantity * agreedPrice;

      // Initialize Logistics workflow
      req.logistics = {
        status: 'REQUESTED',
        pickup_location: req.farmer_location || 'Farmer Barn, Ashta, Sehore',
        delivery_location: `${req.buyer_name} Depot, Sehore Industrial Area`,
        pickup_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        vehicle_type: req.quantity <= 40 ? 'Tractor Trolley (Up to 40 Qtl)' : 'Mini Commercial Truck (3 Ton / 60 Qtl)',
        estimated_freight: Math.round(req.quantity * 25), // ₹25/Qtl est.
        updated_at: now,
      };

      // Initialize Payment tracking ledger with Stage 1: OFFER_ACCEPTED
      req.payment = {
        status: 'OFFER_ACCEPTED',
        total_trade_value: totalTradeVal,
        amount_paid: 0,
        remaining_amount: totalTradeVal,
        escrow_held_amount: 0,
        payment_due_date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        payment_method: 'Digital Escrow Bank Clearance (T+0)',
        escrow_token: `ESC-${gatePassNumber}-${Date.now().toString().slice(-4)}`,
        history: [
          {
            trade_id: req.id,
            previous_status: 'UNPAID',
            new_status: 'OFFER_ACCEPTED',
            status: 'OFFER_ACCEPTED',
            amount: totalTradeVal,
            timestamp: now,
            actor: 'Farmer (Seller)',
            note: `Offer accepted at ₹${agreedPrice}/Qtl for ${req.quantity} Qtl. Total contract value ₹${totalTradeVal.toLocaleString('en-IN')}.`,
            reference_id: `ESC-${gatePassNumber}-${Date.now().toString().slice(-4)}`,
          },
        ],
        updated_at: now,
      };

      // Record timeline event
      req.timeline.push({
        event_type: 'OFFER_ACCEPTED',
        title: 'Trade Finalized & Gate Pass Issued',
        description: `Farmer accepted offer of ₹${agreedPrice}/Qtl for ${req.quantity} Qtl. Electronic Gate Pass #${req.gate_pass_id} generated.`,
        timestamp: now,
        actor_name: 'Farmer (Seller)',
        actor_role: 'Farmer',
      });

      // Transactionally deduct quantity from listing and handle consistency
      if (listing) {
        const remainingQty = listing.quantity_quintals - req.quantity;
        listing.quantity_quintals = remainingQty;
        listing.updated_at = now;

        if (remainingQty === 0) {
          listing.status = 'completed';

          // Mark any other still-pending requests against this listing as cancelled
          const otherPending = this.state.buyer_requests.filter(
            (o) => o.listing_id === listing!.id && o.id !== req.id && (o.status === 'pending' || o.status === 'countered')
          );
          for (const otherReq of otherPending) {
            otherReq.status = 'cancelled';
            otherReq.status_message = 'Trade closed: The listing lot has been fully committed to another finalized contract.';
            otherReq.updated_at = now;
            if (!Array.isArray(otherReq.timeline)) otherReq.timeline = [];
            otherReq.timeline.push({
              event_type: 'ORDER_CANCELLED',
              title: 'Listing Volume Depleted',
              description: 'Listing inventory reached zero due to another accepted contract.',
              timestamp: now,
              actor_name: 'AgriDirect Inventory Engine',
              actor_role: 'System',
            });
          }
        } else {
          listing.status = 'active';
        }
      }
    } else {
      req.status = action.status;
      req.updated_at = now;
      if (!Array.isArray(req.timeline)) req.timeline = [];

      if (action.status === 'countered') {
        if (action.counterQuantity !== undefined && action.counterQuantity !== null && Number(action.counterQuantity) > 0) {
          req.quantity = Number(action.counterQuantity);
        }
        if (action.counterPrice !== undefined && action.counterPrice !== null && Number(action.counterPrice) > 0) {
          req.counter_price = Number(action.counterPrice);
        }
        req.status_message =
          action.message ||
          `Farmer proposed a counter-rate of ₹${req.counter_price || req.offered_price}/Qtl for ${req.quantity} Qtl. Awaiting buyer confirmation.`;

        req.timeline.push({
          event_type: 'COUNTER_OFFER',
          title: 'Counter Offer Proposed',
          description: `Farmer proposed counter rate of ₹${req.counter_price || req.offered_price}/Qtl for ${req.quantity} Qtl.`,
          timestamp: now,
          actor_name: 'Farmer (Seller)',
          actor_role: 'Farmer',
        });
      } else if (action.status === 'rejected') {
        req.status_message = action.message || 'Trade proposal declined.';
        req.timeline.push({
          event_type: 'OFFER_REJECTED',
          title: 'Offer Declined',
          description: action.message || 'Farmer declined the proposal.',
          timestamp: now,
          actor_name: 'Farmer (Seller)',
          actor_role: 'Farmer',
        });
      } else if (action.status === 'completed') {
        req.order_status = 'Order Completed';
        req.payment_status = 'Successful';
        req.status_message = action.message || 'Trade settlement, delivery verification, and payment completed.';
        if (req.payment) {
          req.payment.status = 'FULLY PAID';
          req.payment.amount_paid = req.payment.total_trade_value;
          req.payment.remaining_amount = 0;
          req.payment.updated_at = now;
        }
        if (req.logistics) {
          req.logistics.status = 'DELIVERED';
          req.logistics.updated_at = now;
        }
        req.timeline.push({
          event_type: 'TRADE_COMPLETED',
          title: 'Trade Settlement & Delivery Complete',
          description: 'Quality verified at weighbridge; escrow payment disbursed to farmer account.',
          timestamp: now,
          actor_name: 'AgriDirect Settlement Protocol',
          actor_role: 'System',
        });
      }
    }

    this.saveDatabase();
    return { request: req, listing };
  }

  /**
   * Update Logistics Workflow
   */
  public updateTradeLogistics(
    tradeId: number | string,
    updates: Partial<LogisticsDetails>
  ): BuyerRequestRecord {
    const req = this.getBuyerRequestById(tradeId);
    if (!req) throw new Error(`Trade with ID ${tradeId} not found.`);

    const now = new Date().toISOString();
    if (!req.logistics) {
      req.logistics = {
        status: 'REQUESTED',
        pickup_location: req.farmer_location || 'Farmer Barn, Sehore',
        delivery_location: `${req.buyer_name} Hub`,
        pickup_date: now.split('T')[0],
        vehicle_type: 'Mini Commercial Truck (3 Ton / 60 Qtl)',
        estimated_freight: req.quantity * 25,
        updated_at: now,
      };
    }

    Object.assign(req.logistics, updates, { updated_at: now });

    if (!Array.isArray(req.timeline)) req.timeline = [];
    req.timeline.push({
      event_type: `LOGISTICS_${req.logistics.status}`,
      title: `Transport Status: ${req.logistics.status}`,
      description: `Logistics updated to ${req.logistics.status}. Estimated Freight: ₹${req.logistics.estimated_freight}.`,
      timestamp: now,
      actor_name: 'Logistics Coordinator',
      actor_role: 'Logistics',
    });

    this.saveDatabase();
    return req;
  }

  /**
   * Update Payment Tracking Ledger & 4-Stage State Machine
   * Enforces: OFFER_ACCEPTED -> PAYMENT_INITIATED -> ESCROW_HELD -> PAYMENT_RELEASED
   */
  public updateTradePayment(
    tradeId: number | string,
    updates: Partial<PaymentDetails> & {
      notes?: string;
      actorName?: string;
      actorRole?: string;
      verifiedQualityGrade?: string;
      verifiedMoisturePercent?: number;
    }
  ): BuyerRequestRecord {
    const req = this.getBuyerRequestById(tradeId);
    if (!req) {
      const err: any = new Error(`Trade with ID ${tradeId} not found.`);
      err.statusCode = 404;
      throw err;
    }

    // 1. Unaccepted trade protection: Payment begins ONLY when trade is in 'accepted' (or 'completed') status
    const isTradeAccepted = req.status === 'accepted' || (req.status as string) === 'Offer Accepted' || req.status === 'completed';
    if (!isTradeAccepted) {
      const err: any = new Error(`Payment transitions are only permitted for accepted trades. Current trade status is '${req.status}'.`);
      err.statusCode = 400;
      throw err;
    }

    const now = new Date().toISOString();
    const agreedPrice = Number(req.counter_price || req.offered_price || 0);
    const totalVal = Number(req.quantity) * agreedPrice;
    const gatePassNum = req.gate_pass_id || `GP-${Date.now().toString().slice(-4)}`;

    if (!req.payment) {
      req.payment = {
        status: 'OFFER_ACCEPTED',
        total_trade_value: totalVal,
        amount_paid: 0,
        remaining_amount: totalVal,
        advance_amount: 0,
        escrow_held_amount: 0,
        payment_due_date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        payment_method: 'Digital Escrow Bank Clearance (T+0)',
        escrow_token: `ESC-${Date.now().toString().slice(-6)}`,
        history: [
          {
            trade_id: req.id,
            previous_status: 'UNPAID',
            new_status: 'OFFER_ACCEPTED',
            status: 'OFFER_ACCEPTED',
            amount: totalVal,
            timestamp: now,
            actor: 'Farmer (Seller)',
            note: `Offer accepted at ₹${agreedPrice}/Qtl for ${req.quantity} Qtl.`,
            reference_id: req.gate_pass_id || undefined,
          },
        ],
        updated_at: now,
      };
    }

    if (!Array.isArray(req.payment.history)) {
      req.payment.history = [];
    }

    // Total contract value is strictly authoritative from trade terms (quantity * agreedPrice)
    req.payment.total_trade_value = totalVal;
    req.payment.amount_total = totalVal;

    const currentNormalized = normalizePaymentStatus(req.payment.status);
    const requestedRaw = updates.status || req.payment.status;
    const targetNormalized = normalizePaymentStatus(requestedRaw);

    // 2. Idempotency: Repeating an already completed transition must be safely idempotent
    if (currentNormalized === targetNormalized) {
      return req;
    }

    const currentOrder = PAYMENT_STAGE_ORDER[currentNormalized];
    const targetOrder = PAYMENT_STAGE_ORDER[targetNormalized];

    // 3. Prevent reverse transitions
    if (targetOrder < currentOrder) {
      const err: any = new Error(
        `Invalid payment transition: Cannot revert from ${currentNormalized} back to ${targetNormalized}. Reverse transitions are strictly forbidden.`
      );
      err.statusCode = 400;
      throw err;
    }

    // 4. Prevent skipping stages
    const expectedNext = PAYMENT_NEXT_STAGE[currentNormalized];
    if (targetNormalized !== expectedNext) {
      const err: any = new Error(
        `Invalid payment transition: Cannot jump from ${currentNormalized} directly to ${targetNormalized}. Stage skipping is strictly forbidden. Next required stage is ${expectedNext}.`
      );
      err.statusCode = 400;
      throw err;
    }

    // Update payment properties
    req.payment.status = targetNormalized;
    if (updates.payment_method) req.payment.payment_method = updates.payment_method;
    if (updates.payment_due_date) req.payment.payment_due_date = updates.payment_due_date;
    if (updates.escrow_token) req.payment.escrow_token = updates.escrow_token;

    let actionDescription = '';
    let actorName = updates.actorName || (updates.actorRole === 'Buyer' ? req.buyer_name : updates.actorRole === 'Farmer' ? 'Farmer (Seller)' : 'AgriDirect Digital Escrow');

    if (targetNormalized === 'PAYMENT_INITIATED') {
      req.payment.amount_paid = 0;
      req.payment.remaining_amount = totalVal;
      req.payment.escrow_held_amount = 0;
      actionDescription = `Buyer ${req.buyer_name} initiated payment clearing order of ₹${totalVal.toLocaleString('en-IN')} via Digital Escrow channel.`;

      // Auto-notify Farmer
      this.createNotification({
        user_id: req.farmer_id || 1,
        title: `Payment Initiated: ₹${totalVal.toLocaleString('en-IN')}`,
        message: `Buyer ${req.buyer_name} initiated payment clearing order for ${req.quantity} Qtl ${req.crop_name} (Contract #${req.id}). Funds pending escrow lock.`,
        type: 'payment_alert',
        channel: 'WHATSAPP',
        trade_id: req.id,
        gate_pass_id: req.gate_pass_id || undefined,
        action_tab: 'buyers',
      });
    } else if (targetNormalized === 'ESCROW_HELD') {
      req.payment.escrow_held_amount = totalVal;
      req.payment.amount_paid = 0;
      req.payment.remaining_amount = totalVal;
      actionDescription = `100% contract funds (₹${totalVal.toLocaleString('en-IN')}) secured in RBI-regulated Digital Escrow clearing vault.`;

      // Auto-notify Farmer & Buyer
      this.createNotification({
        user_id: req.farmer_id || 1,
        title: `Escrow Secured: ₹${totalVal.toLocaleString('en-IN')} Locked`,
        message: `100% trade funds for ${req.quantity} Qtl ${req.crop_name} are securely held in Digital Escrow. Gate Pass: ${gatePassNum}.`,
        type: 'payment_alert',
        channel: 'SMS',
        trade_id: req.id,
        gate_pass_id: req.gate_pass_id || undefined,
        action_tab: 'buyers',
      });
    } else if (targetNormalized === 'PAYMENT_RELEASED') {
      req.payment.amount_paid = totalVal;
      req.payment.remaining_amount = 0;
      req.payment.escrow_held_amount = 0;
      if (!req.payment.bank_reference_utr) {
        req.payment.bank_reference_utr = `UTR-SBIN${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      }
      actionDescription = `Full settlement of ₹${totalVal.toLocaleString('en-IN')} released and credited to Farmer's bank account. Bank Reference: ${req.payment.bank_reference_utr} (T+0 instant clearance).`;

      // Auto-notify Farmer
      this.createNotification({
        user_id: req.farmer_id || 1,
        title: `Payment Credit Alert: ₹${totalVal.toLocaleString('en-IN')} Received`,
        message: `₹${totalVal.toLocaleString('en-IN')} has been credited to your Bank A/C via NEFT/IMPS. Bank UTR Ref: ${req.payment.bank_reference_utr}. Trade contract #${req.id} fully settled.`,
        type: 'payment_alert',
        channel: 'SMS',
        trade_id: req.id,
        gate_pass_id: req.gate_pass_id || undefined,
        action_tab: 'buyers',
      });
    }

    req.payment.last_transition_by = actorName;
    req.payment.updated_at = now;

    if (targetNormalized === 'PAYMENT_INITIATED') {
      req.payment_status = 'Processing';
    } else if (targetNormalized === 'ESCROW_HELD' || targetNormalized === 'PAYMENT_RELEASED') {
      req.payment_status = 'Successful';
      const curOrderStep = getDerivedOrderStatus(req);
      if (curOrderStep === 'Order Placed' || curOrderStep === 'Offer Accepted') {
        req.order_status = 'Payment';
      }
    }

    // Append to payment history
    req.payment.history.push({
      trade_id: req.id,
      previous_status: currentNormalized,
      new_status: targetNormalized,
      status: targetNormalized,
      amount: totalVal,
      timestamp: now,
      note: updates.notes || actionDescription,
      actor: actorName,
      reference_id: req.payment.bank_reference_utr || req.payment.escrow_token || undefined,
    });

    // Append to main trade audit timeline
    if (!Array.isArray(req.timeline)) req.timeline = [];
    req.timeline.push({
      event_type: `PAYMENT_${targetNormalized}`,
      title: `Escrow Ledger: ${targetNormalized.replace(/_/g, ' ')}`,
      description: actionDescription,
      timestamp: now,
      actor_name: actorName,
      actor_role: updates.actorRole || 'Escrow Authority',
    });

    this.saveDatabase();
    return req;
  }

  /**
   * Dedicated Order Lifecycle Progression Method
   * Steps: 'Order Placed' -> 'Offer Accepted' -> 'Payment' -> 'Pickup Scheduled' -> 'Crop Picked Up' -> 'Quality/Weighment' -> 'Delivered' -> 'Order Completed'
   */
  public updateOrderStatus(
    requestId: number | string,
    newStatus: OrderLifecycleStep,
    notes?: string,
    actorRole: string = 'Buyer',
    actorName?: string
  ): BuyerRequestRecord {
    const req = this.getBuyerRequestById(requestId);
    if (!req) {
      const err: any = new Error(`Order #${requestId} not found.`);
      err.statusCode = 404;
      throw err;
    }
    if (!ORDER_LIFECYCLE_STEPS.includes(newStatus)) {
      const err: any = new Error(`Invalid order lifecycle step: ${newStatus}`);
      err.statusCode = 400;
      throw err;
    }

    const now = new Date().toISOString();
    req.order_status = newStatus;
    req.updated_at = now;

    if (!Array.isArray(req.timeline)) req.timeline = [];

    // Synchronize logistics and high-level status based on step
    if (newStatus === 'Offer Accepted') {
      req.status = 'accepted';
      if (!req.payment_status) req.payment_status = 'Pending';
    } else if (newStatus === 'Payment') {
      if (req.payment_status !== 'Successful') {
        req.payment_status = 'Successful';
      }
      if (req.payment) {
        req.payment.status = 'ESCROW_HELD';
      }
    } else if (newStatus === 'Pickup Scheduled') {
      if (!req.logistics) {
        req.logistics = {
          status: 'SCHEDULED',
          pickup_location: req.farmer_location || 'Farm-gate Barn, Sehore',
          delivery_location: `${req.buyer_name} Central Depot`,
          pickup_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          vehicle_type: req.quantity <= 40 ? 'Tractor Trolley (Up to 40 Qtl)' : 'Mini Commercial Truck (3 Ton)',
          estimated_freight: Math.round(req.quantity * 25),
          updated_at: now,
        };
      } else {
        req.logistics.status = 'SCHEDULED';
        req.logistics.updated_at = now;
      }
    } else if (newStatus === 'Crop Picked Up') {
      if (req.logistics) {
        req.logistics.status = 'PICKED UP';
        req.logistics.updated_at = now;
      }
    } else if (newStatus === 'Quality/Weighment') {
      if (req.logistics) {
        req.logistics.status = 'QUALITY_VERIFIED' as any;
        req.logistics.updated_at = now;
      }
    } else if (newStatus === 'Delivered') {
      if (req.logistics) {
        req.logistics.status = 'DELIVERED';
        req.logistics.updated_at = now;
      }
    } else if (newStatus === 'Order Completed') {
      req.status = 'completed';
      if (req.logistics) {
        req.logistics.status = 'DELIVERED';
        req.logistics.updated_at = now;
      }
      req.payment_status = 'Successful';
      if (req.payment) {
        req.payment.status = 'PAYMENT_RELEASED';
        req.payment.amount_paid = req.payment.total_trade_value;
        req.payment.remaining_amount = 0;
        req.payment.updated_at = now;
      }
    }

    req.timeline.push({
      event_type: `ORDER_${newStatus.toUpperCase().replace(/[\s/]+/g, '_')}`,
      title: newStatus,
      description: notes || `Order stage progressed to ${newStatus}.`,
      timestamp: now,
      actor_name: actorName || req.buyer_name,
      actor_role: actorRole,
    });

    this.saveDatabase();
    return req;
  }

  /**
   * Dedicated Order Payment Status Transition Method
   * Supported states: 'Pending' | 'Processing' | 'Successful' | 'Failed'
   */
  public updateOrderPaymentStatus(
    requestId: number | string,
    paymentStatus: BuyerPaymentStatus,
    options: { paymentMethod?: string; notes?: string; actorRole?: string; actorName?: string } = {}
  ): BuyerRequestRecord {
    const req = this.getBuyerRequestById(requestId);
    if (!req) {
      const err: any = new Error(`Order #${requestId} not found.`);
      err.statusCode = 404;
      throw err;
    }

    const validStatuses: BuyerPaymentStatus[] = ['Pending', 'Processing', 'Successful', 'Failed'];
    if (!validStatuses.includes(paymentStatus)) {
      const err: any = new Error(`Invalid payment status: ${paymentStatus}. Must be one of: ${validStatuses.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    const now = new Date().toISOString();
    const agreedPrice = Number(req.counter_price || req.offered_price || 0);
    const totalVal = Number(req.quantity) * agreedPrice;
    const actorName = options.actorName || req.buyer_name || 'Buyer';
    const actorRole = options.actorRole || 'Buyer';

    if (!req.payment) {
      const gatePassNum = req.gate_pass_id || `GP-${Date.now().toString().slice(-4)}`;
      req.payment = {
        status: 'OFFER_ACCEPTED',
        total_trade_value: totalVal,
        amount_paid: 0,
        remaining_amount: totalVal,
        advance_amount: 0,
        escrow_held_amount: 0,
        payment_due_date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        payment_method: options.paymentMethod || 'Digital Escrow Bank Clearance (T+0)',
        escrow_token: `ESC-${Date.now().toString().slice(-6)}`,
        history: [],
        updated_at: now,
      };
    }

    req.payment_status = paymentStatus;
    req.updated_at = now;
    if (options.paymentMethod) {
      req.payment.payment_method = options.paymentMethod;
    }

    let note = options.notes || '';
    if (paymentStatus === 'Pending') {
      req.payment.status = 'OFFER_ACCEPTED';
      req.payment.amount_paid = 0;
      req.payment.remaining_amount = totalVal;
      note = note || `Payment pending for order #${req.id} (₹${totalVal.toLocaleString('en-IN')}).`;
    } else if (paymentStatus === 'Processing') {
      req.payment.status = 'PAYMENT_INITIATED';
      note = note || `Buyer initiated payment clearing order of ₹${totalVal.toLocaleString('en-IN')} via Digital Escrow.`;
    } else if (paymentStatus === 'Successful') {
      req.payment.status = 'ESCROW_HELD';
      req.payment.amount_paid = totalVal;
      req.payment.remaining_amount = 0;
      req.payment.escrow_held_amount = totalVal;
      if (!req.payment.bank_reference_utr) {
        req.payment.bank_reference_utr = `UTR-SBIN${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      }
      note = note || `Payment of ₹${totalVal.toLocaleString('en-IN')} successfully verified and locked in RBI-regulated Digital Escrow vault.`;

      // Auto-advance order status to Payment if currently at Order Placed or Offer Accepted
      const currentOrderStep = getDerivedOrderStatus(req);
      if (currentOrderStep === 'Order Placed' || currentOrderStep === 'Offer Accepted') {
        req.order_status = 'Payment';
      }
    } else if (paymentStatus === 'Failed') {
      (req.payment as any).status = 'FAILED';
      note = note || `Payment attempt failed. Escrow gateway reported authorization timeout or bank server busy.`;
    }

    req.payment.updated_at = now;
    if (!Array.isArray(req.payment.history)) req.payment.history = [];
    req.payment.history.push({
      trade_id: req.id,
      status: paymentStatus,
      amount: totalVal,
      timestamp: now,
      note,
      actor: actorName,
      reference_id: req.payment.bank_reference_utr || req.payment.escrow_token,
    });

    if (!Array.isArray(req.timeline)) req.timeline = [];
    req.timeline.push({
      event_type: `PAYMENT_${paymentStatus.toUpperCase()}`,
      title: `Payment Status: ${paymentStatus}`,
      description: note,
      timestamp: now,
      actor_name: actorName,
      actor_role: actorRole,
    });

    this.saveDatabase();
    return req;
  }

  // --- Notifications Stream & Simulation ---
  public getNotifications(options: { userId?: number; type?: string; channel?: string; unreadOnly?: boolean } = {}): NotificationRecord[] {
    let list = [...this.state.notifications];
    if (options.userId !== undefined) {
      list = list.filter((n) => n.user_id === options.userId);
    }
    if (options.type) {
      list = list.filter((n) => n.type === options.type);
    }
    if (options.channel) {
      list = list.filter((n) => n.channel === options.channel);
    }
    if (options.unreadOnly) {
      list = list.filter((n) => !n.is_read);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createNotification(data: Partial<NotificationRecord> & { user_id: number; title: string; message: string }): NotificationRecord {
    const id = this.state.nextNotificationId++;
    const now = new Date().toISOString();
    const newNotif: NotificationRecord = {
      id,
      user_id: data.user_id,
      title: data.title,
      message: data.message,
      type: data.type || 'system_notice',
      channel: data.channel || 'IN_APP',
      crop_name: data.crop_name,
      mandi_name: data.mandi_name,
      price_change: data.price_change,
      trade_id: data.trade_id,
      gate_pass_id: data.gate_pass_id,
      action_tab: data.action_tab,
      metadata: data.metadata,
      is_read: false,
      created_at: now,
    };
    this.state.notifications.unshift(newNotif);
    this.saveDatabase();
    return newNotif;
  }

  public markNotificationAsRead(id: number, userId?: number): boolean {
    const numericId = Number(id);
    const notif = this.state.notifications.find((n) => n.id === numericId && (userId === undefined || n.user_id === userId));
    if (notif) {
      notif.is_read = true;
      this.saveDatabase();
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(userId?: number): number {
    let count = 0;
    this.state.notifications.forEach((n) => {
      if (userId === undefined || n.user_id === userId) {
        if (!n.is_read) {
          n.is_read = true;
          count++;
        }
      }
    });
    if (count > 0) this.saveDatabase();
    return count;
  }

  public deleteNotification(id: number, userId?: number): boolean {
    const numericId = Number(id);
    const index = this.state.notifications.findIndex((n) => n.id === numericId && (userId === undefined || n.user_id === userId));
    if (index !== -1) {
      this.state.notifications.splice(index, 1);
      this.saveDatabase();
      return true;
    }
    return false;
  }

  public simulateAlert(scenario: 'price_spike' | 'buyer_offer' | 'payment_credit' | 'gate_pass' | 'mandi_dip', userId: number = 1): NotificationRecord {
    const now = new Date().toISOString();
    switch (scenario) {
      case 'price_spike':
        return this.createNotification({
          user_id: userId,
          title: '🔥 Live Mandi Alert: Indore Wheat Jumped +₹90/Qtl',
          message: 'Indore APMC modal rate increased to ₹2,940/Qtl (+₹90 over your baseline). High mill demand reported. Best window to sell: Next 48 hours.',
          type: 'price_alert',
          channel: 'WHATSAPP',
          crop_name: 'Wheat',
          mandi_name: 'Indore APMC Mandi',
          price_change: 90,
          action_tab: 'markets',
        });
      case 'buyer_offer':
        return this.createNotification({
          user_id: userId,
          title: '⚡ New Direct Purchase Offer from ITC Foods',
          message: 'ITC Foods Agri-Procurement submitted an offer of ₹2,920/Qtl for 140 Quintal Sharbati Wheat lot with direct farm-gate loading.',
          type: 'offer_alert',
          channel: 'SMS',
          crop_name: 'Wheat',
          trade_id: 201,
          action_tab: 'buyers',
        });
      case 'payment_credit':
        return this.createNotification({
          user_id: userId,
          title: '💰 Bank Credit Alert: ₹4,08,800 Received',
          message: 'Settlement payout of ₹4,08,800 has been credited to your bank account via Digital Escrow NEFT. Ref: UTR-SBIN' + Math.floor(1000000000 + Math.random() * 9000000000) + '.',
          type: 'payment_alert',
          channel: 'SMS',
          trade_id: 201,
          action_tab: 'buyers',
        });
      case 'gate_pass':
        const gpId = `GP-SEH-${Math.floor(1000 + Math.random() * 9000)}`;
        return this.createNotification({
          user_id: userId,
          title: `🎟️ Electronic Gate Pass Issued: #${gpId}`,
          message: `Digital Mandi / Depot Gate Pass #${gpId} has been verified and generated for Sharbati Wheat lot weighment. Tap to view QR pass.`,
          type: 'gate_pass',
          channel: 'WHATSAPP',
          gate_pass_id: gpId,
          action_tab: 'buyers',
        });
      case 'mandi_dip':
      default:
        return this.createNotification({
          user_id: userId,
          title: '🌾 Soybean Demand Surge Alert: +₹120/Qtl',
          message: 'Crushing demand in Ujjain and Sehore pushed Soybean to ₹4,900/Qtl. 3 institutional buyers actively bidding on your lot.',
          type: 'price_alert',
          channel: 'WHATSAPP',
          crop_name: 'Soybean',
          mandi_name: 'Sehore Mandi',
          price_change: 120,
          action_tab: 'markets',
        });
    }
  }

  // --- Storage Facilities & Bookings ---
  public getStorageFacilities(district?: string): StorageFacilityRecord[] {
    let list = [...this.state.storage_facilities];
    if (district) {
      list = list.filter((f) => f.district.toLowerCase() === district.toLowerCase());
    }
    // Normalize and enrich attributes for frontend compatibility
    return list.map((f) => ({
      ...f,
      capacity: f.capacity ?? f.total_capacity_mt ?? 10000,
      total_capacity_mt: f.total_capacity_mt ?? f.capacity ?? 10000,
      available_capacity: f.available_capacity ?? f.available_capacity_mt ?? 2500,
      available_capacity_mt: f.available_capacity_mt ?? f.available_capacity ?? 2500,
      rate_per_quintal_per_day: f.rate_per_quintal_per_day ?? Math.round((f.estimated_cost_per_qtl_month / 30) * 100) / 100,
      verified: f.verified ?? f.insurance_covered ?? true,
      distanceKm: f.distanceKm ?? f.distance_km,
      totalCapacityMt: f.totalCapacityMt ?? f.total_capacity_mt ?? f.capacity,
      availableCapacityMt: f.availableCapacityMt ?? f.available_capacity_mt ?? f.available_capacity,
      estimatedCostPerQtlMonth: f.estimatedCostPerQtlMonth ?? f.estimated_cost_per_qtl_month,
      storageType: f.storageType ?? f.storage_type,
      insuranceCovered: f.insuranceCovered ?? f.insurance_covered,
      contactPhone: f.contactPhone ?? f.contact_phone,
      isSampleData: f.isSampleData ?? f.is_sample_data,
    }));
  }

  public createStorageBooking(data: {
    facility_id?: number;
    facilityId?: number;
    farmer_id?: number;
    farmerId?: number;
    farmer_name?: string;
    crop?: string;
    crop_name?: string;
    cropName?: string;
    quantity?: number;
    quantity_quintals?: number;
    quantityQuintals?: number;
    duration_days?: number;
    required_duration_days?: number;
    requiredDurationDays?: number;
    location?: string;
  }): StorageBookingRecord {
    const facId = Number(data.facility_id || data.facilityId || 1);
    const facility = this.state.storage_facilities.find((f) => f.id === facId);
    const ratePerMonth = facility?.estimated_cost_per_qtl_month || 12;
    const qty = Number(data.quantity || data.quantity_quintals || data.quantityQuintals || 50);
    const durDays = Number(data.duration_days || data.required_duration_days || data.requiredDurationDays || 30);
    const cropName = data.crop || data.crop_name || data.cropName || 'Wheat';
    const months = Math.max(1, Math.ceil(durDays / 30));
    const estimatedCostTotal = qty * ratePerMonth * months;

    const id = this.state.nextStorageBookingId++;
    const now = new Date().toISOString();

    const newBooking: StorageBookingRecord = {
      id,
      facility_id: facId,
      facilityId: facId,
      facility_name: facility?.name || 'Local Grain Storage Facility',
      facilityName: facility?.name || 'Local Grain Storage Facility',
      farmer_id: data.farmer_id || data.farmerId || 1,
      farmerId: data.farmer_id || data.farmerId || 1,
      farmer_name: data.farmer_name || 'Rajinder Singh',
      farmerName: data.farmer_name || 'Rajinder Singh',
      crop: cropName,
      crop_name: cropName,
      cropName: cropName,
      quantity: qty,
      quantity_quintals: qty,
      quantityQuintals: qty,
      duration_days: durDays,
      required_duration_days: durDays,
      requiredDurationDays: durDays,
      location: data.location || facility?.location || 'Sehore, MP',
      estimated_cost_total: estimatedCostTotal,
      estimatedCostTotal: estimatedCostTotal,
      status: 'Confirmed',
      created_at: now,
      createdAt: now,
    };

    // Deduct available capacity from facility if available
    if (facility && facility.available_capacity_mt) {
      const mtDeducted = Math.ceil(qty / 10);
      facility.available_capacity_mt = Math.max(0, facility.available_capacity_mt - mtDeducted);
      if (facility.available_capacity) {
        facility.available_capacity = facility.available_capacity_mt;
      }
    }

    this.state.storage_bookings.unshift(newBooking);
    this.saveDatabase();
    return newBooking;
  }

  public getStorageBookings(farmerId?: number): StorageBookingRecord[] {
    let list = [...this.state.storage_bookings];
    if (farmerId !== undefined) {
      list = list.filter((b) => b.farmer_id === farmerId || b.farmerId === farmerId);
    }
    return list.map((b) => ({
      ...b,
      facilityId: b.facilityId ?? b.facility_id,
      facilityName: b.facilityName ?? b.facility_name,
      farmerId: b.farmerId ?? b.farmer_id,
      farmerName: b.farmerName ?? b.farmer_name,
      crop: b.crop ?? b.crop_name ?? b.cropName,
      cropName: b.cropName ?? b.crop_name ?? b.crop,
      quantity: b.quantity ?? b.quantity_quintals ?? b.quantityQuintals,
      quantityQuintals: b.quantityQuintals ?? b.quantity_quintals ?? b.quantity,
      duration_days: b.duration_days ?? b.required_duration_days ?? b.requiredDurationDays,
      requiredDurationDays: b.requiredDurationDays ?? b.required_duration_days ?? b.duration_days,
      estimatedCostTotal: b.estimatedCostTotal ?? b.estimated_cost_total,
      createdAt: b.createdAt ?? b.created_at,
    }));
  }

  public updateStorageBooking(
    bookingId: number | string,
    updates: {
      status?: 'Pending' | 'Confirmed' | 'Completed' | 'REQUESTED' | 'CONFIRMED' | 'ACTIVE' | 'RELEASED' | string;
      crop?: string;
      crop_name?: string;
      quantity?: number;
      quantity_quintals?: number;
      duration_days?: number;
      required_duration_days?: number;
      location?: string;
    }
  ): StorageBookingRecord {
    const booking = this.state.storage_bookings.find(
      (b) => b.id === Number(bookingId) || String(b.id) === String(bookingId)
    );
    if (!booking) throw new Error(`Storage Booking #${bookingId} not found.`);

    if (updates.status) booking.status = updates.status;
    if (updates.crop || updates.crop_name) {
      booking.crop = updates.crop || updates.crop_name;
      booking.crop_name = updates.crop || updates.crop_name;
      booking.cropName = updates.crop || updates.crop_name;
    }
    if (updates.quantity !== undefined || updates.quantity_quintals !== undefined) {
      const q = Number(updates.quantity ?? updates.quantity_quintals);
      booking.quantity = q;
      booking.quantity_quintals = q;
      booking.quantityQuintals = q;
    }
    if (updates.duration_days !== undefined || updates.required_duration_days !== undefined) {
      const d = Number(updates.duration_days ?? updates.required_duration_days);
      booking.duration_days = d;
      booking.required_duration_days = d;
      booking.requiredDurationDays = d;
    }
    if (updates.location) booking.location = updates.location;
    booking.updated_at = new Date().toISOString();

    this.saveDatabase();
    return {
      ...booking,
      facilityId: booking.facilityId ?? booking.facility_id,
      facilityName: booking.facilityName ?? booking.facility_name,
      farmerId: booking.farmerId ?? booking.farmer_id,
      farmerName: booking.farmerName ?? booking.farmer_name,
      crop: booking.crop ?? booking.crop_name ?? booking.cropName,
      cropName: booking.cropName ?? booking.crop_name ?? booking.crop,
      quantity: booking.quantity ?? booking.quantity_quintals ?? booking.quantityQuintals,
      quantityQuintals: booking.quantityQuintals ?? booking.quantity_quintals ?? booking.quantity,
      duration_days: booking.duration_days ?? booking.required_duration_days ?? booking.requiredDurationDays,
      requiredDurationDays: booking.requiredDurationDays ?? booking.required_duration_days ?? booking.duration_days,
      estimatedCostTotal: booking.estimatedCostTotal ?? booking.estimated_cost_total,
      createdAt: booking.createdAt ?? booking.created_at,
    };
  }

  // --- Disputes & Grievance Support ---
  public getDisputes(): DisputeRecord[] {
    return [...this.state.disputes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createDispute(data: {
    trade_id: number | string;
    gate_pass_id?: string;
    complainant_id?: number;
    complainant_name?: string;
    complainant_role?: 'farmer' | 'buyer' | 'fpo';
    respondent_name?: string;
    category: 'Payment Issue' | 'Quality Dispute' | 'Quantity Mismatch' | 'Delivery Issue' | 'Buyer Issue' | 'Seller Issue' | 'Other';
    description: string;
    evidence_notes?: string;
  }): DisputeRecord {
    const id = this.state.nextDisputeId++;
    const now = new Date().toISOString();

    const newDispute: DisputeRecord = {
      id,
      trade_id: data.trade_id,
      gate_pass_id: data.gate_pass_id,
      complainant_id: data.complainant_id || 1,
      complainant_name: data.complainant_name || 'Rajinder Singh',
      complainant_role: data.complainant_role || 'farmer',
      respondent_name: data.respondent_name || 'Buyer Partner',
      category: data.category,
      description: data.description,
      evidence_notes: data.evidence_notes,
      status: 'OPEN',
      created_at: now,
      updated_at: now,
    };

    this.state.disputes.unshift(newDispute);
    this.saveDatabase();
    return newDispute;
  }

  public updateDispute(
    disputeId: number | string,
    updates: {
      status: 'OPEN' | 'UNDER REVIEW' | 'RESOLVED';
      resolution_notes?: string;
      resolved_by?: string;
    }
  ): DisputeRecord {
    const dispute = this.state.disputes.find((d) => d.id === Number(disputeId) || String(d.id) === String(disputeId));
    if (!dispute) throw new Error(`Dispute #${disputeId} not found.`);

    const now = new Date().toISOString();
    dispute.status = updates.status;
    if (updates.resolution_notes) dispute.resolution_notes = updates.resolution_notes;
    if (updates.resolved_by) dispute.resolved_by = updates.resolved_by;
    dispute.updated_at = now;

    this.saveDatabase();
    return dispute;
  }

  // --- FPO Aggregated Lots ---
  public getFpoAggregatedLots(): FpoAggregatedLotRecord[] {
    return [...this.state.fpo_aggregated_lots];
  }

  public createFpoAggregatedLot(data: {
    fpo_name: string;
    fpo_district: string;
    fpo_state: string;
    crop_name: string;
    variety: string;
    quality_grade: string;
    target_price_per_quintal: number;
    contributions: Array<{ farmer_id: number; farmer_name: string; quantity: number; listing_id?: number }>;
  }): FpoAggregatedLotRecord {
    const totalQty = data.contributions.reduce((acc, c) => acc + Number(c.quantity), 0);
    const id = `FPO-LOT-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const newLot: FpoAggregatedLotRecord = {
      id,
      fpo_name: data.fpo_name,
      fpo_district: data.fpo_district,
      fpo_state: data.fpo_state,
      crop_name: data.crop_name,
      variety: data.variety,
      quality_grade: data.quality_grade,
      total_aggregated_quantity: totalQty,
      contributing_farmers_count: data.contributions.length,
      target_price_per_quintal: data.target_price_per_quintal,
      contributions: data.contributions,
      status: 'OPEN_FOR_INSTITUTIONAL_BID',
      created_at: now,
    };

    this.state.fpo_aggregated_lots.unshift(newLot);
    this.saveDatabase();
    return newLot;
  }

  // --- Buyers and Requirements ---
  public getBuyers(): any[] {
    return this.state.buyer_profiles.map((b) => {
      const user = this.state.users.find((u) => u.id === b.user_id);
      return {
        id: `buyer-${b.id}`,
        numericId: b.id,
        name: b.business_name,
        type: 'Institutional Food Processor & Miller',
        badgeType: 'Platform Verified (Corporate KYC)',
        district: 'Sehore',
        state: 'Madhya Pradesh',
        distanceKm: 14,
        rating: 4.9,
        cropTarget: 'Wheat',
        varietySpec: 'Sharbati / Lokwan Grade A',
        volumeWantedQuintals: 2500,
        minOrderQuintals: 25,
        priceOfferedPerQuintal: 2940,
        paymentTerms: 'Instant Escrow Bank Clearance (T+0)',
        pickupOption: 'Farm-gate Pickup Provided',
        verified: true,
      };
    });
  }

  public getBuyerRequirements(): BuyerRequirementRecord[] {
    return [...this.state.buyer_requirements];
  }

  public createBuyerRequirement(data: {
    buyer_id?: number;
    buyer_name?: string;
    crop_name: string;
    variety_spec?: string;
    quantity_required: number;
    min_order_quintals?: number;
    expected_price: number;
    required_quality_grade?: string;
    max_moisture_percent?: number;
    max_foreign_matter_percent?: number;
    location?: string;
    district?: string;
    state?: string;
    delivery_option?: string;
  }): BuyerRequirementRecord {
    const id = this.state.buyer_requirements.length + 1;
    const now = new Date().toISOString();

    const newReq: BuyerRequirementRecord = {
      id,
      buyer_id: data.buyer_id || 7,
      buyer_name: data.buyer_name || 'Institutional Food Processor',
      crop_name: data.crop_name,
      variety_spec: data.variety_spec || 'Standard Quality',
      quantity_required: Number(data.quantity_required) || 500,
      min_order_quintals: Number(data.min_order_quintals) || 25,
      expected_price: Number(data.expected_price) || 2920,
      required_quality_grade: data.required_quality_grade || 'Grade A',
      max_moisture_percent: data.max_moisture_percent || 11.0,
      max_foreign_matter_percent: data.max_foreign_matter_percent || 0.8,
      location: data.location || 'Sehore Hub, MP',
      district: data.district || 'Sehore',
      state: data.state || 'Madhya Pradesh',
      delivery_option: data.delivery_option || 'Farm-gate Pickup & Depot Delivery',
      payment_term: 'Instant Escrow Bank Settlement (T+0)',
      badge: 'Platform Verified Corporate Buyer',
      phone_contact: '+91 7562 248900',
      status: 'open',
      created_at: now,
    };

    this.state.buyer_requirements.unshift(newReq);
    this.saveDatabase();
    return newReq;
  }
}

export const dbStore = new DatabaseStore();
export default dbStore;
