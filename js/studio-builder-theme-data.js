(function (win) {
  let initializedBuilderThemeData = null;

  function initBuilderThemeData() {
    if (initializedBuilderThemeData) return initializedBuilderThemeData;

    const huePresets = {
    cyan: { h: 190 },
    magenta: { h: 320 },
    violet: { h: 265 },
    red: { h: 4 },
    green: { h: 140 },
    blue: { h: 214 },
    yellow: { h: 52 },
    lime: { h: 88 },
    amber: { h: 38 },
    teal: { h: 176 },
    orange: { h: 26 },
    rose: { h: 346 },
    emerald: { h: 162 },
    cobalt: { h: 223 },
    ultraviolet: { h: 278 },
    gray: { neutral: "gray" },
    steel: { neutral: "steel" },
    slate: { neutral: "slate" },
    black: { neutral: "black" },
    white: { neutral: "white" },
    };
    const colorFamilyPresets = {
    monochrome: {
    mode: "dark",
    sat: 8,
    bgL: 10,
    elevL: 14,
    raisedL: 18,
    softL: 22,
    textL: 92,
    mutedL: 72,
    borderL: 30,
    borderStrongL: 44,
    accentL: 88,
    accentSat: 6,
    },
    bold: {
    mode: "dark",
    sat: 78,
    bgL: 9,
    elevL: 13,
    raisedL: 18,
    softL: 23,
    textL: 95,
    mutedL: 76,
    borderL: 31,
    borderStrongL: 50,
    accentL: 60,
    accentSat: 92,
    },
    paper: {
    mode: "light",
    sat: 32,
    bgL: 95,
    elevL: 98,
    raisedL: 91,
    softL: 87,
    textL: 15,
    mutedL: 34,
    borderL: 72,
    borderStrongL: 58,
    accentL: 44,
    accentSat: 60,
    },
    pastel: {
    mode: "light",
    sat: 38,
    bgL: 95,
    elevL: 100,
    raisedL: 92,
    softL: 88,
    textL: 16,
    mutedL: 40,
    borderL: 74,
    borderStrongL: 60,
    accentL: 56,
    accentSat: 58,
    },
    cathode: {
    mode: "dark",
    sat: 92,
    bgL: 7,
    elevL: 10,
    raisedL: 14,
    softL: 18,
    textL: 92,
    mutedL: 72,
    borderL: 26,
    borderStrongL: 40,
    accentL: 68,
    accentSat: 100,
    glow: true,
    },
    electric: {
    mode: "dark",
    sat: 96,
    bgL: 6,
    elevL: 9,
    raisedL: 13,
    softL: 18,
    textL: 96,
    mutedL: 76,
    borderL: 24,
    borderStrongL: 38,
    accentL: 72,
    accentSat: 100,
    glow: true,
    },
    noir: {
    mode: "dark",
    sat: 26,
    bgL: 5,
    elevL: 8,
    raisedL: 12,
    softL: 16,
    textL: 90,
    mutedL: 66,
    borderL: 22,
    borderStrongL: 34,
    accentL: 64,
    accentSat: 58,
    },
    frost: {
    mode: "light",
    sat: 30,
    bgL: 98,
    elevL: 100,
    raisedL: 96,
    softL: 93,
    textL: 18,
    mutedL: 44,
    borderL: 78,
    borderStrongL: 62,
    accentL: 50,
    accentSat: 48,
    },
    skeuo: {
    mode: "light",
    sat: 34,
    bgL: 84,
    elevL: 89,
    raisedL: 85,
    softL: 88,
    textL: 24,
    mutedL: 42,
    borderL: 70,
    borderStrongL: 56,
    accentL: 56,
    accentSat: 58,
    },
    sunset: {
    mode: "dark",
    sat: 74,
    bgL: 8,
    elevL: 12,
    raisedL: 16,
    softL: 21,
    textL: 94,
    mutedL: 74,
    borderL: 30,
    borderStrongL: 46,
    accentL: 62,
    accentSat: 88,
    },
    };
    const stylePresets = {
    "base-default": {},
    terminal: {
    "--ds-radius-1": "2px",
    "--ds-radius-2": "2px",
    "--ds-radius-3": "4px",
    "--ds-radius-4": "6px",
    "--ds-radius-pill": "4px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-label-transform": "uppercase",
    "--ds-label-spacing": "0.12em",
    "--ds-card-shadow":
    "0 0 0 1px rgba(255,255,255,0.05) inset, 0 0 24px color-mix(in oklab,var(--ds-accent) 15%, transparent)",
    "--ds-btn-shadow": "none",
    "--ds-btn-shadow-hover": "none",
    "--ds-btn-shadow-active":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 45%, transparent)",
    "--ds-input-shadow":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 25%, transparent)",
    },
    technical: {
    "--ds-radius-1": "0px",
    "--ds-radius-2": "0px",
    "--ds-radius-3": "0px",
    "--ds-radius-4": "0px",
    "--ds-radius-pill": "0px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-card-shadow": "none",
    "--ds-btn-shadow": "none",
    "--ds-btn-shadow-hover": "inset 0 0 0 1px var(--ds-accent)",
    "--ds-btn-shadow-active": "inset 0 0 0 1px var(--ds-accent-strong)",
    "--ds-input-shadow": "none",
    "--ds-label-transform": "uppercase",
    "--ds-label-spacing": "0.12em",
    },
    paper: {
    "--ds-radius-1": "5px",
    "--ds-radius-2": "10px",
    "--ds-radius-3": "14px",
    "--ds-radius-4": "18px",
    "--ds-radius-pill": "999px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-shadow-sm": "0 2px 10px rgba(20, 38, 29, 0.08)",
    "--ds-shadow-md": "0 12px 28px rgba(20, 38, 29, 0.12)",
    "--ds-card-shadow": "0 2px 10px rgba(40,45,35,0.08)",
    "--ds-btn-shadow": "none",
    "--ds-btn-shadow-hover": "none",
    "--ds-btn-shadow-active": "none",
    "--ds-input-shadow": "none",
    "--ds-label-transform": "uppercase",
    "--ds-label-spacing": "0.06em",
    "--ds-card-secondary-bg":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-bg-elevated) 88%, var(--ds-accent) 12%) 0%, color-mix(in oklab, var(--ds-bg-raised) 90%, var(--ds-accent) 10%) 100%)",
    "--ds-card-secondary-border":
    "color-mix(in oklab, var(--ds-border) 64%, var(--ds-accent) 36%)",
    "--ds-card-secondary-shadow":
    "0 1px 0 rgba(255,255,255,0.68) inset",
    "--ds-chip-bg":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-bg-elevated) 84%, var(--ds-accent) 16%) 0%, color-mix(in oklab, var(--ds-bg-raised) 88%, var(--ds-accent) 12%) 100%)",
    "--ds-chip-border":
    "color-mix(in oklab, var(--ds-border) 62%, var(--ds-accent) 38%)",
    },
    skeuo: {
    "--ds-radius-1": "5px",
    "--ds-radius-2": "10px",
    "--ds-radius-3": "14px",
    "--ds-radius-4": "18px",
    "--ds-radius-pill": "999px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-shadow-sm":
    "0 1px 0 rgba(255,255,255,0.65) inset, 0 3px 8px rgba(72,88,114,0.18)",
    "--ds-shadow-md":
    "0 1px 0 rgba(255,255,255,0.7) inset, 0 10px 16px rgba(70,83,104,0.24)",
    "--ds-card-shadow":
    "0 1px 0 rgba(255,255,255,0.7) inset, 0 8px 14px rgba(73,86,108,0.17)",
    "--ds-btn-shadow":
    "0 1px 0 rgba(255,255,255,0.85) inset, 0 -1px 0 rgba(99,112,134,0.25) inset, 0 2px 3px rgba(71,85,107,0.2)",
    "--ds-btn-shadow-hover":
    "0 1px 0 rgba(255,255,255,0.9) inset, 0 -1px 0 rgba(99,112,134,0.3) inset, 0 2px 4px rgba(71,85,107,0.2)",
    "--ds-btn-shadow-active": "0 1px 2px rgba(67,77,96,0.35) inset",
    "--ds-input-shadow":
    "0 1px 2px rgba(76,90,112,0.3) inset, 0 1px 0 rgba(255,255,255,0.8)",
    "--ds-btn-press-transform": "translateY(1px)",
    "--ds-card-secondary-bg":
    "linear-gradient(180deg, color-mix(in oklab, white 78%, var(--ds-accent) 22%) 0%, color-mix(in oklab, var(--ds-bg-raised) 82%, white 12%, var(--ds-accent) 6%) 100%)",
    "--ds-card-secondary-border":
    "color-mix(in oklab, var(--ds-card-border) 56%, var(--ds-accent) 44%)",
    "--ds-card-secondary-shadow":
    "0 1px 0 rgba(255,255,255,0.74) inset, 0 3px 6px rgba(80,94,116,0.14)",
    "--ds-chip-bg":
    "linear-gradient(180deg, color-mix(in oklab, white 72%, var(--ds-accent) 28%) 0%, color-mix(in oklab, var(--ds-bg-raised) 80%, white 14%, var(--ds-accent) 6%) 100%)",
    "--ds-chip-border":
    "color-mix(in oklab, var(--ds-border-strong) 54%, var(--ds-accent) 46%)",
    },
    glassmorph: {
    "--ds-radius-1": "8px",
    "--ds-radius-2": "14px",
    "--ds-radius-3": "18px",
    "--ds-radius-4": "24px",
    "--ds-radius-pill": "999px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-card-shadow": "0 6px 18px rgba(0,0,0,0.22)",
    "--ds-btn-shadow": "0 1px 0 rgba(255,255,255,0.25) inset",
    "--ds-btn-shadow-hover": "0 1px 0 rgba(255,255,255,0.35) inset",
    "--ds-input-shadow": "0 1px 0 rgba(255,255,255,0.2) inset",
    },
    material: {
    "--ds-radius-1": "4px",
    "--ds-radius-2": "10px",
    "--ds-radius-3": "14px",
    "--ds-radius-4": "18px",
    "--ds-radius-pill": "999px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-card-shadow": "0 2px 10px rgba(0,0,0,0.16)",
    "--ds-btn-shadow": "0 1px 0 rgba(255,255,255,0.08) inset",
    "--ds-btn-shadow-hover": "0 1px 0 rgba(255,255,255,0.12) inset",
    "--ds-btn-shadow-active": "0 1px 2px rgba(0,0,0,0.2) inset",
    "--ds-input-shadow": "none",
    },
    "hud-glow": {
    "--ds-radius-1": "2px",
    "--ds-radius-2": "3px",
    "--ds-radius-3": "4px",
    "--ds-radius-4": "6px",
    "--ds-radius-pill": "6px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-label-transform": "uppercase",
    "--ds-label-spacing": "0.1em",
    "--ds-card-shadow":
    "0 0 14px color-mix(in oklab,var(--ds-accent) 18%, transparent), inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 24%, transparent)",
    "--ds-btn-shadow":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 30%, transparent), 0 0 8px color-mix(in oklab,var(--ds-accent) 20%, transparent)",
    "--ds-btn-shadow-hover":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 44%, transparent), 0 0 11px color-mix(in oklab,var(--ds-accent) 30%, transparent)",
    "--ds-btn-shadow-active":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 55%, transparent)",
    "--ds-input-shadow":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 28%, transparent)",
    },
    "neo-brutal": {
    "--ds-radius-1": "0px",
    "--ds-radius-2": "0px",
    "--ds-radius-3": "0px",
    "--ds-radius-4": "0px",
    "--ds-radius-pill": "0px",
    "--ds-border-w": "2px",
    "--ds-border-style": "solid",
    "--ds-card-shadow":
    "6px 6px 0 color-mix(in oklab,var(--ds-accent) 25%, var(--ds-bg))",
    "--ds-btn-shadow":
    "3px 3px 0 color-mix(in oklab,var(--ds-accent) 35%, var(--ds-bg))",
    "--ds-btn-shadow-hover":
    "4px 4px 0 color-mix(in oklab,var(--ds-accent) 40%, var(--ds-bg))",
    "--ds-btn-shadow-active":
    "1px 1px 0 color-mix(in oklab,var(--ds-accent) 40%, var(--ds-bg))",
    "--ds-input-shadow": "none",
    "--ds-btn-press-transform": "translateY(1px)",
    },
    arcade: {
    "--ds-radius-1": "6px",
    "--ds-radius-2": "12px",
    "--ds-radius-3": "16px",
    "--ds-radius-4": "20px",
    "--ds-radius-pill": "999px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-card-shadow":
    "0 0 18px color-mix(in oklab,var(--ds-accent) 18%, transparent)",
    "--ds-btn-shadow":
    "0 0 0 1px color-mix(in oklab,var(--ds-accent) 42%, transparent), 0 0 11px color-mix(in oklab,var(--ds-accent) 28%, transparent)",
    "--ds-btn-shadow-hover":
    "0 0 0 1px color-mix(in oklab,var(--ds-accent) 56%, transparent), 0 0 14px color-mix(in oklab,var(--ds-accent) 38%, transparent)",
    "--ds-btn-shadow-active": "inset 0 1px 2px rgba(0,0,0,0.25)",
    "--ds-input-shadow":
    "0 0 0 1px color-mix(in oklab,var(--ds-accent) 24%, transparent) inset",
    },
    editorial: {
    "--ds-radius-1": "2px",
    "--ds-radius-2": "4px",
    "--ds-radius-3": "6px",
    "--ds-radius-4": "8px",
    "--ds-radius-pill": "999px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-card-shadow":
    "0 1px 0 rgba(0,0,0,0.05), 0 6px 14px rgba(0,0,0,0.08)",
    "--ds-btn-shadow": "none",
    "--ds-btn-shadow-hover": "none",
    "--ds-btn-shadow-active": "none",
    "--ds-input-shadow": "none",
    "--ds-label-transform": "none",
    "--ds-label-spacing": "0.02em",
    },
    };
    const scalePresets = {
    compact: {
    "--ds-space-1": "3px",
    "--ds-space-2": "6px",
    "--ds-space-3": "9px",
    "--ds-space-4": "12px",
    "--ds-space-5": "16px",
    "--ds-space-6": "20px",
    "--ds-space-8": "26px",
    "--ds-layout-gap": "12px",
    "--ds-card-pad": "12px",
    "--ds-control-h": "34px",
    "--ds-control-h-sm": "28px",
    },
    standard: {
    "--ds-space-1": "4px",
    "--ds-space-2": "8px",
    "--ds-space-3": "12px",
    "--ds-space-4": "16px",
    "--ds-space-5": "20px",
    "--ds-space-6": "24px",
    "--ds-space-8": "32px",
    "--ds-layout-gap": "16px",
    "--ds-card-pad": "16px",
    "--ds-control-h": "38px",
    "--ds-control-h-sm": "32px",
    },
    comfortable: {
    "--ds-space-1": "5px",
    "--ds-space-2": "10px",
    "--ds-space-3": "14px",
    "--ds-space-4": "20px",
    "--ds-space-5": "24px",
    "--ds-space-6": "30px",
    "--ds-space-8": "38px",
    "--ds-layout-gap": "20px",
    "--ds-card-pad": "20px",
    "--ds-control-h": "44px",
    "--ds-control-h-sm": "36px",
    },
    };
    const texturePresets = {
    clean: {
    "--ds-body-bg-image": "none",
    "--ds-card-bg-image": "none",
    "--ds-body-texture-image": "none",
    "--ds-card-texture-image": "none",
    "--ds-control-texture-image": "none",
    "--ds-texture-blend": "normal",
    "--ds-texture-strength": "0",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "paper-grain": {
    "--ds-body-texture-image":
    "repeating-linear-gradient(45deg, rgba(0,0,0,0.018) 0 1px, transparent 1px 3px)",
    "--ds-card-texture-image":
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, rgba(0,0,0,0.015) 1px 2px)",
    "--ds-control-texture-image":
    "repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0 1px, transparent 1px 4px)",
    "--ds-texture-blend": "multiply",
    "--ds-texture-strength": "0.2",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "brushed-metal": {
    "--ds-body-texture-image":
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0 1px, rgba(0,0,0,0.06) 1px 3px)",
    "--ds-card-texture-image":
    "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(0,0,0,0.15))",
    "--ds-control-texture-image":
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 1px, rgba(0,0,0,0.08) 1px 2px)",
    "--ds-texture-blend": "overlay",
    "--ds-texture-strength": "0.35",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "frosted-glass": {
    "--ds-body-bg-image":
    "radial-gradient(circle at 15% 10%, rgba(255,255,255,0.15), transparent 45%)",
    "--ds-card-bg-image":
    "linear-gradient(145deg, rgba(255,255,255,0.2), rgba(255,255,255,0.04))",
    "--ds-body-texture-image":
    "radial-gradient(circle at 20% 12%, rgba(255,255,255,0.16), transparent 42%)",
    "--ds-card-texture-image":
    "linear-gradient(145deg, rgba(255,255,255,0.26), rgba(255,255,255,0.02))",
    "--ds-control-texture-image":
    "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.02))",
    "--ds-texture-blend": "screen",
    "--ds-texture-strength": "0.35",
    "--ds-body-backdrop-blur": "2px",
    "--ds-card-backdrop-blur": "8px",
    "--ds-control-backdrop-blur": "4px",
    },
    "wire-grid": {
    "--ds-body-bg-image":
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 2px, transparent 2px, transparent 6px)",
    "--ds-card-bg-image":
    "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.05))",
    "--ds-body-texture-image":
    "repeating-linear-gradient(0deg, color-mix(in oklab,var(--ds-accent) 14%, transparent) 0 1px, transparent 1px 18px), repeating-linear-gradient(90deg, color-mix(in oklab,var(--ds-accent-strong) 10%, transparent) 0 1px, transparent 1px 14px)",
    "--ds-card-texture-image":
    "repeating-linear-gradient(0deg, color-mix(in oklab,var(--ds-accent) 10%, transparent) 0 1px, transparent 1px 12px)",
    "--ds-control-texture-image":
    "linear-gradient(180deg, color-mix(in oklab,var(--ds-accent) 10%, transparent), transparent)",
    "--ds-texture-blend": "normal",
    "--ds-texture-strength": "0.45",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "noise-film": {
    "--ds-body-bg-image": "none",
    "--ds-card-bg-image": "none",
    "--ds-body-texture-image":
    "repeating-radial-gradient(circle at 0 0, rgba(255,255,255,0.025) 0 1px, transparent 1px 3px), repeating-radial-gradient(circle at 100% 100%, rgba(0,0,0,0.06) 0 1px, transparent 1px 4px)",
    "--ds-card-texture-image":
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, rgba(0,0,0,0.035) 1px 2px)",
    "--ds-control-texture-image":
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, rgba(0,0,0,0.03) 1px 3px)",
    "--ds-texture-blend": "overlay",
    "--ds-texture-strength": "0.32",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "carbon-fiber": {
    "--ds-body-texture-image":
    "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 2px, rgba(0,0,0,0.12) 2px 4px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.16) 0 2px, rgba(255,255,255,0.02) 2px 4px)",
    "--ds-card-texture-image":
    "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, rgba(0,0,0,0.12) 2px 4px)",
    "--ds-control-texture-image":
    "repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 2px, rgba(0,0,0,0.09) 2px 4px)",
    "--ds-texture-blend": "multiply",
    "--ds-texture-strength": "0.28",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "rr4-slipstream": {
    "--ds-body-bg-image":
    "linear-gradient(145deg, rgba(255,214,79,0.68) 0%, rgba(233,164,5,0.14) 34%, rgba(255,255,255,0) 66%), radial-gradient(circle at 78% 14%, rgba(255,236,170,0.3), transparent 30%), linear-gradient(180deg, #f4bf1b 0%, #e9ab07 100%)",
    "--ds-card-bg-image":
    "linear-gradient(180deg, rgba(255,255,255,0.2), rgba(0,0,0,0.03))",
    "--ds-body-texture-image":
    "linear-gradient(90deg, transparent 0 18%, rgba(255,255,255,0.14) 18% 18.4%, transparent 18.4% 42%, rgba(0,0,0,0.08) 42% 42.5%, transparent 42.5% 100%), radial-gradient(circle at 50% 100%, rgba(255,255,255,0.08) 0 1px, transparent 1px 8px)",
    "--ds-card-texture-image":
    "linear-gradient(90deg, rgba(255,255,255,0.08), transparent 20%, transparent 80%, rgba(0,0,0,0.06))",
    "--ds-control-texture-image":
    "linear-gradient(90deg, rgba(255,255,255,0.12), transparent 18%), linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.04))",
    "--ds-texture-blend": "overlay",
    "--ds-texture-strength": "0.24",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "soft-gradient": {
    "--ds-body-bg-image": "none",
    "--ds-card-bg-image": "none",
    "--ds-body-texture-image":
    "radial-gradient(circle at 84% 10%, color-mix(in oklab,var(--ds-accent) 16%, transparent), transparent 40%), radial-gradient(circle at 14% 90%, color-mix(in oklab,var(--ds-focus) 14%, transparent), transparent 42%)",
    "--ds-card-texture-image":
    "linear-gradient(145deg, color-mix(in oklab,var(--ds-accent) 8%, transparent), transparent 58%)",
    "--ds-control-texture-image":
    "linear-gradient(180deg, color-mix(in oklab,var(--ds-accent) 7%, transparent), transparent)",
    "--ds-texture-blend": "normal",
    "--ds-texture-strength": "0.15",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "pixel-grid": {
    "--ds-body-bg-image": "none",
    "--ds-card-bg-image": "none",
    "--ds-body-texture-image":
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 8px), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 8px)",
    "--ds-card-texture-image":
    "repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 6px)",
    "--ds-control-texture-image":
    "repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0 1px, transparent 1px 5px)",
    "--ds-texture-blend": "overlay",
    "--ds-texture-strength": "0.38",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "spectrum-wash": {
    "--ds-body-bg-image": "none",
    "--ds-card-bg-image": "none",
    "--ds-body-texture-image":
    "radial-gradient(circle at 8% 12%, color-mix(in oklab,var(--ds-danger) 32%, transparent), transparent 34%), radial-gradient(circle at 88% 18%, color-mix(in oklab,var(--ds-info) 28%, transparent), transparent 38%), radial-gradient(circle at 30% 84%, color-mix(in oklab,var(--ds-warning) 26%, transparent), transparent 42%)",
    "--ds-card-texture-image":
    "linear-gradient(135deg, color-mix(in oklab,var(--ds-accent) 18%, transparent), color-mix(in oklab,var(--ds-focus) 12%, transparent), transparent)",
    "--ds-control-texture-image":
    "linear-gradient(180deg, color-mix(in oklab,var(--ds-accent) 16%, transparent), transparent)",
    "--ds-texture-blend": "screen",
    "--ds-texture-strength": "0.34",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "nacre-flow": {
    "--ds-body-bg-image": "none",
    "--ds-card-bg-image": "none",
    "--ds-body-texture-image":
    "radial-gradient(62% 46% at 11% 10%, color-mix(in oklab,var(--ds-accent) 20%, transparent), transparent 58%), radial-gradient(58% 44% at 87% 13%, color-mix(in oklab,var(--ds-focus) 16%, transparent), transparent 60%), radial-gradient(72% 52% at 48% 92%, color-mix(in oklab,var(--ds-info) 14%, transparent), transparent 64%)",
    "--ds-card-texture-image":
    "linear-gradient(132deg, rgba(255,255,255,0.08), rgba(132,236,255,0.05), rgba(255,140,202,0.05), rgba(255,255,255,0.03))",
    "--ds-control-texture-image":
    "linear-gradient(170deg, rgba(255,255,255,0.08), rgba(94,222,255,0.05), rgba(255,141,212,0.04))",
    "--ds-texture-blend": "screen",
    "--ds-texture-strength": "0.26",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "1px",
    "--ds-control-backdrop-blur": "0px",
    },
    "poster-paper": {
    "--ds-body-bg-image":
    "linear-gradient(180deg, #eeeeec 0%, #e7e7e5 100%)",
    "--ds-card-bg-image":
    "linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.06))",
    "--ds-body-texture-image": "none",
    "--ds-card-texture-image": "none",
    "--ds-control-texture-image": "none",
    "--ds-texture-blend": "normal",
    "--ds-texture-strength": "0",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "amber-screen": {
    "--ds-body-bg-image":
    "repeating-linear-gradient(0deg, color-mix(in oklab, var(--ds-accent) 6%, transparent) 0 1px, transparent 1px 6px), radial-gradient(circle at 16% 10%, color-mix(in oklab, var(--ds-accent) 12%, transparent), transparent 28%), linear-gradient(180deg, color-mix(in oklab, var(--ds-bg) 96%, black 4%) 0%, var(--ds-bg) 50%, color-mix(in oklab, var(--ds-bg) 93%, black 7%) 100%)",
    "--ds-card-bg-image":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-accent) 7%, transparent), rgba(0,0,0,0.22))",
    "--ds-body-texture-image": "none",
    "--ds-card-texture-image": "none",
    "--ds-control-texture-image": "none",
    "--ds-texture-blend": "normal",
    "--ds-texture-strength": "0",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "industrial-screen": {
    "--ds-body-bg-image":
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 2px, transparent 2px, transparent 6px)",
    "--ds-card-bg-image":
    "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.04))",
    "--ds-body-texture-image": "none",
    "--ds-card-texture-image": "none",
    "--ds-control-texture-image": "none",
    "--ds-texture-blend": "normal",
    "--ds-texture-strength": "0",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "velvet-soft": {
    "--ds-body-bg-image":
    "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.55), transparent 40%)",
    "--ds-card-bg-image":
    "linear-gradient(150deg, rgba(255,255,255,0.28), rgba(203,214,233,0.22))",
    "--ds-body-texture-image": "none",
    "--ds-card-texture-image": "none",
    "--ds-control-texture-image": "none",
    "--ds-texture-blend": "normal",
    "--ds-texture-strength": "0",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "eva-wire-base": {
    "--ds-body-bg-image":
    "repeating-linear-gradient(0deg, rgba(255, 96, 24, 0.06) 0 1px, transparent 1px 20px), repeating-linear-gradient(90deg, rgba(255, 59, 22, 0.05) 0 1px, transparent 1px 16px)",
    "--ds-card-bg-image": "none",
    "--ds-body-texture-image": "none",
    "--ds-card-texture-image": "none",
    "--ds-control-texture-image": "none",
    "--ds-texture-blend": "normal",
    "--ds-texture-strength": "0",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "eva-unit-base": {
    "--ds-body-bg-image":
    "repeating-linear-gradient(0deg, rgba(151, 88, 255, 0.065) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(82, 246, 169, 0.05) 0 1px, transparent 1px 18px)",
    "--ds-card-bg-image": "none",
    "--ds-body-texture-image": "none",
    "--ds-card-texture-image": "none",
    "--ds-control-texture-image": "none",
    "--ds-texture-blend": "normal",
    "--ds-texture-strength": "0",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "saturn-space": {
    "--ds-body-bg-image":
    "radial-gradient(circle at 50% -18%, rgba(140,163,196,0.22), transparent 42%), radial-gradient(circle at 50% 118%, rgba(15,24,46,0.78), transparent 56%), radial-gradient(circle at 6% 8%, rgba(188,214,255,0.1), transparent 22%), linear-gradient(180deg, #090c14 0%, #141a28 46%, #080a10 100%)",
    "--ds-card-bg-image":
    "linear-gradient(180deg, rgba(255,255,255,0.26), rgba(26,30,38,0.24))",
    "--ds-body-texture-image": "none",
    "--ds-card-texture-image": "none",
    "--ds-control-texture-image": "none",
    "--ds-texture-blend": "normal",
    "--ds-texture-strength": "0",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "portal-classic": {
    "--ds-body-bg-image":
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 6px), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 6px), radial-gradient(circle at 88% 10%, rgba(44,236,255,0.24), transparent 30%), radial-gradient(circle at 12% 84%, rgba(255,120,210,0.16), transparent 36%)",
    "--ds-card-bg-image":
    "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(0,0,0,0.2))",
    "--ds-body-texture-image": "none",
    "--ds-card-texture-image": "none",
    "--ds-control-texture-image": "none",
    "--ds-texture-blend": "normal",
    "--ds-texture-strength": "0",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "candy-bloom": {
    "--ds-body-bg-image":
    "radial-gradient(circle at 12% 12%, rgba(255,99,197,0.22), transparent 34%), radial-gradient(circle at 88% 18%, rgba(71,216,255,0.22), transparent 36%), linear-gradient(180deg, #fff4fd 0%, #ffe9fb 100%)",
    "--ds-card-bg-image":
    "linear-gradient(155deg, rgba(255,255,255,0.65), rgba(255,205,241,0.45))",
    "--ds-body-texture-image": "none",
    "--ds-card-texture-image": "none",
    "--ds-control-texture-image": "none",
    "--ds-texture-blend": "normal",
    "--ds-texture-strength": "0",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "wave-paper": {
    "--ds-body-bg-image":
    "radial-gradient(circle at 12% 10%, rgba(63,124,255,0.13), transparent 34%), radial-gradient(circle at 90% 16%, rgba(255,166,93,0.16), transparent 34%), linear-gradient(180deg, #f9fbff 0%, #eef4fc 54%, #e8effa 100%)",
    "--ds-card-bg-image":
    "linear-gradient(160deg, rgba(100,132,224,0.14), rgba(55,85,171,0.08), rgba(255,166,92,0.12))",
    "--ds-body-texture-image": "none",
    "--ds-card-texture-image": "none",
    "--ds-control-texture-image": "none",
    "--ds-texture-blend": "normal",
    "--ds-texture-strength": "0",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "sunset-grid": {
    "--ds-body-bg-image":
    "linear-gradient(180deg, #100926 0%, #170d34 44%, #0f0823 100%), radial-gradient(circle at 14% 12%, rgba(255,72,208,0.22), transparent 30%), radial-gradient(circle at 84% 16%, rgba(56,220,255,0.2), transparent 30%), repeating-linear-gradient(0deg, rgba(72,220,255,0.16) 0 1px, transparent 1px 20px), repeating-linear-gradient(90deg, rgba(255,74,216,0.12) 0 1px, transparent 1px 16px)",
    "--ds-card-bg-image":
    "linear-gradient(160deg, rgba(255,86,213,0.18), rgba(107,107,255,0.14), rgba(80,206,255,0.16))",
    "--ds-body-texture-image": "none",
    "--ds-card-texture-image": "none",
    "--ds-control-texture-image": "none",
    "--ds-texture-blend": "normal",
    "--ds-texture-strength": "0",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "holo-dark": {
    "--ds-body-bg-image":
    "radial-gradient(90% 90% at 12% 12%, rgba(117,224,255,0.14), transparent 22%), radial-gradient(90% 90% at 86% 16%, rgba(255,138,200,0.13), transparent 24%), radial-gradient(120% 100% at 44% 94%, rgba(124,158,255,0.12), transparent 28%), linear-gradient(180deg, #05070c 0%, #090e15 52%, #06080e 100%)",
    "--ds-card-bg-image":
    "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.12))",
    "--ds-body-texture-image": "none",
    "--ds-card-texture-image": "none",
    "--ds-control-texture-image": "none",
    "--ds-texture-blend": "normal",
    "--ds-texture-strength": "0",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "oilslick-dark": {
    "--ds-body-bg-image":
    "radial-gradient(74% 56% at 14% 12%, rgba(110,235,255,0.15), transparent 44%), radial-gradient(70% 52% at 84% 18%, rgba(255,118,216,0.14), transparent 42%), conic-gradient(from 206deg at 56% 84%, rgba(86,120,255,0.13), rgba(110,255,214,0.09), rgba(255,128,210,0.1), rgba(86,120,255,0.13)), linear-gradient(180deg, #04070b 0%, #090e15 54%, #05080d 100%)",
    "--ds-card-bg-image":
    "linear-gradient(146deg, rgba(255,255,255,0.05), rgba(114,233,255,0.08), rgba(255,143,210,0.08), rgba(255,255,255,0.03))",
    "--ds-body-texture-image": "none",
    "--ds-card-texture-image": "none",
    "--ds-control-texture-image": "none",
    "--ds-texture-blend": "normal",
    "--ds-texture-strength": "0",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "terminal-screen": {
    "--ds-body-bg-image":
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 2px, transparent 2px, transparent 6px)",
    "--ds-card-bg-image":
    "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.05))",
    "--ds-body-texture-image":
    "repeating-linear-gradient(0deg, color-mix(in oklab,var(--ds-accent) 14%, transparent) 0 1px, transparent 1px 18px), repeating-linear-gradient(90deg, color-mix(in oklab,var(--ds-accent-strong) 10%, transparent) 0 1px, transparent 1px 14px)",
    "--ds-card-texture-image":
    "repeating-linear-gradient(0deg, color-mix(in oklab,var(--ds-accent) 10%, transparent) 0 1px, transparent 1px 12px)",
    "--ds-control-texture-image":
    "linear-gradient(180deg, color-mix(in oklab,var(--ds-accent) 10%, transparent), transparent)",
    "--ds-texture-blend": "normal",
    "--ds-texture-strength": "0.45",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "cathode-screen": {
    "--ds-body-bg-image":
    "repeating-linear-gradient(0deg, color-mix(in oklab, var(--ds-accent) 6%, transparent) 0 1px, transparent 1px 6px), radial-gradient(circle at 16% 10%, color-mix(in oklab, var(--ds-accent) 12%, transparent), transparent 28%), linear-gradient(180deg, color-mix(in oklab, var(--ds-bg) 96%, black 4%) 0%, var(--ds-bg) 50%, color-mix(in oklab, var(--ds-bg) 93%, black 7%) 100%)",
    "--ds-card-bg-image":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-accent) 7%, transparent), rgba(0,0,0,0.22))",
    "--ds-body-texture-image":
    "repeating-radial-gradient(circle at 0 0, rgba(255,255,255,0.025) 0 1px, transparent 1px 3px), repeating-radial-gradient(circle at 100% 100%, rgba(0,0,0,0.06) 0 1px, transparent 1px 4px)",
    "--ds-card-texture-image":
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, rgba(0,0,0,0.035) 1px 2px)",
    "--ds-control-texture-image":
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, rgba(0,0,0,0.03) 1px 3px)",
    "--ds-texture-blend": "overlay",
    "--ds-texture-strength": "0.32",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "saturn-metal": {
    "--ds-body-bg-image":
    "radial-gradient(circle at 50% -18%, rgba(140,163,196,0.22), transparent 42%), radial-gradient(circle at 50% 118%, rgba(15,24,46,0.78), transparent 56%), radial-gradient(circle at 6% 8%, rgba(188,214,255,0.1), transparent 22%), linear-gradient(180deg, #090c14 0%, #141a28 46%, #080a10 100%)",
    "--ds-card-bg-image":
    "linear-gradient(180deg, rgba(255,255,255,0.26), rgba(26,30,38,0.24))",
    "--ds-body-texture-image":
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0 1px, rgba(0,0,0,0.06) 1px 3px)",
    "--ds-card-texture-image":
    "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(0,0,0,0.15))",
    "--ds-control-texture-image":
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 1px, rgba(0,0,0,0.08) 1px 2px)",
    "--ds-texture-blend": "overlay",
    "--ds-texture-strength": "0.35",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "portal-grid": {
    "--ds-body-bg-image":
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 6px), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 6px), radial-gradient(circle at 88% 10%, rgba(44,236,255,0.24), transparent 30%), radial-gradient(circle at 12% 84%, rgba(255,120,210,0.16), transparent 36%)",
    "--ds-card-bg-image":
    "linear-gradient(180deg, rgba(255,255,255,0.1), rgba(0,0,0,0.28))",
    "--ds-body-texture-image":
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 8px), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 8px)",
    "--ds-card-texture-image":
    "repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 6px)",
    "--ds-control-texture-image":
    "repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0 1px, transparent 1px 5px)",
    "--ds-texture-blend": "overlay",
    "--ds-texture-strength": "0.38",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "candy-frost": {
    "--ds-body-bg-image":
    "radial-gradient(circle at 12% 12%, rgba(255,99,197,0.22), transparent 34%), radial-gradient(circle at 88% 18%, rgba(71,216,255,0.22), transparent 36%), linear-gradient(180deg, #fff4fd 0%, #ffe9fb 100%)",
    "--ds-card-bg-image":
    "linear-gradient(155deg, rgba(255,255,255,0.65), rgba(255,205,241,0.45))",
    "--ds-body-texture-image":
    "radial-gradient(circle at 8% 12%, color-mix(in oklab,var(--ds-danger) 32%, transparent), transparent 34%), radial-gradient(circle at 88% 18%, color-mix(in oklab,var(--ds-info) 28%, transparent), transparent 38%), radial-gradient(circle at 30% 84%, color-mix(in oklab,var(--ds-warning) 26%, transparent), transparent 42%)",
    "--ds-card-texture-image":
    "linear-gradient(135deg, color-mix(in oklab,var(--ds-accent) 18%, transparent), color-mix(in oklab,var(--ds-focus) 12%, transparent), transparent)",
    "--ds-control-texture-image":
    "linear-gradient(180deg, color-mix(in oklab,var(--ds-accent) 16%, transparent), transparent)",
    "--ds-texture-blend": "screen",
    "--ds-texture-strength": "0.34",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "complementary-paper": {
    "--ds-body-bg-image":
    "radial-gradient(circle at 12% 10%, rgba(63,124,255,0.13), transparent 34%), radial-gradient(circle at 90% 16%, rgba(255,166,93,0.16), transparent 34%), linear-gradient(180deg, #f9fbff 0%, #eef4fc 54%, #e8effa 100%)",
    "--ds-card-bg-image":
    "linear-gradient(160deg, rgba(100,132,224,0.14), rgba(55,85,171,0.08), rgba(255,166,92,0.12))",
    "--ds-body-texture-image":
    "radial-gradient(circle at 8% 12%, color-mix(in oklab,var(--ds-danger) 32%, transparent), transparent 34%), radial-gradient(circle at 88% 18%, color-mix(in oklab,var(--ds-info) 28%, transparent), transparent 38%), radial-gradient(circle at 30% 84%, color-mix(in oklab,var(--ds-warning) 26%, transparent), transparent 42%)",
    "--ds-card-texture-image":
    "linear-gradient(135deg, color-mix(in oklab,var(--ds-accent) 18%, transparent), color-mix(in oklab,var(--ds-focus) 12%, transparent), transparent)",
    "--ds-control-texture-image":
    "linear-gradient(180deg, color-mix(in oklab,var(--ds-accent) 16%, transparent), transparent)",
    "--ds-texture-blend": "screen",
    "--ds-texture-strength": "0.34",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "vaporwave-sky": {
    "--ds-body-bg-image":
    "linear-gradient(180deg, #100926 0%, #170d34 44%, #0f0823 100%), radial-gradient(circle at 14% 12%, rgba(255,72,208,0.22), transparent 30%), radial-gradient(circle at 84% 16%, rgba(56,220,255,0.2), transparent 30%)",
    "--ds-card-bg-image":
    "linear-gradient(160deg, rgba(255,86,213,0.18), rgba(107,107,255,0.14), rgba(80,206,255,0.16))",
    "--ds-body-texture-image":
    "repeating-linear-gradient(0deg, color-mix(in oklab,var(--ds-focus) 16%, transparent) 0 1px, transparent 1px 20px), repeating-linear-gradient(90deg, color-mix(in oklab,var(--ds-accent) 12%, transparent) 0 1px, transparent 1px 16px)",
    "--ds-card-texture-image":
    "repeating-linear-gradient(0deg, color-mix(in oklab,var(--ds-accent) 10%, transparent) 0 1px, transparent 1px 12px)",
    "--ds-control-texture-image":
    "linear-gradient(180deg, color-mix(in oklab,var(--ds-accent) 10%, transparent), transparent)",
    "--ds-texture-blend": "normal",
    "--ds-texture-strength": "0.45",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "holo-sheen": {
    "--ds-body-bg-image":
    "radial-gradient(88% 76% at 16% 10%, rgba(141,232,255,0.18), transparent 24%), radial-gradient(84% 72% at 84% 14%, rgba(255,164,220,0.18), transparent 24%), radial-gradient(120% 100% at 48% 88%, rgba(166,186,255,0.16), transparent 30%), linear-gradient(180deg, #05070c 0%, #090e15 52%, #06080e 100%)",
    "--ds-card-bg-image":
    "linear-gradient(146deg, rgba(255,255,255,0.09), rgba(132,240,255,0.08), rgba(255,164,220,0.08), rgba(176,196,255,0.06), rgba(255,255,255,0.025))",
    "--ds-body-texture-image": "none",
    "--ds-card-texture-image":
    "linear-gradient(132deg, rgba(255,255,255,0.12), rgba(146,239,255,0.08), rgba(255,170,225,0.08), rgba(187,205,255,0.06), rgba(255,255,255,0.03))",
    "--ds-control-texture-image":
    "linear-gradient(170deg, rgba(255,255,255,0.12), rgba(108,229,255,0.08), rgba(255,155,220,0.07), rgba(173,191,255,0.05))",
    "--ds-texture-blend": "screen",
    "--ds-texture-strength": "0.34",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "2px",
    "--ds-control-backdrop-blur": "1px",
    },
    "oilslick-sheen": {
    "--ds-body-bg-image":
    "radial-gradient(66% 44% at 14% 10%, rgba(70,168,196,0.12), transparent 40%), radial-gradient(64% 42% at 86% 16%, rgba(153,86,144,0.12), transparent 40%), conic-gradient(from 212deg at 56% 84%, rgba(54,84,122,0.18), rgba(58,132,124,0.12), rgba(122,74,117,0.13), rgba(54,84,122,0.18)), linear-gradient(180deg, #030609 0%, #070b11 50%, #04070b 100%)",
    "--ds-card-bg-image":
    "linear-gradient(146deg, rgba(255,255,255,0.035), rgba(88,112,156,0.08), rgba(63,156,141,0.06), rgba(124,76,113,0.07), rgba(255,255,255,0.015))",
    "--ds-body-texture-image":
    "radial-gradient(62% 46% at 12% 10%, color-mix(in oklab,var(--ds-accent) 14%, transparent), transparent 56%), radial-gradient(58% 44% at 86% 13%, color-mix(in oklab,var(--ds-focus) 12%, transparent), transparent 58%), radial-gradient(72% 52% at 48% 92%, color-mix(in oklab,var(--ds-info) 10%, transparent), transparent 60%)",
    "--ds-card-texture-image":
    "linear-gradient(132deg, rgba(255,255,255,0.06), rgba(112,129,171,0.06), rgba(88,166,148,0.04), rgba(126,81,117,0.05), rgba(255,255,255,0.02))",
    "--ds-control-texture-image":
    "linear-gradient(170deg, rgba(255,255,255,0.05), rgba(84,109,152,0.06), rgba(73,150,133,0.05), rgba(120,79,111,0.05))",
    "--ds-texture-blend": "overlay",
    "--ds-texture-strength": "0.18",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "soft-ambient": {
    "--ds-body-bg-image":
    "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.55), transparent 40%)",
    "--ds-card-bg-image":
    "linear-gradient(150deg, rgba(255,255,255,0.28), rgba(203,214,233,0.22))",
    "--ds-body-texture-image":
    "radial-gradient(circle at 84% 10%, color-mix(in oklab,var(--ds-accent) 16%, transparent), transparent 40%), radial-gradient(circle at 14% 90%, color-mix(in oklab,var(--ds-focus) 14%, transparent), transparent 42%)",
    "--ds-card-texture-image":
    "linear-gradient(145deg, color-mix(in oklab,var(--ds-accent) 8%, transparent), transparent 58%)",
    "--ds-control-texture-image":
    "linear-gradient(180deg, color-mix(in oklab,var(--ds-accent) 7%, transparent), transparent)",
    "--ds-texture-blend": "normal",
    "--ds-texture-strength": "0.15",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "eva-wire-grid": {
    "--ds-body-bg-image":
    "repeating-linear-gradient(0deg, color-mix(in oklab,var(--ds-accent) 12%, transparent) 0 1px, transparent 1px 20px), repeating-linear-gradient(90deg, color-mix(in oklab,var(--ds-accent-strong) 10%, transparent) 0 1px, transparent 1px 16px)",
    "--ds-card-bg-image": "none",
    "--ds-body-texture-image":
    "repeating-radial-gradient(circle at 0 0, rgba(255,255,255,0.025) 0 1px, transparent 1px 3px), repeating-radial-gradient(circle at 100% 100%, rgba(0,0,0,0.06) 0 1px, transparent 1px 4px)",
    "--ds-card-texture-image":
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, rgba(0,0,0,0.035) 1px 2px)",
    "--ds-control-texture-image":
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, rgba(0,0,0,0.03) 1px 3px)",
    "--ds-texture-blend": "overlay",
    "--ds-texture-strength": "0.32",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "eva-unit-grid": {
    "--ds-body-bg-image":
    "repeating-linear-gradient(0deg, color-mix(in oklab,var(--ds-accent) 11%, transparent) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, color-mix(in oklab,var(--ds-focus) 10%, transparent) 0 1px, transparent 1px 18px)",
    "--ds-card-bg-image": "none",
    "--ds-body-texture-image":
    "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 2px, rgba(0,0,0,0.12) 2px 4px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.16) 0 2px, rgba(255,255,255,0.02) 2px 4px)",
    "--ds-card-texture-image":
    "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, rgba(0,0,0,0.12) 2px 4px)",
    "--ds-control-texture-image":
    "repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 2px, rgba(0,0,0,0.09) 2px 4px)",
    "--ds-texture-blend": "multiply",
    "--ds-texture-strength": "0.28",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    };
    const schemePresets = {
    standard: {},
    "bright-primary-dark": {
    "--ds-btn-primary-text": "var(--ds-bg-elevated)",
    "--ds-check-mark": "var(--ds-bg-elevated)",
    },
    "mint-ink": {
    "--ds-btn-bg":
    "linear-gradient(180deg, color-mix(in oklab, white 88%, var(--ds-accent) 12%) 0%, color-mix(in oklab, var(--ds-bg-raised) 90%, var(--ds-accent) 10%) 100%)",
    "--ds-btn-bg-hover":
    "linear-gradient(180deg, color-mix(in oklab, white 84%, var(--ds-accent) 16%) 0%, color-mix(in oklab, var(--ds-bg-raised) 86%, var(--ds-accent) 14%) 100%)",
    "--ds-btn-border":
    "color-mix(in oklab, var(--ds-border) 64%, var(--ds-accent) 36%)",
    "--ds-btn-text": "var(--ds-text)",
    "--ds-btn-primary-bg":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-accent) 70%, white 30%) 0%, color-mix(in oklab, var(--ds-accent-strong) 82%, white 18%) 100%)",
    "--ds-btn-primary-bg-hover":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-accent) 62%, white 38%) 0%, color-mix(in oklab, var(--ds-accent-strong) 76%, white 24%) 100%)",
    "--ds-btn-primary-text": "var(--ds-text)",
    "--ds-btn-primary-text-hover": "var(--ds-text)",
    "--ds-btn-primary-text-selected": "var(--ds-text)",
    "--ds-btn-primary-border":
    "color-mix(in oklab, var(--ds-accent-strong) 84%, white 16%)",
    "--ds-focus": "var(--ds-accent-strong)",
    "--ds-input-bg":
    "linear-gradient(180deg, color-mix(in oklab, white 93%, var(--ds-accent) 7%) 0%, color-mix(in oklab, var(--ds-bg-raised) 94%, var(--ds-accent) 6%) 100%)",
    "--ds-input-border":
    "color-mix(in oklab, var(--ds-border) 66%, var(--ds-accent) 34%)",
    "--ds-chip-bg":
    "color-mix(in oklab, var(--ds-bg-raised) 80%, var(--ds-accent) 20%)",
    "--ds-chip-border":
    "color-mix(in oklab, var(--ds-border) 60%, var(--ds-accent) 40%)",
    },
    "amber-glow": {
    "--ds-text": "color-mix(in oklab, var(--ds-accent) 74%, white 26%)",
    "--ds-text-muted":
    "color-mix(in oklab, var(--ds-accent) 58%, white 42%)",
    "--ds-btn-bg":
    "color-mix(in oklab, var(--ds-bg-elevated) 90%, var(--ds-accent) 10%)",
    "--ds-btn-bg-hover":
    "color-mix(in oklab, var(--ds-bg-elevated) 84%, var(--ds-accent) 16%)",
    "--ds-btn-border":
    "color-mix(in oklab, var(--ds-border) 76%, var(--ds-accent) 24%)",
    "--ds-btn-text": "var(--ds-text)",
    "--ds-btn-primary-bg":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-accent) 72%, white 28%) 0%, var(--ds-accent) 100%)",
    "--ds-btn-primary-bg-hover":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-accent) 62%, white 38%) 0%, color-mix(in oklab, var(--ds-accent) 88%, white 12%) 100%)",
    "--ds-btn-primary-border": "var(--ds-accent-strong)",
    "--ds-btn-primary-text": "var(--ds-text)",
    "--ds-btn-primary-text-hover": "var(--ds-btn-bg)",
    "--ds-btn-primary-text-selected": "var(--ds-btn-bg)",
    "--ds-check-mark": "var(--ds-btn-bg)",
    "--ds-input-bg":
    "color-mix(in oklab, var(--ds-bg-elevated) 91%, var(--ds-accent) 9%)",
    "--ds-input-border":
    "color-mix(in oklab, var(--ds-border) 72%, var(--ds-accent) 28%)",
    "--ds-input-text": "var(--ds-text)",
    "--ds-input-placeholder": "var(--ds-text-muted)",
    },
    "industrial-lime": {
    "--ds-text": "#d7e0dc",
    "--ds-text-muted": "#8d9b95",
    "--ds-accent": "#d6ea60",
    "--ds-accent-strong": "#b8d43a",
    "--ds-focus": "#e5f67f",
    "--ds-success": "#95db7d",
    "--ds-warning": "#efc678",
    "--ds-danger": "#e88386",
    "--ds-info": "#88bec6",
    "--ds-btn-bg": "#202727",
    "--ds-btn-bg-hover": "#273030",
    "--ds-btn-border": "#5c6a66",
    "--ds-btn-text": "#d7e0dc",
    "--ds-btn-primary-bg": "#d6ea60",
    "--ds-btn-primary-bg-hover": "#e2f171",
    "--ds-btn-primary-border": "#b8d43a",
    "--ds-btn-primary-text": "var(--ds-bg-elevated)",
    "--ds-input-bg": "#1a2020",
    "--ds-input-border": "#596761",
    },
    "skeuo-sky": {
    "--ds-btn-bg":
    "linear-gradient(180deg, color-mix(in oklab, white 80%, var(--ds-accent) 20%) 0%, color-mix(in oklab, var(--ds-bg-raised) 86%, white 8%, var(--ds-accent) 6%) 100%)",
    "--ds-btn-bg-hover":
    "linear-gradient(180deg, color-mix(in oklab, white 85%, var(--ds-accent) 15%) 0%, color-mix(in oklab, var(--ds-bg-raised) 82%, white 10%, var(--ds-accent) 8%) 100%)",
    "--ds-btn-border":
    "color-mix(in oklab, var(--ds-border) 62%, var(--ds-accent) 38%)",
    "--ds-btn-text": "var(--ds-text)",
    "--ds-btn-primary-bg":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-accent) 68%, white 32%) 0%, color-mix(in oklab, var(--ds-accent-strong) 82%, white 18%) 100%)",
    "--ds-btn-primary-bg-hover":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-accent) 60%, white 40%) 0%, color-mix(in oklab, var(--ds-accent-strong) 76%, white 24%) 100%)",
    "--ds-btn-primary-border":
    "color-mix(in oklab, var(--ds-accent-strong) 84%, black 16%)",
    "--ds-btn-primary-text": "var(--ds-text)",
    "--ds-btn-primary-text-hover": "var(--ds-text-inverse)",
    "--ds-btn-primary-text-selected": "var(--ds-text-inverse)",
    "--ds-focus": "var(--ds-accent-strong)",
    "--ds-input-bg":
    "linear-gradient(180deg, color-mix(in oklab, white 88%, var(--ds-accent) 12%) 0%, color-mix(in oklab, var(--ds-bg-raised) 84%, white 10%, var(--ds-accent) 6%) 100%)",
    "--ds-input-border":
    "color-mix(in oklab, var(--ds-border) 60%, var(--ds-accent) 40%)",
    "--ds-card-border":
    "color-mix(in oklab, var(--ds-border) 62%, var(--ds-accent) 38%)",
    "--ds-chip-bg":
    "linear-gradient(180deg, color-mix(in oklab, white 84%, var(--ds-accent) 16%) 0%, color-mix(in oklab, var(--ds-bg-raised) 86%, var(--ds-accent) 14%) 100%)",
    "--ds-chip-border":
    "color-mix(in oklab, var(--ds-border) 58%, var(--ds-accent) 42%)",
    },
    "velvet-violet": {
    "--ds-btn-bg": "linear-gradient(145deg, #ecf1fa, #cfd9ea)",
    "--ds-btn-bg-hover": "linear-gradient(145deg, #f2f6fd, #d5dff0)",
    "--ds-btn-border": "#c1cbdf",
    "--ds-btn-text": "#344057",
    "--ds-btn-primary-bg": "linear-gradient(145deg, #9888e5, #7f6ecf)",
    "--ds-btn-primary-bg-hover":
    "linear-gradient(145deg, #a494ed, #8675d8)",
    "--ds-btn-primary-border": "#7564c4",
    "--ds-btn-primary-text": "var(--ds-text)",
    "--ds-btn-primary-text-hover": "var(--ds-text)",
    "--ds-btn-primary-text-selected": "var(--ds-text)",
    "--ds-input-bg": "linear-gradient(145deg, #d3dced, #ecf2fb)",
    "--ds-input-border": "#c0cbe0",
    "--ds-chip-bg": "linear-gradient(145deg, #dbe2ef, #eef3fb)",
    "--ds-chip-border": "#c4cedf",
    "--ds-chip-text": "#3a4760",
    },
    "signal-poster": {
    "--ds-btn-bg": "var(--ds-text)",
    "--ds-btn-bg-hover": "#1a1c20",
    "--ds-btn-border": "var(--ds-text)",
    "--ds-btn-text": "var(--ds-bg-elevated)",
    "--ds-btn-primary-bg":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-accent) 74%, white 26%) 0%, var(--ds-accent) 100%)",
    "--ds-btn-primary-bg-hover":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-accent) 64%, white 36%) 0%, color-mix(in oklab, var(--ds-accent) 88%, white 12%) 100%)",
    "--ds-btn-primary-border": "var(--ds-accent-strong)",
    "--ds-btn-primary-text": "var(--ds-text)",
    "--ds-btn-primary-text-hover": "var(--ds-btn-bg)",
    "--ds-btn-primary-text-selected": "var(--ds-btn-bg)",
    "--ds-input-bg": "var(--ds-bg-elevated)",
    "--ds-input-border": "var(--ds-text)",
    "--ds-input-text": "var(--ds-text)",
    "--ds-input-placeholder": "#67686d",
    },
    "signal-diagram": {
    "--ds-btn-bg":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-accent) 74%, white 26%) 0%, var(--ds-accent) 100%)",
    "--ds-btn-bg-hover":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-accent) 64%, white 36%) 0%, color-mix(in oklab, var(--ds-accent) 88%, white 12%) 100%)",
    "--ds-btn-border": "var(--ds-text)",
    "--ds-btn-text": "#101114",
    "--ds-btn-primary-bg": "var(--ds-text)",
    "--ds-btn-primary-bg-hover":
    "color-mix(in oklab, var(--ds-text) 88%, var(--ds-accent) 12%)",
    "--ds-btn-primary-border":
    "color-mix(in oklab, var(--ds-text) 72%, var(--ds-accent) 28%)",
    "--ds-btn-primary-text": "var(--ds-bg-elevated)",
    "--ds-btn-primary-text-hover": "#ffffff",
    "--ds-btn-primary-text-selected": "#ffffff",
    "--ds-input-bg": "var(--ds-bg-elevated)",
    "--ds-input-border": "var(--ds-text)",
    "--ds-input-text": "var(--ds-text)",
    "--ds-input-placeholder": "#67686d",
    },
    "rr4-sprint": {
    "--ds-btn-bg":
    "linear-gradient(180deg, color-mix(in oklab, white 28%, black 72%) 0%, color-mix(in oklab, white 18%, black 82%) 100%)",
    "--ds-btn-bg-hover":
    "linear-gradient(180deg, color-mix(in oklab, white 34%, black 66%) 0%, color-mix(in oklab, white 22%, black 78%) 100%)",
    "--ds-btn-border":
    "color-mix(in oklab, white 86%, var(--ds-bg) 14%)",
    "--ds-btn-text": "var(--ds-text-inverse)",
    "--ds-btn-primary-bg": "var(--ds-text)",
    "--ds-btn-primary-bg-hover":
    "color-mix(in oklab, var(--ds-text) 88%, black 12%)",
    "--ds-btn-primary-border": "var(--ds-text)",
    "--ds-btn-primary-text": "var(--ds-text-inverse)",
    "--ds-btn-primary-text-hover": "#ffffff",
    "--ds-btn-primary-text-selected": "#ffffff",
    "--ds-btn-tertiary-bg":
    "linear-gradient(180deg, color-mix(in oklab, white 82%, var(--ds-bg-raised) 18%) 0%, color-mix(in oklab, white 54%, var(--ds-bg-raised) 46%) 100%)",
    "--ds-btn-tertiary-bg-hover":
    "linear-gradient(180deg, color-mix(in oklab, white 88%, var(--ds-bg-raised) 12%) 0%, color-mix(in oklab, white 60%, var(--ds-bg-raised) 40%) 100%)",
    "--ds-btn-tertiary-border": "var(--ds-text)",
    "--ds-btn-tertiary-text": "var(--ds-text)",
    "--ds-btn-text-quiet": "var(--ds-text)",
    "--ds-btn-text-quiet-hover": "#000000",
    "--ds-btn-text-quiet-active":
    "color-mix(in oklab, var(--ds-accent-strong) 68%, var(--ds-text) 32%)",
    "--ds-tab-active-fg": "var(--ds-text)",
    "--ds-tab-active-bg":
    "linear-gradient(180deg, color-mix(in oklab, white 82%, var(--ds-bg-raised) 18%) 0%, color-mix(in oklab, white 54%, var(--ds-bg-raised) 46%) 100%)",
    "--ds-tab-active-border": "var(--ds-text)",
    "--ds-tab-active-icon": "var(--ds-text)",
    "--ds-input-bg":
    "linear-gradient(180deg, color-mix(in oklab, white 88%, var(--ds-bg-elevated) 12%) 0%, color-mix(in oklab, white 68%, var(--ds-bg-raised) 32%) 100%)",
    "--ds-input-border": "var(--ds-text)",
    "--ds-input-text": "var(--ds-text)",
    "--ds-input-placeholder":
    "color-mix(in oklab, var(--ds-text) 48%, var(--ds-bg-elevated) 52%)",
    "--ds-input-readonly-bg":
    "linear-gradient(180deg, color-mix(in oklab, white 54%, black 46%) 0%, color-mix(in oklab, white 34%, black 66%) 100%)",
    "--ds-input-readonly-border":
    "color-mix(in oklab, white 86%, var(--ds-bg) 14%)",
    "--ds-input-readonly-text": "var(--ds-text)",
    "--ds-input-readonly-placeholder":
    "color-mix(in oklab, var(--ds-text) 62%, var(--ds-bg) 38%)",
    "--ds-input-readonly-shadow": "none",
    "--ds-card-secondary-text": "var(--ds-text-inverse)",
    "--ds-card-secondary-text-muted":
    "color-mix(in oklab, white 82%, var(--ds-bg) 18%)",
    "--ds-chip-bg":
    "linear-gradient(180deg, color-mix(in oklab, white 30%, black 70%) 0%, color-mix(in oklab, white 18%, black 82%) 100%)",
    "--ds-chip-border":
    "color-mix(in oklab, white 86%, var(--ds-bg) 14%)",
    "--ds-chip-text": "var(--ds-text-inverse)",
    },
    "eva-wire-alert": {
    "--ds-text": "color-mix(in oklab, var(--ds-accent) 88%, white 12%)",
    "--ds-text-muted":
    "color-mix(in oklab, var(--ds-accent) 72%, white 28%)",
    "--ds-btn-bg": "#141111",
    "--ds-btn-bg-hover": "#1a1312",
    "--ds-btn-border":
    "color-mix(in oklab, var(--ds-border) 48%, var(--ds-accent) 52%)",
    "--ds-btn-text": "var(--ds-text)",
    "--ds-btn-primary-bg":
    "color-mix(in oklab, var(--ds-accent) 92%, white 8%)",
    "--ds-btn-primary-bg-hover":
    "color-mix(in oklab, var(--ds-accent) 82%, white 18%)",
    "--ds-btn-primary-border": "var(--ds-accent-strong)",
    "--ds-btn-primary-text": "var(--ds-bg-elevated)",
    "--ds-input-bg": "#121010",
    "--ds-input-border":
    "color-mix(in oklab, var(--ds-border) 44%, var(--ds-accent) 56%)",
    "--ds-chip-bg": "#171211",
    "--ds-chip-border":
    "color-mix(in oklab, var(--ds-border) 42%, var(--ds-accent) 58%)",
    "--ds-chip-text": "var(--ds-text)",
    },
    "eva-unit01": {
    "--ds-bg": "#0b0b0f",
    "--ds-bg-elevated": "#121218",
    "--ds-bg-raised": "#191923",
    "--ds-bg-soft": "#222230",
    "--ds-text": "#f3f0ff",
    "--ds-text-muted": "#ac9dc5",
    "--ds-accent": "#9a58ff",
    "--ds-accent-strong": "#7b3ae0",
    "--ds-focus": "#52f6a9",
    "--ds-success": "#52f6a9",
    "--ds-warning": "#ffad3a",
    "--ds-danger": "#c86df0",
    "--ds-info": "#66b8ff",
    "--ds-btn-bg": "#1a1826",
    "--ds-btn-bg-hover": "#211d30",
    "--ds-btn-primary-bg": "#965dff",
    "--ds-btn-primary-bg-hover": "#aa79ff",
    "--ds-btn-primary-text": "var(--ds-bg-elevated)",
    "--ds-input-bg": "#17152a",
    },
    "saturn-alloy": {
    "--ds-bg": "#111117",
    "--ds-bg-elevated": "#343947",
    "--ds-bg-raised": "#3f4756",
    "--ds-bg-soft": "#475061",
    "--ds-bg-overlay": "rgba(9,10,14,0.72)",
    "--ds-text": "#ecf3ff",
    "--ds-text-muted": "#b5c2d6",
    "--ds-accent": "#5ed0ff",
    "--ds-accent-strong": "#2ab4f0",
    "--ds-focus": "#8de1ff",
    "--ds-success": "#7dd6aa",
    "--ds-warning": "#f2be6f",
    "--ds-danger": "#db7d84",
    "--ds-info": "#7bc5ff",
    "--ds-btn-bg":
    "linear-gradient(180deg, #5d687b 0%, #525d70 16%, #444d5e 62%, #394252 100%)",
    "--ds-btn-bg-hover":
    "linear-gradient(180deg, #677388 0%, #5a667b 16%, #4c5669 62%, #404a5d 100%)",
    "--ds-btn-border": "#bcc8d9",
    "--ds-btn-text": "#f2f7ff",
    "--ds-btn-primary-bg":
    "linear-gradient(180deg, #87e8ff 0%, #4bcaf6 48%, #1e9cc9 100%)",
    "--ds-btn-primary-bg-hover":
    "linear-gradient(180deg, #9beeff 0%, #60d2fa 48%, #29a9d2 100%)",
    "--ds-btn-primary-border": "#66cdec",
    "--ds-btn-primary-text": "var(--ds-text)",
    "--ds-input-bg":
    "linear-gradient(180deg, #5b6578 0%, #4d5769 24%, #3e4657 100%)",
    "--ds-input-border": "#adb9cb",
    "--ds-input-text": "#f1f6ff",
    "--ds-input-placeholder": "#c2cede",
    "--ds-chip-bg": "linear-gradient(180deg, #556275, #455064)",
    "--ds-chip-border": "#93a2ba",
    "--ds-chip-text": "#eaf2ff",
    "--ds-card-border": "#9ba9c0",
    },
    "web-portal": {
    "--ds-btn-bg": "linear-gradient(180deg, #4a66c4 0%, #2c438f 100%)",
    "--ds-btn-bg-hover":
    "linear-gradient(180deg, #5b77d5 0%, #3854a5 100%)",
    "--ds-btn-border": "#ffd95f",
    "--ds-btn-text": "#f5f9ff",
    "--ds-btn-primary-bg":
    "linear-gradient(180deg, #36f1ff 0%, #00b9da 100%)",
    "--ds-btn-primary-bg-hover":
    "linear-gradient(180deg, #53f5ff 0%, #18cce6 100%)",
    "--ds-btn-primary-border": "#ffe77a",
    "--ds-btn-primary-text": "var(--ds-text)",
    "--ds-btn-primary-text-hover": "#081436",
    "--ds-btn-primary-text-selected": "#081436",
    "--ds-input-bg":
    "linear-gradient(180deg, #0e1e4d 0%, #0b1740 100%)",
    "--ds-input-border": "#56dfff",
    "--ds-input-text": "#fff8d5",
    "--ds-input-placeholder": "#c5d1f1",
    },
    "candy-spectrum": {
    "--ds-btn-bg":
    "linear-gradient(135deg, #ff64c2 0%, #ff90d9 48%, #66cfff 100%)",
    "--ds-btn-bg-hover":
    "linear-gradient(135deg, #ff7ace 0%, #ffa4e1 48%, #7ed9ff 100%)",
    "--ds-btn-border": "#b95aa8",
    "--ds-btn-text": "#31123a",
    "--ds-btn-primary-bg":
    "linear-gradient(135deg, #ff2fa8 0%, #874cff 100%)",
    "--ds-btn-primary-bg-hover":
    "linear-gradient(135deg, #ff4ab6 0%, #9a65ff 100%)",
    "--ds-btn-primary-border": "#6f3fcd",
    "--ds-btn-primary-text": "#18081f",
    "--ds-input-bg":
    "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,231,249,0.95))",
    "--ds-input-border": "#e2a7d7",
    "--ds-input-text": "#4e2258",
    "--ds-input-placeholder": "#a06bad",
    },
    "complementary-wave": {
    "--ds-btn-bg":
    "linear-gradient(135deg, #4f84ff 0%, #6dc6ff 56%, #ffbb69 100%)",
    "--ds-btn-bg-hover":
    "linear-gradient(135deg, #6595ff 0%, #84d0ff 56%, #ffc985 100%)",
    "--ds-btn-border": "#6f90cf",
    "--ds-btn-text": "#10213b",
    "--ds-btn-primary-bg":
    "linear-gradient(135deg, #ff8b46 0%, #ffb25c 48%, #4aa8f2 100%)",
    "--ds-btn-primary-bg-hover":
    "linear-gradient(135deg, #ffa05e 0%, #ffc473 48%, #61b6ff 100%)",
    "--ds-btn-primary-border": "#d2824f",
    "--ds-btn-primary-text": "#18233a",
    "--ds-input-bg":
    "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(239,236,228,0.94))",
    "--ds-input-border": "#9eb1de",
    "--ds-input-text": "#2a3553",
    "--ds-input-placeholder": "#7584ab",
    },
    "vaporwave-neon": {
    "--ds-btn-bg":
    "linear-gradient(135deg, #6f45ff 0%, #ff49d4 56%, #3fd5ff 100%)",
    "--ds-btn-bg-hover":
    "linear-gradient(135deg, #8460ff 0%, #ff66de 56%, #67ddff 100%)",
    "--ds-btn-border": "#a55bff",
    "--ds-btn-text": "#fdf8ff",
    "--ds-btn-primary-bg":
    "linear-gradient(135deg, #ff49d1 0%, #44d9ff 100%)",
    "--ds-btn-primary-bg-hover":
    "linear-gradient(135deg, #ff6ee0 0%, #66e2ff 100%)",
    "--ds-btn-primary-border": "#54bfff",
    "--ds-btn-primary-text": "var(--ds-text)",
    "--ds-input-bg":
    "linear-gradient(180deg, rgba(45,26,102,0.9), rgba(33,20,77,0.92))",
    "--ds-input-border": "#8d62ff",
    "--ds-input-text": "#f8f2ff",
    "--ds-input-placeholder": "#bfabec",
    },
    "holo-nocturne": {
    "--ds-btn-bg":
    "linear-gradient(140deg, color-mix(in oklab, white 10%, var(--ds-bg-elevated) 90%) 0%, color-mix(in oklab, var(--ds-accent) 12%, var(--ds-bg-raised) 88%) 52%, color-mix(in oklab, var(--ds-focus) 12%, var(--ds-bg-soft) 88%) 100%)",
    "--ds-btn-bg-hover":
    "linear-gradient(140deg, color-mix(in oklab, white 14%, var(--ds-bg-elevated) 86%) 0%, color-mix(in oklab, var(--ds-accent) 16%, var(--ds-bg-raised) 84%) 52%, color-mix(in oklab, var(--ds-focus) 16%, var(--ds-bg-soft) 84%) 100%)",
    "--ds-btn-border":
    "color-mix(in oklab, var(--ds-border) 58%, white 22%, var(--ds-accent) 20%)",
    "--ds-btn-text": "#edf4ff",
    "--ds-btn-primary-bg":
    "linear-gradient(132deg, color-mix(in oklab, var(--ds-accent) 68%, white 32%) 0%, color-mix(in oklab, var(--ds-focus) 62%, var(--ds-accent) 38%) 52%, color-mix(in oklab, var(--ds-info) 60%, white 40%) 100%)",
    "--ds-btn-primary-bg-hover":
    "linear-gradient(132deg, color-mix(in oklab, var(--ds-accent) 58%, white 42%) 0%, color-mix(in oklab, var(--ds-focus) 54%, var(--ds-accent) 46%) 52%, color-mix(in oklab, var(--ds-info) 52%, white 48%) 100%)",
    "--ds-btn-primary-border":
    "color-mix(in oklab, white 34%, var(--ds-accent) 33%, var(--ds-focus) 33%)",
    "--ds-btn-primary-text": "#ecf5ff",
    "--ds-input-bg":
    "linear-gradient(180deg, color-mix(in oklab, white 10%, var(--ds-bg-elevated) 90%) 0%, color-mix(in oklab, var(--ds-accent) 8%, var(--ds-bg-raised) 92%) 100%)",
    "--ds-input-border":
    "color-mix(in oklab, var(--ds-border) 56%, white 18%, var(--ds-accent) 26%)",
    "--ds-input-text": "#edf4ff",
    "--ds-input-placeholder": "#93a7c4",
    },
    "oilslick-organic": {
    "--ds-btn-bg":
    "linear-gradient(136deg, color-mix(in oklab, #0d1016 82%, #2f3642 18%) 0%, color-mix(in oklab, #121721 76%, #26303d 24%) 68%, color-mix(in oklab, #171b25 82%, #42374c 18%) 100%)",
    "--ds-btn-bg-hover":
    "linear-gradient(136deg, color-mix(in oklab, #11161f 74%, #39404d 26%) 0%, color-mix(in oklab, #161d28 70%, #334152 30%) 68%, color-mix(in oklab, #1b212b 76%, #54485e 24%) 100%)",
    "--ds-btn-border":
    "color-mix(in oklab, var(--ds-border) 62%, #7c889a 18%, var(--ds-accent) 20%)",
    "--ds-btn-text": "#eaf3ff",
    "--ds-btn-primary-bg":
    "linear-gradient(132deg, color-mix(in oklab, var(--ds-accent) 42%, #1a2a34 58%) 0%, color-mix(in oklab, var(--ds-focus) 38%, #281f31 62%) 48%, color-mix(in oklab, var(--ds-info) 34%, #18262f 66%) 100%)",
    "--ds-btn-primary-bg-hover":
    "linear-gradient(132deg, color-mix(in oklab, var(--ds-accent) 48%, #21323e 52%) 0%, color-mix(in oklab, var(--ds-focus) 44%, #34283d 56%) 48%, color-mix(in oklab, var(--ds-info) 40%, #1e2d37 60%) 100%)",
    "--ds-btn-primary-border":
    "color-mix(in oklab, var(--ds-border-strong) 52%, var(--ds-accent) 24%, var(--ds-focus) 24%)",
    "--ds-btn-primary-text": "#eaf6ff",
    "--ds-input-bg":
    "linear-gradient(180deg, color-mix(in oklab, #121720 82%, #3b404d 18%) 0%, color-mix(in oklab, #0f141c 86%, #252c39 14%) 100%)",
    "--ds-input-border":
    "color-mix(in oklab, var(--ds-border) 64%, #808c9c 18%, var(--ds-accent) 18%)",
    "--ds-input-text": "#edf4ff",
    "--ds-input-placeholder": "#95a7c3",
    },
    };
    const typographyPresets = {
    "neutral-ui": {
    "--ds-font-sans": '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    "--ds-font-mono":
    '"SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace',
    "--ds-lh-base": "1.5",
    },
    "mint-humanist": {
    "--ds-font-sans":
    '"Aptos", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    "--ds-font-mono":
    '"SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace',
    "--ds-lh-base": "1.52",
    },
    "portal-ui": {
    "--ds-font-sans":
    '"Tahoma", "Verdana", "MS Sans Serif", "Segoe UI", sans-serif',
    },
    "technical-sans": {
    "--ds-font-sans":
    '"Space Mono", Consolas, "Courier New", monospace',
    },
    "velvet-sans": {
    "--ds-font-sans": '"Inter", "Segoe UI", Roboto, Arial, sans-serif',
    },
    "display-scale": {
    "--ds-fs-1": "11px",
    "--ds-fs-2": "13px",
    "--ds-fs-3": "16px",
    "--ds-fs-4": "22px",
    "--ds-fs-5": "30px",
    "--ds-lh-base": "1.38",
    },
    "oilslick-scale": {
    "--ds-fs-1": "12px",
    "--ds-fs-2": "14px",
    "--ds-fs-3": "17px",
    "--ds-fs-4": "24px",
    "--ds-fs-5": "34px",
    "--ds-lh-base": "1.42",
    },
    "eva-wire-sans": {
    "--ds-font-sans":
    '"OCR A Std", "Eurostile", "Bank Gothic", "Bahnschrift", "Space Mono", monospace',
    },
    "eva-unit-sans": {
    "--ds-font-sans":
    '"Arial Narrow", "Bahnschrift", "Space Mono", "Segoe UI", sans-serif',
    },
    "terminal-glow": {
    "--ds-font-sans":
    '"Space Mono", "OCR A Std", Consolas, "Courier New", monospace',
    "--ds-font-mono":
    '"Space Mono", "OCR A Std", Consolas, "Courier New", monospace',
    "--ds-fs-1": "12px",
    "--ds-fs-2": "14px",
    "--ds-fs-3": "16px",
    "--ds-fs-4": "21px",
    "--ds-fs-5": "28px",
    "--ds-lh-base": "1.42",
    },
    "technical-mono": {
    "--ds-font-sans":
    '"Space Mono", Consolas, "Courier New", monospace',
    "--ds-font-mono":
    '"Space Mono", Consolas, "Courier New", monospace',
    "--ds-fs-1": "11px",
    "--ds-fs-2": "13px",
    "--ds-fs-3": "15px",
    "--ds-fs-4": "18px",
    "--ds-fs-5": "24px",
    "--ds-lh-base": "1.42",
    },
    "poster-grotesk": {
    "--ds-font-sans":
    '"Helvetica Neue", Helvetica, Arial, "Segoe UI", sans-serif',
    "--ds-font-mono":
    '"SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace',
    "--ds-fs-1": "12px",
    "--ds-fs-2": "15px",
    "--ds-fs-3": "18px",
    "--ds-fs-4": "26px",
    "--ds-fs-5": "36px",
    "--ds-lh-base": "1.34",
    },
    "soft-display": {
    "--ds-font-sans": '"Inter", "Segoe UI", Roboto, Arial, sans-serif',
    "--ds-font-mono":
    '"SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace',
    "--ds-fs-1": "13px",
    "--ds-fs-2": "15px",
    "--ds-fs-3": "18px",
    "--ds-fs-4": "22px",
    "--ds-fs-5": "32px",
    "--ds-lh-base": "1.46",
    },
    "velvet-ui": {
    "--ds-font-sans": '"Inter", "Segoe UI", Roboto, Arial, sans-serif',
    "--ds-font-mono":
    '"SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace',
    },
    "eva-digital": {
    "--ds-font-sans":
    '"OCR A Std", "Eurostile", "Bank Gothic", "Bahnschrift", "Space Mono", monospace',
    "--ds-font-mono":
    '"OCR A Std", "Eurostile", "Bank Gothic", "Bahnschrift", "Space Mono", monospace',
    "--ds-fs-1": "11px",
    "--ds-fs-2": "13px",
    "--ds-fs-3": "16px",
    "--ds-fs-4": "22px",
    "--ds-fs-5": "30px",
    "--ds-lh-base": "1.35",
    },
    "eva-unit-display": {
    "--ds-font-sans":
    '"Arial Narrow", "Bahnschrift", "Space Mono", "Segoe UI", sans-serif',
    "--ds-font-mono":
    '"OCR A Std", "Eurostile", "Bank Gothic", "Bahnschrift", "Space Mono", monospace',
    "--ds-lh-base": "1.35",
    },
    "saturn-euro": {
    "--ds-font-sans":
    '"Eurostile", "Trebuchet MS", "Segoe UI", sans-serif',
    "--ds-font-mono":
    '"OCR A Std", "Consolas", "Lucida Console", monospace',
    "--ds-fs-1": "11px",
    "--ds-fs-2": "13px",
    "--ds-fs-3": "16px",
    "--ds-fs-4": "22px",
    "--ds-fs-5": "30px",
    "--ds-lh-base": "1.35",
    },
    "portal-arcade": {
    "--ds-font-sans": '"Verdana", "Tahoma", "Trebuchet MS", sans-serif',
    "--ds-font-mono": '"Lucida Console", "Courier New", monospace',
    "--ds-fs-1": "11px",
    "--ds-fs-2": "13px",
    "--ds-fs-3": "15px",
    "--ds-fs-4": "20px",
    "--ds-fs-5": "28px",
    "--ds-lh-base": "1.4",
    },
    "playful-rounded": {
    "--ds-font-sans":
    '"Baloo 2", "Nunito", "Trebuchet MS", "Segoe UI", sans-serif',
    "--ds-font-mono":
    '"SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace',
    "--ds-fs-1": "12px",
    "--ds-fs-2": "14px",
    "--ds-fs-3": "17px",
    "--ds-fs-4": "24px",
    "--ds-fs-5": "34px",
    "--ds-lh-base": "1.45",
    },
    "vapor-display": {
    "--ds-font-sans":
    '"Space Mono", "Eurostile", "Trebuchet MS", "Segoe UI", sans-serif',
    "--ds-font-mono":
    '"Space Mono", Consolas, "Courier New", monospace',
    "--ds-fs-1": "12px",
    "--ds-fs-2": "14px",
    "--ds-fs-3": "16px",
    "--ds-fs-4": "24px",
    "--ds-fs-5": "34px",
    "--ds-lh-base": "1.4",
    },
    "holo-sans": {
    "--ds-font-sans": '"Sora", "Inter", "Segoe UI", sans-serif',
    "--ds-font-mono":
    '"SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace',
    "--ds-fs-1": "11px",
    "--ds-fs-2": "13px",
    "--ds-fs-3": "16px",
    "--ds-fs-4": "22px",
    "--ds-fs-5": "30px",
    "--ds-lh-base": "1.38",
    },
    "organic-sans": {
    "--ds-font-sans":
    '"Outfit", "Sora", "Inter", "Segoe UI", sans-serif',
    "--ds-font-mono":
    '"SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace',
    "--ds-fs-1": "12px",
    "--ds-fs-2": "14px",
    "--ds-fs-3": "17px",
    "--ds-fs-4": "24px",
    "--ds-fs-5": "34px",
    "--ds-lh-base": "1.42",
    },
    "rr4-arcade": {
    "--ds-font-sans":
    '"Arial Black", Impact, "Arial Narrow", "Helvetica Neue", Arial, sans-serif',
    "--ds-font-mono":
    '"Lucida Console", "OCR A Std", Consolas, monospace',
    "--ds-fs-1": "12px",
    "--ds-fs-2": "15px",
    "--ds-fs-3": "18px",
    "--ds-fs-4": "28px",
    "--ds-fs-5": "38px",
    "--ds-lh-base": "1.32",
    },
    };
    Object.assign(typographyPresets, {
    "precision-ui": {
    "--ds-font-sans": '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    "--ds-font-mono":
    '"Space Mono", "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace',
    "--ds-lh-base": "1.48",
    },
    "neon-display": {
    "--ds-font-sans": '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    "--ds-font-mono":
    '"Space Mono", "OCR A Std", Consolas, "Courier New", monospace',
    "--ds-fs-1": "12px",
    "--ds-fs-2": "14px",
    "--ds-fs-3": "17px",
    "--ds-fs-4": "24px",
    "--ds-fs-5": "32px",
    "--ds-lh-base": "1.42",
    },
    "mono-editorial": {
    "--ds-font-sans": '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    "--ds-font-mono":
    '"Space Mono", "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace',
    "--ds-fs-1": "12px",
    "--ds-fs-2": "14px",
    "--ds-fs-3": "17px",
    "--ds-fs-4": "24px",
    "--ds-fs-5": "34px",
    "--ds-lh-base": "1.58",
    },
    });
    Object.assign(schemePresets, {
    "steel-night-quiet": {
    "--ds-btn-bg":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-bg-elevated) 94%, var(--ds-accent) 6%) 0%, color-mix(in oklab, var(--ds-bg-raised) 92%, var(--ds-accent) 8%) 100%)",
    "--ds-btn-bg-hover":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-bg-elevated) 88%, var(--ds-accent) 12%) 0%, color-mix(in oklab, var(--ds-bg-raised) 84%, var(--ds-accent) 16%) 100%)",
    "--ds-btn-border":
    "color-mix(in oklab, var(--ds-border) 76%, var(--ds-accent) 24%)",
    "--ds-btn-text": "var(--ds-text)",
    "--ds-btn-primary-bg":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-accent) 72%, white 28%) 0%, color-mix(in oklab, var(--ds-accent) 90%, white 10%) 100%)",
    "--ds-btn-primary-bg-hover":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-accent) 62%, white 38%) 0%, color-mix(in oklab, var(--ds-accent) 82%, white 18%) 100%)",
    "--ds-btn-primary-border": "var(--ds-accent-strong)",
    "--ds-btn-primary-text": "var(--ds-text)",
    "--ds-btn-primary-text-hover": "var(--ds-bg)",
    "--ds-btn-primary-text-selected": "var(--ds-bg)",
    "--ds-input-bg":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-bg-elevated) 96%, white 4%) 0%, color-mix(in oklab, var(--ds-bg-raised) 96%, black 4%) 100%)",
    "--ds-input-border":
    "color-mix(in oklab, var(--ds-border) 74%, var(--ds-accent) 26%)",
    "--ds-input-placeholder":
    "color-mix(in oklab, var(--ds-text-muted) 88%, transparent)",
    "--ds-chip-bg":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-bg-raised) 94%, var(--ds-accent) 6%), color-mix(in oklab, var(--ds-bg-elevated) 96%, black 4%))",
    "--ds-chip-border":
    "color-mix(in oklab, var(--ds-border) 72%, var(--ds-accent) 28%)",
    "--ds-chip-text": "var(--ds-text)",
    },
    "neon-grid-signal": {
    "--ds-text": "color-mix(in oklab, var(--ds-accent) 22%, white 78%)",
    "--ds-text-muted":
    "color-mix(in oklab, var(--ds-accent) 62%, white 38%)",
    "--ds-btn-bg":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-bg-elevated) 82%, var(--ds-accent) 18%) 0%, color-mix(in oklab, var(--ds-bg-raised) 78%, var(--ds-accent-strong) 22%) 100%)",
    "--ds-btn-bg-hover":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-bg-elevated) 70%, var(--ds-accent) 30%) 0%, color-mix(in oklab, var(--ds-bg-raised) 64%, var(--ds-accent-strong) 36%) 100%)",
    "--ds-btn-border":
    "color-mix(in oklab, var(--ds-border) 52%, var(--ds-accent) 48%)",
    "--ds-btn-text": "var(--ds-text)",
    "--ds-btn-primary-bg":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-accent) 76%, white 24%) 0%, color-mix(in oklab, var(--ds-accent-strong) 86%, white 14%) 100%)",
    "--ds-btn-primary-bg-hover":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-accent) 64%, white 36%) 0%, color-mix(in oklab, var(--ds-accent-strong) 76%, white 24%) 100%)",
    "--ds-btn-primary-border": "var(--ds-focus)",
    "--ds-btn-primary-text": "var(--ds-text)",
    "--ds-btn-primary-text-hover": "var(--ds-bg)",
    "--ds-btn-primary-text-selected": "var(--ds-bg)",
    "--ds-input-bg":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-bg-elevated) 80%, var(--ds-accent) 20%) 0%, color-mix(in oklab, var(--ds-bg) 88%, black 12%) 100%)",
    "--ds-input-border":
    "color-mix(in oklab, var(--ds-border-strong) 44%, var(--ds-accent) 56%)",
    "--ds-input-text": "var(--ds-text)",
    "--ds-input-placeholder":
    "color-mix(in oklab, var(--ds-text-muted) 86%, transparent)",
    "--ds-chip-bg":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-bg-raised) 76%, var(--ds-accent) 24%), color-mix(in oklab, var(--ds-bg-elevated) 82%, black 18%))",
    "--ds-chip-border":
    "color-mix(in oklab, var(--ds-border) 38%, var(--ds-accent) 62%)",
    "--ds-chip-text": "var(--ds-text)",
    },
    "mono-slate-editorial": {
    "--ds-btn-bg":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-bg-raised) 96%, white 4%) 0%, color-mix(in oklab, var(--ds-bg-elevated) 92%, black 8%) 100%)",
    "--ds-btn-bg-hover":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-bg-raised) 88%, white 12%) 0%, color-mix(in oklab, var(--ds-bg-elevated) 84%, black 16%) 100%)",
    "--ds-btn-border":
    "color-mix(in oklab, var(--ds-border-strong) 78%, white 22%)",
    "--ds-btn-text": "var(--ds-text)",
    "--ds-btn-primary-bg": "var(--ds-text)",
    "--ds-btn-primary-bg-hover":
    "color-mix(in oklab, var(--ds-text) 90%, white 10%)",
    "--ds-btn-primary-border": "var(--ds-text)",
    "--ds-btn-primary-text": "var(--ds-bg-elevated)",
    "--ds-input-bg":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-bg-elevated) 98%, white 2%) 0%, color-mix(in oklab, var(--ds-bg) 94%, black 6%) 100%)",
    "--ds-input-border":
    "color-mix(in oklab, var(--ds-border) 76%, var(--ds-text) 24%)",
    "--ds-input-text": "var(--ds-text)",
    "--ds-input-placeholder":
    "color-mix(in oklab, var(--ds-text-muted) 82%, transparent)",
    "--ds-chip-bg":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-bg-raised) 94%, white 6%), color-mix(in oklab, var(--ds-bg-elevated) 96%, black 4%))",
    "--ds-chip-border":
    "color-mix(in oklab, var(--ds-border) 70%, var(--ds-text) 30%)",
    "--ds-chip-text": "var(--ds-text)",
    },
    });
    Object.assign(texturePresets, {
    "steel-haze": {
    "--ds-body-bg-image":
    "radial-gradient(circle at 18% 12%, color-mix(in oklab,var(--ds-accent) 10%, transparent), transparent 34%), linear-gradient(180deg, color-mix(in oklab, var(--ds-bg) 96%, black 4%) 0%, var(--ds-bg) 52%, color-mix(in oklab, var(--ds-bg) 92%, black 8%) 100%)",
    "--ds-card-bg-image":
    "linear-gradient(180deg, color-mix(in oklab,var(--ds-accent) 5%, transparent), rgba(0,0,0,0.12))",
    "--ds-body-texture-image":
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0 1px, transparent 1px 18px)",
    "--ds-card-texture-image":
    "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.08))",
    "--ds-control-texture-image":
    "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.05))",
    "--ds-texture-blend": "normal",
    "--ds-texture-strength": "0.14",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "neon-lattice": {
    "--ds-body-bg-image":
    "radial-gradient(circle at 16% 12%, color-mix(in oklab,var(--ds-accent) 18%, transparent), transparent 28%), radial-gradient(circle at 84% 18%, color-mix(in oklab,var(--ds-focus) 14%, transparent), transparent 24%), linear-gradient(180deg, color-mix(in oklab, var(--ds-bg) 96%, black 4%) 0%, var(--ds-bg) 48%, color-mix(in oklab, var(--ds-bg) 90%, black 10%) 100%)",
    "--ds-card-bg-image":
    "linear-gradient(180deg, color-mix(in oklab,var(--ds-accent) 9%, transparent), rgba(0,0,0,0.12))",
    "--ds-body-texture-image":
    "repeating-linear-gradient(0deg, color-mix(in oklab,var(--ds-accent) 12%, transparent) 0 1px, transparent 1px 20px), repeating-linear-gradient(90deg, color-mix(in oklab,var(--ds-focus) 10%, transparent) 0 1px, transparent 1px 16px)",
    "--ds-card-texture-image":
    "repeating-linear-gradient(0deg, color-mix(in oklab,var(--ds-accent) 9%, transparent) 0 1px, transparent 1px 12px)",
    "--ds-control-texture-image":
    "linear-gradient(180deg, color-mix(in oklab,var(--ds-accent) 12%, transparent), transparent)",
    "--ds-texture-blend": "screen",
    "--ds-texture-strength": "0.42",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    "mono-grain": {
    "--ds-body-bg-image": "none",
    "--ds-card-bg-image": "none",
    "--ds-body-texture-image":
    "repeating-radial-gradient(circle at 0 0, rgba(255,255,255,0.018) 0 1px, transparent 1px 5px), repeating-radial-gradient(circle at 100% 100%, rgba(0,0,0,0.06) 0 1px, transparent 1px 6px)",
    "--ds-card-texture-image":
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, rgba(0,0,0,0.03) 1px 3px)",
    "--ds-control-texture-image":
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0 1px, rgba(0,0,0,0.025) 1px 4px)",
    "--ds-texture-blend": "overlay",
    "--ds-texture-strength": "0.12",
    "--ds-body-backdrop-blur": "0px",
    "--ds-card-backdrop-blur": "0px",
    "--ds-control-backdrop-blur": "0px",
    },
    });
    Object.assign(stylePresets, {
    "steel-refined": {
    "--ds-radius-1": "6px",
    "--ds-radius-2": "10px",
    "--ds-radius-3": "14px",
    "--ds-radius-4": "18px",
    "--ds-radius-pill": "999px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-shadow-sm": "0 8px 18px rgba(6, 11, 19, 0.22)",
    "--ds-shadow-md": "0 16px 36px rgba(4, 8, 15, 0.3)",
    "--ds-card-shadow": "0 14px 28px rgba(5, 10, 18, 0.24)",
    "--ds-btn-shadow": "0 1px 0 rgba(255,255,255,0.04) inset",
    "--ds-btn-shadow-hover": "0 1px 0 rgba(255,255,255,0.08) inset",
    "--ds-input-shadow": "0 1px 0 rgba(255,255,255,0.03) inset",
    "--ds-label-spacing": "0.08em",
    "--ds-card-secondary-bg":
    "color-mix(in oklab, var(--ds-bg-raised) 84%, var(--ds-bg-soft) 16%)",
    "--ds-card-secondary-border":
    "color-mix(in oklab, var(--ds-card-border) 78%, var(--ds-accent) 22%)",
    },
    "neon-signal": {
    "--ds-radius-1": "3px",
    "--ds-radius-2": "6px",
    "--ds-radius-3": "10px",
    "--ds-radius-4": "14px",
    "--ds-radius-pill": "999px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-card-shadow":
    "0 0 0 1px color-mix(in oklab,var(--ds-accent) 26%, transparent) inset, 0 0 24px color-mix(in oklab,var(--ds-accent) 18%, transparent)",
    "--ds-btn-shadow":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 34%, transparent), 0 0 10px color-mix(in oklab,var(--ds-accent) 14%, transparent)",
    "--ds-btn-shadow-hover":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 52%, transparent), 0 0 16px color-mix(in oklab,var(--ds-accent) 24%, transparent)",
    "--ds-btn-shadow-active":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-focus) 58%, transparent), 0 0 18px color-mix(in oklab,var(--ds-accent) 22%, transparent)",
    "--ds-input-shadow":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 38%, transparent), 0 0 12px color-mix(in oklab,var(--ds-accent) 12%, transparent)",
    "--ds-label-transform": "uppercase",
    "--ds-label-spacing": "0.14em",
    "--ds-card-secondary-bg":
    "color-mix(in oklab, var(--ds-bg-raised) 80%, var(--ds-bg-soft) 20%)",
    "--ds-card-secondary-border":
    "color-mix(in oklab, var(--ds-border) 54%, var(--ds-accent) 46%)",
    },
    "mono-editorial-style": {
    "--ds-radius-1": "3px",
    "--ds-radius-2": "5px",
    "--ds-radius-3": "8px",
    "--ds-radius-4": "12px",
    "--ds-radius-pill": "999px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-shadow-sm": "0 6px 18px rgba(0,0,0,0.12)",
    "--ds-shadow-md": "0 18px 42px rgba(0,0,0,0.18)",
    "--ds-card-shadow": "0 10px 24px rgba(0,0,0,0.16)",
    "--ds-btn-shadow": "none",
    "--ds-btn-shadow-hover": "none",
    "--ds-input-shadow": "none",
    "--ds-label-spacing": "0.08em",
    "--ds-card-secondary-bg":
    "color-mix(in oklab, var(--ds-bg-raised) 90%, white 10%)",
    "--ds-card-secondary-border":
    "color-mix(in oklab, var(--ds-card-border) 84%, white 16%)",
    },
    });
    const baseThemePresetMap = {
    "steel-night": {
    family: "bold",
    hue: "steel",
    scheme: "steel-night-quiet",
    style: "steel-refined",
    typography: "precision-ui",
    scale: "standard",
    texture: "steel-haze",
    },
    "paper-mint": {
    family: "paper",
    hue: "green",
    scheme: "mint-ink",
    style: "paper",
    typography: "neutral-ui",
    scale: "standard",
    texture: "clean",
    },
    "amber-terminal": {
    family: "cathode",
    hue: "amber",
    scheme: "amber-glow",
    style: "terminal-amber",
    typography: "terminal-glow",
    scale: "compact",
    texture: "amber-screen",
    },
    "neon-grid": {
    family: "electric",
    hue: "cyan",
    scheme: "neon-grid-signal",
    style: "neon-signal",
    typography: "neon-display",
    scale: "compact",
    texture: "neon-lattice",
    },
    "mono-slate": {
    family: "monochrome",
    hue: "gray",
    scheme: "mono-slate-editorial",
    style: "mono-editorial-style",
    typography: "mono-editorial",
    scale: "comfortable",
    texture: "mono-grain",
    },
    "tech-grid": {
    family: "bold",
    hue: "blue",
    scheme: "standard",
    style: "technical",
    typography: "technical-sans",
    scale: "compact",
    texture: "clean",
    },
    "skeuo-panel": {
    family: "skeuo",
    hue: "blue",
    scheme: "skeuo-sky",
    style: "skeuo",
    typography: "neutral-ui",
    scale: "standard",
    texture: "clean",
    },
    "industrial-terminal": {
    family: "cathode",
    hue: "lime",
    scheme: "industrial-lime",
    style: "industrial-frame",
    typography: "technical-sans",
    scale: "compact",
    texture: "industrial-screen",
    },
    };
    Object.assign(huePresets, {
    platinum: { neutral: "steel" },
    "signal-red": { h: 2 },
    glacier: { h: 198 },
    });
    Object.assign(colorFamilyPresets, {
    neumorph: {
    mode: "light",
    sat: 18,
    bgL: 92,
    elevL: 95,
    raisedL: 90,
    softL: 86,
    textL: 24,
    mutedL: 44,
    borderL: 78,
    borderStrongL: 68,
    accentL: 62,
    accentSat: 36,
    },
    signal: {
    mode: "dark",
    sat: 90,
    bgL: 6,
    elevL: 10,
    raisedL: 14,
    softL: 18,
    textL: 95,
    mutedL: 76,
    borderL: 28,
    borderStrongL: 44,
    accentL: 58,
    accentSat: 98,
    },
    alloy: {
    mode: "dark",
    sat: 40,
    bgL: 20,
    elevL: 25,
    raisedL: 30,
    softL: 36,
    textL: 93,
    mutedL: 74,
    borderL: 52,
    borderStrongL: 66,
    accentL: 60,
    accentSat: 72,
    },
    "signal-paper": {
    mode: "light",
    sat: 10,
    bgL: 92,
    elevL: 97,
    raisedL: 88,
    softL: 82,
    textL: 10,
    mutedL: 32,
    borderL: 18,
    borderStrongL: 10,
    accentL: 52,
    accentSat: 92,
    },
    "race-ui": {
    mode: "light",
    sat: 78,
    bgL: 50,
    elevL: 94,
    raisedL: 84,
    softL: 78,
    textL: 10,
    mutedL: 34,
    borderL: 16,
    borderStrongL: 8,
    accentL: 50,
    accentSat: 98,
    },
    });
    Object.assign(stylePresets, {
    "terminal-amber": {
    "--ds-radius-1": "1px",
    "--ds-radius-2": "2px",
    "--ds-radius-3": "3px",
    "--ds-radius-4": "4px",
    "--ds-radius-pill": "4px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-label-transform": "uppercase",
    "--ds-label-spacing": "0.12em",
    "--ds-card-shadow":
    "0 0 0 1px color-mix(in oklab,var(--ds-accent) 28%, transparent) inset, 0 0 16px color-mix(in oklab,var(--ds-accent) 20%, transparent)",
    "--ds-btn-shadow":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 38%, transparent), 0 0 8px color-mix(in oklab,var(--ds-accent) 14%, transparent)",
    "--ds-btn-shadow-hover":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 52%, transparent), 0 0 12px color-mix(in oklab,var(--ds-accent) 20%, transparent)",
    "--ds-input-shadow":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 34%, transparent), 0 0 8px color-mix(in oklab,var(--ds-accent) 12%, transparent)",
    "--ds-card-secondary-bg":
    "color-mix(in oklab, var(--ds-bg-raised) 78%, var(--ds-bg-soft) 22%)",
    "--ds-card-secondary-border":
    "color-mix(in oklab, var(--ds-border) 62%, var(--ds-accent) 38%)",
    "--ds-card-secondary-shadow":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 26%, transparent), 0 0 11px color-mix(in oklab,var(--ds-accent) 8%, transparent)",
    },
    neumorph: {
    "--ds-radius-1": "10px",
    "--ds-radius-2": "16px",
    "--ds-radius-3": "22px",
    "--ds-radius-4": "28px",
    "--ds-radius-pill": "999px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-label-transform": "uppercase",
    "--ds-label-spacing": "0.04em",
    "--ds-card-shadow":
    "8px 8px 18px rgba(156,169,191,0.36), inset 0 1px 0 rgba(255,255,255,0.72)",
    "--ds-card-shadow-compact":
    "6px 6px 12px rgba(156,169,191,0.28), inset 0 1px 0 rgba(255,255,255,0.62)",
    "--ds-btn-shadow":
    "4px 4px 8px rgba(154,168,193,0.34), inset 0 1px 0 rgba(255,255,255,0.72)",
    "--ds-btn-shadow-hover":
    "5px 5px 10px rgba(154,168,193,0.38), inset 0 1px 0 rgba(255,255,255,0.78)",
    "--ds-btn-shadow-active":
    "inset 3px 3px 6px rgba(157,169,190,0.38), inset 0 1px 0 rgba(255,255,255,0.58)",
    "--ds-input-shadow":
    "inset 3px 3px 7px rgba(163,175,198,0.34), inset 0 1px 0 rgba(255,255,255,0.62)",
    "--ds-btn-press-transform": "none",
    "--ds-card-secondary-bg":
    "linear-gradient(145deg, color-mix(in oklab, var(--ds-card-bg) 78%, var(--ds-bg-soft) 22%), color-mix(in oklab, var(--ds-bg-raised) 76%, white 24%))",
    "--ds-card-secondary-border":
    "color-mix(in oklab, var(--ds-card-border) 74%, var(--ds-border-strong) 26%)",
    "--ds-card-secondary-shadow":
    "inset 1px 1px 4px rgba(160,172,194,0.22), inset 0 1px 0 rgba(255,255,255,0.56)",
    "--ds-card-secondary-shadow-compact":
    "inset 1px 1px 3px rgba(160,172,194,0.2), inset 0 1px 0 rgba(255,255,255,0.5)",
    },
    "eva-wire": {
    "--ds-radius-1": "0px",
    "--ds-radius-2": "2px",
    "--ds-radius-3": "4px",
    "--ds-radius-4": "6px",
    "--ds-radius-pill": "4px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-label-transform": "uppercase",
    "--ds-label-spacing": "0.16em",
    "--ds-card-shadow":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 52%, transparent), 0 0 0 1px color-mix(in oklab,var(--ds-focus) 28%, transparent), 0 0 14px color-mix(in oklab,var(--ds-accent) 20%, transparent)",
    "--ds-btn-shadow":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 60%, transparent), 0 0 8px color-mix(in oklab,var(--ds-accent) 22%, transparent)",
    "--ds-btn-shadow-hover":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-focus) 56%, transparent), 0 0 12px color-mix(in oklab,var(--ds-accent) 32%, transparent)",
    "--ds-btn-shadow-active":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 72%, transparent)",
    "--ds-input-shadow":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 44%, transparent), 0 0 9px color-mix(in oklab,var(--ds-accent) 15%, transparent)",
    "--ds-btn-press-transform": "none",
    "--ds-card-secondary-bg":
    "color-mix(in oklab, var(--ds-bg-elevated) 82%, var(--ds-bg-raised) 18%)",
    "--ds-card-secondary-border":
    "color-mix(in oklab, var(--ds-card-border) 70%, var(--ds-accent) 30%)",
    "--ds-card-secondary-shadow":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 28%, transparent), 0 0 9px color-mix(in oklab,var(--ds-accent) 10%, transparent)",
    },
    "industrial-frame": {
    "--ds-radius-1": "2px",
    "--ds-radius-2": "2px",
    "--ds-radius-3": "4px",
    "--ds-radius-4": "6px",
    "--ds-radius-pill": "4px",
    "--ds-border-w": "2px",
    "--ds-border-style": "solid",
    "--ds-label-transform": "uppercase",
    "--ds-label-spacing": "0.14em",
    "--ds-card-shadow": "0 0 0 1px rgba(255,255,255,0.04) inset",
    "--ds-btn-shadow": "none",
    "--ds-btn-shadow-hover": "none",
    "--ds-btn-shadow-active": "inset 0 0 0 2px rgba(0,0,0,0.35)",
    "--ds-input-shadow": "inset 0 1px 0 rgba(255,255,255,0.03)",
    "--ds-btn-press-transform": "none",
    "--ds-card-secondary-bg":
    "linear-gradient(180deg, color-mix(in oklab, var(--ds-bg-elevated) 70%, var(--ds-bg-raised) 30%) 0%, color-mix(in oklab, var(--ds-bg-elevated) 86%, black 14%) 100%)",
    "--ds-card-secondary-border":
    "color-mix(in oklab, var(--ds-card-border) 74%, var(--ds-border-strong) 26%)",
    "--ds-card-secondary-shadow":
    "inset 0 0 0 1px rgba(255,255,255,0.03)",
    },
    "eva-unit01": {
    "--ds-radius-1": "0px",
    "--ds-radius-2": "2px",
    "--ds-radius-3": "4px",
    "--ds-radius-4": "6px",
    "--ds-radius-pill": "4px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-label-transform": "uppercase",
    "--ds-label-spacing": "0.16em",
    "--ds-card-shadow":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 42%, transparent), 0 0 0 1px color-mix(in oklab,var(--ds-focus) 28%, transparent), 0 0 15px color-mix(in oklab,var(--ds-accent) 17%, transparent)",
    "--ds-btn-shadow":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 52%, transparent), 0 0 9px color-mix(in oklab,var(--ds-accent) 19%, transparent)",
    "--ds-btn-shadow-hover":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-focus) 52%, transparent), 0 0 12px color-mix(in oklab,var(--ds-warning) 24%, transparent)",
    "--ds-btn-shadow-active":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-warning) 65%, transparent)",
    "--ds-input-shadow":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-focus) 40%, transparent), 0 0 9px color-mix(in oklab,var(--ds-accent) 12%, transparent)",
    "--ds-btn-press-transform": "none",
    "--ds-card-secondary-bg":
    "color-mix(in oklab, var(--ds-bg-elevated) 76%, var(--ds-bg-raised) 24%)",
    "--ds-card-secondary-border":
    "color-mix(in oklab, var(--ds-card-border) 72%, var(--ds-focus) 28%)",
    "--ds-card-secondary-shadow":
    "inset 0 0 0 1px color-mix(in oklab,var(--ds-accent) 24%, transparent), 0 0 9px color-mix(in oklab,var(--ds-focus) 7%, transparent)",
    },
    "saturn-skeuo": {
    "--ds-radius-1": "4px",
    "--ds-radius-2": "10px",
    "--ds-radius-3": "14px",
    "--ds-radius-4": "18px",
    "--ds-radius-pill": "999px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-label-transform": "uppercase",
    "--ds-label-spacing": "0.1em",
    "--ds-shadow-sm": "0 8px 16px rgba(6, 8, 12, 0.38)",
    "--ds-shadow-md": "0 16px 30px rgba(6, 8, 12, 0.46)",
    "--ds-card-shadow":
    "inset 0 1px 0 rgba(255,255,255,0.66), inset 0 -2px 9px rgba(18,22,30,0.6), 0 14px 24px rgba(5,8,12,0.5)",
    "--ds-btn-shadow":
    "inset 0 2px 0 rgba(255,255,255,0.9), inset 0 -2px 5px rgba(15,18,26,0.52), 0 3px 8px rgba(8,10,14,0.44)",
    "--ds-btn-shadow-hover":
    "inset 0 2px 0 rgba(255,255,255,0.96), inset 0 -2px 6px rgba(15,18,26,0.58), 0 5px 11px rgba(8,10,14,0.5)",
    "--ds-btn-shadow-active":
    "inset 0 4px 10px rgba(19,23,30,0.62), inset 0 -1px 0 rgba(255,255,255,0.3)",
    "--ds-input-shadow":
    "inset 0 2px 4px rgba(11,14,21,0.45), inset 0 1px 0 rgba(233,241,255,0.26)",
    "--ds-btn-press-transform": "translateY(1px)",
    },
    "graphic-signal": {
    "--ds-radius-1": "0px",
    "--ds-radius-2": "0px",
    "--ds-radius-3": "2px",
    "--ds-radius-4": "4px",
    "--ds-radius-pill": "999px",
    "--ds-border-w": "0px",
    "--ds-border-style": "solid",
    "--ds-label-transform": "uppercase",
    "--ds-label-spacing": "0.14em",
    "--ds-card-shadow": "0 12px 24px rgba(0,0,0,0.16)",
    "--ds-input-shadow": "inset 0 0 0 1px rgba(0,0,0,0.08)",
    "--ds-card-secondary-bg":
    "color-mix(in oklab, var(--ds-bg-raised) 84%, black 16%)",
    "--ds-card-secondary-border": "var(--ds-text)",
    "--ds-card-secondary-shadow": "none",
    },
    "graphic-diagram": {
    "--ds-radius-1": "0px",
    "--ds-radius-2": "0px",
    "--ds-radius-3": "2px",
    "--ds-radius-4": "4px",
    "--ds-radius-pill": "999px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-label-transform": "uppercase",
    "--ds-label-spacing": "0.14em",
    "--ds-card-shadow": "0 12px 24px rgba(0,0,0,0.16)",
    "--ds-input-shadow": "inset 0 0 0 1px rgba(0,0,0,0.08)",
    "--ds-card-secondary-bg":
    "color-mix(in oklab, var(--ds-bg-raised) 88%, black 12%)",
    "--ds-card-secondary-border": "var(--ds-text)",
    "--ds-card-secondary-shadow": "none",
    },
    "rr4-racing": {
    "--ds-radius-1": "0px",
    "--ds-radius-2": "0px",
    "--ds-radius-3": "2px",
    "--ds-radius-4": "4px",
    "--ds-radius-pill": "0px",
    "--ds-border-w": "2px",
    "--ds-border-style": "solid",
    "--ds-label-transform": "uppercase",
    "--ds-label-spacing": "0.14em",
    "--ds-shadow-sm": "none",
    "--ds-shadow-md": "none",
    "--ds-card-bg": "transparent",
    "--ds-card-border": "transparent",
    "--ds-card-shadow": "none",
    "--ds-card-top-rule-size": "2px",
    "--ds-card-top-rule-color": "var(--ds-text)",
    "--ds-card-bg-image": "none",
    "--ds-card-structural-bg": "transparent",
    "--ds-card-structural-border": "transparent",
    "--ds-card-structural-shadow": "none",
    "--ds-btn-shadow": "none",
    "--ds-btn-shadow-hover": "none",
    "--ds-btn-shadow-active": "none",
    "--ds-input-shadow": "none",
    "--ds-btn-press-transform": "none",
    "--ds-card-secondary-bg":
    "linear-gradient(180deg, color-mix(in oklab, white 34%, black 66%) 0%, color-mix(in oklab, white 20%, black 80%) 100%)",
    "--ds-card-secondary-border":
    "color-mix(in oklab, white 86%, var(--ds-bg) 14%)",
    "--ds-card-secondary-shadow": "none",
    },
    });
    Object.assign(stylePresets, {
    "old-web": {
    "--ds-radius-1": "0px",
    "--ds-radius-2": "0px",
    "--ds-radius-3": "0px",
    "--ds-radius-4": "0px",
    "--ds-radius-pill": "0px",
    "--ds-border-w": "2px",
    "--ds-border-style": "solid",
    "--ds-label-transform": "uppercase",
    "--ds-label-spacing": "0.08em",
    "--ds-card-shadow":
    "0 0 0 2px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.16) inset, 0 0 0 2px color-mix(in oklab,var(--ds-border) 45%, transparent)",
    "--ds-input-shadow":
    "inset 0 0 0 1px rgba(255,255,255,0.11), inset 0 -1px 0 rgba(0,0,0,0.35)",
    },
    "candy-pop": {
    "--ds-radius-1": "8px",
    "--ds-radius-2": "14px",
    "--ds-radius-3": "20px",
    "--ds-radius-4": "26px",
    "--ds-radius-pill": "999px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-label-transform": "none",
    "--ds-label-spacing": "0.03em",
    "--ds-card-shadow":
    "0 10px 24px rgba(170,96,164,0.18), inset 0 1px 0 rgba(255,255,255,0.75)",
    "--ds-input-shadow":
    "inset 0 1px 2px rgba(207,138,193,0.24), 0 0 0 1px rgba(255,255,255,0.6)",
    },
    "complimentary-gradient": {
    "--ds-radius-1": "6px",
    "--ds-radius-2": "12px",
    "--ds-radius-3": "16px",
    "--ds-radius-4": "22px",
    "--ds-radius-pill": "999px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-label-transform": "uppercase",
    "--ds-label-spacing": "0.07em",
    "--ds-card-shadow":
    "0 12px 26px rgba(44,58,99,0.14), 0 0 0 1px rgba(124,147,211,0.24) inset",
    "--ds-input-shadow":
    "inset 0 1px 2px rgba(50,62,99,0.18), 0 0 0 1px rgba(176,191,235,0.3)",
    },
    "vaporwave-neon": {
    "--ds-radius-1": "2px",
    "--ds-radius-2": "8px",
    "--ds-radius-3": "12px",
    "--ds-radius-4": "16px",
    "--ds-radius-pill": "999px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-label-transform": "uppercase",
    "--ds-label-spacing": "0.11em",
    "--ds-card-shadow":
    "0 0 0 1px color-mix(in oklab,var(--ds-accent) 35%, transparent) inset, 0 0 22px color-mix(in oklab,var(--ds-focus) 18%, transparent)",
    "--ds-input-shadow":
    "inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 12px color-mix(in oklab,var(--ds-accent) 24%, transparent)",
    },
    "holo-nocturne": {
    "--ds-radius-1": "9px",
    "--ds-radius-2": "14px",
    "--ds-radius-3": "20px",
    "--ds-radius-4": "26px",
    "--ds-radius-pill": "999px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-label-transform": "uppercase",
    "--ds-label-spacing": "0.08em",
    "--ds-card-shadow":
    "0 20px 36px rgba(1,3,8,0.7), inset 0 0 0 1px rgba(255,255,255,0.05)",
    "--ds-input-shadow":
    "inset 0 1px 2px rgba(0,0,0,0.6), 0 0 0 1px rgba(117,173,218,0.18)",
    },
    "oilslick-organic": {
    "--ds-radius-1": "10px",
    "--ds-radius-2": "16px",
    "--ds-radius-3": "22px",
    "--ds-radius-4": "28px",
    "--ds-radius-pill": "999px",
    "--ds-border-w": "1px",
    "--ds-border-style": "solid",
    "--ds-label-transform": "uppercase",
    "--ds-label-spacing": "0.08em",
    "--ds-card-shadow":
    "0 16px 34px rgba(2,4,8,0.62), inset 0 0 0 1px rgba(255,255,255,0.05)",
    "--ds-input-shadow":
    "inset 0 1px 2px rgba(0,0,0,0.52), 0 0 0 1px rgba(104,149,183,0.16)",
    },
    });
    Object.assign(baseThemePresetMap, {
    "velvet-touch": {
    family: "neumorph",
    hue: "violet",
    scheme: "velvet-violet",
    style: "neumorph",
    typography: "velvet-sans",
    scale: "comfortable",
    texture: "velvet-soft",
    },
    "eva-wireframe": {
    family: "cathode",
    hue: "signal-red",
    scheme: "eva-wire-alert",
    style: "eva-wire",
    typography: "eva-wire-sans",
    scale: "compact",
    texture: "eva-wire-base",
    },
    "eva-unit-01": {
    family: "signal",
    hue: "violet",
    scheme: "eva-unit01",
    style: "eva-unit01",
    typography: "eva-unit-sans",
    scale: "compact",
    texture: "eva-unit-base",
    },
    "saturn-alloy": {
    family: "alloy",
    hue: "platinum",
    scheme: "saturn-alloy",
    style: "saturn-skeuo",
    typography: "saturn-euro",
    scale: "standard",
    texture: "saturn-space",
    },
    "old-web-portal": {
    family: "electric",
    hue: "ultraviolet",
    scheme: "web-portal",
    style: "old-web",
    typography: "portal-ui",
    scale: "compact",
    texture: "portal-classic",
    },
    "candy-spectrum": {
    family: "pastel",
    hue: "magenta",
    scheme: "candy-spectrum",
    style: "candy-pop",
    typography: "neutral-ui",
    scale: "comfortable",
    texture: "candy-bloom",
    },
    "complementary-wave": {
    family: "bold",
    hue: "cobalt",
    scheme: "complementary-wave",
    style: "complimentary-gradient",
    typography: "neutral-ui",
    scale: "standard",
    texture: "wave-paper",
    },
    "sunset-pop": {
    family: "sunset",
    hue: "magenta",
    scheme: "vaporwave-neon",
    style: "vaporwave-neon",
    typography: "neutral-ui",
    scale: "comfortable",
    texture: "sunset-grid",
    },
    "holo-nocturne": {
    family: "alloy",
    hue: "ultraviolet",
    scheme: "holo-nocturne",
    style: "holo-nocturne",
    typography: "display-scale",
    scale: "standard",
    texture: "holo-dark",
    },
    "oilslick-nacre": {
    family: "alloy",
    hue: "teal",
    scheme: "oilslick-organic",
    style: "oilslick-organic",
    typography: "oilslick-scale",
    scale: "standard",
    texture: "oilslick-dark",
    },
    "signal-poster": {
    family: "signal-paper",
    hue: "orange",
    scheme: "signal-poster",
    style: "graphic-signal",
    typography: "poster-grotesk",
    scale: "standard",
    texture: "poster-paper",
    },
    "signal-diagram": {
    family: "signal-paper",
    hue: "orange",
    scheme: "signal-diagram",
    style: "graphic-diagram",
    typography: "poster-grotesk",
    scale: "standard",
    texture: "poster-paper",
    },
    "type-four-sprint": {
    family: "race-ui",
    hue: "yellow",
    scheme: "rr4-sprint",
    style: "rr4-racing",
    typography: "rr4-arcade",
    scale: "compact",
    texture: "rr4-slipstream",
    },
    });

    initializedBuilderThemeData = {
      huePresets,
      colorFamilyPresets,
      stylePresets,
      scalePresets,
      texturePresets,
      schemePresets,
      typographyPresets,
      baseThemePresetMap,
    };

    return initializedBuilderThemeData;
  }

  win.DesignSystemStudioBuilderThemeData = {
    initBuilderThemeData,
  };
})(window);
