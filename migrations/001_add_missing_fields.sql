-- =============================================================================
-- MIGRACJA: Dodanie pól do obsługi resetu hasła
-- =============================================================================
-- 
-- Uruchom ten skrypt, aby dodać wymagane pola do tabeli uzytkownicy
-- 

-- Dodaj pola dla tokenu resetu hasła
ALTER TABLE `uzytkownicy` 
ADD COLUMN `ResetToken` VARCHAR(255) DEFAULT NULL AFTER `CreatedAt`,
ADD COLUMN `ResetTokenExpiry` DATETIME DEFAULT NULL AFTER `ResetToken`,
ADD COLUMN `UpdatedAt` DATETIME DEFAULT NULL AFTER `ResetTokenExpiry`,
ADD COLUMN `UpdatedBy` INT(11) DEFAULT NULL AFTER `UpdatedAt`;

-- Dodaj foreign key dla UpdatedBy
ALTER TABLE `uzytkownicy`
ADD CONSTRAINT `uzytkownicy_updatedby_foreign` 
FOREIGN KEY (`UpdatedBy`) REFERENCES `uzytkownicy` (`UzytkownikId`) ON DELETE SET NULL;

-- =============================================================================
-- MIGRACJA: Nowa tabela dla e-booków
-- =============================================================================

CREATE TABLE IF NOT EXISTS `ebooki` (
  `EbookId` INT(11) NOT NULL AUTO_INCREMENT,
  `Tytul` VARCHAR(255) NOT NULL,
  `KsiazkaId` INT(11) DEFAULT NULL,
  `SciezkaPliku` VARCHAR(500) NOT NULL,
  `RozmiarPliku` INT(11) DEFAULT 0,
  `Format` VARCHAR(20) DEFAULT 'PDF',
  `PoziomDostepu` ENUM('Publiczny','Czytelnik','Bibliotekarz','Admin') DEFAULT 'Czytelnik',
  `IsDeleted` TINYINT(1) DEFAULT 0,
  `DeletedAt` DATETIME DEFAULT NULL,
  `DeletedBy` INT(11) DEFAULT NULL,
  `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` INT(11) DEFAULT NULL,
  `UpdatedAt` DATETIME DEFAULT NULL,
  `UpdatedBy` INT(11) DEFAULT NULL,
  PRIMARY KEY (`EbookId`),
  KEY `ebooki_ksiazkaid_index` (`KsiazkaId`),
  CONSTRAINT `ebooki_ksiazkaid_foreign` FOREIGN KEY (`KsiazkaId`) REFERENCES `ksiazki` (`KsiazkaId`) ON DELETE SET NULL,
  CONSTRAINT `ebooki_createdby_foreign` FOREIGN KEY (`CreatedBy`) REFERENCES `uzytkownicy` (`UzytkownikId`) ON DELETE SET NULL,
  CONSTRAINT `ebooki_deletedby_foreign` FOREIGN KEY (`DeletedBy`) REFERENCES `uzytkownicy` (`UzytkownikId`) ON DELETE SET NULL,
  CONSTRAINT `ebooki_updatedby_foreign` FOREIGN KEY (`UpdatedBy`) REFERENCES `uzytkownicy` (`UzytkownikId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =============================================================================
-- MIGRACJA: Dodanie pól do tabeli ksiazki dla DostepneEgzemplarze
-- =============================================================================

ALTER TABLE `ksiazki`
ADD COLUMN IF NOT EXISTS `DostepneEgzemplarze` INT(11) DEFAULT 0 AFTER `IloscEgzemplarzy`,
ADD COLUMN IF NOT EXISTS `UpdatedAt` DATETIME DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `UpdatedBy` INT(11) DEFAULT NULL;

-- Zaktualizuj DostepneEgzemplarze na podstawie aktualnych danych
UPDATE `ksiazki` k SET `DostepneEgzemplarze` = (
  SELECT COUNT(*) FROM `egzemplarze` e 
  WHERE e.KsiazkaId = k.KsiazkaId 
  AND e.Status = 'Dostepny' 
  AND e.IsDeleted = 0
);

-- =============================================================================
-- MIGRACJA: Dodanie pól dla rozszerzonej funkcjonalności wypożyczeń
-- =============================================================================

ALTER TABLE `wypozyczenia`
ADD COLUMN IF NOT EXISTS `IloscPrzedluzen` INT(11) DEFAULT 0 AFTER `Status`,
ADD COLUMN IF NOT EXISTS `UpdatedAt` DATETIME DEFAULT NULL AFTER `IloscPrzedluzen`,
ADD COLUMN IF NOT EXISTS `UpdatedBy` INT(11) DEFAULT NULL AFTER `UpdatedAt`;
