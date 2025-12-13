-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Lis 24, 2025 at 05:51 AM
-- Wersja serwera: 10.4.32-MariaDB
-- Wersja PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `biblioteka`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `autorzy`
--

CREATE TABLE `autorzy` (
  `AutorId` int(11) NOT NULL,
  `ImieNazwisko` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `autorzy`
--

INSERT INTO `autorzy` (`AutorId`, `ImieNazwisko`) VALUES
(1, 'Adam Mickiewicz'),
(3, 'Bolesław Prus'),
(2, 'Henryk Sienkiewicz');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `dokumenty`
--

CREATE TABLE `dokumenty` (
  `DokumentId` int(11) NOT NULL,
  `Typ` enum('PotwierdzenieWypozyczenia','RozliczenieKary','Inne') NOT NULL,
  `WypozyczenieId` int(11) DEFAULT NULL,
  `KaraId` int(11) DEFAULT NULL,
  `SciezkaPliku` varchar(500) DEFAULT NULL,
  `UtworzonyPrzez` int(11) NOT NULL,
  `UtworzonyKiedy` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dokumenty`
--

INSERT INTO `dokumenty` (`DokumentId`, `Typ`, `WypozyczenieId`, `KaraId`, `SciezkaPliku`, `UtworzonyPrzez`, `UtworzonyKiedy`) VALUES
(1, 'PotwierdzenieWypozyczenia', 2, NULL, '/dokumenty/potw1.pdf', 5, '2025-11-16 21:57:31');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `egzemplarze`
--

CREATE TABLE `egzemplarze` (
  `EgzemplarzId` int(11) NOT NULL,
  `KsiazkaId` int(11) NOT NULL,
  `NumerInwentarzowy` varchar(50) NOT NULL,
  `Status` enum('Dostepny','Wypozyczony','Uszkodzony','Zaginiony','Zarezerwowany') NOT NULL DEFAULT 'Dostepny',
  `IsDeleted` tinyint(1) NOT NULL DEFAULT 0,
  `DeletedAt` datetime DEFAULT NULL,
  `DeletedBy` int(11) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `egzemplarze`
--

INSERT INTO `egzemplarze` (`EgzemplarzId`, `KsiazkaId`, `NumerInwentarzowy`, `Status`, `IsDeleted`, `DeletedAt`, `DeletedBy`, `CreatedAt`) VALUES
(1, 1, 'PT-001', 'Dostepny', 0, NULL, NULL, '2025-11-16 21:48:17'),
(2, 1, 'PT-002', 'Dostepny', 0, NULL, NULL, '2025-11-16 21:48:17'),
(3, 2, 'QV-001', 'Dostepny', 0, NULL, NULL, '2025-11-16 21:48:17'),
(4, 3, 'LK-001', 'Dostepny', 0, NULL, NULL, '2025-11-16 21:48:17');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `kary`
--

CREATE TABLE `kary` (
  `KaraId` int(11) NOT NULL,
  `WypozyczenieId` int(11) NOT NULL,
  `Kwota` decimal(10,2) NOT NULL,
  `Opis` varchar(255) DEFAULT NULL,
  `Status` enum('Naliczona','Zaplacona','Anulowana') NOT NULL DEFAULT 'Naliczona',
  `DataNaliczona` datetime NOT NULL DEFAULT current_timestamp(),
  `DataRozliczona` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kary`
--

INSERT INTO `kary` (`KaraId`, `WypozyczenieId`, `Kwota`, `Opis`, `Status`, `DataNaliczona`, `DataRozliczona`) VALUES
(1, 2, 5.00, 'Opoznienie w zwrocie', 'Naliczona', '2025-11-16 21:57:30', NULL);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `ksiazki`
--

CREATE TABLE `ksiazki` (
  `KsiazkaId` int(11) NOT NULL,
  `numerISBN` varchar(20) DEFAULT NULL,
  `Tytul` varchar(300) NOT NULL,
  `Wydawnictwo` varchar(200) DEFAULT NULL,
  `Rok` int(11) DEFAULT NULL,
  `LiczbaEgzemplarzy` int(11) NOT NULL DEFAULT 0,
  `DostepneEgzemplarze` int(11) NOT NULL DEFAULT 0,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT 0,
  `DeletedAt` datetime DEFAULT NULL,
  `DeletedBy` int(11) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ksiazki`
--

INSERT INTO `ksiazki` (`KsiazkaId`, `numerISBN`, `Tytul`, `Wydawnictwo`, `Rok`, `LiczbaEgzemplarzy`, `DostepneEgzemplarze`, `IsDeleted`, `DeletedAt`, `DeletedBy`, `CreatedAt`) VALUES
(1, '9780000000011', 'Pan Tadeusz', 'PWN', 1834, 2, 2, 0, NULL, NULL, '2025-11-16 21:48:17'),
(2, '9780000000012', 'Quo Vadis', 'PWN', 1896, 1, 1, 0, NULL, NULL, '2025-11-16 21:48:17'),
(3, '9780000000013', 'Lalka', 'PWN', 1890, 1, 1, 0, NULL, NULL, '2025-11-16 21:48:17');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `ksiazkiautorzy`
--

CREATE TABLE `ksiazkiautorzy` (
  `KsiazkaId` int(11) NOT NULL,
  `AutorId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ksiazkiautorzy`
--

INSERT INTO `ksiazkiautorzy` (`KsiazkaId`, `AutorId`) VALUES
(1, 1),
(2, 2),
(3, 3);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `logi`
--

CREATE TABLE `logi` (
  `LogId` int(11) NOT NULL,
  `TypCoSieStalo` enum('Audyt','Logowanie') NOT NULL,
  `UzytkownikId` int(11) DEFAULT NULL,
  `Opis` varchar(255) DEFAULT NULL,
  `Encja` varchar(100) DEFAULT NULL,
  `EncjaId` bigint(20) DEFAULT NULL,
  `StanPrzed` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`StanPrzed`)),
  `StanPo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`StanPo`)),
  `Kiedy` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `logi`
--

INSERT INTO `logi` (`LogId`, `TypCoSieStalo`, `UzytkownikId`, `Opis`, `Encja`, `EncjaId`, `StanPrzed`, `StanPo`, `Kiedy`) VALUES
(1, 'Logowanie', 4, 'Admin zalogowal sie do systemu', 'Uzytkownicy', 4, NULL, NULL, '2025-11-16 21:57:31');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `powiadomienia`
--

CREATE TABLE `powiadomienia` (
  `PowiadomienieId` int(11) NOT NULL,
  `UzytkownikId` int(11) NOT NULL,
  `Typ` enum('Mail','SMS','InApp') NOT NULL,
  `Status` enum('Oczekuje','Wyslane','Niepowodzenie','Przeczytane') NOT NULL DEFAULT 'Oczekuje',
  `Temat` varchar(200) NOT NULL,
  `Tresc` text NOT NULL,
  `UtworzoneKiedy` datetime NOT NULL DEFAULT current_timestamp(),
  `WyslaneKiedy` datetime DEFAULT NULL,
  `PrzeczytaneKiedy` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `powiadomienia`
--

INSERT INTO `powiadomienia` (`PowiadomienieId`, `UzytkownikId`, `Typ`, `Status`, `Temat`, `Tresc`, `UtworzoneKiedy`, `WyslaneKiedy`, `PrzeczytaneKiedy`) VALUES
(1, 6, 'Mail', 'Wyslane', 'Przypomnienie o zwrocie', 'Przypominamy o koniecznosci zwrotu ksiazki.', '2025-11-16 21:57:31', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `recenzje`
--

CREATE TABLE `recenzje` (
  `RecenzjaId` int(11) NOT NULL,
  `KsiazkaId` int(11) NOT NULL,
  `UzytkownikId` int(11) NOT NULL,
  `Ocena` tinyint(4) NOT NULL,
  `Tresc` text NOT NULL,
  `Status` enum('Oczekuje','Zatwierdzona','Odrzucona') NOT NULL DEFAULT 'Oczekuje',
  `Zgloszona` tinyint(1) NOT NULL DEFAULT 0,
  `ZgloszonaPrzez` int(11) DEFAULT NULL,
  `PowodZgloszenia` varchar(255) DEFAULT NULL,
  `ZatwierdzonaPrzez` int(11) DEFAULT NULL,
  `ZatwierdzonaKiedy` datetime DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT 0,
  `DeletedAt` datetime DEFAULT NULL,
  `DeletedBy` int(11) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `recenzje`
--

INSERT INTO `recenzje` (`RecenzjaId`, `KsiazkaId`, `UzytkownikId`, `Ocena`, `Tresc`, `Status`, `Zgloszona`, `ZgloszonaPrzez`, `PowodZgloszenia`, `ZatwierdzonaPrzez`, `ZatwierdzonaKiedy`, `IsDeleted`, `DeletedAt`, `DeletedBy`, `CreatedAt`) VALUES
(1, 1, 6, 5, 'Swietna ksiazka, klasyk!', 'Zatwierdzona', 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2025-11-16 21:57:31');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `role`
--

CREATE TABLE `role` (
  `RolaId` int(11) NOT NULL,
  `NazwaRoli` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`RolaId`, `NazwaRoli`) VALUES
(1, 'ADMIN'),
(2, 'BIBLIOTEKARZ'),
(3, 'CZYTELNIK');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `uzytkownicy`
--

CREATE TABLE `uzytkownicy` (
  `UzytkownikId` int(11) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `HasloHash` varchar(255) NOT NULL,
  `Imie` varchar(100) NOT NULL,
  `Nazwisko` varchar(100) NOT NULL,
  `RolaId` int(11) NOT NULL,
  `Aktywny` tinyint(1) NOT NULL DEFAULT 1,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT 0,
  `DeletedAt` datetime DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `uzytkownicy`
--

INSERT INTO `uzytkownicy` (`UzytkownikId`, `Email`, `HasloHash`, `Imie`, `Nazwisko`, `RolaId`, `Aktywny`, `IsDeleted`, `DeletedAt`, `CreatedAt`) VALUES
(4, 'admin@biblioteka.pl', 'haslo_admin', 'Anna', 'Admin', 1, 1, 0, NULL, '2025-11-16 21:48:17'),
(5, 'bibliotekarz@biblioteka.pl', 'haslo_bibl', 'Jan', 'Bibliotekarz', 2, 1, 0, NULL, '2025-11-16 21:48:17'),
(6, 'czytelnik@biblioteka.pl', 'haslo_user', 'Kasia', 'Czytelnik', 3, 1, 0, NULL, '2025-11-16 21:48:17'),
(26, 'admin@admin.pl', '$2b$10$XTngNHBGZwrhJVjvA3K5Ouywsr46X9yRzLTm0HprHJDjB8Dk4tiJC', 'admin', 'admin', 1, 1, 0, NULL, '2025-11-17 02:01:29');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `wypozyczenia`
--

CREATE TABLE `wypozyczenia` (
  `WypozyczenieId` int(11) NOT NULL,
  `UzytkownikId` int(11) NOT NULL,
  `EgzemplarzId` int(11) NOT NULL,
  `DataWypozyczenia` date NOT NULL,
  `TerminZwrotu` date NOT NULL,
  `DataZwrotu` date DEFAULT NULL,
  `Status` enum('Aktywne','Zwrocone','Zalegle','Utracone') NOT NULL DEFAULT 'Aktywne',
  `IsDeleted` tinyint(1) NOT NULL DEFAULT 0,
  `DeletedAt` datetime DEFAULT NULL,
  `DeletedBy` int(11) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wypozyczenia`
--

INSERT INTO `wypozyczenia` (`WypozyczenieId`, `UzytkownikId`, `EgzemplarzId`, `DataWypozyczenia`, `TerminZwrotu`, `DataZwrotu`, `Status`, `IsDeleted`, `DeletedAt`, `DeletedBy`, `CreatedAt`) VALUES
(2, 6, 1, '2025-01-15', '2025-02-15', NULL, 'Aktywne', 0, NULL, NULL, '2025-11-16 21:57:30');

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `autorzy`
--
ALTER TABLE `autorzy`
  ADD PRIMARY KEY (`AutorId`),
  ADD UNIQUE KEY `autorzy_imienazwisko_unique` (`ImieNazwisko`);

--
-- Indeksy dla tabeli `dokumenty`
--
ALTER TABLE `dokumenty`
  ADD PRIMARY KEY (`DokumentId`),
  ADD KEY `dokumenty_wypozyczenieid_index` (`WypozyczenieId`),
  ADD KEY `dokumenty_karaid_index` (`KaraId`),
  ADD KEY `dokumenty_utworzonyprzez_foreign` (`UtworzonyPrzez`);

--
-- Indeksy dla tabeli `egzemplarze`
--
ALTER TABLE `egzemplarze`
  ADD PRIMARY KEY (`EgzemplarzId`),
  ADD UNIQUE KEY `egzemplarze_numerinwentarzowy_unique` (`NumerInwentarzowy`),
  ADD KEY `egzemplarze_ksiazkaid_index` (`KsiazkaId`),
  ADD KEY `egzemplarze_deletedby_foreign` (`DeletedBy`);

--
-- Indeksy dla tabeli `kary`
--
ALTER TABLE `kary`
  ADD PRIMARY KEY (`KaraId`),
  ADD KEY `kary_wypozyczenieid_status_index` (`WypozyczenieId`,`Status`);

--
-- Indeksy dla tabeli `ksiazki`
--
ALTER TABLE `ksiazki`
  ADD PRIMARY KEY (`KsiazkaId`),
  ADD UNIQUE KEY `ksiazki_numerisbn_unique` (`numerISBN`),
  ADD KEY `ksiazki_tytul_index` (`Tytul`),
  ADD KEY `ksiazki_deletedby_foreign` (`DeletedBy`);

--
-- Indeksy dla tabeli `ksiazkiautorzy`
--
ALTER TABLE `ksiazkiautorzy`
  ADD PRIMARY KEY (`KsiazkaId`,`AutorId`),
  ADD KEY `ksiazkiautorzy_autorid_index` (`AutorId`);

--
-- Indeksy dla tabeli `logi`
--
ALTER TABLE `logi`
  ADD PRIMARY KEY (`LogId`),
  ADD KEY `logi_encja_encjaid_kiedy_index` (`Encja`,`EncjaId`,`Kiedy`),
  ADD KEY `logi_uzytkownikid_kiedy_index` (`UzytkownikId`,`Kiedy`);

--
-- Indeksy dla tabeli `powiadomienia`
--
ALTER TABLE `powiadomienia`
  ADD PRIMARY KEY (`PowiadomienieId`),
  ADD KEY `powiadomienia_uzytkownikid_status_utworzonekiedy_index` (`UzytkownikId`,`Status`,`UtworzoneKiedy`);

--
-- Indeksy dla tabeli `recenzje`
--
ALTER TABLE `recenzje`
  ADD PRIMARY KEY (`RecenzjaId`),
  ADD UNIQUE KEY `recenzje_ksiazkaid_uzytkownikid_unique` (`KsiazkaId`,`UzytkownikId`),
  ADD KEY `recenzje_status_index` (`Status`),
  ADD KEY `recenzje_uzytkownikid_foreign` (`UzytkownikId`),
  ADD KEY `recenzje_zgloszonaprzez_foreign` (`ZgloszonaPrzez`),
  ADD KEY `recenzje_zatwierdzonaprzez_foreign` (`ZatwierdzonaPrzez`),
  ADD KEY `recenzje_deletedby_foreign` (`DeletedBy`);

--
-- Indeksy dla tabeli `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`RolaId`),
  ADD UNIQUE KEY `role_nazwaroli_unique` (`NazwaRoli`);

--
-- Indeksy dla tabeli `uzytkownicy`
--
ALTER TABLE `uzytkownicy`
  ADD PRIMARY KEY (`UzytkownikId`),
  ADD UNIQUE KEY `uzytkownicy_email_unique` (`Email`),
  ADD KEY `uzytkownicy_rolaid_index` (`RolaId`);

--
-- Indeksy dla tabeli `wypozyczenia`
--
ALTER TABLE `wypozyczenia`
  ADD PRIMARY KEY (`WypozyczenieId`),
  ADD KEY `wypozyczenia_uzytkownikid_status_datawypozyczenia_index` (`UzytkownikId`,`Status`,`DataWypozyczenia`),
  ADD KEY `wypozyczenia_egzemplarzid_index` (`EgzemplarzId`),
  ADD KEY `wypozyczenia_deletedby_foreign` (`DeletedBy`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `autorzy`
--
ALTER TABLE `autorzy`
  MODIFY `AutorId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `dokumenty`
--
ALTER TABLE `dokumenty`
  MODIFY `DokumentId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `egzemplarze`
--
ALTER TABLE `egzemplarze`
  MODIFY `EgzemplarzId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `kary`
--
ALTER TABLE `kary`
  MODIFY `KaraId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `ksiazki`
--
ALTER TABLE `ksiazki`
  MODIFY `KsiazkaId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `logi`
--
ALTER TABLE `logi`
  MODIFY `LogId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `powiadomienia`
--
ALTER TABLE `powiadomienia`
  MODIFY `PowiadomienieId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `recenzje`
--
ALTER TABLE `recenzje`
  MODIFY `RecenzjaId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `RolaId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `uzytkownicy`
--
ALTER TABLE `uzytkownicy`
  MODIFY `UzytkownikId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `wypozyczenia`
--
ALTER TABLE `wypozyczenia`
  MODIFY `WypozyczenieId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `dokumenty`
--
ALTER TABLE `dokumenty`
  ADD CONSTRAINT `dokumenty_karaid_foreign` FOREIGN KEY (`KaraId`) REFERENCES `kary` (`KaraId`) ON DELETE CASCADE,
  ADD CONSTRAINT `dokumenty_utworzonyprzez_foreign` FOREIGN KEY (`UtworzonyPrzez`) REFERENCES `uzytkownicy` (`UzytkownikId`),
  ADD CONSTRAINT `dokumenty_wypozyczenieid_foreign` FOREIGN KEY (`WypozyczenieId`) REFERENCES `wypozyczenia` (`WypozyczenieId`) ON DELETE CASCADE;

--
-- Constraints for table `egzemplarze`
--
ALTER TABLE `egzemplarze`
  ADD CONSTRAINT `egzemplarze_deletedby_foreign` FOREIGN KEY (`DeletedBy`) REFERENCES `uzytkownicy` (`UzytkownikId`) ON DELETE SET NULL,
  ADD CONSTRAINT `egzemplarze_ksiazkaid_foreign` FOREIGN KEY (`KsiazkaId`) REFERENCES `ksiazki` (`KsiazkaId`);

--
-- Constraints for table `kary`
--
ALTER TABLE `kary`
  ADD CONSTRAINT `kary_wypozyczenieid_foreign` FOREIGN KEY (`WypozyczenieId`) REFERENCES `wypozyczenia` (`WypozyczenieId`) ON DELETE CASCADE;

--
-- Constraints for table `ksiazki`
--
ALTER TABLE `ksiazki`
  ADD CONSTRAINT `ksiazki_deletedby_foreign` FOREIGN KEY (`DeletedBy`) REFERENCES `uzytkownicy` (`UzytkownikId`) ON DELETE SET NULL;

--
-- Constraints for table `ksiazkiautorzy`
--
ALTER TABLE `ksiazkiautorzy`
  ADD CONSTRAINT `ksiazkiautorzy_autorid_foreign` FOREIGN KEY (`AutorId`) REFERENCES `autorzy` (`AutorId`) ON DELETE CASCADE,
  ADD CONSTRAINT `ksiazkiautorzy_ksiazkaid_foreign` FOREIGN KEY (`KsiazkaId`) REFERENCES `ksiazki` (`KsiazkaId`) ON DELETE CASCADE;

--
-- Constraints for table `logi`
--
ALTER TABLE `logi`
  ADD CONSTRAINT `logi_uzytkownikid_foreign` FOREIGN KEY (`UzytkownikId`) REFERENCES `uzytkownicy` (`UzytkownikId`);

--
-- Constraints for table `powiadomienia`
--
ALTER TABLE `powiadomienia`
  ADD CONSTRAINT `powiadomienia_uzytkownikid_foreign` FOREIGN KEY (`UzytkownikId`) REFERENCES `uzytkownicy` (`UzytkownikId`);

--
-- Constraints for table `recenzje`
--
ALTER TABLE `recenzje`
  ADD CONSTRAINT `recenzje_deletedby_foreign` FOREIGN KEY (`DeletedBy`) REFERENCES `uzytkownicy` (`UzytkownikId`) ON DELETE SET NULL,
  ADD CONSTRAINT `recenzje_ksiazkaid_foreign` FOREIGN KEY (`KsiazkaId`) REFERENCES `ksiazki` (`KsiazkaId`),
  ADD CONSTRAINT `recenzje_uzytkownikid_foreign` FOREIGN KEY (`UzytkownikId`) REFERENCES `uzytkownicy` (`UzytkownikId`),
  ADD CONSTRAINT `recenzje_zatwierdzonaprzez_foreign` FOREIGN KEY (`ZatwierdzonaPrzez`) REFERENCES `uzytkownicy` (`UzytkownikId`) ON DELETE SET NULL,
  ADD CONSTRAINT `recenzje_zgloszonaprzez_foreign` FOREIGN KEY (`ZgloszonaPrzez`) REFERENCES `uzytkownicy` (`UzytkownikId`) ON DELETE SET NULL;

--
-- Constraints for table `uzytkownicy`
--
ALTER TABLE `uzytkownicy`
  ADD CONSTRAINT `uzytkownicy_rolaid_foreign` FOREIGN KEY (`RolaId`) REFERENCES `role` (`RolaId`);

--
-- Constraints for table `wypozyczenia`
--
ALTER TABLE `wypozyczenia`
  ADD CONSTRAINT `wypozyczenia_deletedby_foreign` FOREIGN KEY (`DeletedBy`) REFERENCES `uzytkownicy` (`UzytkownikId`) ON DELETE SET NULL,
  ADD CONSTRAINT `wypozyczenia_egzemplarzid_foreign` FOREIGN KEY (`EgzemplarzId`) REFERENCES `egzemplarze` (`EgzemplarzId`),
  ADD CONSTRAINT `wypozyczenia_uzytkownikid_foreign` FOREIGN KEY (`UzytkownikId`) REFERENCES `uzytkownicy` (`UzytkownikId`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
