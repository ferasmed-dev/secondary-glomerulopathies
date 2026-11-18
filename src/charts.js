/*
 * Dependency-free SVG line charts with crosshair tooltip and a table view.
 * Series colours come from CSS custom properties (--series-1, --series-2).
 */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * opts: { series:[{name, color, points:[{x,y}], active}], xLabel, yLabel,
 *         xMax, yMin, yMax, yLog, bands:[{y0,y1,label}], refs:[{y,label}],
 *         marker:x, fmtX, fmtY, nowLabel }
 */
export function lineChart(el, opts) {
  const W = 560, H = 230, m = { l: 46, r: 92, t: 14, b: 36 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const { yLog } = opts;
  const ly = (y) => (yLog ? Math.log10(Math.max(y, 1e-9)) : y);
  const y0 = ly(opts.yMin), y1 = ly(opts.yMax);
  const X = (x) => m.l + (x / opts.xMax) * iw;
  const Y = (y) => m.t + ih - ((Math.min(Math.max(ly(y), y0), y1) - y0) / (y1 - y0)) * ih;
  const parts = [];
  // bands
  for (const b of opts.bands || []) {
    const ya = Y(b.y1), yb = Y(b.y0);
    parts.push(`<rect x="${m.l}" y="${ya.toFixed(1)}" width="${iw}" height="${(yb - ya).toFixed(1)}" fill="var(--band-${b.tone})" />`);
    parts.push(`<text x="${m.l + 6}" y="${(ya + 13).toFixed(1)}" class="axis-label">${esc(b.label)}</text>`);
  }
  // grid + y ticks
  const ticks = opts.yTicks;
  for (const tv of ticks) {
    const y = Y(tv);
    parts.push(`<line x1="${m.l}" x2="${m.l + iw}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" class="grid"/>`);
    parts.push(`<text x="${m.l - 6}" y="${(y + 4).toFixed(1)}" text-anchor="end" class="axis-label tnum">${esc(opts.fmtY(tv))}</text>`);
  }
  for (const r of opts.refs || []) {
    const y = Y(r.y);
    parts.push(`<line x1="${m.l}" x2="${m.l + iw}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" class="ref"/>`);
    parts.push(`<text x="${m.l + iw - 4}" y="${(y - 4).toFixed(1)}" text-anchor="end" class="axis-label">${esc(r.label)}</text>`);
  }
  // x ticks
  const step = opts.xMax > 40 ? 10 : 5;
  for (let x = 0; x <= opts.xMax + 1e-9; x += step) {
    parts.push(`<text x="${X(x).toFixed(1)}" y="${m.t + ih + 16}" text-anchor="middle" class="axis-label tnum">${esc(opts.fmtX(x))}</text>`);
  }
  parts.push(`<line x1="${m.l}" x2="${m.l + iw}" y1="${m.t + ih}" y2="${m.t + ih}" class="axis"/>`);
  parts.push(`<text x="${m.l + iw / 2}" y="${H - 4}" text-anchor="middle" class="axis-label">${esc(opts.xLabel)}</text>`);
  // series (inactive first)
  const ordered = [...opts.series].sort((a, b) => (a.active ? 1 : 0) - (b.active ? 1 : 0));
  const ends = [];
  for (const s of ordered) {
    const d = s.points.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join('');
    parts.push(`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" opacity="${s.active ? 1 : 0.45}"/>`);
    const last = s.points[s.points.length - 1];
    ends.push({ y: Y(last.y), x: X(last.x), s });
  }
  // direct end labels (nudge apart with leader lines when close)
  ends.sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 14) ends[i].ly = ends[i - 1].ly !== undefined ? ends[i - 1].ly + 14 : ends[i - 1].y + 14;
  for (const e of ends) {
    const lyy = e.ly !== undefined ? e.ly : e.y;
    if (e.ly !== undefined) parts.push(`<line x1="${e.x + 2}" y1="${e.y}" x2="${e.x + 8}" y2="${lyy}" stroke="var(--text-muted)" stroke-width="1"/>`);
    parts.push(`<circle cx="${e.x}" cy="${e.y}" r="4" fill="${e.s.color}" stroke="var(--surface-1)" stroke-width="2" opacity="${e.s.active ? 1 : 0.5}"/>`);
    parts.push(`<text x="${e.x + 10}" y="${(lyy + 4).toFixed(1)}" class="series-label">${esc(e.s.name)}</text>`);
  }
  // marker (now)
  if (opts.marker !== undefined) {
    const x = X(opts.marker);
    parts.push(`<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${m.t}" y2="${m.t + ih}" class="now"/>`);
    parts.push(`<text x="${x.toFixed(1)}" y="${m.t + 10}" text-anchor="${opts.marker > opts.xMax * 0.85 ? 'end' : 'start'}" dx="${opts.marker > opts.xMax * 0.85 ? -4 : 4}" class="axis-label">${esc(opts.nowLabel)}</text>`);
    const act = opts.series.find((s) => s.active) || opts.series[0];
    const pv = nearest(act.points, opts.marker);
    if (pv) parts.push(`<circle cx="${x.toFixed(1)}" cy="${Y(pv.y).toFixed(1)}" r="5" fill="${act.color}" stroke="var(--surface-1)" stroke-width="2"/>`);
  }
  // hover layer
  parts.push(`<line class="xhair" x1="0" x2="0" y1="${m.t}" y2="${m.t + ih}" visibility="hidden"/>`);
  parts.push(`<rect class="hit" x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" fill="transparent"/>`);
  el.innerHTML = `<div class="chart-wrap"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.title)}">${parts.join('')}</svg><div class="tooltip" hidden></div></div>`;
  const svg = el.querySelector('svg'), tip = el.querySelector('.tooltip'), xh = el.querySelector('.xhair'), hit = el.querySelector('.hit');
  const move = (ev) => {
    const rect = svg.getBoundingClientRect();
    const px = ((ev.clientX - rect.left) / rect.width) * W;
    const xv = Math.max(0, Math.min(opts.xMax, ((px - m.l) / iw) * opts.xMax));
    const xs = X(xv);
    xh.setAttribute('x1', xs); xh.setAttribute('x2', xs); xh.setAttribute('visibility', 'visible');
    const rows = opts.series.map((s) => { const p = nearest(s.points, xv); return `<div class="tt-row"><span class="key" style="background:${s.color}"></span>${esc(s.name)}: <b class="tnum">${esc(opts.fmtY(p.y, true))}</b></div>`; });
    tip.innerHTML = `<div class="tt-head">${esc(opts.fmtX(nearest(opts.series[0].points, xv).x, true))}</div>${rows.join('')}`;
    tip.hidden = false;
    const left = (xs / W) * rect.width;
    tip.style.left = `${Math.min(rect.width - 170, Math.max(0, left + 12))}px`;
    tip.style.top = `8px`;
  };
  hit.addEventListener('pointermove', move);
  hit.addEventListener('pointerleave', () => { tip.hidden = true; xh.setAttribute('visibility', 'hidden'); });
}

