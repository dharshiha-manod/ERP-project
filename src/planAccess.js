// ─── Plan-based feature access config ─────────────────────────────────────────
// Single source of truth for what each subscription plan unlocks.
// Used by Sidebar (to hide menu items) and App.jsx (to block direct URL access).

import { getSubscription } from "./pages/Subscription";

// Feature keys — group sidebar items + routes under these
export const FEATURES = {
  DASHBOARD:       "dashboard",
  POS:             "pos",
  PRODUCTS:        "products",
  SELL:            "sell",
  CONTACTS:        "contacts",

  REPORTS:         "reports",
  STOCK_TRANSFERS: "stock_transfers",
  STOCK_ADJUSTMENT:"stock_adjustment",
  EXPENSES:        "expenses",
  PURCHASES:       "purchases",
  MANUFACTURING:   "manufacturing",   // ← covers Production Planning too now

  USER_MANAGEMENT: "user_management",
  SETTINGS:        "settings",
  NOTIFICATIONS:   "notifications",
  CRM:             "crm",
  HRM:             "hrm",
  ESSENTIALS:      "essentials",
  // PRODUCTION_PLANNING removed — now nested under MANUFACTURING
};

// What each plan includes
const PLAN_FEATURES = {
  trial: [
    FEATURES.DASHBOARD,
    FEATURES.POS,
    FEATURES.PRODUCTS,
    FEATURES.SELL,
    FEATURES.CONTACTS,
  ],
  starter: [
    FEATURES.DASHBOARD,
    FEATURES.POS,
    FEATURES.PRODUCTS,
    FEATURES.SELL,
    FEATURES.CONTACTS,
    FEATURES.REPORTS,
    FEATURES.STOCK_TRANSFERS,
    FEATURES.STOCK_ADJUSTMENT,
    FEATURES.EXPENSES,
    FEATURES.PURCHASES,
    FEATURES.MANUFACTURING,
  ],
  pro: Object.values(FEATURES), // everything
};

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getCurrentPlan() {
  const sub = getSubscription();
  return sub?.plan || null; // "trial" | "starter" | "pro" | null
}

export function getAllowedFeatures() {
  const plan = getCurrentPlan();
  if (!plan) return [];
  return PLAN_FEATURES[plan] || [];
}

export function hasFeature(featureKey) {
  if (!featureKey) return true; // items with no feature key are always visible
  return getAllowedFeatures().includes(featureKey);
}

export function getPlanLabel() {
  const plan = getCurrentPlan();
  if (plan === "trial")   return "Free Trial";
  if (plan === "starter") return "Starter";
  if (plan === "pro")     return "Pro";
  return "No Plan";
}