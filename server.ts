import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  dbStore,
  getDerivedOrderStatus,
  getDerivedPaymentStatus,
  OrderLifecycleStep,
  BuyerPaymentStatus,
  ORDER_LIFECYCLE_STEPS,
} from './src/server/dbStore';
import { analyzeCropImage as runVisionAnalysis } from './src/server/cropVisionEngine';
import { sendOtp, verifyOtp, sanitizePhoneNumber } from './src/server/otpService';

const app = express();
const PORT = 3000;

// Enable JSON & URL-encoded parsing with generous payload limits for crop image base64 uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS & Preflight
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Simple JWT Auth Helper Simulation & Token Parser
function getAuthUser(req: Request): { id: number; platform_id?: string; name: string; role: 'farmer' | 'buyer' | 'admin' } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  if (!token) {
    return null;
  }

  // Parse structured token formats:
  // e.g. "jwt_token_buyer_7_172...", "demo-jwt-farmer-2", "jwt_token_farmer_1_...", "buyer-7", "farmer_2"
  const match = token.match(/(?:jwt_token_|demo-jwt-)?(buyer|farmer|admin)[_-]?(\d+)?/i);
  if (match) {
    const role = match[1].toLowerCase() as 'farmer' | 'buyer' | 'admin';
    const id = match[2] ? Number(match[2]) : role === 'buyer' ? 7 : role === 'admin' ? 11 : 1;
    
    // Check dbStore for registered user
    const dbUser = dbStore.getUserById(id);
    const platform_id = dbUser?.platform_id;
    const name = dbUser?.name || (
      role === 'buyer' ? (id === 7 ? 'Anil Agarwal (Patanjali / ITC)' : `Buyer User #${id}`) :
      role === 'admin' ? 'Dr. Vivek Sharma' :
      (id === 1 ? 'Rajinder Singh' : id === 2 ? 'Balwinder Dhillon' : `Farmer User #${id}`)
    );
    return { id, platform_id, name, role };
  }

  if (token.includes('buyer')) {
    const dbUser = dbStore.getUserById(7);
    return { id: 7, platform_id: dbUser?.platform_id || 'ADP-BYR-20001', name: 'Anil Agarwal (Patanjali / ITC)', role: 'buyer' };
  } else if (token.includes('admin')) {
    const dbUser = dbStore.getUserById(11);
    return { id: 11, platform_id: dbUser?.platform_id || 'ADP-ADM-00001', name: 'Dr. Vivek Sharma', role: 'admin' };
  } else if (token.includes('farmer') || token === 'demo-jwt-token' || token === 'mock-jwt-session-token') {
    const dbUser = dbStore.getUserById(1);
    return { id: 1, platform_id: dbUser?.platform_id || 'ADP-FMR-10001', name: 'Rajinder Singh', role: 'farmer' };
  }

  return null;
}

// ==========================================
// 1. Health & Status Endpoints
// ==========================================
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'AgriDirect Pulse Live Backend API',
    version: '1.2.0',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    database: 'connected (authoritative DB store)',
    features: [
      'Quality Grading & Specification Matching',
      'Buyer Demand Aggregation',
      'Logistics & Estimated Freight Coordination',
      'Digital Escrow & Payment Tracking',
      'Scientific Storage Assistance',
      'Dispute & Grievance Moderation',
      'FPO Collective Aggregation',
      'Multilingual Voice Assistant',
      'AgriDirect Platform Identity System (ADP-FMR / ADP-BYR)',
      'ID + Password Authentication',
    ],
  });
});

// ==========================================
// 2. Authentication APIs
// ==========================================

// POST /api/auth/otp/send - Send Dynamic OTP for Farmers (via SMS Gateway or Dev simulation)
app.post('/api/auth/otp/send', async (req: Request, res: Response) => {
  const phone = req.body.phone || req.body.mobile_number || req.body.mobileNumber || '';
  const result = await sendOtp(phone);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json({
    success: true,
    message: result.message,
    provider: result.provider,
    isDevMode: result.isDevMode,
    expiresInSeconds: result.expiresInSeconds,
    cooldownSeconds: result.cooldownSeconds,
    demoOtp: result.demoOtpHint,
    otpTestHint: result.demoOtpHint,
  });
});

// POST /api/auth/otp/verify - Verify OTP and Authenticate Farmer (with unique Platform ID)
app.post('/api/auth/otp/verify', (req: Request, res: Response) => {
  const phone = req.body.phone || req.body.mobile_number || req.body.mobileNumber || '';
  const otp = req.body.otp || '';

  const verification = verifyOtp(phone, otp);
  if (!verification.success) {
    return res.status(400).json({
      success: false,
      error: verification.message,
      errorCode: verification.error,
    });
  }

  const cleanPhone = sanitizePhoneNumber(phone);

  // Check if existing user exists in dbStore
  let user = dbStore.getUserByPhone(cleanPhone);
  if (!user) {
    // If not found, create farmer record with permanent unique Kisan ID
    user = dbStore.createUser({
      name: cleanPhone === '9876543210' ? 'Rajinder Singh' : `Kisan Member (${cleanPhone.slice(-4)})`,
      phone: cleanPhone,
      role: 'farmer',
      location: 'Sehore, Madhya Pradesh',
    });
  }

  const token = `jwt_token_farmer_${user.id}_${Date.now()}`;
  res.json({
    success: true,
    access_token: token,
    token_type: 'bearer',
    expires_in: 86400,
    user: {
      id: user.id,
      platformId: user.platform_id,
      kisanId: user.platform_id,
      name: user.name,
      phone: user.phone,
      mobileNumber: user.phone,
      email: user.email,
      role: user.role,
      location: user.location,
      state: user.location.includes(',') ? user.location.split(',')[1].trim() : 'Madhya Pradesh',
      district: user.location.includes(',') ? user.location.split(',')[0].trim() : 'Sehore',
    },
    message: 'OTP verified successfully. Welcome to AgriDirect Pulse.',
  });
});

