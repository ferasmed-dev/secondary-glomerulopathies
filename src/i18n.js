/*
 * ES (default) + EN strings. Dynamic text is written as functions of the
 * model snapshot so a language switch re-renders everything.
 */

const ES = {
  locale: 'es-ES',
  'app.title': 'Glomerulopatías secundarias',
  'app.subtitle': 'Un glomérulo, cuatro enfermedades sistémicas: diabetes, lupus, colágeno IV y amiloide. Mueve los controles y mira qué cambia frente a lo normal.',
  'lang.label': 'Idioma',
  'footer': 'Herramienta docente · no apta para uso clínico',
  'footer.model': 'Los valores marcados como «Modelo» son simplificaciones docentes, no datos clínicos.',
  'model.tag': 'Modelo',
  'model.tip': 'Simplificación del modelo docente (velocidades, umbrales o valores típicos), no un dato clínico.',

  'entity.normal': 'Normal',
  'entity.diabetic': 'Nefropatía diabética',
  'entity.lupus': 'Nefropatía lúpica',
  'entity.alport': 'Alport / MBG delgada',
  'entity.amyloid': 'Amiloidosis',
  'mech.normal': 'Referencia',
  'mech.diabetic': 'Metabólico-hemodinámico',
  'mech.lupus': 'Inmunológico',
  'mech.alport': 'Anomalía constitutiva',
  'mech.amyloid': 'Por depósito',
  'tabs.label': 'Entidad',

  'view.3d': '3D',
  'view.lm': 'Microscopía óptica (2D)',
  'view.rotate': 'Rotación automática',
  'view.hint3d': 'Arrastra para girar · flechas del teclado',
  'view.title': 'Glomérulo',
  'view.showing': (v) => `Glomérulo mostrado: ${v}`,
  'view.aria3d': 'Glomérulo en 3D: asas capilares, mesangio, cápsula de Bowman y arteriolas en el polo vascular',
  'legend.loop': 'Asa capilar (MBG)',
  'legend.mesangium': 'Mesangio',
  'legend.nucleus': 'Núcleos celulares',
  'legend.ic': 'Inmunocomplejos',
  'legend.amyloid': 'Amiloide (rojo Congo)',
  'legend.amyloidPol': 'Amiloide en luz polarizada',
  'legend.kw': 'Nódulo de Kimmelstiel-Wilson',
  'legend.hyaline': 'Hialinosis arteriolar',
  'legend.sclerosis': 'Esclerosis',
  'legend.crescent': 'Semiluna',
  'legend.rbc': 'Hematíes',
  'legend.protein': 'Albúmina filtrada',

  'lm.bowman': 'Espacio de Bowman',
  'lm.capsule': 'Cápsula de Bowman',
  'lm.loop': 'Asa capilar',
  'lm.mesangium': 'Mesangio',
  'lm.aff': 'Arteriola aferente',
  'lm.eff': 'Arteriola eferente',
  'lm.kw': 'Nódulo KW',
  'lm.crescent': 'Semiluna',
  'lm.wire': 'Asas de alambre',
  'lm.sclerosed': 'Esclerosis global',

  'em.title': 'Pared capilar · microscopía electrónica (a escala)',
  'em.lumen': 'Luz capilar',
  'em.endo': 'Endotelio fenestrado',
  'em.gbm': 'MBG',
  'em.podo': 'Pedicelos',
  'em.urinary': 'Espacio urinario',
  'em.normal': 'Normal ≈ 350 nm',
  'em.mesangium': 'Mesangio',
  'em.subendo': 'Subendotelial',
  'em.subepi': 'Subepitelial',
  'em.scale': '500 nm',
  'em.measure': (nm) => `MBG ≈ ${nm} nm`,
  'em.aria': (nm) => `Esquema de microscopía electrónica de la pared capilar; grosor de la MBG ≈ ${nm} nm frente a ≈ 350 nm normal`,

  'biopsy.title': 'Biopsia: 20 glomérulos',
  'biopsy.hint': 'Pulsa un glomérulo para verlo arriba.',
  'biopsy.kind.normal': 'Normal',
  'biopsy.kind.lesion': 'Con la lesión de la entidad',
  'biopsy.kind.prolif': 'Proliferativo (endo/extracapilar)',
  'biopsy.kind.sclerosed': 'Esclerosis global',
  'biopsy.count': (k, n, N) => `${k}: ${n}/${N} (${Math.round((100 * n) / N)} %)`,
  'biopsy.item': (i, k) => `Glomérulo ${i}: ${k}`,

  'controls.title': 'Controles',
  'dn.years': 'Años de evolución de la diabetes',
  'dn.treated': 'Tratamiento nefroprotector desde la albuminuria (IECA o ARA-II + iSGLT2 + control de glucemia y TA)',
  'play': 'Reproducir',
  'pause': 'Pausa',
  'ln.classes': 'Clase ISN/RPS (atajo)',
  'ln.mesHyper': 'Hipercelularidad mesangial',
  'ln.prolif': 'Glomérulos con lesiones proliferativas',
  'ln.subepi': 'Depósitos subepiteliales (componente membranoso)',
  'ln.sclerosis': 'Glomérulos con esclerosis global',
  'al.genotype': 'Genotipo',
  'al.g.xl-m': 'Ligada al X · varón (COL4A5)',
  'al.g.xl-f': 'Ligada al X · mujer portadora (COL4A5)',
  'al.g.ar': 'Autosómica recesiva (COL4A3/COL4A4)',
  'al.g.ad': 'Heterocigoto COL4A3/COL4A4 (AD; antes «MBG delgada»)',
  'al.age': 'Edad',
  'al.adRisk': 'Proteinuria > 0,5 g/día (riesgo de progresión)',
  'al.treated': 'IECA/ARA-II precoz',
  'am.type': 'Tipo',
  'am.AL': 'AL (primaria · cadenas ligeras λ)',
  'am.AA': 'AA (secundaria · amiloide sérico A)',
  'am.load': 'Carga de amiloide',
  'am.congo': 'Tinción rojo Congo',
  'am.polarized': 'Luz polarizada (polarizadores cruzados)',
  'am.angle': 'Ángulo del polarizador',
  'am.polHint': 'Gira el polarizador: cada fibrilla se apaga cuando está paralela o perpendicular a él y brilla al máximo a 45° → verde manzana.',
  'am.needCongo': 'Activa el rojo Congo para ver la birrefringencia.',
  'unit.years': 'años',
  'unit.pct': '%',

  'class.none': 'Sin lesión clasificable',
  'class.rps': (c) => `Clase RPS ${c}`,
  'class.isn': (c) => `Clase ISN/RPS ${c}`,
  'class.kdigo': (a, g, r) => `${g} · ${a} · riesgo ${r}`,
  'risk.low': 'bajo', 'risk.moderate': 'moderado', 'risk.high': 'alto', 'risk.very-high': 'muy alto',
  'class.alport': (g) => g,
  'class.amyloid': (t) => `Amiloidosis ${t}`,
  'class.normal': 'Glomérulo normal',

  'params.title': 'Parámetros frente a lo normal',
  'params.param': 'Parámetro', 'params.value': 'Valor', 'params.ref': 'Normal', 'params.state': 'Estado',
  'p.acr': 'Albúmina/creatinina (orina)',
  'p.proteinuria': 'Proteinuria',
  'p.hematuria': 'Sedimento',
  'p.egfr': 'FGe',
  'p.bp': 'Presión arterial',
  'p.c3': 'C3',
  'p.c4': 'C4',
  'p.gbm': 'Grosor de la MBG',
  'p.antiDsDna': 'Anti-dsDNA',
  'p.flcLambda': 'Cadenas ligeras λ libres',
  'p.flcRatio': 'Cociente κ/λ',
  'p.crp': 'PCR',
  'p.extra': 'Extrarrenal',
  'p.retina': 'Retinopatía diabética',
  'hem.none': 'Sin hematuria',
  'hem.micro': 'Microhematuria',
  'hem.micro-macro': 'Micro + brotes de macrohematuria',
  'casts': 'cilindros hemáticos',
  'state.low': '↓ bajo', 'state.high': '↑ alto', 'state.normal': '✓ normal', 'state.abn': '✕ alterado',
  'yes': 'sí', 'no': 'no',
  'extra.hearing': 'hipoacusia neurosensorial',
  'extra.lenticonus': 'lenticono',
  'extra.none': 'sin hallazgos',
  'retina.yes': 'probable (apoya el origen diabético)',
  'retina.no': 'aún no esperable',
  'nephrotic': 'rango nefrótico',
  'assay': 'depende del laboratorio',

  'what.title': '¿Qué está pasando?',
  'what.hint': 'Se iluminan los pasos activos con los parámetros actuales.',

  'micro.title': 'Anatomía patológica y tratamiento',
  'micro.lm': 'Microscopía óptica',
  'micro.if': 'Inmunofluorescencia',
  'micro.em': 'Microscopía electrónica',
  'micro.tx': 'Tratamiento',

  'history.title': 'Historia natural',
  'history.dn.egfr': 'FGe (mL/min/1,73 m²) según los años de diabetes',
  'history.dn.acr': 'Albúmina/creatinina (mg/g, escala logarítmica)',
  'history.al.egfr': 'FGe (mL/min/1,73 m²) según la edad',
  'history.x.years': 'Años de diabetes',
  'history.x.age': 'Edad (años)',
  'history.untreated': 'Sin tratamiento',
  'history.treated': 'Con tratamiento',
  'history.now': 'Ahora',
  'history.table': 'Ver como tabla',
  'history.chart': 'Ver gráfico',
  'history.milestones': 'Hitos',
  'history.none': 'La historia natural se muestra en nefropatía diabética y en Alport. En lupus y amiloidosis la evolución depende del tratamiento de la enfermedad de base.',
  'history.ref60': 'FGe 60',
  'history.ref15': 'FGe 15 · IRT',
  'history.band.A1': 'A1', 'history.band.A2': 'A2', 'history.band.A3': 'A3',
  'history.col.t.years': 'Año', 'history.col.t.age': 'Edad',

  'refs.title': 'Valores de referencia (adulto)',
  'presets.title': 'Escenarios para clase',
  'presets.hint': 'Cada escenario tiene un enlace directo para proyectarlo o compartirlo.',
  'presets.open': 'Abrir',
  'presets.copy': 'Copiar enlace',
  'presets.copied': 'Copiado',
};

