export function generateExportJSON(brand) {
  const c = v => (typeof v === "string" ? v.trim() : v);
  const fe = a => (Array.isArray(a) ? a.filter(s => typeof s === "string" ? s.trim() : s) : []);

  return {
    _meta: { schema: "brand-board-v2.0", generated: new Date().toISOString() },
    brand: {
      name: c(brand.brandName),
      tagline: c(brand.tagline),
      elevatorPitch: c(brand.elevatorPitch),
      brandPromise: c(brand.brandPromise),
    },
    identity: {
      about: c(brand.about),
      mission: c(brand.mission),
      vision: c(brand.vision),
      coreValues: fe(brand.coreValues),
      whyDifferent: c(brand.whyDifferent),
      originStory: c(brand.originStory),
      differentiators: fe(brand.competitorDiff),
    },
    storyBrand: {
      characterWants: c(brand.sbCharacterWants),
      problem: {
        external: c(brand.sbExternalProblem),
        internal: c(brand.sbInternalProblem),
        philosophical: c(brand.sbPhilosophicalProblem),
      },
      guide: {
        empathy: c(brand.sbGuideEmpathy),
        authority: c(brand.sbGuideAuthority),
      },
      plan: fe(brand.sbPlanSteps),
      cta: {
        direct: c(brand.sbDirectCTA || brand.ctaPrimary),
        transitional: c(brand.sbTransitionalCTA || brand.ctaSecondary),
      },
      success: c(brand.sbSuccessEnding),
      failure: c(brand.sbFailureEnding),
      transformation: c(brand.sbTransformation),
      oneLiner: c(brand.sbOneLiner),
    },
    archetype: {
      primary: c(brand.archetype),
      secondary: c(brand.secondaryArchetype),
      enemy: { name: c(brand.enemy), description: c(brand.enemyDescription) },
      victim: {
        icp: c(brand.victim),
        painPoints: fe(brand.victimPainPoints),
        desiredOutcome: c(brand.victimDesiredOutcome),
      },
    },
    contentPillars: (brand.contentPillars || [])
      .filter(p => p.name)
      .map(p => ({
        name: p.name,
        description: p.description,
        topics: (p.topics || []).filter(t => t),
        audience: p.audience,
      })),
    messaging: {
      boilerplate: c(brand.boilerplate),
      keyMessages: fe(brand.keyMessages),
      stages: {
        awareness: c(brand.awarenessMessaging),
        consideration: c(brand.considerationMessaging),
        decision: c(brand.decisionMessaging),
      },
    },
    voice: {
      tone: fe(brand.toneAttributes),
      phrases: fe(brand.phrases),
      doSay: fe(brand.doSay),
      dontSay: fe(brand.dontSay),
      example: c(brand.voiceExample),
      social: c(brand.socialPersonality),
      emailSignoff: c(brand.emailSignoff),
      cta: { primary: c(brand.ctaPrimary), secondary: c(brand.ctaSecondary) },
      hashtags: fe(brand.hashTags),
      touchpoints: {
        website: c(brand.touchpointWebsite),
        social: c(brand.touchpointSocial),
        email: c(brand.touchpointEmail),
        ads: c(brand.touchpointAds),
        sales: c(brand.touchpointSales),
        support: c(brand.touchpointSupport),
      },
    },
    typography: {
      primary: c(brand.primaryFont),
      secondary: c(brand.secondaryFont),
      accent: c(brand.accentFont),
      scale: {
        h1: c(brand.h1Size),
        h2: c(brand.h2Size),
        h3: c(brand.h3Size),
        h4: c(brand.h4Size),
        body: c(brand.bodySize),
        small: c(brand.smallSize),
      },
      rules: c(brand.typographyRules),
    },
    colors: {
      primary: c(brand.primaryColor),
      secondary: c(brand.secondaryColor),
      accent: c(brand.accentColor),
      neutralLight: c(brand.neutralLight),
      neutralDark: c(brand.neutralDark),
      semantic: {
        success: c(brand.successColor),
        warning: c(brand.warningColor),
        error: c(brand.errorColor),
      },
      rules: c(brand.colorUsageRules),
      lightMode: {
        enabled: brand.lightModeEnabled,
        bg: c(brand.lightBg),
        surface: c(brand.lightSurface),
        text: c(brand.lightText),
        textSecondary: c(brand.lightTextSecondary),
        border: c(brand.lightBorder),
      },
      darkMode: {
        enabled: brand.darkModeEnabled,
        bg: c(brand.darkBg),
        surface: c(brand.darkSurface),
        text: c(brand.darkText),
        textSecondary: c(brand.darkTextSecondary),
        border: c(brand.darkBorder),
      },
    },
    photography: {
      style: c(brand.photoStyle),
      subjects: c(brand.photoSubjects),
      lighting: c(brand.photoLighting),
      composition: c(brand.photoComposition),
      filters: c(brand.photoFilters),
      avoid: c(brand.photoDontUse),
      stockPolicy: c(brand.stockVsOriginal),
    },
    visual: {
      logo: {
        description: c(brand.logoDescription),
        minSize: c(brand.logoMinSize),
        clearSpace: c(brand.logoClearSpace),
        backgrounds: c(brand.logoBackgrounds),
        restrictions: c(brand.logoDontRules),
      },
      icons: {
        style: c(brand.iconStyle),
        stroke: c(brand.iconStrokeWeight),
        radius: c(brand.iconCornerRadius),
        rules: c(brand.iconRules),
      },
    },
    motion: {
      style: c(brand.motionStyle),
      speed: c(brand.motionSpeed),
      transitions: c(brand.motionTransitions),
      loading: c(brand.motionLoadingStates),
      scroll: c(brand.motionScrollBehavior),
      avoid: c(brand.motionDontUse),
    },
    media: {
      video: {
        style: c(brand.videoStyle),
        intro: c(brand.videoIntroRules),
        outro: c(brand.videoOutroRules),
      },
      audio: {
        description: c(brand.soundDescription),
        music: c(brand.musicStyle),
        audioLogo: c(brand.audioLogo),
      },
    },
    accessibility: {
      contrast: c(brand.contrastMinimum),
      altText: c(brand.altTextRules),
      inclusiveLanguage: c(brand.inclusiveLanguage),
      minFont: c(brand.a11yFontMinSize),
      colorBlind: c(brand.a11yColorBlindSafe),
      screenReader: c(brand.a11yScreenReader),
      reduceMotion: c(brand.a11yMotionReduce),
    },
    custom: (brand.customFields || []).filter(f => f.key && f.value),
  };
}

