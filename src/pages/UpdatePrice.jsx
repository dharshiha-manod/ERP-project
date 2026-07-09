import { useState, useRef, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { productsAPI } from "../api/productAPI";

export default function UpdatePrice() {
  const fileRef = useRef();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [importMsg, setImportMsg] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productsAPI.getAll({ limit: 1000 });
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to load products:", err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ── EXPORT: build Excel from real product data ──────────────────────────
  const handleExport = async () => {
    setExporting(true);
    try {
      // Always pull the freshest data before exporting
      const data = await productsAPI.getAll({ limit: 1000 });
      const list = data.products || [];

      const headers = [[
        "Product Name", "SKU",
        "Purchase Price (Exc. Tax)", "Purchase Price (Inc. Tax)",
        "Selling Price (Exc. Tax)", "Tax Rate", "Selling Price Tax Type",
      ]];
      const rows = list.map(p => [
        p.name || "",
        p.sku || "",
        p.exc_tax ?? 0,
        p.inc_tax ?? 0,
        p.exc_tax_sell ?? 0,
        p.tax || "None",
        p.selling_price_tax_type || "Exclusive",
      ]);

      const ws = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
      ws["!cols"] = headers[0].map(() => ({ wch: 26 }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Product Prices");
      XLSX.writeFile(wb, "product_prices.xlsx");

      setProducts(list);
    } catch (err) {
      console.error("Export failed:", err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImportFile(file || null);
    setImportStatus(null);
    setImportMsg("");
  };

  // ── IMPORT: parse Excel, match by SKU, update each product via real API ─
  const handleSubmit = () => {
    if (!importFile) {
      setImportStatus("error");
      setImportMsg("Please choose a file to import.");
      return;
    }

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);

        if (rows.length === 0) {
          setImportStatus("error");
          setImportMsg("The file is empty or has no valid rows.");
          setImporting(false);
          return;
        }

        // Fetch current products fresh so we match against latest SKUs/ids
        const latest = await productsAPI.getAll({ limit: 1000 });
        const bySku = new Map(
          (latest.products || [])
            .filter(p => p.sku)
            .map(p => [String(p.sku).trim().toLowerCase(), p])
        );

        let updated = 0;
        let skipped = 0;
        const errors = [];

        for (const row of rows) {
          const sku = String(row["SKU"] || "").trim().toLowerCase();
          const product = sku ? bySku.get(sku) : null;

          if (!product) {
            skipped++;
            continue;
          }

          const payload = {
            exc_tax:      row["Purchase Price (Exc. Tax)"] !== undefined ? parseFloat(row["Purchase Price (Exc. Tax)"]) : undefined,
            inc_tax:      row["Purchase Price (Inc. Tax)"] !== undefined ? parseFloat(row["Purchase Price (Inc. Tax)"]) : undefined,
            exc_tax_sell: row["Selling Price (Exc. Tax)"]  !== undefined ? parseFloat(row["Selling Price (Exc. Tax)"])  : undefined,
            tax:                    row["Tax Rate"] || undefined,
            selling_price_tax_type: row["Selling Price Tax Type"] || undefined,
          };

          try {
            await productsAPI.update(product.id, payload);
            updated++;
          } catch (err) {
            errors.push(`${row["Product Name"] || sku}: ${err.message}`);
          }
        }

        await loadProducts();

        if (updated > 0 && errors.length === 0 && skipped === 0) {
          setImportStatus("success");
          setImportMsg(`Successfully updated ${updated} product price(s).`);
        } else if (updated > 0) {
          setImportStatus("success");
          setImportMsg(
            `Updated ${updated} product(s).` +
            (skipped > 0 ? ` Skipped ${skipped} row(s) — SKU not found.` : "") +
            (errors.length > 0 ? ` ${errors.length} row(s) failed.` : "")
          );
        } else {
          setImportStatus("error");
          setImportMsg(
            skipped > 0
              ? `No products matched. Check that SKUs in the file match existing products.`
              : `Import failed. ${errors[0] || ""}`
          );
        }
      } catch (err) {
        console.error("Import parse error:", err);
        setImportStatus("error");
        setImportMsg("Failed to parse file. Please use the exported template.");
      } finally {
        setImporting(false);
      }
    };

    reader.readAsArrayBuffer(importFile);
  };

  return (
    <div style={s.page}>
      <h1 style={s.pageTitle}>Update Price</h1>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Import Export Product Price</h2>

        <div style={s.twoCol}>
          {/* Export side */}
          <div style={s.exportSide}>
            <p style={{ fontSize: 13, color: "#555", marginBottom: 16 }}>
              Export current product prices to an Excel file. You can edit the prices and import them back.
            </p>
            <button style={{ ...s.btnExport, opacity: exporting ? 0.7 : 1 }} onClick={handleExport} disabled={exporting}>
              {exporting ? "Exporting…" : "📥 Export product prices"}
            </button>
            <div style={s.previewTable}>
              <div style={s.previewTitle}>Current Price List Preview</div>
              {loading ? (
                <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Loading products…</div>
              ) : products.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No products found.</div>
              ) : (
                <>
                  <table style={s.table}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        <th style={s.th}>Product</th>
                        <th style={s.th}>SKU</th>
                        <th style={s.th}>Purchase (Exc.)</th>
                        <th style={s.th}>Selling Price</th>
                        <th style={s.th}>Tax</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 5).map((p, i) => (
                        <tr key={p.id ?? i} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                          <td style={s.td}>{p.name}</td>
                          <td style={s.td}><code style={{ fontSize: 11 }}>{p.sku || "—"}</code></td>
                          <td style={s.td}>₹{Number(p.exc_tax || 0).toLocaleString()}</td>
                          <td style={s.td}>₹{Number(p.exc_tax_sell || 0).toLocaleString()}</td>
                          <td style={s.td}><span style={s.taxBadge}>{p.tax || "None"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
                    Showing {Math.min(5, products.length)} of {products.length} products
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Import side */}
          <div style={s.importSide}>
            <p style={{ fontSize: 13, color: "#555", marginBottom: 16 }}>
              Import updated prices from an Excel file. Use the exported template to avoid errors.
            </p>
            <div style={s.fileRow}>
              <span style={s.fileLabel}>File To Import:</span>
              <div style={s.fileInputWrap}>
                <button style={s.chooseBtn} onClick={() => fileRef.current.click()}>
                  📂 Choose File
                </button>
                <span style={s.fileName}>{importFile ? importFile.name : "No file chosen"}</span>
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={handleFileChange} />
              </div>
            </div>
            <button style={{ ...s.btnSubmit, opacity: importing ? 0.7 : 1 }} onClick={handleSubmit} disabled={importing}>
              {importing ? "Importing…" : "🖫 Submit"}
            </button>

            {importStatus && (
              <div style={importStatus === "success" ? s.alertSuccess : s.alertError}>
                {importStatus === "success" ? "✅ " : "❌ "}{importMsg}
              </div>
            )}
          </div>
        </div>

        <hr style={s.divider} />

        <div style={s.instructions}>
          <h3 style={s.instrTitle}>Instructions:</h3>
          <ul style={s.instrList}>
            <li>Export product prices by clicking on the <strong>Export product prices</strong> button above.</li>
            <li>Make changes in product price including tax &amp; selling price groups.</li>
            <li>Do not change any product name, SKU &amp; headers.</li>
            <li>After making changes import the file.</li>
          </ul>
        </div>
      </div>

      <div style={s.footer}>manod tecnologies - V7.0 | Copyright © 2026 All rights reserved.</div>
    </div>
  );
}

const s = {
  page: { fontFamily: "'Segoe UI', sans-serif", color: "#222", minHeight: "100vh" },
  pageTitle: { fontSize: 26, fontWeight: 700, color: "#1a1a2e", marginBottom: 24 },
  card: { background: "#fff", borderRadius: 10, padding: "32px 36px", border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 24 },
  cardTitle: { fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 28, borderBottom: "1px solid #f0f0f0", paddingBottom: 12 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" },
  exportSide: {},
  importSide: { display: "flex", flexDirection: "column", gap: 16 },
  btnExport: { background: "linear-gradient(135deg,#2e7d32,#43a047)", color: "#fff", border: "none", borderRadius: 8, padding: "12px 28px", fontWeight: 600, fontSize: 15, cursor: "pointer" },
  previewTable: { marginTop: 20, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" },
  previewTitle: { background: "#f9fafb", padding: "10px 14px", fontSize: 13, fontWeight: 600, borderBottom: "1px solid #e5e7eb", color: "#374151" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: { padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "1px solid #e5e7eb" },
  td: { padding: "7px 10px", verticalAlign: "middle" },
  taxBadge: { background: "#dcfce7", color: "#15803d", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 500 },
  fileRow: { display: "flex", flexDirection: "column", gap: 8 },
  fileLabel: { fontWeight: 600, fontSize: 14, color: "#374151" },
  fileInputWrap: { display: "flex", alignItems: "center", gap: 10 },
  chooseBtn: { background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontSize: 13, color: "#374151" },
  fileName: { fontSize: 13, color: "#6b7280" },
  btnSubmit: { background: "linear-gradient(135deg,#2e7d32,#43a047)", color: "#fff", border: "none", borderRadius: 8, padding: "11px 32px", fontWeight: 600, fontSize: 15, cursor: "pointer", alignSelf: "flex-start" },
  alertSuccess: { background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 6, padding: "10px 16px", color: "#065f46", fontSize: 13 },
  alertError: { background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, padding: "10px 16px", color: "#991b1b", fontSize: 13 },
  divider: { border: "none", borderTop: "1px solid #f0f0f0", margin: "28px 0" },
  instructions: {},
  instrTitle: { fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 10 },
  instrList: { paddingLeft: 20, color: "#555", fontSize: 14, lineHeight: 2 },
  footer: { textAlign: "center", color: "#9ca3af", fontSize: 12, marginTop: 32 },
};