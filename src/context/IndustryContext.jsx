import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { industryAPI } from "../api/industryAPI";

const STORAGE_KEY = "manod_active_industry_id";
const IndustryContext = createContext(null);

const ADMIN_ROLES = ["super admin", "administrator", "admin"];

function decodeJWT(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function IndustryProvider({ children }) {
  const [industries, setIndustries] = useState([]);
  const [activeIndustry, setActiveIndustryState] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem("manod_token");
      const jwt = token ? decodeJWT(token) : null;
      const roleName = (jwt?.role || "").toLowerCase();
      const isAdmin = ADMIN_ROLES.includes(roleName);

      // Non-admins: the backend already locks every request to the
      // user's assigned industry (requireIndustry ignores their header),
      // so we don't need — and must not offer — a switchable list here.
      // Just read their own industry off the token/localStorage user
      // object for display purposes only.
      if (!isAdmin) {
        const storedUser = JSON.parse(localStorage.getItem("manod_user") || "{}");
        const own = {
          id: jwt?.industry_id ?? storedUser.industry_id ?? null,
          name: storedUser.industry_name || null,
        };
        setIndustries(own.id ? [own] : []);
        setActiveIndustryState(own.id ? own : null);
        // Deliberately do NOT write to localStorage as a source of
        // truth here — the backend derives scoping from the user row,
        // not this value, for non-admins.
        setLoading(false);
        return;
      }

      // Admins: fetch the full switchable workspace list as before.
      const res = await industryAPI.getAll();
      if (res.success) {
        setIndustries(res.data);
        const storedId = localStorage.getItem(STORAGE_KEY);
        const found = res.data.find(i => String(i.id) === storedId) || res.data[0] || null;
        setActiveIndustryState(found);
        if (found) localStorage.setItem(STORAGE_KEY, String(found.id));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Switches workspace, then reloads the app so every screen re-fetches
  // its data scoped to the new industry. Simplest way to guarantee no
  // stale data from the previous workspace lingers in component state.
  // Admin-only in practice — the switcher UI is already hidden for
  // non-admins, and the backend rejects set-active for them too.
  const switchIndustry = async (industryId) => {
    await industryAPI.setActive(industryId);
    localStorage.setItem(STORAGE_KEY, String(industryId));
    window.location.reload();
  };

  const refreshIndustries = () => load();

  return (
    <IndustryContext.Provider value={{ industries, activeIndustry, loading, switchIndustry, refreshIndustries }}>
      {children}
    </IndustryContext.Provider>
  );
}

export const useIndustry = () => {
  const ctx = useContext(IndustryContext);
  if (!ctx) throw new Error("useIndustry must be used inside <IndustryProvider>");
  return ctx;
};