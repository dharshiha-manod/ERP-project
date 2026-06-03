import { useState } from "react";

const DURATION_UNITS = ["Days", "Months", "Years"];

export default function Warranties() {
  const [warranties, setWarranties] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", duration: "", durationUnit: "" });
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(25);

  const openAdd = () => {
    setForm({ name: "", description: "", duration: "", durationUnit: "" });
    setEditIndex(null);
    setShowModal(true);
  };

  const openEdit = (i) => {
    setForm({ ...warranties[i] });
    setEditIndex(i);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { alert("Name is required."); return; }
    if (!form.duration || !form.durationUnit) { alert("Duration is required."); return; }
    if (editIndex !== null) {
      const updated = [...warranties];
      updated[editIndex] = form;
      setWarranties(updated);
    } else {
      setWarranties([...warranties, form]);
    }
    setShowModal(false);
  };

  const handleDelete = (i) => {
    if (window.confirm("Delete this warranty?")) setWarranties(warranties.filter((_, idx) => idx !== i));
  };

  const filtered = warranties.filter(
    (w) => w.name.toLowerCase().includes(search.toLowerCase()) || w.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "sans-serif", color: "#333" }}>
      <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 16 }}>Warranties</h2>

      <div style={{ background: "#fff", borderRadius: 8, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h4 style={{ fontWeight: 700 }}>All Warranties</h4>
          <button onClick={openAdd} style={{ background: "#6f42c1", color: "#fff", border: "none", borderRadius: 50, padding: "10px 22px", fontSize: 15, cursor: "pointer", fontWeight: 600 }}>
            + Add
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13 }}>Show</span>
            <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #ccc", fontSize: 13 }}>
              {[10, 25, 50, 100].map((n) => <option key={n}>{n}</option>)}
            </select>
            <span style={{ fontSize: 13 }}>entries</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Export CSV", "Export Excel", "Print", "Column visibility", "Export PDF"].map((btn) => (
              <button key={btn} style={{ padding: "5px 12px", border: "1px solid #ccc", borderRadius: 4, background: "#fff", fontSize: 12, cursor: "pointer" }}>{btn}</button>
            ))}
            <input placeholder="Search ..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: "5px 10px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13, width: 160 }} />
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #dee2e6" }}>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>Name</th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>Description</th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>Duration</th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: "center", padding: 28, color: "#888" }}>No data available in table</td></tr>
            ) : (
              filtered.slice(0, perPage).map((w, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #dee2e6" }}>
                  <td style={{ padding: "10px 12px" }}>{w.name}</td>
                  <td style={{ padding: "10px 12px" }}>{w.description}</td>
                  <td style={{ padding: "10px 12px" }}>{w.duration} {w.durationUnit}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <button onClick={() => openEdit(i)} style={{ marginRight: 6, padding: "4px 12px", borderRadius: 4, border: "1px solid #6f42c1", background: "#fff", color: "#6f42c1", cursor: "pointer", fontSize: 13 }}>✏ Edit</button>
                    <button onClick={() => handleDelete(i)} style={{ padding: "4px 12px", borderRadius: 4, border: "1px solid #dc3545", background: "#fff", color: "#dc3545", cursor: "pointer", fontSize: 13 }}>🗑 Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, fontSize: 13, color: "#555" }}>
          <span>Showing {filtered.length === 0 ? "0 to 0 of 0" : `1 to ${Math.min(perPage, filtered.length)} of ${filtered.length}`} entries</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{ padding: "4px 14px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>Previous</button>
            <button style={{ padding: "4px 14px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>Next</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 28, width: 520, maxWidth: "95vw" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h5 style={{ fontWeight: 700, fontSize: 18 }}>{editIndex !== null ? "Edit" : "Add"} Warranty</h5>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888" }}>×</button>
            </div>

            <label style={{ fontWeight: 500, fontSize: 14 }}>Name: *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name"
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4, marginTop: 6, marginBottom: 16, fontSize: 14, boxSizing: "border-box" }} />

            <label style={{ fontWeight: 500, fontSize: 14 }}>Description:</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={4}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4, marginTop: 6, marginBottom: 16, fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />

            <label style={{ fontWeight: 500, fontSize: 14 }}>Duration: *</label>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="Duration" type="number" min="1"
                style={{ flex: 1, padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14, boxSizing: "border-box" }} />
              <select value={form.durationUnit} onChange={(e) => setForm({ ...form, durationUnit: e.target.value })}
                style={{ flex: 1, padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14, boxSizing: "border-box" }}>
                <option value="">Please Select</option>
                {DURATION_UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
              <button onClick={handleSave} style={{ background: "#6f42c1", color: "#fff", border: "none", borderRadius: 6, padding: "9px 24px", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>Save</button>
              <button onClick={() => setShowModal(false)} style={{ background: "#343a40", color: "#fff", border: "none", borderRadius: 6, padding: "9px 24px", fontSize: 14, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}