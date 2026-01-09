-- Migration 003: Add OkladkaUrl to ksiazki
ALTER TABLE ksiazki
  ADD COLUMN `OkladkaUrl` varchar(500) DEFAULT NULL;
