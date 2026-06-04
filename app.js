/* ============================================================
   ANIVERSARIO · app.js
   ============================================================ */

/* ════════════════════════════════════════════════════════════
   ▶ CONFIGURACIÓN — todo lo que querrás editar está aquí
   ════════════════════════════════════════════════════════════ */
const CONFIG = {

  /* (Se conserva por compatibilidad. Ya no se usa para ocultar la
     barra superior: ahora la barra cuenta de forma continua hasta
     la siguiente actividad.)                                    */
  REVEAL_DURATION_MIN: 60,

  /* Fecha/hora del mesiversario actual (4 junio 2026 00:00)   */
  MESIVERSARIO_ACTUAL: "2026-06-04T00:00:00",

  /* Actividades del día del mesiversario.
     · target       → hora exacta en que se revela la actividad
     · slideId      → id del slide que contiene ese countdown
     · revealId     → id de la tarjeta de revelación
     · nextBarLabel → texto que aparece en la barra superior
                      mientras se cuenta hacia esta actividad
     · heroIcon     → ícono de Lucide grande que llena el centro
                      cuando la actividad se muestra a pantalla
                      completa                                   */
actividades: [
  {
    target:       "2026-06-04T00:00:00",
    slideId:      "slide-9",
    countdownId:  "countdown-9",
    revealId:     "reveal-9",
    lockId:       "lock-9",
    spanH: "c9-h", spanM: "c9-m", spanS: "c9-s",
    nextBarLabel: "Próximo",
    heroIcon:     "heart",
  },
  {
    target:       "2026-06-04T07:30:00",
    slideId:      "slide-10",
    countdownId:  "countdown-10",
    revealId:     "reveal-10",
    lockId:       "lock-10",
    spanH: "c10-h", spanM: "c10-m", spanS: "c10-s",
    nextBarLabel: "Siguiente",
    heroIcon:     "sun",
  },
  {
    target:       "2026-06-04T09:00:00",
    slideId:      "slide-11",
    countdownId:  "countdown-11",
    revealId:     "reveal-11",
    lockId:       "lock-11",
    spanH: "c11-h", spanM: "c11-m", spanS: "c11-s",
    nextBarLabel: "Siguiente",
    heroIcon:     "cake-slice",
  },
  {
    target:       "2026-06-04T17:00:00",
    slideId:      "slide-12",
    countdownId:  "countdown-12",
    revealId:     "reveal-12",
    lockId:       "lock-12",
    spanH: "c12-h", spanM: "c12-m", spanS: "c12-s",
    nextBarLabel: "Nuestra cita",
    heroIcon:     "map-pin",
  },
  {
    target:       "2026-06-04T20:30:00",
    slideId:      "slide-13",
    countdownId:  "countdown-13",
    revealId:     "reveal-13",
    lockId:       "lock-13",
    spanH: "c13-h", spanM: "c13-m", spanS: "c13-s",
    nextBarLabel: "Último",
    heroIcon:     "sparkles",
  },
  {
    target:       "2026-06-04T21:00:00",
    slideId:      "slide-14",
    countdownId:  "countdown-14",
    revealId:     "reveal-14",
    lockId:       "lock-14",
    spanH: "c14-h", spanM: "c14-m", spanS: "c14-s",
    nextBarLabel: "",
    heroIcon:     "heart",
  },
],

  /* Momento en que "se acaba el día": al llegar aquí aparece el
     slide de cierre (recuerdo del 7° mes + countdown al 8°).
     Por defecto, la medianoche del 4 → 5 de junio.             */
  CIERRE_TARGET: "2026-06-05T00:00:00",
  CIERRE_LABEL:  "Nuestro recuerdo",

  /* Fecha del siguiente mesiversario (para el slide de cierre) */
  SIGUIENTE_MESIVERSARIO: "2026-07-04T00:00:00",

  /* Índices de slides */
  SLIDE_BIENVENIDA:   0,
  SLIDE_PAST_INICIO:  1,   // primer mes pasado
  SLIDE_PAST_FIN:     7,   // último mes pasado
  SLIDE_COUNTDOWN:    8,   // countdown principal al mesiversario
  SLIDE_ACT_INICIO:   9,
  SLIDE_ACT_FIN:     14,
  SLIDE_CIERRE:      15,
  TOTAL_SLIDES:      16,
};

