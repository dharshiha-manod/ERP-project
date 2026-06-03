import { useState } from "react";

const initialUnits = [{ name: "Pieces", shortName: "Pc(s)", allowDecimal: "No" }];

export default function Units() {
  const [units, setUnits] = useState(initialUnits);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ name: "", shortName: "", allowDecimal: "", isMultiple: false });
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(25);

  const openAdd = () => {
    setForm({ name: "", shortName: "", allowDecimal: "", isMultiple: false });
    setEditIndex(null);
    setShowModal(true);
  };

  const openEdit = (i) => {
    setForm({ ...units[i], isMultiple: false });
    setEditIndex(i);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.shortName.trim() || !form.allowDecimal) {
      alert("Please fill all required fields.");
      return;
    }
    if (editIndex !== null) {
      const updated = [...units];
      updated[editIndex] = { name: form.name, shortName: form.shortName, allowDecimal: form.allowDecimal };
      setUnits(updated);
    } else {
      setUnits([...units, { name: form.name, shortName: form.shortName, allowDecimal: form.allowDecimal }]);
    }
    setShowModal(false);
  };

  const handleDelete = (i) => {
    if (window.confirm("Delete this unit?")) {
      setUnits(units.filter((_, idx) => idx !== i));
    }
  };

  const filtered = units.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.shortName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "sans-serif", color: "#333" }}>
      <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 4 }}>
        Units <span style={{ fontWeight: 400, fontSize: 16, color: "#666" }}>Manage your units</span>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h4 style={{ fontWeight: 700 }}>All your units</h4>
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
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>Name</th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>Short name</th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>
                Allow decimal{" "}
                <span
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: "50%", background: "#17a2b8", color: "#fff", fontSize: 10, cursor: "pointer" }}
                  title="Whether this unit allows decimal values"
                >i</span>
              </th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 28, color: "#888" }}>No data available in table</td>
              </tr>
            ) : (
              filtered.slice(0, perPage).map((u, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #dee2e6" }}>
                  <td style={{ padding: "10px 12px" }}>{u.name}</td>
                  <td style={{ padding: "10px 12px" }}>{u.shortName}</td>
                  <td style={{ padding: "10px 12px" }}>{u.allowDecimal}</td>
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
            <button
              style={{ padding: "4px 14px", borderRadius: 4, border: "none", background: "#6f42c1", color: "#fff", cursor: "pointer", fontWeight: 600 }}
            >
              1
            </button>
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
              <h5 style={{ fontWeight: 700, fontSize: 18 }}>{editIndex !== null ? "Edit" : "Add"} Unit</h5>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888" }}>×</button>
            </div>

            <label style={{ fontWeight: 500, fontSize: 14 }}>Name: *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4, marginTop: 6, marginBottom: 16, fontSize: 14, boxSizing: "border-box" }}
            />

            <label style={{ fontWeight: 500, fontSize: 14 }}>Short name: *</label>
            <input
              value={form.shortName}
              onChange={(e) => setForm({ ...form, shortName: e.target.value })}
              placeholder="Short name"
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4, marginTop: 6, marginBottom: 16, fontSize: 14, boxSizing: "border-box" }}
            />

            <label style={{ fontWeight: 500, fontSize: 14 }}>Allow decimal: *</label>
            <select
              value={form.allowDecimal}
              onChange={(e) => setForm({ ...form, allowDecimal: e.target.value })}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4, marginTop: 6, marginBottom: 16, fontSize: 14, boxSizing: "border-box" }}
            >
              <option value="">Please Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.isMultiple}
                onChange={(e) => setForm({ ...form, isMultiple: e.target.checked })}
              />
              Add as multiple of other unit{" "}
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: "50%", background: "#17a2b8", color: "#fff", fontSize: 10 }}>i</span>
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
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