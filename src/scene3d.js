/*
 * Dependency-free 3D glomerulus on a 2D canvas (depth-sorted sprites).
 * Geometry is built once from a seeded PRNG; the model's scene parameters
 * (src/model.js → snapshot().scene) only change how each element is drawn.
 */
import { prng, congoBirefringence } from './model.js';

const TAU = Math.PI * 2;

export const TISSUE = {
  light: {
    bg: '#fcfcfb', capsule: '#9b8f96', capsuleFill: 'rgba(240,226,232,0.35)',
    wall: '#c4537e', lumen: '#fbecf1', rbc: '#c8323c', mesangium: '#b591d6', nucleus: '#4a2a7a',
    ic: '#e39522', amyloid: '#ec8a78', amyloidPale: '#f3c3bb', polar: '#a5e05a',
    nodule: '#eab3cc', noduleRing: '#c9789f', hyaline: '#f4b6d0', sclerosis: '#d8c2cc',
    crescent: '#a98bd1', arteriole: '#a8344d', protein: '#2a78d6', fog: [252, 252, 251],
  },
  dark: {
    bg: '#1a1a19', capsule: '#8c8288', capsuleFill: 'rgba(80,60,70,0.25)',
    wall: '#e0709a', lumen: '#3a2830', rbc: '#e04b55', mesangium: '#a782cc', nucleus: '#c9b2f0',
    ic: '#f2a63a', amyloid: '#f0927f', amyloidPale: '#b98479', polar: '#a5e05a',
    nodule: '#d79ab8', noduleRing: '#f0b4d0', hyaline: '#f4b6d0', sclerosis: '#8f7f87',
    crescent: '#a98bd1', arteriole: '#d0546e', protein: '#3987e5', fog: [26, 26, 25],
  },
};

function v(x, y, z) { return { x, y, z }; }
function add(a, b) { return v(a.x + b.x, a.y + b.y, a.z + b.z); }
function sub(a, b) { return v(a.x - b.x, a.y - b.y, a.z - b.z); }
function mul(a, s) { return v(a.x * s, a.y * s, a.z * s); }
function len(a) { return Math.hypot(a.x, a.y, a.z); }
function norm(a) { const l = len(a) || 1; return mul(a, 1 / l); }
function cross(a, b) { return v(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x); }
function lerp(a, b, t) { return add(a, mul(sub(b, a), t)); }

/** Build fixed geometry (y up; vascular pole at the bottom). */
export function buildGeometry(seed = 42) {
  const r = prng(seed);
  const H = v(0, -0.92, 0);
  // lobule directions: Fibonacci sphere, away from the hilum
  const dirs = [];
  const N = 12;
  for (let i = 0; i < N; i++) {
    const y = 1 - (2 * (i + 0.5)) / N;
    const rad = Math.sqrt(1 - y * y);
    const th = i * 2.399963;
    const d = v(Math.cos(th) * rad, y, Math.sin(th) * rad);
    if (d.y > -0.55) dirs.push(d);
  }
  const lobules = dirs.slice(0, 8).map((u, li) => {
    const center = add(mul(u, 0.46), v(0, -0.05, 0));
    const stalk = [];
    for (let k = 0; k <= 7; k++) stalk.push(lerp(lerp(H, v(0, -0.35, 0), Math.min(1, k / 3)), center, k / 7));
    const loops = [];
    for (let j = 0; j < 6; j++) {
      const f = 0.55 + 0.45 * r();
      const b = lerp(H, center, f);
      const jitter = norm(v(r() - 0.5, r() - 0.5, r() - 0.5));
      const p = mul(norm(add(u, mul(jitter, 0.55))), 0.86 + 0.08 * r());
      const w = mul(norm(cross(sub(p, b), jitter)), 0.12 + 0.04 * r());
      const pts = [];
      const S = 40;
      for (let s = 0; s <= S; s++) {
        const t = s / S;
        pts.push({ idx: s, pos: add(add(b, mul(sub(p, b), Math.sin(Math.PI * t))), mul(w, Math.cos(Math.PI * t))), noise: r(), rbc: r() < 0.5, fib: r() * 180, amy: r() });
      }
      loops.push({ pts, rank: r(), lobule: li });
    }
    return { u, center, stalk, loops, rank: r() };
  });
  // arterioles
  const aff = [], eff = [];
  for (let k = 0; k <= 36; k++) {
    const t = k / 36;
    aff.push(lerp(lerp(v(-0.55, -1.85, 0.15), v(-0.18, -1.15, 0.05), t), H, t * t));
    eff.push(lerp(H, lerp(v(0.15, -1.15, -0.05), v(0.5, -1.85, -0.15), t), t));
  }
  // crescent cells (inside Bowman's capsule, on one side)
  const crescentDir = norm(v(-0.7, 0.45, 0.55));
  const crescent = [];
  for (let k = 0; k < 900; k++) {
    const d = norm(v(r() - 0.5, r() - 0.5, r() - 0.5));
    const dir = norm(add(crescentDir, mul(d, 0.85)));
    if (dir.x * crescentDir.x + dir.y * crescentDir.y + dir.z * crescentDir.z < 0.8) continue;
    crescent.push({ pos: mul(dir, 1.06 + 0.16 * r()), rank: r() });
  }
  // extra nuclei slots
  const nuclei = [];
  for (const L of lobules) {
    for (const loop of L.loops) for (let s = 2; s < loop.pts.length - 2; s += 3) {
      const q = loop.pts[s].pos;
      nuclei.push({ pos: add(q, mul(norm(v(r() - 0.5, r() - 0.5, r() - 0.5)), 0.03)), rank: r(), kind: 'endo' });
    }
    for (const q of L.stalk.slice(3)) for (let m = 0; m < 3; m++) {
      nuclei.push({ pos: add(q, mul(norm(v(r() - 0.5, r() - 0.5, r() - 0.5)), 0.05 + 0.03 * r())), rank: r(), kind: 'mes' });
    }
  }
  return { H, lobules, aff, eff, crescent, nuclei, urinaryPole: v(0, 1.3, 0) };
}

