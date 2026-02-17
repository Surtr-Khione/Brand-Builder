import { useState } from "react";
import { Card } from "./ui";
import { inputBase } from "./ui";

const IMPORT_METHODS = [
  { id: "paste", icon: "\uD83D\uDCCB", label: "Paste Everything", desc: "Dump all your brand content into one box" },
  { id: "file", icon: "\uD83D\uDCC4", label: "Upload Files", desc: "PDF, DOCX, TXT, JSON, or Markdown" },
  { id: "json", icon: "{ }", label: "Import JSON", desc: "Import a previously exported brand board" },
];

export default function BrandDumpSection({ brand, onBrandUpdate }) {
  const [method, setMethod] = useState("paste");
  const [dumpText, setDumpText] = useState("");
  const [phase, setPhase] = useState("input"); // input | processing | review | done
  const [extractedFields, setExtractedFields] = useState({});
  const [fieldCount, setFieldCount] = useState(0);
  const [error, setError] = useState("");
  const [fileNames, setFileNames] = useState([]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFileNames(files.map(f => f.name));
    const readers = files.map(f => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve({ name: f.name, content: ev.target.result });
        reader.readAsText(f);
      });
    });
    Promise.all(readers).then(results => {
      setDumpText(results.map(r => `--- ${r.name} ---\n${r.content}`).join("\n\n"));
    });
  };

  const handleJSONImport = (text) => {
    try {
      const parsed = JSON.parse(text);
      // Check if it's our export format (has _meta.schema)
      if (parsed._meta?.schema?.startsWith("brand-board")) {
        const flat = flattenExportJSON(parsed);
        const merged = { ...brand };
        let count = 0;
        Object.entries(flat).forEach(([k, v]) => {
          if (k in merged && v && (typeof v === "string" ? v.trim() : Array.isArray(v) && v.length > 0)) {
            merged[k] = v;
            count++;
          }
        });
        setFieldCount(count);
        onBrandUpdate(merged);
        setPhase("done");
        return true;
      }
      // Try as a flat brand object
      const merged = { ...brand };
      let count = 0;
      Object.entries(parsed).forEach(([k, v]) => {
        if (k in merged && v) { merged[k] = v; count++; }
      });
      setFieldCount(count);
      onBrandUpdate(merged);
      setPhase("done");
      return true;
    } catch {
      return false;
    }
  };

  // Flatten our export JSON back to the flat brand state shape
  const flattenExportJSON = (data) => {
    const flat = {};
    if (data.brand) {
      if (data.brand.name) flat.brandName = data.brand.name;
      if (data.brand.tagline) flat.tagline = data.brand.tagline;
      if (data.brand.elevatorPitch) flat.elevatorPitch = data.brand.elevatorPitch;
      if (data.brand.brandPromise) flat.brandPromise = data.brand.brandPromise;
    }
    if (data.identity) {
      if (data.identity.about) flat.about = data.identity.about;
      if (data.identity.mission) flat.mission = data.identity.mission;
      if (data.identity.vision) flat.vision = data.identity.vision;
      if (data.identity.coreValues?.length) flat.coreValues = data.identity.coreValues;
      if (data.identity.whyDifferent) flat.whyDifferent = data.identity.whyDifferent;
      if (data.identity.originStory) flat.originStory = data.identity.originStory;
      if (data.identity.differentiators?.length) flat.competitorDiff = data.identity.differentiators;
    }
    if (data.storyBrand) {
      const sb = data.storyBrand;
      if (sb.characterWants) flat.sbCharacterWants = sb.characterWants;
      if (sb.problem?.external) flat.sbExternalProblem = sb.problem.external;
      if (sb.problem?.internal) flat.sbInternalProblem = sb.problem.internal;
      if (sb.problem?.philosophical) flat.sbPhilosophicalProblem = sb.problem.philosophical;
      if (sb.guide?.empathy) flat.sbGuideEmpathy = sb.guide.empathy;
      if (sb.guide?.authority) flat.sbGuideAuthority = sb.guide.authority;
      if (sb.plan?.length) flat.sbPlanSteps = sb.plan;
      if (sb.cta?.direct) flat.sbDirectCTA = sb.cta.direct;
      if (sb.cta?.transitional) flat.sbTransitionalCTA = sb.cta.transitional;
      if (sb.success) flat.sbSuccessEnding = sb.success;
      if (sb.failure) flat.sbFailureEnding = sb.failure;
      if (sb.transformation) flat.sbTransformation = sb.transformation;
      if (sb.oneLiner) flat.sbOneLiner = sb.oneLiner;
    }
    if (data.archetype) {
      if (data.archetype.primary) flat.archetype = data.archetype.primary;
      if (data.archetype.secondary) flat.secondaryArchetype = data.archetype.secondary;
      if (data.archetype.enemy?.name) flat.enemy = data.archetype.enemy.name;
      if (data.archetype.enemy?.description) flat.enemyDescription = data.archetype.enemy.description;
      if (data.archetype.victim?.icp) flat.victim = data.archetype.victim.icp;
      if (data.archetype.victim?.painPoints?.length) flat.victimPainPoints = data.archetype.victim.painPoints;
      if (data.archetype.victim?.desiredOutcome) flat.victimDesiredOutcome = data.archetype.victim.desiredOutcome;
    }
    if (data.voice) {
      if (data.voice.tone?.length) flat.toneAttributes = data.voice.tone;
      if (data.voice.phrases?.length) flat.phrases = data.voice.phrases;
      if (data.voice.doSay?.length) flat.doSay = data.voice.doSay;
      if (data.voice.dontSay?.length) flat.dontSay = data.voice.dontSay;
      if (data.voice.example) flat.voiceExample = data.voice.example;
      if (data.voice.social) flat.socialPersonality = data.voice.social;
      if (data.voice.emailSignoff) flat.emailSignoff = data.voice.emailSignoff;
      if (data.voice.cta?.primary) flat.ctaPrimary = data.voice.cta.primary;
      if (data.voice.cta?.secondary) flat.ctaSecondary = data.voice.cta.secondary;
      if (data.voice.hashtags?.length) flat.hashTags = data.voice.hashtags;
      if (data.voice.touchpoints) {
        const tp = data.voice.touchpoints;
        if (tp.website) flat.touchpointWebsite = tp.website;
        if (tp.social) flat.touchpointSocial = tp.social;
        if (tp.email) flat.touchpointEmail = tp.email;
        if (tp.ads) flat.touchpointAds = tp.ads;
        if (tp.sales) flat.touchpointSales = tp.sales;
        if (tp.support) flat.touchpointSupport = tp.support;
      }
    }
    if (data.typography) {
      if (data.typography.primary) flat.primaryFont = data.typography.primary;
      if (data.typography.secondary) flat.secondaryFont = data.typography.secondary;
      if (data.typography.accent) flat.accentFont = data.typography.accent;
      if (data.typography.rules) flat.typographyRules = data.typography.rules;
    }
    if (data.colors) {
      if (data.colors.primary) flat.primaryColor = data.colors.primary;
      if (data.colors.secondary) flat.secondaryColor = data.colors.secondary;
      if (data.colors.accent) flat.accentColor = data.colors.accent;
    }
    if (data.messaging) {
      if (data.messaging.boilerplate) flat.boilerplate = data.messaging.boilerplate;
      if (data.messaging.keyMessages?.length) flat.keyMessages = data.messaging.keyMessages;
    }
    return flat;
  };

  const processDump = async () => {
    if (!dumpText.trim()) { setError("Paste or upload some content first."); return; }
    setError("");

    // Try JSON import first
    if (method === "json" || dumpText.trim().startsWith("{")) {
      if (handleJSONImport(dumpText.trim())) return;
      if (method === "json") { setError("Invalid JSON. Make sure it's a valid brand board export."); return; }
    }

    // AI-powered extraction
    setPhase("processing");
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [{ role: "user", content: `You are a brand strategist. I'm dumping raw brand materials below. Extract and organize them into this exact JSON structure. Only fill fields you can confidently extract from the content. Leave empty strings for fields with no data.

RAW BRAND MATERIALS:
${dumpText}

Return ONLY valid JSON matching this structure:
{
  "brandName": "", "tagline": "", "about": "", "mission": "", "vision": "",
  "coreValues": [], "whyDifferent": "", "archetype": "",
  "enemy": "", "enemyDescription": "", "victim": "",
  "victimPainPoints": [], "victimDesiredOutcome": "",
  "brandPromise": "", "elevatorPitch": "", "originStory": "",
  "boilerplate": "", "keyMessages": [],
  "phrases": [], "toneAttributes": [], "doSay": [], "dontSay": [],
  "voiceExample": "", "socialPersonality": "",
  "primaryFont": "", "secondaryFont": "",
  "primaryColor": "", "secondaryColor": "", "accentColor": "",
  "ctaPrimary": "", "ctaSecondary": "", "hashTags": [],
  "logoDescription": "", "videoStyle": "", "musicStyle": "",
  "sbCharacterWants": "", "sbExternalProblem": "", "sbInternalProblem": "",
  "sbGuideEmpathy": "", "sbGuideAuthority": "",
  "sbPlanSteps": [], "sbSuccessEnding": "", "sbFailureEnding": "",
  "sbOneLiner": "", "sbTransformation": "",
  "photoStyle": "", "iconStyle": ""
}

For archetype, use exactly one of: "The Hero","The Sage","The Explorer","The Creator","The Ruler","The Caregiver","The Magician","The Rebel","The Jester","The Lover","The Everyman","The Innocent".
For colors, use hex format (#000000).
Be thorough but accurate. Don't fabricate \u2014 only extract what's actually in the materials.` }],
        }),
      });

      if (r.ok) {
        const d = await r.json();
        const txt = d.content.filter(i => i.type === "text").map(i => i.text).join("");
        const parsed = JSON.parse(txt.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim());

        // Count non-empty extracted fields
        let count = 0;
        Object.entries(parsed).forEach(([, v]) => {
          if (v && (typeof v === "string" ? v.trim() : Array.isArray(v) && v.some(x => x?.trim()))) count++;
        });

        setExtractedFields(parsed);
        setFieldCount(count);
        setPhase("review");
      } else {
        setError("AI extraction failed. Try again or use JSON import.");
        setPhase("input");
      }
    } catch (e) {
      setError(`Error: ${e.message}`);
      setPhase("input");
    }
  };

  const applyExtracted = () => {
    const merged = { ...brand };
    Object.entries(extractedFields).forEach(([k, v]) => {
      if (k in merged && v && (typeof v === "string" ? v.trim() : Array.isArray(v) && v.some(x => x?.trim()))) {
        merged[k] = v;
      }
    });
    onBrandUpdate(merged);
    setPhase("done");
  };

  // Processing state
  if (phase === "processing") return (
    <Card accent="#8b5cf6">
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <div style={{ width: "48px", height: "48px", margin: "0 auto 16px", borderRadius: "50%", border: "3px solid rgba(139,92,246,0.2)", borderTopColor: "#8b5cf6", animation: "spin 1s linear infinite" }} />
        <div style={{ fontSize: "16px", color: "#fff", fontWeight: 600, marginBottom: "6px" }}>Organizing Your Brand Materials</div>
        <div style={{ fontSize: "12px", color: "#888", animation: "pulse2 2s infinite" }}>AI is reading, categorizing, and placing content into the right fields...</div>
      </div>
    </Card>
  );

  // Review state
  if (phase === "review") {
    const categories = [
      { label: "Identity", keys: ["brandName", "tagline", "about", "mission", "vision", "brandPromise", "elevatorPitch", "originStory", "boilerplate"] },
      { label: "Values & Differentiators", keys: ["coreValues", "whyDifferent", "archetype", "enemy", "enemyDescription", "victim", "victimPainPoints", "victimDesiredOutcome"] },
      { label: "StoryBrand", keys: ["sbCharacterWants", "sbExternalProblem", "sbInternalProblem", "sbGuideEmpathy", "sbGuideAuthority", "sbPlanSteps", "sbSuccessEnding", "sbFailureEnding", "sbOneLiner", "sbTransformation"] },
      { label: "Voice & Messaging", keys: ["toneAttributes", "phrases", "doSay", "dontSay", "voiceExample", "socialPersonality", "ctaPrimary", "ctaSecondary", "hashTags", "keyMessages"] },
      { label: "Visual", keys: ["primaryColor", "secondaryColor", "accentColor", "primaryFont", "secondaryFont", "logoDescription", "photoStyle", "iconStyle", "videoStyle", "musicStyle"] },
    ];

    const fieldLabels = {
      brandName: "Brand Name", tagline: "Tagline", about: "About", mission: "Mission", vision: "Vision",
      brandPromise: "Brand Promise", elevatorPitch: "Elevator Pitch", originStory: "Origin Story", boilerplate: "Boilerplate",
      coreValues: "Core Values", whyDifferent: "Why Different", archetype: "Archetype",
      enemy: "Enemy", enemyDescription: "Enemy Description", victim: "ICP", victimPainPoints: "Pain Points", victimDesiredOutcome: "Desired Outcome",
      sbCharacterWants: "Character Wants", sbExternalProblem: "External Problem", sbInternalProblem: "Internal Problem",
      sbGuideEmpathy: "Guide Empathy", sbGuideAuthority: "Guide Authority", sbPlanSteps: "Plan Steps",
      sbSuccessEnding: "Success", sbFailureEnding: "Failure", sbOneLiner: "One-Liner", sbTransformation: "Transformation",
      toneAttributes: "Tone", phrases: "Phrases", doSay: "Do Say", dontSay: "Don't Say",
      voiceExample: "Voice Example", socialPersonality: "Social Personality",
      ctaPrimary: "Primary CTA", ctaSecondary: "Secondary CTA", hashTags: "Hashtags", keyMessages: "Key Messages",
      primaryColor: "Primary Color", secondaryColor: "Secondary Color", accentColor: "Accent Color",
      primaryFont: "Primary Font", secondaryFont: "Secondary Font",
      logoDescription: "Logo", photoStyle: "Photo Style", iconStyle: "Icon Style",
      videoStyle: "Video Style", musicStyle: "Music Style",
    };

    return (
      <div>
        <Card title="Review Extracted Content" accent="#8b5cf6">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "12px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#8b5cf6", fontWeight: 600 }}>
              {fieldCount} fields extracted
            </span>
            <span style={{ fontSize: "12px", color: "#666" }}>from your brand dump</span>
          </div>
          <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>Review below. Remove anything incorrect before applying.</p>
        </Card>

        {categories.map(cat => {
          const filledKeys = cat.keys.filter(k => {
            const v = extractedFields[k];
            return v && (typeof v === "string" ? v.trim() : Array.isArray(v) && v.some(x => x?.trim()));
          });
          if (filledKeys.length === 0) return null;
          return (
            <Card key={cat.label} title={cat.label}>
              {filledKeys.map(k => {
                const v = extractedFields[k];
                return (
                  <div key={k} style={{ marginBottom: "12px", padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", color: "#8b5cf6", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{fieldLabels[k] || k}</span>
                      <button onClick={() => setExtractedFields(p => {
                        const next = { ...p };
                        if (Array.isArray(next[k])) next[k] = [];
                        else next[k] = "";
                        return next;
                      })} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "11px" }}>{"\u2715"} remove</button>
                    </div>
                    <div style={{ fontSize: "13px", color: "#ccc", lineHeight: 1.5 }}>
                      {Array.isArray(v) ? v.filter(x => x?.trim()).join(" \u2022 ") : v}
                    </div>
                  </div>
                );
              })}
            </Card>
          );
        })}

        <div style={{ display: "flex", gap: "12px", marginBottom: "40px" }}>
          <button onClick={() => { setPhase("input"); setExtractedFields({}); }} style={{ flex: 1, padding: "14px", borderRadius: "12px", cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#aaa", fontSize: "14px" }}>{"\u2190"} Back</button>
          <button onClick={applyExtracted} style={{ flex: 2, padding: "14px", borderRadius: "12px", cursor: "pointer", background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", border: "none", color: "#fff", fontSize: "14px", fontWeight: 600 }}>{"\u2713"} Apply {fieldCount} Fields to Brand Board</button>
        </div>
      </div>
    );
  }

  // Done state
  if (phase === "done") return (
    <Card accent="#2ecc71">
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <div style={{ fontSize: "36px", marginBottom: "8px" }}>{"\u2713"}</div>
        <div style={{ fontSize: "17px", color: "#fff", fontWeight: 600, fontFamily: "'Playfair Display', serif", marginBottom: "6px" }}>{fieldCount} Fields Imported!</div>
        <p style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>Your brand materials have been organized and placed. Scroll down to review and refine.</p>
        <button onClick={() => { setPhase("input"); setDumpText(""); setExtractedFields({}); setFileNames([]); }} style={{ padding: "8px 18px", borderRadius: "8px", cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#aaa", fontSize: "12px" }}>Import More</button>
      </div>
    </Card>
  );

  // Input state (default)
  return (
    <div>
      <Card title="Brand Dump" description="Drop all your brand materials in one place. AI reads everything and puts it where it belongs." accent="#8b5cf6">
        <div style={{ padding: "10px 14px", background: "rgba(139,92,246,0.06)", borderRadius: "8px", border: "1px solid rgba(139,92,246,0.15)", marginBottom: "16px" }}>
          <p style={{ fontSize: "12px", color: "#ccc", margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: "#8b5cf6" }}>Paste anything:</strong> Brand guidelines, about pages, mission statements, style guides, pitch decks, social bios, marketing copy, competitor notes \u2014 AI will sort it all.
          </p>
        </div>

        {/* Import method selector */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {IMPORT_METHODS.map(m => (
            <button key={m.id} onClick={() => setMethod(m.id)} style={{ flex: 1, padding: "12px 10px", borderRadius: "10px", cursor: "pointer", textAlign: "center", background: method === m.id ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.02)", border: method === m.id ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(255,255,255,0.06)", transition: "all 0.2s" }}>
              <div style={{ fontSize: "18px", marginBottom: "4px" }}>{m.icon}</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: method === m.id ? "#8b5cf6" : "#aaa" }}>{m.label}</div>
              <div style={{ fontSize: "9px", color: "#666", marginTop: "2px" }}>{m.desc}</div>
            </button>
          ))}
        </div>

        {/* Paste method */}
        {method === "paste" && (
          <textarea
            value={dumpText}
            onChange={e => setDumpText(e.target.value)}
            placeholder={"Paste everything here \u2014 brand guidelines, about copy, mission statement, taglines, style notes, social bios, pitch deck text, whatever you have.\n\nThe more you paste, the more fields get auto-populated.\n\nExamples of what to include:\n\u2022 Company description / about page\n\u2022 Mission and vision statements\n\u2022 Brand voice guidelines\n\u2022 Color codes and font names\n\u2022 Taglines and slogans\n\u2022 Target audience descriptions\n\u2022 Competitor positioning notes\n\u2022 Social media bios\n\u2022 Sales pitch or elevator pitch"}
            rows={12}
            style={{ ...inputBase(false), resize: "vertical", background: "rgba(0,0,0,0.3)", minHeight: "200px" }}
          />
        )}

        {/* File upload */}
        {method === "file" && (
          <div>
            <label style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px", borderRadius: "12px", border: "2px dashed rgba(139,92,246,0.25)", background: "rgba(139,92,246,0.04)", cursor: "pointer", transition: "all 0.2s" }}>
              <input type="file" multiple accept=".txt,.md,.json,.csv,.pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: "none" }} />
              <div style={{ fontSize: "28px", marginBottom: "8px", opacity: 0.4 }}>{"\uD83D\uDCC4"}</div>
              <div style={{ fontSize: "13px", color: "#aaa", fontWeight: 500, marginBottom: "4px" }}>Click to upload or drag files here</div>
              <div style={{ fontSize: "11px", color: "#666" }}>TXT, MD, JSON, CSV supported</div>
            </label>
            {fileNames.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                {fileNames.map((n, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", background: "rgba(139,92,246,0.06)", borderRadius: "6px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "12px", color: "#8b5cf6" }}>{"\uD83D\uDCC4"}</span>
                    <span style={{ fontSize: "12px", color: "#ccc" }}>{n}</span>
                    <span style={{ fontSize: "10px", color: "#2ecc71" }}>{"\u2713"}</span>
                  </div>
                ))}
              </div>
            )}
            {dumpText && (
              <div style={{ marginTop: "10px", padding: "8px 12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px", maxHeight: "100px", overflow: "auto" }}>
                <pre style={{ fontSize: "10px", color: "#777", margin: 0, whiteSpace: "pre-wrap" }}>{dumpText.slice(0, 500)}{dumpText.length > 500 ? "..." : ""}</pre>
              </div>
            )}
          </div>
        )}

        {/* JSON import */}
        {method === "json" && (
          <textarea
            value={dumpText}
            onChange={e => setDumpText(e.target.value)}
            placeholder={'Paste your brand board JSON export here.\n\nSupports:\n\u2022 Brand Board Builder export format\n\u2022 Any flat JSON with brand field keys\n\nExample:\n{\n  "brandName": "Acme Corp",\n  "tagline": "Building tomorrow",\n  "mission": "To innovate..."\n}'}
            rows={10}
            style={{ ...inputBase(false), resize: "vertical", background: "rgba(0,0,0,0.3)", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}
          />
        )}
      </Card>

      {error && <div style={{ padding: "10px 14px", background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.2)", borderRadius: "8px", marginBottom: "14px", fontSize: "13px", color: "#e74c3c" }}>{error}</div>}

      <button
        onClick={processDump}
        disabled={!dumpText.trim()}
        style={{
          width: "100%", padding: "14px", borderRadius: "12px", cursor: dumpText.trim() ? "pointer" : "default",
          background: dumpText.trim() ? "linear-gradient(135deg, #8b5cf6, #6d28d9)" : "rgba(255,255,255,0.04)",
          border: "none", color: dumpText.trim() ? "#fff" : "#555",
          fontSize: "15px", fontWeight: 600, opacity: dumpText.trim() ? 1 : 0.5,
          marginBottom: "32px",
        }}
      >
        {method === "json" ? "{ } Import JSON" : "\u2728 Organize & Place Content"}
      </button>
    </div>
  );
}