/* ════════════════════════════════════════════════════════════
   ESTADO
   ════════════════════════════════════════════════════════════ */
let currentIndex       = 0;
let unlockedUpTo       = CONFIG.SLIDE_PAST_FIN + 1; // slides pasados siempre accesibles
let barTimerId         = null;                      // timer único de la barra superior
let mesiversarioHandled = false;                    // evita disparar dos veces el inicio del día

/* ════════════════════════════════════════════════════════════
   DOM
   ════════════════════════════════════════════════════════════ */
const slidesEls   = document.querySelectorAll(".slide");
const btnPrev     = document.getElementById("btn-prev");
const btnNext     = document.getElementById("btn-next");
const dotsWrap    = document.getElementById("nav-dots");
const nextBar     = document.getElementById("next-bar");
const nextBarLbl  = document.getElementById("next-bar-label");
const nextBarTime = document.getElementById("next-bar-time");

/* ════════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════════ */
function init() {
  if (window.lucide) lucide.createIcons();

  buildDots();
  resolveInitialState();   // decide en qué slide abrir y programa el día
  startMainCountdown();
  startActivityCountdowns();
  startNextMonthCountdown();
  initParticles();
}

/* ════════════════════════════════════════════════════════════
   LÓGICA DE APERTURA AUTOMÁTICA
   Decide en qué slide debe aterrizar la app según la hora real
   y deja programadas las transiciones automáticas pendientes.
   ════════════════════════════════════════════════════════════ */
function resolveInitialState() {
  const now        = Date.now();
  const mesDate    = new Date(CONFIG.MESIVERSARIO_ACTUAL).getTime();
  const cierreDate = new Date(CONFIG.CIERRE_TARGET).getTime();

  // Primera visita: mostrar bienvenida y guardar que ya se vio
  if (!localStorage.getItem("visited")) {
    localStorage.setItem("visited", "1");
    unlockedUpTo = CONFIG.SLIDE_COUNTDOWN;
    goTo(CONFIG.SLIDE_BIENVENIDA);
    return;
  }

  // Antes del día: abrir en el countdown principal
  if (now < mesDate) {
    unlockedUpTo = CONFIG.SLIDE_COUNTDOWN;
    goTo(CONFIG.SLIDE_COUNTDOWN);
    return;
  }

  // Ya es el día (o después): el countdown principal ya está en cero,
  // marcamos para que no vuelva a disparar el inicio del día.
  mesiversarioHandled = true;

  // ¿Cuál fue la última actividad cuya hora ya pasó?
  let lastTriggered = -1;
  for (let i = 0; i < CONFIG.actividades.length; i++) {
    if (now >= new Date(CONFIG.actividades[i].target).getTime()) lastTriggered = i;
  }

  // Revelar (sin navegar) todas las actividades que ya ocurrieron
  for (let i = 0; i <= lastTriggered; i++) {
    revealActivity(i, false);
  }

  // Si ya terminó el día: mostrar directamente el slide de cierre
  if (now >= cierreDate) {
    unlockSlide(CONFIG.SLIDE_CIERRE);
    goTo(CONFIG.SLIDE_CIERRE);
    return;
  }

  // En medio del día: programar la siguiente transición en vivo
  // y aterrizar en la actividad actual.
  scheduleNextAfter(lastTriggered);
  goTo(CONFIG.SLIDE_ACT_INICIO + lastTriggered);
}

/* ════════════════════════════════════════════════════════════
   REVELACIÓN DE ACTIVIDADES (pantalla completa)
   ════════════════════════════════════════════════════════════ */

/* Revela una actividad: desbloquea, muestra la tarjeta, oculta el
   countdown e inserta el ícono central grande. Idempotente.
   Si navigate === true, además salta a ese slide.              */
