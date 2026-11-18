/* UI: DOM, controls, rendering. Model logic lives in model.js. */
import * as M from './model.js';
import { makeT, LANGS } from './i18n.js';
import { Glomerulus3D, TISSUE } from './scene3d.js';
import { lmSVG, emSVG, biopsySVG } from './draw2d.js';
import { lineChart, chartTable, bulletSVG } from './charts.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const darkMQ = matchMedia('(prefers-color-scheme: dark)');

/* ---------------- state ---------------- */
const params = new URLSearchParams(location.search);
let state = M.cloneState(M.DEFAULT_STATE);
let currentPreset = null;
const ui = { lang: 'es', view: '3d', variant: null, table: false, playing: false };

function pickLang() {
  const q = params.get('lang');
  if (LANGS.includes(q)) return q;
  try { const s = localStorage.getItem('sg-lang'); if (LANGS.includes(s)) return s; } catch { /* storage blocked */ }
  const nav = (navigator.language || 'es').toLowerCase();
  return nav.startsWith('es') ? 'es' : nav.startsWith('en') ? 'en' : 'es';
}
ui.lang = pickLang();
let t = makeT(ui.lang);

const pk = params.get('preset');
if (pk && M.PRESETS[pk]) { state = M.presetState(pk); currentPreset = pk; }
else if (!pk) { state = M.presetState('dn-kimmelstiel-wilson'); currentPreset = null; }

const viewer = new Glomerulus3D($('#c3d'));

/* ---------------- helpers ---------------- */
const isEs = () => ui.lang === 'es';
const u = {
  gday: () => (isEs() ? 'g/día' : 'g/day'),
};
function fmt(x, d = 0) { return t.num(x, d); }
function modelTag() { return `<span class="tag" title="${esc(t('model.tip'))}">${esc(t('model.tag'))}</span>`; }

function syncUrl() {
  const q = new URLSearchParams();
  if (currentPreset) q.set('preset', currentPreset);
  if (params.get('lang') || ui.lang !== 'es') q.set('lang', ui.lang);
  const s = q.toString();
  history.replaceState(null, '', location.pathname + (s ? `?${s}` : ''));
}
function presetUrl(key) {
  const q = new URLSearchParams({ preset: key });
  if (ui.lang !== 'es') q.set('lang', ui.lang);
  return `${location.origin}${location.pathname}?${q}`;
}
function manual() { currentPreset = null; syncUrl(); markPresets(); }

/* ---------------- static text ---------------- */
function renderStatic() {
  document.documentElement.lang = ui.lang;
  document.title = `${t('app.title')} · ${isEs() ? 'glomérulo interactivo' : 'interactive glomerulus'}`;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-model]').forEach((el) => { el.textContent = t('model.tag'); el.title = t('model.tip'); });
  $('#lang').setAttribute('aria-label', t('lang.label'));
  document.querySelectorAll('#lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === ui.lang)));
  $('#tabs').setAttribute('aria-label', t('tabs.label'));
  $('#c3d').setAttribute('aria-label', t('view.aria3d'));
  $('#c3d').setAttribute('role', 'img');
}

function renderTabs() {
  $('#tabs').innerHTML = M.ENTITIES.map((e) => `<button type="button" role="tab" aria-selected="${state.entity === e}" data-entity="${e}">${esc(t('entity.' + e))}<span class="m">${esc(t('mech.' + e))}</span></button>`).join('');
}

/* ---------------- controls ---------------- */
function slider(id, label, min, max, step, value, out) {
  return `<div class="ctl"><label class="lab" for="${id}"><span>${esc(label)}</span><output id="${id}-o">${esc(out)}</output></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}"></div>`;
}
function check(id, label, on) {
  return `<label class="check"><input type="checkbox" id="${id}" ${on ? 'checked' : ''}> <span>${esc(label)}</span></label>`;
}

