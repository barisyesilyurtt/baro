/* ÇAKBOT
 * Kendin büyütmek için:
 * 1) LEVELS dizisine oda ekle (robot, hedef, duvar).
 * 2) Yeni hareket için COMMANDS içine bir fonksiyon yaz.
 * 3) index.html / palette otomatik gelir, komut adı COMMANDS anahtarıdır.
 */

const COLS = 7;
const ROWS = 5;
const MAX_STEPS = 12;

const LEVELS = [
  {
    title: "Tost hakkı",
    brief: "Düz git, pistonu indir. Tostun suçu: var olmak.",
    robot: { x: 1, y: 2, dir: 0 },
    target: { x: 4, y: 2, kind: "toast", label: "TOST" },
    walls: [],
  },
  {
    title: "Sıkışan yazıcı",
    brief: "Yazıcı köşede. Dönmeyi unutursan kâğıda çakarsın.",
    robot: { x: 1, y: 3, dir: 0 },
    target: { x: 4, y: 1, kind: "printer", label: "YAZICI" },
    walls: [],
  },
  {
    title: "Koli labirenti",
    brief: "Ortadaki koli düz yolu kesiyor. Etrafından dolaş, sonra çak.",
    robot: { x: 0, y: 2, dir: 0 },
    target: { x: 5, y: 2, kind: "plant", label: "BİTKİ" },
    walls: [{ x: 2, y: 2 }],
  },
  {
    title: "Kahve nöbeti",
    brief: "Makine sol üstte. Uzun yol, kısa bellek. Bandı taşırma.",
    robot: { x: 6, y: 4, dir: 2 },
    target: { x: 1, y: 0, kind: "coffee", label: "KAHVE" },
    walls: [
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
    ],
  },
  {
    title: "Mikrodalga davası",
    brief: "Alt sıra kapalı. Yukarı çık, sağa yürü, çak.",
    robot: { x: 0, y: 4, dir: 0 },
    target: { x: 6, y: 0, kind: "micro", label: "MIKRO" },
    walls: [
      { x: 1, y: 4 },
      { x: 2, y: 4 },
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 5, y: 4 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
    ],
  },
  {
    title: "Fotokopi canavarı",
    brief: "Son iş. Delikten geç, tam önünde dur, sonra çak.",
    robot: { x: 0, y: 2, dir: 0 },
    target: { x: 6, y: 2, kind: "copier", label: "KOPYA" },
    walls: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 4, y: 0 },
      { x: 4, y: 1 },
      { x: 4, y: 3 },
      { x: 4, y: 4 },
    ],
  },
];

const DIRS = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];

const COMMANDS = {
  ileri: {
    label: "İleri",
    code: "cakbot.ileri()",
    run(state) {
      const d = DIRS[state.robot.dir];
      const nx = state.robot.x + d.x;
      const ny = state.robot.y + d.y;
      if (!inside(nx, ny)) return fail(state, "Atölyeden düştü. Hurda artık bahçede.");
      if (isWall(state, nx, ny)) return fail(state, "Koli kazandı. Robotun burnu ezildi.");
      if (isTarget(state, nx, ny)) return fail(state, "Hedefe bindin. ÇAK yok, sadece utanç var.");
      state.robot.x = nx;
      state.robot.y = ny;
      tone(180, 0.05, "square");
      return "ok";
    },
  },
  sol: {
    label: "Sol",
    code: "cakbot.sol()",
    run(state) {
      state.robot.dir = (state.robot.dir + 3) % 4;
      tone(140, 0.08, "sawtooth");
      return "ok";
    },
  },
  sag: {
    label: "Sağ",
    code: "cakbot.sag()",
    run(state) {
      state.robot.dir = (state.robot.dir + 1) % 4;
      tone(160, 0.08, "sawtooth");
      return "ok";
    },
  },
  cak: {
    label: "Çak",
    code: "cakbot.cak()",
    run(state) {
      const d = DIRS[state.robot.dir];
      const tx = state.robot.x + d.x;
      const ty = state.robot.y + d.y;
      thud();
      stamp();
      if (isTarget(state, tx, ty)) {
        state.smashed = true;
        return "win";
      }
      return fail(state, "Havaya çaktın. Piston boşta kaldı, robot utandı.");
    },
  },
};

const ui = {
  title: document.getElementById("title-screen"),
  game: document.getElementById("game-screen"),
  win: document.getElementById("win-screen"),
  board: document.getElementById("board"),
  rail: document.getElementById("rail"),
  palette: document.getElementById("palette"),
  status: document.getElementById("status"),
  code: document.getElementById("code"),
  brief: document.getElementById("brief"),
  levelTag: document.getElementById("level-tag"),
  levelTitle: document.getElementById("level-title"),
  stamp: document.getElementById("stamp"),
  run: document.getElementById("run-btn"),
};

let levelIndex = 0;
let program = [];
let running = false;
let audio;

function boot() {
  ui.board.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
  ui.palette.innerHTML = "";
  Object.keys(COMMANDS).forEach((name) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `chip ${name}`;
    btn.textContent = COMMANDS[name].label;
    btn.addEventListener("click", () => addStep(name));
    ui.palette.appendChild(btn);
  });

  document.getElementById("start-btn").addEventListener("click", () => {
    unlockAudio();
    levelIndex = 0;
    show("game");
    loadLevel();
  });
  document.getElementById("again-btn").addEventListener("click", () => {
    levelIndex = 0;
    show("game");
    loadLevel();
  });
  document.getElementById("reset-level").addEventListener("click", () => {
    if (!running) loadLevel(false);
  });
  document.getElementById("back-title").addEventListener("click", () => {
    if (!running) show("title");
  });
  ui.run.addEventListener("click", runProgram);
  document.getElementById("undo-btn").addEventListener("click", () => {
    if (running) return;
    program.pop();
    renderRail();
  });
  document.getElementById("clear-btn").addEventListener("click", () => {
    if (running) return;
    program = [];
    renderRail();
  });

  document.addEventListener("keydown", (event) => {
    if (ui.game.classList.contains("hidden") || running) return;
    const keys = { "1": "ileri", "2": "sol", "3": "sag", "4": "cak" };
    if (keys[event.key]) addStep(keys[event.key]);
    if (event.key === "Enter") runProgram();
    if (event.key === "Backspace") {
      event.preventDefault();
      program.pop();
      renderRail();
    }
  });
}

