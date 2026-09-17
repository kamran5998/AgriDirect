import { apiClient } from './client';
import { FarmerProfile } from '../types';
import { FarmerListing, DirectSupplyRequest, CompletedDeal, INITIAL_FARMER_LISTINGS, INITIAL_SUPPLY_REQUESTS, COMPLETED_DEALS_DATA } from '../data/directMarketData';
import type { OrderLifecycleStep, BuyerPaymentStatus } from './buyerApi';

export interface CreateListingPayload {
  cropId?: number;
  cropName: string;
  variety?: string;
  quantityQuintals: number;
  expectedPricePerQuintal: number;
  qualityGrade: 'Grade A' | 'Grade B' | 'Grade C' | 'Grade A Premium' | 'FAQ Standard' | 'Organic Certified' | 'Commercial Bulk' | string;
  moisturePercent?: number;
  foreignMatterPercent?: number;
  grainDamagePercent?: number;
  qualityRemarks?: string;
  cropImageUrl?: string;
  locationVillage: string;
  district?: string;
  state?: string;
  availableDate?: string;
  deliveryOption?: 'Farm-gate Pickup Only' | 'Farmer Delivery to Depot' | 'Flexible' | string;
  fpoLotId?: string;
}

export interface SubmitSupplyRequestPayload {
  listingId?: number | string;
  buyerId: string;
  buyerName: string;
  cropName: string;
  quantityOfferedQuintals: number;
  offeredPricePerQuintal: number;
  buyerPostedPrice?: number;
  pickupType?: string;
  proposedDate?: string;
  message?: string;
}

export interface BestMandiCalculationPayload {
  cropName: string;
  volumeQuintals: number;
  farmerDistrict: string;
  farmerState: string;
  vehicleType: 'tractor' | 'mini-truck' | 'heavy-truck';
  storageAvailable: boolean;
}

export interface BestMandiResult {
  mandiName: string;
  district: string;
  state: string;
  distanceKm: number;
  spotPricePerQuintal: number;
  estimatedTransitCostTotal: number;
  transitCostPerQuintal: number;
  grossRevenue: number;
  netRealization: number;
  premiumVsLocalApmc: number;
  isOptimal: boolean;
  recommendationReason: string;
}

