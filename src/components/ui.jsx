import { useState } from "react";
import AIAssistPanel from "./AIAssistPanel";

const inputBase = (small) => ({
  width: "100%",
  padding: small ? "8px 12px" : "12px 16px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  color: "#e0e0e0",
  fontSize: small ? "13px" : "14px",
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
});

export { inputBase };

function AIButton({ onClick }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      title="AI Assist"
      style={{
        width: "28px", height: "28px", borderRadius: "7px", cursor: "pointer",
        background: h ? "rgba(233,69,96,0.15)" : "rgba(255,255,255,0.03)",
        border: h ? "1px solid rgba(233,69,96,0.3)" : "1px solid rgba(255,255,255,0.06)",
        color: h ? "#e94560" : "#555", fontSize: "13px",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s", flexShrink: 0,
      }}
    >
      {"\u2726"}
    </button>
  );
}

export function TextInput({ label, value, onChange, placeholder, multiline, small, hint, noAI }) {
  const [showAI, setShowAI] = useState(false);
  const s = { ...inputBase(small), resize: multiline ? "vertical" : "none" };
  const f = e => { e.target.style.borderColor = "rgba(233,69,96,0.5)"; };
  const b = e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; };
  return (
    <div style={{ marginBottom: "16px" }}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <label style={{ fontSize: "13px", color: "#9e9e9e", fontWeight: 500 }}>{label}</label>
          {!noAI && <AIButton onClick={() => setShowAI(true)} />}
        </div>
      )}
      {hint && <p style={{ fontSize: "11px", color: "#666", margin: "0 0 6px 0", fontStyle: "italic" }}>{hint}</p>}
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4} style={s} onFocus={f} onBlur={b} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={s} onFocus={f} onBlur={b} />}
      {showAI && <AIAssistPanel fieldLabel={label} fieldHint={hint || placeholder} currentValue={value} isArray={false} onAccept={v => onChange(v)} onClose={() => setShowAI(false)} />}
    </div>
  );
}

export function ArrayInput({ label, values, onChange, placeholder, hint }) {
  const [showAI, setShowAI] = useState(false);
  const upd = (i, v) => { const n = [...values]; n[i] = v; onChange(n); };
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <label style={{ fontSize: "13px", color: "#9e9e9e", fontWeight: 500 }}>{label}</label>
        <AIButton onClick={() => setShowAI(true)} />
      </div>
      {hint && <p style={{ fontSize: "11px", color: "#666", margin: "0 0 8px 0", fontStyle: "italic" }}>{hint}</p>}
      {values.map((v, i) => (
        <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "center" }}>
          <span style={{ color: "#555", fontSize: "12px", minWidth: "20px" }}>{i + 1}.</span>
          <input type="text" value={v} onChange={e => upd(i, e.target.value)} placeholder={placeholder} style={{ ...inputBase(true), flex: 1, width: "auto" }} />
          {values.length > 1 && <button onClick={() => onChange(values.filter((_, x) => x !== i))} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "16px", padding: "4px 8px" }}>{"\u00D7"}</button>}
        </div>
      ))}
      <button onClick={() => onChange([...values, ""])} style={{ background: "none", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "6px", color: "#888", cursor: "pointer", padding: "6px 14px", fontSize: "12px", marginTop: "4px" }}>+ Add</button>
      {showAI && <AIAssistPanel fieldLabel={label} fieldHint={hint || placeholder} currentValue={values.filter(v => v?.trim()).join(", ")} isArray={true} onAccept={items => onChange(items)} onClose={() => setShowAI(false)} />}
    </div>
  );
}

export function ColorPicker({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: value, border: "2px solid rgba(255,255,255,0.1)", cursor: "pointer", overflow: "hidden", position: "relative", flexShrink: 0 }}>
        <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ opacity: 0, width: "100%", height: "100%", cursor: "pointer", position: "absolute", inset: 0 }} />
      </div>
      <div>
        <label style={{ display: "block", fontSize: "13px", color: "#9e9e9e", fontWeight: 500 }}>{label}</label>
        <span style={{ fontSize: "12px", color: "#666", fontFamily: "monospace" }}>{value}</span>
      </div>
    </div>
  );
}

export function Card({ title, description, children, accent }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "28px", marginBottom: "24px", borderLeft: accent ? `3px solid ${accent}` : undefined }}>
      {title && <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", color: "#fff", fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>{title}</h3>}
      {description && <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#666", lineHeight: 1.5 }}>{description}</p>}
      {children}
    </div>
  );
}

export function SectionHeader({ id, label, icon }) {
  return (
    <div id={id} style={{ paddingTop: "72px", marginTop: "-72px", marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
        <span style={{ fontSize: "18px", opacity: 0.6 }}>{icon}</span>
        <h2 style={{ fontSize: "26px", fontFamily: "'Playfair Display', serif", fontWeight: 600, color: "#fff", margin: 0 }}>{label}</h2>
      </div>
      <div style={{ width: "40px", height: "3px", background: "linear-gradient(90deg, #e94560, transparent)", borderRadius: "2px" }} />
    </div>
  );
}

export function ModeToggle({ enabled, onToggle, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
      <div onClick={onToggle} style={{ width: "42px", height: "24px", borderRadius: "12px", padding: "3px", background: enabled ? "#2ecc71" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: enabled ? "flex-end" : "flex-start", cursor: "pointer", transition: "all 0.3s" }}>
        <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
      </div>
      <span style={{ fontSize: "14px", fontWeight: 600, color: enabled ? "#fff" : "#555" }}>{label}</span>
      <span style={{ fontSize: "11px", color: enabled ? "#2ecc71" : "#666", padding: "2px 8px", borderRadius: "4px", background: enabled ? "rgba(46,204,113,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${enabled ? "rgba(46,204,113,0.2)" : "rgba(255,255,255,0.06)"}` }}>{enabled ? "ON" : "OFF"}</span>
    </div>
  );
}

export function CopyButton({ label, onCopy }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { onCopy(); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{ padding: "12px", borderRadius: "10px", cursor: "pointer", textAlign: "left", background: copied ? "rgba(46,204,113,0.08)" : "rgba(255,255,255,0.02)", border: copied ? "1px solid rgba(46,204,113,0.2)" : "1px solid rgba(255,255,255,0.06)" }}
    >
      <div style={{ fontSize: "12px", fontWeight: 600, color: copied ? "#2ecc71" : "#ccc" }}>{copied ? "\u2713 Copied" : label}</div>
    </button>
  );
}
