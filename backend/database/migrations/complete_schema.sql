-- Marina Bay Sands - Comprehensive & Standardized Schema (Sync with Seed & Controllers)
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `phone` VARCHAR(15) UNIQUE NOT NULL,
  `name_user` VARCHAR(50) UNIQUE,
  `name_real` VARCHAR(100),
  `password` VARCHAR(100) NOT NULL,
  `password_v2` VARCHAR(100) DEFAULT NULL,
  `money` DECIMAL(15,2) DEFAULT 0.00,
  `money_bet_total` DECIMAL(15,2) DEFAULT 0.00,
  `level` INT DEFAULT 0,
  `code` VARCHAR(20) UNIQUE,
  `invite` VARCHAR(20),
  `role` ENUM('user', 'admin', 'agent', 'super_admin', 'dev', 'sale', 'ctv') DEFAULT 'user',
  `status` TINYINT DEFAULT 1 COMMENT '1: active, 2: locked',
  `avatar` VARCHAR(255) DEFAULT '/uploads/avatar/default.png',
  `created_at` BIGINT,
  `updated_at` BIGINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Game Rooms
CREATE TABLE IF NOT EXISTS `game_rooms` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `game_id` VARCHAR(50) UNIQUE NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `type` VARCHAR(20) NOT NULL COMMENT 'wingo, k3, 5d',
  `cycle_seconds` INT NOT NULL DEFAULT 60,
  `bet_close_seconds` INT DEFAULT 15,
  `odds` JSON DEFAULT NULL,
  `status` TINYINT DEFAULT 1,
  `created_at` BIGINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Game Sessions
CREATE TABLE IF NOT EXISTS `game_sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `room_id` INT NOT NULL,
  `period` VARCHAR(20) NOT NULL,
  `result` JSON DEFAULT NULL,
  `status` TINYINT DEFAULT 0 COMMENT '0: open, 1: locked, 2: finished',
  `total_payout` DECIMAL(20, 2) DEFAULT 0,
  `start_time` BIGINT NOT NULL,
  `end_time` BIGINT NOT NULL,
  `created_at` BIGINT,
  FOREIGN KEY (`room_id`) REFERENCES `game_rooms`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Bets
CREATE TABLE IF NOT EXISTS `bets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `session_id` INT NOT NULL,
  `period` VARCHAR(20),
  `room_id` INT NOT NULL,
  `bet_value` VARCHAR(20) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `odds` DECIMAL(10, 2) DEFAULT 1.98,
  `win_amount` DECIMAL(15,2) DEFAULT 0.00,
  `status` TINYINT DEFAULT 0 COMMENT '0: pending, 1: win, 2: loss, 3: cancelled',
  `time` BIGINT NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`session_id`) REFERENCES `game_sessions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Recharge
CREATE TABLE IF NOT EXISTS `recharge` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_order` VARCHAR(50) UNIQUE NOT NULL,
  `phone` VARCHAR(15) NOT NULL,
  `money` DECIMAL(15,2) NOT NULL,
  `type` VARCHAR(20) DEFAULT 'bank',
  `status` TINYINT DEFAULT 0,
  `today` DATE NOT NULL,
  `time` BIGINT NOT NULL,
  `proof_image` VARCHAR(255),
  `proof_note` TEXT,
  `updated_at` BIGINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Withdraw
CREATE TABLE IF NOT EXISTS `withdraw` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_order` VARCHAR(50) UNIQUE NOT NULL,
  `phone` VARCHAR(15) NOT NULL,
  `money` DECIMAL(15,2) NOT NULL,
  `gross_amount` DECIMAL(15,2) NOT NULL,
  `receive_amount` DECIMAL(15,2) NOT NULL,
  `fee` DECIMAL(15,2) DEFAULT 0.00,
  `type` VARCHAR(20) DEFAULT 'bank',
  `status` TINYINT DEFAULT 0,
  `today` DATE NOT NULL,
  `time` BIGINT NOT NULL,
  `updated_at` BIGINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Chat Conversations
CREATE TABLE IF NOT EXISTS `chat_conversations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNIQUE NOT NULL,
  `user_name` VARCHAR(50),
  `user_phone` VARCHAR(15),
  `last_message` TEXT,
  `last_message_time` BIGINT,
  `has_unread_user_messages` BOOLEAN DEFAULT FALSE,
  `updated_at` BIGINT,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Chat Messages
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` INT NOT NULL,
  `sender_id` INT NOT NULL,
  `sender_role` ENUM('user', 'admin') NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` BIGINT NOT NULL,
  FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Daily Stats
CREATE TABLE IF NOT EXISTS `daily_stats` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `stat_date` DATE NOT NULL,
  `total_bet` DECIMAL(15,2) DEFAULT 0.00,
  `total_win` DECIMAL(15,2) DEFAULT 0.00,
  UNIQUE KEY `idx_user_date` (`user_id`, `stat_date`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Banks
CREATE TABLE IF NOT EXISTS `banks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `bin` VARCHAR(10) NOT NULL,
  `logo` VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. User Banks
CREATE TABLE IF NOT EXISTS `user_banks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `bank_name` VARCHAR(100) NOT NULL,
  `account_number` VARCHAR(50) NOT NULL,
  `account_name` VARCHAR(100) NOT NULL,
  `branch` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `type` ENUM('all', 'user', 'system') DEFAULT 'all',
  `user_id` INT DEFAULT NULL,
  `status` TINYINT DEFAULT 1,
  `created_at` BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. VIP Levels
CREATE TABLE IF NOT EXISTS `vip_levels` (
  `id` INT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `min_bet` DECIMAL(15,2) DEFAULT 0.00,
  `reward_recharge` DECIMAL(5,2) DEFAULT 0.00,
  `reward_daily` DECIMAL(15,2) DEFAULT 0.00,
  `created_at` BIGINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
