/* ============================================================
   ANIVERSARIO · app.js
   Motor mensual: la baraja de slides se genera según la fecha
   real. Cada mes, al llegar el día 4, las actividades se revelan;
   al terminar el día se ocultan/bloquean solas, ese mes pasa a
   ser un slide de foto y el contador salta al siguiente mes.
   ============================================================ */

/* ════════════════════════════════════════════════════════════
   ▶ CONFIGURACIÓN — todo lo que querrás editar está aquí
   ════════════════════════════════════════════════════════════ */
const CONFIG = {

  /* Primer mes (mes 0). Todo se cuenta a partir de aquí.       */
  BASE: "2025-11-04T00:00:00",   // 4 noviembre 2025 = "0 meses"

  /* Día del mes en que cae el mesiversario.                    */
  ANIV_DAY: 4,

  /* ──────────────────────────────────────────────────────────
     RECUERDOS DE CADA MES (slides de foto).
     El índice del arreglo = número de mes (0 = el inicio).
     Cuando termina el día de un mesiversario, ese mes aparece
     aquí automáticamente como un slide más.

     Para agregar un mes nuevo: añade una entrada con su foto
     (mes-N.jpg) y su nota. El "ordinal", la fecha y el "N meses"
     se calculan solos.
     ────────────────────────────────────────────────────────── */
  meses: [
    { // Mes 0 · 4 noviembre 2025
      foto:  "mes-0.jpg",
      title: { ordinal: "El inicio", name: "de todo" },
      note:  '<i data-lucide="map-pin" class="inline-icon"></i> Ecoparque Tángara. Un bonito fin de semana juntos.🍂',
    },
    { // Mes 1 · 4 diciembre 2025
      foto: "mes-1.jpg",
      note: '<i data-lucide="moon-star" class="inline-icon"></i> Un alumbrado feito, pero tú eras y eres la lucecita que necesitaba.',
    },
    { // Mes 2 · 4 enero 2026
      foto: "mes-2.jpg",
      note: '<i data-lucide="map-pin" class="inline-icon"></i> La fugitiva. El lugar fue un desacierto, pero estar contigo es todo lo que necesito. El mejor inicio de año igualmente.',
    },
    { // Mes 3 · 4 febrero 2026
      foto: "mes-3.jpg",
      note: '<i data-lucide="house-heart" class="inline-icon"></i> Empezamos nuestro hogar <i data-lucide="heart" class="inline-icon"></i>',
    },
    { // Mes 4 · 4 marzo 2026
      foto: "mes-4.jpg",
      note: 'Cuatro meses y ya no recuerdo cómo era esto sin ti. <i data-lucide="road" class="inline-icon"></i>',
    },
    { // Mes 5 · 4 abril 2026
      foto: "mes-5.jpg",
      note: 'No fue el mejor arte, pero era evidencia de que nos complementamos <i data-lucide="heart-handshake" class="inline-icon"></i>',
    },
    { // Mes 6 · 4 mayo 2026
      foto: "mes-6.jpg",
      note: '<i data-lucide="cat" class="inline-icon"></i> La mitad del camino al primer año. Y me encata saber que ha valido. <i data-lucide="paw-print" class="inline-icon"></i>',
    },
    { // Mes 7 · 4 junio 2026
      foto: "mes-7.jpg",
      note: '<i data-lucide="ice-cream" class="inline-icon"></i>No era el lugar que tenía planeado, pero me encanta estar contigo sin importar dónde',
    },
  ],

  /* ──────────────────────────────────────────────────────────
     ACTIVIDADES DEL DÍA (plantilla que se repite cada mes).
     · hh / mm     → hora exacta en que se revela la actividad
     · tag         → etiqueta de hora visible en el slide
     · titleTop/Em → título grande (Em va en cursiva)
     · label       → texto del countdown mientras falta
     · icon        → ícono de la tarjeta de revelación
     · heroIcon    → ícono grande central al revelarse
     · title/desc  → contenido de la tarjeta revelada
     · barLabel    → texto de la barra superior hacia esta actividad
     ────────────────────────────────────────────────────────── */
  actividades: [
    {
      hh: 0, mm: 0,
      tag: "12:00 am · Medianoche",
      titleTop: "Ocho meses", titleEm: "con mi amorcito",
      label: "Falta para nuestro octimesiversario",
      icon: "heart", heroIcon: "heart",
      title: "¡Felices 8 meses, mi amor!",
      desc: "Hoy cumplimos ocho meses juntos y tengo que admitir que las activides de hoy no están muy definidas ya que había otras cosas que no se podían mover, pero aquí estamos y juntos tenemos lo que necesitamos",
      barLabel: "Próximo",
    },
    {
      hh: 8, mm: 30,
      tag: "8:30 am · Desayunito",
      titleTop: "Buenos", titleEm: "días",
      label: "Ya casi desayunamos",
      icon: "sun", heroIcon: "sun",
      title: "Algo sencillito pa comer",
      desc: "Espero te guste lo que conseguí para desayunar (yo aún no sé qué es)",
      barLabel: "Siguiente",
    },
    {
      hh: 9, mm: 0,
      tag: "09:00 am · Reparaciones",
      titleTop: "Viene un man", titleEm: "a arreglar alguna cosa",
      label: "ni modo esto es un break",
      icon: "hammer", heroIcon: "hammer",
      title: "esperemos que no se demore",
      desc: "Este espacio está para reflexionar sobre las repraciones del hogar, y esto me sirve de alegoría para decir que arreglaste una parte importante de mi vida",
      barLabel: "Siguiente",
    },
    {
      hh: 13, mm: 30,
      tag: "13:30 · Almuercito",
      titleTop: "Creps & Waffles", titleEm: "nos espera",
      label: "Falta para el almuerzo",
      icon: "hamburger", heroIcon: "hamburger",
      title: "¡Es hora del comer!",
      desc: "Vamos a por esa ensalada que por alguna razón te sabe rico, y pues es mi deber y mi placer darte lo que te gusta :)",
      barLabel: "Almuercito",
    },
    {
      hh: 15, mm: 0,
      tag: "15:00  · La cita de Nicolás",
      titleTop: "Psicología", titleEm: ":)",
      label: "(no sé qué escribir aquí",
      icon: "brain", heroIcon: "brain",
      title: "Psicología",
      desc: "Ni modo, son cosas necesarias",
      barLabel: ":)",
    },
    {
      hh: 15, mm: 40,
      tag: "15:40 · Heladito",
      titleTop: "Un heladito y caminar", titleEm: "por el lago",
      label: "Heladito y charla",
      icon: "ice-cream-cone", heroIcon: "footprints",
      title: "Caminar y charlar",
      desc: "Como antes. Antes de que me hiciera un gángster",
      barLabel: "Heladito",
    },
{
      hh: 19, mm: 00,
      tag: "19:00 · Jugar",
      titleTop: "Juguemos juntos", titleEm: "lo que quieras",
      label: "Heladito y charla",
      icon: "joystick", heroIcon: "gamepad-2",
      title: "Hora de juegar",
      desc: "Hay que salvar el mundo del antiamor",
      barLabel: "mi amas vin",
    },
     {
      hh: 21, mm: 0,
      tag: "21:00 · Cierre",
      titleTop: "Ocho meses", titleEm: "y los que vienen",
      label: "Mensaje final del día",
      icon: "heart", heroIcon: "heart-handshake",
      title: "Es un placer tenerte",
      desc: "Este mensaje normalmente es a las 12, pero sé que te acuestas temprano y sólo quería contarte que te amo y que me encanta estar contigo. Feliz octimesiversario",
      barLabel: "",
    },
  ],

  CIERRE_LABEL: "Nuestro recuerdo",
};