export function generateMarkdown(b) {
  const fe = a => (Array.isArray(a) ? a.filter(s => typeof s === "string" ? s.trim() : s) : []);
  return `# ${b.brandName || "Brand"} — Brand Board
> ${b.tagline || ""}

## Overview
**Pitch:** ${b.elevatorPitch || "\u2014"}
**Promise:** ${b.brandPromise || "\u2014"}

## StoryBrand
**Character Wants:** ${b.sbCharacterWants || "\u2014"}
**External Problem:** ${b.sbExternalProblem || "\u2014"}
**Internal Problem:** ${b.sbInternalProblem || "\u2014"}
**Guide (Empathy):** ${b.sbGuideEmpathy || "\u2014"}
**Guide (Authority):** ${b.sbGuideAuthority || "\u2014"}
**Plan:** ${fe(b.sbPlanSteps).join(" \u2192 ") || "\u2014"}
**Success:** ${b.sbSuccessEnding || "\u2014"}
**Failure:** ${b.sbFailureEnding || "\u2014"}
**One-Liner:** ${b.sbOneLiner || "\u2014"}

## Identity
**Mission:** ${b.mission || "\u2014"}
**Vision:** ${b.vision || "\u2014"}
**Values:** ${fe(b.coreValues).join(", ") || "\u2014"}

## Archetype: ${b.archetype || "\u2014"}
**Enemy:** ${b.enemy || "\u2014"}
**ICP:** ${b.victim || "\u2014"}

## Voice
**Tone:** ${fe(b.toneAttributes).join(", ") || "\u2014"}
**Do:** ${fe(b.doSay).join(", ") || "\u2014"}
**Don't:** ${fe(b.dontSay).join(", ") || "\u2014"}

## Typography
${b.primaryFont} / ${b.secondaryFont}

## Colors
${b.primaryColor} | ${b.secondaryColor} | ${b.accentColor}
`;
}