export class Glomerulus3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.geo = buildGeometry();
    this.yaw = 0.6; this.pitch = 0.18;
    this.auto = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.scene = null; this.opts = {};
    this.particles = [];
    this.rand = prng(99);
    this.running = false;
    this.last = 0;
    this._bind();
  }

  _bind() {
    const c = this.canvas;
    let drag = null;
    c.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, yaw: this.yaw, pitch: this.pitch }; c.setPointerCapture(e.pointerId); });
    c.addEventListener('pointermove', (e) => {
      if (!drag) return;
      this.yaw = drag.yaw + (e.clientX - drag.x) * 0.01;
      this.pitch = Math.max(-1.2, Math.min(1.2, drag.pitch + (e.clientY - drag.y) * 0.01));
      this.draw();
    });
    const end = () => { drag = null; };
    c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
    c.addEventListener('keydown', (e) => {
      const k = { ArrowLeft: [-0.15, 0], ArrowRight: [0.15, 0], ArrowUp: [0, -0.15], ArrowDown: [0, 0.15] }[e.key];
      if (!k) return;
      e.preventDefault();
      this.yaw += k[0]; this.pitch = Math.max(-1.2, Math.min(1.2, this.pitch + k[1]));
      this.draw();
    });
  }

  set(scene, opts) { this.scene = scene; this.opts = opts; this.draw(); }

  start() {
    if (this.running) return;
    this.running = true;
    const loop = (ts) => {
      if (!this.running) return;
      const dt = this.last ? Math.min(0.05, (ts - this.last) / 1000) : 0;
      this.last = ts;
      if (this.auto) this.yaw += dt * 0.25;
      this._stepParticles(dt);
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }
  stop() { this.running = false; this.last = 0; cancelAnimationFrame(this.raf); }

  _stepParticles(dt) {
    const s = this.scene;
    if (!s || this.opts.polarized) { this.particles.length = 0; return; }
    const r = this.rand;
    const spawn = (rate, kind) => {
      let n = rate * dt * 40;
      while (n > 0) {
        if (r() < n) {
          const L = this.geo.lobules[Math.floor(r() * this.geo.lobules.length)];
          const loop = L.loops[Math.floor(r() * L.loops.length)];
          const p = loop.pts[Math.floor(r() * loop.pts.length)].pos;
          this.particles.push({ kind, pos: { ...p }, vel: mul(norm(p), 0.35 + 0.2 * r()), age: 0 });
        }
        n -= 1;
      }
    };
    if (!s.globalSclerosed) { spawn(s.rbcLeak, 'rbc'); spawn(s.proteinLeak * 1.4, 'protein'); }
    const pole = this.geo.urinaryPole;
    for (const q of this.particles) {
      q.age += dt;
      const d = len(q.pos);
      if (d > 1.05) q.vel = add(mul(q.vel, 0.9), mul(norm(sub(pole, q.pos)), 0.06));
      q.pos = add(q.pos, mul(q.vel, dt));
    }
    this.particles = this.particles.filter((q) => q.age < 3.2 && len(q.pos) < 1.45).slice(-260);
  }

  draw() {
    const s = this.scene;
    if (!s) return;
    const c = this.canvas, ctx = this.ctx;
    const dpr = window.devicePixelRatio || 1;
    const W = c.clientWidth, Hh = c.clientHeight;
    if (c.width !== Math.round(W * dpr) || c.height !== Math.round(Hh * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(Hh * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const dark = this.opts.dark;
    const P = TISSUE[dark ? 'dark' : 'light'];
    const pol = this.opts.polarized && this.opts.congo;
    ctx.fillStyle = pol ? '#060607' : P.bg;
    ctx.fillRect(0, 0, W, Hh);

    const scale = Math.min(W, Hh) * 0.33;
    const cx = W / 2, cy = Hh / 2 - Math.min(W, Hh) * 0.02;
    const cyw = Math.cos(this.yaw), syw = Math.sin(this.yaw), cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    const D = 4.2;
    const proj = (p) => {
      const x1 = p.x * cyw + p.z * syw;
      const z1 = -p.x * syw + p.z * cyw;
      const y2 = p.y * cp - z1 * sp;
      const z2 = p.y * sp + z1 * cp;
      const k = D / (D - z2);
      return { x: cx + x1 * scale * k, y: cy - y2 * scale * k, z: z2, k };
    };
    const fog = (hex, z, alpha = 1) => {
      const t = Math.max(0, Math.min(0.55, (0.6 - z) * 0.32));
      const [r, g, b] = hexRgb(hex);
      const f = pol ? [6, 6, 7] : P.fog;
      return `rgba(${Math.round(r + (f[0] - r) * t)},${Math.round(g + (f[1] - g) * t)},${Math.round(b + (f[2] - b) * t)},${alpha})`;
    };

    // Bowman's capsule (back half as a filled disc)
    const cap0 = proj(v(0, 0, 0));
    const capR = 1.3 * scale * cap0.k;
    ctx.beginPath(); ctx.arc(cap0.x, cap0.y, capR, 0, TAU);
    ctx.fillStyle = pol ? 'rgba(40,40,44,0.25)' : P.capsuleFill; ctx.fill();

    const items = [];
    const push = (z, fn) => items.push({ z, fn });
    const sclAll = s.globalSclerosed;
    const wallW = Math.max(0.8, Math.min(5, 1.1 + 2.4 * ((s.gbmNm - 350) / 350) + (s.gbmNm < 300 ? -0.4 : 0)));
    const capR0 = 0.066;
    const g = this.geo;
    const amyAngle = this.opts.angle || 0;
    const dim = pol ? 0.18 : 1;

    // loops: one depth item per loop, drawn in passes (wall → lumen → details) so it reads as a tube
    for (const L of g.lobules) {
      for (const loop of L.loops) {
        const sclLoop = sclAll || loop.rank < s.segSclerosis;
        const pts = loop.pts.map((q) => ({ q, pp: proj(sclAll ? lerp(q.pos, L.center, 0.35) : q.pos) }));
        const zMean = pts.reduce((a, b) => a + b.pp.z, 0) / pts.length;
        push(zMean, () => {
          ctx.globalAlpha = dim;
          const radOf = (pp) => capR0 * scale * pp.k * (sclLoop ? 0.72 : 1);
          const wallOf = (q, pp) => {
            let w = wallW;
            if (s.irregularity > 0) w *= 1 + s.irregularity * 0.66 * Math.sin(q.idx * 0.7 + q.noise * 6);
            return Math.max(0.7, w) * pp.k * 1.15;
          };
          // pass 1: outer wall (or sclerosed solid)
          ctx.fillStyle = fog(sclLoop ? P.sclerosis : P.wall, zMean);
          for (const { pp } of pts) { ctx.beginPath(); ctx.arc(pp.x, pp.y, radOf(pp), 0, TAU); ctx.fill(); }
          if (!sclLoop) {
            // pass 2: lumen
            for (const { q, pp } of pts) {
              const inner = Math.max(1, radOf(pp) - wallOf(q, pp));
              ctx.beginPath(); ctx.arc(pp.x, pp.y, inner, 0, TAU);
              ctx.fillStyle = fog(s.endocapillary > 0.3 && loop.rank < s.endocapillary ? P.mesangium : P.lumen, pp.z); ctx.fill();
            }
            // pass 3: details
            for (const { q, pp } of pts) {
              const rad = radOf(pp), inner = Math.max(1, rad - wallOf(q, pp));
              if (s.lamellation > 0.25 && q.idx % 4 === 0) {
                ctx.beginPath(); ctx.arc(pp.x, pp.y, (rad + inner) / 2, 0.4, 2.8 + q.noise * 2.5);
                ctx.lineWidth = 0.8; ctx.strokeStyle = fog(P.nucleus, pp.z, 0.5); ctx.stroke();
              }
              if (s.depSubendothelial > 0.3 && loop.rank < s.depSubendothelial && q.idx % 2 === 0) {
                ctx.beginPath(); ctx.arc(pp.x, pp.y, Math.max(1, inner - 0.8), 0, TAU);
                ctx.lineWidth = 1.6 * pp.k; ctx.strokeStyle = fog(P.ic, pp.z); ctx.stroke();
              }
              if (s.endocapillary > 0.3 && loop.rank < s.endocapillary) {
                if (q.idx % 3 === 0) {
                  ctx.fillStyle = fog(P.nucleus, pp.z);
                  for (let m = 0; m < 2; m++) {
                    const a = q.noise * 9 + m * 3.1;
                    ctx.beginPath(); ctx.arc(pp.x + Math.cos(a) * inner * 0.4, pp.y + Math.sin(a) * inner * 0.4, rad * 0.2, 0, TAU); ctx.fill();
                  }
                }
              } else if (q.rbc && q.idx % 7 === 3) {
                ctx.beginPath(); ctx.ellipse(pp.x, pp.y, inner * 0.6, inner * 0.4, q.noise * 3, 0, TAU);
                ctx.fillStyle = fog(P.rbc, pp.z); ctx.fill();
              }
              if (s.depSubepithelial > 0.05 && q.noise < s.depSubepithelial && q.idx % 2 === 0) {
                ctx.fillStyle = fog(P.ic, pp.z);
                for (let m = 0; m < 2; m++) {
                  const a = q.noise * 13 + m * 3.14;
                  ctx.beginPath(); ctx.arc(pp.x + Math.cos(a) * rad, pp.y + Math.sin(a) * rad, Math.max(1, rad * 0.15), 0, TAU); ctx.fill();
                }
              }
            }
          }
          ctx.globalAlpha = 1;
          if (s.amyloid > 0) for (const { q, pp } of pts) if (q.amy < s.amyloid * 0.75 && q.idx % 3 === 0) this._amyloid(ctx, pp, radOf(pp) * 0.9, q.fib, amyAngle, P, fog);
        });
      }
      // mesangial stalk
      const mesR = 0.05 + 0.08 * s.mesangialMatrix;
      L.stalk.forEach((q, k) => {
        if (k < 2) return;
        const pp = proj(q);
        const rad = mesR * scale * pp.k;
        push(pp.z, () => {
          ctx.globalAlpha = dim;
          ctx.beginPath(); ctx.arc(pp.x, pp.y, rad, 0, TAU);
          ctx.fillStyle = fog(sclAll ? P.sclerosis : P.mesangium, pp.z, 0.92); ctx.fill();
          if (s.depMesangial > 0) {
            ctx.fillStyle = fog(P.ic, pp.z);
            const n = Math.round(2 + 5 * s.depMesangial);
            for (let m = 0; m < n; m++) {
              const a = k * 1.7 + m * 2.4;
              ctx.beginPath(); ctx.arc(pp.x + Math.cos(a) * rad * 0.55, pp.y + Math.sin(a) * rad * 0.55, Math.max(1, rad * 0.16), 0, TAU); ctx.fill();
            }
          }
          ctx.globalAlpha = 1;
          if (s.amyloid > 0) this._amyloid(ctx, pp, rad * (0.9 + s.amyloid * 0.6), k * 37 + L.rank * 180, amyAngle, P, fog);
        });
      });
    }
    // KW nodules
    const nod = Math.round(s.nodules);
    g.lobules.slice().sort((a, b) => a.rank - b.rank).slice(0, nod).forEach((L) => {
      const pp = proj(L.center);
      const rad = 0.2 * scale * pp.k;
      push(pp.z + 0.01, () => {
        ctx.globalAlpha = dim;
        ctx.beginPath(); ctx.arc(pp.x, pp.y, rad, 0, TAU);
        ctx.fillStyle = fog(P.nodule, pp.z); ctx.fill();
        for (const f of [0.75, 0.5, 0.28]) {
          ctx.beginPath(); ctx.arc(pp.x, pp.y, rad * f, 0, TAU);
          ctx.lineWidth = 1; ctx.strokeStyle = fog(P.noduleRing, pp.z, 0.7); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      });
    });
    // nuclei (mesangial and endocapillary cells)
    for (const n of g.nuclei) {
      const show = n.kind === 'mes' ? n.rank < s.mesangialCells : n.rank < s.endocapillary * 0.8;
      if (!show || sclAll) continue;
      const pp = proj(n.pos);
      push(pp.z + 0.005, () => {
        ctx.globalAlpha = dim;
        ctx.beginPath(); ctx.arc(pp.x, pp.y, 0.022 * scale * pp.k, 0, TAU);
        ctx.fillStyle = fog(P.nucleus, pp.z); ctx.fill();
        ctx.globalAlpha = 1;
      });
    }
    // arterioles
    const art = (pts, R, hyal) => pts.forEach((q, k) => {
      const pp = proj(q);
      const rad = R * scale * pp.k;
      push(pp.z, () => {
        ctx.globalAlpha = dim;
        if (hyal > 0.05) {
          ctx.beginPath(); ctx.arc(pp.x, pp.y, rad * (1 + 0.55 * hyal), 0, TAU);
          ctx.fillStyle = fog(P.hyaline, pp.z); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(pp.x, pp.y, rad, 0, TAU);
        ctx.fillStyle = fog(P.arteriole, pp.z); ctx.fill();
        ctx.beginPath(); ctx.arc(pp.x, pp.y, rad * (0.55 - 0.3 * hyal), 0, TAU);
        ctx.fillStyle = fog(P.lumen, pp.z); ctx.fill();
        ctx.globalAlpha = 1;
        if (s.amyloidVessel > 0 && k % 5 === 0) this._amyloid(ctx, pp, rad * 1.1, k * 23, amyAngle, P, fog);
      });
    });
    art(g.aff, 0.09, s.hyalAff);
    art(g.eff, 0.075, s.hyalEff);
    // crescent
    if (s.crescent > 0) {
      for (const q of g.crescent) {
        if (q.rank > s.crescent) continue;
        const pp = proj(q.pos);
        push(pp.z, () => {
          ctx.globalAlpha = dim;
          ctx.beginPath(); ctx.arc(pp.x, pp.y, 0.042 * scale * pp.k, 0, TAU);
          ctx.fillStyle = fog(P.crescent, pp.z, 0.85); ctx.fill();
          ctx.beginPath(); ctx.arc(pp.x, pp.y, 0.02 * scale * pp.k, 0, TAU);
          ctx.fillStyle = fog(P.nucleus, pp.z); ctx.fill();
          ctx.globalAlpha = 1;
        });
      }
    }
    // particles
    for (const q of this.particles) {
      const pp = proj(q.pos);
      push(pp.z, () => {
        const a = Math.max(0, 1 - q.age / 3.2);
        ctx.beginPath();
        if (q.kind === 'rbc') { ctx.ellipse(pp.x, pp.y, 3.2 * pp.k, 2.2 * pp.k, q.age, 0, TAU); ctx.fillStyle = fog(P.rbc, pp.z, a); }
        else { ctx.arc(pp.x, pp.y, 1.6 * pp.k, 0, TAU); ctx.fillStyle = fog(P.protein, pp.z, a); }
        ctx.fill();
      });
    }

    items.sort((a, b) => a.z - b.z);
    for (const it of items) it.fn();

    // capsule outline on top
    ctx.beginPath(); ctx.arc(cap0.x, cap0.y, capR, 0, TAU);
    ctx.lineWidth = 2.5; ctx.strokeStyle = pol ? 'rgba(120,120,128,0.35)' : P.capsule; ctx.stroke();
  }

  _amyloid(ctx, pp, rad, fibDeg, angle, P, fog) {
    const o = this.opts;
    if (o.polarized && o.congo) {
      const I = congoBirefringence(fibDeg, angle);
      if (I < 0.03) return;
      ctx.save();
      ctx.globalAlpha = 0.25 + 0.75 * I;
      ctx.fillStyle = P.polar;
      ctx.shadowColor = P.polar; ctx.shadowBlur = 8 * I;
      ctx.beginPath(); ctx.arc(pp.x, pp.y, rad * 0.7, 0, TAU); ctx.fill();
      ctx.restore();
      return;
    }
    ctx.beginPath(); ctx.arc(pp.x, pp.y, rad * 0.7, 0, TAU);
    ctx.fillStyle = fog(o.congo ? P.amyloid : P.amyloidPale, pp.z, 0.85); ctx.fill();
  }
}

function hexRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