/* ════════════════════════════════════════════════════════════
   UTILIDADES DE FECHA / TEXTO
   ════════════════════════════════════════════════════════════ */
const MESES_ABBR = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const MESES_FULL = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const DIAS_FULL  = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
const ORDINALES  = ["", "Primer","Segundo","Tercer","Cuarto","Quinto","Sexto","Séptimo",
                    "Octavo","Noveno","Décimo","Undécimo","Duodécimo"];

const pad   = n => String(n).padStart(2, "0");
const cap   = s => s.charAt(0).toUpperCase() + s.slice(1);
const ordinalWord = n => ORDINALES[n] || `${n}°`;

/* Fecha (Date) del mesiversario nº k */
function anivDate(k) {
  const base = new Date(CONFIG.BASE);
  return new Date(base.getFullYear(), base.getMonth() + k, CONFIG.ANIV_DAY, 0, 0, 0);
}
/* Medianoche del día siguiente al mesiversario nº k (cierre)  */
function cierreDate(k) {
  const base = new Date(CONFIG.BASE);
  return new Date(base.getFullYear(), base.getMonth() + k, CONFIG.ANIV_DAY + 1, 0, 0, 0);
}
function pastDateLabel(d) {
  return `${CONFIG.ANIV_DAY} · ${MESES_ABBR[d.getMonth()]} · ${d.getFullYear()}`;
}
function fullDateLabel(d) {
  return `${CONFIG.ANIV_DAY} de ${MESES_FULL[d.getMonth()]} · ${d.getFullYear()} · ${cap(DIAS_FULL[d.getDay()])}`;
}
function tagLabel(n) {
  return n === 0 ? "0 meses" : n === 1 ? "1 mes" : `${n} meses`;
}

