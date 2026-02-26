-- Banner table for Hikari Camera
-- V1.0.0

CREATE TABLE IF NOT EXISTS banner (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    status INT DEFAULT 1,
    created_date BIGINT,
    last_modified_date BIGINT,
    title VARCHAR(255),
    slot VARCHAR(50),
    image_url TEXT,
    target_url VARCHAR(500),
    alt_text VARCHAR(255),
    start_at BIGINT,
    end_at BIGINT,
    priority INT DEFAULT 0,
    description TEXT
);

-- Insert sample banners
INSERT INTO banner (id, code, status, created_date, last_modified_date, title, slot, image_url, target_url, alt_text, start_at, end_at, priority, description) VALUES
(UUID(), 'BANNER001', 1, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000, 'Khuyến mãi mùa hè', 'HOME_HERO', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200', '/products', 'Camera Sale 2024', UNIX_TIMESTAMP() * 1000, NULL, 10, 'Khuyến mãi giảm giá mùa hè lên đến 30%'),
(UUID(), 'BANNER002', 1, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000, 'Máy ảnh Sony mới', 'HOME_STRIP', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800', '/products?brand=sony', 'Sony Alpha Series', UNIX_TIMESTAMP() * 1000, NULL, 5, 'Khám phá dòng máy ảnh Sony Alpha mới nhất'),
(UUID(), 'BANNER003', 1, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000, 'Lens Canon RF', 'CATEGORY_TOP', 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600', '/products?category=lens', 'Canon RF Lens', UNIX_TIMESTAMP() * 1000, NULL, 3, 'Ống kính Canon RF chính hãng');

