import { useState } from "react";
import {
  WEEK_TEMPLATES,
  MODE_NOTES,
  PROGRESS_SETTINGS,
  WEEKLY_HOUR_GOALS,
} from "../../config";

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

const TYPE_LABELS = {
  free: "",
  blocked: "–",
  workout: "Workout",
  coding: "Coding",
  depth: "Tech depth",
  system: "System Design",
  project: "Pet project",
  stories: "Interview prep",
  applications: "Applications",
  review: "Light review",
  networking: "Networking",
  retrieval: "Retrieval",
  "stretch-coding": "+ Coding",
  "stretch-depth": "+ Depth",
  "stretch-system": "+ System Design",
  "stretch-project": "+ Project",
  "stretch-stories": "+ Stories",
  "stretch-workout": "+ Workout",
  "stretch-applications": "+ Applications",
  "stretch-networking": "+ Networking",
  "stretch-retrieval": "+ Retrieval",
};

// Light background colors for schedule grid
const TYPE_COLORS = {
  free: "#f5f5f5",
  blocked: "#e8e8e8",
  workout: "#d4f1d4",
  coding: "#e8e0f5",
  depth: "#d0f0ed",
  system: "#e8d9f5",
  project: "#f5e8d0",
  stories: "#f0d9d0",
  applications: "#d9e8f5",
  review: "#f1efe8",
  networking: "#e0e8f5",
  retrieval: "#f0e8d9",
  "stretch-coding": "#fff",
  "stretch-depth": "#fff",
  "stretch-system": "#fff",
  "stretch-project": "#fff",
  "stretch-stories": "#fff",
  "stretch-workout": "#fff",
  "stretch-applications": "#fff",
  "stretch-networking": "#fff",
  "stretch-retrieval": "#fff",
};

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

