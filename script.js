/* =========================================================
   CONFIGURACIÓN — cambia estos valores a tu gusto
   ========================================================= */
const CONFIG = {
  // Su nombre (déjalo en null para que diga "ella" / "ti")
  ella: null,
  // Tu nombre (déjalo en null para que diga "tu novio")
  el: null,
  // Dónde está ella
  ciudadElla: { nombre: "Monterrey", coords: [-100.3161, 25.6866], zona: "America/Monterrey" },
  // Dónde estás tú (cambia la ciudad si no es Lisboa)
  ciudadEl:   { nombre: "Portugal",  coords: [-9.1393, 38.7223],   zona: "Europe/Lisbon" },
};

const fmt = (n) => Math.round(n).toLocaleString("es-MX");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Nombres ---------- */
if (CONFIG.ella) document.querySelectorAll("[data-ella]").forEach((el) => (el.textContent = CONFIG.ella));
if (CONFIG.el) document.querySelectorAll("[data-el]").forEach((el) => (el.textContent = CONFIG.el));
document.getElementById("cityEl").textContent = CONFIG.ciudadEl.nombre;

/* ---------- Distancia real (fórmula del haversine) ---------- */
function haversine([lon1, lat1], [lon2, lat2]) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const KM = haversine(CONFIG.ciudadElla.coords, CONFIG.ciudadEl.coords);
document.getElementById("kmTotal").textContent = fmt(KM);
document.getElementById("shrinkKm").textContent = fmt(KM);

/* ---------- Confeti ---------- */
const confettiCanvas = document.getElementById("confettiCanvas");
const party = window.confetti ? window.confetti.create(confettiCanvas, { resize: true, useWorker: false }) : null;
const COLORS = ["#a3161a", "#b8892b", "#1e1a15", "#f3ead6", "#e05a6a"];

function burst(opts = {}) {
  if (!party || reduceMotion) return;
  party({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors: COLORS, ...opts });
}
function capsRain() {
  if (!party || reduceMotion) return;
  let shapes;
  try {
    shapes = [confetti.shapeFromText({ text: "🎓", scalar: 2.4 }), confetti.shapeFromText({ text: "❤️", scalar: 2 })];
  } catch (e) { shapes = undefined; }
  const end = Date.now() + 2200;
  (function frame() {
    party({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0, y: 0.8 }, colors: COLORS });
    party({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1, y: 0.8 }, colors: COLORS });
    if (shapes) party({ particleCount: 2, spread: 120, startVelocity: 35, origin: { x: Math.random(), y: 0.9 }, shapes, scalar: 2.4, angle: 90, gravity: 0.9 });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/* ---------- Intro ---------- */
document.body.classList.add("locked");
document.getElementById("openPaper").addEventListener("click", () => {
  document.getElementById("intro").classList.add("hide");
  document.body.classList.remove("locked");
  window.scrollTo(0, 0);
  setTimeout(() => burst({ particleCount: 180, origin: { y: 0.3 } }), 250);
});

/* ---------- Aparición al hacer scroll ---------- */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

/* ---------- Verificador de la foto ---------- */
const stamp = document.getElementById("stamp");
const factBtn = document.getElementById("factCheck");
factBtn.addEventListener("click", () => {
  const on = stamp.classList.toggle("on");
  factBtn.textContent = on ? "🙈 Mejor no saber" : "🔍 Verificar esta foto";
});

/* ---------- Contadores ---------- */
const countObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.count, prefix = el.dataset.prefix || "";
    const dur = reduceMotion ? 1 : 1600, t0 = performance.now();
    (function tick(now) {
      const p = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + fmt(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
    countObs.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll("[data-count]").forEach((el) => countObs.observe(el));

/* ---------- Relojes ---------- */
function hourIn(zone) {
  return +new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: zone }).format(new Date());
}
function timeIn(zone) {
  return new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: zone }).format(new Date());
}
function msgElla(h) {
  if (h < 7) return "Ojalá estés descansando: te lo ganaste.";
  if (h < 12) return "Buenos días, graduada.";
  if (h < 18) return "Hora de presumir ese título.";
  return "Hora de celebrar. ¡Brinda por ti!";
}
function msgEl(h) {
  if (h < 7) return "Y yo despierto, pensando en ti.";
  if (h < 12) return "Buenos días desde aquí, extrañándote.";
  if (h < 18) return "Contando las horas para hablar contigo.";
  return "Otro atardecer pensando en ti.";
}
function updateClocks() {
  try {
    document.getElementById("timeMty").textContent = timeIn(CONFIG.ciudadElla.zona);
    document.getElementById("timeEl").textContent = timeIn(CONFIG.ciudadEl.zona);
    document.getElementById("msgMty").textContent = msgElla(hourIn(CONFIG.ciudadElla.zona));
    document.getElementById("msgEl").textContent = msgEl(hourIn(CONFIG.ciudadEl.zona));
  } catch (e) { /* navegador sin zonas horarias */ }
}
updateClocks();
setInterval(updateClocks, 15000);

