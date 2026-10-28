/* =========================================================
   Pixel portfolio: all art is drawn here from tiny pixel maps,
   so it recolours with the theme and needs no image files.
   ========================================================= */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

/* ---------- SPRITES ----------
   Each letter maps to a CSS variable (or a hex colour). "." is transparent. */
const SPRITES = {
  sword: {
    map: { W: "fg", S: "muted", G: "glow", R: "accent2", H: "border", P: "accent" },
    rows: [
      "...............W",
      "..............WS",
      ".............WS.",
      "............WS..",
      "...........WS...",
      "..........WS....",
      ".........WS.....",
      "........WS......",
      "...G...WS.......",
      "....G.WS........",
      ".....G..........",
      "....R.G.........",
      "...H...G........",
      "..R.............",
      ".H..............",
      "P...............",
    ],
  },
  mask: {
    map: { W: "fg", S: "muted", K: "bg2", R: "accent2" },
    rows: [
      "...WWWWWW...",
      "..WWWWWWWW..",
      ".WWWWWWWWWW.",
      ".WRWWWWWWWW.",
      ".WKKWWWWKKW.",
      ".WKKKWWKKKW.",
      ".WWWWSSWWWW.",
      ".WWWWWWWWWW.",
      "..WWKWWKWW..",
      "..WSWSWSWS..",
      "...WKWKWKW..",
      "....WWWWW...",
    ],
  },
  eye: {
    map: { O: "fg", I: "accent", K: "bg2", G: "glow" },
    rows: [
      "....OOOOOO....",
      "..OO......OO..",
      ".O....II....O.",
      "O....IKKI....O",
      "O...IKKGKI...O",
      "O...IKKKKI...O",
      ".O...IKKI...O.",
      "..OO..II..OO..",
      "....OOOOOO....",
    ],
  },
  lotus: {
    map: { P: "accent2", L: "fg", G: "glow", S: "muted" },
    rows: [
      "......PP......",
      ".....PLLP.....",
      ".....PLLP.....",
      ".P...PLLP...P.",
      ".PP.PLLLLP.PP.",
      ".PLP.PLLP.PLP.",
      "..PLPPGGPPLP..",
      "...PLLGGLLP...",
      "....PPPPPP....",
      "..SS..SS..SS..",
      ".SSSSSSSSSSSS.",
    ],
  },
  butterfly: {
    map: { B: "accent", K: "bg2", D: "accent2" },
    rows: [
      ".BB.....BB.",
      "BKKB...BKKB",
      "BKDKB.BKDKB",
      ".BKKKBKKKB.",
      "..BBKBKBB..",
      "..BKKBKKB..",
      ".BKKB.BKKB.",
      ".BBB...BBB.",
    ],
  },
  butterfly2: {
    map: { B: "accent", K: "bg2", D: "accent2" },
    rows: [
      "...........",
      "....B.B....",
      "...BKBKB...",
      "...BDBDB...",
      "....BBB....",
      "...BKBKB...",
      "...BKBKB...",
      "....B.B....",
    ],
  },
};

const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue("--" + name).trim();
const colour = (key) => (key.startsWith("#") ? key : cssVar(key));

function spriteCanvas(def, { scale = 1, flip = false } = {}) {
  const h = def.rows.length;
  const w = def.rows[0].length;
  const c = document.createElement("canvas");
  c.width = w * scale;
  c.height = h * scale;
  const ctx = c.getContext("2d");
  def.rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const key = def.map[ch];
      if (!key) return;
      ctx.fillStyle = colour(key);
      const px = flip ? w - 1 - x : x;
      ctx.fillRect(px * scale, y * scale, scale, scale);
    });
  });
  return c;
}

const spriteURL = (name, opts) => spriteCanvas(SPRITES[name], opts).toDataURL();

function paintSprites() {
  document.querySelectorAll("img[data-sprite]").forEach((img) => {
    const def = SPRITES[img.dataset.sprite];
    const scale = Number(img.dataset.scale || 4);
    img.src = spriteURL(img.dataset.sprite);
    img.width = def.rows[0].length * scale;
    img.height = def.rows.length * scale;
  });
}