/* ---- ES long texts ---- */
ES.steps = {
  'n-endothelium': ['Endotelio fenestrado', 'Poros de 70–100 nm: pasan agua y solutos, no células.'],
  'n-gbm': ['Membrana basal glomerular (≈ 300–430 nm)', 'Red de colágeno IV α3-α4-α5 y laminina: barrera de tamaño y de carga.'],
  'n-podocyte': ['Podocitos y diafragma de hendidura', 'Pedicelos interdigitados unidos por nefrina y podocina: la última barrera para la albúmina.'],
  'n-mesangium': ['Mesangio', 'Sostiene el ovillo; células contráctiles y fagocíticas con poca matriz.'],

  'dn-hyperglycemia': ['Hiperglucemia mantenida', 'Glucosilación no enzimática → AGEs; estrés oxidativo y estado proinflamatorio.'],
  'dn-hyperfiltration': ['Hiperfiltración', 'Vasodilatación aferente y vasoconstricción eferente por angiotensina II → ↑ presión intraglomerular y ↑ FG.'],
  'dn-gbm': ['Engrosamiento de la MBG', 'Primera lesión (2–5 años). Clase RPS I: > 430 nm en varones, > 395 nm en mujeres.'],
  'dn-mesangium': ['Expansión de la matriz mesangial', 'TGF-β1 (estimulado por Ang II e hiperglucemia) → más matriz: glomeruloesclerosis difusa, la lesión más frecuente. Clase II.'],
  'dn-hyalinosis': ['Hialinosis arteriolar aferente y eferente', 'La hialinosis de la eferente es la más específica de la diabetes.'],
  'dn-albuminuria': ['Albuminuria moderadamente elevada (A2)', 'Albúmina/creatinina 30–299 mg/g: marcador de riesgo renal y cardiovascular. Indica IECA o ARA-II.'],
  'dn-kw': ['Nódulos de Kimmelstiel-Wilson', 'Glomeruloesclerosis nodular PAS+: la lesión más característica. Clase III.'],
  'dn-proteinuria': ['Albuminuria intensa (A3): nefropatía establecida', '≥ 300 mg/g, puede llegar a rango nefrótico; aparece HTA.'],
  'dn-sclerosis': ['Esclerosis global y pérdida de nefronas', 'Sin tratamiento el FGe cae ~10 mL/min/año. > 50 % de glomérulos esclerosados = clase IV.'],
  'dn-eskd': ['Enfermedad renal terminal', 'FGe < 15: diálisis o trasplante (riñón-páncreas en DM1).'],

  'ln-tolerance': ['Pérdida de tolerancia inmunológica', 'Predisposición genética + factores ambientales → autoanticuerpos (ANA, anti-dsDNA).'],
  'ln-ic': ['Inmunocomplejos DNA–anti-DNA', 'Hipersensibilidad tipo III: inmunocomplejos circulantes o formados in situ que se depositan en el glomérulo.'],
  'ln-mesangial': ['Depósito mesangial', 'Clases I–II; en la II, además, hipercelularidad mesangial.'],
  'ln-complement': ['Consumo de complemento por la vía clásica', '↓ C3 y ↓ C4 (en la GN postinfecciosa: ↓ C3 con C4 normal).'],
  'ln-subendo': ['Depósito subendotelial', 'En contacto con la sangre: atrae neutrófilos y macrófagos («asas de alambre»).'],
  'ln-proliferation': ['Proliferación endocapilar ± semilunas', 'Clase III (< 50 % de glomérulos) o IV (≥ 50 %): hematuria con cilindros hemáticos, HTA, ↓ FG.'],
  'ln-subepi': ['Depósito subepitelial', 'Lesiona el podocito sin inflamación: síndrome nefrótico (clase V, sola o con III/IV).'],
  'ln-sclerosis': ['Esclerosis glomerular', 'Clase VI: ≥ 90 % de glomérulos con esclerosis global, sin actividad.'],

  'al-mutation': ['Mutación del colágeno IV', 'COL4A5 (ligada al X, ~80 %) o COL4A3/COL4A4 (autosómica).'],
  'al-network': ['Falta la red α3-α4-α5', 'Persiste la red embrionaria α1-α1-α2, menos resistente.'],
  'al-fragile': ['MBG frágil frente a la proteólisis', 'Primero adelgazada; después engrosamiento irregular con desdoblamiento de la lámina densa.'],
  'al-hematuria': ['Roturas de la MBG → hematuria', 'Microhematuria desde la infancia; brotes de macrohematuria en varones con la forma ligada al X.'],
  'al-lamellation': ['Aspecto en «cesta de mimbre»', 'Lámina densa desdoblada y estratificada, alternando zonas gruesas y finas.'],
  'al-proteinuria': ['Proteinuria', 'Marca el inicio de la progresión; momento de iniciar IECA/ARA-II si no se había hecho.'],
  'al-sclerosis': ['Esclerosis y ↓ FG', 'Glomeruloesclerosis y fibrosis intersticial progresivas.'],
  'al-eskd': ['Enfermedad renal terminal', 'En varones con la forma ligada al X, típicamente entre los 15 y 35 años. Tras el trasplante: riesgo de anti-MBG (~0,4 %).'],
  'al-ear': ['Hipoacusia neurosensorial', 'La misma red de colágeno IV falta en la cóclea (bilateral, frecuencias agudas).'],
  'al-eye': ['Lenticono anterior / cataratas', 'Cápsula del cristalino frágil; también retinopatía en motas.'],

  'am-precursor.AL': ['Cadenas ligeras monoclonales (λ > κ)', 'Discrasia de células plasmáticas: gammapatía monoclonal o mieloma.'],
  'am-precursor.AA': ['Proteína amiloide sérica A (SAA)', 'Reactante de fase aguda elevado por inflamación crónica: reumáticas (~50 %), infecciones crónicas (~20 %), EII, fiebre mediterránea familiar.'],
  'am-misfold': ['Plegamiento anómalo en lámina β', 'Fibrillas rígidas no ramificadas de 8–12 nm, resistentes a la proteólisis.'],
  'am-deposit': ['Depósito extracelular', 'Mesangio, paredes capilares y vasos. Rojo Congo: birrefringencia verde manzana.'],
  'am-podocyte': ['Daño podocitario → proteinuria', 'Sin inflamación: sedimento sin hematuria.'],
  'am-nephrotic': ['Síndrome nefrótico', 'Proteinuria ≥ 3,5 g/día.'],
  'am-vessels': ['Vasos rígidos → TA baja', 'La infiltración vascular (y la neuropatía autonómica o la cardiopatía) impide adaptarse a los cambios de presión.'],
  'am-sclerosis': ['Pérdida de función renal', 'El depósito sustituye al glomérulo; el pronóstico depende de la enfermedad de base.'],
};

