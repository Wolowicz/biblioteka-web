-- Migration 004: Add description, page count, and cover URL to ksiazki table
-- Run this migration to enable cover images, descriptions and page counts

-- Add cover URL (if not exists from migration 002/003)
ALTER TABLE ksiazki 
ADD COLUMN IF NOT EXISTS `OkladkaUrl` VARCHAR(500) DEFAULT NULL AFTER `Tytul`;

-- Add description
ALTER TABLE ksiazki 
ADD COLUMN IF NOT EXISTS `Opis` TEXT DEFAULT NULL AFTER `OkladkaUrl`;

-- Add page count
ALTER TABLE ksiazki 
ADD COLUMN IF NOT EXISTS `LiczbaStron` INT(11) DEFAULT NULL AFTER `Opis`;

-- Verify columns exist (for MySQL 5.7 compatibility, run these if IF NOT EXISTS fails):
-- ALTER TABLE ksiazki ADD COLUMN `OkladkaUrl` VARCHAR(500) DEFAULT NULL;
-- ALTER TABLE ksiazki ADD COLUMN `Opis` TEXT DEFAULT NULL;
-- ALTER TABLE ksiazki ADD COLUMN `LiczbaStron` INT(11) DEFAULT NULL;
