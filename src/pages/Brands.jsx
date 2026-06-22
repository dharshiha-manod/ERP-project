import { useState, useEffect, useCallback } from "react";
import { brandsAPI } from "../api/productAPI";

export default function Brands() {
  const [brands, setBrands]       = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editBrand, setEditBrand] = useState(null);   // null = adding, object = editing
  const [form, setForm]           = useState({ name: "", description: "" });
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [perPage, setPerPage]     = useState(25);

  // ── Load brands from API ──
  const loadBrands = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await brandsAPI.getAll({ page, limit: perPage, search });
      setBrands(data.brands || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load brands");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search]);

  useEffect(() => { loadBrands(); }, [loadBrands]);

  // ── Search with debounce ──
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Open add modal ──
  const openAdd = () => {
    setForm({ name: "", description: "" });
    setEditBrand(null);
    setShowModal(true);
  };

  // ── Open edit modal ──
  const openEdit = (brand) => {
    setForm({ name: brand.name, description: brand.description || "" });
    setEditBrand(brand);
    setShowModal(true);
  };

  // ── Save (create or update) ──
  const handleSave = async () => {
    if (!form.name.trim()) { alert("Brand name is required."); return; }
    setSaving(true);
    try {
      if (editBrand) {
        await brandsAPI.update(editBrand.id, form);
      } else {
        await brandsAPI.create(form);
      }
      setShowModal(false);
      setPage(1);
      await loadBrands();
    } catch (err) {
      alert(err.message || "Failed to save brand");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (brand) => {
    if (!window.confirm(`Delete brand "${brand.name}"?`)) return;
    try {
      await brandsAPI.delete(brand.id);
      await loadBrands();
    } catch (err) {
      alert(err.message || "Failed to delete brand");
    }
  };

  const totalPages = Math.ceil(total / perPage);
  const showing    = brands.length === 0
    ? "0 to 0 of 0"
    : `${(page - 1) * perPage + 1} to ${(page - 1) * perPage + brands.length} of ${total}`;

  return (
    <div style={{ fontFamily: "sans-serif", color: "#333" }}>
      <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 4 }}>
        Brands <span style={{ fontWeight: 400, fontSize: 16, color: "#666" }}>Manage your brands</span>
      </h2>

      {error && (
        <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 6, padding: "10px 16px", marginBottom: 12, color: "#856404" }}>
          {error}
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: 8, padding: 24, marginTop: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h4 style={{ fontWeight: 700 }}>All your brands</h4>
          <button onClick={openAdd} style={{ background: "#6f42c1", color: "#fff", border: "none", borderRadius: 50, padding: "10px 22px", fontSize: 15, cursor: "pointer", fontWeight: 600 }}>
            + Add
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13 }}>Show</span>
            <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
              style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #ccc", fontSize: 13 }}>
              {[10, 25, 50, 100].map((n) => <option key={n}>{n}</option>)}
            </select>
            <span style={{ fontSize: 13 }}>entries</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Export CSV", "Export Excel", "Print", "Column visibility", "Export PDF"].map((btn) => (
              <button key={btn} style={{ padding: "5px 12px", border: "1px solid #ccc", borderRadius: 4, background: "#fff", fontSize: 12, cursor: "pointer" }}>{btn}</button>
            ))}
            <input
              placeholder="Search ..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ padding: "5px 10px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13, width: 160 }}
            />
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #dee2e6" }}>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>Brands</th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>Note</th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ textAlign: "center", padding: 28, color: "#888" }}>Loading...</td></tr>
            ) : brands.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: "center", padding: 28, color: "#888" }}>No data available in table</td></tr>
            ) : (
              brands.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                  <td style={{ padding: "10px 12px" }}>{b.name}</td>
                  <td style={{ padding: "10px 12px" }}>{b.description}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <button onClick={() => openEdit(b)} style={{ marginRight: 6, padding: "4px 12px", borderRadius: 4, border: "1px solid #6f42c1", background: "#fff", color: "#6f42c1", cursor: "pointer", fontSize: 13 }}>✏ Edit</button>
                    <button onClick={() => handleDelete(b)} style={{ padding: "4px 12px", borderRadius: 4, border: "1px solid #dc3545", background: "#fff", color: "#dc3545", cursor: "pointer", fontSize: 13 }}>🗑 Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, fontSize: 13, color: "#555" }}>
          <span>Showing {showing} entries</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              style={{ padding: "4px 14px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}>
              Previous
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              style={{ padding: "4px 14px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: page >= totalPages ? "not-allowed" : "pointer", opacity: page >= totalPages ? 0.5 : 1 }}>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 28, width: 500, maxWidth: "95vw" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h5 style={{ fontWeight: 700, fontSize: 18 }}>{editBrand ? "Edit" : "Add"} brand</h5>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888" }}>×</button>
            </div>

            <label style={{ fontWeight: 500, fontSize: 14 }}>Brand name: *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Brand name"
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4, marginTop: 6, marginBottom: 16, fontSize: 14, boxSizing: "border-box" }}
            />

            <label style={{ fontWeight: 500, fontSize: 14 }}>Short description:</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short description"
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4, marginTop: 6, fontSize: 14, boxSizing: "border-box" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
              <button onClick={handleSave} disabled={saving}
                style={{ background: "#6f42c1", color: "#fff", border: "none", borderRadius: 6, padding: "9px 24px", fontSize: 14, cursor: saving ? "not-allowed" : "pointer", fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={() => setShowModal(false)}
                style={{ background: "#343a40", color: "#fff", border: "none", borderRadius: 6, padding: "9px 24px", fontSize: 14, cursor: "pointer" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}