ES.findings = {
  normal: () => ({
    lm: 'Ovillo con asas capilares abiertas, mesangio escaso (≤ 3 células por área mesangial) y cápsula de Bowman fina.',
    if: 'Negativa.',
    em: 'MBG ≈ 350 nm con lámina densa central; endotelio fenestrado; pedicelos con diafragma de hendidura.',
    tx: null,
  }),
  diabetic: (s, f) => {
    const p = s.extra.point;
    const parts = ['Expansión de la matriz mesangial' + (p.mes > 0.25 ? ' (glomeruloesclerosis difusa)' : ' leve')];
    if (p.nodules > 0) parts.push('nódulos PAS+ de Kimmelstiel-Wilson');
    if (p.hyalAff > 0.1) parts.push('hialinosis de arteriolas aferente y eferente');
    if (p.gs > 0.05) parts.push(`esclerosis global en ~${Math.round(p.gs * 100)} % de los glomérulos`);
    return {
      lm: p.gbm <= 430 && p.mes < 0.05 ? 'Glomérulos aumentados de tamaño (hipertrofia), sin lesiones claras todavía.' : cap(parts.join('; ')) + '.',
      if: 'Refuerzo lineal de IgG (y albúmina) en la MBG y la membrana basal tubular por atrapamiento inespecífico; sin C3 ni depósitos inmunes.',
      em: `Engrosamiento difuso y homogéneo de la MBG (≈ ${f(p.gbm)} nm) y aumento de la matriz mesangial; borramiento de pedicelos. Sin depósitos electrón-densos.`,
      tx: [
        'Control glucémico individualizado: HbA1c de < 6,5 % a < 8 % según el paciente (KDIGO 2022).',
        'TA < 130/80 mmHg (KDIGO 2021 propone PAS < 120 si se tolera).',
        'IECA o ARA-II a la dosis máxima tolerada si la albuminuria es ≥ 30 mg/g, incluso con TA normal; nunca juntos (ni con aliskiren). Vigilar K⁺ y creatinina.',
        'iSGLT2 si FGe ≥ 20: nefroprotección independiente de la HbA1c (efectos adversos: candidiasis genital, cetoacidosis).',
        'Finerenona en DM2 con albuminuria ≥ 30 mg/g, FGe ≥ 25 y K⁺ normal.',
        'arGLP-1: beneficio cardiovascular y pérdida de peso. Estatina, no fumar, poca sal.',
        'Una caída del FGe < 30 % al iniciar IECA/ARA-II o iSGLT2 es hemodinámica y esperable; si es > 30 %, buscar estenosis de arteria renal u otra nefropatía.',
        'FGe < 15: diálisis o trasplante (riñón-páncreas en DM1).',
      ],
    };
  },
  lupus: (s) => {
    const c = s.cls;
    const x = s.extra;
    const lmBy = {
      I: 'Glomérulos normales en microscopía óptica; depósitos mesangiales solo en IF/ME.',
      II: 'Hipercelularidad mesangial pura con depósitos mesangiales.',
      III: 'Proliferación endocapilar (± semilunas, necrosis) en < 50 % de los glomérulos.',
      IV: 'Proliferación endocapilar difusa en ≥ 50 % de los glomérulos: asas de alambre, trombos hialinos, semilunas.',
      V: 'Engrosamiento difuso de las paredes capilares por depósitos subepiteliales (aspecto membranoso), con «espículas» en la plata.',
      VI: '≥ 90 % de los glomérulos con esclerosis global, sin actividad residual.',
    };
    const base = c.split('+')[0];
    let lm = lmBy[base];
    if (c.includes('+V')) lm += ' Además, depósitos subepiteliales globales o segmentarios (componente membranoso, clase V).';
    const locs = ['mesangiales'];
    if (s.scene.depSubendothelial > 0.05 || x.prolif > 0) locs.push('subendoteliales');
    if (x.subepi || x.prolif > 0) locs.push('subepiteliales');
    return {
      lm,
      if: `Patrón «full house»: IgG, IgA, IgM, C3 y C1q con depósitos granulares ${list(locs, 'y')}.`,
      em: `Depósitos electrón-densos ${list(locs, 'y')}; inclusiones tubulorreticulares en el endotelio (huella del interferón).`,
      tx: [
        {
          'ln-tx-mild': 'Clases I–II: no precisan inmunosupresión por la nefritis. IECA/ARA-II si hay proteinuria y tratar el LES extrarrenal.',
          'ln-tx-induction': 'Clases III/IV (± V): inducción con glucocorticoides (bolos de metilprednisolona y pauta oral descendente) + micofenolato o ciclofosfamida IV a dosis bajas. KDIGO 2024 contempla la triple terapia añadiendo belimumab o un inhibidor de la calcineurina (voclosporina); obinutuzumab aprobado en 2025 junto al tratamiento estándar; rituximab en refractarios. Mantenimiento con micofenolato (azatioprina en el embarazo).',
          'ln-tx-v': 'Clase V pura: IECA/ARA-II y control estricto de la TA; inmunosupresión (micofenolato, inhibidor de la calcineurina o rituximab) si la proteinuria es nefrótica o persiste.',
          'ln-tx-vi': 'Clase VI: no se inmunosuprime por el riñón; tratamiento de la ERC y preparación para diálisis o trasplante (la recidiva en el injerto es rara).',
        }[x.treatment],
        'Todos: hidroxicloroquina (revisión oftalmológica periódica), TA < 130/80 con bloqueo del SRAA, protección solar y anticoagulación si hay síndrome antifosfolípido.',
      ],
    };
  },
  alport: (s, f) => {
    const g = s.extra.genotype;
    const p = s.extra.point;
    const ifBy = {
      'xl-m': 'IF convencional negativa. Cadena α5 del colágeno IV ausente en la MBG y en la cápsula de Bowman.',
      'xl-f': 'IF convencional negativa. Cadena α5 en mosaico (inactivación del cromosoma X).',
      ar: 'IF convencional negativa. α3-α5 ausentes en la MBG; α5 presente en la cápsula de Bowman (red α5-α5-α6).',
      ad: 'IF convencional negativa. Tinción del colágeno IV normal.',
    };
    const em = p.lamellation > 0.3
      ? `Engrosamiento irregular (media ≈ ${f(p.gbmNm)} nm) alternando con zonas finas; lámina densa desdoblada y estratificada («cesta de mimbre»).`
      : p.lamellation > 0.02
        ? `MBG irregular (≈ ${f(p.gbmNm)} nm) con focos de desdoblamiento de la lámina densa.`
        : `MBG difusamente adelgazada (≈ ${f(p.gbmNm)} nm; normal 300–430).`;
    return {
      lm: p.gs > 0.15
        ? `Esclerosis segmentaria y global (~${Math.round(p.gs * 100)} % de glomérulos), fibrosis intersticial y células espumosas intersticiales.`
        : 'Inespecífica o normal en las fases iniciales.',
      if: ifBy[g],
      em,
      tx: [
        'Sin tratamiento curativo. IECA/ARA-II precoz (desde la microalbuminuria o la proteinuria; en varones con la forma ligada al X, incluso antes) retrasa la IRT años.',
        'iSGLT2 como añadido en adultos con proteinuria; restricción de sal y control de lípidos.',
        'Estudio genético (evita la biopsia) y consejo familiar: madres portadoras, cribado de hermanos.',
        'Audiometría y revisión oftalmológica. Diálisis y trasplante; tras el trasplante, vigilar GN anti-MBG (~0,4 %).',
      ],
    };
  },
  amyloid: (s) => {
    const t = s.extra.type;
    return {
      lm: 'Material amorfo eosinófilo, PAS débil y plata negativo, en mesangio, paredes capilares y vasos. Rojo Congo positivo con birrefringencia verde manzana en luz polarizada.',
      if: t === 'AL' ? 'Cadena ligera monotípica λ (restricción de cadena ligera).' : 'Negativa para cadenas ligeras; inmunohistoquímica positiva para SAA.',
      em: 'Fibrillas rectas, no ramificadas, de 8–12 nm, dispuestas al azar en mesangio y MBG; «espículas» subepiteliales.',
      tx: t === 'AL'
        ? [
          'Tratar la discrasia de células plasmáticas: daratumumab + ciclofosfamida-bortezomib-dexametasona; trasplante autólogo en candidatos seleccionados.',
          'Valorar afectación cardíaca (NT-proBNP, troponina): marca el pronóstico.',
          'Diagnóstico: biopsia de grasa abdominal o rectal antes que la renal; cadenas ligeras libres e inmunofijación.',
        ]
        : [
          'Tratar la enfermedad de base hasta normalizar SAA/PCR: biológicos (anti-TNF, tocilizumab, anakinra) en reumáticas; antibióticos o cirugía en infecciones crónicas.',
          'Colchicina en la fiebre mediterránea familiar.',
          'Diagnóstico: biopsia de grasa abdominal o rectal (o renal). Diálisis o trasplante si IRT.',
        ],
    };
  },
};