function renderControls() {
  const e = state.entity;
  let h = '';
  if (e === 'normal') {
    h = `<p class="muted">${esc(t('class.normal'))}. ${esc(t.dict.presets.normal[1])}</p>`;
  } else if (e === 'diabetic') {
    const d = state.dn;
    h += slider('dnYears', t('dn.years'), 0, M.DN.maxYears, 0.5, d.years, `${fmt(d.years, 1)} ${t('unit.years')}`);
    h += `<div class="row"><button type="button" class="btn primary" id="play">${esc(t('play'))}</button></div>`;
    h += check('dnTx', t('dn.treated'), d.treated);
  } else if (e === 'lupus') {
    const l = state.ln;
    h += `<div class="ctl"><div class="lab">${esc(t('ln.classes'))}</div><div class="chips" id="lnClasses">${Object.keys(M.LN_CLASS_PRESETS).map((c) => `<button type="button" data-cls="${c}">${c}</button>`).join('')}</div></div>`;
    h += check('lnMes', t('ln.mesHyper'), l.mesangialHyper);
    h += slider('lnProlif', t('ln.prolif'), 0, 100, 5, Math.round(l.prolif * 100), `${fmt(l.prolif * 100)} %`);
    h += check('lnSubepi', t('ln.subepi'), l.subepi);
    h += slider('lnScl', t('ln.sclerosis'), 0, 100, 5, Math.round(l.sclerosis * 100), `${fmt(l.sclerosis * 100)} %`);
  } else if (e === 'alport') {
    const a = state.alport;
    h += `<div class="ctl"><label class="lab" for="alG"><span>${esc(t('al.genotype'))}</span></label><select id="alG">${M.ALPORT_GENOTYPES.map((g) => `<option value="${g}" ${g === a.genotype ? 'selected' : ''}>${esc(t('al.g.' + g))}</option>`).join('')}</select></div>`;
    h += slider('alAge', t('al.age'), 0, 70, 1, a.age, `${fmt(a.age)} ${t('unit.years')}`);
    h += `<div class="row"><button type="button" class="btn primary" id="play">${esc(t('play'))}</button></div>`;
    if (a.genotype === 'ad') h += check('alRisk', t('al.adRisk'), a.adRisk);
    h += check('alTx', t('al.treated'), a.treated);
  } else if (e === 'amyloid') {
    const a = state.amyloid;
    h += `<div class="ctl"><div class="lab">${esc(t('am.type'))}</div><div class="chips" id="amType">${['AL', 'AA'].map((k) => `<button type="button" data-type="${k}" aria-pressed="${a.type === k}">${esc(t('am.' + k))}</button>`).join('')}</div></div>`;
    h += slider('amLoad', t('am.load'), 0, 100, 5, Math.round(a.load * 100), `${fmt(a.load * 100)} %`);
    h += check('amCongo', t('am.congo'), a.congo);
    h += check('amPol', t('am.polarized'), a.polarized);
    h += slider('amAngle', t('am.angle'), 0, 180, 1, a.angle, `${fmt(a.angle)}°`);
    h += `<p class="note" id="amNote"></p>`;
  }
  $('#controls').innerHTML = h;
  bindControls();
  refreshControlState();
}

