export const SECTIONS = [
  // Phase 1: Discover
  { id: "dump", label: "Brand Dump", icon: "\uD83D\uDCE5", group: "Discover" },
  { id: "scanner", label: "AI Scanner", icon: "\u26A1", group: "Discover" },
  { id: "overview", label: "Overview", icon: "\u25C8", group: "Discover" },
  // Phase 2: Strategy
  { id: "identity", label: "Identity & Story", icon: "\u25CE", group: "Strategy" },
  { id: "archetype", label: "Archetype", icon: "\u2B21", group: "Strategy" },
  { id: "storybrand", label: "StoryBrand Script", icon: "\uD83D\uDCD6", group: "Strategy" },
  { id: "pillars", label: "Content Pillars", icon: "\u25E7", group: "Strategy" },
  { id: "voice", label: "Voice & Messaging", icon: "\u275D", group: "Strategy" },
  // Phase 3: Expression
  { id: "colors", label: "Colors & Modes", icon: "\u25D0", group: "Expression" },
  { id: "typography", label: "Typography", icon: "Aa", group: "Expression" },
  { id: "photography", label: "Photography", icon: "\uD83D\uDCF7", group: "Expression" },
  { id: "visual", label: "Logo & Icons", icon: "\u25EB", group: "Expression" },
  { id: "motion", label: "Motion", icon: "\u2727", group: "Expression" },
  { id: "media", label: "Media & Sound", icon: "\u25B6", group: "Expression" },
  // Phase 4: Govern
  { id: "accessibility", label: "Accessibility", icon: "\u267F", group: "Govern" },
  { id: "guidelines", label: "Custom Fields", icon: "\u2630", group: "Govern" },
  // Phase 5: Deploy
  { id: "score", label: "Brand Score", icon: "\uD83D\uDCCA", group: "Deploy" },
  { id: "integrations", label: "Integrations", icon: "\uD83D\uDD17", group: "Deploy" },
  { id: "export", label: "Export", icon: "\u2197", group: "Deploy" },
  { id: "history", label: "Version History", icon: "\u27F2", group: "Deploy" },
];

export const ARCHETYPES = [
  { name: "The Hero", desc: "Courageous, bold, transformative", color: "#C62828" },
  { name: "The Sage", desc: "Wise, knowledgeable, analytical", color: "#1565C0" },
  { name: "The Explorer", desc: "Adventurous, independent, pioneering", color: "#2E7D32" },
  { name: "The Creator", desc: "Innovative, artistic, visionary", color: "#6A1B9A" },
  { name: "The Ruler", desc: "Authoritative, refined, leading", color: "#212121" },
  { name: "The Caregiver", desc: "Nurturing, generous, compassionate", color: "#00838F" },
  { name: "The Magician", desc: "Transformative, visionary, charismatic", color: "#4527A0" },
  { name: "The Rebel", desc: "Disruptive, revolutionary, liberated", color: "#BF360C" },
  { name: "The Jester", desc: "Playful, humorous, joyful", color: "#F9A825" },
  { name: "The Lover", desc: "Passionate, intimate, committed", color: "#AD1457" },
  { name: "The Everyman", desc: "Relatable, honest, grounded", color: "#5D4037" },
  { name: "The Innocent", desc: "Optimistic, pure, trustworthy", color: "#0277BD" },
];

export const SCAN_SOURCES = [
  { id: "website", label: "Website", icon: "\uD83C\uDF10", placeholder: "https://yourbrand.com", desc: "Homepage, about, copy, colors, fonts" },
  { id: "facebook", label: "Facebook", icon: "\uD83D\uDCD8", placeholder: "https://facebook.com/yourbrand", desc: "Page info, post tone, visual style" },
  { id: "instagram", label: "Instagram", icon: "\uD83D\uDCF8", placeholder: "https://instagram.com/yourbrand", desc: "Bio, aesthetic, hashtags, themes" },
  { id: "youtube", label: "YouTube", icon: "\u25B6\uFE0F", placeholder: "https://youtube.com/@yourbrand", desc: "Channel desc, video style, patterns" },
  { id: "linkedin", label: "LinkedIn", icon: "\uD83D\uDCBC", placeholder: "https://linkedin.com/company/yourbrand", desc: "Company desc, tagline, specialties" },
  { id: "tiktok", label: "TikTok", icon: "\uD83C\uDFB5", placeholder: "https://tiktok.com/@yourbrand", desc: "Bio, energy, hashtag strategy" },
  { id: "google", label: "Google Biz", icon: "\uD83D\uDCCD", placeholder: "Business Name + Location", desc: "Description, reviews, positioning" },
  { id: "twitter", label: "X / Twitter", icon: "\uD835\uDD4F", placeholder: "https://x.com/yourbrand", desc: "Bio, voice, engagement style" },
];

