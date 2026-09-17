-- ============================================================================
-- AgriDirect Pulse: Realistic Development & Demo Seed Data
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. Seed: users
-- Standard hashed password used for demo accounts: '$2b$12$e8K7bE7d0H... (Password: Demo@1234)'
-- ----------------------------------------------------------------------------
TRUNCATE TABLE `users`;
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `location`, `created_at`) VALUES
-- Farmers
(1, 'Rajinder Singh', 'rajinder.singh@farmmail.in', '+919876543210', '$2b$12$k8b7yR1gM9e8K8T0Y1U6PeO7e2J9L1K3U5Y7T9P1W3Q5E7R9T1Y3U', 'farmer', 'Sehore, Madhya Pradesh', '2026-01-10 08:30:00'),
(2, 'Balwinder Dhillon', 'balwinder.punjab@farmmail.in', '+919814022334', '$2b$12$k8b7yR1gM9e8K8T0Y1U6PeO7e2J9L1K3U5Y7T9P1W3Q5E7R9T1Y3U', 'farmer', 'Khanna, Ludhiana, Punjab', '2026-01-12 09:15:00'),
(3, 'Dattatray Patil', 'dattatray.patil@farmmail.in', '+919422033445', '$2b$12$k8b7yR1gM9e8K8T0Y1U6PeO7e2J9L1K3U5Y7T9P1W3Q5E7R9T1Y3U', 'farmer', 'Akola, Maharashtra', '2026-01-15 10:00:00'),
(4, 'Bhanwar Lal Meena', 'bhanwar.meena@farmmail.in', '+919414299014', '$2b$12$k8b7yR1gM9e8K8T0Y1U6PeO7e2J9L1K3U5Y7T9P1W3Q5E7R9T1Y3U', 'farmer', 'Niwai, Tonk, Rajasthan', '2026-02-01 11:20:00'),
(5, 'Rameshwar Yadav', 'rameshwar.yadav@farmmail.in', '+919793144021', '$2b$12$k8b7yR1gM9e8K8T0Y1U6PeO7e2J9L1K3U5Y7T9P1W3Q5E7R9T1Y3U', 'farmer', 'Sambhal, Uttar Pradesh', '2026-02-05 14:00:00'),
(6, 'Ramesh Patel', 'ramesh.patel@farmmail.in', '+919825012345', '$2b$12$k8b7yR1gM9e8K8T0Y1U6PeO7e2J9L1K3U5Y7T9P1W3Q5E7R9T1Y3U', 'farmer', 'Gondal, Rajkot, Gujarat', '2026-02-10 16:45:00'),

-- Buyers
(7, 'Anil Agarwal', 'procurement@patanjaliagro.com', '+919823456789', '$2b$12$k8b7yR1gM9e8K8T0Y1U6PeO7e2J9L1K3U5Y7T9P1W3Q5E7R9T1Y3U', 'buyer', 'Indore Hub, Madhya Pradesh', '2026-01-05 07:00:00'),
(8, 'Vikram Oberoi', 'v.oberoi@itcagri.in', '+919810011223', '$2b$12$k8b7yR1gM9e8K8T0Y1U6PeO7e2J9L1K3U5Y7T9P1W3Q5E7R9T1Y3U', 'buyer', 'Karnal Depot, Haryana', '2026-01-08 11:00:00'),
(9, 'Mahesh Agarwal', 'm.agarwal@sunriseexim.com', '+919820011920', '$2b$12$k8b7yR1gM9e8K8T0Y1U6PeO7e2J9L1K3U5Y7T9P1W3Q5E7R9T1Y3U', 'buyer', 'Navi Mumbai, Maharashtra', '2026-01-18 13:30:00'),
(10, 'Sunil Kulkarni', 'sunil@godrejagrovet.com', '+919845011990', '$2b$12$k8b7yR1gM9e8K8T0Y1U6PeO7e2J9L1K3U5Y7T9P1W3Q5E7R9T1Y3U', 'buyer', 'Pune Processing Plant, Maharashtra', '2026-02-02 15:10:00'),

-- Admins
(11, 'Dr. Vivek Sharma', 'admin.ops@agridirect.gov.in', '+919811122233', '$2b$12$k8b7yR1gM9e8K8T0Y1U6PeO7e2J9L1K3U5Y7T9P1W3Q5E7R9T1Y3U', 'admin', 'National Operations, New Delhi', '2025-12-01 00:00:00'),
(12, 'Priya Nair', 'p.nair@agridirect.gov.in', '+919811144455', '$2b$12$k8b7yR1gM9e8K8T0Y1U6PeO7e2J9L1K3U5Y7T9P1W3Q5E7R9T1Y3U', 'admin', 'Operations Desk, Bhopal', '2025-12-15 00:00:00');