/* ════════════════════════════════════════════════════════════
   ESTADO
   ════════════════════════════════════════════════════════════ */
let currentIndex        = 0;
let unlockedUpTo        = 0;
let gen                 = 0;     // generación: invalida timers tras un rebuild
let barTimerId          = null;
let dayEndTimerId       = null;
let mesiversarioHandled = false;

/* Layout dinámico de la baraja (se recalcula en cada build)    */
let LAYOUT = {
  total: 0,
  welcome: 0,
  pastStart: 1,
  pastCount: 0,
  countdown: 0,
  actStart: 0,
  actCount: 0,
  target: 0,          // número de mes objetivo
  targetDate: null,   // Date del mesiversario objetivo
  acts: [],           // actividades resueltas (con ids y target)
};

/* ════════════════════════════════════════════════════════════
   DOM persistente
   ════════════════════════════════════════════════════════════ */
const deckEl      = document.getElementById("deck");
const btnPrev     = document.getElementById("btn-prev");
const btnNext     = document.getElementById("btn-next");
const dotsWrap    = document.getElementById("nav-dots");
const nextBar     = document.getElementById("next-bar");
const nextBarLbl  = document.getElementById("next-bar-label");
const nextBarTime = document.getElementById("next-bar-time");
let slidesEls     = [];

/* ════════════════════════════════════════════════════════════
   CÁLCULO DEL CICLO ACTUAL
   Determina qué meses ya quedaron como recuerdo y cuál es el
   mesiversario objetivo (el que se está contando / viviendo).
   ════════════════════════════════════════════════════════════ */
function resolveCycle(now) {
  const base = new Date(CONFIG.BASE);
  const baseAbs = base.getFullYear() * 12 + base.getMonth();
  const nowAbs  = now.getFullYear() * 12 + now.getMonth();
  const kNow    = nowAbs - baseAbs;     // mes del mesiversario de este mes calendario

  const thisAniv = anivDate(kNow);
  const thisEnd  = cierreDate(kNow);

  let lastCompleted, target, phase;
  if (now < thisAniv) {
    lastCompleted = kNow - 1; target = kNow; phase = "before";
  } else if (now < thisEnd) {
    lastCompleted = kNow - 1; target = kNow; phase = "during";
  } else {
    lastCompleted = kNow;     target = kNow + 1; phase = "before";
  }
  if (lastCompleted < 0) lastCompleted = -1;
  if (target < 0)        target = 0;

  return { lastCompleted, target, phase };
}

