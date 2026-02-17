import { useState, useEffect, useRef, useContext } from "react";
import { BrandContext } from "./BrandContext";

export default function AIAssistPanel({ fieldLabel, fieldHint, currentValue, isArray, onAccept, onClose }) {
  const { brand } = useContext(BrandContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [quickUsed, setQuickUsed] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const brandSummary = () => {
    const p = [];
    if (brand.brandName) p.push(`Brand: ${brand.brandName}`);
    if (brand.tagline) p.push(`Tagline: ${brand.tagline}`);
    if (brand.about) p.push(`About: ${brand.about}`);
    if (brand.mission) p.push(`Mission: ${brand.mission}`);
    if (brand.archetype) p.push(`Archetype: ${brand.archetype}`);
    if (brand.enemy) p.push(`Enemy: ${brand.enemy}`);
    if (brand.victim) p.push(`ICP: ${brand.victim}`);
    const tone = brand.toneAttributes?.filter(t => t.trim());
    if (tone?.length) p.push(`Tone: ${tone.join(", ")}`);
    const vals = brand.coreValues?.filter(v => v.trim());
    if (vals?.length) p.push(`Values: ${vals.join(", ")}`);
    if (brand.sbOneLiner) p.push(`One-liner: ${brand.sbOneLiner}`);
    return p.join("\n");
  };

  const systemPrompt = `You are a world-class brand strategist helping build a brand board. You're helping with the "${fieldLabel}" field.\n\nBRAND CONTEXT:\n${brandSummary() || "(No brand data yet)"}\n\nFIELD: ${fieldLabel}\n${fieldHint ? `HINT: ${fieldHint}` : ""}\n${currentValue ? `CURRENT: ${currentValue}` : "(Empty)"}\n${isArray ? "Return a LIST \u2014 one item per line, no bullets or numbers." : "Return a single cohesive piece of text."}\n\nBe concise, direct, no preamble. Output content ready to use.`;

  const callAI = async (userMsg) => {
    setLoading(true);
    const apiMsgs = [...messages.map(m => ({ role: m.role, content: m.content })), { role: "user", content: userMsg }];
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: systemPrompt, messages: apiMsgs }),
      });
      if (r.ok) {
        const d = await r.json();
        const t = d.content.filter(i => i.type === "text").map(i => i.text).join("");
        setMessages(p => [...p, { role: "user", content: userMsg }, { role: "assistant", content: t }]);
        setGeneratedContent(t);
      } else {
        setMessages(p => [...p, { role: "user", content: userMsg }, { role: "assistant", content: `Error: ${r.status}. Configure your API key to enable AI assist.` }]);
      }
    } catch (e) {
      setMessages(p => [...p, { role: "user", content: userMsg }, { role: "assistant", content: `Error: ${e.message}` }]);
    }
    setLoading(false);
  };

  const handleSend = () => { if (!input.trim()) return; const m = input.trim(); setInput(""); callAI(m); };

  const handleAccept = () => {
    if (!generatedContent) return;
    if (isArray) {
      onAccept(generatedContent.split("\n").map(s => s.replace(/^[\d\-\.\)\*\u2022]+\s*/, "").trim()).filter(s => s));
    } else {
      onAccept(generatedContent.trim());
    }
    onClose();
  };

  const hasCtx = brandSummary().length > 20;
  const quickPrompts = quickUsed ? [] : [
    ...(hasCtx
      ? [{ l: "\u2728 Generate", p: `Generate the best "${fieldLabel}" for this brand.` }, { l: "\uD83D\uDD04 Improve", p: `Improve: "${currentValue || "(empty)"}"` }]
      : [{ l: "\u2728 Brainstorm", p: `Help me brainstorm "${fieldLabel}". Ask 2-3 quick questions.` }]),
    { l: "\uD83D\uDCDD 3 Options", p: `Write 3 different options for "${fieldLabel}".` },
    ...(isArray ? [{ l: "\uD83D\uDCCB List", p: `Generate a comprehensive list for "${fieldLabel}".` }] : []),
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", animation: "fadeIn 0.2s ease" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: "540px", maxHeight: "80vh", borderRadius: "20px", background: "linear-gradient(180deg, #141420 0%, #0e0e18 100%)", border: "1px solid rgba(233,69,96,0.2)", boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(233,69,96,0.08)", display: "flex", flexDirection: "column", overflow: "hidden", animation: "slideUp 0.25s ease" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", background: "linear-gradient(135deg, #e94560, #f39c12)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{"\u2726"}</span>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>AI Assist</span>
            </div>
            <div style={{ fontSize: "11px", color: "#e94560", marginTop: "2px" }}>{fieldLabel}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#777", cursor: "pointer", padding: "6px 12px", fontSize: "12px" }}>ESC</button>
        </div>

        {/* Chat body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", minHeight: "200px" }}>
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.3 }}>{"\u2726"}</div>
              <p style={{ fontSize: "13px", color: "#666", marginBottom: "16px" }}>Generate content for <strong style={{ color: "#e94560" }}>{fieldLabel}</strong></p>
              {currentValue && (
                <div style={{ textAlign: "left", padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "16px" }}>
                  <div style={{ fontSize: "10px", color: "#555", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Current</div>
                  <div style={{ fontSize: "12px", color: "#888", lineHeight: 1.4 }}>{typeof currentValue === "string" ? currentValue : Array.isArray(currentValue) ? currentValue.filter(v => v?.trim()).join(", ") : ""}</div>
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
                {quickPrompts.map((q, i) => (
                  <button key={i} onClick={() => { setQuickUsed(true); callAI(q.p); }} style={{ padding: "8px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", background: "rgba(233,69,96,0.08)", border: "1px solid rgba(233,69,96,0.2)", color: "#e94560", fontWeight: 500 }}>{q.l}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: "14px", display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "90%", padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? "rgba(233,69,96,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${m.role === "user" ? "rgba(233,69,96,0.2)" : "rgba(255,255,255,0.06)"}` }}>
                <div style={{ fontSize: "13px", color: m.role === "user" ? "#eee" : "#ccc", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.content}</div>
              </div>
              {m.role === "assistant" && i === messages.length - 1 && (
                <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                  <button onClick={handleAccept} style={{ padding: "7px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 600, background: "linear-gradient(135deg, #e94560, #c62a42)", border: "none", color: "#fff" }}>{"\u2713"} Accept & Insert</button>
                  <button onClick={() => callAI("Regenerate \u2014 different version.")} style={{ padding: "7px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#aaa" }}>{"\u21BB"} Regenerate</button>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 0" }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#e94560", animation: `pulse 1.2s infinite ${i * 0.2}s` }} />)}
              <span style={{ fontSize: "12px", color: "#666" }}>Generating...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              ref={inputRef} type="text" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={messages.length > 0 ? "Refine or adjust..." : `Describe what you want for "${fieldLabel}"...`}
              style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#e0e0e0", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }}
              onFocus={e => { e.target.style.borderColor = "rgba(233,69,96,0.4)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
            />
            <button onClick={handleSend} disabled={loading || !input.trim()} style={{ padding: "10px 18px", borderRadius: "10px", cursor: loading ? "wait" : "pointer", background: input.trim() ? "linear-gradient(135deg, #e94560, #c62a42)" : "rgba(255,255,255,0.04)", border: "none", color: input.trim() ? "#fff" : "#555", fontSize: "13px", fontWeight: 600, opacity: loading ? 0.5 : 1 }}>{"\u2192"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
