# DATN-SD40 备忘

## 2026-04-07
- 订单域：`Order.orderType` → `TypeInvoice`（ONLINE / OFFLINE / GIAO_HANG）。网站单仅 ONLINE。
- 管理端：`/api/v1/admin/orders` 仅在线单；`/api/v1/admin/invoices` 全量票据。
- 前端：`/orders` = Đơn hàng online；`/invoices` = Quản lý hóa đơn。
