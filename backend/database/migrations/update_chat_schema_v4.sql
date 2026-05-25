-- Migration to update chat tables for guest support and more roles
SET FOREIGN_KEY_CHECKS = 0;

-- Update chat_conversations table
ALTER TABLE `chat_conversations` 
  MODIFY COLUMN `user_id` INT DEFAULT NULL,
  ADD COLUMN `guest_id` VARCHAR(100) DEFAULT NULL AFTER `user_id`,
  ADD UNIQUE INDEX `idx_guest_id` (`guest_id`);

-- Update chat_messages table
ALTER TABLE `chat_messages` 
  MODIFY COLUMN `sender_id` INT DEFAULT NULL,
  MODIFY COLUMN `sender_role` ENUM('user', 'admin', 'guest') NOT NULL;

SET FOREIGN_KEY_CHECKS = 1;