/* Sword cursor, flipped so the tip points up-left like a normal arrow */
function paintCursor() {
  if (!finePointer) return;
  const url = spriteCanvas(SPRITES.sword, { scale: 2, flip: true }).toDataURL();
  document.documentElement.style.setProperty("--cursor", `url("${url}") 1 1, auto`);
}

/* ---------- HERO SCENE: night sky, moon, town skyline ---------- */
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
}

const scene = document.getElementById("scene");
let twinkle = 0;

function paintScene() {
  if (!scene) return;
  const ctx = scene.getContext("2d");
  const W = scene.width, H = scene.height;
  const bg2 = cssVar("bg2"), panel = cssVar("panel"), accent2 = cssVar("accent2");
  const fg = cssVar("fg"), glow = cssVar("glow"), accent = cssVar("accent"), muted = cssVar("muted");

  // Sky: hard colour bands with a checkerboard dither between them
  const bands = 7;
  const bandH = Math.ceil(H / bands);
  for (let b = 0; b < bands; b++) {
    const t = b / (bands - 1);
    const c = t < 0.6 ? mix(bg2, panel, t / 0.6) : mix(panel, accent2, (t - 0.6) * 0.7);
    ctx.fillStyle = c;
    ctx.fillRect(0, b * bandH, W, bandH);
    if (b > 0) {
      for (let x = 0; x < W; x += 2) ctx.fillRect(x + ((b * bandH) % 2), b * bandH - 1, 1, 1);
    }
  }

  // Stars
  const r = rng(22);
  for (let i = 0; i < 80; i++) {
    const x = Math.floor(r() * W), y = Math.floor(r() * H * 0.6);
    const bright = r() > 0.8;
    const on = !bright || ((i + twinkle) % 5 !== 0);
    ctx.fillStyle = bright ? fg : muted;
    if (on) ctx.fillRect(x, y, 1, 1);
    if (bright && on && (i + twinkle) % 3 === 0) {
      ctx.fillRect(x - 1, y, 1, 1); ctx.fillRect(x + 1, y, 1, 1);
      ctx.fillRect(x, y - 1, 1, 1); ctx.fillRect(x, y + 1, 1, 1);
    }
  }

  // Crescent moon with a dithered halo
  const mx = 146, my = 26, mr = 13;
  for (let y = -mr - 5; y <= mr + 5; y++) {
    for (let x = -mr - 5; x <= mr + 5; x++) {
      const d = Math.hypot(x, y);
      const cut = Math.hypot(x - 6, y + 5) < mr - 1;
      if (d <= mr && !cut) {
        ctx.fillStyle = d > mr - 2 ? glow : fg;
        ctx.fillRect(mx + x, my + y, 1, 1);
      } else if (d > mr + 1 && d <= mr + 4 && (x + y) % 2 === 0) {
        ctx.fillStyle = mix(panel, glow, 0.25);
        ctx.fillRect(mx + x, my + y, 1, 1);
      }
    }
  }

  // Skyline with lit windows
  const s = rng(7);
  let x = 0, tallest = { x: 0, top: H };
  while (x < W) {
    const w = 6 + Math.floor(s() * 12);
    const h = 12 + Math.floor(s() * 34);
    const top = H - h;
    ctx.fillStyle = bg2;
    ctx.fillRect(x, top, w, h);
    if (s() > 0.6) ctx.fillRect(x + Math.floor(w / 2), top - 4, 1, 4); // antenna
    for (let wy = top + 3; wy < H - 2; wy += 3) {
      for (let wx = x + 2; wx < x + w - 1; wx += 2) {
        if (s() < 0.14) {
          ctx.fillStyle = s() > 0.5 ? accent : glow;
          ctx.fillRect(wx, wy, 1, 1);
        }
      }
    }
    if (top < tallest.top && x > 20 && x < W - 60) tallest = { x: x + Math.floor(w / 2) - 2, top };
    x += w + Math.floor(s() * 2);
  }

  // A lone figure in a black robe on the tallest roof, sword on the back
  const fig = [
    "..K..",
    ".KKKS",
    "..KS.",
    ".KKK.",
    "KKKKK",
    ".KKK.",
    ".KKK.",
    ".K.K.",
  ];
  fig.forEach((row, fy) => [...row].forEach((ch, fx) => {
    if (ch === ".") return;
    ctx.fillStyle = ch === "S" ? muted : bg2;
    ctx.fillRect(tallest.x + fx, tallest.top - fig.length + fy, 1, 1);
  }));
}

