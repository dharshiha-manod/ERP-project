import { useState, useRef, useEffect } from "react";

// ── Tiny Rich Text Toolbar ────────────────────────────────────────────────────
function RichEditor({ placeholder = "Enter text here..." }) {
  const editorRef = useRef(null);

  const exec = (cmd, value = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
  };

  const insertTag = (tag) => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const node = document.createTextNode(tag);
      range.insertNode(node);
      range.setStartAfter(node);
      range.setEndAfter(node);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  const toolbarBtns = [
    { label: "B", title: "Bold", cmd: "bold", style: { fontWeight: "700" } },
    { label: "I", title: "Italic", cmd: "italic", style: { fontStyle: "italic" } },
    { label: "U", title: "Underline", cmd: "underline", style: { textDecoration: "underline" } },
    { label: "S", title: "Strikethrough", cmd: "strikeThrough", style: { textDecoration: "line-through" } },
  ];

  const alignBtns = [
    { label: "≡L", title: "Align Left", cmd: "justifyLeft" },
    { label: "≡C", title: "Align Center", cmd: "justifyCenter" },
    { label: "≡R", title: "Align Right", cmd: "justifyRight" },
  ];

  const listBtns = [
    { label: "• List", title: "Unordered List", cmd: "insertUnorderedList" },
    { label: "1. List", title: "Ordered List", cmd: "insertOrderedList" },
  ];

  return (
    <div className="nte-wrap">
      <div className="nte-toolbar">
        <select
          className="nte-select"
          onChange={(e) => exec("formatBlock", e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Paragraph</option>
          <option value="p">Paragraph</option>
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
        </select>

        {toolbarBtns.map((b) => (
          <button
            key={b.cmd}
            title={b.title}
            className="nte-btn"
            onMouseDown={(e) => { e.preventDefault(); exec(b.cmd); }}
            style={b.style}
          >
            {b.label}
          </button>
        ))}

        <span className="nte-divider" />

        {alignBtns.map((b) => (
          <button
            key={b.cmd}
            title={b.title}
            className="nte-btn"
            onMouseDown={(e) => { e.preventDefault(); exec(b.cmd); }}
          >
            {b.label}
          </button>
        ))}

        <span className="nte-divider" />

        {listBtns.map((b) => (
          <button
            key={b.cmd}
            title={b.title}
            className="nte-btn nte-btn-sm"
            onMouseDown={(e) => { e.preventDefault(); exec(b.cmd); }}
          >
            {b.label}
          </button>
        ))}

        <span className="nte-divider" />

        <button className="nte-btn" title="Insert Link" onMouseDown={(e) => {
          e.preventDefault();
          const url = prompt("Enter URL:");
          if (url) exec("createLink", url);
        }}>🔗</button>

        <button className="nte-btn" title="Remove Format" onMouseDown={(e) => {
          e.preventDefault(); exec("removeFormat");
        }}>✕</button>
      </div>

      <div
        ref={editorRef}
        className="nte-body"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
      />

      <div className="nte-footer">
        <span className="nte-powered">POWERED BY TINY</span>
      </div>
    </div>
  );
}

// ── Section component ─────────────────────────────────────────────────────────
function NotifSection({ title, tabs, tagsGroups }) {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="nt-section">
      <h2 className="nt-section-title">{title}</h2>

      {/* Tabs */}
      <div className="nt-tabs">
        {tabs.map((t) => (
          <button
            key={t}
            className={`nt-tab${activeTab === t ? " active" : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Available Tags */}
      <div className="nt-tags-block">
        <span className="nt-tags-label">Available Tags:</span>
        {tagsGroups.map((grp, i) => (
          <div key={i} className="nt-tags-row">
            {grp.map((tag) => (
              <span key={tag} className="nt-tag">{tag}</span>
            ))}
          </div>
        ))}
      </div>

      {/* Email Subject */}
      <div className="nt-field-group">
        <label className="nt-label">Email Subject:</label>
        <input className="nt-input" placeholder="Email Subject" />
      </div>

      {/* CC / BCC */}
      <div className="nt-row">
        <div className="nt-field-group nt-half">
          <label className="nt-label">CC:</label>
          <input className="nt-input" placeholder="CC" />
        </div>
        <div className="nt-field-group nt-half">
          <label className="nt-label">BCC:</label>
          <input className="nt-input" placeholder="BCC" />
        </div>
      </div>

      {/* Email Body */}
      <div className="nt-field-group">
        <label className="nt-label">Email Body:</label>
        <RichEditor placeholder="Email Body" />
      </div>

      {/* SMS Body */}
      <div className="nt-field-group">
        <label className="nt-label">SMS Body:</label>
        <textarea className="nt-textarea" placeholder="SMS Body" rows={4} />
      </div>

      {/* WhatsApp Text */}
      <div className="nt-field-group">
        <label className="nt-label">Whatsapp Text:</label>
        <textarea className="nt-textarea" placeholder="Whatsapp Text" rows={4} />
      </div>

      {/* Auto-send checkboxes */}
      <div className="nt-checkboxes">
        {["Auto Send Email", "Auto Send SMS", "Auto send Whatsapp notification"].map((label) => (
          <label key={label} className="nt-checkbox-label">
            <input type="checkbox" className="nt-checkbox" />
            {label}
          </label>
        ))}
      </div>

      <div className="nt-info-bar">Business logo will not work in SMS.</div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NotificationTemplates() {
  const sections = [
    {
      title: "Notifications:",
      tabs: ["Send Ledger"],
      tagsGroups: [
        ["{business_name}", "{business_logo}"],
        ["{balance_due}"],
        ["{contact_name}", "{contact_custom_field_1}", "{contact_custom_field_2}",
          "{contact_custom_field_3}", "{contact_custom_field_4}", "{contact_custom_field_5}",
          "{contact_custom_field_6}", "{contact_custom_field_7}", "{contact_custom_field_8}",
          "{contact_custom_field_9}", "{contact_custom_field_10}"],
      ],
    },
    {
      title: "Customer Notifications:",
      tabs: ["New Sale", "Payment Received", "Payment Reminder", "New Booking", "New Quotation"],
      tagsGroups: [
        ["{business_name}", "{business_logo}"],
        ["{invoice_number}", "{invoice_url}", "{total_amount}", "{paid_amount}", "{due_amount}", "{cumulative_due_amount}", "{due_date}"],
        ["{location_name}", "{location_address}", "{location_email}", "{location_phone}", "{location_custom_field_1}", "{location_custom_field_2}", "{location_custom_field_3}", "{location_custom_field_4}"],
        ["{contact_name}", "{contact_custom_field_1}", "{contact_custom_field_2}", "{contact_custom_field_3}", "{contact_custom_field_4}", "{contact_custom_field_5}", "{contact_custom_field_6}", "{contact_custom_field_7}", "{contact_custom_field_8}", "{contact_custom_field_9}", "{contact_custom_field_10}"],
        ["{sell_custom_field_1}", "{sell_custom_field_2}", "{sell_custom_field_3}", "{sell_custom_field_4}"],
        ["{shipping_custom_field_1}", "{shipping_custom_field_2}", "{shipping_custom_field_3}", "{shipping_custom_field_4}", "{shipping_custom_field_5}"],
      ],
    },
    {
      title: "Supplier Notifications:",
      tabs: ["New Order", "Payment Paid", "Items Received", "Items Pending", "Purchase Order"],
      tagsGroups: [
        ["{business_name}", "{business_logo}"],
        ["{order_ref_number}", "{total_amount}", "{received_amount}", "{due_amount}"],
        ["{location_name}", "{location_address}", "{location_email}", "{location_phone}", "{location_custom_field_1}", "{location_custom_field_2}", "{location_custom_field_3}", "{location_custom_field_4}"],
        ["{purchase_custom_field_1}", "{purchase_custom_field_2}", "{purchase_custom_field_3}", "{purchase_custom_field_4}", "{contact_business_name}"],
        ["{contact_name}", "{contact_custom_field_1}", "{contact_custom_field_2}", "{contact_custom_field_3}", "{contact_custom_field_4}", "{contact_custom_field_5}", "{contact_custom_field_6}", "{contact_custom_field_7}", "{contact_custom_field_8}", "{contact_custom_field_9}", "{contact_custom_field_10}"],
        ["{shipping_custom_field_1}", "{shipping_custom_field_2}", "{shipping_custom_field_3}", "{shipping_custom_field_4}", "{shipping_custom_field_5}"],
      ],
    },
  ];

  return (
    <>
      <style>{`
        /* ── Page ── */
        .nt-page { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2d3a2e; }
        .nt-heading {
          font-size: 1.6rem;
          font-weight: 700;
          color: #1a2e1c;
          margin-bottom: 24px;
          letter-spacing: -0.3px;
        }

        /* ── Section card ── */
        .nt-section {
          background: #fff;
          border-radius: 10px;
          border: 1px solid #dde8de;
          padding: 28px 32px;
          margin-bottom: 28px;
          box-shadow: 0 1px 4px rgba(0,60,20,.06);
        }
        .nt-section-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #1a6b35;
          margin: 0 0 16px;
          padding-bottom: 10px;
          border-bottom: 2px solid #1a6b35;
          display: inline-block;
        }

        /* ── Tabs ── */
        .nt-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 20px;
          border-bottom: 1px solid #e0e9e1;
          padding-bottom: 0;
        }
        .nt-tab {
          padding: 8px 18px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          color: #5a7060;
          margin-bottom: -1px;
          transition: color .15s, border-color .15s;
        }
        .nt-tab:hover { color: #1a6b35; }
        .nt-tab.active {
          color: #1a6b35;
          border-bottom-color: #1a6b35;
          font-weight: 600;
        }

        /* ── Tags ── */
        .nt-tags-block {
          background: #f4f8f5;
          border: 1px solid #d8e8db;
          border-radius: 6px;
          padding: 14px 16px;
          margin-bottom: 22px;
        }
        .nt-tags-label {
          font-weight: 700;
          font-size: 0.85rem;
          color: #2d3a2e;
          display: block;
          margin-bottom: 8px;
        }
        .nt-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 6px;
        }
        .nt-tag {
          font-size: 0.78rem;
          background: #e2f0e5;
          color: #1a5c30;
          border-radius: 4px;
          padding: 2px 8px;
          font-family: 'Courier New', monospace;
          border: 1px solid #c3ddc9;
        }

        /* ── Fields ── */
        .nt-field-group { margin-bottom: 18px; }
        .nt-row { display: flex; gap: 16px; margin-bottom: 18px; }
        .nt-half { flex: 1; margin-bottom: 0; }
        .nt-label {
          display: block;
          font-size: 0.88rem;
          font-weight: 600;
          color: #374a38;
          margin-bottom: 6px;
        }
        .nt-input, .nt-textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 9px 12px;
          border: 1px solid #c8d9ca;
          border-radius: 6px;
          font-size: 0.9rem;
          color: #2d3a2e;
          background: #fafcfa;
          transition: border-color .15s, box-shadow .15s;
          outline: none;
          font-family: inherit;
        }
        .nt-input:focus, .nt-textarea:focus {
          border-color: #2a8c50;
          box-shadow: 0 0 0 3px rgba(42,140,80,.12);
        }
        .nt-textarea { resize: vertical; }

        /* ── Rich Editor ── */
        .nte-wrap {
          border: 1px solid #c8d9ca;
          border-radius: 6px;
          overflow: hidden;
          background: #fff;
        }
        .nte-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 2px;
          padding: 6px 10px;
          background: #f0f6f2;
          border-bottom: 1px solid #d4e4d7;
        }
        .nte-btn {
          padding: 4px 9px;
          background: none;
          border: 1px solid transparent;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.82rem;
          color: #374a38;
          transition: background .12s, border-color .12s;
          line-height: 1.4;
        }
        .nte-btn:hover { background: #d8eedd; border-color: #b0ccb5; }
        .nte-btn-sm { font-size: 0.75rem; }
        .nte-select {
          padding: 4px 8px;
          border: 1px solid #c8d9ca;
          border-radius: 4px;
          background: #fff;
          font-size: 0.82rem;
          color: #374a38;
          cursor: pointer;
          margin-right: 4px;
        }
        .nte-divider {
          width: 1px;
          height: 20px;
          background: #c8d9ca;
          margin: 0 4px;
        }
        .nte-body {
          min-height: 140px;
          padding: 14px;
          font-size: 0.92rem;
          color: #2d3a2e;
          outline: none;
          line-height: 1.6;
        }
        .nte-body:empty::before {
          content: attr(data-placeholder);
          color: #aab8ac;
        }
        .nte-footer {
          padding: 4px 10px;
          background: #f0f6f2;
          border-top: 1px solid #d4e4d7;
          text-align: right;
        }
        .nte-powered { font-size: 0.72rem; color: #7a9a7f; }

        /* ── Checkboxes ── */
        .nt-checkboxes {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin: 18px 0 14px;
        }
        .nt-checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.88rem;
          color: #374a38;
          cursor: pointer;
        }
        .nt-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #1a6b35;
          cursor: pointer;
        }

        /* ── Info bar ── */
        .nt-info-bar {
          background: #fff3cd;
          border: 1px solid #f0c040;
          border-radius: 6px;
          padding: 10px 16px;
          font-size: 0.85rem;
          color: #7a5a00;
          margin-top: 10px;
        }

        /* ── Save button ── */
        .nt-save-wrap {
          display: flex;
          justify-content: center;
          margin-top: 32px;
          margin-bottom: 8px;
        }
        .nt-save-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 52px;
          background: linear-gradient(135deg, #2d7a4a 0%, #1a5c30 40%, #145228 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(26,92,48,.35), 0 1px 3px rgba(0,0,0,.15);
          transition: transform .15s, box-shadow .15s;
          letter-spacing: 0.3px;
        }
        .nt-save-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 22px rgba(26,92,48,.45), 0 2px 6px rgba(0,0,0,.15);
        }
        .nt-save-btn:active { transform: translateY(0); }
        .nt-save-icon { font-size: 1.1rem; }
      `}</style>

      <div className="nt-page">
        <h1 className="nt-heading">Notification Templates</h1>

        {sections.map((s) => (
          <NotifSection
            key={s.title}
            title={s.title}
            tabs={s.tabs}
            tagsGroups={s.tagsGroups}
          />
        ))}

        <div className="nt-save-wrap">
          <button className="nt-save-btn">
            <span className="nt-save-icon">💾</span>
            Save
          </button>
        </div>
      </div>
    </>
  );
}