export const DEFAULT_BRAND = {
  brandName: "", tagline: "", about: "", mission: "", vision: "",
  coreValues: ["", "", "", "", ""],
  whyDifferent: "", archetype: "", secondaryArchetype: "",
  // StoryBrand BrandScript
  sbCharacterWants: "", sbExternalProblem: "", sbInternalProblem: "", sbPhilosophicalProblem: "",
  sbGuideEmpathy: "", sbGuideAuthority: "",
  sbPlanSteps: ["", "", ""], sbDirectCTA: "", sbTransitionalCTA: "",
  sbSuccessEnding: "", sbFailureEnding: "", sbTransformation: "", sbOneLiner: "",
  // Identity
  enemy: "", enemyDescription: "", victim: "",
  victimPainPoints: ["", "", ""], victimDesiredOutcome: "",
  brandPromise: "", elevatorPitch: "", originStory: "",
  // Content Pillars
  contentPillars: [{ name: "", description: "", topics: ["", ""], audience: "" }],
  boilerplate: "", keyMessages: ["", "", ""],
  awarenessMessaging: "", considerationMessaging: "", decisionMessaging: "",
  // Personas
  personas: [{ name: "", role: "", demographics: "", psychographics: "", painPoints: "", triggers: "", objections: "", channels: "", journey: "" }],
  // Voice
  phrases: ["", "", "", "", ""],
  toneAttributes: ["", "", "", ""],
  doSay: ["", "", ""], dontSay: ["", "", ""],
  voiceExample: "",
  touchpointWebsite: "", touchpointSocial: "", touchpointEmail: "", touchpointAds: "", touchpointSales: "", touchpointSupport: "",
  // Typography
  primaryFont: "Playfair Display", secondaryFont: "DM Sans", accentFont: "",
  h1Size: "48px", h2Size: "36px", h3Size: "28px", h4Size: "22px", bodySize: "16px", smallSize: "14px",
  typographyRules: "",
  // Colors
  primaryColor: "#1a1a2e", secondaryColor: "#16213e", accentColor: "#e94560",
  neutralLight: "#f5f5f5", neutralDark: "#333333",
  successColor: "#2ecc71", warningColor: "#f39c12", errorColor: "#e74c3c",
  colorUsageRules: "",
  // Light mode
  lightModeEnabled: true,
  lightBg: "#ffffff", lightSurface: "#f8f9fa", lightText: "#1a1a2e", lightTextSecondary: "#555555", lightBorder: "#e0e0e0",
  // Dark mode
  darkModeEnabled: true,
  darkBg: "#0a0a0f", darkSurface: "#1a1a2e", darkText: "#e0e0e0", darkTextSecondary: "#9e9e9e", darkBorder: "#2a2a3e",
  // Photography
  photoStyle: "", photoSubjects: "", photoLighting: "", photoComposition: "",
  photoFilters: "", photoDontUse: "", stockVsOriginal: "",
  // Visual Assets
  logoDescription: "", logoMinSize: "32px", logoClearSpace: "1x height",
  logoBackgrounds: "", logoDontRules: "",
  iconStyle: "", iconStrokeWeight: "2px", iconCornerRadius: "2px", iconRules: "",
  // Motion
  motionStyle: "", motionSpeed: "", motionTransitions: "", motionLoadingStates: "",
  motionScrollBehavior: "", motionDontUse: "",
  // Media
  videoStyle: "", videoIntroRules: "", videoOutroRules: "",
  soundDescription: "", musicStyle: "", audioLogo: "",
  // Accessibility
  contrastMinimum: "4.5:1", altTextRules: "", inclusiveLanguage: "",
  a11yFontMinSize: "16px", a11yColorBlindSafe: "", a11yScreenReader: "", a11yMotionReduce: "",
  // Messaging
  ctaPrimary: "", ctaSecondary: "",
  hashTags: ["", "", "", ""],
  competitorDiff: ["", "", ""],
  socialPersonality: "", emailSignoff: "",
  customFields: [],
  integrations: [],
  versionHistory: [],
};