export default function ScheduleTab({
  setWeekData,
  currentWeek,
  setCurrentWeek,
  getOrCreateWeek,
}) {
  const [pickerSlot, setPickerSlot] = useState(null);
  const wd = getOrCreateWeek(currentWeek);

  const updateSlot = (day, timeIdx, type) => {
    setWeekData((prev) => {
      const updated = { ...prev };
      const key = `w${currentWeek}`;
      updated[key] = { ...wd };
      updated[key].slots[day][timeIdx] = type;
      return updated;
    });
    setPickerSlot(null);
  };

  const setMode = (mode) => {
    if (wd.mode === mode) return;
    if (!confirm("Switching week types will replace your schedule. Continue?"))
      return;
    setWeekData((prev) => ({
      ...prev,
      [`w${currentWeek}`]: {
        ...prev[`w${currentWeek}`],
        mode,
        slots: JSON.parse(
          JSON.stringify(WEEK_TEMPLATES[mode] || WEEK_TEMPLATES.normal),
        ),
      },
    }));
  };

  const resetWeek = () => {
    setWeekData((prev) => ({
      ...prev,
      [`w${currentWeek}`]: {
        ...prev[`w${currentWeek}`],
        slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES[wd.mode])),
      },
    }));
  };

  const calculateHours = () => {
    let core = 0,
      stretch = 0;
    DAYS.forEach((d) => {
      wd.slots[d].forEach((t) => {
        if (!t || t === "free" || t === "blocked") return;
        if (t.startsWith("stretch-")) stretch++;
        else core++;
      });
    });
    return { core, stretch };
  };

  const { core, stretch } = calculateHours();
  const maxH =
    WEEKLY_HOUR_GOALS[wd.mode]?.totalHours || PROGRESS_SETTINGS.coreHoursMax;

  return (
    <div className="panel active">
      <div className="week-nav" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => setCurrentWeek(currentWeek - 1)}
            style={{ fontSize: "12px", padding: "4px 12px" }}
          >
            ← prev
          </button>
          <span
            className="week-label"
            style={{ fontSize: "14px", fontWeight: "500", minWidth: "140px" }}
          >
            {weekLabel(currentWeek)}
          </span>
          <button
            onClick={() => setCurrentWeek(currentWeek + 1)}
            style={{ fontSize: "12px", padding: "4px 12px" }}
          >
            next →
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            className="mode-badge"
            style={{
              background:
                wd.mode === "normal"
                  ? "#e1f5ee"
                  : wd.mode === "travel"
                    ? "#faeeda"
                    : "#faece7",
              color:
                wd.mode === "normal"
                  ? "#085041"
                  : wd.mode === "travel"
                    ? "#633806"
                    : "#712b13",
              padding: "4px 10px",
              fontSize: "12px",
              borderRadius: "4px",
              fontWeight: "500",
            }}
          >
            {wd.mode === "normal"
              ? "Normal week"
              : wd.mode === "travel"
                ? "Travel week"
                : "Hard week"}
          </span>
          <button
            onClick={resetWeek}
            style={{ fontSize: "12px", padding: "4px 12px" }}
          >
            reset to template
          </button>
        </div>
      </div>

      <div className="week-mode-row" style={{ marginTop: "1rem" }}>
        <select
          value={wd.mode}
          onChange={(e) => setMode(e.target.value)}
          style={{
            padding: "6px 10px",
            fontSize: "12px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            background: "#fff",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          <option value="normal">Normal week</option>
          <option value="travel">Travel week</option>
          <option value="hard">Hard week</option>
        </select>
      </div>

      <p className="tip">Click any slot to change it. Dotted = stretch goal.</p>

      <div className="grid-wrap">
        <div
          className="week-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "auto repeat(7, 1fr)",
            gap: "2px",
            padding: "10px",
          }}
        >
          <div></div>
          {DAYS.map((d) => (
            <div
              key={d}
              className="day-header"
              style={{ fontWeight: "bold", textAlign: "center" }}
            >
              {d}
            </div>
          ))}
          {TIMES.map((t, ti) => [
            <div
              key={`time-${ti}`}
              className="time-label"
              style={{
                fontSize: "11px",
                textAlign: "right",
                paddingRight: "8px",
              }}
            >
              {t}
            </div>,
            ...DAYS.map((d) => {
              const type = wd.slots[d][ti];
              const isSelected =
                pickerSlot?.day === d && pickerSlot?.time === ti;
              const getTypeColor = (t) => {
                if (t.includes("coding")) return "pu";
                if (t.includes("depth")) return "te";
                if (t.includes("system")) return "pu";
                if (t.includes("project")) return "am";
                if (t.includes("stories")) return "co";
                if (t.includes("networking")) return "bl";
                if (t.includes("retrieval")) return "am";
                if (t.includes("workout")) return "gr";
                if (t.includes("applications")) return "bl";
                return "gy";
              };
              const tc = getTypeColor(type);
              return (
                <div
                  key={`${d}-${ti}`}
                  className={`slot ${type}`}
                  onClick={() => setPickerSlot({ day: d, time: ti })}
                  style={{
                    background: isSelected
                      ? "#ddd"
                      : TYPE_COLORS[type] || "#fff",
                    border: isSelected
                      ? "2px solid #333"
                      : type.startsWith("stretch-")
                        ? `1.5px dashed var(--${tc}600)`
                        : "none",
                    padding: "4px",
                    textAlign: "center",
                    fontSize: "9px",
                    cursor: "pointer",
                  }}
                >
                  {TYPE_LABELS[type]}
                </div>
              );
            }),
          ]).flat()}
        </div>
      </div>

      {pickerSlot && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: "1rem",
            border: "2px solid #333",
            borderRadius: "8px",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            minWidth: "300px",
          }}
        >
          <div
            style={{
              marginBottom: "0.75rem",
              fontSize: "0.95rem",
              fontWeight: "500",
            }}
          >
            {pickerSlot.day} {TIMES[pickerSlot.time]}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "6px",
              marginBottom: "0.75rem",
            }}
          >
            {[
              "coding",
              "depth",
              "system",
              "project",
              "stories",
              "networking",
              "retrieval",
              "workout",
              "applications",
              "review",
              "free",
              "stretch-coding",
              "stretch-depth",
              "stretch-system",
              "stretch-project",
              "stretch-stories",
              "stretch-networking",
              "stretch-retrieval",
              "blocked",
            ].map((tp) => {
              const isStretch = tp.startsWith("stretch-");
              const getTypeColor = (t) => {
                if (t.includes("coding")) return "pu";
                if (t.includes("depth")) return "te";
                if (t.includes("system")) return "pu";
                if (t.includes("project")) return "am";
                if (t.includes("stories")) return "co";
                if (t.includes("networking")) return "bl";
                if (t.includes("retrieval")) return "am";
                if (t.includes("workout")) return "gr";
                if (t.includes("applications")) return "bl";
                return "gy";
              };
              const tc = getTypeColor(tp);
              return (
                <button
                  key={tp}
                  onClick={() =>
                    updateSlot(pickerSlot.day, pickerSlot.time, tp)
                  }
                  style={{
                    padding: "6px 8px",
                    fontSize: "11px",
                    background: TYPE_COLORS[tp] || "#f0f0f0",
                    border: isStretch ? `1.5px dashed var(--${tc}600)` : "none",
                    cursor: "pointer",
                    borderRadius: "3px",
                    color: isStretch ? `var(--${tc}600)` : "#222",
                    fontWeight: isStretch ? "500" : "400",
                  }}
                >
                  {TYPE_LABELS[tp] || tp}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setPickerSlot(null)}
            style={{
              padding: "6px 12px",
              fontSize: "11px",
              background: "#f0f0f0",
              border: "1px solid #ccc",
              borderRadius: "3px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Close
          </button>
        </div>
      )}

      <div className="hours-bar" style={{ marginTop: "1rem" }}>
        <span className="hours-label">Core hours</span>
        <div
          style={{
            flex: 1,
            height: "6px",
            background: "#eee",
            borderRadius: "3px",
            overflow: "hidden",
            margin: "0 8px",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#534AB7",
              width: Math.min(100, (core / maxH) * 100) + "%",
            }}
          ></div>
        </div>
        <span style={{ fontSize: "11px" }}>{core} hrs</span>
      </div>

      <div className="hours-bar" style={{ marginTop: "8px" }}>
        <span className="hours-label">With stretch</span>
        <div
          style={{
            flex: 1,
            height: "6px",
            background: "#eee",
            borderRadius: "3px",
            overflow: "hidden",
            margin: "0 8px",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#0F6E56",
              width: Math.min(100, ((core + stretch) / maxH) * 100) + "%",
            }}
          ></div>
        </div>
        <span style={{ fontSize: "11px" }}>{core + stretch} hrs total</span>
      </div>

      <div
        className="legend"
        style={{
          marginTop: "2rem",
          gap: "16px",
          justifyContent: "flex-start",
        }}
      >
        {[
          "coding",
          "depth",
          "system",
          "project",
          "stories",
          "networking",
          "retrieval",
          "workout",
          "applications",
          "review",
        ].map((type) => (
          <div
            key={type}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                background: TYPE_COLORS[type],
                borderRadius: "2px",
              }}
            ></div>
            <span>{TYPE_LABELS[type]}</span>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "2px",
              border: "2px dashed #534AB7",
              background: "transparent",
            }}
          ></div>
          <span>Stretch goal</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              background: "#e8e8e8",
              borderRadius: "2px",
            }}
          ></div>
          <span>Blocked</span>
        </div>
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "12px",
          background: "#f5f5f5",
          borderRadius: "4px",
          fontSize: "12px",
          color: "#666",
        }}
      >
        {MODE_NOTES[wd.mode]}
      </div>

      <div
        style={{
          marginTop: "1.5rem",
          padding: "12px",
          background: "#f5f5f5",
          borderRadius: "4px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: "600",
            marginBottom: "10px",
            color: "#333",
          }}
        >
          Weekly Goals ({wd.mode})
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
          }}
        >
          {Object.entries(WEEKLY_HOUR_GOALS[wd.mode].breakdown).map(
            ([activity, goalHours]) => {
              if (goalHours === 0) return null;
              const actualHours = DAYS.reduce((sum, day) => {
                return (
                  sum +
                  wd.slots[day].filter(
                    (t) => t === activity || t === `stretch-${activity}`,
                  ).length
                );
              }, 0);
              const isMet = actualHours >= goalHours;
              return (
                <div
                  key={activity}
                  style={{
                    fontSize: "11px",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px",
                    borderRadius: "3px",
                    background: isMet ? "#e8f5e9" : "#ffebee",
                    color: isMet ? "#1b5e20" : "#c62828",
                  }}
                >
                  <span>{activity.replace("-", " ")}</span>
                  <span style={{ fontWeight: "600" }}>
                    {actualHours}/{goalHours} hrs
                  </span>
                </div>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}
