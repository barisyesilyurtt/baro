/* ÇAKBOT — gelen hurdayı tek vuruşta parçala.
 * Yeni eşya için JUNK dizisine bir satır ekle.
 * Zorluk: BASE_SPEED ve SPAWN_MS.
 */

const JUNK = [
  { id: "toast", label: "TOST", color: "#d9a45a", score: 20 },
  { id: "printer", label: "YAZICI", color: "#8ea0b3", score: 30 },
  { id: "coffee", label: "KAHVE", color: "#8b5a3c", score: 25 },
  { id: "cat", label: "KEDİ", color: "#c9a36a", score: 40 },
  { id: "micro", label: "MIKRO", color: "#c9c3b2", score: 35 },
  { id: "copier", label: "KOPYA", color: "#6e7d8b", score: 50 },
];

const LANES = 3;
const BASE_SPEED = 220;
const SPAWN_MS = 1100;
const PUNCH_MS = 160;
const RECOVER_MS = 140;
const COMBO_MS = 1200;

const canvas = document.getElementById("view");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const stamp = document.getElementById("stamp");
const cakBtn = document.getElementById("cak-btn");

const hud = {
  score: document.getElementById("score"),
  combo: document.getElementById("combo"),
  lives: document.getElementById("lives"),
};

const state = {
  mode: "title",
  lane: 1,
  punchUntil: 0,
  recoverUntil: 0,
  score: 0,
  combo: 0,
  comboUntil: 0,
  lives: 3,
  items: [],
  bits: [],
  pops: [],
  shake: 0,
  flash: 0,
  nextSpawn: 0,
  elapsed: 0,
  last: 0,
};

let audio;

function laneY(lane) {
  return 130 + lane * 130;
}

function start() {
  unlockAudio();
  state.mode = "play";
  state.lane = 1;
  state.punchUntil = 0;
  state.recoverUntil = 0;
  state.score = 0;
  state.combo = 0;
  state.comboUntil = 0;
  state.lives = 3;
  state.items = [];
  state.bits = [];
  state.pops = [];
  state.shake = 0;
  state.flash = 0;
  state.nextSpawn = 400;
  state.elapsed = 0;
  overlay.classList.add("hidden");
  paintHud();
}

function gameOver() {
  state.mode = "dead";
  overlay.classList.remove("hidden");
  overlay.innerHTML = `
    <p class="kit-tag">piston durdu</p>
    <h2>YÜZÜNE YAPIŞTI</h2>
    <p class="pitch">Skor ${state.score}. Seri bitti. Atölye dağınık.</p>
    <button id="again-btn" type="button">Bir daha çak</button>
  `;
  document.getElementById("again-btn").addEventListener("click", start);
}

function punch() {
  if (state.mode !== "play") {
    start();
    return;
  }
  const now = state.elapsed;
  if (now < state.recoverUntil) return;
  state.punchUntil = now + PUNCH_MS;
  state.recoverUntil = state.punchUntil + RECOVER_MS;
  cakBtn.classList.add("hot");
  setTimeout(() => cakBtn.classList.remove("hot"), 120);
  thud(90, 0.12);
  let hit = false;
  for (const item of state.items) {
    if (item.dead || item.lane !== state.lane) continue;
    if (item.x < 360 && item.x > 130) {
      smash(item);
      hit = true;
    }
  }
  if (!hit) {
    flashStamp();
    tone(70, 0.08, "sawtooth");
  }
}

function smash(item) {
  item.dead = true;
  const now = state.elapsed;
  if (now < state.comboUntil) state.combo += 1;
  else state.combo = 1;
  state.comboUntil = now + COMBO_MS;
  const gained = item.kind.score * state.combo;
  state.score += gained;
  state.shake = 10;
  state.flash = 0.35;
  burst(item);
  pop(item.x, item.y, `+${gained}`);
  flashStamp();
  crunch();
  paintHud();
}