/* ════════════════════════════════════════════════════════════
   GENERACIÓN DE LA BARAJA (HTML)
   ════════════════════════════════════════════════════════════ */
function unitsHTML(idPrefix, withDays) {
  const unit = (id, w) =>
    `<div class="time-unit"><span class="time-num" id="${id}">--</span><span class="time-word">${w}</span></div>`;
  const sep = `<div class="time-sep">:</div>`;
  let html = "";
  if (withDays) html += unit(`${idPrefix}-d`, "d") + sep;
  html += unit(`${idPrefix}-h`, "h") + sep
        + unit(`${idPrefix}-m`, "m") + sep
        + unit(`${idPrefix}-s`, "s");
  return html;
}

function welcomeHTML(idx) {
  return `
  <section class="slide slide-welcome" id="slide-${idx}" data-index="${idx}">
    <div class="slide-inner">
      <div class="badge">Nuestro camino juntos 🤍</div>
      <div class="hero-icon">
        <div class="icon-heart foto-heart"><img src="foto.jpg" alt="Nosotros" /></div>
      </div>
      <h1 class="display-title">Cada mes<br/><em>contigo</em></h1>
      <p class="body-text">
        Desde el 4 de noviembre de 2025,<br/>
        cada mes me recuerda que es mi felicidad quererte.
      </p>
      <div class="divider-ornament">✦ ✦ ✦</div>
      <p class="hint-text">Desliza para ver nuestra historia</p>
    </div>
  </section>`;
}

/* Datos del recuerdo del mes n. La foto se toma por convención
   (mes-N.jpg): basta subir la imagen con ese nombre para que el
   slide aparezca. CONFIG.meses[n] es opcional y solo sirve para
   personalizar la nota, la foto o el título.                    */
function mesData(n) {
  const m = CONFIG.meses[n] || {};
  return {
    foto:  m.foto  || `mes-${n}.jpg`,
    note:  m.note  || "",
    title: m.title || { ordinal: ordinalWord(n), name: "mesiversario" },
  };
}

function pastHTML(idx, n) {
  const data = mesData(n);
  const t    = data.title;
  const d    = anivDate(n);
  // La tarjeta de texto solo se muestra si ya escribiste una nota.
  const cardHTML = data.note
    ? `<div class="past-card"><p class="past-note">${data.note}</p></div>`
    : "";
  return `
  <section class="slide slide-past" id="slide-${idx}" data-index="${idx}">
    <div class="slide-inner">
      <div class="past-month-header">
        <span class="past-ordinal">${t.ordinal}</span>
        <span class="past-name">${t.name}</span>
        <span class="past-date">${pastDateLabel(d)}</span>
      </div>
      <div class="past-photo-wrap">
        <img src="${data.foto}" alt="${cap(MESES_FULL[d.getMonth()])} ${d.getFullYear()}" class="past-photo" />
        <div class="past-photo-overlay"><i data-lucide="heart" class="past-heart-icon"></i></div>
      </div>
      ${cardHTML}
      <div class="past-tag-pill">${tagLabel(n)}</div>
    </div>
  </section>`;
}

function countdownHTML(idx, n, date) {
  return `
  <section class="slide slide-main-countdown" id="slide-${idx}" data-index="${idx}">
    <div class="slide-inner">
      <div class="badge">Próximo mesiversario</div>
      <div class="month-number-display">${n}</div>
      <h2 class="section-title">${ordinalWord(n)}<br/><em>mesiversario</em></h2>
      <p class="slide-tag">${fullDateLabel(date)}</p>

      <div class="countdown-block main-countdown" id="countdown-main">
        <p class="countdown-label">Falta para nuestro día</p>
        <div class="countdown-display">${unitsHTML("cm", true)}</div>
      </div>

      <div class="letter-card small">
        <p>Ya viene el día. Tengo todo planeado para que sea especial. <i data-lucide="heart" class="past-heart-icon"></i></p>
      </div>
    </div>
  </section>`;
}

