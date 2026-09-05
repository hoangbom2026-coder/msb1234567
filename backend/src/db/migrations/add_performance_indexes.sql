-- Performance indexes — safe to re-run (skips existing indexes via PROCEDURE).
-- MySQL 8.0: CREATE INDEX IF NOT EXISTS syntax requires ALTER TABLE workaround.

-- bets: look up by period (scheduler + admin history queries)
-- (idx_bets_user_id already exists; idx_bets_session_id already exists)
SET @exist := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE table_schema = DATABASE() AND table_name = 'bets' AND index_name = 'idx_bets_period'
);
SET @sql := IF(@exist = 0,
  'CREATE INDEX idx_bets_period ON bets (period)',
  'SELECT ''idx_bets_period already exists'''
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- bets: combined index for per-user history ordered by time
SET @exist := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE table_schema = DATABASE() AND table_name = 'bets' AND index_name = 'idx_bets_user_time'
);
SET @sql := IF(@exist = 0,
  'CREATE INDEX idx_bets_user_time ON bets (user_id, time DESC)',
  'SELECT ''idx_bets_user_time already exists'''
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- game_sessions: status + end_time used by scheduler every second
-- (idx_game_sessions_status already exists but is single-column; add composite)
SET @exist := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE table_schema = DATABASE() AND table_name = 'game_sessions' AND index_name = 'idx_sessions_status_end'
);
SET @sql := IF(@exist = 0,
  'CREATE INDEX idx_sessions_status_end ON game_sessions (status, end_time ASC)',
  'SELECT ''idx_sessions_status_end already exists'''
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- game_sessions: room_id + status (scheduler filters by room then status)
SET @exist := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE table_schema = DATABASE() AND table_name = 'game_sessions' AND index_name = 'idx_sessions_room_status'
);
SET @sql := IF(@exist = 0,
  'CREATE INDEX idx_sessions_room_status ON game_sessions (room_id, status)',
  'SELECT ''idx_sessions_room_status already exists'''
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- users: created_at used for "new users today" dashboard query
SET @exist := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'idx_users_created_at'
);
SET @sql := IF(@exist = 0,
  'CREATE INDEX idx_users_created_at ON users (created_at)',
  'SELECT ''idx_users_created_at already exists'''
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT 'All performance indexes applied.' AS result;
