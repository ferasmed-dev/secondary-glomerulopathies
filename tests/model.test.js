import test from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../src/model.js';

const finite = (x) => typeof x === 'number' && Number.isFinite(x);

/* ---------- generic classifiers ---------- */
test('albuminuria categories follow KDIGO cut-offs', () => {
  assert.equal(M.albuminuriaCategory(0), 'A1');
  assert.equal(M.albuminuriaCategory(29.9), 'A1');
  assert.equal(M.albuminuriaCategory(30), 'A2');
  assert.equal(M.albuminuriaCategory(299), 'A2');
  assert.equal(M.albuminuriaCategory(300), 'A3');
  assert.equal(M.albuminuriaCategory(NaN), null);
});

test('GFR categories and KDIGO risk grid', () => {
  assert.deepEqual([95, 75, 50, 40, 20, 10].map(M.gfrCategory), ['G1', 'G2', 'G3a', 'G3b', 'G4', 'G5']);
  assert.equal(M.kdigoRisk(100, 10), 'low');
  assert.equal(M.kdigoRisk(100, 100), 'moderate');
  assert.equal(M.kdigoRisk(100, 500), 'high');
  assert.equal(M.kdigoRisk(50, 10), 'moderate');
  assert.equal(M.kdigoRisk(40, 100), 'very-high');
  assert.equal(M.kdigoRisk(20, 5), 'very-high');
});

test('ACR ↔ proteinuria conversion matches the usual equivalences and inverts', () => {
  assert.ok(Math.abs(M.acrToProteinuria(30) - 0.15) < 0.03);
  assert.ok(Math.abs(M.acrToProteinuria(300) - 0.5) < 0.05);
  for (const p of [0.2, 0.5, 1, 3.5, 8]) assert.ok(Math.abs(M.acrToProteinuria(M.proteinuriaToAcr(p)) - p) < 1e-6);
  assert.equal(M.proteinuriaToAcr(0), 0);
  assert.equal(M.proteinuriaToAcr(-1), 0);
});

/* ---------- diabetic kidney disease ---------- */
test('DN starts healthy', () => {
  const p = M.dnAt(0);
  assert.equal(p.egfr, 100);
  assert.equal(M.albuminuriaCategory(p.acr), 'A1');
  assert.equal(p.gbm, 350);
  assert.equal(p.nodules, 0);
});

test('DN: early hyperfiltration raises eGFR above baseline', () => {
  assert.ok(M.dnAt(3).egfr > 110);
});

test('DN untreated follows the classic sequence A2 → A3 → ESKD', () => {
  const ms = Object.fromEntries(M.dnMilestones(false).map((m) => [m.key, m.t]));
  assert.ok(ms['ms-gbm'] >= 2 && ms['ms-gbm'] <= 5, 'GBM thickening at 2–5 y');
  assert.ok(ms['ms-a2'] >= 5 && ms['ms-a2'] <= 12);
  assert.ok(ms['ms-a3'] > ms['ms-a2']);
  assert.ok(ms['ms-eskd'] > ms['ms-a3']);
  const fromA3 = ms['ms-eskd'] - ms['ms-a3'];
  assert.ok(fromA3 >= 7 && fromA3 <= 12, `ESKD ~10 y after overt nephropathy (got ${fromA3})`);
});

test('DN overt phase loses roughly 10 mL/min per year (not 1)', () => {
  const a = M.dnAt(18), b = M.dnAt(22);
  const slope = (a.egfr - b.egfr) / 4;
  assert.ok(slope > 6 && slope < 13, `slope ${slope}`);
});

test('DN RPS classes appear in order I → II → III → IV', () => {
  const order = ['I', 'IIa', 'IIb', 'III', 'IV'];
  let last = -1;
  for (let y = 0; y <= 30; y += 0.5) {
    const p = M.dnAt(y);
    const c = M.classifyDN({ gbmNm: p.gbm, mesangial: p.mes, nodules: p.nodules, globalSclerosis: p.gs });
    if (!c) continue;
    const idx = order.indexOf(c);
    assert.ok(idx >= last, `class went backwards at ${y}`);
    last = idx;
  }
  assert.equal(last, 4);
});