// POST /api/auth/register - Register new Farmer / Buyer with unique AgriDirect Identity
app.post('/api/auth/register', (req: Request, res: Response) => {
  const {
    name,
    fullName,
    phone,
    mobileNumber,
    email,
    password,
    role,
    state,
    district,
    village,
    business_name,
    companyName,
    gstin,
    farmingType,
    farmSize,
  } = req.body;

  const userRole = (role || 'farmer') as 'farmer' | 'buyer' | 'admin';
  const userName = (name || fullName || (userRole === 'farmer' ? 'Kisan Member' : 'Procurement Partner')).trim();
  const rawPhone = phone || mobileNumber || '9876543210';
  const cleanPhone = sanitizePhoneNumber(rawPhone);
  const userLocation = district && state ? `${district}, ${state}` : 'Sehore, Madhya Pradesh';

  if (!userName) {
    return res.status(400).json({ success: false, error: 'Full name or Business Name is required.' });
  }

  if (cleanPhone.length < 10) {
    return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number.' });
  }

  const { confirmPassword } = req.body;
  if (password && password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
  }

  if (confirmPassword && password && password !== confirmPassword) {
    return res.status(400).json({ success: false, error: 'Password and Confirm Password do not match.' });
  }

  // Create new user in authoritative dbStore (automatically generates ADP-FMR-XXXXXX or ADP-BYR-XXXXXX)
  const user = dbStore.createUser({
    name: userName,
    phone: cleanPhone,
    email: email ? email.trim() : `${userRole}-${Date.now()}@agridirect.in`,
    role: userRole,
    location: userLocation,
    password: password || 'Kisan@Demo123',
  });

  const token = `jwt_token_${userRole}_${user.id}_${Date.now()}`;
  res.json({
    success: true,
    access_token: token,
    token_type: 'bearer',
    expires_in: 86400,
    user: {
      id: user.id,
      platformId: user.platform_id,
      kisanId: userRole === 'farmer' ? user.platform_id : undefined,
      buyerId: userRole === 'buyer' ? user.platform_id : undefined,
      name: user.name,
      phone: user.phone,
      mobileNumber: user.phone,
      email: user.email,
      role: user.role,
      location: user.location,
      state: state || 'Madhya Pradesh',
      district: district || 'Sehore',
      village: village || 'Ashta',
      companyName: userRole === 'buyer' ? (business_name || companyName || userName) : undefined,
      gstin: userRole === 'buyer' ? gstin : undefined,
      farmingType,
      farmSize,
    },
    message: `Account created successfully. Your unique ID is ${user.platform_id}.`,
  });
});