/* ---------- Mapa ---------- */
const svg = document.getElementById("map");
const NS = "http://www.w3.org/2000/svg";
let routePath = null, mtyPoint = null;

function drawMap(world) {
  const W = 800, H = 460;
  const projection = d3.geoMercator().fitExtent([[10, 10], [W - 10, H - 10]], {
    type: "MultiPoint", coordinates: [[-118, 8], [10, 56], [-118, 56], [10, 8]],
  });
  const path = d3.geoPath(projection);
  const s = d3.select(svg);

  s.append("path").datum(d3.geoGraticule().step([10, 10])()).attr("class", "graticule").attr("d", path);
  if (world) {
    s.append("path").datum(topojson.feature(world, world.objects.countries)).attr("class", "land").attr("d", path);
  }

  // Ruta: arco de círculo máximo de Portugal a Monterrey
  const interp = d3.geoInterpolate(CONFIG.ciudadEl.coords, CONFIG.ciudadElla.coords);
  const pts = d3.range(0, 1.0001, 0.02).map((t) => projection(interp(t)));
  routePath = s.append("path").attr("class", "route").attr("d", d3.line().curve(d3.curveBasis)(pts)).node();

  [[CONFIG.ciudadElla, "end"], [CONFIG.ciudadEl, "start"]].forEach(([c, anchor]) => {
    const [x, y] = projection(c.coords);
    const g = s.append("g").attr("class", "city").attr("transform", `translate(${x},${y})`);
    g.append("circle").attr("r", 7);
    g.append("text").attr("x", anchor === "end" ? -12 : 12).attr("y", -10).attr("text-anchor", anchor).text(anchor === "end" ? `${c.nombre} (ella)` : `${c.nombre} (yo)`);
  });
  mtyPoint = projection(CONFIG.ciudadElla.coords);
}

if (window.d3 && window.topojson) {
  fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json")
    .then((r) => r.json())
    .then(drawMap)
    .catch(() => drawMap(null));
} else {
  svg.innerHTML = `<text x="400" y="230" text-anchor="middle" font-family="serif" font-size="22">Monterrey ❤ ${CONFIG.ciudadEl.nombre}</text>`;
}

/* ---------- Enviar besos ---------- */
const KISS_KEY = "besosEnviados";
let kisses = 0;
try { kisses = +localStorage.getItem(KISS_KEY) || 0; } catch (e) {}
const kissCountEl = document.getElementById("kissCount");
kissCountEl.textContent = fmt(kisses);

const kissNotes = [
  "Entregado. Sin aduanas, sin escalas, sin retrasos.",
  "Otro más. El Atlántico ya ni se molesta en detenerlos.",
  "Confirmado: llegó directo a la mejilla.",
  "La aerolínea del amor reporta 0% de equipaje perdido.",
  "Llegó más rápido que un mensaje de WhatsApp.",
  "Cada beso cruza 8,000 km y llega igual de calentito.",
];

function pulseAt([x, y]) {
  const c = document.createElementNS(NS, "circle");
  c.setAttribute("class", "pulse");
  c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 6);
  svg.appendChild(c);
  const t0 = performance.now();
  (function grow(now) {
    const p = Math.min(1, (now - t0) / 700);
    c.setAttribute("r", 6 + p * 30);
    c.setAttribute("opacity", 1 - p);
    if (p < 1) requestAnimationFrame(grow); else c.remove();
  })(t0);
}

function arrived() {
  kisses++;
  kissCountEl.textContent = fmt(kisses);
  try { localStorage.setItem(KISS_KEY, kisses); } catch (e) {}
  document.getElementById("kissNote").textContent = kissNotes[(kisses - 1) % kissNotes.length];
  if (mtyPoint) pulseAt(mtyPoint);
  if (kisses % 10 === 0) burst({ particleCount: 80, colors: ["#a3161a", "#e05a6a", "#f6b6c0"] });
}

document.getElementById("sendKiss").addEventListener("click", () => {
  if (!routePath || reduceMotion) { arrived(); return; }
  const t = document.createElementNS(NS, "text");
  t.setAttribute("class", "flying");
  t.setAttribute("text-anchor", "middle");
  t.setAttribute("dominant-baseline", "central");
  t.textContent = Math.random() < 0.5 ? "💋" : "❤️";
  svg.appendChild(t);
  const len = routePath.getTotalLength(), t0 = performance.now(), dur = 1600;
  (function fly(now) {
    const p = Math.min(1, (now - t0) / dur);
    const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    const pt = routePath.getPointAtLength(e * len);
    const scale = 1 + Math.sin(p * Math.PI) * 0.6;
    t.setAttribute("transform", `translate(${pt.x},${pt.y}) scale(${scale})`);
    if (p < 1) requestAnimationFrame(fly);
    else { t.remove(); arrived(); }
  })(t0);
});