ES.milestones = {
  'ms-hyperfiltration': (m, f) => `Pico de hiperfiltración (FGe ≈ ${f(m.p.egfr)})`,
  'ms-gbm': () => 'MBG > 430 nm → clase RPS I',
  'ms-a2': () => 'Albuminuria A2 (≥ 30 mg/g)',
  'ms-tx': (m, f) => `Inicio del tratamiento: caída inicial del FGe del ${f(m.dip * 100)} % (hemodinámica, esperable < 30 %)`,
  'ms-mes': () => 'Expansión mesangial → clase II',
  'ms-a3': () => 'Albuminuria A3 (≥ 300 mg/g): nefropatía establecida',
  'ms-kw': () => 'Primer nódulo de Kimmelstiel-Wilson → clase III',
  'ms-g3': () => 'FGe < 60 (G3)',
  'ms-class4': () => '> 50 % de glomérulos esclerosados → clase IV',
  'ms-eskd': () => 'FGe < 15: enfermedad renal terminal',
  'ms-hematuria': () => 'Microhematuria desde el nacimiento',
  'ms-macro': () => 'Brotes de macrohematuria en la infancia',
  'ms-proteinuria': () => 'Aparece proteinuria',
  'ms-hearing': () => 'Hipoacusia neurosensorial',
  'ms-lenticonus': () => 'Lenticono anterior',
};
ES.msTime = (t, kind, f) => (kind === 'age' ? `${f(t)} a` : `año ${f(t)}`);

ES.refs = [
  ['Grosor de la MBG', '≈ 300–430 nm (adulto); < 250 nm = MBG delgada'],
  ['Albúmina/creatinina', '< 30 mg/g (A1) · 30–299 (A2) · ≥ 300 (A3)'],
  ['Proteinuria', '< 0,15 g/día · nefrótica ≥ 3,5 g/día'],
  ['FGe', '≥ 90 mL/min/1,73 m² (G1) · < 60 = ERC si persiste > 3 meses · < 15 = G5'],
  ['Presión arterial', 'Objetivo < 130/80 mmHg en ERC con albuminuria'],
  ['C3 / C4', '≈ 90–180 / 10–40 mg/dL (según laboratorio)'],
  ['Cadenas ligeras libres', 'κ 3,3–19,4 · λ 5,7–26,3 mg/L · κ/λ 0,26–1,65'],
];

ES.presets = {
  'normal': ['Glomérulo normal', 'Referencia: barrera de filtración intacta.'],
  'dn-hyperfiltration': ['DM, 2 años: hiperfiltración', 'FGe alto, albuminuria normal, todavía sin clase RPS.'],
  'dn-moderate-albuminuria': ['DM, 11 años: albuminuria A2', 'Expansión mesangial (clase IIa) y microalbuminuria.'],
  'dn-kimmelstiel-wilson': ['DM, 17 años: nódulos de Kimmelstiel-Wilson', 'Clase III, albuminuria A3, HTA, sedimento sin hematuria.'],
  'dn-advanced': ['DM, 25 años: enfermedad renal terminal', 'Clase IV, esclerosis global, FGe < 15.'],
  'dn-treated': ['DM, 17 años con tratamiento', 'Mismo paciente con IECA/ARA-II + iSGLT2 desde la albuminuria.'],
  'ln-class-1': ['Lupus · clase I', 'Mesangial mínima: solo depósitos en IF/ME.'],
  'ln-class-2': ['Lupus · clase II', 'Mesangial proliferativa: proteinuria no nefrótica.'],
  'ln-class-3': ['Lupus · clase III', 'Focal: proliferación en < 50 % de los glomérulos.'],
  'ln-class-4': ['Lupus · clase IV', 'Difusa: la de peor pronóstico; ↓C3, ↓C4, HTA, ↓FG.'],
  'ln-class-4-5': ['Lupus · clase IV + V', 'Proliferativa difusa con componente membranoso.'],
  'ln-class-5': ['Lupus · clase V', 'Membranosa: síndrome nefrótico con complemento normal.'],
  'ln-class-6': ['Lupus · clase VI', 'Esclerosante avanzada: ≥ 90 % de esclerosis global.'],
  'alport-xl-boy': ['Alport ligado al X · niño de 8 años', 'Brotes de macrohematuria, MBG todavía fina.'],
  'alport-xl-man': ['Alport ligado al X · varón de 24 años', 'Proteinuria, hipoacusia, lenticono, FGe cerca de 15.'],
  'alport-xl-treated': ['Alport ligado al X · 24 años con IECA precoz', 'El mismo paciente con bloqueo del SRAA desde la proteinuria.'],
  'alport-carrier-woman': ['Portadora ligada al X · 45 años', 'Microhematuria y proteinuria leve; MBG en mosaico.'],
  'alport-ar': ['Alport autosómico recesivo · 16 años', 'Curso grave en ambos sexos.'],
  'alport-thin-gbm': ['MBG delgada (heterocigoto COL4A3/4)', 'Hematuria aislada, MBG < 250 nm, sin progresión.'],
  'amyloid-aa-ra': ['Amiloidosis AA · artritis reumatoide', 'Proteinuria nefrótica sin hematuria y TA baja.'],
  'amyloid-al-lambda': ['Amiloidosis AL · cadenas λ', 'Restricción λ en IF, cociente κ/λ bajo.'],
  'amyloid-congo-polarized': ['Rojo Congo en luz polarizada', 'Polarizador a 45°: birrefringencia verde manzana.'],
};

