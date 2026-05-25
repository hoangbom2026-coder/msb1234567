
-- This script sets up the necessary tables for bank information.
-- It should be run once on your MySQL database.

-- 1. Create the `user_banks` table to store bank accounts linked by users.
CREATE TABLE IF NOT EXISTS `user_banks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL COMMENT 'Link to the users table',
  `bank_name` VARCHAR(100) NOT NULL COMMENT 'e.g., Vietcombank, MB Bank',
  `account_number` VARCHAR(50) NOT NULL COMMENT 'The bank account number',
  `account_name` VARCHAR(100) NOT NULL COMMENT 'Account holder name (uppercase, no accents)',
  `branch` VARCHAR(100) DEFAULT NULL COMMENT 'Branch (optional)',
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create the `banks` table to store a list of supported Vietnamese banks.
CREATE TABLE IF NOT EXISTS `banks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `bin` varchar(10) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Insert the list of Vietnamese banks into the `banks` table.
-- Using INSERT IGNORE to prevent errors if the script is run multiple times.
INSERT IGNORE INTO `banks` (`name`, `code`, `bin`, `logo`) VALUES
('Ngân hàng Thương mại Cổ phần Á Châu', 'ACB', '970416', 'https://api.vietqr.io/img/ACB.png'),
('Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam', 'Agribank', '970405', 'https://api.vietqr.io/img/AGRIBANK.png'),
('Ngân hàng TMCP An Bình', 'ABBANK', '970425', 'https://api.vietqr.io/img/ABBANK.png'),
('Ngân hàng TMCP Bảo Việt', 'BAOVIETBANK', '970449', 'https://api.vietqr.io/img/BAOVIETBANK.png'),
('Ngân hàng Đầu tư và Phát triển Việt Nam', 'BIDV', '970418', 'https://api.vietqr.io/img/BIDV.png'),
('Ngân hàng TNHH MTV Dầu Khí Toàn Cầu', 'GPBANK', '970408', 'https://api.vietqr.io/img/GPBANK.png'),
('Ngân hàng TMCP Đông Á', 'DONGABANK', '970406', 'https://api.vietqr.io/img/DONGABANK.png'),
('Ngân hàng TMCP Xuất Nhập khẩu Việt Nam', 'EXIMBANK', '970431', 'https://api.vietqr.io/img/EXIMBANK.png'),
('Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh', 'HDBANK', '970437', 'https://api.vietqr.io/img/HDBANK.png'),
('Ngân hàng TNHH Indovina', 'IVB', '970434', 'https://api.vietqr.io/img/IVB.png'),
('Ngân hàng TMCP Kiên Long', 'KIENLONGBANK', '970452', 'https://api.vietqr.io/img/KIENLONGBANK.png'),
('Ngân hàng TMCP Bưu Điện Liên Việt', 'LIENVIETPOSTBANK', '970449', 'https://api.vietqr.io/img/LIENVIETPOSTBANK.png'),
('Ngân hàng TMCP Quân đội', 'MBBANK', '970422', 'https://api.vietqr.io/img/MBBANK.png'),
('Ngân hàng TMCP Hàng hải Việt Nam', 'MSB', '970426', 'https://api.vietqr.io/img/MSB.png'),
('Ngân hàng TMCP Nam Á', 'NAMABANK', '970428', 'https://api.vietqr.io/img/NAMABANK.png'),
('Ngân hàng TMCP Quốc Dân', 'NCB', '970419', 'https://api.vietqr.io/img/NCB.png'),
('Ngân hàng TNHH MTV Đại Dương', 'OCEANBANK', '970414', 'https://api.vietqr.io/img/OCEANBANK.png'),
('Ngân hàng TMCP Phương Đông', 'OCB', '970448', 'https://api.vietqr.io/img/OCB.png'),
('Ngân hàng TMCP Xăng dầu Petrolimex', 'PGBANK', '970430', 'https://api.vietqr.io/img/PGBANK.png'),
('Ngân hàng TMCP Đại Chúng Việt Nam', 'PVCOMBANK', '970412', 'https://api.vietqr.io/img/PVCOMBANK.png'),
('Ngân hàng TMCP Sài Gòn', 'SCB', '970429', 'https://api.vietqr.io/img/SCB.png'),
('Ngân hàng TMCP Đông Nam Á', 'SEABANK', '970440', 'https://api.vietqr.io/img/SEABANK.png'),
('Ngân hàng TMCP Sài Gòn - Hà Nội', 'SHB', '970443', 'https://api.vietqr.io/img/SHB.png'),
('Ngân hàng TMCP Sài Gòn Công Thương', 'SAIGONBANK', '970400', 'https://api.vietqr.io/img/SAIGONBANK.png'),
('Ngân hàng TMCP Sài Gòn Thương Tín', 'SACOMBANK', '970403', 'https://api.vietqr.io/img/SACOMBANK.png'),
('Ngân hàng TMCP Kỹ Thương Việt Nam', 'TCB', '970407', 'https://api.vietqr.io/img/TCB.png'),
('Ngân hàng TMCP Tiên Phong', 'TPBANK', '970423', 'https://api.vietqr.io/img/TPBANK.png'),
('Ngân hàng TMCP Việt Á', 'VIETABANK', '970427', 'https://api.vietqr.io/img/VIETABANK.png'),
('Ngân hàng TMCP Bản Việt', 'VIETCAPITALBANK', '970454', 'https://api.vietqr.io/img/VIETCAPITALBANK.png'),
('Ngân hàng TMCP Công thương Việt Nam', 'VIETINBANK', '970415', 'https://api.vietqr.io/img/VIETINBANK.png'),
('Ngân hàng Ngoại thương Việt Nam', 'VIETCOMBANK', '970436', 'https://api.vietqr.io/img/VIETCOMBANK.png'),
('Ngân hàng TMCP Việt Nam Thịnh Vượng', 'VPBANK', '970432', 'https://api.vietqr.io/img/VPBANK.png'),
('Ngân hàng TMCP Quốc Tế Việt Nam', 'VIB', '970441', 'https://api.vietqr.io/img/VIB.png');

-- 4. Create the `notifications` table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `type` ENUM('all', 'user', 'system') DEFAULT 'all',
  `user_id` INT DEFAULT NULL,
  `status` TINYINT DEFAULT 1 COMMENT '1: active/unread, 2: read',
  `created_at` BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create the `vip_levels` table
CREATE TABLE IF NOT EXISTS `vip_levels` (
  `id` INT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `min_bet` DECIMAL(15,2) DEFAULT 0.00,
  `reward_recharge` DECIMAL(5,2) DEFAULT 0.00,
  `reward_daily` DECIMAL(15,2) DEFAULT 0.00,
  `created_at` BIGINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Insert initial VIP levels
INSERT IGNORE INTO `vip_levels` (`id`, `name`, `min_bet`, `reward_recharge`, `reward_daily`, `created_at`) VALUES
(0, 'VIP 0', 0.00, 0.00, 0.00, 1700000000000),
(1, 'VIP 1', 1000000.00, 0.50, 1000.00, 1700000000000),
(2, 'VIP 2', 5000000.00, 1.00, 5000.00, 1700000000000),
(3, 'VIP 3', 20000000.00, 1.50, 20000.00, 1700000000000),
(4, 'VIP 4', 100000000.00, 2.00, 50000.00, 1700000000000),
(5, 'VIP 5', 500000000.00, 3.00, 200000.00, 1700000000000);