function revealActivity(index, navigate) {
  const act = CONFIG.actividades[index];
  if (!act) return;
  const slideIndex = CONFIG.SLIDE_ACT_INICIO + index;

  unlockUpToActivity(index);

  const card = document.getElementById(act.revealId);
  if (card) card.classList.remove("hidden");

  const cdBlock = document.getElementById(act.countdownId);
  if (cdBlock) cdBlock.classList.add("done");

  const slideEl = document.getElementById("slide-" + slideIndex);
  if (slideEl) {
    slideEl.classList.add("revealed");
    ensureHeroIcon(slideEl, act);
  }

  if (window.lucide) lucide.createIcons();
  if (navigate) goTo(slideIndex);
}

/* Inserta (una sola vez) el ícono de Lucide grande que llena el
   centro cuando se oculta el countdown.                        */
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

/* Desbloquea todos los slides de actividad hasta el índice dado */
function unlockUpToActivity(index) {
  for (let j = 0; j <= index; j++) {
    const s = CONFIG.SLIDE_ACT_INICIO + j;
    if (s <= CONFIG.SLIDE_ACT_FIN) unlockSlide(s);
  }
}

/* Activación EN VIVO: revela + navega + programa la siguiente */
function activateActivityLive(index) {
  revealActivity(index, true);
  scheduleNextAfter(index);
}

/* Programa la barra superior hacia la siguiente actividad (o,
   si ya no hay más, hacia el cierre del día).                  */
function scheduleNextAfter(index) {
  const nextAct = CONFIG.actividades[index + 1];

  if (nextAct) {
    startBarCountdown(
      nextAct.nextBarLabel,
      new Date(nextAct.target).getTime(),
      () => activateActivityLive(index + 1)
    );
    return;
  }

  // No hay más actividades → contar hacia el cierre del día
  const cierre = new Date(CONFIG.CIERRE_TARGET).getTime();
  if (Date.now() < cierre) {
    startBarCountdown(CONFIG.CIERRE_LABEL, cierre, showClosingLive);
  } else {
    showClosingLive();
  }
}

/* Muestra el slide de cierre (recuerdo + countdown al 8°)      */
function showClosingLive() {
  hideBar();
  unlockSlide(CONFIG.SLIDE_CIERRE);
  goTo(CONFIG.SLIDE_CIERRE);
}

/* Se ejecuta cuando el countdown principal llega a cero        */
function onMesiversarioReached() {
  if (mesiversarioHandled) return;
  mesiversarioHandled = true;
  activateActivityLive(0);
}

/* ════════════════════════════════════════════════════════════
   NAVEGACIÓN
   ════════════════════════════════════════════════════════════ */
function buildDots() {
  dotsWrap.innerHTML = "";
  for (let i = 0; i < CONFIG.TOTAL_SLIDES; i++) {
    const dot = document.createElement("button");
    const isPast = i >= CONFIG.SLIDE_PAST_INICIO && i <= CONFIG.SLIDE_PAST_FIN;
    dot.className = "dot" + (isPast ? " past-dot" : " locked-dot");
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
    const isPast = i >= CONFIG.SLIDE_PAST_INICIO && i <= CONFIG.SLIDE_PAST_FIN;
    dot.classList.remove("active", "unlocked", "locked-dot", "past-dot");
    if (i === currentIndex) {
      dot.classList.add("active");
      if (isPast) dot.classList.add("past-dot");
    } else if (i <= unlockedUpTo) {
      dot.classList.add(isPast ? "past-dot" : "unlocked");
    } else {
      dot.classList.add("locked-dot");
    }
  });
}

