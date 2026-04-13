-- =====================================================
-- V7: Add original_price snapshot column to order_detail
-- =====================================================
-- Purpose: Store the original listed price (sale_price from ProductDetail)
-- at the moment of purchase. This ensures that old invoices
-- keep their original prices even when ProductDetail.salePrice
-- is later updated.
--
-- original_price: Giá niêm yết gốc tại thời điểm mua (để gạch đi)
-- unit_price: Giá thực tế khách trả (sau giảm giá khuyến mãi)
-- total_price: Thành tiền = unit_price * quantity
--
-- For EXISTING data: backfill with unit_price because we cannot
-- reliably reconstruct original_price from existing records.
-- The reason is: we don't know whether unit_price was the original
-- price or the discounted price at the time of purchase.
-- We use unit_price as original_price fallback so that:
-- - old invoices without discount will show correctly (original == final)
-- - old invoices with discount will show unit_price as both original and final
--   (acceptable degradation; the main goal of fixing new invoices is achieved)
--
-- HOW TO RUN:
-- Since this project uses JPA ddl-auto=UPDATE, Hibernate will automatically
-- create the column when the application restarts. You still need to run
-- this script to BACKFILL existing data (steps 2-4 below).
-- =====================================================

-- 1. Add the column (nullable first for safety)
--    (Hibernate will also do this automatically on next startup)
ALTER TABLE order_detail
ADD COLUMN IF NOT EXISTS original_price DECIMAL(20, 2) DEFAULT NULL;

-- 2. Backfill existing rows: set original_price = unit_price
--    This is a CONSERVATIVE fallback - best effort for old data.
--    We cannot distinguish original vs discounted price from existing records.
--    For old orders: originalPrice == unitPrice (no strikethrough discount shown)
--    For new orders (after this fix): originalPrice = ProductDetail.salePrice at time of purchase
UPDATE order_detail
SET original_price = unit_price
WHERE original_price IS NULL AND unit_price IS NOT NULL;

-- 3. Set 0 for rows where unit_price is null
UPDATE order_detail
SET original_price = 0
WHERE original_price IS NULL;

-- 4. Make column NOT NULL after backfill
--    Run this ONLY after step 2 and 3 complete successfully
ALTER TABLE order_detail
MODIFY COLUMN original_price DECIMAL(20, 2) NOT NULL DEFAULT 0;

-- 5. Optional: verify the data
-- SELECT COUNT(*) AS total_rows,
--        SUM(CASE WHEN original_price IS NULL THEN 1 ELSE 0 END) AS null_original_price,
--        SUM(CASE WHEN original_price = unit_price THEN 1 ELSE 0 END) AS original_equals_unit
-- FROM order_detail;
