-- =====================================================
-- Migration: V5__add_variant_version_column_to_product_detail.sql
-- Purpose: Thêm cột variant_version cho "Phiên bản" máy ảnh Canon
-- Date: 2026-03-19
-- Level: LEVEL 1 - Chỉ hỗ trợ 3 giá trị:
--   - BODY_ONLY: Body Only
--   - KIT_18_45: Kit 18-45
--   - KIT_18_150: Kit 18-150
--
-- Backward Compatibility:
--   - Dữ liệu cũ: Gán mặc định 'BODY_ONLY'
--   - Ứng dụng đã có fallback logic trong backend
-- =====================================================

-- Thêm cột variant_version vào bảng product_detail
ALTER TABLE product_detail
ADD COLUMN IF NOT EXISTS variant_version VARCHAR(50) DEFAULT 'BODY_ONLY';

-- Cập nhật dữ liệu cũ chưa có variant_version thành 'BODY_ONLY'
-- (Trong trường hợp DEFAULT không được áp dụng)
UPDATE product_detail
SET variant_version = 'BODY_ONLY'
WHERE variant_version IS NULL OR variant_version = '';

-- Thêm constraint để đảm bảo chỉ có 3 giá trị hợp lệ
-- NOTE: Nếu database không hỗ trợ CHECK constraint hoặc muốn linh hoạt hơn,
-- có thể bỏ comment dòng dưới và chỉ validate ở application layer
-- ALTER TABLE product_detail
-- ADD CONSTRAINT chk_variant_version
-- CHECK (variant_version IN ('BODY_ONLY', 'KIT_18_45', 'KIT_18_150'));

-- Tạo index để tối ưu truy vấn theo variant_version (phục vụ cho LEVEL 2+)
CREATE INDEX IF NOT EXISTS idx_product_detail_variant_version
ON product_detail(variant_version);

-- =====================================================
-- Migration Note for LEVEL 2+:
-- Khi thêm bundle phụ kiện, memory card bundle:
-- 1. Thêm giá trị mới vào enum ProductVersion
-- 2. Tạo migration để thêm giá trị vào constraint (nếu có)
-- 3. Cập nhật frontend để hiển thị option mới
-- =====================================================