// POST /api/auth/login - Universal ID + Password / Phone + Password Authentication with Role Enforcement
app.post('/api/auth/login', (req: Request, res: Response) => {
  const {
    identifier,
    id,
    kisanId,
    buyerId,
    platformId,
    mobileOrEmail,
    email,
    phone,
    phone_or_email,
    password,
    role,
  } = req.body;

  const rawIdentifier = (identifier || kisanId || buyerId || platformId || id || mobileOrEmail || email || phone || phone_or_email || '').toString().trim();
  const passwordAttempt = (password || '').toString();
  const expectedRole = role ? (role.toLowerCase() as 'farmer' | 'buyer' | 'admin') : undefined;

  if (!rawIdentifier) {
    return res.status(400).json({
      success: false,
      error: 'Please provide your AgriDirect ID (e.g. ADP-FMR-10001 / ADP-BYR-20001) or registered mobile number.',
    });
  }

  if (!passwordAttempt) {
    return res.status(400).json({
      success: false,
      error: 'Please enter your password.',
    });
  }

  // Verify credentials in authoritative dbStore
  const authResult = dbStore.verifyUserCredentials(rawIdentifier, passwordAttempt, expectedRole);

  if (!authResult.user) {
    return res.status(401).json({
      success: false,
      error: authResult.error || 'Authentication failed. Please verify your ID and password.',
    });
  }

  const user = authResult.user;
  const token = `jwt_token_${user.role}_${user.id}_${Date.now()}`;

  res.json({
    success: true,
    access_token: token,
    token_type: 'bearer',
    expires_in: 86400,
    user: {
      id: user.id,
      platformId: user.platform_id,
      kisanId: user.role === 'farmer' ? user.platform_id : undefined,
      buyerId: user.role === 'buyer' ? user.platform_id : undefined,
      name: user.name,
      email: user.email,
      phone: user.phone,
      mobileNumber: user.phone,
      role: user.role,
      location: user.location,
      state: user.location.includes(',') ? user.location.split(',')[1].trim() : 'Madhya Pradesh',
      district: user.location.includes(',') ? user.location.split(',')[0].trim() : 'Sehore',
    },
    message: `Welcome back, ${user.name}!`,
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid authentication token.' });
  }

  const dbUser = dbStore.getUserById(authUser.id);
  res.json({
    success: true,
    data: {
      id: authUser.id,
      platformId: dbUser?.platform_id || authUser.platform_id || (authUser.role === 'farmer' ? 'ADP-FMR-10001' : authUser.role === 'buyer' ? 'ADP-BYR-20001' : 'ADP-ADM-00001'),
      name: authUser.name,
      role: authUser.role,
      location: dbUser?.location || 'Sehore, Madhya Pradesh',
      email: dbUser?.email,
      phone: dbUser?.phone,
    },
  });
});

// ==========================================
// 3. Farmer Listings Endpoints (DB Authoritative)
// ==========================================

// GET /api/farmer/listings
app.get('/api/farmer/listings', (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.activeOnly === 'true' || req.query.active === 'true';
    const farmerId = req.query.farmerId ? Number(req.query.farmerId) : undefined;
    const listings = dbStore.getFarmerListings(farmerId, activeOnly);

    // Map to camelCase frontend schema
    const formatted = listings.map((l) => ({
      id: l.id,
      farmerId: l.farmer_id,
      farmerName: l.farmer_name,
      cropName: l.crop_name,
      variety: l.variety,
      quantityQuintals: l.quantity_quintals,
      expectedPricePerQuintal: l.expected_price_per_quintal,
      qualityGrade: l.quality_grade,
      moisturePercent: l.moisture_percent,
      foreignMatterPercent: l.foreign_matter_percent,
      grainDamagePercent: l.grain_damage_percent,
      qualityRemarks: l.quality_remarks,
      cropImageUrl: l.crop_image_url,
      locationVillage: l.location_village,
      district: l.district,
      state: l.state,
      deliveryOption: l.delivery_option,
      availableDate: l.available_date,
      fpoLotId: l.fpo_lot_id,
      status: l.status === 'active' ? 'Active & Matching' : l.status === 'completed' ? 'Deal Closed' : 'In Negotiation',
      rawStatus: l.status,
      viewsCount: l.views_count,
      matchedBuyersCount: l.matched_buyers_count,
      createdAt: l.created_at,
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/farmer/listings
app.post('/api/farmer/listings', (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid authentication token.' });
    }
    const body = req.body;

    const newListing = dbStore.createFarmerListing({
      farmer_id: user.id,
      farmer_name: user.name || 'Rajinder Singh (Verified Farmer)',
      crop_name: body.cropName || body.crop_name || 'Wheat',
      variety: body.variety || 'Sharbati / Lokwan',
      quantity_quintals: Number(body.quantityQuintals || body.quantity || 100),
      expected_price_per_quintal: Number(body.expectedPricePerQuintal || body.expectedPrice || body.expected_price || 2920),
      quality_grade: body.qualityGrade || body.quality_grade || 'Grade A',
      moisture_percent: body.moisturePercent !== undefined ? Number(body.moisturePercent) : undefined,
      foreign_matter_percent: body.foreignMatterPercent !== undefined ? Number(body.foreignMatterPercent) : undefined,
      grain_damage_percent: body.grainDamagePercent !== undefined ? Number(body.grainDamagePercent) : undefined,
      quality_remarks: body.qualityRemarks || body.quality_remarks || 'Clean lot; visual quality proof uploaded.',
      crop_image_url: body.cropImageUrl || body.crop_image_url || body.imageUrl,
      location_village: body.locationVillage || body.village || 'Ashta Village, Sehore',
      district: body.district || 'Sehore',
      state: body.state || 'Madhya Pradesh',
      delivery_option: body.deliveryOption || body.delivery_option || 'Farm-gate Pickup Only',
      available_date: body.availableDate || body.available_date || 'Immediate / Ready in Barn',
      fpo_lot_id: body.fpoLotId || body.fpo_lot_id,
    });

    const formatted = {
      id: newListing.id,
      farmerId: newListing.farmer_id,
      farmerName: newListing.farmer_name,
      cropName: newListing.crop_name,
      variety: newListing.variety,
      quantityQuintals: newListing.quantity_quintals,
      expectedPricePerQuintal: newListing.expected_price_per_quintal,
      qualityGrade: newListing.quality_grade,
      moisturePercent: newListing.moisture_percent,
      foreignMatterPercent: newListing.foreign_matter_percent,
      grainDamagePercent: newListing.grain_damage_percent,
      qualityRemarks: newListing.quality_remarks,
      cropImageUrl: newListing.crop_image_url,
      locationVillage: newListing.location_village,
      district: newListing.district,
      state: newListing.state,
      deliveryOption: newListing.delivery_option,
      availableDate: newListing.available_date,
      fpoLotId: newListing.fpo_lot_id,
      status: 'Active & Matching',
      rawStatus: newListing.status,
      viewsCount: newListing.views_count,
      matchedBuyersCount: newListing.matched_buyers_count,
      createdAt: newListing.created_at,
    };

    res.status(201).json({
      success: true,
      message: 'Listing successfully published to national buyer marketplace.',
      listing: formatted,
      data: formatted,
    });
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

// DELETE /api/farmer/listings/:id
app.delete('/api/farmer/listings/:id', (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid authentication token.' });
    }
    const success = dbStore.deleteFarmerListing(req.params.id, user.role === 'admin' ? undefined : user.id);
    res.json({ success, message: success ? 'Listing removed from marketplace.' : 'Listing not found.' });
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. Farmer Requests / Negotiations Endpoints
// ==========================================

// GET /api/farmer/requests & /api/farmer/orders
app.get(['/api/farmer/requests', '/api/farmer/orders'], (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid authentication token.' });
    }
    const requests = dbStore.getBuyerRequests({ farmerId: user.role === 'admin' ? undefined : user.id });
    const listings = dbStore.getFarmerListings();

    const formatted = requests.map((r) => {
      const relatedListing = r.listing_id ? listings.find((l) => l.id === r.listing_id || String(l.id) === String(r.listing_id)) : undefined;
      const availableListingQuantity = relatedListing ? relatedListing.quantity_quintals : undefined;
      const isOverAvailableQuantity = relatedListing ? r.quantity > relatedListing.quantity_quintals : false;
      const price = Number(r.counter_price || r.offered_price || 0);
      const totalVal = Number(r.quantity || 0) * price;

      return {
        id: r.id,
        orderId: `ADP-ORD-${String(r.id).padStart(5, '0')}`,
        listingId: r.listing_id,
        buyerId: r.buyer_id,
        buyerName: r.buyer_name,
        farmerId: r.farmer_id,
        farmerName: r.farmer_name || user.name || 'Rajinder Singh (Verified Farmer)',
        farmerLocation: r.farmer_location,
        cropName: r.crop_name,
        variety: r.variety,
        quantity: r.quantity,
        offeredPrice: r.offered_price,
        counterPrice: r.counter_price,
        farmerExpectedPrice: r.farmer_expected_price,
        deliveryOption: r.delivery_option,
        message: r.message,
        qualityGrade: r.quality_grade,
        qualityMatchScore: r.quality_match_score,
        qualityMatchStatus: r.quality_match_status,
        status: r.status,
        orderStatus: getDerivedOrderStatus(r),
        paymentStatus: getDerivedPaymentStatus(r),
        totalValue: totalVal,
        statusMessage: r.status_message,
        gatePassId: r.gate_pass_id,
        logistics: r.logistics,
        payment: r.payment,
        timeline: r.timeline,
        availableListingQuantity,
        isOverAvailableQuantity,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    });

    res.json(formatted);
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

// PATCH /api/farmer/requests/:id
app.patch('/api/farmer/requests/:id', (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid authentication token.' });
    }

    // Load request and verify farmer ownership before modifying
    const existingReq = dbStore.getBuyerRequestById(req.params.id);
    if (!existingReq) {
      return res.status(404).json({ success: false, error: `Buyer request with ID ${req.params.id} not found.` });
    }

    if (user.role !== 'admin' && existingReq.farmer_id !== user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden: You do not have permission to modify another farmer\'s request.' });
    }

    const { status, message, counterPrice, counterQuantity, acceptQuantity } = req.body;

    const result = dbStore.updateBuyerRequestStatus(req.params.id, {
      status,
      message,
      counterPrice: counterPrice !== undefined && counterPrice !== null ? Number(counterPrice) : undefined,
      counterQuantity: counterQuantity !== undefined && counterQuantity !== null ? Number(counterQuantity) : undefined,
      acceptQuantity: acceptQuantity !== undefined && acceptQuantity !== null ? Number(acceptQuantity) : undefined,
      actorUserId: user.id,
      actorRole: user.role,
    });

    res.json({
      success: true,
      message: `Request status updated to ${status}.`,
      request: result.request,
      listing: result.listing,
      gatePassId: result.request?.gate_pass_id,
      remainingListingQuantity: result.listing?.quantity_quintals,
      data: result.request,
    });
  } catch (err: any) {
    const statusCode = err.statusCode || (err.message?.includes('exceeds') || err.message?.includes('Invalid requested') ? 400 : 500);
    res.status(statusCode).json({ success: false, error: err.message, details: err.details });
  }
});

// PATCH /api/trades/:id/logistics or /api/farmer/requests/:id/logistics
app.patch(['/api/trades/:id/logistics', '/api/farmer/requests/:id/logistics'], (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid authentication token.' });
    }
    const updated = dbStore.updateTradeLogistics(req.params.id, req.body);
    res.json({ success: true, message: 'Logistics coordination updated.', trade: updated, data: updated });
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

// PATCH /api/trades/:id/payment, /api/trades/:id/payment-status, /api/farmer/requests/:id/payment, etc.
app.patch(
  [
    '/api/trades/:id/payment',
    '/api/trades/:id/payment-status',
    '/api/farmer/requests/:id/payment',
    '/api/farmer/requests/:id/payment-status',
    '/api/requests/:id/payment-status',
    '/api/buyer/requests/:id/payment',
    '/api/buyers/requests/:id/payment',
    '/api/buyers/requests/:id/payment-status',
  ],
  (req: Request, res: Response) => {
    try {
      const user = getAuthUser(req);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid authentication token.' });
      }
      const payload = {
        ...req.body,
        actorName: req.body.actorName || user.name || (user.role === 'farmer' ? 'Farmer (Seller)' : 'Buyer'),
        actorRole: req.body.actorRole || (user.role === 'farmer' ? 'Farmer' : user.role === 'buyer' ? 'Buyer' : 'Escrow Authority'),
      };
      const updated = dbStore.updateTradePayment(req.params.id, payload);
      res.json({
        success: true,
        message: `Payment status transitioned to ${updated.payment?.status}.`,
        trade: updated,
        payment: updated.payment,
        data: updated,
      });
    } catch (err: any) {
      const statusCode = err.statusCode || (err.message?.includes('Invalid payment transition') || err.message?.includes('only permitted for accepted') ? 400 : 500);
      res.status(statusCode).json({ success: false, error: err.message });
    }
  }
);

// ==========================================
// 5. Buyer APIs (Marketplace, Tenders, Requests)
// ==========================================

// GET /api/buyers
app.get('/api/buyers', (req: Request, res: Response) => {
  try {
    const buyers = dbStore.getBuyers();
    res.json(buyers);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/buyers/requirements
app.get('/api/buyers/requirements', (req: Request, res: Response) => {
  try {
    const requirements = dbStore.getBuyerRequirements();
    res.json(requirements);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/buyers/requirements
app.post('/api/buyers/requirements', (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid authentication token.' });
    }
    const body = req.body;
    const newReq = dbStore.createBuyerRequirement({
      buyer_id: user.id,
      buyer_name: user.name || body.buyerName || 'ITC Foods Agri-Procurement',
      crop_name: body.cropName || body.crop_name || 'Wheat',
      variety_spec: body.varietySpec || body.variety_spec || 'Grade A Sharbati',
      quantity_required: Number(body.quantityRequired || body.quantity_required || 500),
      min_order_quintals: Number(body.minOrderQuintals || body.min_order_quintals || 25),
      expected_price: Number(body.expectedPrice || body.expected_price || 2940),
      required_quality_grade: body.requiredQualityGrade || body.required_quality_grade || 'Grade A',
      max_moisture_percent: body.maxMoisturePercent || body.max_moisture_percent || 11.0,
      max_foreign_matter_percent: body.maxForeignMatterPercent || body.max_foreign_matter_percent || 0.8,
      location: body.location || 'Sehore Industrial Hub, MP',
      district: body.district || 'Sehore',
      state: body.state || 'Madhya Pradesh',
      delivery_option: body.deliveryOption || body.delivery_option || 'Farm-gate Pickup Available',
    });

    res.status(201).json({ success: true, message: 'Institutional requirement published.', requirement: newReq, data: newReq });
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

// POST /api/buyers/requests
app.post('/api/buyers/requests', (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid authentication token.' });
    }
    const body = req.body;

    const newRequest = dbStore.createBuyerRequest({
      listing_id: body.listingId || body.listing_id,
      buyer_id: user.id,
      buyer_name: user.name || body.buyerName || 'ITC Foods Agri-Procurement',
      crop_name: body.cropName,
      variety: body.variety,
      quantity: Number(body.quantity || 50),
      offered_price: Number(body.offeredPrice || body.offered_price || 2920),
      delivery_option: body.deliveryOption,
      message: body.message,
      quality_grade: body.qualityGrade || body.quality_grade,
    });

    res.status(201).json({
      success: true,
      message: 'Direct trade proposal transmitted to farmer.',
      request: newRequest,
      data: newRequest,
    });
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

// Helper to format buyer orders with dynamic farmer name, orderId, orderStatus, paymentStatus
function formatBuyerOrderRecord(r: any, listings: any[]) {
  let resolvedFarmerName = 'Verified Farmer';
  if (r.listing_id) {
    const listing = listings.find((l: any) => l.id === r.listing_id || String(l.id) === String(r.listing_id));
    if (listing && listing.farmer_name) {
      resolvedFarmerName = listing.farmer_name;
    }
  }
  if (resolvedFarmerName === 'Verified Farmer' && r.farmer_id) {
    if (r.farmer_id === 1) resolvedFarmerName = 'Rajinder Singh (Verified Farmer)';
    else if (r.farmer_id === 2) resolvedFarmerName = 'Vikram Patel (Verified Farmer)';
    else resolvedFarmerName = `Farmer #${r.farmer_id} (Verified Farmer)`;
  }

  const derivedOrderSt = getDerivedOrderStatus(r);
  const derivedPaymentSt = getDerivedPaymentStatus(r);
  const price = Number(r.counter_price || r.offered_price || 0);
  const totalVal = Number(r.quantity || 0) * price;

  return {
    id: r.id,
    orderId: `ADP-ORD-${String(r.id).padStart(5, '0')}`,
    listingId: r.listing_id,
    buyerId: r.buyer_id,
    buyerName: r.buyer_name,
    farmerId: r.farmer_id,
    farmerName: resolvedFarmerName,
    cropName: r.crop_name,
    variety: r.variety || 'Sharbati Lokwan',
    quantity: r.quantity,
    offeredPrice: r.offered_price,
    counterPrice: r.counter_price,
    farmerExpectedPrice: r.farmer_expected_price,
    farmerLocation: r.farmer_location,
    deliveryOption: r.delivery_option,
    message: r.message,
    qualityGrade: r.quality_grade,
    qualityMatchScore: r.quality_match_score,
    qualityMatchStatus: r.quality_match_status,
    status: r.status,
    orderStatus: derivedOrderSt,
    paymentStatus: derivedPaymentSt,
    totalValue: totalVal,
    statusMessage: r.status_message,
    gatePassId: r.gate_pass_id,
    logistics: r.logistics,
    payment: r.payment,
    timeline: r.timeline,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// GET /api/buyers/orders or /api/buyer/orders
app.get(['/api/buyers/orders', '/api/buyer/orders'], (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid authentication token.' });
    }

    const requests = dbStore.getBuyerRequests({ buyerId: user.role === 'admin' ? undefined : user.id });
    const listings = dbStore.getFarmerListings();
    const formatted = requests.map((r) => formatBuyerOrderRecord(r, listings));
    res.json(formatted);
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

// GET /api/buyers/requests
app.get('/api/buyers/requests', (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid authentication token.' });
    }

    // Filter buyer requests by authenticated user.id (admin sees all)
    const requests = dbStore.getBuyerRequests({ buyerId: user.role === 'admin' ? undefined : user.id });
    const listings = dbStore.getFarmerListings();
    const formatted = requests.map((r) => formatBuyerOrderRecord(r, listings));

    res.json(formatted);
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

// PATCH /api/buyers/orders/:id/order-status or /api/farmer/orders/:id/order-status
app.patch([
  '/api/buyers/orders/:id/order-status',
  '/api/buyers/requests/:id/order-status',
  '/api/farmer/orders/:id/order-status',
  '/api/farmer/requests/:id/order-status',
  '/api/orders/:id/order-status',
  '/api/trades/:id/order-status',
], (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid authentication token.' });
    }

    const existingReq = dbStore.getBuyerRequestById(req.params.id);
    if (!existingReq) {
      return res.status(404).json({ success: false, error: `Order with ID ${req.params.id} not found.` });
    }

    const isFarmer = user.role === 'farmer' || String(existingReq.farmer_id) === String(user.id) || !existingReq.farmer_id;
    const isBuyer = user.role === 'buyer' || String(existingReq.buyer_id) === String(user.id) || !existingReq.buyer_id;
    if (user.role !== 'admin' && !isFarmer && !isBuyer) {
      return res.status(403).json({ success: false, error: 'Forbidden: You do not have permission to modify this order.' });
    }

    const { orderStatus, notes } = req.body;
    if (!orderStatus || !ORDER_LIFECYCLE_STEPS.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid orderStatus: ${orderStatus}. Must be one of: ${ORDER_LIFECYCLE_STEPS.join(', ')}`,
      });
    }

    const actorRole = user.role === 'farmer' ? 'Farmer' : user.role === 'buyer' ? 'Buyer' : 'Admin';
    const updated = dbStore.updateOrderStatus(
      req.params.id,
      orderStatus as OrderLifecycleStep,
      notes,
      actorRole,
      user.name
    );

    const listings = dbStore.getFarmerListings();
    const formatted = formatBuyerOrderRecord(updated, listings);

    res.json({
      success: true,
      message: `Order status progressed to "${orderStatus}".`,
      order: formatted,
      data: formatted,
    });
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

// PATCH /api/buyers/orders/:id/payment or /api/farmer/orders/:id/payment
app.patch([
  '/api/buyers/orders/:id/payment',
  '/api/buyers/requests/:id/payment',
  '/api/farmer/orders/:id/payment',
  '/api/farmer/requests/:id/payment',
  '/api/orders/:id/payment',
  '/api/trades/:id/payment',
], (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid authentication token.' });
    }

    const existingReq = dbStore.getBuyerRequestById(req.params.id);
    if (!existingReq) {
      return res.status(404).json({ success: false, error: `Order with ID ${req.params.id} not found.` });
    }

    const isFarmer = user.role === 'farmer' || String(existingReq.farmer_id) === String(user.id) || !existingReq.farmer_id;
    const isBuyer = user.role === 'buyer' || String(existingReq.buyer_id) === String(user.id) || !existingReq.buyer_id;
    if (user.role !== 'admin' && !isFarmer && !isBuyer) {
      return res.status(403).json({ success: false, error: 'Forbidden: You do not have permission to modify this payment.' });
    }

    const { paymentStatus, paymentMethod, notes } = req.body;
    const validStatuses: BuyerPaymentStatus[] = ['Pending', 'Processing', 'Successful', 'Failed'];
    if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid paymentStatus: ${paymentStatus}. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const actorRole = user.role === 'farmer' ? 'Farmer' : user.role === 'buyer' ? 'Buyer' : 'Admin';
    const updated = dbStore.updateOrderPaymentStatus(req.params.id, paymentStatus as BuyerPaymentStatus, {
      paymentMethod,
      notes,
      actorRole,
      actorName: user.name,
    });

    const listings = dbStore.getFarmerListings();
    const formatted = formatBuyerOrderRecord(updated, listings);

    res.json({
      success: true,
      message: `Order payment status transitioned to "${paymentStatus}".`,
      order: formatted,
      data: formatted,
    });
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

// PATCH /api/buyers/requests/:id/status or PATCH /api/buyers/requests/:id
app.patch(['/api/buyers/requests/:id/status', '/api/buyers/requests/:id'], (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid authentication token.' });
    }

    // FIX 3: Load request and verify buyer ownership before modifying
    const existingReq = dbStore.getBuyerRequestById(req.params.id);
    if (!existingReq) {
      return res.status(404).json({ success: false, error: `Buyer request with ID ${req.params.id} not found.` });
    }

    if (user.role !== 'admin' && existingReq.buyer_id !== user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden: You do not have permission to modify another buyer\'s request.' });
    }

    const { status, message } = req.body;

    const result = dbStore.updateBuyerRequestStatus(req.params.id, {
      status,
      message,
      actorUserId: user.id,
      actorRole: user.role,
    });

    res.json({
      success: true,
      message: `Buyer request updated to ${status}.`,
      request: result.request,
      listing: result.listing,
      data: result.request,
    });
  } catch (err: any) {
    const statusCode = err.statusCode || (err.message?.includes('exceeds') || err.message?.includes('Invalid requested') ? 400 : 500);
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. Scientific Storage Options APIs
// ==========================================
app.get('/api/storage/facilities', (req: Request, res: Response) => {
  try {
    const district = req.query.district ? String(req.query.district) : undefined;
    const facilities = dbStore.getStorageFacilities(district);
    res.json(facilities);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/storage/bookings', (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

const bookings = dbStore.getStorageBookings(user.id);
    res.json(bookings);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/storage/bookings', (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

const body = req.body;

const booking = dbStore.createStorageBooking({
      facility_id: Number(body.facility_id || body.facilityId || 1),
      facilityId: Number(body.facilityId || body.facility_id || 1),
      farmer_id: user.id,
      farmerId: user.id,
      farmer_name: user.name,
      crop: body.crop || body.cropName || body.crop_name || 'Wheat',
      crop_name: body.crop_name || body.cropName || body.crop || 'Wheat',
      cropName: body.cropName || body.crop_name || body.crop || 'Wheat',
      quantity: Number(body.quantity || body.quantityQuintals || body.quantity_quintals || 50),
      quantity_quintals: Number(body.quantity_quintals || body.quantityQuintals || body.quantity || 50),
      quantityQuintals: Number(body.quantityQuintals || body.quantity_quintals || body.quantity || 50),
      duration_days: Number(body.duration_days || body.requiredDurationDays || body.required_duration_days || 30),
      required_duration_days: Number(body.required_duration_days || body.requiredDurationDays || body.duration_days || 30),
      requiredDurationDays: Number(body.requiredDurationDays || body.required_duration_days || body.duration_days || 30),
      location: body.location,
    });
    res.status(201).json({ success: true, message: 'Storage slot reservation confirmed.', booking, data: booking });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/storage/bookings/:id', (req: Request, res: Response) => {
  try {
    const { status, crop, crop_name, quantity, quantity_quintals, duration_days, required_duration_days, location } = req.body;
    const updated = dbStore.updateStorageBooking(req.params.id, {
      status,
      crop: crop || crop_name,
      crop_name: crop_name || crop,
      quantity: quantity !== undefined ? Number(quantity) : (quantity_quintals !== undefined ? Number(quantity_quintals) : undefined),
      quantity_quintals: quantity_quintals !== undefined ? Number(quantity_quintals) : (quantity !== undefined ? Number(quantity) : undefined),
      duration_days: duration_days !== undefined ? Number(duration_days) : (required_duration_days !== undefined ? Number(required_duration_days) : undefined),
      required_duration_days: required_duration_days !== undefined ? Number(required_duration_days) : (duration_days !== undefined ? Number(duration_days) : undefined),
      location,
    });
    res.json({ success: true, message: 'Storage booking updated successfully.', booking: updated, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. Dispute & Grievance Resolution APIs
// ==========================================
app.get('/api/disputes', (req: Request, res: Response) => {
  try {
    const disputes = dbStore.getDisputes();
    res.json(disputes);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/disputes', (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

const body = req.body;
    const newDispute = dbStore.createDispute({
      trade_id: body.tradeId || body.trade_id || 201,
      gate_pass_id: body.gatePassId || body.gate_pass_id,
      complainant_id: user.id,
      complainant_name: user.name,
      complainant_role: user.role as any,
      respondent_name: body.respondentName || body.respondent_name || 'Procurement Partner',
      category: body.category || 'Quality Dispute',
      description: body.description || 'Dispute regarding moisture tolerance and weighment scale.',
      evidence_notes: body.evidenceNotes || body.evidence_notes,
    });
    res.status(201).json({ success: true, message: 'Grievance ticket created under dispute protocol.', dispute: newDispute, data: newDispute });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/disputes/:id', (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

const { status, resolution_notes, resolutionNotes } = req.body;
    const updated = dbStore.updateDispute(req.params.id, {
      status,
      resolution_notes: resolution_notes || resolutionNotes,
      resolved_by: user.name,
    });
    res.json({ success: true, message: 'Dispute status updated.', dispute: updated, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/disputes/:id/resolve', (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

const { status, resolution_notes, resolutionNotes } = req.body;
    const updated = dbStore.updateDispute(req.params.id, {
      status: status || 'RESOLVED',
      resolution_notes: resolution_notes || resolutionNotes,
      resolved_by: user.name,
    });
    res.json({ success: true, message: 'Dispute resolved successfully.', dispute: updated, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 8. FPO Collective Aggregation APIs
// ==========================================
app.get('/api/fpo/aggregated-lots', (req: Request, res: Response) => {
  try {
    const lots = dbStore.getFpoAggregatedLots();
    res.json(lots);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/fpo/aggregate', (req: Request, res: Response) => {
  try {
    const body = req.body;
    const lot = dbStore.createFpoAggregatedLot({
      fpo_name: body.fpoName || 'Sehore Kisan Samriddhi FPO',
      fpo_district: body.fpoDistrict || 'Sehore',
      fpo_state: body.fpoState || 'Madhya Pradesh',
      crop_name: body.cropName || 'Wheat',
      variety: body.variety || 'Sharbati Lokwan Grade A',
      quality_grade: body.qualityGrade || 'Grade A',
      target_price_per_quintal: Number(body.targetPricePerQuintal || 2930),
      contributions: body.contributions || [],
    });
    res.status(201).json({ success: true, message: 'Aggregated FPO collective lot registered.', lot, data: lot });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 9. Market Rates & Mandi Intelligence
// ==========================================
app.get('/api/markets/mandis', (req: Request, res: Response) => {
  res.json([
    { id: 1, name: 'Sehore APMC Yard', state: 'Madhya Pradesh', district: 'Sehore', distanceKm: 8, modalPrice: 2920 },
    { id: 2, name: 'Indore Chhoithram Grain Mandi', state: 'Madhya Pradesh', district: 'Indore', distanceKm: 65, modalPrice: 2960 },
    { id: 3, name: 'Bhopal Karond Mandi', state: 'Madhya Pradesh', district: 'Bhopal', distanceKm: 38, modalPrice: 2890 },
  ]);
});

// ==========================================
// 10. Notifications & Alert Simulation APIs
// ==========================================
app.get('/api/notifications', (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    const userId = req.query.userId ? Number(req.query.userId) : (user ? user.id : 1);
    const type = req.query.type ? String(req.query.type) : undefined;
    const channel = req.query.channel ? String(req.query.channel) : undefined;
    const unreadOnly = req.query.unreadOnly === 'true';

    const notifs = dbStore.getNotifications({ userId, type, channel, unreadOnly });
    res.json(notifs);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/notifications', (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    const body = req.body;
    const created = dbStore.createNotification({
      user_id: body.user_id || body.userId || (user ? user.id : 1),
      title: body.title || 'AgriDirect Alert',
      message: body.message || '',
      type: body.type || 'system_notice',
      channel: body.channel || 'IN_APP',
      crop_name: body.crop_name || body.cropName,
      mandi_name: body.mandi_name || body.mandiName,
      price_change: body.price_change !== undefined ? Number(body.price_change) : undefined,
      trade_id: body.trade_id || body.tradeId,
      gate_pass_id: body.gate_pass_id || body.gatePassId,
      action_tab: body.action_tab || body.actionTab,
      metadata: body.metadata,
    });
    res.status(201).json({ success: true, message: 'Notification created.', notification: created, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    const ok = dbStore.markNotificationAsRead(Number(req.params.id), user ? user.id : undefined);
    res.json({ success: ok, message: ok ? 'Notification marked as read.' : 'Notification not found.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/notifications/read-all', (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    const count = dbStore.markAllNotificationsAsRead(user ? user.id : undefined);
    res.json({ success: true, message: `${count} notifications marked as read.`, updatedCount: count });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/notifications/:id', (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    const ok = dbStore.deleteNotification(Number(req.params.id), user ? user.id : undefined);
    res.json({ success: ok, message: ok ? 'Notification deleted.' : 'Notification not found.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/notifications/simulate', (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    const scenario = (req.body.scenario || 'price_spike') as 'price_spike' | 'buyer_offer' | 'payment_credit' | 'gate_pass' | 'mandi_dip';
    const userId = req.body.userId ? Number(req.body.userId) : (user ? user.id : 1);
    const notif = dbStore.simulateAlert(scenario, userId);
    res.status(201).json({ success: true, message: `Simulated ${scenario} alert generated.`, notification: notif, data: notif });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 11. AI Vision & Crop Analysis API
// ==========================================
app.post('/api/crop-ai/analyze-image', async (req: Request, res: Response) => {
  try {
    const image = req.body.image || req.body.imageDataUrl;
    const { fileName, visualFeatures } = req.body;
    if (!image || typeof image !== 'string' || image.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: 'No valid crop image data provided. Please upload a clear photo in JPG, PNG, or WEBP format.',
      });
    }

    const result = await runVisionAnalysis(image, fileName, visualFeatures);
    return res.json(result);
  } catch (err: any) {
    console.error('Error analyzing crop image in vision engine:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Unable to analyze this image. Please try another clear crop image.',
    });
  }
});

// ==========================================
// 11. Vite Integration (Dev Mode & Prod Fallback)
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AgriDirect Pulse] Live server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