test('classifyDN boundaries', () => {
  assert.equal(M.classifyDN({ gbmNm: 400, sex: 'm' }), null);
  assert.equal(M.classifyDN({ gbmNm: 400, sex: 'f' }), 'I');
  assert.equal(M.classifyDN({ gbmNm: 450, mesangial: 0.3 }), 'IIa');
  assert.equal(M.classifyDN({ gbmNm: 450, mesangial: 0.7 }), 'IIb');
  assert.equal(M.classifyDN({ gbmNm: 450, mesangial: 0.7, nodules: 1, globalSclerosis: 0.4 }), 'III');
  assert.equal(M.classifyDN({ gbmNm: 450, mesangial: 0.7, nodules: 1, globalSclerosis: 0.51 }), 'IV');
});

test('DN treatment lowers albuminuria, slows decline and produces a small early dip (< 30 %)', () => {
  const ms = M.dnMilestones(true);
  const tx = ms.find((m) => m.key === 'ms-tx');
  assert.ok(tx, 'treatment starts');
  assert.ok(tx.dip > 0.02 && tx.dip < 0.3, `dip ${tx.dip}`);
  assert.ok(M.dnAt(20, true).acr < M.dnAt(20, false).acr);
  assert.ok(M.dnAt(25, true).egfr > M.dnAt(25, false).egfr + 30);
  assert.equal(M.dnAt(5, true).egfr, M.dnAt(5, false).egfr, 'identical before treatment');
  assert.ok(!ms.some((m) => m.key === 'ms-eskd'), 'no ESKD within 30 y when treated');
});

test('DN sediment is bland and complement normal', () => {
  const s = M.snapshot(M.presetState('dn-kimmelstiel-wilson'));
  assert.equal(s.labs.hematuria, 'none');
  assert.equal(s.status.c3, 'normal');
  assert.equal(s.status.c4, 'normal');
  assert.equal(s.cls, 'III');
  assert.ok(s.scene.nodules > 0);
  assert.ok(s.scene.hyalEff > 0);
});

/* ---------- lupus nephritis ---------- */
test('ISN/RPS classifier', () => {
  for (const [k, p] of Object.entries(M.LN_CLASS_PRESETS)) assert.equal(M.classifyLN(p), k);
  assert.equal(M.classifyLN({ mesangialHyper: true, prolif: 0.49 }), 'III');
  assert.equal(M.classifyLN({ mesangialHyper: true, prolif: 0.5 }), 'IV');
  assert.equal(M.classifyLN({ prolif: 0.8, subepi: true }), 'IV+V');
  assert.equal(M.classifyLN({ prolif: 0.2, subepi: true }), 'III+V');
  assert.equal(M.classifyLN({ prolif: 0.8, sclerosis: 0.9 }), 'VI');
});

test('LN class IV: nephrotic-range proteinuria, haematuria with casts, low C3 and C4, HTN, ↓eGFR', () => {
  const l = M.lnLabs(M.LN_CLASS_PRESETS.IV);
  assert.ok(l.proteinuria >= 3);
  assert.equal(l.hematuria, 'micro-macro');
  assert.ok(l.rbcCasts);
  assert.ok(l.c3 < M.REF.c3[0] && l.c4 < M.REF.c4[0]);
  assert.ok(l.sbp >= 140);
  assert.ok(l.egfr < 60);
});

test('LN class V: nephrotic, complement normal, preserved eGFR', () => {
  const l = M.lnLabs(M.LN_CLASS_PRESETS.V);
  assert.ok(l.proteinuria >= 3.5);
  assert.ok(l.c3 >= M.REF.c3[0] && l.c4 >= M.REF.c4[0]);
  assert.ok(l.egfr > 80);
});

test('LN classes I–II do not reach nephrotic range; class VI ends in ESKD', () => {
  assert.ok(M.lnLabs(M.LN_CLASS_PRESETS.I).proteinuria < 0.3);
  assert.ok(M.lnLabs(M.LN_CLASS_PRESETS.II).proteinuria < 1);
  assert.ok(M.lnLabs(M.LN_CLASS_PRESETS.VI).egfr < 15);
});

test('LN: more proliferation → more proteinuria, lower complement, lower eGFR', () => {
  const lo = M.lnLabs({ mesangialHyper: true, prolif: 0.2, subepi: false, sclerosis: 0 });
  const hi = M.lnLabs({ mesangialHyper: true, prolif: 0.9, subepi: false, sclerosis: 0 });
  assert.ok(hi.proteinuria > lo.proteinuria);
  assert.ok(hi.c3 < lo.c3 && hi.c4 < lo.c4);
  assert.ok(hi.egfr < lo.egfr);
  assert.ok(hi.antiDsDna > lo.antiDsDna);
});

