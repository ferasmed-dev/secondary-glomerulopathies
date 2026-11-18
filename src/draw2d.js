/*
 * 2D SVG views: light-microscopy section, electron-microscopy capillary wall
 * (to scale) and the 20-glomerulus biopsy strip. Pure string builders.
 */
import { prng, congoBirefringence } from './model.js';
import { TISSUE } from './scene3d.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------------- light microscopy ---------------- */
const LOBULE_ANGLES = [150, 200, 250, 300, 350, 30, null];  // degrees on a ring (hilum at 90°, bottom); null = central lobule

export function lmSVG(s, opts, t) {
  const P = TISSUE[opts.dark ? 'dark' : 'light'];
  const pol = opts.polarized && opts.congo;
  const r = prng(5);
  const C = { x: 280, y: 200 };
  const CAP = 160;
  const parts = [];
  const bg = pol ? '#060607' : 'none';
  parts.push(`<rect x="0" y="0" width="560" height="420" fill="${bg}"/>`);
  // capsule
  parts.push(`<circle cx="${C.x}" cy="${C.y}" r="${CAP}" fill="${pol ? 'rgba(40,40,44,0.3)' : P.capsuleFill}" stroke="${P.capsule}" stroke-width="5" opacity="${pol ? 0.4 : 1}"/>`);
  for (let k = 0; k < 26; k++) {
    const a = (k / 26) * Math.PI * 2;
    if (Math.abs(a - Math.PI / 2) < 0.28) continue;
    parts.push(`<ellipse cx="${(C.x + Math.cos(a) * (CAP - 3)).toFixed(1)}" cy="${(C.y + Math.sin(a) * (CAP - 3)).toFixed(1)}" rx="4.5" ry="1.8" transform="rotate(${((a * 180) / Math.PI + 90).toFixed(0)} ${(C.x + Math.cos(a) * (CAP - 3)).toFixed(1)} ${(C.y + Math.sin(a) * (CAP - 3)).toFixed(1)})" fill="${P.nucleus}" opacity="${pol ? 0.15 : 0.8}"/>`);
  }
  const dim = pol ? 0.18 : 1;
  const g = [];
  // arterioles at hilum
  const hy = C.y + CAP;
  const art = (x0, x1, w, hyal) => {
    const pathD = `M${x0},420 C${x0},${hy - 6} ${x1},${hy} ${x1},${hy - 46}`;
    let out = '';
    if (hyal > 0.05) out += `<path d="${pathD}" stroke="${P.hyaline}" stroke-width="${(w * (1 + 0.9 * hyal)).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
    out += `<path d="${pathD}" stroke="${P.arteriole}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
    out += `<path d="${pathD}" stroke="${P.lumen}" stroke-width="${Math.max(2, w * (0.45 - 0.3 * hyal)).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
    return out;
  };
  g.push(art(225, 266, 20, s.hyalAff));
  g.push(art(338, 296, 16, s.hyalEff));
  if (s.amyloidVessel > 0) g.push(amyBlobs(r, [[232, 400], [334, 400], [258, 372], [300, 372]], 9 * (0.6 + s.amyloidVessel), s, opts, P));

  const sclAll = s.globalSclerosed;
  if (sclAll) {
    g.push(`<circle cx="${C.x}" cy="${C.y + 12}" r="100" fill="${P.sclerosis}"/>`);
    for (let k = 0; k < 14; k++) g.push(`<path d="M${C.x - 80 + r() * 60},${C.y - 40 + r() * 100} q20,-10 40,0" stroke="${P.noduleRing}" stroke-width="1.2" fill="none" opacity="0.5"/>`);
    for (let k = 0; k < 6; k++) g.push(`<circle cx="${C.x - 60 + r() * 120}" cy="${C.y - 50 + r() * 120}" r="3" fill="${P.nucleus}" opacity="0.7"/>`);
  } else {
    const loopR = 13;
    const wall = Math.max(0.9, Math.min(6, 1.3 + 3 * ((s.gbmNm - 350) / 350)));
    const nod = Math.round(s.nodules);
    // mesangial stalks converging on the vascular pole
    LOBULE_ANGLES.forEach((deg) => {
      const a = deg === null ? 0 : (deg * Math.PI) / 180;
      const R0 = deg === null ? 0 : 76;
      const Lx = C.x + Math.cos(a) * R0, Ly = C.y + Math.sin(a) * R0;
      g.push(`<path d="M${C.x},${hy - 40} Q${C.x},${C.y + 40} ${Lx.toFixed(1)},${Ly.toFixed(1)}" stroke="${P.mesangium}" stroke-width="${(5 + 8 * s.mesangialMatrix).toFixed(1)}" fill="none" stroke-linecap="round" opacity="0.75"/>`);
    });
    LOBULE_ANGLES.forEach((deg, li) => {
      const a = deg === null ? 0 : (deg * Math.PI) / 180;
      const R0 = deg === null ? 0 : 76;
      const hasNod = li < nod;
      const Lx = C.x + Math.cos(a) * R0, Ly = C.y + Math.sin(a) * R0;
      const mesR = 9 + 15 * s.mesangialMatrix;
      const ringR = (hasNod ? 34 : 22) + mesR * 0.35;
      // loops around lobule centre
      for (let j = 0; j < 6; j++) {
        const b = a + (j / 6) * Math.PI * 2 + li;
        const x = Lx + Math.cos(b) * ringR, y = Ly + Math.sin(b) * ringR;
        const rr = r();
        const scl = rr < s.segSclerosis;
        if (scl) { g.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${loopR * 0.8}" fill="${P.sclerosis}"/>`); continue; }
        const lumen = s.endocapillary > 0.3 && rr < s.endocapillary ? P.mesangium : P.lumen;
        let w = wall;
        if (s.irregularity > 0) w *= 1 + s.irregularity * 1.2 * (r() - 0.35);
        g.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${loopR}" fill="${lumen}" stroke="${P.wall}" stroke-width="${Math.max(0.7, w).toFixed(2)}"/>`);
        if (s.lamellation > 0.25) g.push(`<path d="M${(x - loopR * 0.7).toFixed(1)},${y.toFixed(1)} a${loopR * 0.7},${loopR * 0.7} 0 0 1 ${loopR * 1.4},0" stroke="${P.nucleus}" stroke-width="0.8" fill="none" opacity="0.5"/>`);
        if (s.depSubendothelial > 0.3 && rr < s.depSubendothelial) g.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${loopR - 3}" fill="none" stroke="${P.ic}" stroke-width="2.6"/>`);
        if (s.endocapillary > 0.3 && rr < s.endocapillary) {
          for (let m = 0; m < 4; m++) g.push(`<circle cx="${(x + Math.cos(m * 1.6 + rr * 9) * 5).toFixed(1)}" cy="${(y + Math.sin(m * 1.6 + rr * 9) * 5).toFixed(1)}" r="2.6" fill="${P.nucleus}"/>`);
        } else if (rr > 0.7) {
          g.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="5" ry="3.3" fill="${P.rbc}"/>`);
        }
        if (s.depSubepithelial > 0.05) {
          const n = Math.round(2 + 8 * s.depSubepithelial);
          for (let m = 0; m < n; m++) {
            const q = (m / n) * Math.PI * 2 + rr;
            g.push(`<circle cx="${(x + Math.cos(q) * (loopR + w / 2 + 1.4)).toFixed(1)}" cy="${(y + Math.sin(q) * (loopR + w / 2 + 1.4)).toFixed(1)}" r="1.5" fill="${P.ic}"/>`);
          }
        }
        if (s.amyloid > 0 && rr < s.amyloid * 0.7) g.push(amyBlobs(r, [[x + 6, y - 7], [x - 8, y + 5]], 5 + 4 * s.amyloid, s, opts, P));
      }
      // mesangium / nodule
      if (hasNod) {
        g.push(`<circle cx="${Lx.toFixed(1)}" cy="${Ly.toFixed(1)}" r="22" fill="${P.nodule}"/>`);
        for (const f of [17, 12, 7]) g.push(`<circle cx="${Lx.toFixed(1)}" cy="${Ly.toFixed(1)}" r="${f}" fill="none" stroke="${P.noduleRing}" stroke-width="1"/>`);
      } else {
        g.push(`<path d="${blob(Lx, Ly, mesR, r)}" fill="${P.mesangium}" opacity="0.9"/>`);
      }
      const nCells = Math.round(1 + 6 * s.mesangialCells);
      for (let m = 0; m < nCells; m++) g.push(`<circle cx="${(Lx + (r() - 0.5) * mesR * 1.2).toFixed(1)}" cy="${(Ly + (r() - 0.5) * mesR * 1.2).toFixed(1)}" r="2.6" fill="${P.nucleus}"/>`);
      if (s.depMesangial > 0) {
        const n = Math.round(2 + 6 * s.depMesangial);
        for (let m = 0; m < n; m++) g.push(`<circle cx="${(Lx + (r() - 0.5) * mesR * 1.4).toFixed(1)}" cy="${(Ly + (r() - 0.5) * mesR * 1.4).toFixed(1)}" r="1.7" fill="${P.ic}"/>`);
      }
      if (s.amyloid > 0) g.push(amyBlobs(r, [[Lx, Ly], [Lx + 6, Ly + 4], [Lx - 5, Ly - 5]], 6 + 9 * s.amyloid, s, opts, P));
    });
  }
  // crescent
  if (s.crescent > 0) {
    const n = Math.round(40 + 70 * s.crescent);
    const span = 0.35 + 0.5 * s.crescent;      // fraction of π covered
    for (let k = 0; k < n; k++) {
      const u0 = r();
      const a = Math.PI * (1.25 - span / 2 + span * u0);   // centred on the upper-left
      const thick = 26 * Math.sin(Math.PI * u0);
      const rad = CAP - 6 - r() * thick;
      g.push(`<circle cx="${(C.x + Math.cos(a) * rad).toFixed(1)}" cy="${(C.y + Math.sin(a) * rad).toFixed(1)}" r="4.5" fill="${P.crescent}" opacity="0.85"/><circle cx="${(C.x + Math.cos(a) * rad).toFixed(1)}" cy="${(C.y + Math.sin(a) * rad).toFixed(1)}" r="1.8" fill="${P.nucleus}"/>`);
    }
  }
  // protein and red cells in Bowman's space
  const leakN = Math.round(30 * s.proteinLeak);
  for (let k = 0; k < leakN && !pol; k++) { const a = r() * Math.PI * 2, rad = 128 + r() * 24; if (Math.sin(a) > 0.75) continue; g.push(`<circle cx="${(C.x + Math.cos(a) * rad).toFixed(1)}" cy="${(C.y + Math.sin(a) * rad).toFixed(1)}" r="1.4" fill="${P.protein}"/>`); }
  const rbcN = Math.round(10 * s.rbcLeak);
  for (let k = 0; k < rbcN && !pol; k++) { const a = r() * Math.PI * 2, rad = 128 + r() * 26; if (Math.sin(a) > 0.75) continue; g.push(`<ellipse cx="${(C.x + Math.cos(a) * rad).toFixed(1)}" cy="${(C.y + Math.sin(a) * rad).toFixed(1)}" rx="4" ry="2.6" fill="${P.rbc}"/>`); }

  parts.push(`<g opacity="${dim}">${g.filter((x) => !x.includes('data-amy')).join('')}</g>`);
  parts.push(g.filter((x) => x.includes('data-amy')).join(''));

  // labels: left column (anchor end, x ≤ 104) and right column (anchor start, x ≥ 456)
  const ink = pol ? '#c3c2b7' : 'var(--text-secondary)';
  const lab = (side, y, px, py, text) => {
    const x = side === 'L' ? 104 : 456;
    const tx = side === 'L' ? x - 4 : x + 4;
    return `<line x1="${x}" y1="${y}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" stroke="${ink}" stroke-width="0.8"/><circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="1.8" fill="${ink}"/><text x="${tx}" y="${y + 4}" text-anchor="${side === 'L' ? 'end' : 'start'}" class="svg-label" fill="${ink}">${esc(text)}</text>`;
  };
  const L = [];
  L.push(lab('R', 40, C.x + Math.cos(-0.95) * CAP, C.y + Math.sin(-0.95) * CAP, t('lm.capsule')));
  L.push(lab('R', 330, C.x + Math.cos(0.75) * (CAP - 14), C.y + Math.sin(0.75) * (CAP - 14), t('lm.bowman')));
  L.push(lab('L', 404, 226, 404, t('lm.aff')));
  L.push(lab('R', 404, 336, 404, t('lm.eff')));
  if (!sclAll) {
    const a0 = (LOBULE_ANGLES[5] * Math.PI) / 180;
    L.push(lab('R', 150, C.x + Math.cos(a0) * 76 + 30, C.y + Math.sin(a0) * 76 + 8, t('lm.loop')));
    const a1 = (LOBULE_ANGLES[1] * Math.PI) / 180;
    const nodLabel = Math.round(s.nodules) > 1;
    L.push(lab('L', 120, C.x + Math.cos(a1) * 76, C.y + Math.sin(a1) * 76, nodLabel ? t('lm.kw') : t('lm.mesangium')));
    if (s.depSubendothelial > 0.5) L.push(lab('L', 250, C.x + Math.cos(Math.PI * 0.95) * 76 - 22, C.y + Math.sin(Math.PI * 0.95) * 76 + 6, t('lm.wire')));
  } else {
    L.push(lab('L', 250, C.x - 70, C.y + 30, t('lm.sclerosed')));
  }
  if (s.crescent > 0.3) L.push(lab('L', 40, C.x + Math.cos(Math.PI * 1.25) * (CAP - 14), C.y + Math.sin(Math.PI * 1.25) * (CAP - 14), t('lm.crescent')));
  parts.push(L.join(''));
  return `<svg viewBox="0 0 560 420" role="img" aria-label="${esc(t('view.lm'))}" class="lm-svg">${parts.join('')}</svg>`;
}

function blob(x, y, R, r) {
  const n = 9; let d = '';
  for (let k = 0; k <= n; k++) {
    const a = (k / n) * Math.PI * 2;
    const rr = R * (0.8 + 0.4 * r());
    d += `${k ? 'L' : 'M'}${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`;
  }
  return d + 'Z';
}

function amyBlobs(r, centres, R, s, opts, P) {
  const pol = opts.polarized && opts.congo;
  let out = '';
  for (const [x, y] of centres) {
    if (pol) {
      // fibril bundles as short strokes; brightness from birefringence
      for (let k = 0; k < 6; k++) {
        const phi = r() * 180;
        const I = congoBirefringence(phi, opts.angle || 0);
        const cx = x + (r() - 0.5) * R * 1.2, cy = y + (r() - 0.5) * R * 1.2;
        const dx = Math.cos((phi * Math.PI) / 180) * R * 0.45, dy = Math.sin((phi * Math.PI) / 180) * R * 0.45;
        if (I < 0.03) continue;
        out += `<line data-amy="1" x1="${(cx - dx).toFixed(1)}" y1="${(cy - dy).toFixed(1)}" x2="${(cx + dx).toFixed(1)}" y2="${(cy + dy).toFixed(1)}" stroke="${P.polar}" stroke-width="3" stroke-linecap="round" opacity="${(0.2 + 0.8 * I).toFixed(2)}"/>`;
      }
    } else {
      out += `<path data-amy="1" d="${blob(x, y, R, r)}" fill="${opts.congo ? P.amyloid : P.amyloidPale}" opacity="0.88"/>`;
    }
  }
  return out;
}

/* ---------------- electron microscopy (to scale) ---------------- */
const NM_PX = 0.11;   // px per nm

export function emSVG(s, opts, t) {
  const r = prng(8);
  const W = 540, H = 270;
  const x0 = 14, x1 = 392;
  const yE = 58;                    // endothelium top
  const yG = 72;                    // GBM top
  const h = s.gbmNm * NM_PX;
  const normalH = 350 * NM_PX;
  const col = { bg: '#e6e4df', lumen: '#d7d4cd', endo: '#7d7a74', gbm: '#8f8c86', densa: '#6f6c66', podo: '#9d9a93', dep: '#1f1e1c', urinary: '#efede8', ink: '#2f2e2b', ghost: '#2a78d6', amy: '#5e5b56' };
  const out = [];
  out.push(`<rect x="0" y="0" width="${W}" height="${H}" rx="8" fill="${col.bg}"/>`);
  out.push(`<rect x="${x0}" y="10" width="${x1 - x0}" height="${yE - 10}" fill="${col.lumen}"/>`);
  out.push(`<ellipse cx="${x0 + 90}" cy="30" rx="44" ry="13" fill="#b9b5ad"/>`);   // red cell
  // GBM band with irregular borders
  const steps = 64;
  const top = [], bot = [];
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps;
    const irr = s.irregularity || 0;
    const fac = 1 + irr * (0.55 * Math.sin(x / 21) + 0.25 * Math.sin(x / 7.3 + 1));
    const hh = Math.max(10, h * fac);
    top.push([x, yG]);
    bot.push([x, yG + hh]);
  }
  const bandD = 'M' + top.map((p) => p.join(',')).join(' L') + ' L' + bot.reverse().map((p) => p.join(',')).join(' L') + 'Z';
  bot.reverse();
  out.push(`<path d="${bandD}" fill="${col.gbm}"/>`);
  // lamina densa / lamellation
  if (s.lamellation > 0.02) {
    const n = Math.round(2 + 6 * s.lamellation);
    for (let k = 0; k < n; k++) {
      let d = '';
      for (let i = 0; i <= steps; i++) {
        const [x, yb] = bot[i];
        const yy = yG + (yb - yG) * ((k + 1) / (n + 1)) + Math.sin(x / (9 + k * 2) + k) * 2.4 * s.lamellation;
        d += `${i ? 'L' : 'M'}${x.toFixed(1)},${yy.toFixed(1)}`;
      }
      out.push(`<path d="${d}" stroke="${col.densa}" stroke-width="1.6" fill="none"/>`);
    }
    for (let k = 0; k < 30 * s.lamellation; k++) {
      const i = Math.floor(r() * steps);
      const [x, yb] = bot[i];
      out.push(`<circle cx="${x.toFixed(1)}" cy="${(yG + (yb - yG) * (0.2 + 0.6 * r())).toFixed(1)}" r="1.6" fill="${col.urinary}" opacity="0.8"/>`);
    }
  } else {
    let d = '';
    for (let i = 0; i <= steps; i++) { const [x, yb] = bot[i]; d += `${i ? 'L' : 'M'}${x.toFixed(1)},${(yG + (yb - yG) * 0.5).toFixed(1)}`; }
    out.push(`<path d="${d}" stroke="${col.densa}" stroke-width="${Math.max(2, h * 0.35).toFixed(1)}" fill="none" opacity="0.55"/>`);
  }
  // endothelium with fenestrae
  for (let x = x0; x < x1; x += 22) out.push(`<rect x="${x}" y="${yE}" width="16" height="6" rx="2" fill="${col.endo}"/>`);
  // subendothelial deposits
  if (s.depSubendothelial > 0.05) {
    const n = Math.round(1 + 9 * s.depSubendothelial);
    for (let k = 0; k < n; k++) {
      const x = x0 + 20 + r() * (x1 - x0 - 40);
      out.push(`<ellipse cx="${x.toFixed(1)}" cy="${yG + 3}" rx="${(7 + 6 * r()).toFixed(1)}" ry="${(4 + 3 * s.depSubendothelial).toFixed(1)}" fill="${col.dep}"/>`);
    }
  }
  // amyloid fibrils in GBM
  if (s.amyloid > 0) {
    const n = Math.round(120 * s.amyloid);
    for (let k = 0; k < n; k++) {
      const i = Math.floor(r() * steps);
      const [x, yb] = bot[i];
      const y = yG + (yb - yG) * r();
      const a = r() * Math.PI;
      out.push(`<line x1="${(x - Math.cos(a) * 4).toFixed(1)}" y1="${(y - Math.sin(a) * 4).toFixed(1)}" x2="${(x + Math.cos(a) * 4).toFixed(1)}" y2="${(y + Math.sin(a) * 4).toFixed(1)}" stroke="${col.amy}" stroke-width="0.9"/>`);
    }
  }
  // podocyte foot processes
  const eff = s.effacement || 0;
  const fp = 14 + 46 * eff * eff;
  const footTop = (x) => { const i = Math.round(((x - x0) / (x1 - x0)) * steps); return bot[Math.max(0, Math.min(steps, i))][1]; };
  if (eff > 0.85) {
    const xs = [];
    for (let x = x0; x <= x1; x += 6) xs.push(x);
    let d = `M${x0},${footTop(x0)}` + xs.map((x) => ` L${x},${footTop(x).toFixed(1)}`).join('');
    d += xs.reverse().map((x) => ` L${x},${(footTop(x) + 14).toFixed(1)}`).join('') + 'Z';
    out.push(`<path d="${d}" fill="${col.podo}"/>`);
  } else {
    for (let x = x0; x < x1 - 6; x += fp + 5) {
      const w = Math.min(fp, x1 - x);
      const yt = footTop(x + w / 2);
      out.push(`<rect x="${x.toFixed(1)}" y="${yt.toFixed(1)}" width="${w.toFixed(1)}" height="14" rx="5" fill="${col.podo}"/>`);
      out.push(`<line x1="${(x + w + 2.5).toFixed(1)}" y1="${(yt + 1).toFixed(1)}" x2="${(x + w + 2.5).toFixed(1)}" y2="${(yt + 4).toFixed(1)}" stroke="${col.ink}" stroke-width="0.8"/>`);
    }
  }
  // subepithelial deposits (humps) and amyloid spicules
  if (s.depSubepithelial > 0.05) {
    const n = Math.round(2 + 14 * s.depSubepithelial);
    for (let k = 0; k < n; k++) {
      const x = x0 + 12 + ((x1 - x0 - 24) * (k + r() * 0.6)) / n;
      const yt = footTop(x);
      out.push(`<ellipse cx="${x.toFixed(1)}" cy="${(yt - 2).toFixed(1)}" rx="6" ry="${(4 + 3 * s.depSubepithelial).toFixed(1)}" fill="${col.dep}"/>`);
      if (s.depSubepithelial > 0.6) out.push(`<rect x="${(x + 7).toFixed(1)}" y="${(yt - 8).toFixed(1)}" width="3" height="9" fill="${col.gbm}"/>`);
    }
  }
  if (s.amyloid > 0.2) {
    for (let k = 0; k < 18 * s.amyloid; k++) {
      const x = x0 + 10 + r() * (x1 - x0 - 20);
      const yt = footTop(x);
      out.push(`<line x1="${x.toFixed(1)}" y1="${yt.toFixed(1)}" x2="${(x + (r() - 0.5) * 3).toFixed(1)}" y2="${(yt + 10 + r() * 6).toFixed(1)}" stroke="${col.amy}" stroke-width="1"/>`);
    }
  }
  // normal ghost outline
  out.push(`<rect x="${x0}" y="${yG}" width="${x1 - x0}" height="${normalH.toFixed(1)}" fill="none" stroke="${col.ghost}" stroke-width="1.2" stroke-dasharray="5 4"/>`);
  // urinary space label area
  const ink = col.ink;
  const maxBot = Math.max(...bot.map((p) => p[1]));
  const yU = Math.min(H - 34, maxBot + 30);
  const txt = (x, y, s2, anchor = 'start', extra = '') => `<text x="${x}" y="${y}" class="svg-label" fill="${ink}" text-anchor="${anchor}" ${extra}>${esc(s2)}</text>`;
  out.push(txt(x0 + 150, 24, t('em.lumen')));
  out.push(txt(x0 + 150, yE - 4, t('em.endo')));
  out.push(txt(x0 + 4, yU + 6, t('em.urinary')));
  out.push(txt(x0 + 150, yU + 6, t('em.podo')));
  // measurement bracket
  const xb = x1 + 10;
  const meanBot = yG + h;
  out.push(`<path d="M${xb},${yG} h6 V${meanBot.toFixed(1)} h-6" stroke="${ink}" fill="none" stroke-width="1"/>`);
  out.push(txt(xb + 10, yG + 10, t('em.gbm'), 'start', 'font-weight="600"'));
  out.push(txt(xb + 10, yG + 24, `≈ ${Math.round(s.gbmNm / 10) * 10} nm`));
  out.push(`<line x1="${xb + 10}" y1="${yG + 36}" x2="${xb + 24}" y2="${yG + 36}" stroke="${col.ghost}" stroke-width="1.2" stroke-dasharray="4 3"/>`);
  out.push(txt(xb + 28, yG + 40, t('em.normal')));
  // deposit legend
  let ly = yG + 58;
  if (s.depSubendothelial > 0.05) { out.push(`<ellipse cx="${xb + 16}" cy="${ly - 4}" rx="6" ry="4" fill="${col.dep}"/>`); out.push(txt(xb + 28, ly, t('em.subendo'))); ly += 16; }
  if (s.depSubepithelial > 0.05) { out.push(`<ellipse cx="${xb + 16}" cy="${ly - 4}" rx="6" ry="4" fill="${col.dep}"/>`); out.push(txt(xb + 28, ly, t('em.subepi'))); ly += 16; }
  // mesangium inset
  const mx = xb + 6, my = Math.max(ly + 6, 168), mw = W - mx - 12, mh = H - my - 14;
  if (mh > 40) {
    out.push(`<rect x="${mx}" y="${my}" width="${mw}" height="${mh}" rx="6" fill="#cfccc5"/>`);
    const mm = 0.15 + 0.6 * (s.mesangialMatrix || 0);
    out.push(`<rect x="${mx + 6}" y="${my + 18}" width="${(mw - 12).toFixed(1)}" height="${(mh - 24).toFixed(1)}" rx="5" fill="#a9a59d" opacity="${(0.4 + mm).toFixed(2)}"/>`);
    out.push(`<ellipse cx="${mx + mw / 2}" cy="${my + mh / 2 + 8}" rx="14" ry="9" fill="#5d5a54"/>`);
    out.push(txt(mx + 6, my + 13, t('em.mesangium')));
    if (s.depMesangial > 0) for (let k = 0; k < 2 + 10 * s.depMesangial; k++) out.push(`<circle cx="${(mx + 10 + r() * (mw - 20)).toFixed(1)}" cy="${(my + 22 + r() * (mh - 30)).toFixed(1)}" r="${(2 + 2 * r()).toFixed(1)}" fill="${col.dep}"/>`);
    if (s.amyloid > 0) for (let k = 0; k < 50 * s.amyloid; k++) { const x = mx + 8 + r() * (mw - 16), y = my + 22 + r() * (mh - 30), a = r() * Math.PI; out.push(`<line x1="${(x - Math.cos(a) * 4).toFixed(1)}" y1="${(y - Math.sin(a) * 4).toFixed(1)}" x2="${(x + Math.cos(a) * 4).toFixed(1)}" y2="${(y + Math.sin(a) * 4).toFixed(1)}" stroke="${col.amy}" stroke-width="0.9"/>`); }
    if (s.nodules > 0) out.push(`<circle cx="${mx + mw / 2}" cy="${my + mh / 2 + 8}" r="${Math.min(mw, mh) * 0.36}" fill="none" stroke="#6f6c66" stroke-width="1" stroke-dasharray="2 2"/>`);
  }
  // scale bar
  const sb = 500 * NM_PX;
  out.push(`<line x1="${x0 + 4}" y1="${H - 12}" x2="${x0 + 4 + sb}" y2="${H - 12}" stroke="${ink}" stroke-width="2"/>`);
  out.push(txt(x0 + 10 + sb, H - 8, t('em.scale')));
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t('em.aria', Math.round(s.gbmNm)))}" class="em-svg">${out.join('')}</svg>`;
}

/* ---------------- biopsy strip ---------------- */
export function biopsySVG(biopsy, selectedKind, opts, t) {
  const P = TISSUE[opts.dark ? 'dark' : 'light'];
  const n = biopsy.length;
  const cols = 10, cell = 34;
  const out = [];
  let firstSel = biopsy.indexOf(selectedKind);
  biopsy.forEach((k, i) => {
    const x = 18 + (i % cols) * cell, y = 18 + Math.floor(i / cols) * cell;
    const sel = i === firstSel;
    out.push(`<g class="bx" data-kind="${k}" data-i="${i}" tabindex="0" role="button" aria-pressed="${sel}" aria-label="${esc(t('biopsy.item', i + 1, t('biopsy.kind.' + k)))}">`);
    out.push(`<circle cx="${x}" cy="${y}" r="16" fill="transparent"/>`);
    if (sel) out.push(`<circle cx="${x}" cy="${y}" r="15.5" fill="none" stroke="var(--text-primary)" stroke-width="2"/>`);
    out.push(glyph(k, x, y, P));
    out.push('</g>');
  });
  return `<svg viewBox="0 0 ${cols * cell + 4} ${Math.ceil(n / cols) * cell + 4}" class="biopsy-svg">${out.join('')}</svg>`;
}

export function glyph(k, x, y, P) {
  if (k === 'sclerosed') return `<circle cx="${x}" cy="${y}" r="11" fill="${P.sclerosis}" stroke="${P.capsule}" stroke-width="1.5"/>`;
  let s = `<circle cx="${x}" cy="${y}" r="11" fill="${P.lumen}" stroke="${P.capsule}" stroke-width="1.5"/>`;
  for (let j = 0; j < 5; j++) {
    const a = (j / 5) * Math.PI * 2;
    s += `<circle cx="${(x + Math.cos(a) * 5).toFixed(1)}" cy="${(y + Math.sin(a) * 5).toFixed(1)}" r="3.2" fill="none" stroke="${P.wall}" stroke-width="${k === 'normal' ? 1 : 1.6}"/>`;
  }
  if (k === 'lesion') s += `<circle cx="${x}" cy="${y}" r="2.6" fill="${P.mesangium}"/>`;
  if (k === 'prolif') for (let j = 0; j < 7; j++) { const a = j * 0.9; s += `<circle cx="${(x + Math.cos(a) * 4.5).toFixed(1)}" cy="${(y + Math.sin(a) * 4.5).toFixed(1)}" r="1.6" fill="${P.nucleus}"/>`; }
  return s;
}
