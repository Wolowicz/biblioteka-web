-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 14, 2025 at 05:03 AM
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
(7, 'Andrzej Sapkowski'),
(3, 'Bolesław Prus'),
(10, 'Brandon Sanderson'),
(6, 'George Orwell'),
(2, 'Henryk Sienkiewicz'),
(5, 'J.K. Rowling'),
(8, 'Olga Tokarczuk'),
(4, 'Stephen King'),
(9, 'Ursula K. Le Guin');

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

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `ebooki`
--

CREATE TABLE `ebooki` (
  `EbookId` int(11) NOT NULL,
  `Tytul` varchar(255) NOT NULL,
  `KsiazkaId` int(11) DEFAULT NULL,
  `SciezkaPliku` varchar(500) NOT NULL,
  `RozmiarPliku` int(11) DEFAULT 0,
  `Format` varchar(20) DEFAULT 'PDF',
  `PoziomDostepu` enum('Publiczny','Czytelnik','Bibliotekarz','Admin') DEFAULT 'Czytelnik',
  `IsDeleted` tinyint(1) DEFAULT 0,
  `DeletedAt` datetime DEFAULT NULL,
  `DeletedBy` int(11) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 1, 'PT-001', 'Wypozyczony', 0, NULL, NULL, '2025-11-16 21:48:17'),
(2, 1, 'PT-002', 'Dostepny', 0, NULL, NULL, '2025-11-16 21:48:17'),
(3, 2, 'QV-001', 'Dostepny', 0, NULL, NULL, '2025-11-16 21:48:17'),
(4, 3, 'LK-001', 'Wypozyczony', 0, NULL, NULL, '2025-11-16 21:48:17'),
(5, 5, '5-001', 'Wypozyczony', 0, NULL, NULL, '2025-12-01 07:32:54'),
(6, 5, '5-002', 'Dostepny', 0, NULL, NULL, '2025-12-01 07:32:54'),
(7, 5, '5-003', 'Dostepny', 0, NULL, NULL, '2025-12-01 07:32:54'),
(8, 5, '5-004', 'Dostepny', 0, NULL, NULL, '2025-12-01 07:32:54'),
(9, 5, '5-005', 'Dostepny', 0, NULL, NULL, '2025-12-01 07:32:54'),
(10, 6, '6-001', 'Dostepny', 0, NULL, NULL, '2025-12-01 07:32:54'),
(11, 6, '6-002', 'Dostepny', 0, NULL, NULL, '2025-12-01 07:32:54'),
(12, 6, '6-003', 'Dostepny', 0, NULL, NULL, '2025-12-01 07:32:54'),
(13, 6, '6-004', 'Dostepny', 0, NULL, NULL, '2025-12-01 07:32:54'),
(14, 7, '7-001', 'Dostepny', 0, NULL, NULL, '2025-12-01 07:32:54'),
(15, 7, '7-002', 'Dostepny', 0, NULL, NULL, '2025-12-01 07:32:54'),
(16, 7, '7-003', 'Dostepny', 0, NULL, NULL, '2025-12-01 07:32:54'),
(17, 8, '8-001', 'Wypozyczony', 0, NULL, NULL, '2025-12-01 07:32:54'),
(18, 8, '8-002', 'Dostepny', 0, NULL, NULL, '2025-12-01 07:32:54'),
(19, 9, '9-001', 'Dostepny', 0, NULL, NULL, '2025-12-01 07:32:54'),
(20, 9, '9-002', 'Dostepny', 0, NULL, NULL, '2025-12-01 07:32:54'),
(21, 9, '9-003', 'Dostepny', 0, NULL, NULL, '2025-12-01 07:32:54'),
(22, 10, '10-001', 'Wypozyczony', 0, NULL, NULL, '2025-12-01 07:32:54'),
(23, 10, '10-002', 'Dostepny', 0, NULL, NULL, '2025-12-01 07:32:54'),
(24, 10, '10-003', 'Dostepny', 0, NULL, NULL, '2025-12-01 07:32:54'),
(25, 10, '10-004', 'Dostepny', 0, NULL, NULL, '2025-12-01 07:32:54');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `gatunki`
--