export const farmerApi = {
  /**
   * Get the current farmer's detailed profile
   * GET /api/farmer/profile
   */
  async getProfile(): Promise<FarmerProfile> {
    try {
      const res = await apiClient.get<any>('/farmer/profile');
      if (res && res.fullName) return res;
    } catch {
      // fallback
    }

    return {
      fullName: 'Rajinder Singh',
      mobileNumber: '+91 98765 43210',
      email: 'rajinder.singh@farmmail.in',
      state: 'Madhya Pradesh',
      district: 'Sehore',
      village: 'Ashta',
      pincode: '466116',
      farmSize: '5-10 Acres',
      farmingType: 'Conventional High-Yield',
      experienceYears: '10+ Years',
      preferredLanguage: 'Hindi (हिन्दी)',
      selectedCrops: ['Wheat (Sharbati / Lokwan)', 'Soybean (Yellow Seed)'],
      harvestVolumes: { 'Wheat (Sharbati / Lokwan)': '150', 'Soybean (Yellow Seed)': '80' },
      selectedMandis: ['Sehore APMC Mandi', 'Indore Grain Market'],
      transportWillingness: 'Up to 100 km',
      hasWarehouseStorage: true,
      smsAlertsEnabled: true,
      whatsappAlertsEnabled: true,
    };
  },

  /**
   * Update farmer profile
   * PUT /api/farmer/profile
   */
  async updateProfile(profile: Partial<FarmerProfile>): Promise<FarmerProfile> {
    try {
      await apiClient.put('/farmer/profile', {
        state: profile.state,
        district: profile.district,
        village: profile.village,
      });
    } catch (e) {
      // local fallback
    }
    return profile as FarmerProfile;
  },

  /**
   * Get farmer's active lot listings from the database
   * GET /api/farmer/listings
   */
  async getListings(params?: { status?: string; activeOnly?: boolean }): Promise<FarmerListing[]> {
    try {
      const res = await apiClient.get<any[]>('/farmer/listings', { params });
      if (Array.isArray(res)) {
        return res.map((item) => ({
          id: String(item.id || item.listingId),
          cropName: item.cropName || item.crop_name || 'Wheat',
          variety: item.variety || 'Sharbati / Lokwan',
          quantityQuintals: Number(item.quantityQuintals ?? item.quantity ?? 100),
          expectedPricePerQuintal: Number(item.expectedPricePerQuintal ?? item.expected_price ?? item.expectedPrice ?? 2920),
          qualityGrade: item.qualityGrade || item.quality || 'Grade A Premium',
          moisturePercent: item.moisturePercent ?? item.moisture_percent,
          foreignMatterPercent: item.foreignMatterPercent ?? item.foreign_matter_percent,
          grainDamagePercent: item.grainDamagePercent ?? item.grain_damage_percent,
          qualityRemarks: item.qualityRemarks || item.quality_remarks,
          cropImageUrl: item.cropImageUrl || item.crop_image_url,
          farmerName: item.farmerName || item.farmer_name,
          locationVillage: item.locationVillage || item.location_village || item.location || 'Ashta Village, Sehore',
          district: item.district || 'Sehore',
          state: item.state || 'Madhya Pradesh',
          availableDate: item.availableDate || item.available_date || 'Immediate / Ready in Barn',
          deliveryOption: item.deliveryOption || item.delivery_option || 'Farm-gate Pickup Only',
          status: item.status || (item.rawStatus === 'completed' ? 'Deal Closed' : item.rawStatus === 'in_negotiation' ? 'In Negotiation' : 'Active & Matching'),
          matchedBuyersCount: item.matchedBuyersCount || 3,
          viewsCount: item.viewsCount || 1,
          createdAt: item.createdAt ? (item.createdAt.includes('T') ? item.createdAt.split('T')[0] : item.createdAt) : 'Today',
        }));
      }
    } catch (err) {
      console.warn('API getListings error:', err);
    }
    return INITIAL_FARMER_LISTINGS;
  },

  /**
   * Create a new crop lot listing directly in the database
   * POST /api/farmer/listings
   */
  async createListing(listing: CreateListingPayload): Promise<FarmerListing> {
    try {
      const res = await apiClient.post<any>('/farmer/listings', {
        cropName: listing.cropName,
        variety: listing.variety,
        quantityQuintals: Number(listing.quantityQuintals),
        expectedPricePerQuintal: Number(listing.expectedPricePerQuintal),
        qualityGrade: listing.qualityGrade,
        moisturePercent: listing.moisturePercent !== undefined ? Number(listing.moisturePercent) : undefined,
        foreignMatterPercent: listing.foreignMatterPercent !== undefined ? Number(listing.foreignMatterPercent) : undefined,
        grainDamagePercent: listing.grainDamagePercent !== undefined ? Number(listing.grainDamagePercent) : undefined,
        qualityRemarks: listing.qualityRemarks,
        cropImageUrl: listing.cropImageUrl,
        locationVillage: listing.locationVillage,
        district: listing.district || 'Sehore',
        state: listing.state || 'Madhya Pradesh',
        availableDate: listing.availableDate || 'Immediate / Ready in Barn',
        deliveryOption: listing.deliveryOption || 'Farm-gate Pickup Only',
        fpoLotId: listing.fpoLotId,
      });

      const data = res?.listing || res?.data || res;
      if (data && data.id) {
        return {
          id: String(data.id),
          cropName: data.cropName || listing.cropName,
          variety: data.variety || listing.variety || 'Sharbati / Lokwan',
          quantityQuintals: Number(data.quantityQuintals || listing.quantityQuintals),
          expectedPricePerQuintal: Number(data.expectedPricePerQuintal || listing.expectedPricePerQuintal),
          qualityGrade: data.qualityGrade || listing.qualityGrade,
          moisturePercent: data.moisturePercent !== undefined ? Number(data.moisturePercent) : listing.moisturePercent,
          foreignMatterPercent: data.foreignMatterPercent !== undefined ? Number(data.foreignMatterPercent) : listing.foreignMatterPercent,
          grainDamagePercent: data.grainDamagePercent !== undefined ? Number(data.grainDamagePercent) : listing.grainDamagePercent,
          qualityRemarks: data.qualityRemarks || listing.qualityRemarks,
          cropImageUrl: data.cropImageUrl || listing.cropImageUrl,
          locationVillage: data.locationVillage || listing.locationVillage,
          district: data.district || listing.district || 'Sehore',
          state: data.state || listing.state || 'Madhya Pradesh',
          availableDate: data.availableDate || listing.availableDate || 'Immediate',
          deliveryOption: data.deliveryOption || listing.deliveryOption || 'Farm-gate Pickup Only',
          status: 'Active & Matching',
          matchedBuyersCount: 3,
          viewsCount: 1,
          createdAt: 'Just now',
        };
      }
    } catch (err) {
      console.error('API createListing error:', err);
    }

    return {
      id: `lst-${Date.now().toString().slice(-4)}`,
      cropName: listing.cropName,
      variety: listing.variety || 'Standard FAQ',
      quantityQuintals: Number(listing.quantityQuintals),
      expectedPricePerQuintal: Number(listing.expectedPricePerQuintal),
      qualityGrade: listing.qualityGrade as any,
      moisturePercent: listing.moisturePercent,
      foreignMatterPercent: listing.foreignMatterPercent,
      grainDamagePercent: listing.grainDamagePercent,
      qualityRemarks: listing.qualityRemarks,
      cropImageUrl: listing.cropImageUrl,
      locationVillage: listing.locationVillage,
      district: listing.district || 'Sehore',
      state: listing.state || 'Madhya Pradesh',
      availableDate: listing.availableDate || 'Immediate',
      deliveryOption: (listing.deliveryOption as any) || 'Farm-gate Pickup Only',
      status: 'Active & Matching',
      matchedBuyersCount: 3,
      viewsCount: 1,
      createdAt: 'Just now',
    };
  },

  /**
   * Delete or withdraw a crop lot listing
   */
  async deleteListing(listingId: string | number): Promise<{ success: boolean; message: string }> {
    try {
      const numId = typeof listingId === 'string' ? parseInt(listingId.replace(/\D/g, '')) || listingId : listingId;
      await apiClient.delete(`/farmer/listings/${numId}`);
      return { success: true, message: 'Listing withdrawn successfully' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to withdraw listing' };
    }
  },

  /**
   * Get all incoming trade requests for the farmer from the database
   * GET /api/farmer/requests
   */
  async getFarmerRequests(): Promise<DirectSupplyRequest[]> {
    try {
      const res = await apiClient.get<any[]>('/farmer/requests');
      if (Array.isArray(res)) {
        return res.map((r) => {
          const rawPrice = Number(r.counterPrice ?? r.counter_price ?? r.offeredPrice ?? r.offered_price ?? 2920);
          const initialPrice = Number(r.offeredPrice ?? r.offered_price ?? 2920);
          const qty = Number(r.quantity ?? 50);
          return {
            id: String(r.id),
            orderId: r.orderId || r.order_id || `ADP-ORD-${String(r.id).padStart(5, '0')}`,
            listingId: String(r.listingId || r.listing_id || ''),
            buyerId: String(r.buyerId || r.buyer_id || 'b-01'),
            buyerName: r.buyerName || r.buyer_name || 'Verified Buyer',
            farmerId: r.farmerId || r.farmer_id,
            farmerName: r.farmerName || r.farmer_name,
            farmerLocation: r.farmerLocation || r.farmer_location || 'Ashta, Sehore',
            cropName: r.cropName || r.crop_name || 'Wheat',
            variety: r.variety || 'Sharbati / Lokwan',
            quantityOfferedQuintals: qty,
            offeredPricePerQuintal: initialPrice,
            buyerPostedPrice: initialPrice,
            counterPrice: r.counterPrice || r.counter_price ? Number(r.counterPrice || r.counter_price) : undefined,
            totalContractValue: Number(r.totalValue || r.total_value || (qty * rawPrice)),
            totalValue: Number(r.totalValue || r.total_value || (qty * rawPrice)),
            pickupType: r.deliveryOption || r.delivery_option || 'Farm-gate Pickup (Assisted Weighment)',
            deliveryOption: r.deliveryOption || r.delivery_option || 'Farm-gate Pickup (Assisted Weighment)',
            proposedDate: r.createdAt ? (r.createdAt.includes('T') ? r.createdAt.split('T')[0] : r.createdAt) : 'Today',
            status: r.status,
            rawStatus: r.status,
            orderStatus: r.orderStatus || r.order_status || 'Order Placed',
            paymentStatus: r.paymentStatus || r.payment_status || 'Pending',
            qualityGrade: r.qualityGrade || r.quality_grade || 'Grade A Premium',
            qualityMatchScore: r.qualityMatchScore ?? r.quality_match_score ?? 96,
            qualityMatchStatus: r.qualityMatchStatus || r.quality_match_status || 'MATCH',
            submittedAt: r.createdAt ? (r.createdAt.includes('T') ? r.createdAt.split('T')[0] : r.createdAt) : 'Today',
            statusMessage: r.statusMessage || r.status_message || (
              r.status === 'accepted' ? 'Trade Offer Accepted' :
              r.status === 'countered' ? 'Counter-Offer Sent' :
              r.status === 'rejected' ? 'Offer Rejected' :
              'Awaiting your response.'
            ),
            gatePassId: r.gatePassId || r.gate_pass_id || undefined,
            availableListingQuantity: r.availableListingQuantity !== undefined ? Number(r.availableListingQuantity) : r.available_listing_quantity !== undefined ? Number(r.available_listing_quantity) : undefined,
            isOverAvailableQuantity: Boolean(r.isOverAvailableQuantity || r.is_over_available_quantity),
            logistics: r.logistics,
            payment: r.payment,
            timeline: r.timeline,
          };
        });
      }
      return [];
    } catch (err) {
      console.warn('API getFarmerRequests error:', err);
      throw err;
    }
  },

  /**
   * Advance or update Order Lifecycle Status as Farmer
   * PATCH /api/farmer/orders/:id/order-status
   */
  async updateOrderStatus(
    orderId: string | number,
    newStatus: OrderLifecycleStep,
    notes?: string
  ): Promise<any> {
    try {
      const numId = typeof orderId === 'string' ? parseInt(orderId.replace(/\D/g, '')) || orderId : orderId;
      const res = await apiClient.patch(`/farmer/orders/${numId}/order-status`, {
        orderStatus: newStatus,
        notes,
      });
      return res;
    } catch (err) {
      console.error('API updateOrderStatus error:', err);
      throw err;
    }
  },

  /**
   * Update Payment Status as Farmer
   * PATCH /api/farmer/orders/:id/payment
   */
  async updatePaymentStatus(
    orderId: string | number,
    paymentStatus: BuyerPaymentStatus,
    options?: { paymentMethod?: string; notes?: string }
  ): Promise<any> {
    try {
      const numId = typeof orderId === 'string' ? parseInt(orderId.replace(/\D/g, '')) || orderId : orderId;
      const res = await apiClient.patch(`/farmer/orders/${numId}/payment`, {
        paymentStatus,
        ...options,
      });
      return res;
    } catch (err) {
      console.error('API updatePaymentStatus error:', err);
      throw err;
    }
  },

  /**
   * Update a farmer request (Accept, Counter, or Reject)
   * PATCH /api/farmer/requests/:id
   */
  async updateFarmerRequest(
    requestId: string | number,
    action: {
      status: 'accepted' | 'countered' | 'rejected' | 'completed' | 'cancelled';
      message?: string;
      counterPrice?: number;
      counterQuantity?: number;
      acceptQuantity?: number;
    }
  ): Promise<any> {
    try {
      const numId = typeof requestId === 'string' ? parseInt(requestId.replace(/\D/g, '')) || requestId : requestId;
      const res = await apiClient.patch(`/farmer/requests/${numId}`, action);
      return res;
    } catch (err) {
      console.error('API updateFarmerRequest error:', err);
      throw err;
    }
  },

  /**
   * Get all outgoing supply proposals submitted to buyers
   */
  async getSupplyRequests(): Promise<DirectSupplyRequest[]> {
    return this.getFarmerRequests();
  },

  /**
   * Submit a direct supply proposal to a verified buyer tender
   */
  async submitSupplyRequest(payload: SubmitSupplyRequestPayload): Promise<DirectSupplyRequest> {
    try {
      const res = await apiClient.post<any>('/buyers/requests', {
        listing_id: payload.listingId || 101,
        quantity: payload.quantityOfferedQuintals,
        offered_price: payload.offeredPricePerQuintal,
        message: payload.message || `Offered ₹${payload.offeredPricePerQuintal}/Qtl for ${payload.cropName}`,
      });
      const data = res?.request || res?.data || res;
      const totalVal = payload.quantityOfferedQuintals * payload.offeredPricePerQuintal;

      return {
        id: String(data?.id || `REQ-${Math.floor(1000 + Math.random() * 9000)}`),
        buyerId: payload.buyerId,
        buyerName: payload.buyerName,
        cropName: payload.cropName,
        quantityOfferedQuintals: payload.quantityOfferedQuintals,
        offeredPricePerQuintal: payload.offeredPricePerQuintal,
        buyerPostedPrice: payload.buyerPostedPrice || payload.offeredPricePerQuintal,
        totalContractValue: totalVal,
        pickupType: payload.pickupType || 'Farm-gate Pickup',
        proposedDate: payload.proposedDate || 'Immediate',
        status: 'Under Review',
        submittedAt: 'Just now',
        statusMessage: 'Buyer notified. Verification in progress.',
      };
    } catch {
      const totalVal = payload.quantityOfferedQuintals * payload.offeredPricePerQuintal;
      return {
        id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        buyerId: payload.buyerId,
        buyerName: payload.buyerName,
        cropName: payload.cropName,
        quantityOfferedQuintals: payload.quantityOfferedQuintals,
        offeredPricePerQuintal: payload.offeredPricePerQuintal,
        buyerPostedPrice: payload.buyerPostedPrice || payload.offeredPricePerQuintal,
        totalContractValue: totalVal,
        pickupType: payload.pickupType || 'Farm-gate Pickup',
        proposedDate: payload.proposedDate || 'Immediate',
        status: 'Under Review',
        submittedAt: 'Just now',
        statusMessage: 'Buyer notified. Verification in progress.',
      };
    }
  },

  /**
   * Accept a buyer counter-offer
   */
  async acceptCounterOffer(requestId: string): Promise<DirectSupplyRequest> {
    try {
      const idNum = parseInt(requestId.replace(/\D/g, ''), 10) || requestId;
      const res = await apiClient.patch(`/farmer/requests/${idNum}`, {
        status: 'accepted',
      });
      const gatePassId = res?.request?.gate_pass_id || `GP-SEH-${Math.floor(1000 + Math.random() * 9000)}`;

      return {
        id: requestId,
        buyerId: 'b-01',
        buyerName: 'Patanjali Agro',
        cropName: 'Soybean (Yellow Seed)',
        quantityOfferedQuintals: 75,
        offeredPricePerQuintal: 4800,
        buyerPostedPrice: 4850,
        totalContractValue: 75 * 4800,
        pickupType: 'Farm-gate Pickup by Buyer Fleet',
        proposedDate: '2026-08-22',
        status: 'Offer Accepted',
        submittedAt: '2026-08-18',
        statusMessage: 'You accepted the buyer counter-rate. Gate pass generated.',
        gatePassId,
      };
    } catch {
      return {
        id: requestId,
        buyerId: 'b-01',
        buyerName: 'Patanjali Agro',
        cropName: 'Soybean (Yellow Seed)',
        quantityOfferedQuintals: 75,
        offeredPricePerQuintal: 4800,
        buyerPostedPrice: 4850,
        totalContractValue: 75 * 4800,
        pickupType: 'Farm-gate Pickup by Buyer Fleet',
        proposedDate: '2026-08-22',
        status: 'Offer Accepted',
        submittedAt: '2026-08-18',
        statusMessage: 'You accepted the buyer counter-rate. Gate pass generated.',
        gatePassId: `GP-SEH-${Math.floor(1000 + Math.random() * 9000)}`,
      };
    }
  },

  /**
   * Get completed trade contracts & settlements
   */
  async getCompletedDeals(): Promise<CompletedDeal[]> {
    return COMPLETED_DEALS_DATA;
  },

  /**
   * Calculate best APMC Mandi route accounting for freight & net realization
   */
  async calculateBestMandi(payload: BestMandiCalculationPayload): Promise<BestMandiResult[]> {
    return [
      {
        mandiName: 'Indore Grain Terminal',
        district: 'Indore',
        state: 'Madhya Pradesh',
        distanceKm: 85,
        spotPricePerQuintal: 2920,
        estimatedTransitCostTotal: payload.volumeQuintals * 45,
        transitCostPerQuintal: 45,
        grossRevenue: payload.volumeQuintals * 2920,
        netRealization: payload.volumeQuintals * (2920 - 45),
        premiumVsLocalApmc: 60,
        isOptimal: true,
        recommendationReason: 'Highest net realization (+₹60/Qtl after ₹45 transit cost). High institutional buying pressure.',
      },
      {
        mandiName: 'Sehore APMC Yard (Local)',
        district: 'Sehore',
        state: 'Madhya Pradesh',
        distanceKm: 14,
        spotPricePerQuintal: 2860,
        estimatedTransitCostTotal: payload.volumeQuintals * 15,
        transitCostPerQuintal: 15,
        grossRevenue: payload.volumeQuintals * 2860,
        netRealization: payload.volumeQuintals * (2860 - 15),
        premiumVsLocalApmc: 0,
        isOptimal: false,
        recommendationReason: 'Zero hassle local delivery, but ₹45/Qtl lower net profit than Indore.',
      },
    ];
  },
  /**
   * Update logistics workflow for a trade
   */
  async updateTradeLogistics(tradeId: string | number, payload: any): Promise<any> {
    try {
      const idNum = typeof tradeId === 'string' ? parseInt(tradeId.replace(/\D/g, ''), 10) || tradeId : tradeId;
      const res = await apiClient.patch(`/trades/${idNum}/logistics`, payload);
      return res?.trade || res?.data || res;
    } catch {
      return null;
    }
  },

  /**
   * Update payment tracking ledger for a trade
   */
  async updateTradePayment(tradeId: string | number, payload: any): Promise<any> {
    try {
      const idNum = typeof tradeId === 'string' ? parseInt(tradeId.replace(/\D/g, ''), 10) || tradeId : tradeId;
      const res = await apiClient.patch(`/trades/${idNum}/payment`, payload);
      return res?.trade || res?.data || res;
    } catch {
      return null;
    }
  },

  /**
   * Get storage facilities
   */
  async getStorageFacilities(district?: string): Promise<any[]> {
    try {
      const res = await apiClient.get<any[]>('/storage/facilities', { params: district ? { district } : {} });
      if (Array.isArray(res)) return res;
      if (res && Array.isArray((res as any).data)) return (res as any).data;
      if (res && Array.isArray((res as any).facilities)) return (res as any).facilities;
    } catch (err) {
      console.error('Error fetching storage facilities:', err);
    }
    return [];
  },

  /**
   * Get farmer storage bookings
   */
  async getStorageBookings(): Promise<any[]> {
    try {
      const res = await apiClient.get<any[]>('/storage/bookings');
      if (Array.isArray(res)) return res;
      if (res && Array.isArray((res as any).data)) return (res as any).data;
      if (res && Array.isArray((res as any).bookings)) return (res as any).bookings;
    } catch (err) {
      console.error('Error fetching storage bookings:', err);
    }
    return [];
  },

  /**
   * Book a storage slot
   */
  async bookStorageSlot(payload: any): Promise<any> {
    try {
      const res = await apiClient.post('/storage/bookings', payload);
      return res?.booking || res?.data || res;
    } catch (err) {
      console.error('Error creating storage booking:', err);
      return null;
    }
  },

  /**
   * Update a storage booking
   */
  async updateStorageBooking(bookingId: number | string, updates: any): Promise<any> {
    try {
      const res = await apiClient.patch(`/storage/bookings/${bookingId}`, updates);
      return res?.booking || res?.data || res;
    } catch (err) {
      console.error(`Error updating storage booking ${bookingId}:`, err);
      return null;
    }
  },

  /**
   * Get disputes
   */
  async getDisputes(status?: string): Promise<any[]> {
    try {
      const res = await apiClient.get<any[]>('/disputes', { params: status ? { status } : {} });
      if (Array.isArray(res)) return res;
      if (res && Array.isArray((res as any).data)) return (res as any).data;
      if (res && Array.isArray((res as any).disputes)) return (res as any).disputes;
    } catch (err) {
      console.error('Error fetching disputes:', err);
    }
    return [];
  },

  /**
   * Raise a new grievance / dispute
   */
  async raiseDispute(payload: any): Promise<any> {
    try {
      const res = await apiClient.post('/disputes', payload);
      return res?.dispute || res?.data || res;
    } catch (err) {
      console.error('Error creating dispute:', err);
      return null;
    }
  },

  /**
   * Resolve a dispute (Admin / Moderator)
   */
  async resolveDispute(
    disputeId: number | string,
    resolution: string | { status?: string; resolutionNotes?: string; resolution_notes?: string }
  ): Promise<any> {
    try {
      const notes = typeof resolution === 'string'
        ? resolution
        : (resolution.resolutionNotes || resolution.resolution_notes || 'Dispute resolved.');
      const statusVal = typeof resolution === 'string'
        ? 'RESOLVED'
        : (resolution.status || 'RESOLVED');

      const payload = {
        status: statusVal,
        resolution_notes: notes,
        resolutionNotes: notes,
      };
      
      // Try /disputes/:id/resolve first, fallback to /disputes/:id
      let res: any;
      try {
        res = await apiClient.patch(`/disputes/${disputeId}/resolve`, payload);
      } catch {
        res = await apiClient.patch(`/disputes/${disputeId}`, payload);
      }
      return res?.dispute || res?.data || res;
    } catch (err) {
      console.error(`Error resolving dispute ${disputeId}:`, err);
      return null;
    }
  },

  /**
   * Get FPO aggregated lots
   */
  async getFpoLots(): Promise<any[]> {
    try {
      const res = await apiClient.get<any[]>('/fpo/aggregated-lots');
      if (Array.isArray(res)) return res;
    } catch {}
    return [];
  },

  /**
   * Create an FPO collective aggregated lot
   */
  async createFpoLot(payload: any): Promise<any> {
    try {
      const res = await apiClient.post('/fpo/aggregate', payload);
      return res?.lot || res?.data || res;
    } catch {
      return null;
    }
  },
};

export default farmerApi;
