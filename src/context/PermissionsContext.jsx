import { createContext, useContext, useState, useEffect } from "react";

const PermissionsContext = createContext({
  permissions: [],
  hasPermission: () => false,
  loaded: false,
  loadPermissions: async () => {},
  clearPermissions: () => {},
  isAdmin: false,
});

export function PermissionsProvider({ children }) {
  // Always start unloaded — never trust a cached permission list from a
  // previous session/user. Only a live API response is authoritative.
  const [permissions, setPermissions] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadPermissions = async () => {
    const token = localStorage.getItem("manod_token");
    if (!token) {
      setPermissions([]);
      setIsAdmin(false);
      setLoaded(true);
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/auth/my-permissions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPermissions(data.permissions);
        setIsAdmin(!!data.isAdmin);
      } else {
        setPermissions([]);
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Failed to load permissions:", err);
      setPermissions([]);
      setIsAdmin(false);
    } finally {
      setLoaded(true);
    }
  };

  const clearPermissions = () => {
    setPermissions([]);
    setIsAdmin(false);
    setLoaded(false);
  };

  const hasPermission = (group, name) => {
    if (!permissions) return false;
    return permissions.includes(`${group}::${name}`);
  };

  // On every fresh mount (app boot / page refresh) where a token already
  // exists, fetch permissions live. This does NOT cache anything — it's a
  // safe, always-current fetch, unlike the old buggy localStorage version.
  // This fixes the "F5 refresh shows only Home" bug: previously nothing
  // re-fetched permissions unless the Login screen explicitly ran.
  useEffect(() => {
    if (localStorage.getItem("manod_token")) {
      loadPermissions();
    }
  }, []);

  return (
    <PermissionsContext.Provider
      value={{
        permissions: permissions || [],
        hasPermission,
        loaded,
        loadPermissions,
        clearPermissions,
        isAdmin,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export const usePermissions = () => useContext(PermissionsContext);