import { useState, useEffect, useRef } from "react";
import { BrandContext } from "./BrandContext";
import { SECTIONS, ARCHETYPES, DEFAULT_BRAND } from "../constants";
import { TextInput, ArrayInput, ColorPicker, Card, SectionHeader, ModeToggle, CopyButton, inputBase } from "./ui";
import { generateExportJSON, generateMarkdown } from "../utils/export";
import { loadBrand, saveBrand } from "../utils/storage";
import ScannerSection from "./ScannerSection";
import BrandScoreSection from "./BrandScoreSection";
import BrandDumpSection from "./BrandDumpSection";

export default function BrandBoardBuilder() {
  const [brand, setBrand] = useState(DEFAULT_BRAND);
  const [activeSection, setActiveSection] = useState("scanner");
  const [exportFormat, setExportFormat] = useState("json");
  const [saved, setSaved] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState("light");
  const mainRef = useRef(null);
  const update = (k, v) => setBrand(p => ({ ...p, [k]: v }));

  // Progress calculation
  useEffect(() => {
    let f = 0, t = 0;
    Object.entries(brand).forEach(([k, v]) => {
      if (["customFields", "integrations", "versionHistory", "contentPillars", "personas"].includes(k)) return;
      if (Array.isArray(v)) { t += v.length; f += v.filter(s => typeof s === "string" ? s.trim() : s).length; }
      else if (typeof v === "string") { t++; if (v.trim()) f++; }
    });
    setProgress(Math.round((f / Math.max(t, 1)) * 100));
  }, [brand]);

  // Load from localStorage
  useEffect(() => {
    (async () => {
      const data = await loadBrand();
      if (data) setBrand(p => ({ ...p, ...data }));
    })();
  }, []);

  // Save handler
  const handleSave = async () => {
    const entry = { date: new Date().toISOString(), label: `Save #${(brand.versionHistory?.length || 0) + 1}` };
    const updated = { ...brand, versionHistory: [...(brand.versionHistory || []), entry] };
    setBrand(updated);
    const ok = await saveBrand(updated);
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  // Scroll spy
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const h = () => {
      const ids = SECTIONS.map(s => s.id);
      for (let i = ids.length - 1; i >= 0; i--) {
        const e = document.getElementById(ids[i]);
        if (e && e.getBoundingClientRect().top <= 120) { setActiveSection(ids[i]); break; }
      }
    };
    el.addEventListener("scroll", h, { passive: true });
    return () => el.removeEventListener("scroll", h);
  }, []);

  const scrollTo = id => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };

  const handleExport = () => {
    const j = exportFormat === "json";
    const content = j ? JSON.stringify(generateExportJSON(brand), null, 2) : generateMarkdown(brand);
    const blob = new Blob([content], { type: j ? "application/json" : "text/markdown" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = `${(brand.brandName || "brand").toLowerCase().replace(/\s+/g, "-")}-brand-board.${j ? "json" : "md"}`;
    a.click();
    URL.revokeObjectURL(u);
  };

  // Pillar helpers
  const updatePillar = (i, k, v) => { const p = [...brand.contentPillars]; p[i] = { ...p[i], [k]: v }; update("contentPillars", p); };
  const addPillar = () => update("contentPillars", [...brand.contentPillars, { name: "", description: "", topics: ["", ""], audience: "" }]);
  const removePillar = i => update("contentPillars", brand.contentPillars.filter((_, x) => x !== i));

  // Color mode helpers
  const lightMode = { bg: brand.lightBg, surface: brand.lightSurface, text: brand.lightText, textSec: brand.lightTextSecondary, border: brand.lightBorder, enabled: brand.lightModeEnabled };
  const darkMode = { bg: brand.darkBg, surface: brand.darkSurface, text: brand.darkText, textSec: brand.darkTextSecondary, border: brand.darkBorder, enabled: brand.darkModeEnabled };
  const activeMode = previewMode === "light" ? lightMode : darkMode;

  return (
    <BrandContext.Provider value={{ brand }}>
    <div style={{ height: "100vh", background: "#0a0a0f", color: "#e0e0e0", fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <header style={{ padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(10,10,15,0.97)", backdropFilter: "blur(12px)", flexShrink: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "7px", background: "linear-gradient(135deg, #e94560, #c62a42)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: "#fff" }}>B</div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>Brand Board Builder</div>
            <div style={{ fontSize: "9px", color: "#555", letterSpacing: "1.5px", textTransform: "uppercase" }}>AI-Powered Enterprise</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "80px", height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #e94560, #f39c12)", transition: "width 0.5s" }} />
            </div>
            <span style={{ fontSize: "11px", color: "#666" }}>{progress}%</span>
          </div>
          <button onClick={handleSave} style={{ padding: "6px 16px", borderRadius: "7px", cursor: "pointer", background: saved ? "rgba(46,204,113,0.15)" : "rgba(255,255,255,0.06)", border: saved ? "1px solid rgba(46,204,113,0.3)" : "1px solid rgba(255,255,255,0.08)", color: saved ? "#2ecc71" : "#aaa", fontSize: "12px", fontWeight: 500, transition: "all 0.3s" }}>
            {saved ? "\u2713 Saved" : "Save"}
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <nav style={{ width: "200px", minWidth: "200px", borderRight: "1px solid rgba(255,255,255,0.06)", padding: "10px 8px", overflowY: "auto", background: "rgba(10,10,15,0.5)", flexShrink: 0 }}>
          {(() => {
            let lastGroup = "";
            return SECTIONS.map((s, i) => {
              const showGroup = s.group !== lastGroup;
              lastGroup = s.group;
              return (
                <div key={s.id}>
                  {showGroup && (
                    <div style={{ padding: "8px 10px 4px", marginTop: i > 0 ? "6px" : "0" }}>
                      <div style={{ fontSize: "9px", color: "#555", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600 }}>{s.group}</div>
                    </div>
                  )}
                  <button onClick={() => scrollTo(s.id)} style={{ width: "100%", padding: "7px 10px", borderRadius: "7px", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px", marginBottom: "2px", background: activeSection === s.id ? "rgba(233,69,96,0.12)" : "transparent", border: activeSection === s.id ? "1px solid rgba(233,69,96,0.2)" : "1px solid transparent", color: activeSection === s.id ? "#e94560" : "#666", transition: "all 0.15s", textAlign: "left" }}>
                    <span style={{ fontSize: "12px", width: "18px", textAlign: "center", opacity: 0.7 }}>{s.icon}</span>
                    <span style={{ fontSize: "11px", fontWeight: activeSection === s.id ? 600 : 400 }}>{s.label}</span>
                  </button>
                </div>
              );
            });
          })()}
        </nav>

        {/* Main content */}
        <main ref={mainRef} style={{ flex: 1, overflowY: "auto", padding: "24px 32px 80px", scrollBehavior: "smooth" }}>
          <div style={{ maxWidth: "820px" }}>

            {/* ====== PHASE 1: DISCOVER ====== */}
            <PhaseHeader phase="1" label="Discover" subtitle="Who are you?" desc="Start here. Scan your existing presence or fill in the basics by hand." color="#e94560" />

            <SectionHeader id="dump" label="Brand Dump" icon={"\uD83D\uDCE5"} />
            <BrandDumpSection brand={brand} onBrandUpdate={setBrand} />

            <SectionHeader id="scanner" label="AI Scanner" icon={"\u26A1"} />
            <ScannerSection brand={brand} onBrandUpdate={setBrand} />

            <SectionHeader id="overview" label="Overview" icon={"\u25C8"} />
            <Card title="Brand Essentials" description="The four things every brand must answer before anything else.">
              <TextInput label="Brand Name" value={brand.brandName} onChange={v => update("brandName", v)} placeholder="Your brand name" />
              <TextInput label="Tagline" value={brand.tagline} onChange={v => update("tagline", v)} placeholder="Memorable tagline" hint="Short, punchy \u2014 the line people remember." />
              <TextInput label="Elevator Pitch" value={brand.elevatorPitch} onChange={v => update("elevatorPitch", v)} placeholder="We help [who] achieve [what] by [how]." multiline hint="30 seconds. If someone asks 'what do you do?' this is your answer." />
              <TextInput label="Brand Promise" value={brand.brandPromise} onChange={v => update("brandPromise", v)} placeholder="What customers always count on" hint="The one thing you guarantee every single time." />
            </Card>

            {/* ====== PHASE 2: STRATEGY ====== */}
            <PhaseHeader phase="2" label="Strategy" subtitle="What do you stand for?" desc="Define your identity, archetype, story framework, voice, and content pillars." color="#6A1B9A" />

            {/* Identity */}
            <SectionHeader id="identity" label="Identity & Story" icon={"\u25CE"} />
            <Card title="About" description="Your origin and reason for being. This powers authentic AI-generated content.">
              <TextInput label="About" value={brand.about} onChange={v => update("about", v)} placeholder="Your brand story" multiline />
              <TextInput label="Origin Story" value={brand.originStory} onChange={v => update("originStory", v)} placeholder="How did this brand come to be?" multiline hint="People connect with stories, not features." />
            </Card>
            <Card title="Mission, Vision & Values" description="The north star that guides every decision.">
              <TextInput label="Mission" value={brand.mission} onChange={v => update("mission", v)} placeholder="What you do and why" multiline />
              <TextInput label="Vision" value={brand.vision} onChange={v => update("vision", v)} placeholder="The future you're building" multiline />
              <ArrayInput label="Core Values" values={brand.coreValues} onChange={v => update("coreValues", v)} placeholder="e.g., Radical Transparency" hint="3-5 values that drive every decision." />
              <TextInput label="Why Different" value={brand.whyDifferent} onChange={v => update("whyDifferent", v)} placeholder="What makes you uniquely valuable?" multiline />
              <ArrayInput label="Differentiators" values={brand.competitorDiff} onChange={v => update("competitorDiff", v)} placeholder="e.g., Only platform with real-time AI" />
            </Card>
            <Card title="Boilerplate" description="Official company description for press, bios, directories.">
              <TextInput label="Boilerplate Copy" value={brand.boilerplate} onChange={v => update("boilerplate", v)} placeholder="[Brand] is a [what] that helps [who] achieve [outcome]..." multiline hint="Used in PR, partnerships, directory listings." />
            </Card>

            {/* Archetype */}
            <SectionHeader id="archetype" label="Archetype" icon={"\u2B21"} />
            <Card title="Brand Archetype" description="Your brand's personality DNA. This shapes how AI writes as you.">
              <label style={{ display: "block", marginBottom: "10px", fontSize: "13px", color: "#9e9e9e", fontWeight: 500 }}>Primary Archetype</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: "8px", marginBottom: "16px" }}>
                {ARCHETYPES.map(a => (
                  <button key={a.name} onClick={() => update("archetype", a.name)} style={{ padding: "12px 10px", borderRadius: "10px", cursor: "pointer", textAlign: "left", background: brand.archetype === a.name ? `${a.color}22` : "rgba(255,255,255,0.02)", border: brand.archetype === a.name ? `2px solid ${a.color}` : "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: brand.archetype === a.name ? a.color : "#ccc", marginBottom: "2px" }}>{a.name}</div>
                    <div style={{ fontSize: "10px", color: "#777" }}>{a.desc}</div>
                  </button>
                ))}
              </div>
              <label style={{ display: "block", marginBottom: "10px", fontSize: "13px", color: "#9e9e9e", fontWeight: 500 }}>Secondary (optional)</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: "8px" }}>
                {ARCHETYPES.filter(a => a.name !== brand.archetype).map(a => (
                  <button key={a.name} onClick={() => update("secondaryArchetype", brand.secondaryArchetype === a.name ? "" : a.name)} style={{ padding: "12px 10px", borderRadius: "10px", cursor: "pointer", textAlign: "left", background: brand.secondaryArchetype === a.name ? `${a.color}15` : "rgba(255,255,255,0.02)", border: brand.secondaryArchetype === a.name ? `1px solid ${a.color}88` : "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: brand.secondaryArchetype === a.name ? a.color : "#999", marginBottom: "2px" }}>{a.name}</div>
                    <div style={{ fontSize: "10px", color: "#666" }}>{a.desc}</div>
                  </button>
                ))}
              </div>
            </Card>
            <Card title="The Enemy" description="Every great brand fights against something.">
              <TextInput label="The Enemy" value={brand.enemy} onChange={v => update("enemy", v)} placeholder="e.g., Overpriced agencies" hint="The villain in your customer's story." />
              <TextInput label="Enemy Description" value={brand.enemyDescription} onChange={v => update("enemyDescription", v)} placeholder="Why this enemy hurts your audience" multiline />
            </Card>
            <Card title="Ideal Customer (ICP)" description="The person you exist to serve. Everything else flows from this.">
              <TextInput label="Ideal Customer" value={brand.victim} onChange={v => update("victim", v)} placeholder="Demographics + psychographics" multiline />
              <ArrayInput label="Pain Points" values={brand.victimPainPoints} onChange={v => update("victimPainPoints", v)} placeholder="e.g., 20+ hrs/week on content" />
              <TextInput label="Desired Outcome" value={brand.victimDesiredOutcome} onChange={v => update("victimDesiredOutcome", v)} placeholder="Their ideal future state" multiline />
            </Card>

            {/* StoryBrand */}
            <SectionHeader id="storybrand" label="StoryBrand Script" icon={"\uD83D\uDCD6"} />
            <Card title="The StoryBrand BrandScript" description="Donald Miller's 7-part messaging framework. Builds on your archetype, enemy, and ICP above." accent="#6A1B9A">
              <div style={{ padding: "12px", background: "rgba(106,27,154,0.08)", borderRadius: "10px", border: "1px solid rgba(106,27,154,0.15)", marginBottom: "20px" }}>
                <p style={{ fontSize: "12px", color: "#ccc", margin: 0, lineHeight: 1.6 }}>
                  <strong style={{ color: "#6A1B9A" }}>The formula:</strong> A <em>Character</em> has a <em>Problem</em> and meets a <em>Guide</em> who gives them a <em>Plan</em> and calls them to <em>Action</em> that ends in <em>Success</em> and helps them avoid <em>Failure</em>.
                </p>
              </div>
            </Card>
            <Card title="1. The Character (Your Customer)"><TextInput label="Character Wants" value={brand.sbCharacterWants} onChange={v => update("sbCharacterWants", v)} placeholder="e.g., To grow their business without wasting money on ads" multiline hint="One clear desire. Open every message with this." /></Card>
            <Card title="2. The Problem" description="Three levels of problems your customer faces.">
              <TextInput label="External Problem" value={brand.sbExternalProblem} onChange={v => update("sbExternalProblem", v)} placeholder="The tangible, visible problem" hint="What they'd tell a friend." />
              <TextInput label="Internal Problem" value={brand.sbInternalProblem} onChange={v => update("sbInternalProblem", v)} placeholder="How the problem makes them feel" hint="The emotion underneath." />
              <TextInput label="Philosophical Problem" value={brand.sbPhilosophicalProblem} onChange={v => update("sbPhilosophicalProblem", v)} placeholder="Why it's just plain wrong" hint="The deeper injustice." />
            </Card>
            <Card title="3. The Guide (Your Brand)" description="You're the mentor, not the hero.">
              <TextInput label="Empathy Statement" value={brand.sbGuideEmpathy} onChange={v => update("sbGuideEmpathy", v)} placeholder="We understand what it's like to..." multiline hint="Show you've walked in their shoes." />
              <TextInput label="Authority Statement" value={brand.sbGuideAuthority} onChange={v => update("sbGuideAuthority", v)} placeholder="We've helped 500+ businesses..." multiline hint="Social proof, credentials, results." />
            </Card>
            <Card title="4. The Plan"><ArrayInput label="Plan Steps" values={brand.sbPlanSteps} onChange={v => update("sbPlanSteps", v)} placeholder="Step 1: Schedule a call" hint="3 steps max. Simple beats clever." /></Card>
            <Card title="5. Call to Action">
              <TextInput label="Direct CTA" value={brand.sbDirectCTA || brand.ctaPrimary} onChange={v => update("sbDirectCTA", v)} placeholder="Start Your Free Trial" hint="The buy button. Bold and clear." />
              <TextInput label="Transitional CTA" value={brand.sbTransitionalCTA || brand.ctaSecondary} onChange={v => update("sbTransitionalCTA", v)} placeholder="Download the Free Guide" hint="Lower commitment. Captures leads." />
            </Card>
            <Card title="6. Success & Failure">
              <TextInput label="Success Ending" value={brand.sbSuccessEnding} onChange={v => update("sbSuccessEnding", v)} placeholder="What life looks like after they buy" multiline hint="Be specific and vivid." />
              <TextInput label="Failure Ending" value={brand.sbFailureEnding} onChange={v => update("sbFailureEnding", v)} placeholder="What happens if they don't act" multiline hint="The stakes. What they lose." />
            </Card>
            <Card title="7. Transformation & One-Liner">
              <TextInput label="Transformation" value={brand.sbTransformation} onChange={v => update("sbTransformation", v)} placeholder="From [before] \u2192 To [after]" multiline hint="The identity shift your customer undergoes." />
              <TextInput label="One-Liner" value={brand.sbOneLiner} onChange={v => update("sbOneLiner", v)} placeholder="[Problem] + [Solution] + [Result] in one sentence" multiline hint="Memorize this. Use everywhere." />
            </Card>

            {/* Content Pillars */}
            <SectionHeader id="pillars" label="Content Pillars" icon={"\u25E7"} />
            <Card title="Content Pillars" description="3-5 topic lanes your brand owns. AI stays within these for consistency." accent="#2563eb">
              {brand.contentPillars.map((p, i) => (
                <div key={i} style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#2563eb", fontWeight: 600 }}>Pillar {i + 1}</span>
                    {brand.contentPillars.length > 1 && <button onClick={() => removePillar(i)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "12px" }}>{"\u2715"}</button>}
                  </div>
                  <TextInput label="Pillar Name" value={p.name} onChange={v => updatePillar(i, "name", v)} placeholder="e.g., Thought Leadership" small />
                  <TextInput label="Description" value={p.description} onChange={v => updatePillar(i, "description", v)} placeholder="What this pillar covers and why" multiline />
                  <TextInput label="Target Audience" value={p.audience} onChange={v => updatePillar(i, "audience", v)} placeholder="Who this resonates with most" small />
                </div>
              ))}
              <button onClick={addPillar} style={{ background: "none", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "8px", color: "#888", cursor: "pointer", padding: "8px 16px", fontSize: "12px" }}>+ Add Pillar</button>
            </Card>
            <Card title="Key Messages"><ArrayInput label="Core Messages" values={brand.keyMessages} onChange={v => update("keyMessages", v)} placeholder="e.g., We make marketing simple" hint="3-5 messages that appear across all content." /></Card>
            <Card title="Stage-Based Messaging" description="How your message adapts to where the buyer is in their journey.">
              <TextInput label="Awareness Stage" value={brand.awarenessMessaging} onChange={v => update("awarenessMessaging", v)} placeholder="They just discovered the problem..." multiline hint="Educational, empathetic, problem-aware." />
              <TextInput label="Consideration Stage" value={brand.considerationMessaging} onChange={v => update("considerationMessaging", v)} placeholder="They're comparing solutions..." multiline hint="Differentiation, proof, authority." />
              <TextInput label="Decision Stage" value={brand.decisionMessaging} onChange={v => update("decisionMessaging", v)} placeholder="They're ready to buy..." multiline hint="Urgency, risk reversal, CTA." />
            </Card>

            {/* Voice */}
            <SectionHeader id="voice" label="Voice & Messaging" icon={"\u275D"} />
            <Card title="Tone & Personality" description="How your brand sounds in everything it says.">
              <ArrayInput label="Tone Attributes" values={brand.toneAttributes} onChange={v => update("toneAttributes", v)} placeholder="e.g., Bold" hint="4-6 adjectives that define your voice." />
              <TextInput label="Social Personality" value={brand.socialPersonality} onChange={v => update("socialPersonality", v)} placeholder="How your brand shows up on social" multiline />
              <TextInput label="Voice Example" value={brand.voiceExample} onChange={v => update("voiceExample", v)} placeholder="Write a sample paragraph in your brand's voice" multiline hint="The gold standard. AI references this for every piece of content." />
            </Card>
            <Card title="Phrases & CTAs">
              <ArrayInput label="Brand Phrases" values={brand.phrases} onChange={v => update("phrases", v)} placeholder='"Your marketing, on autopilot"' />
              <TextInput label="Primary CTA" value={brand.ctaPrimary} onChange={v => update("ctaPrimary", v)} placeholder="Start Your Free Trial" />
              <TextInput label="Secondary CTA" value={brand.ctaSecondary} onChange={v => update("ctaSecondary", v)} placeholder="See How It Works" />
              <ArrayInput label="Hashtags" values={brand.hashTags} onChange={v => update("hashTags", v)} placeholder="#ScaleSmarter" />
              <TextInput label="Email Sign-off" value={brand.emailSignoff} onChange={v => update("emailSignoff", v)} placeholder="To your growth," />
            </Card>
            <Card title="Guardrails" description="What your brand always says \u2014 and never says.">
              <ArrayInput label="\u2705 Do Say" values={brand.doSay} onChange={v => update("doSay", v)} placeholder='"partner" not "customer"' />
              <ArrayInput label="\uD83D\uDEAB Don't Say" values={brand.dontSay} onChange={v => update("dontSay", v)} placeholder='Never "cheap"' />
            </Card>
            <Card title="Touchpoint Voice Rules" description="Same brand, different energy per channel.">
              <TextInput label="Website" value={brand.touchpointWebsite} onChange={v => update("touchpointWebsite", v)} placeholder="Professional but warm. Headlines bold, body conversational." multiline />
              <TextInput label="Social Media" value={brand.touchpointSocial} onChange={v => update("touchpointSocial", v)} placeholder="Casual, punchy. Use emojis sparingly." multiline />
              <TextInput label="Email Marketing" value={brand.touchpointEmail} onChange={v => update("touchpointEmail", v)} placeholder="Personal, direct. First-name. Short paragraphs." multiline />
              <TextInput label="Ads" value={brand.touchpointAds} onChange={v => update("touchpointAds", v)} placeholder="Bold hooks. Numbers. Clear CTA. Under 125 characters." multiline />
              <TextInput label="Sales & Proposals" value={brand.touchpointSales} onChange={v => update("touchpointSales", v)} placeholder="Consultative. Use client's language back to them." multiline />
              <TextInput label="Customer Support" value={brand.touchpointSupport} onChange={v => update("touchpointSupport", v)} placeholder="Empathetic first, solution second. Never blame user." multiline />
            </Card>

            {/* ====== PHASE 3: EXPRESSION ====== */}
            <PhaseHeader phase="3" label="Expression" subtitle="How do you look & feel?" desc="Colors, type, photography, logo, motion, and sound \u2014 the sensory experience of your brand." color="#e94560" />

            {/* Colors */}
            <SectionHeader id="colors" label="Colors & Modes" icon={"\u25D0"} />
            <Card title="Brand Colors" description="Your core palette. These flow into light and dark modes below.">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <ColorPicker label="Primary" value={brand.primaryColor} onChange={v => update("primaryColor", v)} />
                <ColorPicker label="Secondary" value={brand.secondaryColor} onChange={v => update("secondaryColor", v)} />
                <ColorPicker label="Accent" value={brand.accentColor} onChange={v => update("accentColor", v)} />
                <ColorPicker label="Light Neutral" value={brand.neutralLight} onChange={v => update("neutralLight", v)} />
                <ColorPicker label="Dark Neutral" value={brand.neutralDark} onChange={v => update("neutralDark", v)} />
              </div>
            </Card>
            <Card title="Semantic Colors">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <ColorPicker label="Success" value={brand.successColor} onChange={v => update("successColor", v)} />
                <ColorPicker label="Warning" value={brand.warningColor} onChange={v => update("warningColor", v)} />
                <ColorPicker label="Error" value={brand.errorColor} onChange={v => update("errorColor", v)} />
              </div>
            </Card>

            {/* Light Mode */}
            <Card title="Light Mode" description="Colors for light backgrounds. Toggle off if your brand is dark-only." accent={brand.lightModeEnabled ? "#f39c12" : "#333"}>
              <ModeToggle enabled={brand.lightModeEnabled} onToggle={() => update("lightModeEnabled", !brand.lightModeEnabled)} label="Light Mode" />
              {brand.lightModeEnabled && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <ColorPicker label="Background" value={brand.lightBg} onChange={v => update("lightBg", v)} />
                  <ColorPicker label="Surface" value={brand.lightSurface} onChange={v => update("lightSurface", v)} />
                  <ColorPicker label="Primary Text" value={brand.lightText} onChange={v => update("lightText", v)} />
                  <ColorPicker label="Secondary Text" value={brand.lightTextSecondary} onChange={v => update("lightTextSecondary", v)} />
                  <ColorPicker label="Borders" value={brand.lightBorder} onChange={v => update("lightBorder", v)} />
                </div>
              )}
            </Card>

            {/* Dark Mode */}
            <Card title="Dark Mode" description="Colors for dark backgrounds. Toggle off if your brand is light-only." accent={brand.darkModeEnabled ? "#8b5cf6" : "#333"}>
              <ModeToggle enabled={brand.darkModeEnabled} onToggle={() => update("darkModeEnabled", !brand.darkModeEnabled)} label="Dark Mode" />
              {brand.darkModeEnabled && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <ColorPicker label="Background" value={brand.darkBg} onChange={v => update("darkBg", v)} />
                  <ColorPicker label="Surface" value={brand.darkSurface} onChange={v => update("darkSurface", v)} />
                  <ColorPicker label="Primary Text" value={brand.darkText} onChange={v => update("darkText", v)} />
                  <ColorPicker label="Secondary Text" value={brand.darkTextSecondary} onChange={v => update("darkTextSecondary", v)} />
                  <ColorPicker label="Borders" value={brand.darkBorder} onChange={v => update("darkBorder", v)} />
                </div>
              )}
            </Card>

            {/* Mode Preview */}
            <Card title="Mode Preview">
              <div style={{ display: "flex", gap: "4px", marginBottom: "16px", padding: "3px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                {[{ id: "light", label: "\u2600 Light", enabled: brand.lightModeEnabled }, { id: "dark", label: "\uD83C\uDF19 Dark", enabled: brand.darkModeEnabled }].map(m => (
                  <button key={m.id} onClick={() => m.enabled && setPreviewMode(m.id)} style={{ flex: 1, padding: "8px 16px", borderRadius: "8px", cursor: m.enabled ? "pointer" : "not-allowed", background: previewMode === m.id ? (m.id === "light" ? "rgba(243,156,18,0.15)" : "rgba(139,92,246,0.15)") : "transparent", border: previewMode === m.id ? `1px solid ${m.id === "light" ? "rgba(243,156,18,0.3)" : "rgba(139,92,246,0.3)"}` : "1px solid transparent", color: !m.enabled ? "#444" : previewMode === m.id ? (m.id === "light" ? "#f39c12" : "#8b5cf6") : "#888", fontSize: "13px", fontWeight: previewMode === m.id ? 600 : 400, transition: "all 0.2s", opacity: m.enabled ? 1 : 0.4 }}>
                    {m.label}{!m.enabled && " (Off)"}
                  </button>
                ))}
              </div>
              {!activeMode.enabled
                ? <div style={{ padding: "20px", textAlign: "center", color: "#555", fontSize: "13px" }}>This mode is turned off.</div>
                : (
                  <div style={{ borderRadius: "12px", overflow: "hidden", border: `1px solid ${activeMode.border}`, background: activeMode.bg, transition: "all 0.3s" }}>
                    <div style={{ padding: "10px 16px", borderBottom: `1px solid ${activeMode.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: activeMode.surface }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "22px", height: "22px", borderRadius: "5px", background: brand.accentColor }} />
                        <span style={{ fontSize: "13px", fontWeight: 700, color: activeMode.text, fontFamily: `'${brand.primaryFont}', serif` }}>{brand.brandName || "Brand"}</span>
                      </div>
                      <div style={{ display: "flex", gap: "14px" }}>
                        {["Home", "About", "Services"].map(t => <span key={t} style={{ fontSize: "11px", color: activeMode.textSec }}>{t}</span>)}
                        <span style={{ fontSize: "11px", padding: "3px 10px", background: brand.accentColor, color: "#fff", borderRadius: "4px", fontWeight: 600 }}>{brand.ctaPrimary || "Get Started"}</span>
                      </div>
                    </div>
                    <div style={{ padding: "24px 16px", textAlign: "center" }}>
                      <div style={{ fontSize: "22px", fontWeight: 700, color: activeMode.text, fontFamily: `'${brand.primaryFont}', serif`, marginBottom: "6px", lineHeight: 1.3 }}>{brand.tagline || "Your headline goes here"}</div>
                      <p style={{ fontSize: "12px", color: activeMode.textSec, lineHeight: 1.5, maxWidth: "360px", margin: "0 auto 14px", fontFamily: `'${brand.secondaryFont}', sans-serif` }}>{brand.elevatorPitch || "A brief description of your value proposition."}</p>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <span style={{ padding: "8px 18px", background: brand.accentColor, color: "#fff", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>{brand.ctaPrimary || "Primary CTA"}</span>
                        <span style={{ padding: "8px 18px", background: "transparent", color: brand.accentColor, border: `1.5px solid ${brand.accentColor}`, borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>{brand.ctaSecondary || "Secondary CTA"}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", padding: "0 16px 16px" }}>
                      {[1, 2, 3].map(i => (
                        <div key={i} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: activeMode.surface, border: `1px solid ${activeMode.border}` }}>
                          <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: i === 1 ? brand.primaryColor : i === 2 ? brand.secondaryColor : brand.accentColor, marginBottom: "6px" }} />
                          <div style={{ fontSize: "11px", fontWeight: 600, color: activeMode.text, marginBottom: "3px" }}>Feature {i}</div>
                          <div style={{ fontSize: "10px", color: activeMode.textSec, lineHeight: 1.4 }}>Brief description here.</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              <div style={{ display: "flex", gap: "4px", marginTop: "12px" }}>
                {(() => {
                  const swatches = previewMode === "light"
                    ? [{ c: brand.lightBg, l: "BG" }, { c: brand.lightSurface, l: "Surface" }, { c: brand.lightText, l: "Text" }, { c: brand.lightBorder, l: "Border" }, { c: brand.accentColor, l: "Accent" }]
                    : [{ c: brand.darkBg, l: "BG" }, { c: brand.darkSurface, l: "Surface" }, { c: brand.darkText, l: "Text" }, { c: brand.darkBorder, l: "Border" }, { c: brand.accentColor, l: "Accent" }];
                  return swatches.map((s, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ height: "28px", borderRadius: "6px", background: s.c, border: "1px solid rgba(255,255,255,0.1)", marginBottom: "3px" }} />
                      <div style={{ fontSize: "9px", color: "#777" }}>{s.l}</div>
                      <div style={{ fontSize: "8px", color: "#555", fontFamily: "monospace" }}>{s.c}</div>
                    </div>
                  ));
                })()}
              </div>
            </Card>
            <Card title="Color Rules"><TextInput label="Usage Rules" value={brand.colorUsageRules} onChange={v => update("colorUsageRules", v)} placeholder="Accent only for CTAs. Primary for headers. Light mode is default for web." multiline /></Card>

            {/* Typography */}
            <SectionHeader id="typography" label="Typography" icon="Aa" />
            <Card title="Font System">
              <TextInput label="Primary Font" value={brand.primaryFont} onChange={v => update("primaryFont", v)} placeholder="Playfair Display" hint="Used for headlines and titles." />
              <TextInput label="Secondary Font" value={brand.secondaryFont} onChange={v => update("secondaryFont", v)} placeholder="DM Sans" hint="Used for body text and UI." />
              <TextInput label="Accent Font" value={brand.accentFont} onChange={v => update("accentFont", v)} placeholder="Space Mono" hint="Optional \u2014 code, captions, special callouts." />
            </Card>
            <Card title="Type Scale">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                {[["H1", "h1Size"], ["H2", "h2Size"], ["H3", "h3Size"], ["H4", "h4Size"], ["Body", "bodySize"], ["Small", "smallSize"]].map(([l, k]) => (
                  <TextInput key={k} label={l} value={brand[k]} onChange={v => update(k, v)} small noAI />
                ))}
              </div>
            </Card>
            <Card title="Type Rules"><TextInput label="Usage Rules" value={brand.typographyRules} onChange={v => update("typographyRules", v)} placeholder="H1 for page titles only. 1.5 line-height for body." multiline /></Card>
            <Card title="Preview">
              <div style={{ padding: "16px", background: "rgba(0,0,0,0.3)", borderRadius: "10px" }}>
                <link href={`https://fonts.googleapis.com/css2?family=${brand.primaryFont.replace(/ /g, "+")}:wght@400;600;700&family=${brand.secondaryFont.replace(/ /g, "+")}:wght@400;500&display=swap`} rel="stylesheet" />
                <div style={{ fontFamily: `'${brand.primaryFont}',serif`, fontSize: brand.h1Size, color: "#fff", marginBottom: "4px", lineHeight: 1.2 }}>H1 {"\u2014"} {brand.brandName || "Heading"}</div>
                <div style={{ fontFamily: `'${brand.primaryFont}',serif`, fontSize: brand.h2Size, color: "#ddd", marginBottom: "4px" }}>H2 {"\u2014"} Subheading</div>
                <p style={{ fontFamily: `'${brand.secondaryFont}',sans-serif`, fontSize: brand.bodySize, color: "#999", lineHeight: 1.6, margin: 0 }}>Body {"\u2014"} The quick brown fox jumps over the lazy dog.</p>
              </div>
            </Card>

            {/* Photography */}
            <SectionHeader id="photography" label="Photography" icon={"\uD83D\uDCF7"} />
            <Card title="Photography Style" description="How images look and feel across all touchpoints.">
              <TextInput label="Overall Style" value={brand.photoStyle} onChange={v => update("photoStyle", v)} placeholder="Bright, candid, lifestyle-driven, warm tones" multiline hint="The mood and aesthetic of all brand photography." />
              <TextInput label="Subjects & People" value={brand.photoSubjects} onChange={v => update("photoSubjects", v)} placeholder="Diverse professionals, real customers, behind-the-scenes" multiline />
              <TextInput label="Lighting" value={brand.photoLighting} onChange={v => update("photoLighting", v)} placeholder="Natural light preferred, soft shadows, golden hour for hero shots" />
              <TextInput label="Composition" value={brand.photoComposition} onChange={v => update("photoComposition", v)} placeholder="Rule of thirds, breathing room, subject off-center" />
              <TextInput label="Filters & Post-Processing" value={brand.photoFilters} onChange={v => update("photoFilters", v)} placeholder="Warm color grade, slight desaturation, +10 clarity" />
              <TextInput label="Don't Use" value={brand.photoDontUse} onChange={v => update("photoDontUse", v)} placeholder="No cheesy stock, no all-white backgrounds, no clip art" multiline />
              <TextInput label="Stock vs. Original Policy" value={brand.stockVsOriginal} onChange={v => update("stockVsOriginal", v)} placeholder="Original preferred for hero images. Stock OK for blog with editing." multiline />
            </Card>

            {/* Logo & Icons */}
            <SectionHeader id="visual" label="Logo & Icons" icon={"\u25EB"} />
            <Card title="Logo">
              <TextInput label="Logo Description" value={brand.logoDescription} onChange={v => update("logoDescription", v)} placeholder="Describe your logo for AI" multiline />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <TextInput label="Min Size" value={brand.logoMinSize} onChange={v => update("logoMinSize", v)} small noAI />
                <TextInput label="Clear Space" value={brand.logoClearSpace} onChange={v => update("logoClearSpace", v)} small noAI />
              </div>
              <TextInput label="Backgrounds" value={brand.logoBackgrounds} onChange={v => update("logoBackgrounds", v)} placeholder="White, navy, transparent" />
              <TextInput label="Restrictions" value={brand.logoDontRules} onChange={v => update("logoDontRules", v)} placeholder="Never rotate, stretch, recolor" multiline />
            </Card>
            <Card title="Iconography">
              <TextInput label="Style" value={brand.iconStyle} onChange={v => update("iconStyle", v)} placeholder="Outlined, rounded" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <TextInput label="Stroke" value={brand.iconStrokeWeight} onChange={v => update("iconStrokeWeight", v)} small noAI />
                <TextInput label="Radius" value={brand.iconCornerRadius} onChange={v => update("iconCornerRadius", v)} small noAI />
              </div>
              <TextInput label="Rules" value={brand.iconRules} onChange={v => update("iconRules", v)} placeholder="Single-color, consistent weight" multiline />
            </Card>

            {/* Motion */}
            <SectionHeader id="motion" label="Motion" icon={"\u2727"} />
            <Card title="Motion Guidelines" description="How things move in your brand. Modern brands are kinetic \u2014 animation builds personality.">
              <TextInput label="Motion Style" value={brand.motionStyle} onChange={v => update("motionStyle", v)} placeholder="Smooth, organic easing. Subtle spring physics." multiline />
              <TextInput label="Speed & Timing" value={brand.motionSpeed} onChange={v => update("motionSpeed", v)} placeholder="200-300ms for micro-interactions. 400-600ms for transitions." />
              <TextInput label="Transitions" value={brand.motionTransitions} onChange={v => update("motionTransitions", v)} placeholder="Fade + slide for pages. Scale for modals. No hard cuts." multiline />
              <TextInput label="Loading States" value={brand.motionLoadingStates} onChange={v => update("motionLoadingStates", v)} placeholder="Skeleton screens preferred. Animated logo for full-page loads." multiline />
              <TextInput label="Scroll Behavior" value={brand.motionScrollBehavior} onChange={v => update("motionScrollBehavior", v)} placeholder="Parallax for hero sections. Fade-in for content blocks." />
              <TextInput label="Don't Use" value={brand.motionDontUse} onChange={v => update("motionDontUse", v)} placeholder="No auto-play carousels, no bouncing elements, no 3D flips" multiline />
            </Card>

            {/* Media */}
            <SectionHeader id="media" label="Media & Sound" icon={"\u25B6"} />
            <Card title="Video">
              <TextInput label="Video Style" value={brand.videoStyle} onChange={v => update("videoStyle", v)} placeholder="Visual feel, pacing, format" multiline />
              <TextInput label="Intro" value={brand.videoIntroRules} onChange={v => update("videoIntroRules", v)} placeholder="3-sec animated logo..." multiline />
              <TextInput label="Outro" value={brand.videoOutroRules} onChange={v => update("videoOutroRules", v)} placeholder="CTA card + subscribe reminder..." multiline />
            </Card>
            <Card title="Audio">
              <TextInput label="Sound Description" value={brand.soundDescription} onChange={v => update("soundDescription", v)} placeholder="How should your brand sound?" multiline />
              <TextInput label="Music Style" value={brand.musicStyle} onChange={v => update("musicStyle", v)} placeholder="Lo-fi electronic, ambient" />
              <TextInput label="Audio Logo" value={brand.audioLogo} onChange={v => update("audioLogo", v)} placeholder="Sonic signature description" />
            </Card>

            {/* ====== PHASE 4: GOVERN ====== */}
            <PhaseHeader phase="4" label="Govern" subtitle="Rules & standards" desc="Accessibility, custom extensions, and guardrails that keep your brand consistent at scale." color="#0277BD" />

            {/* Accessibility */}
            <SectionHeader id="accessibility" label="Accessibility" icon={"\u267F"} />
            <Card title="Accessibility & Inclusion" description="Builds trust with wider audiences and ensures no one is excluded." accent="#0277BD">
              <TextInput label="Color Contrast Minimum" value={brand.contrastMinimum} onChange={v => update("contrastMinimum", v)} placeholder="4.5:1 for normal text, 3:1 for large" hint="WCAG AA standard." noAI />
              <TextInput label="Alt Text Rules" value={brand.altTextRules} onChange={v => update("altTextRules", v)} placeholder="Describe function, not appearance. 'Submit button' not 'blue button'" multiline />
              <TextInput label="Inclusive Language" value={brand.inclusiveLanguage} onChange={v => update("inclusiveLanguage", v)} placeholder="Gender-neutral pronouns. Avoid ableist language. Person-first." multiline hint="Critical for AI content generation." />
              <TextInput label="Minimum Font Size" value={brand.a11yFontMinSize} onChange={v => update("a11yFontMinSize", v)} placeholder="16px" noAI />
              <TextInput label="Color Blind Safety" value={brand.a11yColorBlindSafe} onChange={v => update("a11yColorBlindSafe", v)} placeholder="Don't rely on color alone. Use icons + color." multiline />
              <TextInput label="Screen Reader Guidelines" value={brand.a11yScreenReader} onChange={v => update("a11yScreenReader", v)} placeholder="Semantic HTML. Proper heading hierarchy. ARIA labels." multiline />
              <TextInput label="Reduced Motion" value={brand.a11yMotionReduce} onChange={v => update("a11yMotionReduce", v)} placeholder="Respect prefers-reduced-motion. Provide static alternatives." multiline />
            </Card>

            {/* Custom Fields */}
            <SectionHeader id="guidelines" label="Custom Fields" icon={"\u2630"} />
            <Card title="Additional Brand Elements" description="Add anything not covered above \u2014 industry-specific rules, partner guidelines, etc.">
              {brand.customFields.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start" }}>
                  <input type="text" value={f.key} onChange={e => { const n = [...brand.customFields]; n[i] = { ...n[i], key: e.target.value }; update("customFields", n); }} placeholder="Field name" style={{ ...inputBase(true), flex: "0 0 150px", width: "auto" }} />
                  <textarea value={f.value} onChange={e => { const n = [...brand.customFields]; n[i] = { ...n[i], value: e.target.value }; update("customFields", n); }} placeholder="Value" rows={2} style={{ ...inputBase(true), flex: 1, resize: "vertical", width: "auto" }} />
                  <button onClick={() => update("customFields", brand.customFields.filter((_, x) => x !== i))} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "16px", padding: "6px" }}>{"\u00D7"}</button>
                </div>
              ))}
              <button onClick={() => update("customFields", [...brand.customFields, { key: "", value: "" }])} style={{ background: "none", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "8px", color: "#888", cursor: "pointer", padding: "8px 16px", fontSize: "12px" }}>+ Add Custom Field</button>
            </Card>

            {/* ====== PHASE 5: DEPLOY ====== */}
            <PhaseHeader phase="5" label="Deploy" subtitle="Score, export & connect" desc="Check your readiness, export to any format, and connect to your tools." color="#2ecc71" />

            {/* Brand Score */}
            <SectionHeader id="score" label="Brand Score" icon={"\uD83D\uDCCA"} />
            <BrandScoreSection brand={brand} />

            {/* Integrations */}
            <SectionHeader id="integrations" label="Integrations" icon={"\uD83D\uDD17"} />
            <Card title="Live Brand Endpoint" description="Copy your brand data for any LLM or platform." accent="#8b5cf6">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <CopyButton label="Full System Prompt" onCopy={() => navigator.clipboard?.writeText(`You are a brand-aware AI. Use this identity:\n\n${JSON.stringify(generateExportJSON(brand), null, 2)}`)} />
                <CopyButton label="Voice Only" onCopy={() => navigator.clipboard?.writeText(JSON.stringify(generateExportJSON(brand).voice, null, 2))} />
                <CopyButton label="StoryBrand Script" onCopy={() => navigator.clipboard?.writeText(JSON.stringify(generateExportJSON(brand).storyBrand, null, 2))} />
                <CopyButton label="Visual Only" onCopy={() => { const d = generateExportJSON(brand); navigator.clipboard?.writeText(JSON.stringify({ typography: d.typography, colors: d.colors, photography: d.photography, visual: d.visual, motion: d.motion }, null, 2)); }} />
              </div>
            </Card>

            {/* Export */}
            <SectionHeader id="export" label="Export" icon={"\u2197"} />
            <Card title="Export Brand Board">
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                {[{ id: "json", icon: "{ }", l: "JSON", d: "API & LLM" }, { id: "markdown", icon: "MD", l: "Markdown", d: "Paste into AI" }].map(f => (
                  <button key={f.id} onClick={() => setExportFormat(f.id)} style={{ flex: 1, padding: "14px", borderRadius: "10px", cursor: "pointer", textAlign: "center", background: exportFormat === f.id ? "rgba(233,69,96,0.15)" : "rgba(255,255,255,0.03)", border: exportFormat === f.id ? "2px solid #e94560" : "1px solid rgba(255,255,255,0.08)", color: exportFormat === f.id ? "#e94560" : "#888" }}>
                    <div style={{ fontSize: "22px", marginBottom: "4px" }}>{f.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: "13px" }}>{f.l}</div>
                    <div style={{ fontSize: "10px", marginTop: "2px", opacity: 0.7 }}>{f.d}</div>
                  </button>
                ))}
              </div>
              <button onClick={handleExport} style={{ width: "100%", padding: "14px", borderRadius: "10px", cursor: "pointer", background: "linear-gradient(135deg, #e94560, #c62a42)", border: "none", color: "#fff", fontSize: "15px", fontWeight: 600 }}>{"\u2197"} Download {exportFormat === "json" ? "JSON" : "Markdown"}</button>
            </Card>
            <Card title="Preview">
              <div style={{ maxHeight: "300px", overflow: "auto", padding: "12px", background: "rgba(0,0,0,0.4)", borderRadius: "8px" }}>
                <pre style={{ margin: 0, fontSize: "10px", color: "#9e9e9e", fontFamily: "'JetBrains Mono',monospace", whiteSpace: "pre-wrap", lineHeight: 1.4 }}>
                  {exportFormat === "json" ? JSON.stringify(generateExportJSON(brand), null, 2) : generateMarkdown(brand)}
                </pre>
              </div>
            </Card>

            {/* Version History */}
            <SectionHeader id="history" label="Version History" icon={"\u27F2"} />
            <Card title="Save History" description="Every save creates a version entry.">
              {(brand.versionHistory || []).length === 0
                ? <p style={{ fontSize: "13px", color: "#666" }}>No saves yet. Hit "Save" to create your first version.</p>
                : (
                  <div style={{ maxHeight: "300px", overflow: "auto" }}>
                    {[...(brand.versionHistory || [])].reverse().map((v, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: i === 0 ? "rgba(46,204,113,0.05)" : "transparent", borderRadius: "6px", border: i === 0 ? "1px solid rgba(46,204,113,0.15)" : "1px solid transparent", marginBottom: "4px" }}>
                        <span style={{ fontSize: "12px", color: i === 0 ? "#2ecc71" : "#888" }}>{v.label}{i === 0 ? " (latest)" : ""}</span>
                        <span style={{ fontSize: "11px", color: "#555" }}>{new Date(v.date).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
            </Card>

            <div style={{ height: "60px" }} />
          </div>
        </main>
      </div>
    </div>
    </BrandContext.Provider>
  );
}

// Phase header banner
function PhaseHeader({ phase, label, subtitle, desc, color }) {
  return (
    <div style={{ padding: "12px 16px", background: `linear-gradient(90deg, ${color}12, transparent)`, borderRadius: "10px", border: `1px solid ${color}20`, marginBottom: "28px", marginTop: phase !== "1" ? "16px" : undefined }}>
      <div style={{ fontSize: "10px", color, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, marginBottom: "2px" }}>Phase {phase}</div>
      <div style={{ fontSize: "15px", color: "#fff", fontWeight: 600 }}>{label} {"\u2014"} {subtitle}</div>
      <p style={{ fontSize: "11px", color: "#666", margin: "4px 0 0" }}>{desc}</p>
    </div>
  );
}