-- ----------------------------------------------------------------------------
-- 2. Seed: farmer_profiles
-- ----------------------------------------------------------------------------
TRUNCATE TABLE `farmer_profiles`;
INSERT INTO `farmer_profiles` (`id`, `user_id`, `state`, `district`, `village`, `preferred_markets`, `created_at`) VALUES
(1, 1, 'Madhya Pradesh', 'Sehore', 'Ashta', '[1, 2, 3]', '2026-01-10 08:35:00'),
(2, 2, 'Punjab', 'Ludhiana', 'Samrala', '[4, 5]', '2026-01-12 09:20:00'),
(3, 3, 'Maharashtra', 'Akola', 'Murtizapur', '[6, 7]', '2026-01-15 10:10:00'),
(4, 4, 'Rajasthan', 'Tonk', 'Niwai', '[8, 9]', '2026-02-01 11:25:00'),
(5, 5, 'Uttar Pradesh', 'Sambhal', 'Chandausi', '[10, 11]', '2026-02-05 14:10:00'),
(6, 6, 'Gujarat', 'Rajkot', 'Gondal', '[12]', '2026-02-10 16:50:00');

-- ----------------------------------------------------------------------------
-- 3. Seed: buyer_profiles
-- ----------------------------------------------------------------------------
TRUNCATE TABLE `buyer_profiles`;
INSERT INTO `buyer_profiles` (`id`, `user_id`, `business_name`, `location`, `verification_status`, `created_at`) VALUES
(1, 7, 'Patanjali Agro Processing Ltd', 'Sehore Industrial Hub, MP', 'verified', '2026-01-05 07:10:00'),
(2, 8, 'ITC e-Choupal Agri Business Div', 'Karnal Logistics Depot, Haryana', 'verified', '2026-01-08 11:15:00'),
(3, 9, 'Sunrise Agro Commodities Exim', 'Navi Mumbai Exim Gateway, MH', 'verified', '2026-01-18 13:40:00'),
(4, 10, 'Godrej Agrovet Animal Nutrition', 'Pune Bulk Milling Unit, MH', 'verified', '2026-02-02 15:20:00');

-- ----------------------------------------------------------------------------
-- 4. Seed: crops
-- ----------------------------------------------------------------------------
TRUNCATE TABLE `crops`;
INSERT INTO `crops` (`id`, `name`, `category`, `description`, `created_at`) VALUES
(1, 'Wheat (Sharbati / Lokwan)', 'Grains', 'High-protein golden luster milling wheat, premium rotimaking benchmark', '2026-01-01 00:00:00'),
(2, 'Soybean (Yellow Seed)', 'Oilseeds', 'Non-GMO commercial high-oil content seed (Min 18% oil, 38% protein)', '2026-01-01 00:00:00'),
(3, 'Paddy Basmati (1121 Pusa)', 'Grains', 'Extra-long slender aromatic export paddy grain with min 8.35mm length', '2026-01-01 00:00:00'),
(4, 'Chana / Desi Chickpea', 'Pulses', 'High-fiber drought-hardy garbanzo brown pulse for dal & flour mills', '2026-01-01 00:00:00'),
(5, 'Cotton (Medium Staple Shankar-6)', 'Cash Crops', 'Gin-ready 28-29mm fiber length white lint bolls, low trash percentage', '2026-01-01 00:00:00'),
(6, 'Mustard / Rapeseed', 'Oilseeds', 'High pungency 40%+ oil content black/yellow oilseed benchmark', '2026-01-01 00:00:00'),
(7, 'Maize / Yellow Corn', 'Grains', 'Starch & poultry feed grade yellow grain with low aflatoxin specs', '2026-01-01 00:00:00'),
(8, 'Tur / Arhar (Red Gram)', 'Pulses', 'Primary protein pulse commodity, FAQ Grade A standard', '2026-01-01 00:00:00');

