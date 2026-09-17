-- ============================================================================
-- AgriDirect Pulse: Real-Time Market Intelligence & Direct Market Access
-- Complete Normalized MySQL Database Schema
-- Compatible with MySQL 8.0+ / MariaDB 10.5+
-- ============================================================================

-- Set character set and SQL mode for strict integrity
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. Table: users
-- Stores fundamental identity, authentication credentials, and user roles
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL COMMENT 'Full name of the user / contact person',
  `email` VARCHAR(191) NULL UNIQUE COMMENT 'Optional email address for notifications and reports',
  `phone` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Primary 10-digit mobile number with country code',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'Bcrypt or Argon2 hashed password',
  `role` ENUM('farmer', 'buyer', 'admin') NOT NULL DEFAULT 'farmer' COMMENT 'Role for authorization and view access',
  `location` VARCHAR(255) NULL COMMENT 'High-level general location / city',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_phone` (`phone`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Core user authentication and role directory';

-- ----------------------------------------------------------------------------
-- 2. Table: farmer_profiles
-- Specific agricultural profile and geographic metadata for registered farmers
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `farmer_profiles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL UNIQUE COMMENT '1-to-1 relationship with users',
  `state` VARCHAR(100) NOT NULL COMMENT 'State of primary farmland (e.g., Madhya Pradesh)',
  `district` VARCHAR(100) NOT NULL COMMENT 'District of farmland (e.g., Sehore)',
  `village` VARCHAR(150) NOT NULL COMMENT 'Village / Taluk / Tehsil',
  `preferred_markets` JSON NULL COMMENT 'Array of preferred APMC Mandi IDs or names (e.g., [1, 3, 5])',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_farmer_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_farmer_location` (`state`, `district`),
  INDEX `idx_farmer_district` (`district`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Detailed farmer agricultural and geographic profile';

-- ----------------------------------------------------------------------------
-- 3. Table: buyer_profiles
-- Corporate / institutional buyer enterprise details and verification credentials
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `buyer_profiles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL UNIQUE COMMENT '1-to-1 relationship with users',
  `business_name` VARCHAR(200) NOT NULL COMMENT 'Registered legal business or FPO entity name',
  `location` VARCHAR(255) NOT NULL COMMENT 'Corporate hub / procurement depot location',
  `verification_status` ENUM('pending', 'verified', 'rejected', 'suspended') NOT NULL DEFAULT 'pending' COMMENT 'KYC and GSTIN accreditation status',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_buyer_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_buyer_verification` (`verification_status`),
  INDEX `idx_buyer_business_name` (`business_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Institutional buyer and procurement entity profile';