function refreshControlState() {
  const e = state.entity;
  if (e === 'diabetic') {
    $('#dnYears').value = state.dn.years;
    $('#dnYears-o').textContent = `${fmt(state.dn.years, 1)} ${t('unit.years')}`;
  } else if (e === 'lupus') {
    const cls = M.classifyLN(state.ln);
    document.querySelectorAll('#lnClasses button').forEach((b) => b.setAttribute('aria-pressed', String(cls.split('+').includes(b.dataset.cls))));
    $('#lnProlif').value = Math.round(state.ln.prolif * 100);
    $('#lnProlif-o').textContent = `${fmt(state.ln.prolif * 100)} %`;
    $('#lnScl').value = Math.round(state.ln.sclerosis * 100);
    $('#lnScl-o').textContent = `${fmt(state.ln.sclerosis * 100)} %`;
    $('#lnMes').checked = state.ln.mesangialHyper;
    $('#lnSubepi').checked = state.ln.subepi;
  } else if (e === 'alport') {
    $('#alAge').value = state.alport.age;
    $('#alAge-o').textContent = `${fmt(state.alport.age)} ${t('unit.years')}`;
  } else if (e === 'amyloid') {
    const a = state.amyloid;
    document.querySelectorAll('#amType button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.type === a.type)));
    $('#amAngle').disabled = !(a.polarized && a.congo);
    $('#amNote').textContent = a.polarized ? (a.congo ? t('am.polHint') : t('am.needCongo')) : t('am.polHint');
  }
  const p = $('#play');
  if (p) p.textContent = ui.playing ? t('pause') : t('play');
}

function bindControls() {
  const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };
  on('dnYears', 'input', (e) => { state.dn.years = +e.target.value; manual(); update(); });
  on('dnTx', 'change', (e) => { state.dn.treated = e.target.checked; manual(); update(); });
  on('play', 'click', togglePlay);
  document.querySelectorAll('#lnClasses button').forEach((b) => b.addEventListener('click', () => {
    state.ln = { ...M.LN_CLASS_PRESETS[b.dataset.cls] }; ui.variant = null; manual(); update();
  }));
  on('lnMes', 'change', (e) => { state.ln.mesangialHyper = e.target.checked; manual(); update(); });
  on('lnProlif', 'input', (e) => { state.ln.prolif = +e.target.value / 100; ui.variant = null; manual(); update(); });
  on('lnSubepi', 'change', (e) => { state.ln.subepi = e.target.checked; manual(); update(); });
  on('lnScl', 'input', (e) => { state.ln.sclerosis = +e.target.value / 100; ui.variant = null; manual(); update(); });
  on('alG', 'change', (e) => { state.alport.genotype = e.target.value; ui.variant = null; manual(); renderControls(); update(); });
  on('alAge', 'input', (e) => { state.alport.age = +e.target.value; manual(); update(); });
  on('alRisk', 'change', (e) => { state.alport.adRisk = e.target.checked; manual(); update(); });
  on('alTx', 'change', (e) => { state.alport.treated = e.target.checked; manual(); update(); });
  document.querySelectorAll('#amType button').forEach((b) => b.addEventListener('click', () => { state.amyloid.type = b.dataset.type; manual(); update(); }));
  on('amLoad', 'input', (e) => { state.amyloid.load = +e.target.value / 100; $('#amLoad-o').textContent = `${fmt(state.amyloid.load * 100)} %`; manual(); update(); });
  on('amCongo', 'change', (e) => { state.amyloid.congo = e.target.checked; manual(); update(); });
  on('amPol', 'change', (e) => { state.amyloid.polarized = e.target.checked; manual(); update(); });
  on('amAngle', 'input', (e) => { state.amyloid.angle = +e.target.value; $('#amAngle-o').textContent = `${fmt(state.amyloid.angle)}°`; manual(); update(); });
}

/* ---------------- play ---------------- */
let playTimer = null;
function togglePlay() {
  if (ui.playing) return stopPlay();
  const e = state.entity;
  if (e === 'diabetic' && state.dn.years >= M.DN.maxYears) state.dn.years = 0;
  if (e === 'alport' && state.alport.age >= 70) state.alport.age = 0;
  ui.playing = true; manual();
  let last = performance.now();
  const tick = (now) => {
    if (!ui.playing) return;
    const dt = (now - last) / 1000; last = now;
    if (state.entity === 'diabetic') {
      state.dn.years = Math.min(M.DN.maxYears, Math.round((state.dn.years + dt * 2) * 20) / 20);
      if (state.dn.years >= M.DN.maxYears) stopPlay();
    } else if (state.entity === 'alport') {
      state.alport.age = Math.min(70, state.alport.age + dt * 4);
      if (state.alport.age >= 70) stopPlay();
    } else stopPlay();
    update();
    playTimer = requestAnimationFrame(tick);
  };
  playTimer = requestAnimationFrame(tick);
  refreshControlState();
}
function stopPlay() {
  ui.playing = false; cancelAnimationFrame(playTimer);
  if (state.entity === 'alport') state.alport.age = Math.round(state.alport.age);
  refreshControlState();
}

