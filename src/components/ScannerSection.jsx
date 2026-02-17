import { useState } from "react";
import { SCAN_SOURCES } from "../constants";
import { Card } from "./ui";
import { inputBase } from "./ui";

export default function ScannerSection({ brand, onBrandUpdate }) {
  const [sources, setSources] = useState(SCAN_SOURCES.map(s => ({ ...s, url: "", enabled: false, status: "idle" })));
  const [phase, setPhase] = useState("setup");
  const [reviewFields, setReviewFields] = useState({});
  const [error, setError] = useState("");
  const [currentSrc, setCurrentSrc] = useState("");
  const [manualPaste, setManualPaste] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [scanLog, setScanLog] = useState([]);
  const enabled = sources.filter(s => s.enabled && s.url.trim());
  const addLog = msg => setScanLog(p => [...p, { t: new Date().toLocaleTimeString(), msg }]);

  const startScan = async () => {
    if (enabled.length === 0 && !manualPaste.trim()) { setError("Add at least one source."); return; }
    setError(""); setScanLog([]); setPhase("scraping");
    const results = [];
    for (const src of enabled) {
      setCurrentSrc(src.label); addLog(`Scanning ${src.label}...`);
      setSources(p => p.map(s => s.id === src.id ? { ...s, status: "scraping" } : s));
      try {
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514", max_tokens: 1000,
            tools: [{ type: "web_search_20250305", name: "web_search" }],
            messages: [{ role: "user", content: `Search "${src.url}" and extract brand identity from this ${src.label} page. Get: name, tagline, about, mission, tone, colors, fonts, CTAs, hashtags.` }],
          }),
        });
        if (r.ok) {
          const d = await r.json();
          results.push({ type: src.id, url: src.url, content: d.content.filter(i => i.type === "text").map(i => i.text).join("\n"), label: src.label });
          setSources(p => p.map(s => s.id === src.id ? { ...s, status: "done" } : s));
          addLog(`\u2713 ${src.label}`);
        } else {
          setSources(p => p.map(s => s.id === src.id ? { ...s, status: "error" } : s));
          addLog(`\u2717 ${src.label}`);
        }
      } catch {
        setSources(p => p.map(s => s.id === src.id ? { ...s, status: "error" } : s));
        addLog(`\u2717 ${src.label}`);
      }
    }
    if (manualPaste.trim()) { results.push({ type: "manual", url: "Manual", content: manualPaste, label: "Manual" }); addLog("\u2713 Manual"); }
    setCurrentSrc(""); setPhase("analyzing"); addLog("AI analyzing...");
    try {
      const srcTxt = results.filter(s => s.content?.trim()).map(s => `--- ${s.label} (${s.url}) ---\n${s.content}`).join("\n\n");
      const r2 = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 4000,
          messages: [{ role: "user", content: `Brand strategist. Analyze:\n\n${srcTxt}\n\nReturn ONLY valid JSON:\n{"brandName":"","tagline":"","about":"","mission":"","vision":"","coreValues":[""],"whyDifferent":"","archetype":"","enemy":"","enemyDescription":"","victim":"","victimPainPoints":[""],"victimDesiredOutcome":"","brandPromise":"","elevatorPitch":"","phrases":[""],"toneAttributes":[""],"doSay":[""],"dontSay":[""],"voiceExample":"","primaryFont":"","secondaryFont":"","primaryColor":"","secondaryColor":"","accentColor":"","ctaPrimary":"","ctaSecondary":"","hashTags":[""],"socialPersonality":"","logoDescription":"","sbCharacterWants":"","sbExternalProblem":"","sbInternalProblem":"","sbGuideEmpathy":"","sbGuideAuthority":"","sbPlanSteps":[""],"sbSuccessEnding":"","sbFailureEnding":"","sbOneLiner":""}\n\nArchetype: exactly one of "The Hero","The Sage","The Explorer","The Creator","The Ruler","The Caregiver","The Magician","The Rebel","The Jester","The Lover","The Everyman","The Innocent".` }],
        }),
      });
      if (r2.ok) {
        const d2 = await r2.json();
        const txt = d2.content.filter(i => i.type === "text").map(i => i.text).join("");
        setReviewFields(JSON.parse(txt.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim()));
        addLog("\u2713 Complete"); setPhase("review");
      } else { setError("Analysis failed."); setPhase("setup"); }
    } catch (e) { setError(`Error: ${e.message}`); setPhase("setup"); }
  };

  const applyResults = () => {
    const merged = { ...brand };
    Object.entries(reviewFields).forEach(([k, v]) => {
      if (k in merged && v && (typeof v === "string" ? v.trim() : Array.isArray(v) && v.some(x => x?.trim()))) merged[k] = v;
    });
    onBrandUpdate(merged); setPhase("done");
  };

  if (phase === "scraping" || phase === "analyzing") return (
    <Card accent="#e94560">
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <div style={{ width: "48px", height: "48px", margin: "0 auto 12px", borderRadius: "50%", border: "3px solid rgba(233,69,96,0.2)", borderTopColor: "#e94560", animation: "spin 1s linear infinite" }} />
        <div style={{ fontSize: "15px", color: "#fff", fontWeight: 600 }}>{phase === "scraping" ? `Scanning ${currentSrc}...` : "AI Extracting Brand..."}</div>
        <div style={{ fontSize: "12px", color: "#666", animation: "pulse2 2s infinite", marginBottom: "12px" }}>{phase === "scraping" ? "Fetching sources" : "Analyzing identity..."}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: "5px", flexWrap: "wrap", marginBottom: "10px" }}>
          {enabled.map(s => {
            const c = sources.find(x => x.id === s.id);
            return <span key={s.id} style={{ padding: "3px 8px", borderRadius: "5px", fontSize: "10px", background: c?.status === "done" ? "rgba(46,204,113,0.1)" : "rgba(233,69,96,0.1)", border: `1px solid ${c?.status === "done" ? "rgba(46,204,113,0.3)" : "rgba(233,69,96,0.3)"}`, color: c?.status === "done" ? "#2ecc71" : "#e94560" }}>{s.icon} {c?.status === "done" ? "\u2713" : "\u27F3"}</span>;
          })}
        </div>
        <div style={{ maxHeight: "80px", overflow: "auto", textAlign: "left", padding: "6px", background: "rgba(0,0,0,0.3)", borderRadius: "6px", maxWidth: "380px", margin: "0 auto" }}>
          {scanLog.map((l, i) => <div key={i} style={{ fontSize: "10px", color: "#777", fontFamily: "monospace" }}><span style={{ color: "#555" }}>{l.t}</span> {l.msg}</div>)}
        </div>
      </div>
    </Card>
  );

  if (phase === "review") {
    const fields = [
      { k: "brandName", l: "Brand Name" }, { k: "tagline", l: "Tagline" }, { k: "about", l: "About", lg: true }, { k: "mission", l: "Mission", lg: true },
      { k: "archetype", l: "Archetype" }, { k: "enemy", l: "Enemy" }, { k: "victim", l: "ICP", lg: true }, { k: "toneAttributes", l: "Tone", a: true },
      { k: "phrases", l: "Phrases", a: true }, { k: "sbOneLiner", l: "One-Liner" }, { k: "sbCharacterWants", l: "Character Wants" },
      { k: "sbExternalProblem", l: "External Problem" }, { k: "sbGuideEmpathy", l: "Guide Empathy", lg: true },
      { k: "primaryColor", l: "Primary Color" }, { k: "accentColor", l: "Accent Color" }, { k: "ctaPrimary", l: "CTA" },
    ];
    const filled = fields.filter(f => { const v = reviewFields[f.k]; return v && (typeof v === "string" ? v.trim() : Array.isArray(v) && v.some(x => x?.trim())); });
    return (
      <div>
        <Card title="Review AI Findings" accent="#f39c12">
          <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", background: "rgba(233,69,96,0.1)", border: "1px solid rgba(233,69,96,0.2)", color: "#e94560" }}>{filled.length} fields extracted</span>
        </Card>
        {filled.map(f => {
          const v = reviewFields[f.k];
          return (
            <Card key={f.k}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <label style={{ fontSize: "13px", color: "#e94560", fontWeight: 600 }}>{f.l}</label>
                <button onClick={() => setReviewFields(p => ({ ...p, [f.k]: f.a ? [""] : "" }))} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "11px" }}>{"\u2715"}</button>
              </div>
              {f.a
                ? (Array.isArray(v) ? v : [v]).filter(x => x?.trim()).map((x, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "5px" }}>
                      <span style={{ color: "#555", fontSize: "12px", minWidth: "20px" }}>{i + 1}.</span>
                      <input type="text" value={x} onChange={e => { const a = [...(Array.isArray(reviewFields[f.k]) ? reviewFields[f.k] : [])]; a[i] = e.target.value; setReviewFields(p => ({ ...p, [f.k]: a })); }} style={{ ...inputBase(true), flex: 1, width: "auto" }} />
                    </div>
                  ))
                : f.lg
                  ? <textarea value={v} onChange={e => setReviewFields(p => ({ ...p, [f.k]: e.target.value }))} rows={3} style={{ ...inputBase(false), resize: "vertical" }} />
                  : <input type="text" value={v} onChange={e => setReviewFields(p => ({ ...p, [f.k]: e.target.value }))} style={inputBase(false)} />}
            </Card>
          );
        })}
        <div style={{ display: "flex", gap: "12px", marginBottom: "40px" }}>
          <button onClick={() => setPhase("setup")} style={{ flex: 1, padding: "14px", borderRadius: "12px", cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#aaa", fontSize: "14px" }}>{"\u2190"} Back</button>
          <button onClick={applyResults} style={{ flex: 2, padding: "14px", borderRadius: "12px", cursor: "pointer", background: "linear-gradient(135deg, #e94560, #c62a42)", border: "none", color: "#fff", fontSize: "14px", fontWeight: 600 }}>{"\u2713"} Apply to Brand Board</button>
        </div>
      </div>
    );
  }

  if (phase === "done") return (
    <Card accent="#2ecc71">
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <div style={{ fontSize: "36px", marginBottom: "8px" }}>{"\u2713"}</div>
        <div style={{ fontSize: "17px", color: "#fff", fontWeight: 600, fontFamily: "'Playfair Display', serif", marginBottom: "6px" }}>Brand Board Populated!</div>
        <p style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>Scroll down to refine. Use {"\u2726"} buttons for AI assist.</p>
        <button onClick={() => setPhase("setup")} style={{ padding: "8px 18px", borderRadius: "8px", cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#aaa", fontSize: "12px" }}>Scan More</button>
      </div>
    </Card>
  );

  return (
    <div>
      <Card title="AI Brand Scanner" description="Point AI at your online presence to auto-populate the board." accent="#e94560">
        <div style={{ padding: "10px", background: "rgba(233,69,96,0.05)", borderRadius: "8px", border: "1px solid rgba(233,69,96,0.12)" }}>
          <p style={{ fontSize: "12px", color: "#ccc", margin: 0, lineHeight: 1.5 }}>
            <strong style={{ color: "#e94560" }}>How it works:</strong> Enable sources {"\u2192"} Enter URLs {"\u2192"} Scan {"\u2192"} Review {"\u2192"} Apply. Or use {"\u2726"} AI Assist on individual fields.
          </p>
        </div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
        {sources.map(s => (
          <div key={s.id} style={{ padding: "14px", borderRadius: "12px", background: s.enabled ? "rgba(233,69,96,0.06)" : "rgba(255,255,255,0.02)", border: s.enabled ? "1px solid rgba(233,69,96,0.25)" : "1px solid rgba(255,255,255,0.06)", transition: "all 0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }} onClick={() => setSources(p => p.map(x => x.id === s.id ? { ...x, enabled: !x.enabled } : x))}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px" }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: s.enabled ? "#fff" : "#888" }}>{s.label}</div>
                  <div style={{ fontSize: "10px", color: "#555" }}>{s.desc}</div>
                </div>
              </div>
              <div style={{ width: "32px", height: "18px", borderRadius: "9px", padding: "2px", background: s.enabled ? "#e94560" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: s.enabled ? "flex-end" : "flex-start", transition: "all 0.3s", flexShrink: 0 }}>
                <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#fff" }} />
              </div>
            </div>
            {s.enabled && (
              <input type="text" value={s.url} onChange={e => setSources(p => p.map(x => x.id === s.id ? { ...x, url: e.target.value } : x))} placeholder={s.placeholder} onClick={e => e.stopPropagation()} style={{ ...inputBase(true), marginTop: "8px", background: "rgba(0,0,0,0.3)" }} />
            )}
          </div>
        ))}
      </div>
      <Card title="Manual Paste">
        <button onClick={() => setShowPaste(!showPaste)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#888", cursor: "pointer", padding: "8px 14px", fontSize: "12px", marginBottom: showPaste ? "10px" : "0" }}>
          {showPaste ? "\u25BE Hide" : "\u25B8 Show"}
        </button>
        {showPaste && <textarea value={manualPaste} onChange={e => setManualPaste(e.target.value)} placeholder="Paste brand content..." rows={4} style={{ ...inputBase(false), background: "rgba(0,0,0,0.3)", resize: "vertical" }} />}
      </Card>
      {error && <div style={{ padding: "10px 14px", background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.2)", borderRadius: "8px", marginBottom: "14px", fontSize: "13px", color: "#e74c3c" }}>{error}</div>}
      <button onClick={startScan} style={{ width: "100%", padding: "14px", borderRadius: "12px", cursor: "pointer", background: (enabled.length > 0 || manualPaste.trim()) ? "linear-gradient(135deg, #e94560, #c62a42)" : "rgba(255,255,255,0.04)", border: "none", color: (enabled.length > 0 || manualPaste.trim()) ? "#fff" : "#555", fontSize: "15px", fontWeight: 600, opacity: (enabled.length > 0 || manualPaste.trim()) ? 1 : 0.5, marginBottom: "32px" }}>
        {"\u26A1"} Scan & Analyze{enabled.length > 0 ? ` (${enabled.length})` : ""}
      </button>
    </div>
  );
}
