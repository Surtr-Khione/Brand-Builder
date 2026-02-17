import { Card } from "./ui";

export default function BrandScoreSection({ brand }) {
  const categories = [
    { name: "Foundation", fields: ["brandName", "tagline", "elevatorPitch", "brandPromise", "about", "mission", "vision"], weight: 15 },
    { name: "Story & Values", fields: ["originStory", "coreValues", "whyDifferent", "competitorDiff"], weight: 10 },
    { name: "StoryBrand", fields: ["sbCharacterWants", "sbExternalProblem", "sbInternalProblem", "sbGuideEmpathy", "sbGuideAuthority", "sbPlanSteps", "sbSuccessEnding", "sbFailureEnding", "sbOneLiner"], weight: 15 },
    { name: "Archetype", fields: ["archetype", "enemy", "enemyDescription", "victim", "victimPainPoints", "victimDesiredOutcome"], weight: 12 },
    { name: "Voice & Messaging", fields: ["toneAttributes", "phrases", "doSay", "dontSay", "voiceExample", "socialPersonality", "ctaPrimary"], weight: 15 },
    { name: "Visual Identity", fields: ["primaryColor", "secondaryColor", "accentColor", "primaryFont", "secondaryFont", "logoDescription", "iconStyle", "photoStyle"], weight: 12 },
    { name: "Content Strategy", fields: ["contentPillars", "boilerplate", "keyMessages", "awarenessMessaging"], weight: 10 },
    { name: "Media & Motion", fields: ["videoStyle", "musicStyle", "motionStyle"], weight: 6 },
    { name: "Accessibility", fields: ["inclusiveLanguage", "altTextRules", "contrastMinimum"], weight: 5 },
  ];

  const getFieldScore = (key) => {
    const v = brand[key];
    if (!v) return 0;
    if (Array.isArray(v)) {
      if (key === "contentPillars" || key === "personas") {
        return v.some(x => typeof x === "object" ? Object.values(x).some(val => val && (typeof val === "string" ? val.trim() : true)) : x?.trim()) ? 1 : 0;
      }
      return v.filter(s => typeof s === "string" ? s.trim() : s).length > 0 ? 1 : 0;
    }
    return typeof v === "string" && v.trim() ? 1 : 0;
  };

  const catScores = categories.map(cat => {
    const filled = cat.fields.reduce((acc, f) => acc + getFieldScore(f), 0);
    const pct = Math.round((filled / cat.fields.length) * 100);
    return { ...cat, filled, total: cat.fields.length, pct, weighted: Math.round(pct * cat.weight / 100) };
  });

  const totalScore = catScores.reduce((a, c) => a + c.weighted, 0);
  const grade = totalScore >= 90 ? "A+" : totalScore >= 80 ? "A" : totalScore >= 70 ? "B+" : totalScore >= 60 ? "B" : totalScore >= 50 ? "C" : totalScore >= 35 ? "D" : "F";
  const gradeColor = totalScore >= 70 ? "#2ecc71" : totalScore >= 50 ? "#f39c12" : "#e74c3c";

  const weakest = [...catScores].sort((a, b) => a.pct - b.pct).filter(c => c.pct < 80).slice(0, 3);

  return (
    <div>
      <Card accent={gradeColor}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "20px" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", border: `4px solid ${gradeColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", flexShrink: 0 }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color: gradeColor, lineHeight: 1 }}>{grade}</div>
            <div style={{ fontSize: "10px", color: "#888" }}>{totalScore}/100</div>
          </div>
          <div>
            <div style={{ fontSize: "17px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>Brand Readiness Score</div>
            <p style={{ fontSize: "12px", color: "#888", margin: 0, lineHeight: 1.5 }}>
              {totalScore >= 80 ? "Your brand board is comprehensive. AI tools will produce highly consistent output." :
               totalScore >= 60 ? "Good foundation. Fill the gaps below for maximum AI consistency." :
               totalScore >= 40 ? "Getting there. The areas below need attention for reliable AI output." :
               "Early stage. Focus on Foundation and StoryBrand sections first."}
            </p>
          </div>
        </div>

        {catScores.map(c => (
          <div key={c.name} style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ fontSize: "12px", color: "#ccc" }}>{c.name}</span>
              <span style={{ fontSize: "11px", color: c.pct >= 80 ? "#2ecc71" : c.pct >= 50 ? "#f39c12" : "#e74c3c" }}>{c.filled}/{c.total} ({c.pct}%)</span>
            </div>
            <div style={{ width: "100%", height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${c.pct}%`, height: "100%", background: c.pct >= 80 ? "#2ecc71" : c.pct >= 50 ? "#f39c12" : "#e74c3c", transition: "width 0.5s", borderRadius: "3px" }} />
            </div>
          </div>
        ))}
      </Card>

      {weakest.length > 0 && (
        <Card title="Recommended Focus Areas" description="These areas have the highest impact on brand consistency.">
          {weakest.map(w => (
            <div key={w.name} style={{ padding: "10px 14px", background: "rgba(233,69,96,0.05)", borderRadius: "8px", border: "1px solid rgba(233,69,96,0.1)", marginBottom: "8px" }}>
              <div style={{ fontSize: "13px", color: "#e94560", fontWeight: 600 }}>{w.name} {"\u2014"} {w.pct}%</div>
              <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{w.total - w.filled} fields empty {"\u00B7"} Weighted importance: {w.weight}%</div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
