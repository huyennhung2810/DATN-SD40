-- ============================================================
-- MIGRATION: Tech Spec Group & Definition System
-- Run this script to create new tables and seed initial data
-- ============================================================

-- --------------------------------------------------
-- 1. Create tech_spec_group table
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS tech_spec_group (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    display_order INT DEFAULT 0,
    status INT DEFAULT 0,
    created_date BIGINT,
    last_modified_date BIGINT
);

-- --------------------------------------------------
-- 2. Create tech_spec_definition table
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS tech_spec_definition (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    id_tech_spec_group VARCHAR(36),
    data_type VARCHAR(20),
    unit VARCHAR(50),
    is_filterable INT DEFAULT 0,
    is_required INT DEFAULT 0,
    display_order INT DEFAULT 0,
    status INT DEFAULT 0,
    created_date BIGINT,
    last_modified_date BIGINT,
    CONSTRAINT fk_def_group FOREIGN KEY (id_tech_spec_group) REFERENCES tech_spec_group(id) ON DELETE SET NULL
);

-- --------------------------------------------------
-- 3. Create tech_spec_value table
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS tech_spec_value (
    id VARCHAR(36) PRIMARY KEY,
    id_product VARCHAR(36),
    id_tech_spec_definition VARCHAR(36),
    value_text VARCHAR(500),
    value_number DOUBLE,
    value_boolean INT,
    value_min DOUBLE,
    value_max DOUBLE,
    display_value VARCHAR(500),
    created_date BIGINT,
    last_modified_date BIGINT,
    CONSTRAINT fk_value_product FOREIGN KEY (id_product) REFERENCES product(id) ON DELETE CASCADE,
    CONSTRAINT fk_value_def FOREIGN KEY (id_tech_spec_definition) REFERENCES tech_spec_definition(id) ON DELETE CASCADE
);

-- ============================================================
-- SEED DATA: Tech Spec Groups
-- status: 0 = ACTIVE, 1 = INACTIVE
-- ============================================================