function activityHTML(idx, i, act) {
  const num = pad(i + 1);
  return `
  <section class="slide slide-activity locked" id="slide-${idx}" data-index="${idx}">
    <div class="slide-inner">
      <div class="lock-overlay" id="lock-${idx}">
        <i data-lucide="lock" class="lock-icon"></i>
        <p>Se abre cuando sea el momento</p>
      </div>
      <div class="activity-number">${num}</div>
      <div class="slide-tag">${act.tag}</div>
      <h2 class="section-title">${act.titleTop}<br/><em>${act.titleEm}</em></h2>
      <div class="countdown-block" id="cd-${idx}">
        <p class="countdown-label">${act.label}</p>
        <div class="countdown-display">${unitsHTML("a" + idx, false)}</div>
      </div>
      <div class="reveal-card hidden" id="rv-${idx}">
        <i data-lucide="${act.icon}" class="reveal-icon"></i>
        <h3>${act.title}</h3>
        <p class="reveal-desc">${act.desc}</p>
      </div>
    </div>
  </section>`;
}

/* Construye toda la baraja a partir de la fecha actual.        */
function build() {
  gen++;                                   // invalida cualquier timer anterior
  if (barTimerId)    { clearTimeout(barTimerId);    barTimerId = null; }
  if (dayEndTimerId) { clearTimeout(dayEndTimerId); dayEndTimerId = null; }
  mesiversarioHandled = false;

  const now   = new Date();
  const cycle = resolveCycle(now);
  const target = cycle.target;
  const targetDate = anivDate(target);

  // Meses que ya quedaron como recuerdo (0 .. lastCompleted).
  // Se muestran todos: la foto se toma por convención (mes-N.jpg),
  // así basta subir la imagen para que aparezca el slide del mes.
  const pastMonths = [];
  for (let k = 0; k <= cycle.lastCompleted; k++) {
    pastMonths.push(k);
  }

  // Índices
  let idx = 0;
  let html = "";

  const welcomeIdx = idx;
  html += welcomeHTML(idx++);

  const pastStart = idx;
  pastMonths.forEach(n => { html += pastHTML(idx++, n); });
  const pastCount = idx - pastStart;

  const countdownIdx = idx;
  html += countdownHTML(idx++, target, targetDate);

  const actStart = idx;
  const acts = CONFIG.actividades.map((act, i) => {
    const slideIdx = idx;
    html += activityHTML(idx++, i, act);
    return {
      ...act,
      index:      i,
      slideIdx,
      target:     new Date(targetDate.getFullYear(), targetDate.getMonth(), CONFIG.ANIV_DAY, act.hh, act.mm, 0).getTime(),
      countdownId:`cd-${slideIdx}`,
      revealId:   `rv-${slideIdx}`,
      lockId:     `lock-${slideIdx}`,
      spanH:      `a${slideIdx}-h`,
      spanM:      `a${slideIdx}-m`,
      spanS:      `a${slideIdx}-s`,
      nextBarLabel: act.barLabel,
    };
  });
  const actCount = idx - actStart;

  deckEl.innerHTML = html;
  slidesEls = deckEl.querySelectorAll(".slide");

  LAYOUT = {
    total: idx, welcome: welcomeIdx,
    pastStart, pastCount,
    countdown: countdownIdx,
    actStart, actCount,
    target, targetDate, acts, phase: cycle.phase,
  };

  unlockedUpTo = LAYOUT.countdown;   // bienvenida → countdown siempre accesibles
  buildDots();
  if (window.lucide) lucide.createIcons();
}

/* ════════════════════════════════════════════════════════════
   ARRANQUE / RECONSTRUCCIÓN
   ════════════════════════════════════════════════════════════ */
function init() {
  build();
  startMainCountdown();
  startActivityCountdowns();
  resolveLanding(true);
  initParticles();
}

