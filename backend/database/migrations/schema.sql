-- Marina Bay Sands - Comprehensive User & Finance Schema
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Table users (Nâng cấp UID và VIP)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `uid` INT UNIQUE NOT NULL, -- UID hiển thị (vd: 256)
  `phone` VARCHAR(15) UNIQUE NOT NULL,
  `name_user` VARCHAR(50) UNIQUE,
  `name_real` VARCHAR(100),
  `password` VARCHAR(100) NOT NULL,
  `password_v2` VARCHAR(100) DEFAULT NULL, -- Mật khẩu thanh toán
  `money` DECIMAL(15,2) DEFAULT 0.00,
  `money_bet_total` DECIMAL(15,2) DEFAULT 0.00, -- Tổng tham gia  trọn đời để lên VIP
  `level` INT DEFAULT 0, -- Cấp VIP
  `code` VARCHAR(20) UNIQUE,
  `invite` VARCHAR(20),
  `role` ENUM('user', 'admin', 'agent', 'super_admin') DEFAULT 'user',
  `status` TINYINT DEFAULT 1,
  `created_at` BIGINT,
  `updated_at` BIGINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table daily_stats (Thống kê lãi lỗ hôm nay hiển thị trên Profile)
CREATE TABLE IF NOT EXISTS `daily_stats` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `stat_date` DATE NOT NULL,
  `total_bet` DECIMAL(15,2) DEFAULT 0.00,
  `total_win` DECIMAL(15,2) DEFAULT 0.00,
  UNIQUE KEY `idx_user_date` (`user_id`, `stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table vip_configs (Cấu hình mốc lên VIP)
CREATE TABLE IF NOT EXISTS `vip_configs` (
  `level` INT PRIMARY KEY,
  `min_bet` DECIMAL(15,2) NOT NULL,
  `reward` DECIMAL(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Giữ lại các bảng cũ nhưng đảm bảo tính nhất quán (bets, recharge, withdraw...)
-- (Đã được chuẩn hóa ở bước trước)

SET FOREIGN_KEY_CHECKS = 1;