/* ================================================================ EN */
const EN = {
  locale: 'en-GB',
  'app.title': 'Secondary glomerulopathies',
  'app.subtitle': 'One glomerulus, four systemic diseases: diabetes, lupus, type IV collagen and amyloid. Move the controls and see what changes against normal.',
  'lang.label': 'Language',
  'footer': 'Teaching tool · not for clinical use',
  'footer.model': 'Values tagged “Model” are teaching simplifications, not clinical data.',
  'model.tag': 'Model',
  'model.tip': 'Simplification of the teaching model (rates, thresholds or typical values), not clinical data.',

  'entity.normal': 'Normal',
  'entity.diabetic': 'Diabetic nephropathy',
  'entity.lupus': 'Lupus nephritis',
  'entity.alport': 'Alport / thin GBM',
  'entity.amyloid': 'Amyloidosis',
  'mech.normal': 'Reference',
  'mech.diabetic': 'Metabolic-haemodynamic',
  'mech.lupus': 'Immunological',
  'mech.alport': 'Constitutional defect',
  'mech.amyloid': 'Deposition',
  'tabs.label': 'Entity',

  'view.3d': '3D',
  'view.lm': 'Light microscopy (2D)',
  'view.rotate': 'Auto-rotate',
  'view.hint3d': 'Drag to rotate · arrow keys',
  'view.title': 'Glomerulus',
  'view.showing': (v) => `Glomerulus shown: ${v}`,
  'view.aria3d': '3D glomerulus: capillary loops, mesangium, Bowman’s capsule and arterioles at the vascular pole',
  'legend.loop': 'Capillary loop (GBM)',
  'legend.mesangium': 'Mesangium',
  'legend.nucleus': 'Cell nuclei',
  'legend.ic': 'Immune complexes',
  'legend.amyloid': 'Amyloid (Congo red)',
  'legend.amyloidPol': 'Amyloid under polarised light',
  'legend.kw': 'Kimmelstiel-Wilson nodule',
  'legend.hyaline': 'Arteriolar hyalinosis',
  'legend.sclerosis': 'Sclerosis',
  'legend.crescent': 'Crescent',
  'legend.rbc': 'Red cells',
  'legend.protein': 'Filtered albumin',

  'lm.bowman': 'Bowman’s space',
  'lm.capsule': 'Bowman’s capsule',
  'lm.loop': 'Capillary loop',
  'lm.mesangium': 'Mesangium',
  'lm.aff': 'Afferent arteriole',
  'lm.eff': 'Efferent arteriole',
  'lm.kw': 'KW nodule',
  'lm.crescent': 'Crescent',
  'lm.wire': 'Wire loops',
  'lm.sclerosed': 'Global sclerosis',

  'em.title': 'Capillary wall · electron microscopy (to scale)',
  'em.lumen': 'Capillary lumen',
  'em.endo': 'Fenestrated endothelium',
  'em.gbm': 'GBM',
  'em.podo': 'Foot processes',
  'em.urinary': 'Urinary space',
  'em.normal': 'Normal ≈ 350 nm',
  'em.mesangium': 'Mesangium',
  'em.subendo': 'Subendothelial',
  'em.subepi': 'Subepithelial',
  'em.scale': '500 nm',
  'em.measure': (nm) => `GBM ≈ ${nm} nm`,
  'em.aria': (nm) => `Electron-microscopy diagram of the capillary wall; GBM width ≈ ${nm} nm versus ≈ 350 nm normal`,

  'biopsy.title': 'Biopsy: 20 glomeruli',
  'biopsy.hint': 'Click a glomerulus to show it above.',
  'biopsy.kind.normal': 'Normal',
  'biopsy.kind.lesion': 'With the entity’s lesion',
  'biopsy.kind.prolif': 'Proliferative (endo/extracapillary)',
  'biopsy.kind.sclerosed': 'Global sclerosis',
  'biopsy.count': (k, n, N) => `${k}: ${n}/${N} (${Math.round((100 * n) / N)}%)`,
  'biopsy.item': (i, k) => `Glomerulus ${i}: ${k}`,

  'controls.title': 'Controls',
  'dn.years': 'Years since diabetes onset',
  'dn.treated': 'Nephroprotective treatment from albuminuria (ACE inhibitor or ARB + SGLT2 inhibitor + glucose and BP control)',
  'play': 'Play',
  'pause': 'Pause',
  'ln.classes': 'ISN/RPS class (shortcut)',
  'ln.mesHyper': 'Mesangial hypercellularity',
  'ln.prolif': 'Glomeruli with proliferative lesions',
  'ln.subepi': 'Subepithelial deposits (membranous component)',
  'ln.sclerosis': 'Globally sclerosed glomeruli',
  'al.genotype': 'Genotype',
  'al.g.xl-m': 'X-linked · male (COL4A5)',
  'al.g.xl-f': 'X-linked · female carrier (COL4A5)',
  'al.g.ar': 'Autosomal recessive (COL4A3/COL4A4)',
  'al.g.ad': 'Heterozygous COL4A3/COL4A4 (AD; formerly “thin GBM”)',
  'al.age': 'Age',
  'al.adRisk': 'Proteinuria > 0.5 g/day (risk of progression)',
  'al.treated': 'Early ACE inhibitor/ARB',
  'am.type': 'Type',
  'am.AL': 'AL (primary · λ light chains)',
  'am.AA': 'AA (secondary · serum amyloid A)',
  'am.load': 'Amyloid load',
  'am.congo': 'Congo red stain',
  'am.polarized': 'Polarised light (crossed polarisers)',
  'am.angle': 'Polariser angle',
  'am.polHint': 'Rotate the polariser: each fibril goes dark when parallel or perpendicular to it and is brightest at 45° → apple green.',
  'am.needCongo': 'Turn on Congo red to see birefringence.',
  'unit.years': 'years',
  'unit.pct': '%',

  'class.none': 'No classifiable lesion',
  'class.rps': (c) => `RPS class ${c}`,
  'class.isn': (c) => `ISN/RPS class ${c}`,
  'class.kdigo': (a, g, r) => `${g} · ${a} · ${r} risk`,
  'risk.low': 'low', 'risk.moderate': 'moderate', 'risk.high': 'high', 'risk.very-high': 'very high',
  'class.alport': (g) => g,
  'class.amyloid': (t) => `${t} amyloidosis`,
  'class.normal': 'Normal glomerulus',

  'params.title': 'Values against normal',
  'params.param': 'Parameter', 'params.value': 'Value', 'params.ref': 'Normal', 'params.state': 'Status',
  'p.acr': 'Urine albumin/creatinine',
  'p.proteinuria': 'Proteinuria',
  'p.hematuria': 'Sediment',
  'p.egfr': 'eGFR',
  'p.bp': 'Blood pressure',
  'p.c3': 'C3',
  'p.c4': 'C4',
  'p.gbm': 'GBM width',
  'p.antiDsDna': 'Anti-dsDNA',
  'p.flcLambda': 'Free λ light chains',
  'p.flcRatio': 'κ/λ ratio',
  'p.crp': 'CRP',
  'p.extra': 'Extrarenal',
  'p.retina': 'Diabetic retinopathy',
  'hem.none': 'No haematuria',
  'hem.micro': 'Microscopic haematuria',
  'hem.micro-macro': 'Micro + bouts of macroscopic haematuria',
  'casts': 'red-cell casts',
  'state.low': '↓ low', 'state.high': '↑ high', 'state.normal': '✓ normal', 'state.abn': '✕ abnormal',
  'yes': 'yes', 'no': 'no',
  'extra.hearing': 'sensorineural hearing loss',
  'extra.lenticonus': 'lenticonus',
  'extra.none': 'none',
  'retina.yes': 'likely (supports a diabetic cause)',
  'retina.no': 'not yet expected',
  'nephrotic': 'nephrotic range',
  'assay': 'assay-dependent',

  'what.title': 'What’s happening?',
  'what.hint': 'Active steps light up for the current settings.',

  'micro.title': 'Pathology and treatment',
  'micro.lm': 'Light microscopy',
  'micro.if': 'Immunofluorescence',
  'micro.em': 'Electron microscopy',
  'micro.tx': 'Treatment',

  'history.title': 'Natural history',
  'history.dn.egfr': 'eGFR (mL/min/1.73 m²) by years of diabetes',
  'history.dn.acr': 'Albumin/creatinine (mg/g, log scale)',
  'history.al.egfr': 'eGFR (mL/min/1.73 m²) by age',
  'history.x.years': 'Years of diabetes',
  'history.x.age': 'Age (years)',
  'history.untreated': 'Untreated',
  'history.treated': 'Treated',
  'history.now': 'Now',
  'history.table': 'Show as table',
  'history.chart': 'Show chart',
  'history.milestones': 'Milestones',
  'history.none': 'Natural history is shown for diabetic nephropathy and Alport. In lupus and amyloidosis the course depends on treating the underlying disease.',
  'history.ref60': 'eGFR 60',
  'history.ref15': 'eGFR 15 · kidney failure',
  'history.band.A1': 'A1', 'history.band.A2': 'A2', 'history.band.A3': 'A3',
  'history.col.t.years': 'Year', 'history.col.t.age': 'Age',

  'refs.title': 'Reference values (adult)',
  'presets.title': 'Teaching scenarios',
  'presets.hint': 'Every scenario has a direct link to project or share it.',
  'presets.open': 'Open',
  'presets.copy': 'Copy link',
  'presets.copied': 'Copied',
};

