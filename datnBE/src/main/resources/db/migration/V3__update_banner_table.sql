-- Migration to update banner table with new fields
-- Run this migration to add new fields to the banner table

ALTER TABLE banner
ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255),
ADD COLUMN IF NOT EXISTS description VARCHAR(500),
ADD COLUMN IF NOT EXISTS mobile_image_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS link_target VARCHAR(20) DEFAULT 'SAME_TAB',
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'IMAGE',
ADD COLUMN IF NOT EXISTS button_text VARCHAR(100),
ADD COLUMN IF NOT EXISTS background_color VARCHAR(20);

-- Update existing records to have default values
UPDATE banner SET link_target = 'SAME_TAB' WHERE link_target IS NULL OR link_target = '';
UPDATE banner SET type = 'IMAGE' WHERE type IS NULL OR type = '';

-- Add index for new fields
CREATE INDEX IF NOT EXISTS idx_banner_link_target ON banner(link_target);
CREATE INDEX IF NOT EXISTS idx_banner_type ON banner(type);
