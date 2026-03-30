-- V6__update_serial_status_reserved_to_in_order.sql
-- Replace RESERVED -> IN_ORDER in serial_status column
-- Align database enum values with backend SerialStatus enum refactor

UPDATE serial
SET serial_status = 'IN_ORDER'
WHERE serial_status = 'RESERVED';