test('LN biopsy strip encodes the 50 % rule', () => {
  const s3 = M.snapshot(M.presetState('ln-class-3'));
  const s4 = M.snapshot(M.presetState('ln-class-4'));
  const frac = (s) => s.biopsy.filter((k) => k === 'prolif').length / M.BIOPSY_N;
  assert.ok(frac(s3) < 0.5);
  assert.ok(frac(s4) >= 0.5);
  assert.equal(s4.variant, 'prolif');
  assert.equal(s4.biopsy.length, M.BIOPSY_N);
});

test('LN treatment keys by class', () => {
  assert.equal(M.lnTreatmentKey('II'), 'ln-tx-mild');
  assert.equal(M.lnTreatmentKey('IV'), 'ln-tx-induction');
  assert.equal(M.lnTreatmentKey('IV+V'), 'ln-tx-induction');
  assert.equal(M.lnTreatmentKey('V'), 'ln-tx-v');
  assert.equal(M.lnTreatmentKey('VI'), 'ln-tx-vi');
});

/* ---------- Alport ---------- */
test('X-linked Alport male: ESKD around 15–35 y, deafness then lenticonus', () => {
  const ms = Object.fromEntries(M.alportMilestones('xl-m').map((m) => [m.key, m.t]));
  assert.ok(ms['ms-eskd'] >= 15 && ms['ms-eskd'] <= 35);
  assert.ok(ms['ms-hearing'] < ms['ms-eskd']);
  assert.ok(ms['ms-lenticonus'] > ms['ms-hearing']);
  assert.equal(ms['ms-hematuria'], 0);
});

test('Alport: carrier women and thin GBM do not reach ESKD in the median course', () => {
  assert.ok(!M.alportMilestones('xl-f').some((m) => m.key === 'ms-eskd'));
  assert.ok(!M.alportMilestones('ad').some((m) => m.key === 'ms-eskd'));
  const thin = M.alportAt('ad', 30);
  assert.ok(thin.gbmNm < M.REF.gbmNm[0], 'diffusely thin GBM');
  assert.equal(thin.hematuria, 'micro');
  assert.ok(thin.proteinuria < 0.15);
});

test('Alport GBM: thin early, lamellated later', () => {
  const kid = M.alportAt('xl-m', 3), adult = M.alportAt('xl-m', 20);
  assert.ok(kid.gbmNm < M.REF.gbmNm[0]);
  assert.equal(kid.lamellation, 0);
  assert.ok(adult.lamellation > 0.9);
});

test('Alport: early RAAS blockade delays ESKD', () => {
  const u = M.alportMilestones('xl-m').find((m) => m.key === 'ms-eskd').t;
  const t = M.alportMilestones('xl-m', { treated: true }).find((m) => m.key === 'ms-eskd').t;
  assert.ok(t > u + 5);
});

test('AD with proteinuria > 0.5 g/d progresses; without it does not', () => {
  assert.ok(M.alportAt('ad', 60, { adRisk: true }).egfr < 60);
  assert.ok(M.alportAt('ad', 60).egfr > 80);
  assert.ok(M.alportAt('ad', 31, { adRisk: true }).proteinuria > 0.5);
});

test('Alport: complement is normal', () => {
  const s = M.snapshot(M.presetState('alport-xl-man'));
  assert.equal(s.status.c3, 'normal');
  assert.equal(s.status.c4, 'normal');
});

/* ---------- amyloidosis ---------- */
test('Congo red birefringence: extinct at 0°/90°, maximal at 45°', () => {
  assert.ok(M.congoBirefringence(30, 30) < 1e-12);
  assert.ok(M.congoBirefringence(120, 30) < 1e-12);
  assert.ok(Math.abs(M.congoBirefringence(75, 30) - 1) < 1e-12);
  for (let a = 0; a < 360; a += 7) { const v = M.congoBirefringence(a, 13); assert.ok(v >= 0 && v <= 1); }
});

