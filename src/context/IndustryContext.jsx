import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { industryAPI } from "../api/industryAPI";

const STORAGE_KEY = "manod_active_industry_id";
const IndustryContext = createContext(null);

export function IndustryProvider({ children }) {
  const [industries, setIndustries] = useState([]);
  const [activeIndustry, setActiveIndustryState] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
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