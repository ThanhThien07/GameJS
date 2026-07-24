-- ===================================================
-- SCHEMA CƠ SỞ DỮ LIỆU MYSQL CHO GAME TAP TAP CLICKER
-- Hỗ trợ lưu trữ thông tin người chơi, Trùng sinh, Bảng xếp hạng
-- ===================================================

CREATE DATABASE IF NOT EXISTS `clicker_game` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `clicker_game`;

-- 1. BẢNG NGƯỜI CHƠI (PLAYERS) - Lưu tiến trình chơi offline/online
CREATE TABLE IF NOT EXISTS `players` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `player_name` VARCHAR(50) NOT NULL UNIQUE,
  `money` BIGINT DEFAULT 0,
  `dpc` INT DEFAULT 1,
  `dps` INT DEFAULT 0,
  `soul_crystals` INT DEFAULT 0,
  `total_clicks` BIGINT DEFAULT 0,
  `total_gold_earned` BIGINT DEFAULT 0,
  `rebirth_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BẢNG BẢNG XẾP HẠNG (LEADERBOARD) - Lưu điểm cao nhất các trận đấu
CREATE TABLE IF NOT EXISTS `leaderboard` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `player_name` VARCHAR(50) NOT NULL,
  `score` BIGINT NOT NULL,
  `clicks` INT DEFAULT 0,
  `game_mode` ENUM('competitive', 'coop', 'offline') DEFAULT 'competitive',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BẢNG PHÒNG GAME (GAME_ROOMS) - Lịch sử các phòng đấu online
CREATE TABLE IF NOT EXISTS `game_rooms` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `room_code` VARCHAR(10) NOT NULL,
  `mode` VARCHAR(20) NOT NULL,
  `status` VARCHAR(20) DEFAULT 'finished',
  `player_count` INT DEFAULT 1,
  `winner_name` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MẪU DỮ LIỆU BAN ĐẦU (SEED DATA)
INSERT INTO `players` (`player_name`, `money`, `dpc`, `dps`, `soul_crystals`, `total_clicks`, `total_gold_earned`, `rebirth_count`)
VALUES 
  ('Nguyễn Hoàng Hùng', 150000, 15, 50, 2, 1250, 300000, 2),
  ('SuperClicker_AI', 80000, 10, 25, 1, 800, 120000, 1),
  ('IronFinger_Bot', 50000, 8, 15, 0, 500, 75000, 0)
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

INSERT INTO `leaderboard` (`player_name`, `score`, `clicks`, `game_mode`)
VALUES 
  ('Nguyễn Hoàng Hùng', 150000, 450, 'competitive'),
  ('SuperClicker_AI', 98000, 320, 'competitive'),
  ('IronFinger_Bot', 45000, 210, 'competitive');
