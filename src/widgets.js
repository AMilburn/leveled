// Widget logic for Leveled SPA
// Import your custom config - edit src/config.js to customize templates for your schedule
import {
  WEEK_TEMPLATES,
  MODE_NOTES,
  WEEKLY_GOALS,
  PROGRESS_SETTINGS,
} from "./config.js";
import { syncAllData, loadFromSupabase } from "./supabase.js";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMES = [
  "8am",
  "9am",
  "10am",
  "11am",
  "12pm",
  "1pm",
  "2pm",
  "3pm",
  "4pm",
  "5pm",
  "6pm",
  "7pm",
  "8pm",
  "9pm",
  "10pm",
];

const TYPES = [
  "free",
  "blocked",
  "workout",
  "coding",
  "depth",
  "project",
  "stories",
  "flex",
  "review",
  "stretch-coding",
  "stretch-depth",
  "stretch-project",
  "stretch-stories",
  "stretch-workout",
  "stretch-flex",
];
const TYPE_LABELS = {
  free: "",
  blocked: "–",
  workout: "Workout",
  coding: "Coding",
  depth: "Tech depth",
  project: "Pet project",
  stories: "Interview prep",
  flex: "Applications",
  review: "Light review",
  "stretch-coding": "+ Coding",
  "stretch-depth": "+ Depth",
  "stretch-project": "+ Project",
  "stretch-stories": "+ Stories",
  "stretch-workout": "+ Workout",
  "stretch-flex": "+ Applications",
};
const TYPE_COLORS = {
  free: "#888",
  blocked: "#aaa",
  workout: "#3B6D11",
  coding: "#534AB7",
  depth: "#0F6E56",
  project: "#854F0B",
  stories: "#993C1D",
  flex: "#185FA5",
  review: "#5F5E5A",
  "stretch-coding": "#534AB7",
  "stretch-depth": "#0F6E56",
  "stretch-project": "#854F0B",
  "stretch-stories": "#993C1D",
  "stretch-workout": "#3B6D11",
  "stretch-flex": "#185FA5",
};

let currentWeek = 0;
let weekData = {};
let pWeek = 0;

function wk(n) {
  return "w" + n;
}
function getWD(n) {
  if (!weekData[wk(n)]) {
    const mode = "normal";
    weekData[wk(n)] = {
      slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal)),
      mode,
      counts: {},
      reflection: "",
    };
  }
  return weekData[wk(n)];
}

function templateForMode(m) {
  return JSON.parse(JSON.stringify(WEEK_TEMPLATES[m] || WEEK_TEMPLATES.normal));
}

function weekLabel(n) {
  const now = new Date(2026, 2, 15);
  const mon = new Date(now);
  const day = now.getDay() || 7;
  mon.setDate(now.getDate() - (day - 1) + n * 7);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return (
    mon.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) +
    " – " +
    sun.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  );
}

let currentPickerSlot = null;

function closeAllPickers() {
  const picker = document.getElementById("globalTypePicker");
  if (picker) picker.style.display = "none";
  currentPickerSlot = null;
}

function createGlobalPicker() {
  let picker = document.getElementById("globalTypePicker");
  if (picker) return;
  picker = document.createElement("div");
  picker.id = "globalTypePicker";
  picker.className = "type-picker";
  picker.style.position = "fixed";
  TYPES.forEach((tp) => {
    if (tp === "blocked") return;
    const opt = document.createElement("div");
    opt.className = "type-opt";
    const dot = document.createElement("div");
    dot.className = "type-dot";
    dot.style.background = TYPE_COLORS[tp];
    if (tp.startsWith("stretch-"))
      ((dot.style.border = "1.5px dashed " + TYPE_COLORS[tp]),
        (dot.style.background = "transparent"));
    opt.appendChild(dot);
    opt.appendChild(document.createTextNode(TYPE_LABELS[tp] || "(empty)"));
    opt.dataset.type = tp;
    opt.onclick = (e) => {
      e.stopPropagation();
      selectSlotType(tp);
    };
    picker.appendChild(opt);
  });
  document.body.appendChild(picker);
}

function selectSlotType(tp) {
  if (!currentPickerSlot) return;
  const [d, ti] = currentPickerSlot;
  const wd = getWD(currentWeek);
  wd.slots[d][ti] = tp;
  saveData();
  closeAllPickers();
  buildSchedule();
}

