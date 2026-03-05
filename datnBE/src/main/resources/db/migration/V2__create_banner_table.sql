-- Banner table for customer website
CREATE TABLE IF NOT EXISTS banner (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    status TINYINT NOT NULL DEFAULT 1 COMMENT '1: ACTIVE, 0: INACTIVE',
    created_date BIGINT,
    last_modified_date BIGINT,
    title VARCHAR(255),
    image_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500),
    position VARCHAR(50) DEFAULT 'HOME_TOP',
    priority INT DEFAULT 0,
    start_at BIGINT,
    end_at BIGINT,
    INDEX idx_banner_status (status),
    INDEX idx_banner_position (position),
    INDEX idx_banner_priority (priority)
);