/* Reconstruye la baraja (rollover de fin de mes) y reinicia.   */
function rebuild() {
  build();
  startMainCountdown();
  startActivityCountdowns();
  resolveLanding(false);
}

/* Decide en qué slide aterrizar y programa lo pendiente.       */
function resolveLanding(allowWelcome) {
  const now = Date.now();

  // Primera visita: bienvenida
  if (allowWelcome && !localStorage.getItem("visited")) {
    localStorage.setItem("visited", "1");
    goTo(LAYOUT.welcome);
    scheduleDayEnd();
    return;
  }

  // Antes del día: countdown principal
  if (now < LAYOUT.targetDate.getTime()) {
    goTo(LAYOUT.countdown);
    scheduleDayEnd();
    return;
  }

  // Ya es el día: revelar lo que corresponda y aterrizar en la actividad actual
  mesiversarioHandled = true;

  let lastTriggered = -1;
  for (let i = 0; i < LAYOUT.acts.length; i++) {
    if (now >= LAYOUT.acts[i].target) lastTriggered = i;
  }
  for (let i = 0; i <= lastTriggered; i++) revealActivity(i, false);

  scheduleNextAfter(lastTriggered);
  goTo(LAYOUT.actStart + Math.max(lastTriggered, 0));
}

/* ════════════════════════════════════════════════════════════
   REVELACIÓN DE ACTIVIDADES
   ════════════════════════════════════════════════════════════ */
function revealActivity(index, navigate) {
  const act = LAYOUT.acts[index];
  if (!act) return;

  unlockUpToActivity(index);

  const card = document.getElementById(act.revealId);
  if (card) card.classList.remove("hidden");

  const cdBlock = document.getElementById(act.countdownId);
  if (cdBlock) cdBlock.classList.add("done");

  const slideEl = document.getElementById("slide-" + act.slideIdx);
  if (slideEl) {
    slideEl.classList.add("revealed");
    ensureHeroIcon(slideEl, act);
  }

  if (window.lucide) lucide.createIcons();
  if (navigate) goTo(act.slideIdx);
}

function ensureHeroIcon(slideEl, act) {
  const inner = slideEl.querySelector(".slide-inner");
  if (!inner || inner.querySelector(".reveal-hero-icon")) return;
  const hero = document.createElement("i");
  hero.setAttribute("data-lucide", act.heroIcon || "heart");
  hero.className = "reveal-hero-icon";
  const card = document.getElementById(act.revealId);
  if (card) inner.insertBefore(hero, card);
  else      inner.appendChild(hero);
}

function unlockUpToActivity(index) {
  for (let j = 0; j <= index; j++) {
    const a = LAYOUT.acts[j];
    if (a) unlockSlide(a.slideIdx);
  }
}

function activateActivityLive(index) {
  revealActivity(index, true);
  scheduleNextAfter(index);
}

/* Programa la barra superior hacia la siguiente actividad (o,
   si ya no hay más, hacia el cierre del día → rollover).        */
function scheduleNextAfter(index) {
  const nextAct = LAYOUT.acts[index + 1];

  if (nextAct) {
    startBarCountdown(
      nextAct.nextBarLabel,
      nextAct.target,
      () => activateActivityLive(index + 1)
    );
    return;
  }
  // No hay más actividades → contar hacia el cierre del día
  const cierre = cierreDate(LAYOUT.target).getTime();
  if (Date.now() < cierre) {
    startBarCountdown(CONFIG.CIERRE_LABEL, cierre, rollOver);
  } else {
    rollOver();
  }
}

/* Fin del día: oculta la barra y reconstruye (el mes vivido pasa
   a ser un slide de foto y el contador salta al mes siguiente). */
function rollOver() {
  hideBar();
  rebuild();
}