CREATE TABLE `gatunki` (
  `GatunekId` int(11) NOT NULL,
  `Nazwa` varchar(100) NOT NULL,
  `Ikona` varchar(50) DEFAULT 'fas fa-book',
  `Kolor` varchar(50) DEFAULT 'from-indigo-500 to-purple-600',
  `IsDeleted` tinyint(1) DEFAULT 0,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gatunki`
--

INSERT INTO `gatunki` (`GatunekId`, `Nazwa`, `Ikona`, `Kolor`, `IsDeleted`, `CreatedAt`) VALUES
(1, 'Fantastyka', 'fas fa-dragon', 'from-violet-500 to-purple-600', 0, '2025-12-14 04:52:05'),
(2, 'Klasyka', 'fas fa-landmark', 'from-amber-400 to-orange-500', 0, '2025-12-14 04:52:05'),
(3, 'Dla dzieci', 'fas fa-child', 'from-pink-400 to-rose-500', 0, '2025-12-14 04:52:05'),
(4, 'Informatyka', 'fas fa-laptop-code', 'from-blue-500 to-cyan-500', 0, '2025-12-14 04:52:05'),
(5, 'Biznes', 'fas fa-briefcase', 'from-emerald-500 to-teal-500', 0, '2025-12-14 04:52:05'),
(6, 'Kryminał', 'fas fa-user-secret', 'from-slate-600 to-slate-800', 0, '2025-12-14 04:52:05'),
(7, 'Romans', 'fas fa-heart', 'from-rose-400 to-pink-500', 0, '2025-12-14 04:52:05'),
(8, 'Science Fiction', 'fas fa-rocket', 'from-indigo-500 to-blue-600', 0, '2025-12-14 04:52:05'),
(9, 'Horror', 'fas fa-ghost', 'from-gray-700 to-gray-900', 0, '2025-12-14 04:52:05'),
(10, 'Przygoda', 'fas fa-compass', 'from-amber-500 to-yellow-500', 0, '2025-12-14 04:52:05'),
(11, 'Historia', 'fas fa-scroll', 'from-yellow-600 to-amber-700', 0, '2025-12-14 04:52:05'),
(12, 'Biografia', 'fas fa-user', 'from-teal-500 to-green-500', 0, '2025-12-14 04:52:05'),
(13, 'Poradnik', 'fas fa-lightbulb', 'from-yellow-400 to-orange-400', 0, '2025-12-14 04:52:05'),
(14, 'Poezja', 'fas fa-feather-alt', 'from-purple-400 to-indigo-500', 0, '2025-12-14 04:52:05');

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
(1, 5, 5.00, 'Opoznienie w zwrocie', 'Naliczona', '2025-11-16 21:57:30', NULL),
(6, 6, 5.00, 'Opoznienie w zwrocie', 'Naliczona', '2025-11-16 21:57:30', NULL),
(8, 10, 92072.00, 'Przekroczono termin zwrotu', 'Naliczona', '2025-12-14 02:29:14', NULL);

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
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ksiazki`
--

INSERT INTO `ksiazki` (`KsiazkaId`, `numerISBN`, `Tytul`, `Wydawnictwo`, `Rok`, `LiczbaEgzemplarzy`, `DostepneEgzemplarze`, `IsDeleted`, `DeletedAt`, `DeletedBy`, `CreatedAt`, `UpdatedAt`, `UpdatedBy`) VALUES
(1, '9780000000011', 'Pan Tadeusz', 'PWN', 1834, 2, 1, 0, NULL, NULL, '2025-11-16 21:48:17', NULL, NULL),
(2, '9780000000012', 'Quo Vadis', 'PWN', 1896, 1, 1, 0, NULL, NULL, '2025-11-16 21:48:17', NULL, NULL),
(3, '9780000000013', 'Lalka', 'PWN', 1890, 1, 0, 0, NULL, NULL, '2025-11-16 21:48:17', NULL, NULL),
(4, '9788380081212', 'Misery', 'Prószyński i S-ka', 1987, 3, 0, 0, NULL, NULL, '2025-11-24 14:49:14', NULL, NULL),
(5, '9788380082228', 'Harry Potter i Kamień Filozoficzny', 'Media Rodzina', 1997, 5, 4, 0, NULL, NULL, '2025-11-24 14:49:14', NULL, NULL),
(6, '9788388432000', 'Folwark Zwierzęcy', 'PWN', 1945, 4, 4, 0, NULL, NULL, '2025-11-24 14:49:14', NULL, NULL),
(7, '9788308043210', 'Wiedźmin: Ostatnie Życzenie', 'SuperNOWA', 1993, 3, 3, 0, NULL, NULL, '2025-11-24 14:49:14', NULL, NULL),
(8, '9788308059877', 'Bieguni', 'Wydawnictwo Literackie', 2007, 2, 2, 0, NULL, NULL, '2025-11-24 14:49:14', NULL, NULL),
(9, '9788375782005', 'Czarnoksiężnik z Archipelagu', 'Książnica', 1968, 3, 3, 0, NULL, NULL, '2025-11-24 14:49:14', NULL, NULL),
(10, '9788378391203', 'Z mgły zrodzony', 'MAG', 2006, 4, 3, 0, NULL, NULL, '2025-11-24 14:49:14', NULL, NULL);

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
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `ksiazki_gatunki`
--

CREATE TABLE `ksiazki_gatunki` (
  `KsiazkaGatunekId` int(11) NOT NULL,
  `KsiazkaId` int(11) NOT NULL,
  `GatunekId` int(11) NOT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 'Logowanie', 4, 'Admin zalogowal sie do systemu', 'Uzytkownicy', 4, NULL, NULL, '2025-11-16 21:57:31'),
(2, '', 26, 'Zalogowano', 'Uzytkownicy', 26, NULL, NULL, '2025-12-14 01:51:35'),
(3, '', 27, 'Zalogowano', 'Uzytkownicy', 27, NULL, NULL, '2025-12-14 01:52:41'),
(4, '', 27, 'Zalogowano', 'Uzytkownicy', 27, NULL, NULL, '2025-12-14 02:02:38'),
(5, 'Audyt', 27, 'Dodano nową recenzję', 'Recenzje', 2, NULL, NULL, '2025-12-14 02:15:00'),
(6, 'Audyt', 27, 'Oddano książkę', 'Wypozyczenia', 9, NULL, NULL, '2025-12-14 02:25:02'),
(7, 'Audyt', 27, 'Oddano książkę', 'Wypozyczenia', 5, NULL, NULL, '2025-12-14 02:25:03'),
(8, 'Audyt', 27, 'Oddano książkę', 'Wypozyczenia', 6, NULL, NULL, '2025-12-14 02:25:04'),
(9, '', 27, 'Zalogowano', 'Uzytkownicy', 27, NULL, NULL, '2025-12-14 04:04:12');

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
(1, 1, 6, 5, 'Swietna ksiazka, klasyk!', 'Zatwierdzona', 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2025-11-16 21:57:31'),
(2, 9, 27, 2, 'hmmmm ciekawa', 'Oczekuje', 0, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2025-12-14 02:15:00');

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
-- Struktura tabeli dla tabeli `ulubione`
--

CREATE TABLE `ulubione` (
  `UlubioneId` int(11) NOT NULL,
  `UzytkownikId` int(11) NOT NULL,
  `KsiazkaId` int(11) NOT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `ResetToken` varchar(255) DEFAULT NULL,
  `ResetTokenExpiry` datetime DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `uzytkownicy`
--

INSERT INTO `uzytkownicy` (`UzytkownikId`, `Email`, `HasloHash`, `Imie`, `Nazwisko`, `RolaId`, `Aktywny`, `IsDeleted`, `DeletedAt`, `CreatedAt`, `ResetToken`, `ResetTokenExpiry`, `UpdatedAt`, `UpdatedBy`) VALUES
(4, 'admin@biblioteka.pl', 'haslo_admin', 'Anna', 'Admin', 1, 1, 0, NULL, '2025-11-16 21:48:17', NULL, NULL, NULL, NULL),
(5, 'bibliotekarz@biblioteka.pl', 'haslo_bibl', 'Jan', 'Bibliotekarz', 2, 1, 0, NULL, '2025-11-16 21:48:17', NULL, NULL, NULL, NULL),
(6, 'czytelnik@biblioteka.pl', 'haslo_user', 'Kasia', 'Czytelnik', 3, 1, 0, NULL, '2025-11-16 21:48:17', NULL, NULL, NULL, NULL),
(26, 'admin@admin.pl', '$2b$10$XTngNHBGZwrhJVjvA3K5Ouywsr46X9yRzLTm0HprHJDjB8Dk4tiJC', 'admin', 'admin', 1, 1, 0, NULL, '2025-11-17 02:01:29', NULL, NULL, NULL, NULL),
(27, 'uz@uz.pl', '$2b$10$7se4Hm0IHh.qbdoAIofhqeGS/IHUfTdZ4cq7THBHnpuz09Kjs2jMm', 'uz', 'uz', 3, 1, 0, NULL, '2025-11-24 06:05:27', NULL, NULL, NULL, NULL),
(30, 'biblio@biblio.pl', '$2b$10$mqaazZc/DRUdWp.11yCX.ei0t25zY.NFjkp/km/ntZB7rHywU4l4G', 'Bibilo', 'Biblio', 2, 1, 0, NULL, '2025-11-30 22:53:04', NULL, NULL, NULL, NULL),
(32, 'pati@biblioteq.pl', '$2b$10$HZF/phT3yQQL8qsdGJw2hu0ue0lbnl0Objh6tuP7hPTWUUMnIGqCu', 'Patrycja', 'Wołowicz', 3, 1, 0, NULL, '2025-12-01 03:41:14', NULL, NULL, NULL, NULL),
(33, 'biblio@biblioteq.pl', '$2b$10$Flcm9msiDIcixSuaO39nC.aJpb6SlQyfVbiHFkb9oyfJ55pRZto0m', 'Jan', 'Kowalski', 2, 1, 0, NULL, '2025-12-01 03:47:25', NULL, NULL, NULL, NULL);

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
  `IloscPrzedluzen` int(11) DEFAULT 0,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT 0,
  `DeletedAt` datetime DEFAULT NULL,
  `DeletedBy` int(11) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wypozyczenia`
--

INSERT INTO `wypozyczenia` (`WypozyczenieId`, `UzytkownikId`, `EgzemplarzId`, `DataWypozyczenia`, `TerminZwrotu`, `DataZwrotu`, `Status`, `IloscPrzedluzen`, `UpdatedAt`, `UpdatedBy`, `IsDeleted`, `DeletedAt`, `DeletedBy`, `CreatedAt`) VALUES
(3, 27, 4, '2025-11-24', '2025-12-24', NULL, 'Aktywne', 0, NULL, NULL, 0, NULL, NULL, '2025-11-24 06:51:48'),
(5, 27, 10, '2025-10-13', '2025-11-13', '2025-12-14', '', 0, '2025-12-14 02:25:03', 27, 0, NULL, NULL, '2025-12-01 07:33:01'),
(6, 27, 19, '2025-11-09', '2025-11-28', '2025-12-14', '', 0, '2025-12-14 02:25:04', 27, 0, NULL, NULL, '2025-12-01 07:37:26'),
(9, 27, 6, '2025-12-14', '0000-00-00', '2025-12-14', '', 0, '2025-12-14 02:25:02', 27, 0, NULL, NULL, '2025-12-14 02:07:33'),
(10, 27, 17, '2025-12-14', '0000-00-00', NULL, 'Aktywne', 0, NULL, NULL, 0, NULL, NULL, '2025-12-14 02:20:41');

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
-- Indeksy dla tabeli `ebooki`
--
ALTER TABLE `ebooki`
  ADD PRIMARY KEY (`EbookId`),
  ADD KEY `ebooki_ksiazkaid_index` (`KsiazkaId`),
  ADD KEY `ebooki_createdby_foreign` (`CreatedBy`),
  ADD KEY `ebooki_deletedby_foreign` (`DeletedBy`),
  ADD KEY `ebooki_updatedby_foreign` (`UpdatedBy`);

--
-- Indeksy dla tabeli `egzemplarze`
--
ALTER TABLE `egzemplarze`
  ADD PRIMARY KEY (`EgzemplarzId`),
  ADD UNIQUE KEY `egzemplarze_numerinwentarzowy_unique` (`NumerInwentarzowy`),
  ADD KEY `egzemplarze_ksiazkaid_index` (`KsiazkaId`),
  ADD KEY `egzemplarze_deletedby_foreign` (`DeletedBy`);

--
-- Indeksy dla tabeli `gatunki`
--
ALTER TABLE `gatunki`
  ADD PRIMARY KEY (`GatunekId`),
  ADD UNIQUE KEY `gatunki_nazwa_unique` (`Nazwa`);

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
-- Indeksy dla tabeli `ksiazki_gatunki`
--
ALTER TABLE `ksiazki_gatunki`
  ADD PRIMARY KEY (`KsiazkaGatunekId`),
  ADD UNIQUE KEY `ksiazki_gatunki_unique` (`KsiazkaId`,`GatunekId`),
  ADD KEY `ksiazki_gatunki_ksiazka_index` (`KsiazkaId`),
  ADD KEY `ksiazki_gatunki_gatunek_index` (`GatunekId`);

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
-- Indeksy dla tabeli `ulubione`
--
ALTER TABLE `ulubione`
  ADD PRIMARY KEY (`UlubioneId`),
  ADD UNIQUE KEY `ulubione_unique` (`UzytkownikId`,`KsiazkaId`),
  ADD KEY `ulubione_uzytkownik_index` (`UzytkownikId`),
  ADD KEY `ulubione_ksiazka_index` (`KsiazkaId`);

--
-- Indeksy dla tabeli `uzytkownicy`
--
ALTER TABLE `uzytkownicy`
  ADD PRIMARY KEY (`UzytkownikId`),
  ADD UNIQUE KEY `uzytkownicy_email_unique` (`Email`),
  ADD KEY `uzytkownicy_rolaid_index` (`RolaId`),
  ADD KEY `uzytkownicy_updatedby_foreign` (`UpdatedBy`);

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
  MODIFY `AutorId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `dokumenty`
--
ALTER TABLE `dokumenty`
  MODIFY `DokumentId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `ebooki`
--
ALTER TABLE `ebooki`
  MODIFY `EbookId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `egzemplarze`
--
ALTER TABLE `egzemplarze`
  MODIFY `EgzemplarzId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `gatunki`
--
ALTER TABLE `gatunki`
  MODIFY `GatunekId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `kary`
--
ALTER TABLE `kary`
  MODIFY `KaraId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `ksiazki`
--
ALTER TABLE `ksiazki`
  MODIFY `KsiazkaId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `ksiazki_gatunki`
--
ALTER TABLE `ksiazki_gatunki`
  MODIFY `KsiazkaGatunekId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `logi`
--
ALTER TABLE `logi`
  MODIFY `LogId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `powiadomienia`
--
ALTER TABLE `powiadomienia`
  MODIFY `PowiadomienieId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `recenzje`
--
ALTER TABLE `recenzje`
  MODIFY `RecenzjaId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `RolaId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `ulubione`
--
ALTER TABLE `ulubione`
  MODIFY `UlubioneId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `uzytkownicy`
--
ALTER TABLE `uzytkownicy`
  MODIFY `UzytkownikId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `wypozyczenia`
--
ALTER TABLE `wypozyczenia`
  MODIFY `WypozyczenieId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
-- Constraints for table `ebooki`
--
ALTER TABLE `ebooki`
  ADD CONSTRAINT `ebooki_createdby_foreign` FOREIGN KEY (`CreatedBy`) REFERENCES `uzytkownicy` (`UzytkownikId`) ON DELETE SET NULL,
  ADD CONSTRAINT `ebooki_deletedby_foreign` FOREIGN KEY (`DeletedBy`) REFERENCES `uzytkownicy` (`UzytkownikId`) ON DELETE SET NULL,
  ADD CONSTRAINT `ebooki_ksiazkaid_foreign` FOREIGN KEY (`KsiazkaId`) REFERENCES `ksiazki` (`KsiazkaId`) ON DELETE SET NULL,
  ADD CONSTRAINT `ebooki_updatedby_foreign` FOREIGN KEY (`UpdatedBy`) REFERENCES `uzytkownicy` (`UzytkownikId`) ON DELETE SET NULL;

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
-- Constraints for table `ksiazki_gatunki`
--
ALTER TABLE `ksiazki_gatunki`
  ADD CONSTRAINT `ksiazki_gatunki_gatunek_fk` FOREIGN KEY (`GatunekId`) REFERENCES `gatunki` (`GatunekId`) ON DELETE CASCADE,
  ADD CONSTRAINT `ksiazki_gatunki_ksiazka_fk` FOREIGN KEY (`KsiazkaId`) REFERENCES `ksiazki` (`KsiazkaId`) ON DELETE CASCADE;

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
-- Constraints for table `ulubione`
--
ALTER TABLE `ulubione`
  ADD CONSTRAINT `ulubione_ksiazka_fk` FOREIGN KEY (`KsiazkaId`) REFERENCES `ksiazki` (`KsiazkaId`) ON DELETE CASCADE,
  ADD CONSTRAINT `ulubione_uzytkownik_fk` FOREIGN KEY (`UzytkownikId`) REFERENCES `uzytkownicy` (`UzytkownikId`) ON DELETE CASCADE;

--
-- Constraints for table `uzytkownicy`
--
ALTER TABLE `uzytkownicy`
  ADD CONSTRAINT `uzytkownicy_rolaid_foreign` FOREIGN KEY (`RolaId`) REFERENCES `role` (`RolaId`),
  ADD CONSTRAINT `uzytkownicy_updatedby_foreign` FOREIGN KEY (`UpdatedBy`) REFERENCES `uzytkownicy` (`UzytkownikId`) ON DELETE SET NULL;

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
