/**
 * ============================================================
 * src/context/PermissionsContext.jsx  (FIXED)
 *
 * Changes:
 * 1. Now also stores `userRole` and `userName` from the JWT/API
 *    so Sidebar can show the real logged-in user (not hardcoded "Admin")
 * 2. Reads user info from JWT token stored in localStorage
 * ============================================================
 */

import { createContext, useContext, useState, useEffect } from "react";

const PermissionsContext = createContext({
  permissions: [],
  hasPermission: () => false,
  loaded: false,
  loadPermissions: async () => {},
  clearPermissions: () => {},
  isAdmin: false,
  userRole: "",
  userName: "",
  userEmail: "",
  userAvatar: "",
});

// ── Helper: decode JWT payload without a library ─────────────
function decodeJWT(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded;
  } catch {
    return null;
  }
}

export function PermissionsProvider({ children }) {
  const [permissions, setPermissions] = useState(null);
  const [loaded,      setLoaded]      = useState(false);
  const [isAdmin,     setIsAdmin]     = useState(false);
  const [userRole,    setUserRole]    = useState("");
  const [userName,    setUserName]    = useState("");
  const [userEmail,   setUserEmail]   = useState("");
  const [userAvatar,  setUserAvatar]  = useState("A");

  const loadPermissions = async () => {
    const token = localStorage.getItem("manod_token");
    if (!token) {
      setPermissions([]);
      setIsAdmin(false);
      setLoaded(true);
      return;
    }

    // ── Decode JWT to get user info immediately (no extra API call) ──
    const jwt = decodeJWT(token);
    if (jwt) {
      const name  = jwt.full_name || jwt.name || jwt.email?.split("@")[0] || "User";
      const email = jwt.email || "";
      const role  = jwt.role  || "";
      setUserName(name);
      setUserEmail(email);
      setUserRole(role);
      // Avatar = first letter of name, uppercase
      setUserAvatar((name[0] || "U").toUpperCase());
    }

    try {
      const res  = await fetch("http://localhost:5000/api/auth/my-permissions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setPermissions(data.permissions);
        setIsAdmin(!!data.isAdmin);
        // Use role from API response (more authoritative than JWT)
        if (data.role) {
          setUserRole(data.role);
        }
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
    setUserRole("");
    setUserName("");
    setUserEmail("");
    setUserAvatar("A");
  };

  const hasPermission = (group, name) => {
    if (!permissions) return false;
    if (isAdmin) return true; // admin bypass on frontend too
    return permissions.includes(`${group}::${name}`);
  };

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
        userRole,
        userName,
        userEmail,
        userAvatar,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export const usePermissions = () => useContext(PermissionsContext);