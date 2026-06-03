import { useState } from "react";

const initialCategories = [];

export default function Categories() {
  const [categories, setCategories] = useState(initialCategories);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ name: "", code: "", description: "" });
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(25);

  const openAdd = () => {
    setForm({ name: "", code: "", description: "" });
    setEditIndex(null);
    setShowModal(true);
  };

  const openEdit = (i) => {
    setForm({ ...categories[i] });
    setEditIndex(i);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      alert("Category name is required.");
      return;
    }
    if (editIndex !== null) {
      const updated = [...categories];
      updated[editIndex] = form;
      setCategories(updated);
    } else {
      setCategories([...categories, form]);
    }
    setShowModal(false);
  };

  const handleDelete = (i) => {
    if (window.confirm("Delete this category?")) {
      setCategories(categories.filter((_, idx) => idx !== i));
    }
  };

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "sans-serif", color: "#333" }}>
      <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 4 }}>
        Categories <span style={{ fontWeight: 400, fontSize: 16, color: "#666" }}>Manage your categories</span>
      </h2>

      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: "24px",
          marginTop: 16,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button
            onClick={openAdd}
            style={{
              background: "#6f42c1",
              color: "#fff",
              border: "none",
              borderRadius: 50,
              padding: "10px 22px",
              fontSize: 15,
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            + Add
          </button>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13 }}>Show</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #ccc", fontSize: 13 }}
            >
              {[10, 25, 50, 100].map((n) => <option key={n}>{n}</option>)}
            </select>
            <span style={{ fontSize: 13 }}>entries</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Export CSV", "Export Excel", "Print", "Column visibility", "Export PDF"].map((btn) => (
              <button
                key={btn}
                style={{ padding: "5px 12px", border: "1px solid #ccc", borderRadius: 4, background: "#fff", fontSize: 12, cursor: "pointer" }}
              >
                {btn}
              </button>
            ))}
            <input
              placeholder="Search ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "5px 10px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13, width: 160 }}
            />
          </div>
        </div>

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #dee2e6" }}>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>Category</th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>Category Code</th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>Description</th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 28, color: "#888" }}>
                  No data available in table
                </td>
              </tr>
            ) : (
              filtered.slice(0, perPage).map((c, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #dee2e6" }}>
                  <td style={{ padding: "10px 12px" }}>{c.name}</td>
                  <td style={{ padding: "10px 12px" }}>{c.code}</td>
                  <td style={{ padding: "10px 12px" }}>{c.description}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <button
                      onClick={() => openEdit(i)}
                      style={{ marginRight: 6, padding: "4px 12px", borderRadius: 4, border: "1px solid #6f42c1", background: "#fff", color: "#6f42c1", cursor: "pointer", fontSize: 13 }}
                    >
                      ✏ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(i)}
                      style={{ padding: "4px 12px", borderRadius: 4, border: "1px solid #dc3545", background: "#fff", color: "#dc3545", cursor: "pointer", fontSize: 13 }}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, fontSize: 13, color: "#555" }}>
          <span>
            Showing {filtered.length === 0 ? "0 to 0 of 0" : `1 to ${Math.min(perPage, filtered.length)} of ${filtered.length}`} entries
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{ padding: "4px 14px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>Previous</button>
            <button style={{ padding: "4px 14px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>Next</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
        >
          <div style={{ background: "#fff", borderRadius: 8, padding: 28, width: 500, maxWidth: "95vw" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h5 style={{ fontWeight: 700, fontSize: 18 }}>Add</h5>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888" }}>×</button>
            </div>

            <label style={{ fontWeight: 500, fontSize: 14 }}>Category name: *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Category name"
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4, marginTop: 6, marginBottom: 16, fontSize: 14, boxSizing: "border-box" }}
            />

            <label style={{ fontWeight: 500, fontSize: 14 }}>Category Code:</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="Category Code"
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4, marginTop: 6, marginBottom: 4, fontSize: 14, boxSizing: "border-box" }}
            />
            <p style={{ fontSize: 12, color: "#555", marginBottom: 16 }}>
              Category code is same as <strong>HSN code</strong>
            </p>

            <label style={{ fontWeight: 500, fontSize: 14 }}>Description:</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
              rows={4}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4, marginTop: 6, fontSize: 14, resize: "vertical", boxSizing: "border-box" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button
                onClick={handleSave}
                style={{ background: "#6f42c1", color: "#fff", border: "none", borderRadius: 6, padding: "9px 24px", fontSize: 14, cursor: "pointer", fontWeight: 600 }}
              >
                Save
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "#343a40", color: "#fff", border: "none", borderRadius: 6, padding: "9px 24px", fontSize: 14, cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}