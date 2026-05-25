CREATE TABLE IF NOT EXISTS `system_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `config_key` VARCHAR(50) UNIQUE NOT NULL,
  `config_value` TEXT,
  `description` VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `admin_id` INT,
  `action` VARCHAR(255),
  `target` VARCHAR(255),
  `details` JSON,
  `ip_address` VARCHAR(45),
  `created_at` BIGINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`) VALUES 
('site_name', 'MARINA BAY SANDS', 'Tên hiển thị website'),
('telegram_support', 'https://t.me/mbs_support', 'Link hỗ trợ'),
('min_withdraw', '100000', 'Tiền rút tối thiểu'),
('base_odds_common', '1.98', 'Default common odds for games');

-- K3 Game Specific Odds (standardized with frontend betting codes)
INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`) VALUES 
-- Common K3 Bets
('k3_b_odds', '1.98', 'K3 Big odds'),
('k3_s_odds', '1.98', 'K3 Small odds'),
('k3_l_odds', '1.98', 'K3 Odd odds'),
('k3_c_odds', '1.98', 'K3 Even odds'),
('k3_rong_odds', '1.98', 'K3 Dragon odds (Ball 1 > Ball 3)'),
('k3_ho_odds', '1.98', 'K3 Tiger odds (Ball 1 < Ball 3)');

INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`) VALUES 
-- Individual Ball Position Bets (e.g., pos-1 for value 1 in a specific ball)
('k3_pos_1_odds', '1.98', 'K3 Position 1 odds'),
('k3_pos_2_odds', '1.98', 'K3 Position 2 odds'),
('k3_pos_3_odds', '1.98', 'K3 Position 3 odds'),
('k3_pos_4_odds', '1.98', 'K3 Position 4 odds'),
('k3_pos_5_odds', '1.98', 'K3 Position 5 odds'),
('k3_pos_6_odds', '1.98', 'K3 Position 6 odds');

INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`) VALUES 
-- Sum Number Bets (3 to 18)
('k3_sum_3_odds', '188.00', 'K3 Sum 3 odds'),
('k3_sum_4_odds', '60.00', 'K3 Sum 4 odds'),
('k3_sum_5_odds', '30.00', 'K3 Sum 5 odds'),
('k3_sum_6_odds', '18.00', 'K3 Sum 6 odds'),
('k3_sum_7_odds', '12.00', 'K3 Sum 7 odds'),
('k3_sum_8_odds', '8.00', 'K3 Sum 8 odds'),
('k3_sum_9_odds', '6.00', 'K3 Sum 9 odds'),
('k3_sum_10_odds', '5.50', 'K3 Sum 10 odds'),
('k3_sum_11_odds', '5.50', 'K3 Sum 11 odds'),
('k3_sum_12_odds', '6.00', 'K3 Sum 12 odds'),
('k3_sum_13_odds', '8.00', 'K3 Sum 13 odds'),
('k3_sum_14_odds', '12.00', 'K3 Sum 14 odds'),
('k3_sum_15_odds', '18.00', 'K3 Sum 15 odds'),
('k3_sum_16_odds', '30.00', 'K3 Sum 16 odds'),
('k3_sum_17_odds', '60.00', 'K3 Sum 17 odds'),
('k3_sum_18_odds', '188.00', 'K3 Sum 18 odds');

INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`) VALUES 
-- Same Number (Pairs) - for any two dice matching
('k3_triple_1_odds', '12.00', 'K3 Triple 1 odds (any pair of 1s)'),
('k3_triple_2_odds', '12.00', 'K3 Triple 2 odds (any pair of 2s)'),
('k3_triple_3_odds', '12.00', 'K3 Triple 3 odds (any pair of 3s)'),
('k3_triple_4_odds', '12.00', 'K3 Triple 4 odds (any pair of 4s)'),
('k3_triple_5_odds', '12.00', 'K3 Triple 5 odds (any pair of 5s)'),
('k3_triple_6_odds', '12.00', 'K3 Triple 6 odds (any pair of 6s)');

INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`) VALUES 
-- Consecutive Yards (Specific Triples) - all three dice matching
('k3_consecutive_1_odds', '188.00', 'K3 Consecutive 1 odds (1,1,1)'),
('k3_consecutive_2_odds', '188.00', 'K3 Consecutive 2 odds (2,2,2)'),
('k3_consecutive_3_odds', '188.00', 'K3 Consecutive 3 odds (3,3,3)'),
('k3_consecutive_4_odds', '188.00', 'K3 Consecutive 4 odds (4,4,4)'),
('k3_consecutive_5_odds', '188.00', 'K3 Consecutive 5 odds (5,5,5)'),
('k3_consecutive_6_odds', '188.00', 'K3 Consecutive 6 odds (6,6,6)');
