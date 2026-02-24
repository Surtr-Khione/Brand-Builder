import { createContext } from "react";

export const BrandContext = createContext();

// Default theme (the dark builder UI)
export const DEFAULT_THEME = {
  bg: "#0a0a0f",
  surface: "rgba(255,255,255,0.02)",
  surfaceBorder: "rgba(255,255,255,0.06)",
  headerBg: "rgba(10,10,15,0.97)",
  sidebarBg: "rgba(10,10,15,0.5)",
  text: "#fff",
  textSecondary: "#9e9e9e",
  textMuted: "#666",
  textDim: "#555",
  inputBg: "rgba(255,255,255,0.04)",
  inputBorder: "rgba(255,255,255,0.08)",
  inputText: "#e0e0e0",
  accent: "#e94560",
  accentGradient: "linear-gradient(135deg, #e94560, #c62a42)",
  headingFont: "'Playfair Display', serif",
  bodyFont: "'DM Sans', sans-serif",
  activeNavBg: "rgba(233,69,96,0.12)",
  activeNavBorder: "rgba(233,69,96,0.2)",
  cardAccentLine: "#e94560",
  progressGradient: "linear-gradient(90deg, #e94560, #f39c12)",
  branded: false,
};

// Compute a brand-applied theme from brand data
export function computeBrandTheme(brand) {
  // Determine which mode to use based on what's enabled
  // Prefer dark mode for the builder since it's a dark UI by default
  const useDark = brand.darkModeEnabled;
  const useLight = brand.lightModeEnabled;

  let bg, surface, text, textSec, border;

  if (useDark) {
    bg = brand.darkBg || "#0a0a0f";
    surface = brand.darkSurface || "#1a1a2e";
    text = brand.darkText || "#e0e0e0";
    textSec = brand.darkTextSecondary || "#9e9e9e";
    border = brand.darkBorder || "#2a2a3e";
  } else if (useLight) {
    bg = brand.lightBg || "#ffffff";
    surface = brand.lightSurface || "#f8f9fa";
    text = brand.lightText || "#1a1a2e";
    textSec = brand.lightTextSecondary || "#555555";
    border = brand.lightBorder || "#e0e0e0";
  } else {
    bg = "#0a0a0f";
    surface = "rgba(255,255,255,0.02)";
    text = "#fff";
    textSec = "#9e9e9e";
    border = "rgba(255,255,255,0.06)";
  }

  const accent = brand.accentColor || "#e94560";
  const primary = brand.primaryColor || "#1a1a2e";
  const headingFont = brand.primaryFont ? `'${brand.primaryFont}', serif` : "'Playfair Display', serif";
  const bodyFont = brand.secondaryFont ? `'${brand.secondaryFont}', sans-serif` : "'DM Sans', sans-serif";

  // Derive muted and dim from textSec
  const dimOpacity = (color) => {
    // Simple approach: return the color with reduced context
    return color;
  };

  return {
    bg,
    surface,
    surfaceBorder: border,
    headerBg: primary,
    sidebarBg: surface,
    text,
    textSecondary: textSec,
    textMuted: textSec,
    textDim: textSec,
    inputBg: bg,
    inputBorder: border,
    inputText: text,
    accent,
    accentGradient: `linear-gradient(135deg, ${accent}, ${primary})`,
    headingFont,
    bodyFont,
    activeNavBg: `${accent}20`,
    activeNavBorder: `${accent}40`,
    cardAccentLine: accent,
    progressGradient: `linear-gradient(90deg, ${accent}, ${brand.primaryColor || accent})`,
    branded: true,
  };
}