EN.steps = {
  'n-endothelium': ['Fenestrated endothelium', '70–100 nm pores: water and solutes pass, cells do not.'],
  'n-gbm': ['Glomerular basement membrane (≈ 300–430 nm)', 'Type IV collagen α3-α4-α5 network and laminin: size and charge barrier.'],
  'n-podocyte': ['Podocytes and slit diaphragm', 'Interdigitating foot processes joined by nephrin and podocin: the last barrier to albumin.'],
  'n-mesangium': ['Mesangium', 'Supports the tuft; contractile, phagocytic cells with little matrix.'],

  'dn-hyperglycemia': ['Sustained hyperglycaemia', 'Non-enzymatic glycation → AGEs; oxidative stress and a pro-inflammatory state.'],
  'dn-hyperfiltration': ['Hyperfiltration', 'Afferent dilatation and angiotensin II–driven efferent constriction → ↑ intraglomerular pressure and ↑ GFR.'],
  'dn-gbm': ['GBM thickening', 'First lesion (2–5 years). RPS class I: > 430 nm in men, > 395 nm in women.'],
  'dn-mesangium': ['Mesangial matrix expansion', 'TGF-β1 (driven by Ang II and hyperglycaemia) → more matrix: diffuse glomerulosclerosis, the commonest lesion. Class II.'],
  'dn-hyalinosis': ['Afferent and efferent arteriolar hyalinosis', 'Efferent hyalinosis is the most specific for diabetes.'],
  'dn-albuminuria': ['Moderately increased albuminuria (A2)', 'Albumin/creatinine 30–299 mg/g: a renal and cardiovascular risk marker. Start an ACE inhibitor or ARB.'],
  'dn-kw': ['Kimmelstiel-Wilson nodules', 'PAS-positive nodular glomerulosclerosis: the most characteristic lesion. Class III.'],
  'dn-proteinuria': ['Severely increased albuminuria (A3): overt nephropathy', '≥ 300 mg/g, may reach the nephrotic range; hypertension appears.'],
  'dn-sclerosis': ['Global sclerosis and nephron loss', 'Untreated, eGFR falls ~10 mL/min per year. > 50 % globally sclerosed glomeruli = class IV.'],
  'dn-eskd': ['Kidney failure', 'eGFR < 15: dialysis or transplant (kidney-pancreas in type 1 diabetes).'],

  'ln-tolerance': ['Loss of immune tolerance', 'Genetic predisposition + environmental triggers → autoantibodies (ANA, anti-dsDNA).'],
  'ln-ic': ['DNA–anti-DNA immune complexes', 'Type III hypersensitivity: circulating or in-situ complexes deposit in the glomerulus.'],
  'ln-mesangial': ['Mesangial deposits', 'Classes I–II; class II also has mesangial hypercellularity.'],
  'ln-complement': ['Classical-pathway complement consumption', '↓ C3 and ↓ C4 (post-infectious GN: ↓ C3 with normal C4).'],
  'ln-subendo': ['Subendothelial deposits', 'Exposed to blood: attract neutrophils and macrophages (“wire loops”).'],
  'ln-proliferation': ['Endocapillary proliferation ± crescents', 'Class III (< 50 % of glomeruli) or IV (≥ 50 %): haematuria with red-cell casts, hypertension, ↓ GFR.'],
  'ln-subepi': ['Subepithelial deposits', 'Podocyte injury without inflammation: nephrotic syndrome (class V, alone or with III/IV).'],
  'ln-sclerosis': ['Glomerulosclerosis', 'Class VI: ≥ 90 % of glomeruli globally sclerosed, without residual activity.'],

  'al-mutation': ['Type IV collagen mutation', 'COL4A5 (X-linked, ~80 %) or COL4A3/COL4A4 (autosomal).'],
  'al-network': ['No α3-α4-α5 network', 'The embryonic α1-α1-α2 network persists and is less resistant.'],
  'al-fragile': ['GBM vulnerable to proteolysis', 'Thin at first; later irregular thickening with splitting of the lamina densa.'],
  'al-hematuria': ['GBM breaks → haematuria', 'Microscopic haematuria from childhood; bouts of macroscopic haematuria in X-linked males.'],
  'al-lamellation': ['“Basket-weave” appearance', 'Split, layered lamina densa, alternating thick and thin segments.'],
  'al-proteinuria': ['Proteinuria', 'Marks the start of progression; start an ACE inhibitor/ARB if not already on one.'],
  'al-sclerosis': ['Sclerosis and ↓ GFR', 'Progressive glomerulosclerosis and interstitial fibrosis.'],
  'al-eskd': ['Kidney failure', 'Typically at 15–35 years in X-linked males. After transplant: risk of anti-GBM disease (~0.4 %).'],
  'al-ear': ['Sensorineural hearing loss', 'The same collagen IV network is missing in the cochlea (bilateral, high frequencies).'],
  'al-eye': ['Anterior lenticonus / cataract', 'Fragile lens capsule; also dot-and-fleck retinopathy.'],

  'am-precursor.AL': ['Monoclonal light chains (λ > κ)', 'Plasma-cell dyscrasia: monoclonal gammopathy or myeloma.'],
  'am-precursor.AA': ['Serum amyloid A protein (SAA)', 'Acute-phase reactant raised by chronic inflammation: rheumatic disease (~50 %), chronic infection (~20 %), IBD, familial Mediterranean fever.'],
  'am-misfold': ['β-sheet misfolding', 'Rigid, non-branching 8–12 nm fibrils that resist proteolysis.'],
  'am-deposit': ['Extracellular deposition', 'Mesangium, capillary walls and vessels. Congo red: apple-green birefringence.'],
  'am-podocyte': ['Podocyte injury → proteinuria', 'No inflammation: sediment without haematuria.'],
  'am-nephrotic': ['Nephrotic syndrome', 'Proteinuria ≥ 3.5 g/day.'],
  'am-vessels': ['Stiff vessels → low BP', 'Vascular infiltration (plus autonomic neuropathy or heart involvement) prevents adaptation to pressure changes.'],
  'am-sclerosis': ['Loss of kidney function', 'Deposits replace the glomerulus; prognosis depends on the underlying disease.'],
};

