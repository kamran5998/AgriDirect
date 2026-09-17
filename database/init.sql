-- ============================================================================
-- AgriDirect Pulse: Unified Database Initialization Script
-- Initializes database, provisions all 12 tables, indexes, constraints, and seeds
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `agridirect_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `agridirect_db`;

-- Execute Schema Definition
SOURCE schema.sql;

-- Execute Seed Data
SOURCE seed.sql;
