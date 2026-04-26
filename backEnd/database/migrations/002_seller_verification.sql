-- Migration: Fix seller verification schema
-- Run this against existing databases where init.sql was applied before these columns existed.
USE eduthrift;

-- Add seller_verified column if missing
ALTER TABLE users
ADD COLUMN IF NOT EXISTS seller_verified BOOLEAN DEFAULT FALSE;

-- Add bank_confirmation_url column if missing
ALTER TABLE users
ADD COLUMN IF NOT EXISTS bank_confirmation_url VARCHAR(500);

-- Fix any rows with NULL or empty verification_status before changing the column type
UPDATE users SET verification_status = 'unverified'
WHERE verification_status IS NULL OR verification_status = '';

-- Fix verification_status: change ENUM to include 'unverified' and set correct default.
-- If the column is already VARCHAR this becomes a no-op in terms of stored data.
ALTER TABLE users
MODIFY COLUMN verification_status VARCHAR(20) NOT NULL DEFAULT 'unverified';

-- Normalize any stale 'pending' values set by the old DB default for users who never submitted docs
-- (i.e. they have no documents uploaded but show as pending)
UPDATE users
SET verification_status = 'unverified'
WHERE verification_status = 'pending'
  AND id_document_url IS NULL
  AND proof_of_address_url IS NULL
  AND bank_confirmation_url IS NULL
  AND seller_verified = FALSE;

-- Admin users should be able to list items for platform testing
UPDATE users SET seller_verified = TRUE, verification_status = 'verified'
WHERE user_type = 'ADMIN' AND seller_verified = FALSE;

INSERT IGNORE INTO schema_version (version) VALUES (3);