/* ---------------- main render ---------------- */
let snap;
function opts3d() {
  const a = state.amyloid;
  const am = state.entity === 'amyloid';
  return { dark: darkMQ.matches, polarized: am && a.polarized, congo: am ? a.congo : true, angle: am ? a.angle : 0 };
}

function update() {
  snap = M.snapshot(state, ui.variant);
  refreshControlState();
  renderBadge();
  renderViewer();
  renderEM();
  renderParams();
  renderPathway();
  renderMicro();
  renderHistory();
}

function renderBadge() {
  const s = snap, e = s.entity;
  let b = '', k = '';
  if (e === 'normal') b = t('class.normal');
  else if (e === 'diabetic') {
    b = s.cls ? t('class.rps', s.cls) : t('class.none');
    k = t('class.kdigo', s.extra.albCat, s.extra.gfrCat, t('risk.' + s.extra.risk));
  } else if (e === 'lupus') b = t('class.isn', s.cls);
  else if (e === 'alport') b = t('al.g.' + s.cls);
  else if (e === 'amyloid') b = t('class.amyloid', s.cls);
  $('#badge').textContent = b;
  $('#kdigo').textContent = k;
}

function renderViewer() {
  const o = opts3d();
  const is3d = ui.view === '3d';
  document.querySelectorAll('#viewSeg button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === ui.view)));
  $('#c3d').hidden = !is3d;
  $('#lm').hidden = is3d;
  const stage = document.querySelector('.stage');
  stage.classList.toggle('lm', !is3d);
  stage.classList.toggle('pol', !!(o.polarized && o.congo));
  $('#autoWrap').hidden = !is3d; $('#hint3d').hidden = !is3d;
  $('#auto').checked = viewer.auto;
  if (is3d) { viewer.set(snap.scene, o); viewer.start(); }
  else { viewer.stop(); $('#lm').innerHTML = lmSVG(snap.scene, o, t); }
  $('#showing').textContent = t('view.showing', t('biopsy.kind.' + snap.variant));
  renderLegend(o);
}

function renderLegend(o) {
  const s = snap.scene, P = TISSUE[o.dark ? 'dark' : 'light'];
  const items = [];
  if (s.globalSclerosed) items.push([P.sclerosis, 'legend.sclerosis']);
  else items.push([P.wall, 'legend.loop'], [P.mesangium, 'legend.mesangium'], [P.nucleus, 'legend.nucleus']);
  if (s.depositKind === 'ic') items.push([P.ic, 'legend.ic']);
  if (s.amyloid > 0) items.push(o.polarized && o.congo ? [P.polar, 'legend.amyloidPol'] : [o.congo ? P.amyloid : P.amyloidPale, 'legend.amyloid']);
  if (s.nodules > 0) items.push([P.nodule, 'legend.kw']);
  if (s.hyalAff > 0.05 || s.hyalEff > 0.05) items.push([P.hyaline, 'legend.hyaline']);
  if (s.segSclerosis > 0.05 && !s.globalSclerosed) items.push([P.sclerosis, 'legend.sclerosis']);
  if (s.crescent > 0) items.push([P.crescent, 'legend.crescent']);
  if (s.rbcLeak > 0) items.push([P.rbc, 'legend.rbc']);
  if (s.proteinLeak > 0.1) items.push([P.protein, 'legend.protein']);
  $('#legend').innerHTML = items.map(([c, k]) => `<li><span class="sw" style="background:${c}"></span>${esc(t(k))}</li>`).join('');
}

function renderEM() {
  const o = opts3d();
  $('#em').innerHTML = emSVG(snap.scene, o, t);
  $('#biopsy').innerHTML = biopsySVG(snap.biopsy, snap.variant, o, t);
  const counts = {};
  for (const k of snap.biopsy) counts[k] = (counts[k] || 0) + 1;
  $('#biopsyCounts').textContent = ['prolif', 'lesion', 'sclerosed', 'normal'].filter((k) => counts[k]).map((k) => t('biopsy.count', t('biopsy.kind.' + k), counts[k], M.BIOPSY_N)).join(' · ');
  document.querySelectorAll('#biopsy .bx').forEach((g) => {
    const pick = () => { ui.variant = g.dataset.kind; update(); const el = document.querySelector(`#biopsy .bx[data-i="${g.dataset.i}"]`); if (el) el.focus(); };
    g.addEventListener('click', pick);
    g.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick(); } });
  });
}