-- ----------------------------------------------------------------------------
-- 4. Table: crops
-- Master agricultural commodity catalog
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `crops` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Commodity name & variety (e.g., Wheat - Sharbati)',
  `category` ENUM('Grains', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits', 'Cash Crops') NOT NULL COMMENT 'Agricultural commodity classification',
  `description` TEXT NULL COMMENT 'Botanical & trade specifications, standard moisture tolerance',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_crops_category` (`category`),
  INDEX `idx_crops_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master crops and commodities catalog';

-- ----------------------------------------------------------------------------
-- 5. Table: farmer_crops
-- Crops cultivated by individual farmers, estimated harvests, and inventory
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `farmer_crops` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `farmer_id` INT UNSIGNED NOT NULL COMMENT 'FK to farmer_profiles.id',
  `crop_id` INT UNSIGNED NOT NULL COMMENT 'FK to crops.id',
  `quantity` DECIMAL(12,2) NOT NULL COMMENT 'Estimated harvest or standing volume',
  `unit` VARCHAR(20) NOT NULL DEFAULT 'Quintal' COMMENT 'Measurement unit (e.g., Quintal, Metric Ton)',
  `harvest_date` DATE NOT NULL COMMENT 'Estimated harvest date or harvest completion date',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_farmer_crops_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `farmer_profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_farmer_crops_crop` FOREIGN KEY (`crop_id`) REFERENCES `crops` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_farmer_crops_farmer` (`farmer_id`),
  INDEX `idx_farmer_crops_crop` (`crop_id`),
  INDEX `idx_farmer_crops_harvest_date` (`harvest_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Farmer crop portfolio and standing harvest inventory';

-- ----------------------------------------------------------------------------
-- 6. Table: markets
-- APMC Mandis, electronic trading yards, and regional market infrastructure
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `markets` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL COMMENT 'APMC Mandi Name (e.g., Sehore APMC Yard)',
  `state` VARCHAR(100) NOT NULL COMMENT 'State (e.g., Madhya Pradesh)',
  `district` VARCHAR(100) NOT NULL COMMENT 'District (e.g., Sehore)',
  `location` VARCHAR(255) NOT NULL COMMENT 'Exact address / GPS benchmark point',
  `status` ENUM('active', 'inactive', 'closed') NOT NULL DEFAULT 'active' COMMENT 'Operating status of the yard',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_market_name_district_state` (`name`, `district`, `state`),
  INDEX `idx_markets_location` (`state`, `district`),
  INDEX `idx_markets_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='APMC Mandi yards directory';

-- ----------------------------------------------------------------------------
-- 7. Table: market_prices
-- Real-time & historical daily modal, min, max commodity prices per mandi
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `market_prices` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `market_id` INT UNSIGNED NOT NULL COMMENT 'FK to markets.id',
  `crop_id` INT UNSIGNED NOT NULL COMMENT 'FK to crops.id',
  `price` DECIMAL(10,2) NOT NULL COMMENT 'Modal (spot benchmark) price in ₹ / Quintal',
  `min_price` DECIMAL(10,2) NOT NULL COMMENT 'Minimum recorded price in ₹ / Quintal',
  `max_price` DECIMAL(10,2) NOT NULL COMMENT 'Maximum recorded price in ₹ / Quintal',
  `demand_level` ENUM('Low', 'Moderate', 'High', 'Surge') NOT NULL DEFAULT 'Moderate' COMMENT 'Market buying pressure index',
  `recorded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Price recording / ingestion timestamp',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_market_prices_market` FOREIGN KEY (`market_id`) REFERENCES `markets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_market_prices_crop` FOREIGN KEY (`crop_id`) REFERENCES `crops` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_market_prices_lookup` (`crop_id`, `market_id`, `recorded_at`),
  INDEX `idx_market_prices_market_date` (`market_id`, `recorded_at`),
  INDEX `idx_market_prices_recorded_at` (`recorded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Time-series APMC Mandi commodity arrival prices';

-- ----------------------------------------------------------------------------
-- 8. Table: buyers_requirements
-- Institutional purchase tenders and bulk procurement demand posted by buyers
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `buyers_requirements` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `buyer_id` INT UNSIGNED NOT NULL COMMENT 'FK to buyer_profiles.id',
  `crop_id` INT UNSIGNED NOT NULL COMMENT 'FK to crops.id',
  `quantity_required` DECIMAL(12,2) NOT NULL COMMENT 'Total required volume in Quintals',
  `expected_price` DECIMAL(10,2) NOT NULL COMMENT 'Target procurement price in ₹ / Quintal',
  `location` VARCHAR(255) NOT NULL COMMENT 'Delivery hub / warehouse destination',
  `status` ENUM('open', 'in_negotiation', 'fulfilled', 'cancelled', 'expired') NOT NULL DEFAULT 'open' COMMENT 'Tender lifecycle status',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_buyers_req_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `buyer_profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_buyers_req_crop` FOREIGN KEY (`crop_id`) REFERENCES `crops` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_buyers_req_status_crop` (`crop_id`, `status`),
  INDEX `idx_buyers_req_buyer` (`buyer_id`),
  INDEX `idx_buyers_req_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Buyer purchase tenders and procurement requirements';

-- ----------------------------------------------------------------------------
-- 9. Table: farmer_listings
-- Direct lot listings posted by farmers for direct farm-gate or depot sale
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `farmer_listings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `farmer_id` INT UNSIGNED NOT NULL COMMENT 'FK to farmer_profiles.id',
  `crop_id` INT UNSIGNED NOT NULL COMMENT 'FK to crops.id',
  `quantity` DECIMAL(12,2) NOT NULL COMMENT 'Lot size in Quintals',
  `expected_price` DECIMAL(10,2) NOT NULL COMMENT 'Farmer asking price in ₹ / Quintal',
  `quality` ENUM('Grade A Premium', 'FAQ Standard', 'Organic Certified', 'Commercial Bulk') NOT NULL DEFAULT 'FAQ Standard' COMMENT 'Quality assay grade',
  `location` VARCHAR(255) NOT NULL COMMENT 'Farm location or local pickup point',
  `availability_date` DATE NOT NULL COMMENT 'Date lot is ready for inspection/pickup',
  `status` ENUM('active', 'in_negotiation', 'sold', 'withdrawn') NOT NULL DEFAULT 'active' COMMENT 'Listing status',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_farmer_listings_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `farmer_profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_farmer_listings_crop` FOREIGN KEY (`crop_id`) REFERENCES `crops` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_farmer_listings_lookup` (`crop_id`, `status`, `availability_date`),
  INDEX `idx_farmer_listings_farmer` (`farmer_id`),
  INDEX `idx_farmer_listings_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Farmer direct sale lot listings';

-- ----------------------------------------------------------------------------
-- 10. Table: buyer_requests
-- Purchase offers, proposals, and counter-bids placed on farmer listings
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `buyer_requests` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `listing_id` INT UNSIGNED NOT NULL COMMENT 'FK to farmer_listings.id',
  `buyer_id` INT UNSIGNED NOT NULL COMMENT 'FK to buyer_profiles.id',
  `quantity` DECIMAL(12,2) NOT NULL COMMENT 'Quantity offered to procure in Quintals',
  `message` TEXT NULL COMMENT 'Contract terms, pickup preferences, or counter-price details',
  `status` ENUM('pending', 'accepted', 'counter_offer', 'rejected', 'completed', 'cancelled') NOT NULL DEFAULT 'pending' COMMENT 'Negotiation and trade workflow state',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_buyer_requests_listing` FOREIGN KEY (`listing_id`) REFERENCES `farmer_listings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_buyer_requests_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `buyer_profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_buyer_requests_listing` (`listing_id`),
  INDEX `idx_buyer_requests_buyer` (`buyer_id`),
  INDEX `idx_buyer_requests_status` (`status`),
  INDEX `idx_buyer_requests_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Direct purchase proposals and trade negotiation logs';

-- ----------------------------------------------------------------------------
-- 11. Table: notifications
-- Real-time user alert dispatch queue for price surges, bids, and KYC updates
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL COMMENT 'FK to users.id',
  `title` VARCHAR(200) NOT NULL COMMENT 'Notification headline',
  `message` TEXT NOT NULL COMMENT 'Full notification message content',
  `type` ENUM('price_alert', 'buyer_request', 'offer_accepted', 'system_notice', 'kyc_update') NOT NULL DEFAULT 'system_notice' COMMENT 'Category of notification',
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Read / unread state flag',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_notifications_user_unread` (`user_id`, `is_read`, `created_at`),
  INDEX `idx_notifications_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User notification feed and alert stream';

-- ----------------------------------------------------------------------------
-- 12. Table: price_predictions
-- Machine learning multi-horizon price forecasting values (7d, 15d, 30d)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `price_predictions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `crop_id` INT UNSIGNED NOT NULL COMMENT 'FK to crops.id',
  `market_id` INT UNSIGNED NOT NULL COMMENT 'FK to markets.id',
  `predicted_price` DECIMAL(10,2) NOT NULL COMMENT 'Predicted modal price in ₹ / Quintal',
  `prediction_date` DATE NOT NULL COMMENT 'Target forecast horizon date',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when ML model generated the inference',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_price_pred_crop` FOREIGN KEY (`crop_id`) REFERENCES `crops` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_price_pred_market` FOREIGN KEY (`market_id`) REFERENCES `markets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_price_pred_lookup` (`crop_id`, `market_id`, `prediction_date`),
  INDEX `idx_price_pred_date` (`prediction_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ML price prediction inferences per crop and APMC market';

-- ----------------------------------------------------------------------------
-- 13. Table: disputes
-- Trade grievance tickets, quality arbitration, and dispute resolution records
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `disputes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `trade_id` INT UNSIGNED NULL COMMENT 'Associated trade / proposal ID',
  `gate_pass_id` VARCHAR(50) NULL COMMENT 'Associated dispatch gate pass ID',
  `farmer_id` INT UNSIGNED NULL COMMENT 'FK to farmer_profiles.id',
  `buyer_id` INT UNSIGNED NULL COMMENT 'FK to buyer_profiles.id',
  `reason` VARCHAR(255) NOT NULL COMMENT 'Reason or category of dispute',
  `status` ENUM('Open', 'Under Review', 'Resolved') NOT NULL DEFAULT 'Open' COMMENT 'Dispute mediation status',
  `resolution_notes` TEXT NULL COMMENT 'Arbitration ruling and escrow resolution notes',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_disputes_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `farmer_profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_disputes_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `buyer_profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_disputes_status` (`status`),
  INDEX `idx_disputes_trade` (`trade_id`),
  INDEX `idx_disputes_farmer` (`farmer_id`),
  INDEX `idx_disputes_buyer` (`buyer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Trade arbitration and dispute grievance records';

SET FOREIGN_KEY_CHECKS = 1;
