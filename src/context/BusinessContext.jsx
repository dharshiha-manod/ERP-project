import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as settingsAPI from "../api/settingsAPI"; // adjust path if your alias differs

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadBusiness = useCallback(async () => {
    const res = await settingsAPI.getBusinessSettings();
    if (res.success && res.data) {
      setBusiness(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadBusiness(); }, [loadBusiness]);

  // Call this after any save in Settings so every screen updates instantly
  const refreshBusiness = () => loadBusiness();

  return (
    <BusinessContext.Provider value={{ business, loading, refreshBusiness }}>
      {children}
    </BusinessContext.Provider>
  );
}

export const useBusiness = () => {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error("useBusiness must be used inside <BusinessProvider>");
  return ctx;
};