function show(name) {
  ui.title.classList.toggle("hidden", name !== "title");
  ui.game.classList.toggle("hidden", name !== "game");
  ui.win.classList.toggle("hidden", name !== "win");
}

function loadLevel(resetProgram = true) {
  const level = LEVELS[levelIndex];
  ui.levelTag.textContent = `seviye ${levelIndex + 1} / ${LEVELS.length}`;
  ui.levelTitle.textContent = level.title;
  ui.brief.textContent = level.brief;
  if (resetProgram) program = [];
  running = false;
  ui.run.disabled = false;
  setStatus("Programı diz, sonra çalıştır.");
  renderRail();
  draw(freshState());
}

function freshState() {
  const level = LEVELS[levelIndex];
  return {
    robot: { ...level.robot },
    target: { ...level.target },
    walls: level.walls,
    smashed: false,
    over: false,
    message: "",
  };
}

function addStep(name) {
  if (running) return;
  if (program.length >= MAX_STEPS) {
    setStatus(`Bant doldu. En fazla ${MAX_STEPS} komut.`, "bad");
    return;
  }
  program.push(name);
  renderRail();
}

function renderRail() {
  ui.rail.innerHTML = "";
  program.forEach((name, i) => {
    const el = document.createElement("span");
    el.className = `step ${name}`;
    el.textContent = `${i + 1}.${COMMANDS[name].label}`;
    ui.rail.appendChild(el);
  });
  ui.code.textContent = program.length
    ? program.map((name) => COMMANDS[name].code).join("\n")
    : "// henüz komut yok\n// cakbot.ileri()";
}

async function runProgram() {
  if (running) return;
  if (!program.length) {
    setStatus("Boş bant. Robot kıpırdamaz, sadece seni yargılar.", "bad");
    return;
  }
  running = true;
  ui.run.disabled = true;
  const state = freshState();
  draw(state);
  for (const name of program) {
    const result = COMMANDS[name].run(state);
    draw(state);
    if (name === "cak") {
      const robotEl = document.querySelector(".robot");
      if (robotEl) robotEl.classList.add("punch");
    }
    if (result === "win") {
      setStatus(winLine(state.target.kind), "good");
      await wait(700);
      nextLevel();
      return;
    }
    if (result === "fail") {
      setStatus(state.message, "bad");
      running = false;
      ui.run.disabled = false;
      return;
    }
    await wait(320);
  }
  if (!state.smashed) {
    setStatus("Program bitti, hedef hâlâ ayakta. Yeniden diz.", "bad");
  }
  running = false;
  ui.run.disabled = false;
}

function nextLevel() {
  levelIndex += 1;
  running = false;
  ui.run.disabled = false;
  if (levelIndex >= LEVELS.length) {
    show("win");
    return;
  }
  loadLevel();
}

function draw(state) {
  ui.board.innerHTML = "";
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      if (isWall(state, x, y)) cell.classList.add("wall");
      if (state.robot.x === x && state.robot.y === y) {
        const robot = document.createElement("div");
        robot.className = `robot dir-${state.robot.dir}`;
        robot.innerHTML = '<i class="arm"></i><i class="visor"></i>';
        cell.appendChild(robot);
      }
      if (isTarget(state, x, y)) {
        const target = document.createElement("div");
        target.className = `target ${state.target.kind}${state.smashed ? " smashed" : ""}`;
        target.textContent = state.smashed ? "ÖLDÜ" : state.target.label;
        cell.appendChild(target);
      }
      ui.board.appendChild(cell);
    }
  }
}

function inside(x, y) {
  return x >= 0 && y >= 0 && x < COLS && y < ROWS;
}

function isWall(state, x, y) {
  return state.walls.some((w) => w.x === x && w.y === y);
}

function isTarget(state, x, y) {
  return state.target.x === x && state.target.y === y;
}

function fail(state, message) {
  state.over = true;
  state.message = message;
  return "fail";
}

function setStatus(text, kind) {
  ui.status.textContent = text;
  ui.status.className = `status${kind ? ` ${kind}` : ""}`;
}

function winLine(kind) {
  const lines = {
    toast: "Tost dağıldı. Sabah kahvaltısı iptal.",
    printer: "Yazıcı artık evrak basamaz. Adalet yerini buldu.",
    plant: "Bitki devrildi. Fotosentez durdu.",
    coffee: "Kahve makinesi çöktü. Ofis uyandı, sonra üzüldü.",
    micro: "Mikrodalga sustu. Patlamış mısır özgür.",
    copier: "Kopya bitti. Asıl evrak senin yumruğun.",
  };
  return lines[kind] || "ÇAK. Hedef yok.";
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stamp() {
  ui.stamp.classList.remove("hidden");
  ui.board.classList.remove("shake");
  void ui.board.offsetWidth;
  ui.board.classList.add("shake");
  setTimeout(() => ui.stamp.classList.add("hidden"), 280);
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
  gain.gain.setValueAtTime(0.05, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + time);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + time);
}

function thud() {
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(90, audio.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, audio.currentTime + 0.16);
  gain.gain.setValueAtTime(0.18, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.16);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + 0.18);
}

boot();
