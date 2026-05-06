/* ============================================================
   ANIVERSARIO · app.js
   ============================================================ */

/* ════════════════════════════════════════════════════════════
   ▶ CONFIGURACIÓN — todo lo que querrás editar está aquí
   ════════════════════════════════════════════════════════════ */
const CONFIG = {

  /* Cuánto tiempo (en minutos) se muestra cada actividad antes
     de pasar automáticamente al siguiente countdown.
     Cambia este número libremente.                            */
  REVEAL_DURATION_MIN: 60,

  /* Fecha/hora del mesiversario actual (4 junio 2026 00:00)   */
  MESIVERSARIO_ACTUAL: "2026-06-04T00:00:00",

  /* Actividades del día del mesiversario.
     · target  → hora exacta en que se revela la actividad
     · slideId → id del slide que contiene ese countdown
     · revealId → id de la tarjeta de revelación
     · nextBarLabel → texto que aparece en la barra superior
       mientras transcurre la actividad anterior              */
  actividades: [
    {
      target:       "2026-06-04T07:00:00",
      slideId:      "slide-9",
      countdownId:  "countdown-9",
      revealId:     "reveal-9",
      lockId:       "lock-9",
      spanH: "c9-h", spanM: "c9-m", spanS: "c9-s",
      nextBarLabel: "Próxima sorpresa",
    },
    {
      target:       "2026-06-04T10:00:00",
      slideId:      "slide-10",
      countdownId:  "countdown-10",
      revealId:     "reveal-10",
      lockId:       "lock-10",
      spanH: "c10-h", spanM: "c10-m", spanS: "c10-s",
      nextBarLabel: "Siguiente sorpresa",
    },
    {
      target:       "2026-06-04T12:30:00",
      slideId:      "slide-11",
      countdownId:  "countdown-11",
      revealId:     "reveal-11",
      lockId:       "lock-11",
      spanH: "c11-h", spanM: "c11-m", spanS: "c11-s",
      nextBarLabel: "Siguiente sorpresa",
    },
    {
      target:       "2026-06-04T17:30:00",
      slideId:      "slide-12",
      countdownId:  "countdown-12",
      revealId:     "reveal-12",
      lockId:       "lock-12",
      spanH: "c12-h", spanM: "c12-m", spanS: "c12-s",
      nextBarLabel: "Próximo plan",
    },
  ],

  /* Fecha del siguiente mesiversario (para el slide de cierre) */
  SIGUIENTE_MESIVERSARIO: "2026-07-04T00:00:00",

  /* Índices de slides */
  SLIDE_BIENVENIDA:   0,
  SLIDE_PAST_INICIO:  1,   // primer mes pasado
  SLIDE_PAST_FIN:     7,   // último mes pasado
  SLIDE_COUNTDOWN:    8,   // countdown principal al mesiversario
  SLIDE_ACT_INICIO:   9,   // primera actividad del día
  SLIDE_ACT_FIN:     12,   // última actividad del día
  SLIDE_CIERRE:      13,   // cierre + countdown al siguiente mes
  TOTAL_SLIDES:      14,
};

/* ════════════════════════════════════════════════════════════
   ESTADO
   ════════════════════════════════════════════════════════════ */
let currentIndex  = 0;
let unlockedUpTo  = CONFIG.SLIDE_PAST_FIN + 1; // slides pasados siempre accesibles

/* ════════════════════════════════════════════════════════════
   DOM
   ════════════════════════════════════════════════════════════ */
const slidesEls = document.querySelectorAll(".slide");
const btnPrev   = document.getElementById("btn-prev");
const btnNext   = document.getElementById("btn-next");
const dotsWrap  = document.getElementById("nav-dots");
const nextBar   = document.getElementById("next-bar");
const nextBarLbl = document.getElementById("next-bar-label");
const nextBarTime = document.getElementById("next-bar-time");

/* ════════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════════ */
function init() {
  if (window.lucide) lucide.createIcons();

  buildDots();
  resolveInitialState();   // decide en qué slide abrir
  startMainCountdown();
  startActivityCountdowns();
  startNextMonthCountdown();
  initParticles();
}

/* ════════════════════════════════════════════════════════════
   LÓGICA DE APERTURA AUTOMÁTICA
   Decide en qué slide debe aterrizar la app según la hora real.
   ════════════════════════════════════════════════════════════ */
