-- Migration: Add version column for optimistic locking
-- Purpose: Prevent race conditions on concurrent updates

ALTER TABLE `users` ADD COLUMN `version` INT DEFAULT 0 COMMENT 'Version number for optimistic locking' AFTER `updated_at`;

-- Add transaction log table
CREATE TABLE IF NOT EXISTS `transaction_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `type` VARCHAR(20) NOT NULL COMMENT 'recharge, withdraw, bet, win',
  `user_id` INT,
  `phone` VARCHAR(15),
  `amount` DECIMAL(15,2),
  `order_id` VARCHAR(50),
  `status` VARCHAR(20) NOT NULL COMMENT 'pending, success, failed',
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `timestamp_unix` BIGINT,
  `description` TEXT,
  `extra_data` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_date (user_id, created_at),
  INDEX idx_type_status (type, status),
  INDEX idx_timestamp (timestamp_unix)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Transaction audit log';

-- Add indexes for better query performance
CREATE INDEX idx_withdraw_phone_status ON `withdraw` (phone, status);
CREATE INDEX idx_recharge_phone_status ON `recharge` (phone, status);
CREATE INDEX idx_bets_user_speed ON `bets` (user_id, status);