function stateCell(st) {
  if (!st) return '';
  return `<span class="st ${st}">${esc(t('state.' + st))}</span>`;
}

function renderParams() {
  const L = snap.labs, S = snap.status, e = snap.entity, R = M.REF;
  const rows = [];
  const row = (label, value, ref, st, bullet = '') => rows.push(`<tr><th scope="row">${esc(label)}</th><td class="v">${value}${stateCell(st)}</td><td>${bullet}</td><td class="ref">${esc(ref)}</td></tr>`);
  row(t('p.acr'), `${fmt(L.acr)} mg/g <span class="muted small">(${M.albuminuriaCategory(L.acr)})</span>`, '< 30 mg/g', S.acr, bulletSVG(L.acr, R.acr, [1, 10000], true));
  row(t('p.proteinuria'), `${fmt(L.proteinuria, 2)} ${u.gday()}${L.proteinuria >= 3.5 ? ` <span class="muted small">(${esc(t('nephrotic'))})</span>` : ''}`, `< 0,15 ${u.gday()}`.replace('0,15', isEs() ? '0,15' : '0.15'), S.proteinuria, bulletSVG(L.proteinuria, R.proteinuria, [0.03, 20], true));
  row(t('p.hematuria'), esc(t('hem.' + L.hematuria)) + (L.rbcCasts ? ` + ${esc(t('casts'))}` : ''), t('hem.none'), L.hematuria === 'none' && !L.rbcCasts ? 'normal' : 'abn');
  row(t('p.egfr'), `${fmt(L.egfr)} <span class="muted small">mL/min/1,73 m²</span>`.replace('1,73', isEs() ? '1,73' : '1.73'), '≥ 90', S.egfr === 'high' ? 'normal' : S.egfr, bulletSVG(L.egfr, R.egfr, [0, 150]));
  const bpSt = L.sbp > R.sbp[1] || L.dbp > R.dbp[1] ? 'high' : L.sbp < 105 ? 'low' : 'normal';
  row(t('p.bp'), `${fmt(L.sbp)}/${fmt(L.dbp)} mmHg`, '< 130/80', bpSt, bulletSVG(L.sbp, R.sbp, [80, 190]));
  row(t('p.c3'), `${fmt(L.c3)} mg/dL`, '90–180', S.c3, bulletSVG(L.c3, R.c3, [0, 200]));
  row(t('p.c4'), `${fmt(L.c4)} mg/dL`, '10–40', S.c4, bulletSVG(L.c4, R.c4, [0, 50]));
  const gbm = snap.scene.gbmNm;
  row(t('p.gbm'), `${fmt(Math.round(gbm / 10) * 10)} nm`, '300–430 nm', M.flag(gbm, R.gbmNm), bulletSVG(gbm, R.gbmNm, [100, 1000]));
  if (e === 'lupus') row(t('p.antiDsDna'), `${fmt(L.antiDsDna)} UI/mL`.replace('UI', isEs() ? 'UI' : 'IU'), `< 30 (${t('assay')})`, S.antiDsDna, bulletSVG(L.antiDsDna, R.antiDsDna, [1, 1000], true));
  if (e === 'amyloid' && L.flcLambda !== undefined) {
    row(t('p.flcLambda'), `${fmt(L.flcLambda, 1)} mg/L`, '5,7–26,3'.replace(/,/g, isEs() ? ',' : '.'), S.flcLambda, bulletSVG(L.flcLambda, R.flcLambda, [1, 1000], true));
    row(t('p.flcRatio'), fmt(L.flcRatio, 2), '0,26–1,65'.replace(/,/g, isEs() ? ',' : '.'), S.flcRatio, bulletSVG(L.flcRatio, R.flcRatio, [0.01, 10], true));
  }
  if (e === 'amyloid' && L.crp !== undefined) row(t('p.crp'), `${fmt(L.crp)} mg/L`, '< 5', S.crp, bulletSVG(L.crp, R.crp, [0.5, 200], true));
  if (e === 'alport') {
    const ex = [L.hearingLoss && t('extra.hearing'), L.lenticonus && t('extra.lenticonus')].filter(Boolean);
    row(t('p.extra'), esc(ex.length ? ex.join(', ') : t('extra.none')), '—', ex.length ? 'abn' : 'normal');
  }
  if (e === 'diabetic') row(t('p.retina'), esc(L.retinopathy ? t('retina.yes') : t('retina.no')), '—', null);
  $('#params').innerHTML = `<div class="table-scroll" style="max-height:none"><table class="ptable"><thead><tr><th scope="col">${esc(t('params.param'))}</th><th scope="col">${esc(t('params.value'))}</th><th scope="col"><span class="sr">${esc(t('params.state'))}</span></th><th scope="col">${esc(t('params.ref'))}</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
}

function renderPathway() {
  const steps = t.dict.steps;
  $('#pathway').innerHTML = snap.pathway.map(({ key, on }) => {
    const k = key === 'am-precursor' ? `${key}.${state.amyloid.type}` : key;
    const [title, detail] = steps[k];
    return `<li class="${on ? 'on' : ''}" aria-current="${on ? 'step' : 'false'}"><b>${esc(title)}</b><span>${esc(detail)}</span></li>`;
  }).join('');
}

function renderMicro() {
  const f = t.dict.findings[snap.entity](snap, (x) => fmt(Math.round(x / 10) * 10));
  let h = `<dl><dt>${esc(t('micro.lm'))}</dt><dd>${esc(f.lm)}</dd><dt>${esc(t('micro.if'))}</dt><dd>${esc(f.if)}</dd><dt>${esc(t('micro.em'))}</dt><dd>${esc(f.em)}</dd>`;
  if (f.tx) h += `<dt>${esc(t('micro.tx'))}</dt><dd><ul>${f.tx.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></dd>`;
  $('#micro').innerHTML = h + '</dl>';
}

/* ---------------- history ---------------- */
let dnCourses = null;
function renderHistory() {
  const e = snap.entity;
  const el = $('#history');
  $('#tableToggle').hidden = !(e === 'diabetic' || e === 'alport');
  $('#tableToggle').textContent = ui.table ? t('history.chart') : t('history.table');
  const css = getComputedStyle(document.documentElement);
  const c1 = css.getPropertyValue('--series-1').trim(), c2 = css.getPropertyValue('--series-2').trim();
  const legend = `<div class="legend-line"><span><i class="key" style="background:${c2}"></i>${esc(t('history.untreated'))}</span><span><i class="key" style="background:${c1}"></i>${esc(t('history.treated'))}</span></div>`;
  if (e === 'diabetic') {
    if (!dnCourses) dnCourses = { u: M.dnCourse(false), t: M.dnCourse(true) };
    const sample = (c, key) => c.filter((_, i) => i % 5 === 0).map((p) => ({ x: p.t, y: p[key] }));
    const tx = state.dn.treated;
    const series = (key) => [
      { name: t('history.untreated'), color: c2, points: sample(dnCourses.u, key), active: !tx },
      { name: t('history.treated'), color: c1, points: sample(dnCourses.t, key), active: tx },
    ];
    const fx = (x, long) => (long ? t.dict.msTime(x, 'years', (v) => fmt(v, 1)) : fmt(x));
    const egfrOpts = { title: t('history.dn.egfr'), series: series('egfr'), xMax: 30, yMin: 0, yMax: 140, yTicks: [0, 30, 60, 90, 120], refs: [{ y: 60, label: t('history.ref60') }, { y: 15, label: t('history.ref15') }], marker: state.dn.years, xLabel: t('history.x.years'), fmtX: fx, fmtY: (v, long) => (long ? `${fmt(v)} mL/min` : fmt(v)), nowLabel: t('history.now') };
    const acrOpts = { title: t('history.dn.acr'), series: series('acr'), xMax: 30, yMin: 3, yMax: 6000, yLog: true, yTicks: [10, 30, 100, 300, 1000, 3000], bands: [{ y0: 3, y1: 30, tone: 1, label: t('history.band.A1') }, { y0: 30, y1: 300, tone: 2, label: t('history.band.A2') }, { y0: 300, y1: 6000, tone: 3, label: t('history.band.A3') }], marker: state.dn.years, xLabel: t('history.x.years'), fmtX: fx, fmtY: (v, long) => (long ? `${fmt(v)} mg/g` : fmt(v)), nowLabel: t('history.now') };
    el.innerHTML = `${legend}<div class="hist-grid"><div><p class="chart-title">${esc(t('history.dn.egfr'))}</p><div id="ch1"></div></div><div><p class="chart-title">${esc(t('history.dn.acr'))}</p><div id="ch2"></div></div><div><p class="chart-title">${esc(t('history.milestones'))}</p><ul class="milestones" id="ms"></ul></div></div>`;
    if (ui.table) { chartTable($('#ch1'), egfrOpts, 2, t('history.col.t.years')); chartTable($('#ch2'), acrOpts, 2, t('history.col.t.years')); }
    else { lineChart($('#ch1'), egfrOpts); lineChart($('#ch2'), acrOpts); }
    renderMilestones(M.dnMilestones(tx), state.dn.years, 'years');
  } else if (e === 'alport') {
    const a = state.alport;
    const su = M.alportSeries(a.genotype, { adRisk: a.adRisk }), st = M.alportSeries(a.genotype, { adRisk: a.adRisk, treated: true });
    const pts = (s) => s.map((p) => ({ x: p.t, y: p.egfr }));
    const fx = (x, long) => (long ? t.dict.msTime(x, 'age', (v) => fmt(v, 1)) : fmt(x));
    const opts = { title: `${t('history.al.egfr')} · ${t('al.g.' + a.genotype)}`, series: [
      { name: t('history.untreated'), color: c2, points: pts(su), active: !a.treated },
      { name: t('history.treated'), color: c1, points: pts(st), active: a.treated },
    ], xMax: 70, yMin: 0, yMax: 120, yTicks: [0, 30, 60, 90, 120], refs: [{ y: 60, label: t('history.ref60') }, { y: 15, label: t('history.ref15') }], marker: a.age, xLabel: t('history.x.age'), fmtX: fx, fmtY: (v, long) => (long ? `${fmt(v)} mL/min` : fmt(v)), nowLabel: t('history.now') };
    el.innerHTML = `${legend}<div class="hist-grid one"><div><p class="chart-title">${esc(opts.title)}</p><div id="ch1"></div></div><div><p class="chart-title">${esc(t('history.milestones'))}</p><ul class="milestones" id="ms"></ul></div></div>`;
    if (ui.table) chartTable($('#ch1'), opts, 5, t('history.col.t.age'));
    else lineChart($('#ch1'), opts);
    renderMilestones(M.alportMilestones(a.genotype, { adRisk: a.adRisk, treated: a.treated }), a.age, 'age');
  } else {
    el.innerHTML = `<p class="muted">${esc(t('history.none'))}</p>`;
  }
}

function renderMilestones(list, now, kind) {
  const ms = t.dict.milestones;
  $('#ms').innerHTML = list.map((m) => `<li class="${m.t <= now + 1e-9 ? 'done' : ''}"><span class="t">${esc(t.dict.msTime(m.t, kind, (v) => fmt(v, kind === 'age' ? 0 : 1)))}</span>${esc(ms[m.key](m, (v) => fmt(v, 0)))}</li>`).join('');
}

/* ---------------- presets & refs ---------------- */
function renderPresets() {
  const groups = {};
  for (const [k, p] of Object.entries(M.PRESETS)) (groups[p.entity] ||= []).push(k);
  $('#presets').innerHTML = M.ENTITIES.map((e) => `<div class="preset-group"><h3>${esc(t('entity.' + e))}</h3>${(groups[e] || []).map((k) => {
    const [n, d] = t.dict.presets[k];
    return `<div class="preset" data-key="${k}"><div><div class="n">${esc(n)}</div><div class="d">${esc(d)}</div></div><div class="acts"><button type="button" class="btn" data-open="${k}">${esc(t('presets.open'))}</button><button type="button" class="link" data-copy="${k}">${esc(t('presets.copy'))}</button></div></div>`;
  }).join('')}</div>`).join('');
  document.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => applyPreset(b.dataset.open, true)));
  document.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(presetUrl(b.dataset.copy)); b.textContent = t('presets.copied'); setTimeout(() => { b.textContent = t('presets.copy'); }, 1400); } catch { prompt('URL', presetUrl(b.dataset.copy)); }
  }));
  markPresets();
}
function markPresets() {
  document.querySelectorAll('.preset').forEach((p) => p.classList.toggle('cur', p.dataset.key === currentPreset));
}
function renderRefs() {
  $('#refs').innerHTML = `<table><tbody>${t.dict.refs.map(([a, b]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td></tr>`).join('')}</tbody></table>`;
}

function applyPreset(key, scroll = false) {
  const s = M.presetState(key);
  if (!s) return;
  stopPlay();
  state = s; currentPreset = key; ui.variant = null;
  syncUrl();
  renderTabs(); renderControls(); update(); markPresets();
  if (scroll) $('#main').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setEntity(e) {
  if (e === state.entity) return;
  stopPlay();
  state.entity = e; ui.variant = null; manual();
  renderTabs(); renderControls(); update();
}

function setLang(l) {
  if (!LANGS.includes(l)) return;
  ui.lang = l; t = makeT(l);
  try { localStorage.setItem('sg-lang', l); } catch { /* ignore */ }
  params.set('lang', l);
  syncUrl();
  renderAll();
}

function renderAll() {
  renderStatic(); renderTabs(); renderControls(); renderPresets(); renderRefs(); update();
}

/* ---------------- events ---------------- */
$('#lang').addEventListener('click', (e) => { const b = e.target.closest('button[data-lang]'); if (b) setLang(b.dataset.lang); });
$('#tabs').addEventListener('click', (e) => { const b = e.target.closest('button[data-entity]'); if (b) setEntity(b.dataset.entity); });
$('#tabs').addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  const i = M.ENTITIES.indexOf(state.entity);
  const n = M.ENTITIES[(i + (e.key === 'ArrowRight' ? 1 : -1) + M.ENTITIES.length) % M.ENTITIES.length];
  setEntity(n); document.querySelector(`#tabs button[data-entity="${n}"]`).focus();
});
$('#viewSeg').addEventListener('click', (e) => { const b = e.target.closest('button[data-view]'); if (b) { ui.view = b.dataset.view; renderViewer(); } });
$('#auto').addEventListener('change', (e) => { viewer.auto = e.target.checked; });
$('#tableToggle').addEventListener('click', () => { ui.table = !ui.table; renderHistory(); });
darkMQ.addEventListener('change', () => update());
document.addEventListener('visibilitychange', () => { if (document.hidden) viewer.stop(); else if (ui.view === '3d') viewer.start(); });
let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => viewer.draw(), 80); });

renderAll();

/* hook for automated checks */
window.__sim = {
  get state() { return M.cloneState(state); },
  get lang() { return ui.lang; },
  get view() { return ui.view; },
  snapshot: () => M.snapshot(state, ui.variant),
  model: M,
  setState(next) { state = { ...state, ...M.cloneState(next) }; ui.variant = null; manual(); renderTabs(); renderControls(); update(); },
  applyPreset,
  setLang,
  setView(v) { ui.view = v; renderViewer(); },
  setVariant(v) { ui.variant = v; update(); },
  presets: Object.keys(M.PRESETS),
};