test('Amyloid: nephrotic proteinuria without haematuria, low BP, normal complement', () => {
  const l = M.amyloidLabs('AA', 0.6);
  assert.ok(l.proteinuria >= 3.5);
  assert.equal(l.hematuria, 'none');
  assert.ok(l.sbp < 110);
  assert.equal(M.flag(l.c3, M.REF.c3), 'normal');
  assert.ok(l.crp > M.REF.crp[1]);
});

test('AL λ amyloid: λ free light chains up, κ/λ ratio down', () => {
  const l = M.amyloidLabs('AL', 0.7);
  assert.equal(M.flag(l.flcLambda, M.REF.flcLambda), 'high');
  assert.equal(M.flag(l.flcRatio, M.REF.flcRatio), 'low');
});

test('Amyloid load is monotone', () => {
  const a = M.amyloidLabs('AA', 0.2), b = M.amyloidLabs('AA', 0.9);
  assert.ok(b.proteinuria > a.proteinuria && b.egfr < a.egfr);
});

/* ---------- snapshot, presets, robustness ---------- */
test('every preset builds a valid snapshot with finite labs', () => {
  for (const key of Object.keys(M.PRESETS)) {
    const st = M.presetState(key);
    const s = M.snapshot(st);
    assert.equal(s.entity, M.PRESETS[key].entity, key);
    for (const k of ['proteinuria', 'acr', 'egfr', 'sbp', 'dbp']) assert.ok(finite(s.labs[k]) && s.labs[k] >= 0, `${key}.${k}`);
    assert.equal(s.biopsy.length, M.BIOPSY_N);
    for (const v of Object.values(s.scene)) if (typeof v === 'number') assert.ok(finite(v) && v >= 0, key);
    assert.ok(s.pathway.length > 0);
  }
});

test('preset expectations', () => {
  const cls = (k) => M.snapshot(M.presetState(k)).cls;
  assert.equal(cls('dn-hyperfiltration'), null);
  assert.equal(cls('dn-moderate-albuminuria'), 'IIa');
  assert.equal(cls('dn-kimmelstiel-wilson'), 'III');
  assert.equal(cls('dn-advanced'), 'IV');
  assert.equal(cls('ln-class-4-5'), 'IV+V');
  assert.equal(M.snapshot(M.presetState('dn-advanced')).labs.egfr < 15, true);
  assert.equal(M.albuminuriaCategory(M.snapshot(M.presetState('dn-moderate-albuminuria')).labs.acr), 'A2');
  assert.equal(M.snapshot(M.presetState('alport-xl-boy')).labs.hematuria, 'micro-macro');
  assert.equal(M.snapshot(M.presetState('alport-xl-man')).labs.hearingLoss, true);
  assert.equal(M.presetState('nope'), null);
});

test('extreme inputs never give NaN or negatives', () => {
  for (const y of [-5, 0, 100]) { const p = M.dnAt(y, true); assert.ok(finite(p.egfr) && p.egfr >= 0); }
  for (const a of [-3, 0, 200]) for (const g of M.ALPORT_GENOTYPES) { const p = M.alportAt(g, a, { adRisk: true }); assert.ok(finite(p.egfr) && p.egfr > 0); }
  for (const L of [-1, 0, 2]) { const l = M.amyloidLabs('AL', L); assert.ok(Object.values(l).every((v) => typeof v !== 'number' || (finite(v) && v >= 0))); }
  const l = M.lnLabs({ mesangialHyper: true, prolif: 1, subepi: true, sclerosis: 1 });
  assert.ok(Object.values(l).every((v) => typeof v !== 'number' || (finite(v) && v >= 0)));
  assert.throws(() => M.alportAt('zzz', 3));
});

test('variants: picking a sclerosed glomerulus collapses it', () => {
  const s = M.snapshot(M.presetState('dn-advanced'), 'sclerosed');
  assert.equal(s.variant, 'sclerosed');
  assert.equal(s.scene.globalSclerosed, true);
  const n = M.snapshot(M.presetState('normal'), 'sclerosed');
  assert.equal(n.variant, 'normal', 'falls back when the variant is absent');
});

test('model is pure: snapshot does not mutate state; same input, same output', () => {
  const st = M.presetState('ln-class-4');
  const copy = JSON.stringify(st);
  const a = JSON.stringify(M.snapshot(st));
  const b = JSON.stringify(M.snapshot(st));
  assert.equal(JSON.stringify(st), copy);
  assert.equal(a, b);
});