function scheduleDayEnd() {
  if (dayEndTimerId) { clearTimeout(dayEndTimerId); dayEndTimerId = null; }
  const myGen  = gen;
  const cierre = cierreDate(LAYOUT.target).getTime();

  // setTimeout solo admite hasta 2^31-1 ms (~24.8 días). Un ciclo mensual
  // puede ser mayor (hasta ~31 días), y un delay mayor DESBORDA y dispara
  // el timer de inmediato → bucle de rebuild. Por eso troceamos la espera
  // en tramos seguros y re-verificamos al despertar.
  const MAX_DELAY = 2000000000;   // < 2^31-1, con margen
  function arm() {
    if (myGen !== gen) return;    // baraja reconstruida: este timer quedó obsoleto
    const diff = cierre - Date.now();
    if (diff <= 0) { rollOver(); return; }
    dayEndTimerId = setTimeout(arm, Math.min(diff, MAX_DELAY));
  }
  arm();
}

function onMesiversarioReached() {
  if (mesiversarioHandled) return;
  mesiversarioHandled = true;
  activateActivityLive(0);
}

/* ════════════════════════════════════════════════════════════
   NAVEGACIÓN
   ════════════════════════════════════════════════════════════ */
function isPastIndex(i) {
  return i >= LAYOUT.pastStart && i < LAYOUT.pastStart + LAYOUT.pastCount;
}

function buildDots() {
  dotsWrap.innerHTML = "";
  for (let i = 0; i < LAYOUT.total; i++) {
    const dot = document.createElement("button");
    dot.className = "dot" + (isPastIndex(i) ? " past-dot" : " locked-dot");
    dot.setAttribute("aria-label", `Sección ${i + 1}`);
    dot.dataset.index = i;
    dot.addEventListener("click", () => { if (i <= unlockedUpTo) goTo(i); });
    dotsWrap.appendChild(dot);
  }
}

function showSlide(index) {
  slidesEls.forEach((s, i) => {
    s.classList.remove("active", "passed");
    if (i === index)     s.classList.add("active");
    else if (i < index)  s.classList.add("passed");
  });
  if (window.lucide) lucide.createIcons();
  currentIndex = index;
  updateNav();
}

function updateNav() {
  btnPrev.disabled = currentIndex === 0;
  btnNext.disabled = currentIndex >= unlockedUpTo;

  const dots = dotsWrap.querySelectorAll(".dot");
  dots.forEach((dot, i) => {
    const past = isPastIndex(i);
    dot.classList.remove("active", "unlocked", "locked-dot", "past-dot");
    if (i === currentIndex) {
      dot.classList.add("active");
      if (past) dot.classList.add("past-dot");
    } else if (i <= unlockedUpTo) {
      dot.classList.add(past ? "past-dot" : "unlocked");
    } else {
      dot.classList.add("locked-dot");
    }
  });
}

function goTo(index) {
  if (index < 0 || index >= LAYOUT.total) return;
  if (index > unlockedUpTo) return;
  showSlide(index);
}

function unlockSlide(index) {
  const slide = document.getElementById(`slide-${index}`);
  if (!slide) return;
  slide.classList.remove("locked");
  const overlay = document.getElementById(`lock-${index}`);
  if (overlay) overlay.classList.add("hidden");
  if (index > unlockedUpTo) unlockedUpTo = index;
  updateNav();
}

btnPrev.addEventListener("click", () => goTo(currentIndex - 1));
btnNext.addEventListener("click", () => goTo(currentIndex + 1));

// Swipe táctil
(function() {
  let sx = 0, sy = 0;
  document.addEventListener("touchstart", e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  document.addEventListener("touchend",   e => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = Math.abs(e.changedTouches[0].clientY - sy);
    if (Math.abs(dx) > 50 && dy < 80) {
      if (dx < 0) goTo(currentIndex + 1);
      else         goTo(currentIndex - 1);
    }
  }, { passive: true });
})();

/* ════════════════════════════════════════════════════════════
   COUNTDOWN PRINCIPAL (al mesiversario objetivo)
   ════════════════════════════════════════════════════════════ */
