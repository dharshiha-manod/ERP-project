import { FEATURES } from "./planAccess";

/* ── Feature -> Permission check: EXACT group_name::name from your DB ─────── */
export const FEATURE_PERM_MAP = {
  [FEATURES.USER_MANAGEMENT]: (hp) => hp("User", "View user") || hp("Roles", "View role"),
  [FEATURES.CONTACTS]:        (hp) => hp("Customer", "View all customer") || hp("Customer", "View own customer"),
  [FEATURES.PRODUCTS]:        (hp) => hp("Product", "View product"),
  [FEATURES.MANUFACTURING]:   (hp) => hp("Manufacturing", "View Recipe"),
  [FEATURES.PRODUCTION_PLANNING]: (hp) => hp("Manufacturing", "View Recipe"),
  [FEATURES.PURCHASES]:       (hp) => hp("Purchase", "View purchase"),
  [FEATURES.SELL]:            (hp) => hp("Sell", "View all sales") || hp("Sell", "View own sales"),
  [FEATURES.POS]:             (hp) => hp("POS", "View POS sell"),
  [FEATURES.STOCK_TRANSFERS]: (hp) => hp("Stock Transfer", "View stock transfer"),
  [FEATURES.STOCK_ADJUSTMENT]:(hp) => hp("Stock Adjustment", "View stock adjustment"),
  [FEATURES.EXPENSES]:        (hp) => hp("Expense", "View expense"),
  [FEATURES.REPORTS]:         (hp) => hp("Report", "Profit loss report") || hp("Report", "Purchase & sale report"),
  [FEATURES.NOTIFICATIONS]:   (hp) => hp("Notification Template", "View notification template"),
  [FEATURES.SETTINGS]:        (hp) => hp("Business Settings", "Access business settings") || hp("Business Settings", "Access settings"),
  [FEATURES.CRM]:             (hp) => hp("Crm", "Access all follow up") || hp("Crm", "Access sources"),
  [FEATURES.HRM]:             (hp) => hp("Hrm", "View hrm dashboard") || hp("Essentials", "View all Payroll"),
  [FEATURES.ESSENTIALS]:      (hp) => hp("Essentials", "Create Message") || hp("Essentials", "View Message"),
};