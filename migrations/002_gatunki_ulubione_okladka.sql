-- =============================================================================
-- MIGRACJA: Gatunki książek, Ulubione i Okładki
-- =============================================================================
-- 
-- Uruchom ten skrypt, aby dodać:
-- 1. Tabelę gatunków (kategorii) książek
-- 2. Tabelę łączącą książki z gatunkami
-- 3. Kolumnę na URL okładki w tabeli książek
-- 4. Tabelę ulubionych książek użytkowników
-- 

-- =============================================================================
-- 1. TABELA GATUNKÓW (KATEGORII)
-- =============================================================================

CREATE TABLE IF NOT EXISTS `gatunki` (
  `GatunekId` INT(11) NOT NULL AUTO_INCREMENT,
  `Nazwa` VARCHAR(100) NOT NULL,
  `Ikona` VARCHAR(50) DEFAULT 'fas fa-book',
  `Kolor` VARCHAR(50) DEFAULT 'from-indigo-500 to-purple-600',
  `IsDeleted` TINYINT(1) DEFAULT 0,
  `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`GatunekId`),
  UNIQUE KEY `gatunki_nazwa_unique` (`Nazwa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Wstaw domyślne gatunki
INSERT IGNORE INTO `gatunki` (`Nazwa`, `Ikona`, `Kolor`) VALUES
('Fantastyka', 'fas fa-dragon', 'from-violet-500 to-purple-600'),
('Klasyka', 'fas fa-landmark', 'from-amber-400 to-orange-500'),
('Dla dzieci', 'fas fa-child', 'from-pink-400 to-rose-500'),
('Informatyka', 'fas fa-laptop-code', 'from-blue-500 to-cyan-500'),
('Biznes', 'fas fa-briefcase', 'from-emerald-500 to-teal-500'),
('Kryminał', 'fas fa-user-secret', 'from-slate-600 to-slate-800'),
('Romans', 'fas fa-heart', 'from-rose-400 to-pink-500'),
('Science Fiction', 'fas fa-rocket', 'from-indigo-500 to-blue-600'),
('Horror', 'fas fa-ghost', 'from-gray-700 to-gray-900'),
('Przygoda', 'fas fa-compass', 'from-amber-500 to-yellow-500'),
('Historia', 'fas fa-scroll', 'from-yellow-600 to-amber-700'),
('Biografia', 'fas fa-user', 'from-teal-500 to-green-500'),
('Poradnik', 'fas fa-lightbulb', 'from-yellow-400 to-orange-400'),
('Poezja', 'fas fa-feather-alt', 'from-purple-400 to-indigo-500');

-- =============================================================================
-- 2. TABELA ŁĄCZĄCA KSIĄŻKI Z GATUNKAMI (wiele do wielu)
-- =============================================================================

-- =============================================================================
-- 3. KOLUMNA NA URL OKŁADKI W TABELI KSIĄŻEK
-- =============================================================================

ALTER TABLE `ksiazki`
ADD COLUMN IF NOT EXISTS `OkladkaUrl` VARCHAR(500) DEFAULT NULL AFTER `Tytul`;

-- =============================================================================
-- 4. TABELA ULUBIONYCH KSIĄŻEK UŻYTKOWNIKÓW
CREATE TABLE IF NOT EXISTS `ksiazki_gatunki` (
  `KsiazkaGatunekId` INT(11) NOT NULL AUTO_INCREMENT,
  `KsiazkaId` INT(11) NOT NULL,
  `GatunekId` INT(11) NOT NULL,
  `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`KsiazkaGatunekId`),
  UNIQUE KEY `ksiazki_gatunki_unique` (`KsiazkaId`, `GatunekId`),
  KEY `ksiazki_gatunki_ksiazka_index` (`KsiazkaId`),
  KEY `ksiazki_gatunki_gatunek_index` (`GatunekId`),
  CONSTRAINT `ksiazki_gatunki_ksiazka_fk` FOREIGN KEY (`KsiazkaId`) REFERENCES `ksiazki` (`KsiazkaId`) ON DELETE CASCADE,
  CONSTRAINT `ksiazki_gatunki_gatunek_fk` FOREIGN KEY (`GatunekId`) REFERENCES `gatunki` (`GatunekId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =============================================================================

CREATE TABLE IF NOT EXISTS `ulubione` (
  `UlubioneId` INT(11) NOT NULL AUTO_INCREMENT,
  `UzytkownikId` INT(11) NOT NULL,
  `KsiazkaId` INT(11) NOT NULL,
  `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UlubioneId`),
  UNIQUE KEY `ulubione_unique` (`UzytkownikId`, `KsiazkaId`),
  KEY `ulubione_uzytkownik_index` (`UzytkownikId`),
  KEY `ulubione_ksiazka_index` (`KsiazkaId`),
  CONSTRAINT `ulubione_uzytkownik_fk` FOREIGN KEY (`UzytkownikId`) REFERENCES `uzytkownicy` (`UzytkownikId`) ON DELETE CASCADE,
  CONSTRAINT `ulubione_ksiazka_fk` FOREIGN KEY (`KsiazkaId`) REFERENCES `ksiazki` (`KsiazkaId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =============================================================================
-- KONIEC MIGRACJI
-- =============================================================================
