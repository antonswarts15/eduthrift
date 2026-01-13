-- Migration: Add fields to support frontend listing structure
USE eduthrift;

-- Add new columns to items table
ALTER TABLE items
ADD COLUMN IF NOT EXISTS item_name VARCHAR(255) AFTER item_type_id,
ADD COLUMN IF NOT EXISTS category VARCHAR(255) AFTER item_name,
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(255) AFTER category,
ADD COLUMN IF NOT EXISTS sport VARCHAR(255) AFTER subcategory,
ADD COLUMN IF NOT EXISTS quantity INT DEFAULT 1 AFTER status,
ADD COLUMN IF NOT EXISTS expiry_date DATE AFTER quantity,
ADD COLUMN IF NOT EXISTS is_expired BOOLEAN DEFAULT FALSE AFTER expiry_date,
ADD COLUMN IF NOT EXISTS sold_out BOOLEAN DEFAULT FALSE AFTER is_expired;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_subcategory ON items(subcategory);
CREATE INDEX IF NOT EXISTS idx_sport ON items(sport);
CREATE INDEX IF NOT EXISTS idx_item_name ON items(item_name);
CREATE INDEX IF NOT EXISTS idx_expiry ON items(expiry_date);

-- Make item_type_id nullable since we'll use category/subcategory/sport instead
ALTER TABLE items MODIFY COLUMN item_type_id INT NULL;

-- Update existing items to have default expiry (30 days from now)
UPDATE items
SET expiry_date = DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY)
WHERE expiry_date IS NULL;

-- Update item_name from item_types where possible
UPDATE items i
LEFT JOIN item_types it ON i.item_type_id = it.id
SET i.item_name = it.name
WHERE i.item_name IS NULL AND it.name IS NOT NULL;

-- Update category from item_types -> categories
UPDATE items i
LEFT JOIN item_types it ON i.item_type_id = it.id
LEFT JOIN categories c ON it.category_id = c.id
SET i.category = c.name
WHERE i.category IS NULL AND c.name IS NOT NULL;

-- Update subcategory from item_types -> subcategories
UPDATE items i
LEFT JOIN item_types it ON i.item_type_id = it.id
LEFT JOIN subcategories sc ON it.subcategory_id = sc.id
SET i.subcategory = sc.name
WHERE i.subcategory IS NULL AND sc.name IS NOT NULL;

-- Update sport from item_types -> sports
UPDATE items i
LEFT JOIN item_types it ON i.item_type_id = it.id
LEFT JOIN sports s ON it.sport_id = s.id
SET i.sport = s.name
WHERE i.sport IS NULL AND s.name IS NOT NULL;

COMMIT;