function resolveInitialState() {
  const now        = Date.now();
  const mesDate    = new Date(CONFIG.MESIVERSARIO_ACTUAL).getTime();
  const revMs      = CONFIG.REVEAL_DURATION_MIN * 60 * 1000;

  // Todavía no es el día → abre en el countdown principal
  if (now < mesDate) {
    unlockedUpTo = CONFIG.SLIDE_COUNTDOWN;
    goTo(CONFIG.SLIDE_COUNTDOWN);
    return;
  }

  // Es el día: revisar cada actividad
  let landingSlide = CONFIG.SLIDE_COUNTDOWN; // fallback

  for (let i = 0; i < CONFIG.actividades.length; i++) {
    const act       = CONFIG.actividades[i];
    const actTime   = new Date(act.target).getTime();
    const actEnd    = actTime + revMs;
    const nextAct   = CONFIG.actividades[i + 1];
    const nextTime  = nextAct ? new Date(nextAct.target).getTime() : Infinity;

    if (now >= actTime && now < actEnd) {
      // Estamos dentro del período de revelación de esta actividad
      unlockUpToActivity(i);
      showReveal(act);
      if (nextAct) showNextBar(nextAct, nextTime);
      landingSlide = CONFIG.SLIDE_ACT_INICIO + i;
      break;
    }

    if (now >= actEnd && now < nextTime) {
      // Pasó la hora de esta actividad, esperando la siguiente
      unlockUpToActivity(i);
      showReveal(act);          // la actividad pasada sigue visible
      landingSlide = CONFIG.SLIDE_ACT_INICIO + i;
      break;
    }
  }

  // Pasaron TODAS las actividades → slide de cierre
  const lastAct    = CONFIG.actividades[CONFIG.actividades.length - 1];
  const lastActEnd = new Date(lastAct.target).getTime() + revMs;
  if (now >= lastActEnd) {
    CONFIG.actividades.forEach(act => showReveal(act));
    unlockSlide(CONFIG.SLIDE_CIERRE);
    landingSlide = CONFIG.SLIDE_CIERRE;
  }

  goTo(landingSlide);
}

/* Desbloquea slides hasta la actividad i (inclusive) */
function unlockUpToActivity(i) {
  for (let k = 0; k <= i; k++) {
    const slideIdx = CONFIG.SLIDE_ACT_INICIO + k;
    unlockSlide(slideIdx);
  }
}

/* Muestra la tarjeta de revelación de una actividad */
function showReveal(act) {
  const card = document.getElementById(act.revealId);
  if (card && card.classList.contains("hidden")) {
    card.classList.remove("hidden");
    const cdBlock = document.getElementById(act.countdownId);
    if (cdBlock) cdBlock.classList.add("done");
  }
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
      // Ya es el día → desbloquear primer slide de actividad
      unlockSlide(CONFIG.SLIDE_ACT_INICIO);
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
   ════════════════════════════════════════════════════════════ */
function startActivityCountdowns() {
  CONFIG.actividades.forEach((act, i) => {
    startActivityCountdown(act, i);
  });
}

function startActivityCountdown(act, index) {
  const target  = new Date(act.target).getTime();
  const revMs   = CONFIG.REVEAL_DURATION_MIN * 60 * 1000;
  const hEl     = document.getElementById(act.spanH);
  const mEl     = document.getElementById(act.spanM);
  const sEl     = document.getElementById(act.spanS);

  function tick() {
    const diff = target - Date.now();

    if (diff <= 0) {
      // Llegó la hora de esta actividad
      if (hEl) hEl.textContent = "00";
      if (mEl) mEl.textContent = "00";
      if (sEl) sEl.textContent = "00";

      const cdBlock = document.getElementById(act.countdownId);
      if (cdBlock) cdBlock.classList.add("done");

      // Mostrar la revelación
      showReveal(act);
      if (window.lucide) lucide.createIcons();

      // Desbloquear el siguiente slide de actividad
      const nextSlide = CONFIG.SLIDE_ACT_INICIO + index + 1;
      if (nextSlide <= CONFIG.SLIDE_ACT_FIN) {
        unlockSlide(nextSlide);
      }

      // Si hay siguiente actividad, mostrar barra superior
      const nextAct = CONFIG.actividades[index + 1];
      if (nextAct) {
        const nextTarget = new Date(nextAct.target).getTime();
        showNextBar(nextAct, nextTarget);
        // Ocultar barra cuando pase REVEAL_DURATION_MIN
        setTimeout(() => hideNextBar(), revMs);
      }

      // Si es la última actividad, desbloquear cierre después del período
      if (index === CONFIG.actividades.length - 1) {
        setTimeout(() => {
          unlockSlide(CONFIG.SLIDE_CIERRE);
        }, revMs);
      }

      return; // detiene el tick
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
   COUNTDOWN SIGUIENTE MESIVERSARIO (slide de cierre)
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
   BARRA SUPERIOR (mientras dura una revelación)
   ════════════════════════════════════════════════════════════ */
function showNextBar(nextAct, nextTargetMs) {
  nextBarLbl.textContent = nextAct.nextBarLabel || "Próxima sorpresa";
  nextBar.classList.remove("hidden");

  function tickBar() {
    const diff = nextTargetMs - Date.now();
    if (diff <= 0) {
      nextBarTime.textContent = "¡Ya!";
      return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const p = n => String(n).padStart(2, "0");
    nextBarTime.textContent = h > 0
      ? `${p(h)}:${p(m)}:${p(s)}`
      : `${p(m)}:${p(s)}`;
    setTimeout(tickBar, 1000);
  }
  tickBar();
}

function hideNextBar() {
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