-- ----------------------------------------------------------------------------
-- 5. Seed: farmer_crops
-- ----------------------------------------------------------------------------
TRUNCATE TABLE `farmer_crops`;
INSERT INTO `farmer_crops` (`id`, `farmer_id`, `crop_id`, `quantity`, `unit`, `harvest_date`, `created_at`) VALUES
(1, 1, 1, 280.00, 'Quintal', '2026-03-25', '2026-01-10 09:00:00'),
(2, 1, 2, 120.00, 'Quintal', '2026-10-15', '2026-01-10 09:00:00'),
(3, 2, 1, 450.00, 'Quintal', '2026-04-05', '2026-01-12 10:00:00'),
(4, 2, 3, 300.00, 'Quintal', '2026-11-10', '2026-01-12 10:00:00'),
(5, 3, 2, 220.00, 'Quintal', '2026-10-20', '2026-01-15 10:30:00'),
(6, 3, 5, 140.00, 'Quintal', '2026-12-05', '2026-01-15 10:30:00'),
(7, 4, 6, 180.00, 'Quintal', '2026-03-10', '2026-02-01 12:00:00'),
(8, 4, 4, 150.00, 'Quintal', '2026-03-20', '2026-02-01 12:00:00'),
(9, 5, 1, 310.00, 'Quintal', '2026-04-01', '2026-02-05 14:30:00'),
(10, 6, 6, 260.00, 'Quintal', '2026-03-15', '2026-02-10 17:00:00');

-- ----------------------------------------------------------------------------
-- 6. Seed: markets (APMC Mandis)
-- ----------------------------------------------------------------------------
TRUNCATE TABLE `markets`;
INSERT INTO `markets` (`id`, `name`, `state`, `district`, `location`, `status`, `created_at`) VALUES
(1, 'Sehore APMC Yard', 'Madhya Pradesh', 'Sehore', 'Station Road, Sehore 466001', 'active', '2026-01-01 00:00:00'),
(2, 'Indore Grain Market (Chhoithram)', 'Madhya Pradesh', 'Indore', 'Ring Road, Indore 452014', 'active', '2026-01-01 00:00:00'),
(3, 'Bhopal Karond Mandi', 'Madhya Pradesh', 'Bhopal', 'Karond Square, Berasia Road, Bhopal', 'active', '2026-01-01 00:00:00'),
(4, 'Khanna Grain Market (Asia Largest)', 'Punjab', 'Ludhiana', 'GT Road, Khanna 141401', 'active', '2026-01-01 00:00:00'),
(5, 'Sirhind Mandi', 'Punjab', 'Fatehgarh Sahib', 'Sirhind City Center', 'active', '2026-01-01 00:00:00'),
(6, 'Akola APMC Cotton & Oilseed Yard', 'Maharashtra', 'Akola', 'Nehru Park Road, Akola 444001', 'active', '2026-01-01 00:00:00'),
(7, 'Latur Pulse & Oilseed Terminal', 'Maharashtra', 'Latur', 'Market Yard, Latur 413512', 'active', '2026-01-01 00:00:00'),
(8, 'Kota Mandi (Bhamashah Mandi)', 'Rajasthan', 'Kota', 'Anantpura, Kota 324005', 'active', '2026-01-01 00:00:00'),
(9, 'Jaipur Surajpole Mandi', 'Rajasthan', 'Jaipur', 'Transport Nagar, Jaipur', 'active', '2026-01-01 00:00:00'),
(10, 'Chandausi APMC Yard', 'Uttar Pradesh', 'Sambhal', 'Badaun Road, Chandausi 244412', 'active', '2026-01-01 00:00:00'),
(11, 'Bareilly Krishi Utpadan Mandi', 'Uttar Pradesh', 'Bareilly', 'Delapeer, Bareilly', 'active', '2026-01-01 00:00:00'),
(12, 'Gondal Marketing Yard', 'Gujarat', 'Rajkot', 'National Highway 8B, Gondal', 'active', '2026-01-01 00:00:00');

-- ----------------------------------------------------------------------------
-- 7. Seed: market_prices
-- ----------------------------------------------------------------------------
TRUNCATE TABLE `market_prices`;
INSERT INTO `market_prices` (`id`, `market_id`, `crop_id`, `price`, `min_price`, `max_price`, `demand_level`, `recorded_at`) VALUES
-- Wheat Prices
(1, 1, 1, 2860.00, 2680.00, 2940.00, 'Surge', '2026-08-19 09:00:00'),
(2, 2, 1, 2920.00, 2740.00, 3010.00, 'Surge', '2026-08-19 09:15:00'),
(3, 3, 1, 2810.00, 2650.00, 2890.00, 'High', '2026-08-19 09:30:00'),
(4, 4, 1, 2540.00, 2420.00, 2620.00, 'Moderate', '2026-08-19 09:00:00'),
(5, 10, 1, 2610.00, 2490.00, 2680.00, 'Moderate', '2026-08-19 09:45:00'),

