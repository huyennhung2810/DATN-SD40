# DATN-SD40 Notes

## 2026-04-07
- Order domain: `Order.orderType` → `TypeInvoice` (ONLINE / OFFLINE / DELIVERY). Website orders are ONLINE only.
- Admin: `/api/v1/admin/orders` = online orders only; `/api/v1/admin/invoices` = all invoices.
- Frontend: `/orders` = Online orders; `/invoices` = Invoice management.