function nearest(points, x) {
  let best = points[0], bd = Infinity;
  for (const p of points) { const d = Math.abs(p.x - x); if (d < bd) { bd = d; best = p; } }
  return best;
}

/** Table view of the same series, sampled every `every` units of x. */
export function chartTable(el, opts, every, colX) {
  const xs = [];
  for (let x = 0; x <= opts.xMax + 1e-9; x += every) xs.push(x);
  const head = `<tr><th scope="col">${esc(colX)}</th>${opts.series.map((s) => `<th scope="col">${esc(s.name)}</th>`).join('')}</tr>`;
  const body = xs.map((x) => `<tr><th scope="row" class="tnum">${esc(opts.fmtX(x, true))}</th>${opts.series.map((s) => `<td class="tnum">${esc(opts.fmtY(nearest(s.points, x).y, true))}</td>`).join('')}</tr>`).join('');
  el.innerHTML = `<div class="table-scroll"><table class="data-table"><caption>${esc(opts.title)}</caption><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
}

/** Bullet bar: value position against a reference range. */
export function bulletSVG(value, [lo, hi], domain, log = false) {
  const W = 120, H = 14;
  const f = (x) => (log ? Math.log10(Math.max(x, domain[0])) : x);
  const d0 = f(domain[0]), d1 = f(domain[1]);
  const X = (x) => 2 + ((Math.min(Math.max(f(x), d0), d1) - d0) / (d1 - d0)) * (W - 4);
  const xa = X(Math.max(lo, domain[0])), xb = X(Math.min(hi, domain[1]));
  const xv = X(value);
  return `<svg viewBox="0 0 ${W} ${H}" class="bullet" aria-hidden="true"><rect x="2" y="5" width="${W - 4}" height="4" rx="2" fill="var(--track)"/><rect x="${xa.toFixed(1)}" y="3" width="${Math.max(2, xb - xa).toFixed(1)}" height="8" rx="2" fill="var(--normal-band)"/><circle cx="${xv.toFixed(1)}" cy="7" r="4.5" fill="var(--text-primary)" stroke="var(--surface-1)" stroke-width="2"/></svg>`;
}