function buildSchedule() {
  const wd = getWD(currentWeek);
  document.getElementById("weekLabel").textContent = weekLabel(currentWeek);
  const mb = document.getElementById("modeBadge");
  mb.className = "mode-badge mode-" + wd.mode;
  mb.textContent =
    wd.mode === "normal"
      ? "Normal week"
      : wd.mode === "travel"
        ? "Travel week"
        : "Hard week";
  const select = document.getElementById("weekTypeSelect");
  if (select) select.value = wd.mode;
  document.getElementById("modeNote").textContent = MODE_NOTES[wd.mode];

  const g = document.getElementById("schedGrid");
  g.innerHTML = "";
  const empty = document.createElement("div");
  g.appendChild(empty);
  DAYS.forEach((d) => {
    const h = document.createElement("div");
    h.className = "day-header";
    h.textContent = d;
    g.appendChild(h);
  });

  TIMES.forEach((t, ti) => {
    const tl = document.createElement("div");
    tl.className = "time-label";
    tl.textContent = t;
    g.appendChild(tl);
    DAYS.forEach((d, di) => {
      const type = wd.slots[d][ti];
      const s = document.createElement("div");
      s.className = "slot " + type;
      s.textContent = TYPE_LABELS[type] || "";
      s.style.position = "relative";

      if (type !== "blocked") {
        s.onclick = (e) => {
          e.stopPropagation();
          createGlobalPicker();
          currentPickerSlot = [d, ti];
          const picker = document.getElementById("globalTypePicker");
          const rect = s.getBoundingClientRect();
          picker.style.top = rect.bottom + 5 + "px";
          picker.style.left = rect.left + "px";
          picker.style.display = "block";
        };
      }
      g.appendChild(s);
    });
  });

  updateHours(wd);
}

function updateHours(wd) {
  let core = 0,
    stretch = 0;
  DAYS.forEach((d) =>
    wd.slots[d].forEach((t) => {
      if (!t || t === "free" || t === "blocked") return;
      if (t.startsWith("stretch-")) stretch++;
      else core++;
    }),
  );
  const maxH = PROGRESS_SETTINGS.coreHoursMax;
  document.getElementById("coreBar").style.width =
    Math.min(100, (core / maxH) * 100) + "%";
  document.getElementById("stretchBar").style.width =
    Math.min(100, ((core + stretch) / maxH) * 100) + "%";
  document.getElementById("coreHrs").textContent = core + " hrs";
  document.getElementById("stretchHrs").textContent =
    core + stretch + " hrs total";
}

window.changeWeek = function (d) {
  currentWeek += d;
  buildSchedule();
};
window.resetWeek = function () {
  const wd = getWD(currentWeek);
  wd.slots = templateForMode(wd.mode);
  saveData();
  buildSchedule();
};
window.setMode = function (m) {
  const wd = getWD(currentWeek);
  if (wd.mode === m) return; // Already in this mode
  if (
    !confirm(
      "Switching week types will replace your current schedule with the template. Any custom changes will be lost. Continue?"
    )
  ) {
    return;
  }
  wd.mode = m;
  wd.slots = templateForMode(m);
  saveData();
  buildSchedule();
};

const KCOLS = ["backlog", "up next", "in progress", "done"];
const KCOL_BG = ["var(--gy50)", "var(--bl50)", "var(--am50)", "var(--gr50)"];
const KTAG_STYLES = {
  coding: "background:var(--pu50);color:var(--pu800)",
  depth: "background:var(--te50);color:var(--te800)",
  project: "background:var(--am50);color:var(--am800)",
  interview: "background:var(--co50);color:var(--co800)",
  mindset: "background:var(--bl50);color:var(--bl800)",
};

let nextTaskId = 100;
let kanban = [
  {
    id: 1,
    col: 0,
    title: "NeetCode: Arrays & Hashing",
    tag: "coding",
    note: "Start here. 5 problems.",
  },
  {
    id: 2,
    col: 0,
    title: "NeetCode: Sliding Window",
    tag: "coding",
    note: "Contiguous array — your gap.",
  },
  { id: 3, col: 0, title: "NeetCode: Two Pointers", tag: "coding", note: "" },
  {
    id: 4,
    col: 0,
    title: "Live coding (recorded)",
    tag: "coding",
    note: "Narrate out loud. Even to yourself.",
  },
  {
    id: 5,
    col: 0,
    title: "Tech depth: Frontend perf",
    tag: "depth",
    note: "CWV, bundle opt, rendering",
  },
  {
    id: 6,
    col: 0,
    title: "Tech depth: DB optimization",
    tag: "depth",
    note: "Indexing, N+1, query planning",
  },
  {
    id: 7,
    col: 0,
    title: "Tech depth: Security (OWASP)",
    tag: "depth",
    note: "Auth patterns, XSS/CSRF",
  },
  {
    id: 8,
    col: 0,
    title: "Tech depth: Architecture tradeoffs",
    tag: "depth",
    note: "CAP theorem, micro vs mono",
  },
  {
    id: 9,
    col: 0,
    title: "Story mining (5 projects)",
    tag: "interview",
    note: "Scale, decisions, tradeoffs, results",
  },
  {
    id: 10,
    col: 0,
    title: "STAR bank (10 questions)",
    tag: "interview",
    note: "Leadership, conflict, failure, scale",
  },
  {
    id: 11,
    col: 0,
    title: "Pick pet project",
    tag: "project",
    note: "LLM/agentic preferred",
  },
  { id: 12, col: 0, title: "Pet project: ship v0.1", tag: "project", note: "" },
  { id: 13, col: 0, title: "Pet project: ship v0.2", tag: "project", note: "" },
  {
    id: 14,
    col: 0,
    title: "Freeze protocol (write on card)",
    tag: "mindset",
    note: '"Brute force first, narrate always"',
  },
];