-- Soybean Prices
(6, 1, 2, 4780.00, 4520.00, 4920.00, 'High', '2026-08-19 09:00:00'),
(7, 2, 2, 4840.00, 4600.00, 4990.00, 'Surge', '2026-08-19 09:15:00'),
(8, 6, 2, 4890.00, 4650.00, 5020.00, 'Surge', '2026-08-19 09:20:00'),
(9, 7, 2, 4820.00, 4590.00, 4950.00, 'High', '2026-08-19 09:30:00'),

-- Basmati Paddy Prices
(10, 4, 3, 3850.00, 3600.00, 4100.00, 'Surge', '2026-08-19 09:00:00'),
(11, 5, 3, 3810.00, 3550.00, 4050.00, 'High', '2026-08-19 09:10:00'),
(12, 10, 3, 3740.00, 3490.00, 3920.00, 'High', '2026-08-19 09:45:00'),

-- Chana / Chickpea Prices
(13, 1, 4, 6120.00, 5850.00, 6300.00, 'Surge', '2026-08-19 09:00:00'),
(14, 7, 4, 6180.00, 5900.00, 6350.00, 'Surge', '2026-08-19 09:30:00'),
(15, 8, 4, 6080.00, 5800.00, 6240.00, 'High', '2026-08-19 09:15:00'),

-- Mustard Prices
(16, 8, 6, 5680.00, 5420.00, 5850.00, 'High', '2026-08-19 09:15:00'),
(17, 9, 6, 5720.00, 5480.00, 5900.00, 'High', '2026-08-19 09:25:00'),
(18, 12, 6, 5640.00, 5390.00, 5810.00, 'Moderate', '2026-08-19 09:40:00');

-- ----------------------------------------------------------------------------
-- 8. Seed: buyers_requirements (Procurement Tenders)
-- ----------------------------------------------------------------------------
TRUNCATE TABLE `buyers_requirements`;
INSERT INTO `buyers_requirements` (`id`, `buyer_id`, `crop_id`, `quantity_required`, `expected_price`, `location`, `status`, `created_at`) VALUES
(1, 1, 1, 1200.00, 2940.00, 'Sehore Industrial Hub, MP', 'open', '2026-08-15 10:00:00'),
(2, 1, 2, 800.00, 4850.00, 'Sehore Industrial Hub, MP', 'open', '2026-08-16 11:30:00'),
(3, 2, 1, 2500.00, 2910.00, 'Karnal Logistics Depot, Haryana', 'open', '2026-08-12 09:00:00'),
(4, 2, 3, 1800.00, 3950.00, 'Khanna Processing Depot, Punjab', 'open', '2026-08-14 14:00:00'),
(5, 3, 3, 3000.00, 4020.00, 'JNPT Port Container Hub, Navi Mumbai', 'open', '2026-08-10 16:20:00'),
(6, 4, 2, 1500.00, 4900.00, 'Pune Solvents Plant, MH', 'open', '2026-08-17 08:45:00');

-- ----------------------------------------------------------------------------
-- 9. Seed: farmer_listings
-- ----------------------------------------------------------------------------
TRUNCATE TABLE `farmer_listings`;
INSERT INTO `farmer_listings` (`id`, `farmer_id`, `crop_id`, `quantity`, `expected_price`, `quality`, `location`, `availability_date`, `status`, `created_at`) VALUES
(1, 1, 1, 140.00, 2920.00, 'Grade A Premium', 'Ashta Village, Sehore, MP', '2026-08-20', 'active', '2026-08-18 10:00:00'),
(2, 1, 2, 75.00, 4820.00, 'FAQ Standard', 'Ashta Village, Sehore, MP', '2026-08-22', 'active', '2026-08-18 10:30:00'),
(3, 2, 3, 200.00, 3920.00, 'Grade A Premium', 'Samrala, Ludhiana, Punjab', '2026-08-25', 'active', '2026-08-17 14:00:00'),
(4, 3, 2, 110.00, 4860.00, 'Grade A Premium', 'Murtizapur, Akola, MH', '2026-08-21', 'in_negotiation', '2026-08-16 09:15:00'),
(5, 4, 6, 90.00, 5700.00, 'Grade A Premium', 'Niwai, Tonk, Rajasthan', '2026-08-24', 'active', '2026-08-19 08:00:00');

