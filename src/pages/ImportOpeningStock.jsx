import { useState } from "react";

export default function ImportOpeningStock() {
  const [fileName, setFileName] = useState("No file chosen");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFileName(e.target.files[0].name);
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!file) {
      alert("Please choose a file first.");
      return;
    }
    alert("File submitted: " + file.name);
  };

  return (
    <div style={{ fontFamily: "sans-serif", color: "#333" }}>
      <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 20 }}>
        Import Opening Stock
      </h2>

      {/* Upload Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: "24px",
          marginBottom: 24,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <label style={{ fontWeight: 500, marginRight: 8 }}>
              File To Import:
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#17a2b8",
                  color: "#fff",
                  fontSize: 11,
                  marginLeft: 4,
                  cursor: "pointer",
                }}
                title="Upload a CSV file to import opening stock"
              >
                i
              </span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <label
                style={{
                  padding: "5px 10px",
                  border: "1px solid #aaa",
                  borderRadius: 4,
                  cursor: "pointer",
                  background: "#f8f8f8",
                  fontSize: 13,
                }}
              >
                Choose File
                <input
                  type="file"
                  accept=".csv"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </label>
              <span style={{ fontSize: 13, color: "#666" }}>{fileName}</span>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            style={{
              background: "#6f42c1",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "10px 28px",
              fontSize: 15,
              cursor: "pointer",
              fontWeight: 500,
              marginLeft: "auto",
            }}
          >
            Submit
          </button>
        </div>

        {/* Download Template */}
        <div style={{ marginTop: 20 }}>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#28a745",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: 6,
              textDecoration: "none",
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            <span style={{ fontSize: 16 }}>⬇</span> Download template file
          </a>
        </div>
      </div>

      {/* Instructions Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: "24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <h4 style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Instructions</h4>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>
          Carefully follow the instructions before importing the file.
        </p>
        <p style={{ color: "#555", marginBottom: 16 }}>
          The columns of the CSV file should be in the following order.
        </p>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #dee2e6" }}>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>Column Number</th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>Column Name</th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>Instruction</th>
            </tr>
          </thead>
          <tbody>
            {[
              { num: 1, name: "SKU", badge: "Required", instruction: "" },
              {
                num: 2,
                name: "Location",
                badge: "Optional",
                sub: "If blank first business location will be used",
                instruction: "Name of the business location",
              },
              { num: 3, name: "Quantity", badge: "Required", instruction: "" },
              { num: 4, name: "Unit Cost (Before Tax)", badge: "Required", instruction: "" },
              { num: 5, name: "Lot Number", badge: "Optional", instruction: "" },
              {
                num: 6,
                name: "Expiry Date",
                badge: "Optional",
                instruction: (
                  <>
                    Stock expiry date in <strong>Business date format mm/dd/yyyy</strong>, Type:{" "}
                    <strong>text</strong>, Example: <strong>06/03/2026</strong>
                  </>
                ),
              },
            ].map((row, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: "1px solid #dee2e6",
                  background: i % 2 === 0 ? "#fff" : "#f9f9f9",
                }}
              >
                <td style={{ padding: "10px 12px" }}>{row.num}</td>
                <td style={{ padding: "10px 12px" }}>
                  {row.name}{" "}
                  <span
                    style={{
                      fontSize: 11,
                      color: "#555",
                      background: "#e9ecef",
                      borderRadius: 3,
                      padding: "1px 5px",
                    }}
                  >
                    ({row.badge})
                  </span>
                  {row.sub && (
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{row.sub}</div>
                  )}
                </td>
                <td style={{ padding: "10px 12px", color: "#555" }}>{row.instruction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}