function buildKanban() {
  const b = document.getElementById("kanbanBoard");
  b.innerHTML = "";
  KCOLS.forEach((col, ci) => {
    const div = document.createElement("div");
    const h = document.createElement("div");
    h.className = "col-head";
    h.style.background = KCOL_BG[ci];
    h.textContent =
      col + " (" + kanban.filter((c) => c.col === ci).length + ")";
    div.appendChild(h);
    kanban
      .filter((c) => c.col === ci)
      .forEach((card) => {
        const cd = document.createElement("div");
        cd.className = "kcard";
        cd.innerHTML = `<div class="kcard-title">${card.title}</div><span class="ktag" style="${KTAG_STYLES[card.tag] || ""}">${card.tag}</span>${card.note ? `<div class="knote">${card.note}</div>` : ""}`;
        const btns = document.createElement("div");
        if (ci > 0) {
          const b = document.createElement("button");
          b.className = "kmove";
          b.textContent = "← back";
          b.onclick = () => {
            card.col--;
            saveData();
            buildKanban();
          };
          btns.appendChild(b);
        }
        if (ci < 3) {
          const b = document.createElement("button");
          b.className = "kmove";
          b.textContent = "forward →";
          b.onclick = () => {
            card.col++;
            saveData();
            buildKanban();
          };
          btns.appendChild(b);
        }
        const editBtn = document.createElement("button");
        editBtn.className = "kmove";
        editBtn.textContent = "edit";
        editBtn.onclick = () => window.editTask(card.id);
        btns.appendChild(editBtn);
        const delBtn = document.createElement("button");
        delBtn.className = "kmove";
        delBtn.textContent = "✕";
        delBtn.onclick = () => window.deleteTask(card.id);
        btns.appendChild(delBtn);
        cd.appendChild(btns);
        div.appendChild(cd);
      });
    b.appendChild(div);
  });
}

window.addTask = function () {
  const input = document.getElementById("taskInput");
  const tagSelect = document.getElementById("taskTag");
  const title = input.value.trim();
  if (!title) return;
  const newTask = {
    id: nextTaskId++,
    col: 0,
    title: title,
    tag: tagSelect.value,
    note: "",
  };
  kanban.push(newTask);
  input.value = "";
  saveData();
  buildKanban();
};

window.editTask = function (id) {
  const task = kanban.find((t) => t.id === id);
  if (!task) return;
  const newTitle = prompt("Edit task title:", task.title);
  if (newTitle === null) return;
  if (newTitle.trim()) {
    task.title = newTitle.trim();
    const newNote = prompt("Edit task note:", task.note || "");
    if (newNote !== null) {
      task.note = newNote.trim();
      saveData();
      buildKanban();
    }
  }
};

window.deleteTask = function (id) {
  if (!confirm("Delete this task?")) return;
  kanban = kanban.filter((t) => t.id !== id);
  saveData();
  buildKanban();
};

// Goals are now loaded from config - see WEEKLY_GOALS in config.js
function getGoalsForWeek(mode) {
  return WEEKLY_GOALS[mode] || WEEKLY_GOALS.normal;
}

function buildProgress() {
  document.getElementById("pWeekLabel").textContent = weekLabel(pWeek);
  const wd = getWD(pWeek);
  const cc = document.getElementById("counters");
  cc.innerHTML = "";
  const goals = getGoalsForWeek(wd.mode);
  goals.forEach((def) => {
    const val = wd.counts[def.key] || 0;
    const goal = def.goal;
    const row = document.createElement("div");
    row.className = "cnt-row";
    row.innerHTML = `<span style="font-size:12px;min-width:180px;color:var(--color-text-secondary)">${def.label}</span>
    <button class="cnt-btn" onclick="window.adj('${def.key}',-1)">−</button>
    <span class="cnt-val" id="cv_${def.key}">${val}</span>
    <button class="cnt-btn" onclick="window.adj('${def.key}',1)">+</button>
    <div style="flex:1;height:6px;background:var(--color-background-tertiary);border-radius:3px;overflow:hidden;margin-left:8px"><div style="height:100%;border-radius:3px;background:${def.color};width:${Math.min(100, Math.round((val / goal) * 100))}%"></div></div>
    <span style="font-size:11px;color:var(--color-text-tertiary);margin-left:6px;min-width:50px">goal: ${goal}</span>`;
    cc.appendChild(row);
  });
  document.getElementById("reflectionNote").value = wd.reflection || "";
  buildTotals();
}