-- ----------------------------------------------------------------------------
-- 10. Seed: buyer_requests
-- ----------------------------------------------------------------------------
TRUNCATE TABLE `buyer_requests`;
INSERT INTO `buyer_requests` (`id`, `listing_id`, `buyer_id`, `quantity`, `message`, `status`, `created_at`) VALUES
(1, 1, 1, 140.00, 'Offer accepted at ₹2,920/Qtl. Farm-gate pickup scheduled via Patanjali Fleet.', 'accepted', '2026-08-18 14:20:00'),
(2, 2, 1, 75.00, 'We offer ₹4,800/Qtl with instant digital escrow release on moisture assay <=10%.', 'counter_offer', '2026-08-18 16:00:00'),
(3, 3, 3, 200.00, 'Export quality inspection team can inspect lot on 25th Aug at Samrala.', 'pending', '2026-08-18 18:45:00'),
(4, 4, 4, 110.00, 'Procurement contract generated for ₹4,850/Qtl delivery to Pune depot.', 'pending', '2026-08-17 11:30:00');

-- ----------------------------------------------------------------------------
-- 11. Seed: notifications
-- ----------------------------------------------------------------------------
TRUNCATE TABLE `notifications`;
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`) VALUES
(1, 1, 'Direct Buyer Offer Accepted!', 'Patanjali Agro Processing accepted your 140 Quintal Sharbati Wheat lot @ ₹2,920/Qtl.', 'offer_accepted', 0, '2026-08-18 14:25:00'),
(2, 1, 'Price Spike Alert: Wheat +2.8%', 'Indore APMC modal price jumped to ₹2,920/Qtl (+₹80 above your local benchmark).', 'price_alert', 0, '2026-08-19 09:16:00'),
(3, 1, 'Counter-Offer Received', 'Patanjali Agro sent counter-proposal for Soybean lot @ ₹4,800/Qtl.', 'buyer_request', 1, '2026-08-18 16:05:00'),
(4, 7, 'New Lot Available Nearby', 'Farmer Rajinder Singh posted 140 Qtl Grade A Wheat within 14 km of your Sehore depot.', 'buyer_request', 1, '2026-08-18 10:05:00'),
(5, 11, 'Daily System Reconciled', '₹4.82 Crore in escrow contracts cleared with zero anomaly across 28 states.', 'system_notice', 0, '2026-08-19 06:00:00');

-- ----------------------------------------------------------------------------
-- 12. Seed: price_predictions
-- ----------------------------------------------------------------------------
TRUNCATE TABLE `price_predictions`;
INSERT INTO `price_predictions` (`id`, `crop_id`, `market_id`, `predicted_price`, `prediction_date`, `created_at`) VALUES
-- Wheat Forecasts for Sehore APMC
(1, 1, 1, 2895.00, '2026-08-22', '2026-08-19 06:00:00'),
(2, 1, 1, 2940.00, '2026-08-26', '2026-08-19 06:00:00'),
(3, 1, 1, 2980.00, '2026-08-30', '2026-08-19 06:00:00'),
(4, 1, 1, 3020.00, '2026-09-04', '2026-08-19 06:00:00'),
(5, 1, 1, 3060.00, '2026-09-10', '2026-08-19 06:00:00'),
(6, 1, 1, 3110.00, '2026-09-18', '2026-08-19 06:00:00'),

-- Soybean Forecasts for Indore APMC
(7, 2, 2, 4890.00, '2026-08-22', '2026-08-19 06:00:00'),
(8, 2, 2, 4960.00, '2026-08-26', '2026-08-19 06:00:00'),
(9, 2, 2, 5040.00, '2026-08-30', '2026-08-19 06:00:00'),
(10, 2, 2, 5120.00, '2026-09-04', '2026-08-19 06:00:00'),

-- Basmati Paddy Forecasts for Khanna Mandi
(11, 3, 4, 3910.00, '2026-08-22', '2026-08-19 06:00:00'),
(12, 3, 4, 3980.00, '2026-08-26', '2026-08-19 06:00:00'),
(13, 3, 4, 4080.00, '2026-08-30', '2026-08-19 06:00:00');

SET FOREIGN_KEY_CHECKS = 1;
