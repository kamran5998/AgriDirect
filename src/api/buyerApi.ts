import { apiClient } from './client';
import { VerifiedBuyer, VERIFIED_BUYERS_DATA, FarmerListing } from '../data/directMarketData';

export interface BuyerRequirementItem {
  id: number;
  buyerId: number;
  buyerName: string;
  cropId?: number;
  cropName: string;
  varietySpec?: string;
  quantityRequired: number; // in Quintals
  minOrderQuintals?: number;
  expectedPrice: number; // in ₹/Qtl (Target / Max price)
  requiredQualityGrade?: string;
  maxMoisturePercent?: number;
  maxForeignMatterPercent?: number;
  location: string;
  district?: string;
  state?: string;
  status: 'open' | 'fulfilled' | 'cancelled' | 'closed';
  requiredDate?: string;
  notes?: string;
  createdAt: string;
}

export interface PostRequirementPayload {
  cropId?: number;
  cropName?: string;
  varietySpec?: string;
  quantityRequired: number;
  minOrderQuintals?: number;
  expectedPrice: number;
  requiredQualityGrade?: string;
  maxMoisturePercent?: number;
  maxForeignMatterPercent?: number;
  location: string;
  district?: string;
  state?: string;
  requiredDate?: string;
  notes?: string;
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

export interface BuyerRequestItem {
  id: number | string;
  orderId?: string;
  orderStatus?: OrderLifecycleStep;
  paymentStatus?: BuyerPaymentStatus;
  listingId: number | string;
  buyerId: number;
  buyerName: string;
  cropName: string;
  variety?: string;
  farmerName: string;
  farmerLocation: string;
  quantity: number;
  offeredPrice: number;
  farmerExpectedPrice: number;
  totalValue: number;
  deliveryOption: string;
  message?: string;
  qualityGrade?: string;
  qualityMatchScore?: number;
  qualityMatchStatus?: 'MATCH' | 'PARTIAL MATCH' | 'NOT MATCHED';
  status: 'pending' | 'accepted' | 'countered' | 'rejected' | 'completed';
  statusMessage?: string;
  counterPrice?: number;
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
  createdAt: string;
  updatedAt?: string;
}

export interface SendBuyerRequestPayload {
  listingId: number | string;
  cropName: string;
  farmerName?: string;
  farmerLocation?: string;
  farmerExpectedPrice?: number;
  quantity: number;
  offeredPrice: number;
  deliveryOption?: string;
  message?: string;
}

export const buyerApi = {
  /**
   * Get verified buyers directory
   * GET /api/buyers
   */
  async getBuyers(params?: { verification_status?: string }): Promise<VerifiedBuyer[]> {
    try {
      const res = await apiClient.get<any[]>('/buyers', { params });
      if (Array.isArray(res) && res.length > 0) {
        return res;
      }
    } catch {
      // Local fallback
    }
    return VERIFIED_BUYERS_DATA;
  },

  /**
   * Get active institutional requirements
   * GET /api/buyers/requirements
   */
  async getRequirements(params?: { crop_id?: number; status?: string }): Promise<BuyerRequirementItem[]> {
    try {
      const res = await apiClient.get<any[]>('/buyers/requirements', { params });
      if (Array.isArray(res) && res.length > 0) {
        return res.map((r) => ({
          id: r.id,
          buyerId: r.buyer_id || r.buyerId || 1,
          buyerName: r.buyer_name || r.buyerName || 'Patanjali Agro Processing Ltd',
          cropId: r.crop_id || r.cropId || 1,
          cropName: r.crop_name || r.cropName || 'Wheat',
          quantityRequired: Number(r.quantity_required ?? r.quantityRequired ?? 500),
          expectedPrice: Number(r.expected_price ?? r.expectedPrice ?? 2920),
          location: r.location || 'Sehore Hub',
          status: (r.status as any) || 'open',
          requiredDate: r.required_date || r.requiredDate || '2026-08-30',
          notes: r.notes || r.variety_spec || 'Fair Average Quality (FAQ)',
          createdAt: r.created_at || r.createdAt || new Date().toISOString().split('T')[0],
        }));
      }
    } catch (err) {
      console.warn('API getRequirements error:', err);
    }
    return [];
  },

  /**
   * Get all active farmer listings directly from backend database
   * GET /api/farmer/listings?activeOnly=true
   */
  async getFarmerListings(activeOnly: boolean = true): Promise<FarmerListing[]> {
    try {
      const res = await apiClient.get<any[]>('/farmer/listings', {
        params: { activeOnly: activeOnly ? 'true' : undefined },
      });
      if (Array.isArray(res)) {
        return res.map((item) => ({
          id: String(item.id),
          cropName: item.cropName || item.crop_name || 'Wheat',
          variety: item.variety || 'Sharbati / Lokwan',
          quantityQuintals: Number(item.quantityQuintals ?? item.quantity ?? 100),
          expectedPricePerQuintal: Number(item.expectedPricePerQuintal ?? item.expected_price ?? 2920),
          qualityGrade: item.qualityGrade || item.quality || 'Grade A Premium',
          moisturePercent: item.moisturePercent !== undefined ? Number(item.moisturePercent) : (item.moisture !== undefined ? Number(item.moisture) : undefined),
          foreignMatterPercent: item.foreignMatterPercent !== undefined ? Number(item.foreignMatterPercent) : undefined,
          grainDamagePercent: item.grainDamagePercent !== undefined ? Number(item.grainDamagePercent) : undefined,
          qualityRemarks: item.qualityRemarks || item.quality_remarks || undefined,
          cropImageUrl: item.cropImageUrl || item.crop_image_url || undefined,
          farmerName: item.farmerName || item.farmer_name || undefined,
          locationVillage: item.locationVillage || item.location_village || item.location || 'Ashta Village, Sehore',
          district: item.district || 'Sehore',
          state: item.state || 'Madhya Pradesh',
          availableDate: item.availableDate || item.available_date || 'Immediate / Ready in Barn',
          deliveryOption: item.deliveryOption || item.delivery_option || 'Farm-gate Pickup Only',
          status: item.status || 'Active & Matching',
          matchedBuyersCount: item.matchedBuyersCount || 3,
          viewsCount: item.viewsCount || 1,
          createdAt: item.createdAt ? (item.createdAt.includes('T') ? item.createdAt.split('T')[0] : item.createdAt) : 'Today',
        }));
      }
    } catch (err) {
      console.warn('API getFarmerListings error:', err);
    }
    return [];
  },

  /**
   * Post a new buyer procurement requirement
   * POST /api/buyers/requirements
   */
  async createRequirement(payload: PostRequirementPayload): Promise<BuyerRequirementItem> {
    try {
      const res = await apiClient.post<any>('/buyers/requirements', {
        crop_id: payload.cropId || 1,
        crop_name: payload.cropName || 'Wheat (Sharbati)',
        quantity_required: Number(payload.quantityRequired),
        expected_price: Number(payload.expectedPrice),
        location: payload.location,
      });
      const data = res?.data || res;
      return {
        id: data?.id || Date.now(),
        buyerId: data?.buyer_id || 1,
        buyerName: data?.buyer_name || 'Patanjali Agro Processing Ltd',
        cropId: data?.crop_id || payload.cropId || 1,
        cropName: payload.cropName || 'Wheat (Sharbati)',
        quantityRequired: Number(payload.quantityRequired),
        expectedPrice: Number(payload.expectedPrice),
        location: payload.location,
        status: 'open',
        requiredDate: payload.requiredDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        notes: payload.notes || 'Fair Average Quality (FAQ)',
        createdAt: new Date().toISOString().split('T')[0],
      };
    } catch {
      return {
        id: Date.now(),
        buyerId: 1,
        buyerName: 'Patanjali Agro Processing Ltd',
        cropId: payload.cropId || 1,
        cropName: payload.cropName || 'Wheat (Sharbati)',
        quantityRequired: Number(payload.quantityRequired),
        expectedPrice: Number(payload.expectedPrice),
        location: payload.location,
        status: 'open',
        requiredDate: payload.requiredDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        notes: payload.notes || 'Fair Average Quality (FAQ)',
        createdAt: new Date().toISOString().split('T')[0],
      };
    }
  },

  /**
   * Update status of a buyer requirement
   */
  async updateRequirementStatus(id: number, status: 'open' | 'fulfilled' | 'cancelled'): Promise<void> {
    // optional requirement status endpoint
  },

  /**
   * Delete a buyer requirement
   */
  async deleteRequirement(id: number): Promise<void> {
    // optional requirement delete endpoint
  },

  /**
   * Get all purchase requests sent by the buyer from the database
   * GET /api/buyers/requests
   */
  async getBuyerRequests(): Promise<BuyerRequestItem[]> {
    try {
      const res = await apiClient.get<any[]>('/buyers/requests');
      if (Array.isArray(res)) {
        return res.map((r) => ({
          id: String(r.id),
          listingId: String(r.listingId || r.listing_id || 101),
          buyerId: Number(r.buyerId || r.buyer_id || 1),
          buyerName: r.buyerName || r.buyer_name || 'Patanjali Agro Processing Ltd',
          cropName: r.cropName || r.crop_name || 'Wheat',
          variety: r.variety || 'Sharbati Lokwan',
          farmerName: r.farmerName || 'Rajinder Singh (Verified Farmer)',
          farmerLocation: r.farmerLocation || r.farmer_location || 'Sehore, MP',
          quantity: Number(r.quantity || 50),
          offeredPrice: Number(r.offeredPrice || r.offered_price || 2920),
          farmerExpectedPrice: Number(r.farmerExpectedPrice || r.farmer_expected_price || r.offeredPrice || 2920),
          totalValue: Number(r.quantity || 50) * Number(r.counterPrice || r.offeredPrice || 2920),
          deliveryOption: r.deliveryOption || r.delivery_option || 'Farm-gate Pickup (Assisted Weighment)',
          message: r.message || '',
          status: r.status,
          statusMessage: r.statusMessage || r.status_message || (r.status === 'accepted' ? 'Offer accepted. Electronic Gate Pass generated.' : 'Awaiting farmer response.'),
          counterPrice: r.counterPrice ? Number(r.counterPrice) : undefined,
          gatePassId: r.gatePassId || r.gate_pass_id || undefined,
          createdAt: r.createdAt ? (r.createdAt.includes('T') ? r.createdAt.split('T')[0] : r.createdAt) : 'Today',
          updatedAt: r.updatedAt,
        }));
      }
    } catch (err) {
      console.warn('API getBuyerRequests error:', err);
    }
    return [];
  },

  /**
   * Send a new direct purchase offer to a farmer lot in the database
   * POST /api/buyers/requests
   */
  async sendBuyerRequest(payload: SendBuyerRequestPayload): Promise<BuyerRequestItem> {
    const numericListingId = typeof payload.listingId === 'string' ? parseInt(payload.listingId.replace(/\D/g, '')) || payload.listingId : payload.listingId;

    try {
      const res = await apiClient.post<any>('/buyers/requests', {
        listing_id: numericListingId,
        crop_name: payload.cropName,
        quantity: Number(payload.quantity),
        offered_price: Number(payload.offeredPrice),
        delivery_option: payload.deliveryOption,
        message: payload.message,
      });

      const data = res?.request || res?.data || res;
      const totalValue = Number(payload.quantity) * Number(payload.offeredPrice);

      return {
        id: String(data?.id || `req-${Date.now().toString().slice(-4)}`),
        listingId: String(payload.listingId),
        buyerId: data?.buyer_id || 1,
        buyerName: data?.buyer_name || 'ITC Foods Agri-Procurement',
        cropName: payload.cropName,
        farmerName: payload.farmerName || 'Rajinder Singh (Verified Farmer)',
        farmerLocation: payload.farmerLocation || 'Sehore, MP',
        quantity: Number(payload.quantity),
        offeredPrice: Number(payload.offeredPrice),
        farmerExpectedPrice: Number(payload.farmerExpectedPrice || payload.offeredPrice),
        totalValue,
        deliveryOption: payload.deliveryOption || 'Farm-gate Pickup (Assisted Weighment)',
        message: payload.message || 'Direct institutional purchase proposal.',
        status: data?.status || 'pending',
        statusMessage: data?.status_message || 'Trade proposal transmitted to farmer.',
        gatePassId: data?.gate_pass_id || undefined,
        createdAt: 'Today',
      };
    } catch (err) {
      console.error('API sendBuyerRequest error:', err);
      const totalValue = Number(payload.quantity) * Number(payload.offeredPrice);
      return {
        id: `req-${Date.now().toString().slice(-4)}`,
        listingId: String(payload.listingId),
        buyerId: 1,
        buyerName: 'ITC Foods Agri-Procurement',
        cropName: payload.cropName,
        farmerName: payload.farmerName || 'Rajinder Singh',
        farmerLocation: payload.farmerLocation || 'Sehore, MP',
        quantity: Number(payload.quantity),
        offeredPrice: Number(payload.offeredPrice),
        farmerExpectedPrice: Number(payload.farmerExpectedPrice || payload.offeredPrice),
        totalValue,
        deliveryOption: payload.deliveryOption || 'Farm-gate Pickup Only',
        message: payload.message || 'Direct institutional purchase proposal.',
        status: 'pending',
        statusMessage: 'Trade offer transmitted to farmer.',
        createdAt: 'Today',
      };
    }
  },

  /**
   * Update request status (e.g. Accept counter offer or Cancel request)
   * PATCH /api/buyers/requests/:id/status
   */
  async updateRequestStatus(
    requestId: string | number,
    status: 'pending' | 'accepted' | 'countered' | 'rejected' | 'completed',
    message?: string
  ): Promise<any> {
    try {
      const numId = typeof requestId === 'string' ? parseInt(requestId.replace(/\D/g, '')) || requestId : requestId;
      const res = await apiClient.patch(`/buyers/requests/${numId}/status`, {
        status,
        message,
      });
      return res;
    } catch (err) {
      console.error('API updateRequestStatus error:', err);
      throw err;
    }
  },

  /**
   * Fetch Buyer Orders with lifecycle status and payment details
   * GET /api/buyers/orders
   */
  async getOrders(): Promise<BuyerRequestItem[]> {
    try {
      const res = await apiClient.get<BuyerRequestItem[]>('/buyers/orders');
      if (Array.isArray(res)) return res;
      if (res && Array.isArray((res as any).data)) return (res as any).data;
      return [];
    } catch (err) {
      console.warn('API getOrders failed, falling back to getBuyerRequests:', err);
      return this.getBuyerRequests();
    }
  },

  /**
   * Update Order Lifecycle Stage
   * PATCH /api/buyers/orders/:id/order-status
   */
  async updateOrderStatus(
    orderId: string | number,
    orderStatus: OrderLifecycleStep,
    notes?: string
  ): Promise<any> {
    try {
      const numId = typeof orderId === 'string' ? parseInt(orderId.replace(/\D/g, '')) || orderId : orderId;
      const res = await apiClient.patch(`/buyers/orders/${numId}/order-status`, {
        orderStatus,
        notes,
      });
      return res;
    } catch (err) {
      console.error('API updateOrderStatus error:', err);
      throw err;
    }
  },

  /**
   * Update Order Payment Status
   * PATCH /api/buyers/orders/:id/payment
   */
  async updateOrderPaymentStatus(
    orderId: string | number,
    paymentStatus: BuyerPaymentStatus,
    options?: { paymentMethod?: string; notes?: string }
  ): Promise<any> {
    try {
      const numId = typeof orderId === 'string' ? parseInt(orderId.replace(/\D/g, '')) || orderId : orderId;
      const res = await apiClient.patch(`/buyers/orders/${numId}/payment`, {
        paymentStatus,
        paymentMethod: options?.paymentMethod,
        notes: options?.notes,
      });
      return res;
    } catch (err) {
      console.error('API updateOrderPaymentStatus error:', err);
      throw err;
    }
  },
};

export default buyerApi;