INSERT INTO tech_spec_group (id, code, name, description, display_order, status, created_date, last_modified_date)
VALUES
('grp-001-sensor-image', 'sensor-image', 'Cảm biến & Chất lượng ảnh', 'Các thông số liên quan đến cảm biến, độ phân giải và chất lượng hình ảnh', 1, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000),
('grp-002-lens-focus', 'lens-focus', 'Ống kính & Lấy nét', 'Các thông số liên quan đến ngàm lens, hệ thống lấy nét và tốc độ chụp', 2, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000),
('grp-003-video', 'video', 'Video', 'Các thông số liên quan đến khả năng quay phim', 3, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000),
('grp-004-screen-viewfinder', 'screen-viewfinder', 'Màn hình & Kính ngắm', 'Các thông số liên quan đến màn hình hiển thị và kính ngắm', 4, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000),
('grp-005-battery-storage', 'battery-storage-connectivity', 'Pin, lưu trữ & Kết nối', 'Các thông số liên quan đến pin, thẻ nhớ và cổng kết nối', 5, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000),
('grp-006-body-build', 'body-build', 'Thân máy & Hoàn thiện', 'Các thông số liên quan đến thân máy, trọng lượng và khả năng chống thời tiết', 6, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ============================================================
-- SEED DATA: Tech Spec Definitions
-- data_type: TEXT, NUMBER, BOOLEAN, ENUM, RANGE
-- is_filterable: 1 = có thể dùng lọc, 0 = không
-- is_required: 1 = bắt buộc, 0 = không bắt buộc
-- status: 0 = ACTIVE, 1 = INACTIVE
-- ============================================================

-- === GROUP A: Cảm biến & Chất lượng ảnh ===

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-sensor-size', 'sensor_size', 'Kích thước cảm biến', 'Kích thước vật lý của cảm biến hình ảnh', 'grp-001-sensor-image', 'TEXT', 'mm', 1, 0, 1, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-sensor-type', 'sensor_type', 'Loại cảm biến', 'Công nghệ cảm biến (CMOS, BSI-CMOS, X-Trans...)', 'grp-001-sensor-image', 'ENUM', NULL, 1, 0, 2, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-resolution', 'resolution_mp', 'Độ phân giải', 'Số megapixel hiệu dụng của cảm biến', 'grp-001-sensor-image', 'NUMBER', 'MP', 1, 0, 3, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-iso-standard', 'iso_standard', 'ISO chuẩn', 'Dải ISO tiêu chuẩn của máy', 'grp-001-sensor-image', 'RANGE', NULL, 0, 0, 4, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-iso-extended', 'iso_extended', 'ISO mở rộng', 'Dải ISO mở rộng (thường từ menu)', 'grp-001-sensor-image', 'RANGE', NULL, 0, 0, 5, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-processor', 'image_processor', 'Bộ xử lý ảnh', 'Tên/chip xử lý hình ảnh của máy', 'grp-001-sensor-image', 'TEXT', NULL, 0, 0, 6, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-ibis', 'ibis', 'Chống rung thân máy (IBIS)', 'Có hay không có hệ thống chống rung tích hợp trong thân máy', 'grp-001-sensor-image', 'BOOLEAN', NULL, 0, 0, 7, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- === GROUP B: Ống kính & Lấy nét ===

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-lens-mount', 'lens_mount', 'Mount ống kính', 'Loại ngàm gắn ống kính của máy', 'grp-002-lens-focus', 'TEXT', NULL, 1, 0, 1, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-af-system', 'af_system', 'Hệ thống lấy nét', 'Loại hệ thống lấy nét tự động', 'grp-002-lens-focus', 'TEXT', NULL, 0, 0, 2, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-af-points', 'af_points', 'Số điểm lấy nét', 'Tổng số điểm AF của hệ thống lấy nét', 'grp-002-lens-focus', 'NUMBER', 'điểm', 1, 0, 3, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-eye-af', 'eye_af', 'Eye AF', 'Có hỗ trợ lấy nét theo mắt người/cảnh vật', 'grp-002-lens-focus', 'BOOLEAN', NULL, 0, 0, 4, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-tracking-af', 'tracking_af', 'Tracking AF', 'Có hỗ trợ theo dõi đối tượng chuyển động', 'grp-002-lens-focus', 'BOOLEAN', NULL, 0, 0, 5, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-burst-fps', 'burst_fps', 'Tốc độ chụp liên tiếp', 'Số khung hình/giây khi chụp liên tiếp', 'grp-002-lens-focus', 'NUMBER', 'fps', 1, 0, 6, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- === GROUP C: Video ===

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-video-resolution', 'video_max_resolution', 'Độ phân giải video tối đa', 'Độ phân giải cao nhất máy có thể quay', 'grp-003-video', 'ENUM', NULL, 1, 0, 1, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-video-fps', 'video_max_fps', 'FPS tối đa', 'Số khung hình/giây tối đa khi quay video', 'grp-003-video', 'NUMBER', 'fps', 1, 0, 2, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-slow-motion', 'slow_motion', 'Slow motion', 'Có hỗ trợ quay chậm hay không, ở độ phân giải nào', 'grp-003-video', 'TEXT', NULL, 0, 0, 3, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-log-profile', 'log_profile', 'Log profile', 'Profile log hỗ trợ (S-Log, F-Log, D-Log...)', 'grp-003-video', 'ENUM', NULL, 0, 0, 4, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-video-format', 'video_format', 'Định dạng video', 'Các định dạng video hỗ trợ (H.265, H.264, ProRes...)', 'grp-003-video', 'TEXT', NULL, 0, 0, 5, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- === GROUP D: Màn hình & Kính ngắm ===

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-screen-size', 'screen_size', 'Kích thước màn hình', 'Kích thước màn hình LCD phía sau', 'grp-004-screen-viewfinder', 'NUMBER', 'inch', 0, 0, 1, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-touchscreen', 'touchscreen', 'Màn hình cảm ứng', 'Có hỗ trợ cảm ứng hay không', 'grp-004-screen-viewfinder', 'BOOLEAN', NULL, 0, 0, 2, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-articulating', 'articulating_screen', 'Màn hình xoay lật', 'Loại cơ chế xoay/lật màn hình', 'grp-004-screen-viewfinder', 'ENUM', NULL, 0, 0, 3, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-evf-type', 'viewfinder_type', 'Loại viewfinder', 'Loại kính ngắm (OVF quang, EVF điện tử)', 'grp-004-screen-viewfinder', 'ENUM', NULL, 0, 0, 4, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-evf-resolution', 'evf_resolution', 'Độ phân giải EVF', 'Độ phân giải kính ngắm điện tử', 'grp-004-screen-viewfinder', 'NUMBER', 'điểm ảnh', 0, 0, 5, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- === GROUP E: Pin, lưu trữ & Kết nối ===

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-battery-type', 'battery_type', 'Loại pin', 'Model/loại pin sử dụng', 'grp-005-battery-storage', 'TEXT', NULL, 0, 0, 1, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-battery-shots', 'battery_shots', 'Số shot / lần sạc', 'Số lần chụp ước tính mỗi lần sạc đầy', 'grp-005-battery-storage', 'NUMBER', 'shot', 0, 0, 2, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-card-slots', 'card_slots', 'Số khe thẻ nhớ', 'Số lượng khe cắm thẻ nhớ', 'grp-005-battery-storage', 'NUMBER', 'khe', 0, 0, 3, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-card-type', 'card_type', 'Loại thẻ nhớ', 'Các loại thẻ nhớ tương thích (SD, CFexpress...)', 'grp-005-battery-storage', 'ENUM', NULL, 1, 0, 4, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-wifi', 'wifi', 'Wi-Fi', 'Có hỗ trợ Wi-Fi hay không', 'grp-005-battery-storage', 'BOOLEAN', NULL, 0, 0, 5, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-bluetooth', 'bluetooth', 'Bluetooth', 'Phiên bản Bluetooth hỗ trợ', 'grp-005-battery-storage', 'TEXT', NULL, 0, 0, 6, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-usb', 'usb_port', 'USB', 'Loại cổng USB và phiên bản', 'grp-005-battery-storage', 'ENUM', NULL, 0, 0, 7, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-hdmi', 'hdmi_port', 'HDMI', 'Loại cổng HDMI', 'grp-005-battery-storage', 'ENUM', NULL, 0, 0, 8, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-mic', 'mic_port', 'Mic', 'Có cổng mic ngoài hay không', 'grp-005-battery-storage', 'BOOLEAN', NULL, 0, 0, 9, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-headphone', 'headphone_port', 'Headphone', 'Có cổng tai nghe hay không', 'grp-005-battery-storage', 'BOOLEAN', NULL, 0, 0, 10, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- === GROUP F: Thân máy & Hoàn thiện ===

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-weight', 'weight', 'Trọng lượng', 'Trọng lượng thân máy (không kèm pin & thẻ nhớ)', 'grp-006-body-build', 'NUMBER', 'g', 0, 0, 1, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-dimensions', 'dimensions', 'Kích thước', 'Kích thước tổng thể (Dài x Rộng x Sâu)', 'grp-006-body-build', 'TEXT', 'mm', 0, 0, 2, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tech_spec_definition (id, code, name, description, id_tech_spec_group, data_type, unit, is_filterable, is_required, display_order, status, created_date, last_modified_date)
VALUES
('def-weather-sealing', 'weather_sealing', 'Chống thời tiết', 'Có chống bụi, ẩm nước hay không', 'grp-006-body-build', 'BOOLEAN', NULL, 0, 0, 3, 0, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ============================================================
-- NOTE: Màu sắc và Dung lượng đã được chuyển sang module
-- variant (Color, StorageCapacity entity riêng).
-- KHÔNG thêm vào đây.
-- ============================================================