/* ---------- BUTTERFLIES ---------- */
const ambient = document.querySelector(".ambient");
let flyFrames = [];

function spawnButterflies() {
  if (!ambient || reduceMotion) return;
  const count = window.innerWidth < 700 ? 3 : 6;
  for (let i = 0; i < count; i++) {
    const wrap = document.createElement("div");
    wrap.className = "fly";
    wrap.style.top = 8 + Math.random() * 80 + "vh";
    const dur = 22 + Math.random() * 18;
    wrap.style.animationDuration = dur + "s";
    wrap.style.animationDelay = -Math.random() * dur + "s";
    wrap.style.opacity = 0.55 + Math.random() * 0.35;
    const img = document.createElement("img");
    img.className = "sprite";
    img.alt = "";
    const scale = 2 + Math.floor(Math.random() * 3);
    img.width = 11 * scale;
    img.height = 8 * scale;
    img.dataset.phase = i;
    img.style.animationDelay = -Math.random() * 3 + "s";
    wrap.appendChild(img);
    ambient.appendChild(wrap);
  }
}

function paintButterflies() {
  flyFrames = [spriteURL("butterfly"), spriteURL("butterfly2")];
  ambient?.querySelectorAll("img").forEach((img) => (img.src = flyFrames[0]));
}

/* ---------- THEME ---------- */
const THEMES = ["ichigo", "rukia"];
const themeBtn = document.getElementById("theme-toggle");
const themeLabel = document.getElementById("theme-label");

function repaintAll() {
  paintSprites();
  paintCursor();
  paintScene();
  paintButterflies();
  const t = document.documentElement.dataset.theme;
  themeLabel.textContent = t[0].toUpperCase() + t.slice(1);
}

themeBtn.addEventListener("click", () => {
  const cur = document.documentElement.dataset.theme;
  const next = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("jj-theme", next); } catch (e) {}
  repaintAll();
});

/* ---------- TYPEWRITER ---------- */
const typeEl = document.getElementById("typewriter");
const PHRASES = [
  "build AI agents that test their own code",
  "ship hackathon projects in 24 hours",
  "make offline apps for real people",
  "turn rough ideas into running software",
];

function typewriter() {
  if (!typeEl) return;
  if (reduceMotion) { typeEl.textContent = PHRASES[0]; return; }
  let p = 0, i = 0, deleting = false;
  const tick = () => {
    const word = PHRASES[p];
    i += deleting ? -1 : 1;
    typeEl.textContent = word.slice(0, i);
    let wait = deleting ? 28 : 55;
    if (!deleting && i === word.length) { deleting = true; wait = 1800; }
    else if (deleting && i === 0) { deleting = false; p = (p + 1) % PHRASES.length; wait = 300; }
    setTimeout(tick, wait);
  };
  tick();
}

/* ---------- REIATSU SPARKS behind the cursor ---------- */
function sparks() {
  if (!finePointer || reduceMotion) return;
  let last = 0;
  window.addEventListener("pointermove", (e) => {
    const now = performance.now();
    if (now - last < 45) return;
    last = now;
    const s = document.createElement("span");
    s.className = "spark";
    s.style.left = e.clientX + 8 + "px";
    s.style.top = e.clientY + 10 + "px";
    s.style.setProperty("--dx", (Math.random() * 20 - 10).toFixed(0) + "px");
    if (Math.random() > 0.6) s.style.background = "var(--glow)";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 700);
  });
}

/* ---------- SCROLL: reveal cards + highlight nav ---------- */
function observers() {
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); reveal.unobserve(en.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach((el) => reveal.observe(el));

  const links = document.querySelectorAll(".nav__links a");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));
}

/* ---------- START ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
spawnButterflies();
repaintAll();
typewriter();
sparks();
observers();

if (!reduceMotion) {
  // flap wings
  let frame = 0;
  setInterval(() => {
    frame++;
    ambient.querySelectorAll("img").forEach((img) => {
      img.src = flyFrames[(frame + Number(img.dataset.phase)) % 2];
    });
  }, 220);
  // twinkle stars
  setInterval(() => { twinkle++; paintScene(); }, 700);
}