/* ---------- Acortar la distancia ---------- */
const range = document.getElementById("shrinkRange");
const personL = document.getElementById("personL");
const personR = document.getElementById("personR");
const shrinkKm = document.getElementById("shrinkKm");
const shrinkMsg = document.getElementById("shrinkMsg");
const shrinkHeart = document.getElementById("shrinkHeart");
let celebrated = false;

range.addEventListener("input", () => {
  const v = +range.value / 100;
  personL.style.left = `calc((50% - 2.3rem) * ${v})`;
  personR.style.right = `calc((50% - 2.3rem) * ${v})`;
  shrinkKm.textContent = fmt(KM * (1 - v));
  const done = v >= 1;
  shrinkHeart.classList.toggle("on", done);
  shrinkMsg.textContent =
    v === 0 ? "Arrastre para acercarlos." :
    v < 0.4 ? "Se van acercando…" :
    v < 0.8 ? "Ya casi, ya casi…" :
    !done ? "¡Un poquito más!" :
    "0 km. Pronto, muy pronto, será así de verdad.";
  if (done && !celebrated) {
    celebrated = true;
    const r = range.getBoundingClientRect();
    burst({ particleCount: 70, spread: 60, origin: { x: (r.left + r.width / 2) / innerWidth, y: r.top / innerHeight }, colors: ["#a3161a", "#e05a6a", "#f6b6c0"] });
  }
  if (!done) celebrated = false;
});

/* ---------- Polaroids ---------- */
document.querySelectorAll(".polaroid").forEach((p) => {
  p.addEventListener("click", () => p.classList.toggle("flipped"));
});

/* ---------- Carta ---------- */
const envelope = document.getElementById("envelope");
const letter = document.getElementById("letter");
envelope.addEventListener("click", () => {
  const opening = !envelope.classList.contains("open");
  envelope.classList.toggle("open", opening);
  envelope.setAttribute("aria-expanded", opening);
  document.getElementById("envelopeHint").textContent = opening ? "Léala despacio ↓" : "Toque el sobre para abrirlo";
  if (opening) {
    letter.hidden = false;
    letter.classList.remove("show"); void letter.offsetWidth; letter.classList.add("show");
    setTimeout(() => letter.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }), 500);
  } else {
    letter.hidden = true;
  }
});

/* ---------- Rasca y gana ---------- */
(function scratchCard() {
  const box = document.getElementById("scratch");
  const cv = document.getElementById("scratchCanvas");
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  let drawing = false, done = false, moves = 0, last = null;

  function paint() {
    const dpr = window.devicePixelRatio || 1;
    const w = box.clientWidth, h = box.clientHeight;
    if (!w || !h) return;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#b9b3a6"); g.addColorStop(0.5, "#e4dfd3"); g.addColorStop(1, "#a19a8b");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(60,50,40,.12)";
    for (let i = 0; i < 400; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    ctx.fillStyle = "#4a4136";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `bold ${Math.max(18, w / 13)}px "Special Elite", monospace`;
    ctx.fillText("✦ RASQUE AQUÍ ✦", w / 2, h / 2 - 10);
    ctx.font = `${Math.max(12, w / 26)}px "Special Elite", monospace`;
    ctx.fillText("con el dedo o el ratón", w / 2, h / 2 + 20);
  }

  function pos(e) {
    const r = cv.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function scratch(p) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 38; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo((last || p).x, (last || p).y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
    if (++moves % 12 === 0) check();
  }
  function check() {
    const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let clear = 0, total = 0;
    for (let i = 3; i < data.length; i += 4 * 40) { total++; if (data[i] === 0) clear++; }
    if (clear / total > 0.5) reveal();
  }
  function reveal() {
    if (done) return;
    done = true;
    cv.classList.add("gone");
    const r = box.getBoundingClientRect();
    burst({ particleCount: 100, origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight } });
  }

  cv.addEventListener("pointerdown", (e) => { if (done) return; drawing = true; last = null; cv.setPointerCapture(e.pointerId); scratch(pos(e)); });
  cv.addEventListener("pointermove", (e) => { if (drawing && !done) scratch(pos(e)); });
  ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => cv.addEventListener(ev, () => { drawing = false; last = null; }));

  paint();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!moves) paint(); });
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (!done && !moves) paint(); }, 200); });
})();

/* ---------- Final ---------- */
document.getElementById("capsBtn").addEventListener("click", capsRain);