function hurt(item) {
  item.dead = true;
  state.lives -= 1;
  state.combo = 0;
  state.shake = 16;
  state.flash = 0.55;
  burst(item);
  pop(120, item.y, "AU");
  tone(50, 0.2, "square");
  paintHud();
  if (state.lives <= 0) gameOver();
}

function burst(item) {
  for (let i = 0; i < 16; i += 1) {
    state.bits.push({
      x: item.x + 30,
      y: item.y,
      w: 12 + Math.random() * 22,
      h: 10 + Math.random() * 18,
      vx: 40 + Math.random() * 520,
      vy: -380 + Math.random() * 420,
      rot: Math.random() * 6,
      vr: -12 + Math.random() * 24,
      color: item.kind.color,
      life: 0.85 + Math.random() * 0.5,
    });
  }
}

function pop(x, y, text) {
  state.pops.push({ x, y, text, life: 0.7 });
}

function spawn() {
  const kind = JUNK[(Math.random() * JUNK.length) | 0];
  state.items.push({
    kind,
    lane: (Math.random() * LANES) | 0,
    x: 980,
    y: 0,
    dead: false,
  });
}

function step(dt) {
  if (state.mode !== "play") return;
  state.elapsed += dt * 1000;
  const t = state.elapsed / 1000;
  const speed = BASE_SPEED + t * 18;
  const spawnEvery = Math.max(420, SPAWN_MS - t * 28);

  if (state.elapsed >= state.nextSpawn) {
    spawn();
    state.nextSpawn = state.elapsed + spawnEvery;
  }

  for (const item of state.items) {
    if (item.dead) continue;
    item.x -= speed * dt;
    item.y = laneY(item.lane);
    if (item.x < 145 && item.lane === state.lane) hurt(item);
    else if (item.x < 40) item.dead = true;
  }
  state.items = state.items.filter((item) => !item.dead && item.x > -40);

  for (const bit of state.bits) {
    bit.vy += 820 * dt;
    bit.x += bit.vx * dt;
    bit.y += bit.vy * dt;
    bit.rot += bit.vr * dt;
    bit.life -= dt;
  }
  state.bits = state.bits.filter((bit) => bit.life > 0);

  for (const p of state.pops) {
    p.y -= 50 * dt;
    p.life -= dt;
  }
  state.pops = state.pops.filter((p) => p.life > 0);

  state.shake *= 0.86;
  state.flash *= 0.9;
}

