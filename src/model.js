/*
 * Secondary glomerulopathies — pure model (no DOM).
 *
 * One glomerulus, four systemic diseases:
 *   diabetic kidney disease (diabetic nephropathy), lupus nephritis,
 *   Alport syndrome / thin GBM (type IV collagen), renal amyloidosis (AL / AA).
 *
 * Everything here is a pure function of a plain state object, so it can be
 * tested in Node and reused by the UI. Values marked "Modelo/Model" are
 * teaching simplifications (rates, thresholds, proxies), not clinical data.
 */

export const clamp = (x, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
const round1 = (x) => Math.round(x * 10) / 10;

export const ENTITIES = ['normal', 'diabetic', 'lupus', 'alport', 'amyloid'];

/* ---------- Reference ranges (adult) ---------- */
export const REF = {
  gbmNm: [250, 430],        // GBM width by EM (adult ~300–430 nm); <250 nm = thin GBM; RPS 2010 DN: >395 nm (F) / >430 nm (M)
  acr: [0, 30],             // urine albumin/creatinine, mg/g — KDIGO A1 < 30
  proteinuria: [0, 0.15],   // g/day
  egfr: [90, 130],          // mL/min/1.73 m² — G1 ≥ 90
  sbp: [90, 130],           // mmHg — target < 130/80 in CKD with albuminuria
  dbp: [60, 80],
  c3: [90, 180],            // mg/dL (assay-dependent)
  c4: [10, 40],             // mg/dL (assay-dependent)
  antiDsDna: [0, 30],       // IU/mL (assay-dependent)
  flcKappa: [3.3, 19.4],    // mg/L, serum free light chains
  flcLambda: [5.7, 26.3],   // mg/L
  flcRatio: [0.26, 1.65],   // κ/λ
  crp: [0, 5],              // mg/L
};

/* ---------- Generic clinical classifiers ---------- */

/** KDIGO albuminuria category from ACR (mg/g). */
export function albuminuriaCategory(acr) {
  if (!(acr >= 0)) return null;
  if (acr < 30) return 'A1';
  if (acr < 300) return 'A2';
  return 'A3';
}

/** KDIGO GFR category from eGFR (mL/min/1.73 m²). */
export function gfrCategory(egfr) {
  if (!(egfr >= 0)) return null;
  if (egfr >= 90) return 'G1';
  if (egfr >= 60) return 'G2';
  if (egfr >= 45) return 'G3a';
  if (egfr >= 30) return 'G3b';
  if (egfr >= 15) return 'G4';
  return 'G5';
}

const KDIGO_GRID = {
  G1: ['low', 'moderate', 'high'],
  G2: ['low', 'moderate', 'high'],
  G3a: ['moderate', 'high', 'very-high'],
  G3b: ['high', 'very-high', 'very-high'],
  G4: ['very-high', 'very-high', 'very-high'],
  G5: ['very-high', 'very-high', 'very-high'],
};
/** KDIGO 2012/2024 heat-map risk (low / moderate / high / very-high). */
export function kdigoRisk(egfr, acr) {
  const g = gfrCategory(egfr);
  const a = albuminuriaCategory(acr);
  if (!g || !a) return null;
  return KDIGO_GRID[g][{ A1: 0, A2: 1, A3: 2 }[a]];
}

/**
 * Urine protein (g/day) from ACR (mg/g), assuming ~1 g creatinine/day.
 * Albumin ≈ 70 % of protein in glomerular proteinuria, plus ~100 mg/day of
 * non-albumin protein at low levels (Modelo). Gives the usual KDIGO
 * equivalences: ACR 30 ≈ PCR 150, ACR 300 ≈ PCR 500 mg/g.
 */
export function acrToProteinuria(acr) {
  const a = Math.max(0, acr);
  return (a / 0.7 + 100 * (1 - a / (a + 300))) / 1000;
}
/** Inverse of acrToProteinuria (bisection; monotone). */
export function proteinuriaToAcr(gPerDay) {
  const target = Math.max(0, gPerDay);
  if (target <= acrToProteinuria(0)) return 0;
  let lo = 0, hi = 20000;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (acrToProteinuria(mid) < target) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/* ================================================================
 * 1. DIABETIC KIDNEY DISEASE — natural history driven by years of DM
 * ================================================================ */
export const DN = {
  hyperfiltrationMax: 0.28,   // Modelo: early ↑GFR ~25–30 % in a hyperfiltering patient (seen in ~50 % of T1DM, obese T2DM)
  hyperfiltrationTau: 1.5,    // years to reach it (Modelo)
  acrBaseline: 8,             // mg/g, healthy
  acrOnset: 4,                // years: albuminuria starts rising (Modelo; lesions appear at 2–5 y)
  acrGrowth: Math.LN10 / 7,   // /year untreated: A2 at ~8 y, A3 at ~15 y (Modelo; classic Mogensen course)
  acrMax: 5000,               // mg/g cap (nephrotic range)
  slopeBase: 0.7,             // mL/min/year background loss (age + DM) (Modelo)
  slopeMax: 10,               // mL/min/year added at heavy proteinuria: overt untreated DN loses ~10–12 (Modelo)
  slopeHalfAcr: 700,          // mg/g at which half of slopeMax applies (Modelo)
  // Nephroprotective bundle: RAAS blockade (ACEi OR ARB, never both) + SGLT2i
  // + glycaemic & BP control, started when ACR first reaches ≥ 30 mg/g.
  txAcrFactor: 0.55,          // ACR × 0.55 (≈ −45 %) on starting (Modelo, trial-informed)
  txAcrGrowth: 0.12,          // /year residual ACR growth (Modelo)
  txHyperResidual: 0.65,      // fraction of hyperfiltration left → expected early eGFR "dip" (Modelo)
  txSlopeFactor: 0.65,        // extra slope reduction beyond the ACR effect (SGLT2i/finerenone-type) (Modelo)
  txStructureFactor: 0.5,     // structural lesions progress at half speed (Modelo)
  gbmStart: 350, gbmRate: 22, gbmMax: 900,     // nm, nm/year (Modelo; thickening detectable at 2–5 y)
  mesStart: 4, mesRate: 0.06,                  // mesangial expansion index 0–1 (Modelo)
  hyalAffStart: 4, hyalAffRate: 0.08,          // arteriolar hyalinosis index 0–1 (Modelo)
  hyalEffStart: 5, hyalEffRate: 0.07,
  noduleThreshold: 0.65,                       // mesangial index at which KW nodules appear (Modelo)
  dt: 0.05,
  maxYears: 30,
};

function dnAcrUntreated(t) {
  if (t <= DN.acrOnset) return DN.acrBaseline;
  return Math.min(DN.acrMax, DN.acrBaseline * Math.exp(DN.acrGrowth * (t - DN.acrOnset)));
}

/**
 * Full course of diabetic kidney disease, 0 … maxYears of diabetes.
 * Returns an array of points (dt = 0.05 y).
 */
export function dnCourse(treated = false, maxYears = DN.maxYears) {
  const pts = [];
  let cap = 100;        // filtering capacity (nephron mass), mL/min
  let te = 0;           // "structural time" (slowed under treatment)
  let txStart = null;
  const n = Math.round(maxYears / DN.dt);
  for (let i = 0; i <= n; i++) {
    const t = i * DN.dt;
    const acrU = dnAcrUntreated(t);
    if (treated && txStart === null && acrU >= 30) txStart = t;
    const onTx = txStart !== null;
    const acr = onTx
      ? Math.min(DN.acrMax, 30 * DN.txAcrFactor * Math.exp(DN.txAcrGrowth * (t - txStart)))
      : acrU;
    const hyperRaw = DN.hyperfiltrationMax * (1 - Math.exp(-t / DN.hyperfiltrationTau)) * clamp((cap - 60) / 40);
    const hyper = onTx ? hyperRaw * DN.txHyperResidual : hyperRaw;
    const egfr = Math.max(0, cap * (1 + hyper));
    const gbm = Math.min(DN.gbmMax, DN.gbmStart + DN.gbmRate * te);
    const mes = clamp((te - DN.mesStart) * DN.mesRate);
    const hyalAff = clamp((te - DN.hyalAffStart) * DN.hyalAffRate);
    const hyalEff = clamp((te - DN.hyalEffStart) * DN.hyalEffRate);
    const nodules = mes >= DN.noduleThreshold ? Math.min(6, 1 + Math.floor((mes - DN.noduleThreshold) / 0.06)) : 0;
    const gs = clamp(((100 - cap) / 100) * 1.05, 0, 0.97);   // fraction of glomeruli globally sclerosed (Modelo)
    pts.push({ t: round2(t), acr, egfr, cap, hyper, gbm, mes, hyalAff, hyalEff, nodules, gs, onTx, txStart });
    // integrate
    let slope = DN.slopeBase + DN.slopeMax * (acr / (acr + DN.slopeHalfAcr));
    if (onTx) slope *= DN.txSlopeFactor;
    cap = Math.max(3, cap - slope * DN.dt);
    te += DN.dt * (onTx ? DN.txStructureFactor : 1);
  }
  return pts;
}
function round2(x) { return Math.round(x * 100) / 100; }

const dnCache = new Map();
function dnCourseCached(treated) {
  const k = treated ? 1 : 0;
  if (!dnCache.has(k)) dnCache.set(k, dnCourse(treated));
  return dnCache.get(k);
}
/** Point of the DN course at a given number of years of diabetes. */
export function dnAt(years, treated = false) {
  const c = dnCourseCached(treated);
  const i = Math.round(clamp(years, 0, DN.maxYears) / DN.dt);
  return c[i];
}

/**
 * Renal Pathology Society 2010 class of diabetic nephropathy (Tervaert 2010).
 * I: isolated GBM thickening; IIa / IIb: mild / severe mesangial expansion;
 * III: ≥1 Kimmelstiel-Wilson nodule, < 50 % global sclerosis; IV: > 50 % global sclerosis.
 */
export function classifyDN({ gbmNm, sex = 'm', mesangial = 0, nodules = 0, globalSclerosis = 0 }) {
  if (globalSclerosis > 0.5) return 'IV';
  if (nodules > 0) return 'III';
  if (mesangial > 0.6) return 'IIb';   // severe (Modelo index threshold)
  if (mesangial > 0.25) return 'IIa';  // mild: > 25 % of mesangium expanded
  const thick = sex === 'f' ? 395 : 430;
  if (gbmNm > thick) return 'I';
  return null;
}

/* ================================================================
 * 2. LUPUS NEPHRITIS — ISN/RPS 2003, revised 2018
 * ================================================================ */
export const LN_CLASS_PRESETS = {
  I:   { mesangialHyper: false, prolif: 0,    subepi: false, sclerosis: 0 },
  II:  { mesangialHyper: true,  prolif: 0,    subepi: false, sclerosis: 0 },
  III: { mesangialHyper: true,  prolif: 0.3,  subepi: false, sclerosis: 0.05 },
  IV:  { mesangialHyper: true,  prolif: 0.8,  subepi: false, sclerosis: 0.05 },
  V:   { mesangialHyper: true,  prolif: 0,    subepi: true,  sclerosis: 0 },
  VI:  { mesangialHyper: true,  prolif: 0,    subepi: false, sclerosis: 0.95 },
};

/**
 * ISN/RPS class from biopsy features.
 *  prolif           fraction of glomeruli with endo/extracapillary lesions (0–1)
 *  subepi           global/segmental subepithelial deposits (membranous component)
 *  sclerosis        fraction of glomeruli globally sclerosed (0–1)
 *  mesangialHyper   mesangial hypercellularity on light microscopy
 * Returns 'I' … 'VI', or combined 'III+V' / 'IV+V'.
 */
export function classifyLN({ mesangialHyper = false, prolif = 0, subepi = false, sclerosis = 0 }) {
  if (sclerosis >= 0.9) return 'VI';
  let base;
  if (prolif >= 0.5) base = 'IV';
  else if (prolif > 0) base = 'III';
  else if (mesangialHyper) base = 'II';
  else base = 'I';
  if (subepi) return base === 'III' || base === 'IV' ? `${base}+V` : 'V';
  return base;
}

/** Labs implied by the lupus biopsy picture (Modelo, from the clinico-pathological correlation). */
export function lnLabs(p) {
  const { mesangialHyper, prolif, subepi, sclerosis } = p;
  const live = 1 - sclerosis;
  const prot = (0.12 + (mesangialHyper ? 0.25 : 0) + 4.5 * Math.pow(prolif, 1.2) + (subepi ? 4.0 : 0)) * live + 1.5 * sclerosis;
  const hemScore = ((mesangialHyper ? 0.15 : 0) + prolif + (subepi ? 0.1 : 0)) * live;
  const egfr = (105 - 70 * Math.pow(prolif, 1.5) - (subepi ? 8 : 0)) * (1 - 0.95 * Math.pow(sclerosis, 1.2));
  const c3 = 125 - 85 * prolif * live;
  const c4 = 28 - 26 * prolif * live;
  const antiDsDna = 15 + 300 * prolif * live + (subepi ? 25 : 0) + (mesangialHyper ? 15 : 0);
  const sbp = 118 + 35 * prolif + 28 * sclerosis + (subepi ? 6 : 0);
  const dbp = 74 + 18 * prolif + 12 * sclerosis + (subepi ? 3 : 0);
  return {
    proteinuria: prot,
    acr: proteinuriaToAcr(prot),
    hematuria: hemScore < 0.1 ? 'none' : hemScore < 0.6 ? 'micro' : 'micro-macro',
    rbcCasts: prolif * live >= 0.15,
    egfr, c3, c4, antiDsDna, sbp, dbp,
    ana: true,
  };
}

/* ================================================================
 * 3. ALPORT SYNDROME / THIN GBM — type IV collagen α3-α4-α5
 * ================================================================ */
// Typical (median) courses — Modelo, from natural-history cohorts (Jais 2000, 2003; Kashtan 2018).
export const ALPORT = {
  'xl-m': { gene: 'COL4A5', inheritance: 'X', share: 0.8, proteinuriaOnset: 7, protStart: 0.3, protRate: 0.25, protMax: 3.5,
    hearingOnset: 11, lenticonusOnset: 20, declineStart: 12, eskdAge: 25, macroUntil: 12 },
  'ar':   { gene: 'COL4A3/COL4A4', inheritance: 'AR', share: 0.15, proteinuriaOnset: 6, protStart: 0.3, protRate: 0.25, protMax: 3.5,
    hearingOnset: 10, lenticonusOnset: 18, declineStart: 10, eskdAge: 22, macroUntil: 12 },
  'xl-f': { gene: 'COL4A5', inheritance: 'X', share: 0.8, proteinuriaOnset: 30, protStart: 0.3, protRate: 0.04, protMax: 1.2,
    hearingOnset: 45, lenticonusOnset: null, declineStart: 40, slope: 1.2, macroUntil: 0 },
  'ad':   { gene: 'COL4A3/COL4A4', inheritance: 'AD', share: 0.05, proteinuriaOnset: null,
    hearingOnset: null, lenticonusOnset: null, declineStart: 40, slope: 0.5, macroUntil: 0 },
  'ad-risk': { gene: 'COL4A3/COL4A4', inheritance: 'AD', share: 0.05, proteinuriaOnset: 30, protStart: 0.6, protRate: 0.05, protMax: 2,
    hearingOnset: 50, lenticonusOnset: null, declineStart: 35, eskdAge: 72, macroUntil: 0 },
};
export const ALPORT_TX_SLOPE = 0.55;   // early RAAS blockade: slope × 0.55 (Modelo; Gross 2012 — delays ESKD by years)
export const ALPORT_GENOTYPES = ['xl-m', 'xl-f', 'ar', 'ad'];

function alportKey(genotype, adRisk) {
  return genotype === 'ad' && adRisk ? 'ad-risk' : genotype;
}

/** Alport state at a given age. */
export function alportAt(genotype, age, { adRisk = false, treated = false } = {}) {
  const g = ALPORT[alportKey(genotype, adRisk)];
  if (!g) throw new Error(`unknown genotype ${genotype}`);
  const a = clamp(age, 0, 80);
  let slope = g.eskdAge ? (100 - 15) / (g.eskdAge - g.declineStart) : g.slope;
  if (treated) slope *= ALPORT_TX_SLOPE;
  const egfr = Math.max(5, a <= g.declineStart ? 100 : 100 - slope * (a - g.declineStart));
  let proteinuria = 0.11;
  if (g.proteinuriaOnset !== null && a >= g.proteinuriaOnset) {
    proteinuria = Math.min(g.protMax, g.protStart + g.protRate * (a - g.proteinuriaOnset));
    if (treated) proteinuria *= 0.6;
  }
  // GBM ultrastructure
  let lamellation, gbmNm;
  if (genotype === 'xl-m' || genotype === 'ar') {
    lamellation = clamp((a - 4) / 14);
    gbmNm = 230 + 330 * lamellation;          // thin in early childhood → irregular thick/thin, split
  } else if (genotype === 'xl-f') {
    lamellation = 0.4 * clamp((a - 8) / 30);
    gbmNm = 260 + 200 * lamellation;
  } else {
    lamellation = adRisk ? 0.25 * clamp((a - 20) / 30) : 0;
    gbmNm = 210 + 150 * lamellation;           // diffusely thin
  }
  const gs = clamp((100 - egfr) / 100);
  return {
    age: a, egfr, proteinuria, acr: proteinuriaToAcr(proteinuria),
    hematuria: a < g.macroUntil ? 'micro-macro' : 'micro',
    hearingLoss: g.hearingOnset !== null && a >= g.hearingOnset,
    lenticonus: g.lenticonusOnset !== null && a >= g.lenticonusOnset,
    gbmNm, lamellation, irregularity: lamellation, gs,
    sbp: 112 + 30 * gs + (proteinuria > 1 ? 6 : 0), dbp: 70 + 15 * gs,
    eskd: egfr < 15,
  };
}

export function alportSeries(genotype, { adRisk = false, treated = false, maxAge = 70, step = 0.5 } = {}) {
  const out = [];
  for (let a = 0; a <= maxAge + 1e-9; a += step) out.push({ t: round2(a), ...alportAt(genotype, a, { adRisk, treated }) });
  return out;
}

/* ================================================================
 * 4. RENAL AMYLOIDOSIS — AL (light chains) / AA (serum amyloid A)
 * ================================================================ */
/**
 * Congo red birefringence under crossed polarizers.
 * Transmitted intensity of a birefringent fibril ∝ sin²(2(φ − θ)),
 * φ = fibril orientation, θ = polarizer angle (degrees). 0 … 1.
 */
export function congoBirefringence(fibrilDeg, polarizerDeg) {
  const d = ((fibrilDeg - polarizerDeg) * Math.PI) / 180;
  const s = Math.sin(2 * d);
  return s * s;
}

export function amyloidLabs(type, load) {
  const L = clamp(load);
  const proteinuria = 0.12 + 9 * Math.pow(L, 1.3);
  const egfr = 100 - 70 * L * L;
  const out = {
    proteinuria, acr: proteinuriaToAcr(proteinuria), hematuria: 'none', rbcCasts: false,
    egfr, sbp: 108 - 12 * L, dbp: 68 - 6 * L, c3: 115, c4: 26,
  };
  if (type === 'AL') {
    const lambda = 20 + 320 * L;
    out.flcLambda = lambda; out.flcKappa = 12; out.flcRatio = 12 / lambda;
  } else {
    out.crp = 12 + 50 * L;
  }
  return out;
}

/* ================================================================
 * Unified snapshot for the UI
 * ================================================================ */
export const DEFAULT_STATE = {
  entity: 'diabetic',
  dn: { years: 17, treated: false },
  ln: { ...LN_CLASS_PRESETS.IV },
  alport: { genotype: 'xl-m', age: 14, adRisk: false, treated: false },
  amyloid: { type: 'AA', load: 0.6, congo: true, polarized: false, angle: 20 },
  sex: 'm',
};

export function cloneState(s) { return JSON.parse(JSON.stringify(s)); }

const BASE_SCENE = Object.freeze({
  gbmNm: 350, irregularity: 0, lamellation: 0,
  mesangialMatrix: 0, mesangialCells: 0.15, endocapillary: 0, nodules: 0,
  depMesangial: 0, depSubendothelial: 0, depSubepithelial: 0, depositKind: 'none',
  segSclerosis: 0, globalSclerosed: false, crescent: 0,
  hyalAff: 0, hyalEff: 0, amyloid: 0, amyloidVessel: 0,
  effacement: 0, rbcLeak: 0, proteinLeak: 0.03,
});

const SCLEROSED = { globalSclerosed: true, endocapillary: 0, crescent: 0, rbcLeak: 0, proteinLeak: 0, effacement: 1, mesangialCells: 0.05 };

/** Deterministic PRNG (mulberry32). */
export function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const BIOPSY_N = 20;
/** Biopsy of N glomeruli with given counts, shuffled deterministically. */
export function makeBiopsy(counts, seed = 7) {
  const arr = [];
  for (const [kind, n] of counts) for (let i = 0; i < n; i++) arr.push(kind);
  while (arr.length < BIOPSY_N) arr.push(counts.length ? counts[counts.length - 1][0] : 'normal');
  arr.length = BIOPSY_N;
  const r = prng(seed);
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}

function proteinLeakFromAcr(acr) { return clamp(0.03 + acr / (acr + 1200)); }

/**
 * Everything the UI needs for the current state.
 * `variant` = which glomerulus of the biopsy is on screen ('lesion' | 'prolif' | 'sclerosed' | 'normal'),
 * defaults to the most representative one.
 */
export function snapshot(state, variant = null) {
  const e = state.entity;
  let labs, scene = { ...BASE_SCENE }, cls = null, biopsyCounts, pathway, extra = {};
  const sex = state.sex || 'm';

  if (e === 'normal') {
    labs = { proteinuria: 0.08, acr: 6, hematuria: 'none', rbcCasts: false, egfr: 105, sbp: 118, dbp: 74, c3: 120, c4: 28 };
    biopsyCounts = [['normal', BIOPSY_N]];
    pathway = [['n-endothelium', true], ['n-gbm', true], ['n-podocyte', true], ['n-mesangium', true]];
  }

  else if (e === 'diabetic') {
    const { years, treated } = state.dn;
    const p = dnAt(years, treated);
    const pu = treated ? dnAt(years, false) : p;
    labs = {
      proteinuria: acrToProteinuria(p.acr), acr: p.acr, hematuria: 'none', rbcCasts: false,
      egfr: p.egfr, c3: 115, c4: 27,
      sbp: 122 + 28 * (p.acr / (p.acr + 300)) + 0.25 * (100 - p.cap) - (p.onTx ? 8 : 0),
      dbp: 76 + 10 * (p.acr / (p.acr + 300)) + 0.08 * (100 - p.cap) - (p.onTx ? 4 : 0),
      retinopathy: years >= 8,
    };
    cls = classifyDN({ gbmNm: p.gbm, sex, mesangial: p.mes, nodules: p.nodules, globalSclerosis: p.gs });
    Object.assign(scene, {
      gbmNm: p.gbm, mesangialMatrix: p.mes, nodules: p.nodules, hyalAff: p.hyalAff, hyalEff: p.hyalEff,
      effacement: clamp(p.acr / (p.acr + 800)), proteinLeak: proteinLeakFromAcr(p.acr),
      segSclerosis: 0.4 * p.gs, mesangialCells: 0.2,
    });
    const nScl = Math.round(p.gs * BIOPSY_N);
    biopsyCounts = [['sclerosed', nScl], ['lesion', BIOPSY_N - nScl]];
    if (years < 2.5 && p.gbm <= 430) biopsyCounts = [['sclerosed', nScl], ['normal', BIOPSY_N - nScl]];
    const hyperOn = p.hyper > 0.05;
    pathway = [
      ['dn-hyperglycemia', years > 0],
      ['dn-hyperfiltration', hyperOn],
      ['dn-gbm', p.gbm > (sex === 'f' ? 395 : 430)],
      ['dn-mesangium', p.mes > 0.25],
      ['dn-hyalinosis', p.hyalEff > 0.15],
      ['dn-albuminuria', p.acr >= 30],
      ['dn-kw', p.nodules > 0],
      ['dn-proteinuria', p.acr >= 300],
      ['dn-sclerosis', p.egfr < 60],
      ['dn-eskd', p.egfr < 15],
    ];
    extra = {
      years, treated, point: p, untreatedPoint: pu,
      albCat: albuminuriaCategory(p.acr), gfrCat: gfrCategory(p.egfr), risk: kdigoRisk(p.egfr, p.acr),
    };
  }

  else if (e === 'lupus') {
    const ln = state.ln;
    labs = lnLabs(ln);
    cls = classifyLN(ln);
    const live = 1 - ln.sclerosis;
    const nScl = Math.round(ln.sclerosis * BIOPSY_N);
    const nProl = Math.min(BIOPSY_N - nScl, Math.round(ln.prolif * BIOPSY_N));
    biopsyCounts = [['sclerosed', nScl], ['prolif', nProl], ['lesion', BIOPSY_N - nScl - nProl]];
    const minimal = !ln.mesangialHyper && ln.prolif === 0 && !ln.subepi;
    Object.assign(scene, {
      depositKind: 'ic',
      depMesangial: minimal ? 0.35 : 0.65,
      mesangialCells: ln.mesangialHyper ? 0.6 : 0.15,
      mesangialMatrix: ln.mesangialHyper ? 0.2 : 0.05,
      depSubendothelial: ln.prolif > 0 ? 0.1 : 0,
      depSubepithelial: ln.subepi ? 0.9 : ln.prolif > 0 ? 0.1 : 0,
      gbmNm: ln.subepi ? 520 : 360,
      effacement: clamp(labs.proteinuria / 5),
      proteinLeak: proteinLeakFromAcr(labs.acr) * live,
      rbcLeak: ln.mesangialHyper ? 0.12 : 0,
    });
    pathway = [
      ['ln-tolerance', true],
      ['ln-ic', true],
      ['ln-mesangial', true],
      ['ln-complement', labs.c3 < REF.c3[0] || labs.c4 < REF.c4[0]],
      ['ln-subendo', ln.prolif > 0],
      ['ln-proliferation', ln.prolif > 0],
      ['ln-subepi', ln.subepi],
      ['ln-sclerosis', ln.sclerosis >= 0.5],
    ];
    extra = { ...ln, nProl, nScl, treatment: lnTreatmentKey(cls) };
  }

  else if (e === 'alport') {
    const al = state.alport;
    const a = alportAt(al.genotype, al.age, { adRisk: al.adRisk, treated: al.treated });
    labs = {
      proteinuria: a.proteinuria, acr: a.acr, hematuria: a.hematuria, rbcCasts: false,
      egfr: a.egfr, sbp: a.sbp, dbp: a.dbp, c3: 118, c4: 27,
      hearingLoss: a.hearingLoss, lenticonus: a.lenticonus,
    };
    Object.assign(scene, {
      gbmNm: a.gbmNm, lamellation: a.lamellation, irregularity: a.irregularity,
      rbcLeak: a.hematuria === 'micro-macro' ? 0.9 : 0.45,
      proteinLeak: proteinLeakFromAcr(a.acr), effacement: clamp(a.proteinuria / 4),
      segSclerosis: 0.5 * a.gs, mesangialMatrix: 0.1 + 0.3 * a.gs,
    });
    const nScl = Math.round(a.gs * BIOPSY_N);
    biopsyCounts = [['sclerosed', nScl], ['lesion', BIOPSY_N - nScl]];
    cls = al.genotype;
    pathway = [
      ['al-mutation', true],
      ['al-network', true],
      ['al-fragile', true],
      ['al-hematuria', true],
      ['al-lamellation', a.lamellation > 0.3],
      ['al-proteinuria', a.proteinuria >= 0.3],
      ['al-sclerosis', a.egfr < 60],
      ['al-eskd', a.egfr < 15],
      ['al-ear', a.hearingLoss],
      ['al-eye', a.lenticonus],
    ];
    extra = { ...al, point: a, untreatedPoint: alportAt(al.genotype, al.age, { adRisk: al.adRisk }) };
  }

  else if (e === 'amyloid') {
    const am = state.amyloid;
    labs = amyloidLabs(am.type, am.load);
    const L = clamp(am.load);
    Object.assign(scene, {
      depositKind: 'amyloid', amyloid: L, amyloidVessel: L * (am.type === 'AL' ? 0.8 : 0.6),
      mesangialMatrix: 0.1, effacement: clamp(labs.proteinuria / 5), proteinLeak: proteinLeakFromAcr(labs.acr),
      gbmNm: 360,
    });
    const gs = clamp((100 - labs.egfr) / 100);
    const nScl = Math.round(gs * BIOPSY_N);
    biopsyCounts = [['sclerosed', nScl], ['lesion', BIOPSY_N - nScl]];
    cls = am.type;
    pathway = [
      ['am-precursor', true],
      ['am-misfold', true],
      ['am-deposit', L > 0.05],
      ['am-podocyte', labs.proteinuria >= 0.5],
      ['am-nephrotic', labs.proteinuria >= 3.5],
      ['am-vessels', labs.sbp < 105],
      ['am-sclerosis', labs.egfr < 60],
    ];
    extra = { ...am };
  }

  else throw new Error(`unknown entity ${e}`);

  const biopsy = makeBiopsy(biopsyCounts.filter(([, n]) => n > 0), seedFor(state));
  const present = new Set(biopsy);
  const v = variant && present.has(variant) ? variant
    : ['prolif', 'lesion', 'normal', 'sclerosed'].find((k) => present.has(k));
  if (v === 'sclerosed') Object.assign(scene, SCLEROSED);
  else if (v === 'normal') scene = { ...BASE_SCENE, gbmNm: scene.gbmNm < 430 ? scene.gbmNm : 350 };
  else if (v === 'prolif') {
    Object.assign(scene, {
      endocapillary: 0.85, depSubendothelial: 0.85, depSubepithelial: Math.max(scene.depSubepithelial, 0.2),
      crescent: state.ln && state.ln.prolif >= 0.5 ? 0.6 : 0.25, rbcLeak: 0.8, segSclerosis: 0.1,
      mesangialCells: 0.7,
    });
  }

  return {
    entity: e, cls, labs, scene, variant: v, biopsy,
    pathway: pathway.map(([key, on]) => ({ key, on })),
    extra,
    status: labStatus(labs),
  };
}

function seedFor(state) {
  return { normal: 3, diabetic: 11, lupus: 5, alport: 17, amyloid: 23 }[state.entity] || 1;
}

export function lnTreatmentKey(cls) {
  if (cls === 'I' || cls === 'II') return 'ln-tx-mild';
  if (cls === 'V') return 'ln-tx-v';
  if (cls === 'VI') return 'ln-tx-vi';
  return 'ln-tx-induction';
}

/** ↑ / ↓ / N against the reference range. */
export function flag(value, [lo, hi]) {
  if (!(typeof value === 'number' && isFinite(value))) return null;
  if (value < lo) return 'low';
  if (value > hi) return 'high';
  return 'normal';
}

export function labStatus(labs) {
  const out = {};
  for (const k of ['acr', 'proteinuria', 'egfr', 'sbp', 'dbp', 'c3', 'c4', 'antiDsDna', 'flcKappa', 'flcLambda', 'flcRatio', 'crp']) {
    if (labs[k] !== undefined) out[k] = flag(labs[k], REF[k]);
  }
  return out;
}

/* ---------- Milestones (natural-history log) ---------- */
export function dnMilestones(treated) {
  const c = dnCourseCached(treated);
  const out = [];
  const first = (key, pred) => { const p = c.find(pred); if (p) out.push({ key, t: p.t, p }); };
  const peak = c.reduce((m, p) => (p.t <= 10 && p.egfr > m.egfr ? p : m), c[0]);
  if (peak.egfr > 110) out.push({ key: 'ms-hyperfiltration', t: peak.t, p: peak });
  first('ms-gbm', (p) => p.gbm > 430);
  first('ms-a2', (p) => p.acr >= 30);
  if (treated) {
    const tx = c.find((p) => p.onTx);
    if (tx) {
      const before = c[c.indexOf(tx) - 1];
      const after = c[Math.min(c.length - 1, c.indexOf(tx) + 1)];
      out.push({ key: 'ms-tx', t: tx.t, p: tx, dip: (before.egfr - after.egfr) / before.egfr });
    }
  }
  first('ms-mes', (p) => p.mes > 0.25);
  first('ms-a3', (p) => p.acr >= 300);
  first('ms-kw', (p) => p.nodules > 0);
  first('ms-g3', (p) => p.egfr < 60);
  first('ms-class4', (p) => p.gs > 0.5);
  first('ms-eskd', (p) => p.egfr < 15);
  return out.sort((a, b) => a.t - b.t);
}

export function alportMilestones(genotype, { adRisk = false, treated = false } = {}) {
  const s = alportSeries(genotype, { adRisk, treated, maxAge: 70, step: 0.5 });
  const out = [{ key: 'ms-hematuria', t: 0 }];
  const g = ALPORT[alportKey(genotype, adRisk)];
  if (g.macroUntil) out.push({ key: 'ms-macro', t: 1 });
  const first = (key, pred) => { const p = s.find(pred); if (p) out.push({ key, t: p.t }); };
  first('ms-proteinuria', (p) => p.proteinuria >= 0.3);
  first('ms-hearing', (p) => p.hearingLoss);
  first('ms-lenticonus', (p) => p.lenticonus);
  first('ms-g3', (p) => p.egfr < 60);
  first('ms-eskd', (p) => p.egfr < 15);
  return out.sort((a, b) => a.t - b.t);
}

/* ---------- Presets (teacher deep links: ?preset=<key>) ---------- */
export const PRESETS = {
  'normal':                 { entity: 'normal' },
  'dn-hyperfiltration':     { entity: 'diabetic', dn: { years: 2, treated: false } },
  'dn-moderate-albuminuria':{ entity: 'diabetic', dn: { years: 11, treated: false } },
  'dn-kimmelstiel-wilson':  { entity: 'diabetic', dn: { years: 17, treated: false } },
  'dn-advanced':            { entity: 'diabetic', dn: { years: 25, treated: false } },
  'dn-treated':             { entity: 'diabetic', dn: { years: 17, treated: true } },
  'ln-class-1':             { entity: 'lupus', ln: LN_CLASS_PRESETS.I },
  'ln-class-2':             { entity: 'lupus', ln: LN_CLASS_PRESETS.II },
  'ln-class-3':             { entity: 'lupus', ln: LN_CLASS_PRESETS.III },
  'ln-class-4':             { entity: 'lupus', ln: LN_CLASS_PRESETS.IV },
  'ln-class-4-5':           { entity: 'lupus', ln: { ...LN_CLASS_PRESETS.IV, subepi: true } },
  'ln-class-5':             { entity: 'lupus', ln: LN_CLASS_PRESETS.V },
  'ln-class-6':             { entity: 'lupus', ln: LN_CLASS_PRESETS.VI },
  'alport-xl-boy':          { entity: 'alport', alport: { genotype: 'xl-m', age: 8, adRisk: false, treated: false } },
  'alport-xl-man':          { entity: 'alport', alport: { genotype: 'xl-m', age: 24, adRisk: false, treated: false } },
  'alport-xl-treated':      { entity: 'alport', alport: { genotype: 'xl-m', age: 24, adRisk: false, treated: true } },
  'alport-carrier-woman':   { entity: 'alport', alport: { genotype: 'xl-f', age: 45, adRisk: false, treated: false } },
  'alport-ar':              { entity: 'alport', alport: { genotype: 'ar', age: 16, adRisk: false, treated: false } },
  'alport-thin-gbm':        { entity: 'alport', alport: { genotype: 'ad', age: 30, adRisk: false, treated: false } },
  'amyloid-aa-ra':          { entity: 'amyloid', amyloid: { type: 'AA', load: 0.6, congo: true, polarized: false, angle: 20 } },
  'amyloid-al-lambda':      { entity: 'amyloid', amyloid: { type: 'AL', load: 0.7, congo: true, polarized: false, angle: 20 } },
  'amyloid-congo-polarized':{ entity: 'amyloid', amyloid: { type: 'AA', load: 0.6, congo: true, polarized: true, angle: 45 } },
};

/** Full state for a preset (missing sub-states keep defaults). */
export function presetState(key) {
  const p = PRESETS[key];
  if (!p) return null;
  const s = cloneState(DEFAULT_STATE);
  s.entity = p.entity;
  for (const k of ['dn', 'ln', 'alport', 'amyloid']) if (p[k]) s[k] = { ...s[k], ...cloneState(p[k]) };
  return s;
}

export { round1 };