EN.findings = {
  normal: () => ({
    lm: 'Open capillary loops, scant mesangium (≤ 3 cells per mesangial area) and a thin Bowman’s capsule.',
    if: 'Negative.',
    em: 'GBM ≈ 350 nm with a central lamina densa; fenestrated endothelium; foot processes with slit diaphragms.',
    tx: null,
  }),
  diabetic: (s, f) => {
    const p = s.extra.point;
    const parts = ['Mesangial matrix expansion' + (p.mes > 0.25 ? ' (diffuse glomerulosclerosis)' : ', mild')];
    if (p.nodules > 0) parts.push('PAS-positive Kimmelstiel-Wilson nodules');
    if (p.hyalAff > 0.1) parts.push('afferent and efferent arteriolar hyalinosis');
    if (p.gs > 0.05) parts.push(`global sclerosis in ~${Math.round(p.gs * 100)} % of glomeruli`);
    return {
      lm: p.gbm <= 430 && p.mes < 0.05 ? 'Enlarged glomeruli (hypertrophy), no clear lesions yet.' : cap(parts.join('; ')) + '.',
      if: 'Linear IgG (and albumin) along the GBM and tubular basement membranes from non-specific trapping; no C3, no immune deposits.',
      em: `Diffuse, homogeneous GBM thickening (≈ ${f(p.gbm)} nm) and increased mesangial matrix; foot-process effacement. No electron-dense deposits.`,
      tx: [
        'Individualised glucose control: HbA1c from < 6.5 % to < 8 % depending on the patient (KDIGO 2022).',
        'BP < 130/80 mmHg (KDIGO 2021 suggests SBP < 120 if tolerated).',
        'ACE inhibitor or ARB at the maximum tolerated dose if albuminuria ≥ 30 mg/g, even if normotensive; never both (nor with aliskiren). Monitor K⁺ and creatinine.',
        'SGLT2 inhibitor if eGFR ≥ 20: nephroprotection independent of HbA1c (adverse effects: genital candidiasis, ketoacidosis).',
        'Finerenone in type 2 diabetes with albuminuria ≥ 30 mg/g, eGFR ≥ 25 and normal K⁺.',
        'GLP-1 receptor agonist: cardiovascular benefit and weight loss. Statin, no smoking, low salt.',
        'An eGFR fall < 30 % after starting an ACE inhibitor/ARB or SGLT2 inhibitor is haemodynamic and expected; if > 30 %, look for renal artery stenosis or another nephropathy.',
        'eGFR < 15: dialysis or transplant (kidney-pancreas in type 1 diabetes).',
      ],
    };
  },
  lupus: (s) => {
    const c = s.cls;
    const x = s.extra;
    const lmBy = {
      I: 'Normal glomeruli on light microscopy; mesangial deposits only on IF/EM.',
      II: 'Pure mesangial hypercellularity with mesangial deposits.',
      III: 'Endocapillary proliferation (± crescents, necrosis) in < 50 % of glomeruli.',
      IV: 'Diffuse endocapillary proliferation in ≥ 50 % of glomeruli: wire loops, hyaline thrombi, crescents.',
      V: 'Diffuse capillary-wall thickening from subepithelial deposits (membranous pattern), with “spikes” on silver stain.',
      VI: '≥ 90 % of glomeruli globally sclerosed, no residual activity.',
    };
    const base = c.split('+')[0];
    let lm = lmBy[base];
    if (c.includes('+V')) lm += ' Plus global or segmental subepithelial deposits (membranous component, class V).';
    const locs = ['mesangial'];
    if (s.scene.depSubendothelial > 0.05 || x.prolif > 0) locs.push('subendothelial');
    if (x.subepi || x.prolif > 0) locs.push('subepithelial');
    return {
      lm,
      if: `“Full house” pattern: IgG, IgA, IgM, C3 and C1q with granular ${list(locs, 'and')} deposits.`,
      em: `Electron-dense ${list(locs, 'and')} deposits; endothelial tubuloreticular inclusions (interferon footprint).`,
      tx: [
        {
          'ln-tx-mild': 'Classes I–II: no immunosuppression for the nephritis. ACE inhibitor/ARB if proteinuric; treat extrarenal SLE.',
          'ln-tx-induction': 'Classes III/IV (± V): induction with glucocorticoids (IV methylprednisolone pulses, then a tapering oral course) + mycophenolate or low-dose IV cyclophosphamide. KDIGO 2024 allows triple therapy adding belimumab or a calcineurin inhibitor (voclosporin); obinutuzumab approved in 2025 on top of standard therapy; rituximab for refractory disease. Maintenance with mycophenolate (azathioprine in pregnancy).',
          'ln-tx-v': 'Pure class V: ACE inhibitor/ARB and tight BP control; immunosuppression (mycophenolate, calcineurin inhibitor or rituximab) if proteinuria is nephrotic or persistent.',
          'ln-tx-vi': 'Class VI: no immunosuppression for the kidney; CKD care and preparation for dialysis or transplant (graft recurrence is rare).',
        }[x.treatment],
        'Everyone: hydroxychloroquine (regular eye checks), BP < 130/80 with RAAS blockade, sun protection, anticoagulation if antiphospholipid syndrome.',
      ],
    };
  },
  alport: (s, f) => {
    const g = s.extra.genotype;
    const p = s.extra.point;
    const ifBy = {
      'xl-m': 'Conventional IF negative. Collagen IV α5 absent from the GBM and Bowman’s capsule.',
      'xl-f': 'Conventional IF negative. Mosaic α5 staining (X-inactivation).',
      ar: 'Conventional IF negative. α3–α5 absent from the GBM; α5 present in Bowman’s capsule (α5-α5-α6 network).',
      ad: 'Conventional IF negative. Normal collagen IV staining.',
    };
    const em = p.lamellation > 0.3
      ? `Irregular thickening (mean ≈ ${f(p.gbmNm)} nm) alternating with thin segments; split, layered lamina densa (“basket-weave”).`
      : p.lamellation > 0.02
        ? `Irregular GBM (≈ ${f(p.gbmNm)} nm) with focal splitting of the lamina densa.`
        : `Diffusely thin GBM (≈ ${f(p.gbmNm)} nm; normal 300–430).`;
    return {
      lm: p.gs > 0.15
        ? `Segmental and global sclerosis (~${Math.round(p.gs * 100)} % of glomeruli), interstitial fibrosis and interstitial foam cells.`
        : 'Non-specific or normal in early stages.',
      if: ifBy[g],
      em,
      tx: [
        'No cure. Early ACE inhibitor/ARB (from microalbuminuria or proteinuria; in X-linked males, even earlier) delays kidney failure by years.',
        'SGLT2 inhibitor as add-on in proteinuric adults; salt restriction and lipid control.',
        'Genetic testing (avoids biopsy) and family counselling: carrier mothers, screening of siblings.',
        'Audiometry and eye review. Dialysis and transplant; after transplant, watch for anti-GBM GN (~0.4 %).',
      ],
    };
  },
  amyloid: (s) => {
    const t = s.extra.type;
    return {
      lm: 'Amorphous eosinophilic material, weakly PAS-positive and silver-negative, in mesangium, capillary walls and vessels. Congo red positive with apple-green birefringence under polarised light.',
      if: t === 'AL' ? 'Monotypic λ light chain (light-chain restriction).' : 'Negative for light chains; immunohistochemistry positive for SAA.',
      em: 'Straight, non-branching 8–12 nm fibrils, randomly arranged in mesangium and GBM; subepithelial “spicules”.',
      tx: t === 'AL'
        ? [
          'Treat the plasma-cell dyscrasia: daratumumab + cyclophosphamide-bortezomib-dexamethasone; autologous transplant in selected candidates.',
          'Assess cardiac involvement (NT-proBNP, troponin): it drives prognosis.',
          'Diagnosis: abdominal fat pad or rectal biopsy before kidney biopsy; serum free light chains and immunofixation.',
        ]
        : [
          'Treat the underlying disease until SAA/CRP normalise: biologics (anti-TNF, tocilizumab, anakinra) in rheumatic disease; antibiotics or surgery for chronic infection.',
          'Colchicine in familial Mediterranean fever.',
          'Diagnosis: abdominal fat pad or rectal (or kidney) biopsy. Dialysis or transplant if kidney failure.',
        ],
    };
  },
};