window.adj = function (key, d) {
  const wd = getWD(pWeek);
  wd.counts[key] = Math.max(0, (wd.counts[key] || 0) + d);
  saveData();
  buildProgress();
};
window.saveReflection = function () {
  const wd = getWD(pWeek);
  wd.reflection = document.getElementById("reflectionNote").value;
  saveData();
  const m = document.getElementById("savedMsg");
  m.style.display = "inline";
  setTimeout(() => (m.style.display = "none"), 1500);
};
window.changePWeek = function (d) {
  pWeek += d;
  buildProgress();
};

function buildTotals() {
  const t = document.getElementById("totals");
  t.innerHTML = "";
  const tots = {};
  const goals = getGoalsForWeek("normal"); // Use normal week goals as reference for totals
  goals.forEach((d) => (tots[d.key] = 0));
  Object.values(weekData).forEach((w) =>
    goals.forEach((d) => (tots[d.key] += w.counts[d.key] || 0)),
  );
  goals.forEach((def) => {
    const row = document.createElement("div");
    row.className = "prog-row";
    row.innerHTML = `<div class="prog-label">${def.label}</div><div class="prog-bar-bg"><div class="prog-bar" style="width:${Math.min(100, Math.round((tots[def.key] / PROGRESS_SETTINGS.cumulativeGoal) * 100))}%;background:${def.color}"></div></div><div style="font-size:13px;font-weight:500;min-width:30px;text-align:right;color:var(--color-text-primary)">${tots[def.key]}</div>`;
    t.appendChild(row);
  });
}

let wins = [];
function buildWins() {
  const wl = document.getElementById("winsList");
  wl.innerHTML = "";
  if (!wins.length) {
    wl.innerHTML =
      '<p style="font-size:12px;color:var(--color-text-tertiary)">No wins yet — add your first one above.</p>';
    return;
  }
  wins
    .slice()
    .reverse()
    .forEach((w) => {
      const c = document.createElement("span");
      c.className = "win-chip";
      c.textContent = w;
      wl.appendChild(c);
    });
}
window.addWin = function () {
  const i = document.getElementById("winInput");
  const v = i.value.trim();
  if (!v) return;
  wins.push(v);
  i.value = "";
  saveData();
  buildWins();
};

window.showTab = function (id, el) {
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".panel")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  el.classList.add("active");
};

async function saveData() {
  try {
    localStorage.setItem("jsd2_weeks", JSON.stringify(weekData));
    localStorage.setItem("jsd2_kanban", JSON.stringify(kanban));
    localStorage.setItem("jsd2_wins", JSON.stringify(wins));
    // Sync to Supabase in production
    await syncAllData(weekData, kanban, wins);
  } catch (e) {}
}
async function loadData() {
  try {
    // Try loading from Supabase first (production only)
    const supabaseData = await loadFromSupabase();
    if (supabaseData) {
      weekData = supabaseData.weekData;
      kanban = supabaseData.kanban;
      wins = supabaseData.wins;
      return;
    }
  } catch (e) {
    console.error("Failed to load from Supabase:", e);
  }

  // Fall back to localStorage
  try {
    const w = localStorage.getItem("jsd2_weeks");
    if (w) weekData = JSON.parse(w);
    const k = localStorage.getItem("jsd2_kanban");
    if (k) kanban = JSON.parse(k);
    const wn = localStorage.getItem("jsd2_wins");
    if (wn) wins = JSON.parse(wn);
  } catch (e) {}
}

// Initialize app - load data then build UI
loadData().then(() => {
  buildSchedule();
  buildKanban();
  buildProgress();
  buildWins();
});

// Sync data when coming back online
window.addEventListener("online", () => {
  syncAllData(weekData, kanban, wins);
});

// Close picker when clicking outside
document.addEventListener("click", (e) => {
  const picker = document.getElementById("globalTypePicker");
  if (
    picker &&
    !e.target.closest(".type-picker") &&
    !e.target.closest(".slot")
  ) {
    closeAllPickers();
  }
});