function draw() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.save();
  if (state.shake > 0.4) {
    ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
  }
  ctx.fillStyle = "#171910";
  ctx.fillRect(0, 0, w, h);

  for (let lane = 0; lane < LANES; lane += 1) {
    const y = laneY(lane);
    ctx.fillStyle = lane === state.lane ? "#2a2f1c" : "#1b1e14";
    ctx.fillRect(0, y - 56, w, 112);
    ctx.fillStyle = lane === state.lane ? "#f0d33a" : "#2c3124";
    ctx.fillRect(0, y + 50, w, lane === state.lane ? 5 : 3);
  }

  ctx.fillStyle = "#f0d33a";
  ctx.fillRect(0, 0, 14, h);

  drawRobot();

  for (const item of state.items) {
    if (item.dead) continue;
    drawJunk(item);
  }
  for (const bit of state.bits) drawBit(bit);
  for (const p of state.pops) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = "#f0d33a";
    ctx.font = "700 22px monospace";
    ctx.fillText(p.text, p.x, p.y);
    ctx.globalAlpha = 1;
  }

  if (state.flash > 0.02) {
    ctx.fillStyle = `rgba(240, 211, 58, ${state.flash * 0.25})`;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

function drawRobot() {
  const y = laneY(state.lane);
  const punching = state.elapsed < state.punchUntil;
  const arm = punching ? 176 : 52;
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(48, y + 50, 100, 12);
  ctx.fillStyle = "#16180f";
  ctx.fillRect(86, y - 78, 10, 22);
  ctx.fillStyle = "#f0d33a";
  ctx.fillRect(36, y - 62, 108, 122);
  ctx.fillStyle = "#16180f";
  ctx.fillRect(52, y - 34, 76, 22);
  ctx.fillStyle = "#f0d33a";
  ctx.fillRect(60, y - 26, 12, 8);
  ctx.fillRect(108, y - 26, 12, 8);
  ctx.fillStyle = "#d24a22";
  ctx.fillRect(138, y - 12, arm, 22);
  ctx.fillRect(132 + arm, y - 26, 42, 50);
  if (punching) {
    ctx.fillStyle = "rgba(210, 74, 34, 0.35)";
    ctx.fillRect(132 + arm + 42, y - 18, 70, 34);
  }
  ctx.fillStyle = "#16180f";
  ctx.fillRect(58, y + 28, 22, 10);
  ctx.fillRect(98, y + 28, 22, 10);
}

function drawJunk(item) {
  ctx.fillStyle = item.kind.color;
  ctx.fillRect(item.x, item.y - 34, 108, 68);
  ctx.fillStyle = "#16180f";
  ctx.fillRect(item.x + 8, item.y - 22, 28, 12);
  ctx.font = "700 18px monospace";
  ctx.fillText(item.kind.label, item.x + 12, item.y + 16);
}

function drawBit(bit) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, bit.life);
  ctx.translate(bit.x, bit.y);
  ctx.rotate(bit.rot);
  ctx.fillStyle = bit.color;
  ctx.fillRect(-bit.w / 2, -bit.h / 2, bit.w, bit.h);
  ctx.restore();
}

function paintHud() {
  hud.score.textContent = String(state.score);
  hud.combo.textContent = `x${state.combo}`;
  hud.lives.textContent = "■".repeat(Math.max(0, state.lives)).padEnd(3, "□");
}

function flashStamp() {
  stamp.classList.remove("hidden");
  clearTimeout(flashStamp.t);
  flashStamp.t = setTimeout(() => stamp.classList.add("hidden"), 220);
}

function loop(now) {
  const dt = Math.min(0.033, (now - (state.last || now)) / 1000);
  state.last = now;
  step(dt);
  draw();
  requestAnimationFrame(loop);
}

function shift(dir) {
  if (state.mode !== "play") return;
  state.lane = Math.max(0, Math.min(LANES - 1, state.lane + dir));
}

function unlockAudio() {
  if (!audio) audio = new AudioContext();
  if (audio.state === "suspended") audio.resume();
}

function tone(freq, time, type) {
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.07, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + time);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + time);
}

function thud(freq, time) {
  tone(freq, time, "triangle");
}

function crunch() {
  tone(180, 0.05, "square");
  setTimeout(() => tone(90, 0.1, "triangle"), 40);
}

document.getElementById("start-btn").addEventListener("click", start);
document.getElementById("cak-btn").addEventListener("click", punch);
document.getElementById("up-btn").addEventListener("click", () => shift(-1));
document.getElementById("down-btn").addEventListener("click", () => shift(1));

window.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  if (event.code === "Space" || event.key === " ") {
    event.preventDefault();
    punch();
  }
  if (event.key === "w" || event.key === "W" || event.key === "ArrowUp") shift(-1);
  if (event.key === "s" || event.key === "S" || event.key === "ArrowDown") shift(1);
});

canvas.addEventListener("pointerdown", punch);

window.__cak = {
  start,
  punch,
  shift,
  spawnAt(lane, x = 240) {
    const kind = JUNK[0];
    state.items.push({ kind, lane, x, y: laneY(lane), dead: false });
  },
  get snapshot() {
    return {
      mode: state.mode,
      score: state.score,
      lives: state.lives,
      combo: state.combo,
      lane: state.lane,
      items: state.items.length,
      bits: state.bits.length,
    };
  },
};

paintHud();
requestAnimationFrame(loop);