EN.milestones = {
  'ms-hyperfiltration': (m, f) => `Peak hyperfiltration (eGFR ≈ ${f(m.p.egfr)})`,
  'ms-gbm': () => 'GBM > 430 nm → RPS class I',
  'ms-a2': () => 'Albuminuria A2 (≥ 30 mg/g)',
  'ms-tx': (m, f) => `Treatment starts: early eGFR dip of ${f(m.dip * 100)} % (haemodynamic, expected < 30 %)`,
  'ms-mes': () => 'Mesangial expansion → class II',
  'ms-a3': () => 'Albuminuria A3 (≥ 300 mg/g): overt nephropathy',
  'ms-kw': () => 'First Kimmelstiel-Wilson nodule → class III',
  'ms-g3': () => 'eGFR < 60 (G3)',
  'ms-class4': () => '> 50 % glomeruli sclerosed → class IV',
  'ms-eskd': () => 'eGFR < 15: kidney failure',
  'ms-hematuria': () => 'Microscopic haematuria from birth',
  'ms-macro': () => 'Bouts of macroscopic haematuria in childhood',
  'ms-proteinuria': () => 'Proteinuria appears',
  'ms-hearing': () => 'Sensorineural hearing loss',
  'ms-lenticonus': () => 'Anterior lenticonus',
};
EN.msTime = (t, kind, f) => (kind === 'age' ? `age ${f(t)}` : `year ${f(t)}`);

EN.refs = [
  ['GBM width', '≈ 300–430 nm (adult); < 250 nm = thin GBM'],
  ['Albumin/creatinine', '< 30 mg/g (A1) · 30–299 (A2) · ≥ 300 (A3)'],
  ['Proteinuria', '< 0.15 g/day · nephrotic ≥ 3.5 g/day'],
  ['eGFR', '≥ 90 mL/min/1.73 m² (G1) · < 60 = CKD if > 3 months · < 15 = G5'],
  ['Blood pressure', 'Target < 130/80 mmHg in CKD with albuminuria'],
  ['C3 / C4', '≈ 90–180 / 10–40 mg/dL (assay-dependent)'],
  ['Serum free light chains', 'κ 3.3–19.4 · λ 5.7–26.3 mg/L · κ/λ 0.26–1.65'],
];

EN.presets = {
  'normal': ['Normal glomerulus', 'Reference: intact filtration barrier.'],
  'dn-hyperfiltration': ['Diabetes, 2 years: hyperfiltration', 'High eGFR, normal albuminuria, no RPS class yet.'],
  'dn-moderate-albuminuria': ['Diabetes, 11 years: albuminuria A2', 'Mesangial expansion (class IIa) and microalbuminuria.'],
  'dn-kimmelstiel-wilson': ['Diabetes, 17 years: Kimmelstiel-Wilson nodules', 'Class III, albuminuria A3, hypertension, bland sediment.'],
  'dn-advanced': ['Diabetes, 25 years: kidney failure', 'Class IV, global sclerosis, eGFR < 15.'],
  'dn-treated': ['Diabetes, 17 years, treated', 'Same patient on ACE inhibitor/ARB + SGLT2 inhibitor from albuminuria onset.'],
  'ln-class-1': ['Lupus · class I', 'Minimal mesangial: deposits on IF/EM only.'],
  'ln-class-2': ['Lupus · class II', 'Mesangial proliferative: non-nephrotic proteinuria.'],
  'ln-class-3': ['Lupus · class III', 'Focal: proliferation in < 50 % of glomeruli.'],
  'ln-class-4': ['Lupus · class IV', 'Diffuse: worst prognosis; ↓C3, ↓C4, hypertension, ↓GFR.'],
  'ln-class-4-5': ['Lupus · class IV + V', 'Diffuse proliferative with a membranous component.'],
  'ln-class-5': ['Lupus · class V', 'Membranous: nephrotic syndrome with normal complement.'],
  'ln-class-6': ['Lupus · class VI', 'Advanced sclerosing: ≥ 90 % global sclerosis.'],
  'alport-xl-boy': ['X-linked Alport · boy aged 8', 'Bouts of macroscopic haematuria, GBM still thin.'],
  'alport-xl-man': ['X-linked Alport · man aged 24', 'Proteinuria, hearing loss, lenticonus, eGFR near 15.'],
  'alport-xl-treated': ['X-linked Alport · 24, early ACE inhibitor', 'Same patient on RAAS blockade from proteinuria onset.'],
  'alport-carrier-woman': ['X-linked carrier · aged 45', 'Microscopic haematuria and mild proteinuria; mosaic GBM.'],
  'alport-ar': ['Autosomal recessive Alport · aged 16', 'Severe course in both sexes.'],
  'alport-thin-gbm': ['Thin GBM (heterozygous COL4A3/4)', 'Isolated haematuria, GBM < 250 nm, no progression.'],
  'amyloid-aa-ra': ['AA amyloidosis · rheumatoid arthritis', 'Nephrotic proteinuria without haematuria, low BP.'],
  'amyloid-al-lambda': ['AL amyloidosis · λ chains', 'λ restriction on IF, low κ/λ ratio.'],
  'amyloid-congo-polarized': ['Congo red under polarised light', 'Polariser at 45°: apple-green birefringence.'],
};

/* ---------- helpers ---------- */
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function list(arr, and) {
  if (arr.length <= 1) return arr.join('');
  return arr.slice(0, -1).join(', ') + ` ${and} ` + arr[arr.length - 1];
}

export const DICT = { es: ES, en: EN };
export const LANGS = ['es', 'en'];

export function makeT(lang) {
  const d = DICT[lang] || ES;
  const t = (key, ...args) => {
    const v = d[key];
    if (v === undefined) {
      if (typeof console !== 'undefined') console.warn(`[i18n] missing ${lang}:${key}`);
      return key;
    }
    return typeof v === 'function' ? v(...args) : v;
  };
  t.dict = d;
  t.lang = lang;
  const nf = (digits) => new Intl.NumberFormat(d.locale, { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  const cache = new Map();
  t.num = (x, digits = 0) => {
    if (!cache.has(digits)) cache.set(digits, nf(digits));
    return cache.get(digits).format(x);
  };
  return t;
}