function startMainCountdown() {
  const myGen  = gen;
  const target = LAYOUT.targetDate.getTime();
  const dEl = document.getElementById("cm-d");
  const hEl = document.getElementById("cm-h");
  const mEl = document.getElementById("cm-m");
  const sEl = document.getElementById("cm-s");

  function tick() {
    if (myGen !== gen) return;
    const diff = target - Date.now();
    if (diff <= 0) {
      if (dEl) dEl.textContent = "00";
      if (hEl) hEl.textContent = "00";
      if (mEl) mEl.textContent = "00";
      if (sEl) sEl.textContent = "00";
      onMesiversarioReached();
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (dEl) setTick(dEl, pad(d));
    if (hEl) setTick(hEl, pad(h));
    if (mEl) setTick(mEl, pad(m));
    if (sEl) setTick(sEl, pad(s));
    setTimeout(tick, 1000);
  }
  tick();
}

/* ════════════════════════════════════════════════════════════
   COUNTDOWNS DE ACTIVIDADES (red de seguridad por slide)
   ════════════════════════════════════════════════════════════ */
function startActivityCountdowns() {
  LAYOUT.acts.forEach((act, i) => startActivityCountdown(act, i));
}

function startActivityCountdown(act, index) {
  const myGen  = gen;
  const target = act.target;
  const hEl = document.getElementById(act.spanH);
  const mEl = document.getElementById(act.spanM);
  const sEl = document.getElementById(act.spanS);

  function tick() {
    if (myGen !== gen) return;
    const diff = target - Date.now();
    if (diff <= 0) {
      if (hEl) hEl.textContent = "00";
      if (mEl) mEl.textContent = "00";
      if (sEl) sEl.textContent = "00";
      revealActivity(index, false);   // red de seguridad, sin navegar
      return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (hEl) setTick(hEl, pad(h));
    if (mEl) setTick(mEl, pad(m));
    if (sEl) setTick(sEl, pad(s));
    setTimeout(tick, 1000);
  }
  tick();
}

/* ════════════════════════════════════════════════════════════
   BARRA SUPERIOR (cuenta continua hacia la próxima actividad)
   ════════════════════════════════════════════════════════════ */
function startBarCountdown(label, targetMs, onZero) {
  if (barTimerId) { clearTimeout(barTimerId); barTimerId = null; }
  const myGen = gen;

  nextBarLbl.textContent = label || "Próxima sorpresa";
  nextBar.classList.remove("hidden");

  let fired = false;
  function tick() {
    if (myGen !== gen) return;
    const diff = targetMs - Date.now();
    if (diff <= 0) {
      nextBarTime.textContent = "¡Ya!";
      if (!fired) { fired = true; if (typeof onZero === "function") onZero(); }
      return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    nextBarTime.textContent = h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
    barTimerId = setTimeout(tick, 1000);
  }
  tick();
}

function hideBar() {
  if (barTimerId) { clearTimeout(barTimerId); barTimerId = null; }
  nextBar.classList.add("hidden");
}

/* ════════════════════════════════════════════════════════════
   UTILIDAD: animación de tick en números
   ════════════════════════════════════════════════════════════ */
function setTick(el, value) {
  if (el.textContent === value) return;
  el.textContent = value;
  el.classList.remove("tick");
  void el.offsetWidth;
  el.classList.add("tick");
  setTimeout(() => el.classList.remove("tick"), 150);
}

/* ════════════════════════════════════════════════════════════
   PARTÍCULAS
   ════════════════════════════════════════════════════════════ */
function initParticles() {
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  function makeParticles(n) {
    return Array.from({ length: n }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.5 ? "#c9a84c" : "#d4a5b0",
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.01 + 0.005,
    }));
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      const alpha = p.alpha * (0.6 + 0.4 * Math.sin(t * p.speed + p.phase));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  resize();
  particles = makeParticles(55);
  window.addEventListener("resize", () => { resize(); particles = makeParticles(55); });
  requestAnimationFrame(draw);
}

/* ════════════════════════════════════════════════════════════
   ARRANQUE
   ════════════════════════════════════════════════════════════ */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