function goTo(index) {
  if (index < 0 || index >= CONFIG.TOTAL_SLIDES) return;
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
   COUNTDOWN PRINCIPAL (al mesiversario)
   Cuando llega a cero → arranca el día (primera actividad +
   barra superior hacia la siguiente).
   ════════════════════════════════════════════════════════════ */
function startMainCountdown() {
  const target = new Date(CONFIG.MESIVERSARIO_ACTUAL).getTime();
  const dEl = document.getElementById("cm-d");
  const hEl = document.getElementById("cm-h");
  const mEl = document.getElementById("cm-m");
  const sEl = document.getElementById("cm-s");

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      if (dEl) dEl.textContent = "00";
      if (hEl) hEl.textContent = "00";
      if (mEl) mEl.textContent = "00";
      if (sEl) sEl.textContent = "00";
      // Ya es el día → mostrar la primera actividad a pantalla completa
      onMesiversarioReached();
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const p = n => String(n).padStart(2, "0");
    if (dEl) setTick(dEl, p(d));
    if (hEl) setTick(hEl, p(h));
    if (mEl) setTick(mEl, p(m));
    if (sEl) setTick(sEl, p(s));
    setTimeout(tick, 1000);
  }
  tick();
}

/* ════════════════════════════════════════════════════════════
   COUNTDOWNS DE ACTIVIDADES DEL DÍA
   (Cada slide tiene su propio reloj; al llegar a cero revela su
   actividad como red de seguridad. La navegación automática la
   conduce la barra superior.)
   ════════════════════════════════════════════════════════════ */
function startActivityCountdowns() {
  CONFIG.actividades.forEach((act, i) => {
    startActivityCountdown(act, i);
  });
}

function startActivityCountdown(act, index) {
  const target = new Date(act.target).getTime();
  const hEl    = document.getElementById(act.spanH);
  const mEl    = document.getElementById(act.spanM);
  const sEl    = document.getElementById(act.spanS);

  function tick() {
    const diff = target - Date.now();

    if (diff <= 0) {
      if (hEl) hEl.textContent = "00";
      if (mEl) mEl.textContent = "00";
      if (sEl) sEl.textContent = "00";
      // Red de seguridad: revela esta actividad sin forzar navegación.
      revealActivity(index, false);
      return;
    }

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const p = n => String(n).padStart(2, "0");
    if (hEl) setTick(hEl, p(h));
    if (mEl) setTick(mEl, p(m));
    if (sEl) setTick(sEl, p(s));
    setTimeout(tick, 1000);
  }

  tick();
}

/* ════════════════════════════════════════════════════════════
   COUNTDOWN SIGUIENTE MESIVERSARIO (slide de cierre, 8° mes)
   ════════════════════════════════════════════════════════════ */
function startNextMonthCountdown() {
  const target = new Date(CONFIG.SIGUIENTE_MESIVERSARIO).getTime();
  const dEl = document.getElementById("cn-d");
  const hEl = document.getElementById("cn-h");
  const mEl = document.getElementById("cn-m");
  const sEl = document.getElementById("cn-s");

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      if (dEl) dEl.textContent = "00";
      if (hEl) hEl.textContent = "00";
      if (mEl) mEl.textContent = "00";
      if (sEl) sEl.textContent = "00";
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const p = n => String(n).padStart(2, "0");
    if (dEl) setTick(dEl, p(d));
    if (hEl) setTick(hEl, p(h));
    if (mEl) setTick(mEl, p(m));
    if (sEl) setTick(sEl, p(s));
    setTimeout(tick, 1000);
  }
  tick();
}

/* ════════════════════════════════════════════════════════════
   BARRA SUPERIOR (cuenta continua hacia la próxima actividad)
   Al llegar a cero ejecuta onZero (reemplaza la pantalla con la
   nueva actividad). Mantiene un único timer activo.
   ════════════════════════════════════════════════════════════ */
function startBarCountdown(label, targetMs, onZero) {
  if (barTimerId) { clearTimeout(barTimerId); barTimerId = null; }

  nextBarLbl.textContent = label || "Próxima sorpresa";
  nextBar.classList.remove("hidden");

  let fired = false;

  function tick() {
    const diff = targetMs - Date.now();
    if (diff <= 0) {
      nextBarTime.textContent = "¡Ya!";
      if (!fired) {
        fired = true;
        if (typeof onZero === "function") onZero();
      }
      return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const p = n => String(n).padStart(2, "0");
    nextBarTime.textContent = h > 0
      ? `${p(h)}:${p(m)}:${p(s)}`
      : `${p(m)}:${p(s)}`;
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
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
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
