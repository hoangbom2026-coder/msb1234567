-- Migration: profit_schedule
-- Lưu cấu hình tỷ lệ house edge động theo phòng + khung giờ + ngày trong tuần.
-- house_edge_percent: 0 = kết quả hoàn toàn ngẫu nhiên, 100 = luôn chọn kết quả bất lợi nhất cho người chơi.

CREATE TABLE IF NOT EXISTS profit_schedule (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    room_id         INT NOT NULL,                        -- FK → game_rooms.id
    day_of_week     TINYINT UNSIGNED NOT NULL DEFAULT 7, -- 0=Chủ nhật … 6=Thứ 7, 7=Tất cả các ngày
    hour_from       TINYINT UNSIGNED NOT NULL DEFAULT 0, -- 0-23, giờ bắt đầu (inclusive, server UTC)
    hour_to         TINYINT UNSIGNED NOT NULL DEFAULT 23,-- 0-23, giờ kết thúc (inclusive, server UTC)
    house_edge_percent TINYINT UNSIGNED NOT NULL DEFAULT 70 CHECK (house_edge_percent BETWEEN 0 AND 100),
    note            VARCHAR(255) DEFAULT NULL,           -- ghi chú cho admin (ví dụ: "Giờ cao điểm tối")
    is_active       TINYINT(1) NOT NULL DEFAULT 1,
    created_by      INT DEFAULT NULL,                    -- admin user id
    created_at      BIGINT NOT NULL,
    updated_at      BIGINT NOT NULL,
    INDEX idx_room_day_hour (room_id, day_of_week, hour_from, hour_to),
    CONSTRAINT fk_ps_room FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed: mặc định 70% cho tất cả phòng, tất cả giờ, tất cả ngày
-- Thêm một dòng per phòng khi system khởi động lần đầu (handled in code), 
-- hoặc chạy tay sau khi có danh sách room_id cụ thể.
-- Ví dụ seed cho room id=1:
-- INSERT INTO profit_schedule (room_id, day_of_week, hour_from, hour_to, house_edge_percent, note, is_active, created_at, updated_at)
-- VALUES (1, 7, 0, 23, 70, 'Mặc định', 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000);
