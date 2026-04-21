import { useState } from "react";
import {
  WEEK_TEMPLATES,
  PROGRESS_SETTINGS,
  WEEKLY_HOUR_GOALS,
  SCHEDULE_CONFIG,
  CORE_ACTIVITIES,
  ALL_ACTIVITIES,
  Week,
  WeekData,
  ActivityType,
  WeekMode,
} from "../../config";

const DAYS = SCHEDULE_CONFIG.days;
const TIMES = SCHEDULE_CONFIG.times;

function weekLabel(n: number): string {
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
}: {
  setWeekData: (updater: (prev: WeekData) => WeekData) => void;
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
  getOrCreateWeek: (week: number) => Week;
}) {
  const [pickerSlot, setPickerSlot] = useState<{
    day: string;
    time: number;
  } | null>(null);
  const wd = getOrCreateWeek(currentWeek);

  const updateSlot = (day: string, timeIdx: number, type: ActivityType) => {
    setWeekData((prev) => {
      const updated = { ...prev };
      const key = `w${currentWeek}`;
      updated[key] = {
        ...wd,
        slots: {
          ...wd.slots,
          [day]: [...wd.slots[day]],
        },
      };
      updated[key].slots[day][timeIdx] = type;
      return updated;
    });
    setPickerSlot(null);
  };

  const setMode = (mode: WeekMode) => {
    if (wd.mode === mode) return;
    if (!confirm("Switching week types will replace your schedule. Continue?"))
      return;
    setWeekData((prev) => ({
      ...prev,
      [`w${currentWeek}`]: {
        ...prev[`w${currentWeek}`],
        mode,
        slots: JSON.parse(
          JSON.stringify(
            (WEEK_TEMPLATES[mode as keyof typeof WEEK_TEMPLATES]?.template ||
              WEEK_TEMPLATES.normal.template),
          ),
        ),
      },
    }));
  };

  const resetWeek = () => {
    setWeekData((prev) => ({
      ...prev,
      [`w${currentWeek}`]: {
        ...prev[`w${currentWeek}`],
        slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES[wd.mode].template)),
      },
    }));
  };

  const clearWeek = () => {
    if (!confirm("Remove all scheduled activities? Week type and goals will be kept."))
      return;
    const blank = Object.fromEntries(DAYS.map((day) => [day, Array(15).fill("free")]));
    setWeekData((prev) => ({
      ...prev,
      [`w${currentWeek}`]: {
        ...prev[`w${currentWeek}`],
        slots: blank,
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
  const coreMax = PROGRESS_SETTINGS[wd.mode]?.coreHoursMax || 21;
  const withStretchMax = coreMax + (PROGRESS_SETTINGS[wd.mode]?.stretchMax || 0);

  return (
    <div className="panel active">
      <div className="week-nav" style={{ justifyContent: "space-between" }}>
        <button
          onClick={() => setCurrentWeek(currentWeek - 1)}
          style={{ fontSize: "12px", padding: "4px 12px" }}
          className="week-prev"
        >
          ← prev
        </button>
        <span
          className="week-label"
          style={{ fontSize: "14px", fontWeight: "500", minWidth: "140px", textAlign: "center" }}
        >
          {weekLabel(currentWeek)}
        </span>
        <button
          onClick={() => setCurrentWeek(currentWeek + 1)}
          style={{ fontSize: "12px", padding: "4px 12px" }}
          className="week-next"
        >
          next →
        </button>
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
          <button
            onClick={clearWeek}
            style={{ fontSize: "12px", padding: "4px 12px" }}
          >
            clear week
          </button>
        </div>
      </div>

      <div className="week-mode-row" style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
        <label style={{ fontSize: "12px", color: "#666", fontWeight: "500" }}>Use template:</label>
        <select
          value={wd.mode}
          onChange={(e) => setMode(e.target.value as WeekMode)}
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
              const getStretchColor = (t: string): string => {
                const baseActivity = t.replace("stretch-", "");
                const color = Object.entries(SCHEDULE_CONFIG.typeColors).find(
                  ([key]) => key === baseActivity,
                )?.[1];
                return color || SCHEDULE_CONFIG.typeColors.free;
              };
              const getDarkenedStretchColor = (t: string): string => {
                const colorMap: Record<string, string> = {
                  coding: "#5a52a8",
                  depth: "#1a8a7f",
                  system: "#a879a8",
                  project: "#cc8a3a",
                  stories: "#b85a46",
                  workout: "#2d8a2d",
                  applications: "#3a5a9a",
                  networking: "#3a5a9a",
                  retrieval: "#8a7a5a",
                };
                const baseActivity = t.replace("stretch-", "");
                return colorMap[baseActivity] || "#333";
              };
              return (
                <div
                  key={`${d}-${ti}`}
                  onClick={() => setPickerSlot({ day: d, time: ti })}
                  style={{
                    height: "32px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "9px",
                    fontWeight: "500",
                    textAlign: "center",
                    lineHeight: "1.2",
                    padding: "2px 3px",
                    cursor: "pointer",
                    userSelect: "none",
                    background: isSelected
                      ? "#ddd"
                      : SCHEDULE_CONFIG.typeColors[type],
                    border: isSelected
                      ? "2px solid #333"
                      : type.startsWith("stretch-")
                        ? `1.5px dashed ${getStretchColor(type)}`
                        : "none",
                    color: type.startsWith("stretch-")
                      ? getDarkenedStretchColor(type)
                      : "#222",
                  }}
                >
                  {SCHEDULE_CONFIG.typeLabels[type]}
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
              fontSize: "11px",
              color: "#666",
              marginBottom: "0.75rem",
              lineHeight: "1.3",
            }}
          >
            Solid = core. Dotted = stretch goal.
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "6px",
              marginBottom: "0.75rem",
            }}
          >
            {ALL_ACTIVITIES.map((tp) => {
              const isStretch = tp.startsWith("stretch-");
              const getStretchColor = (t: string): string => {
                const baseActivity = t.replace("stretch-", "");
                const color = Object.entries(SCHEDULE_CONFIG.typeColors).find(
                  ([key]) => key === baseActivity,
                )?.[1];
                return color || SCHEDULE_CONFIG.typeColors.free;
              };
              const getDarkenedStretchColor = (t: string): string => {
                const colorMap: Record<string, string> = {
                  coding: "#5a52a8",
                  depth: "#1a8a7f",
                  system: "#a879a8",
                  project: "#cc8a3a",
                  stories: "#b85a46",
                  workout: "#2d8a2d",
                  applications: "#3a5a9a",
                  networking: "#3a5a9a",
                  retrieval: "#8a7a5a",
                };
                const baseActivity = t.replace("stretch-", "");
                return colorMap[baseActivity] || "#333";
              };
              const stretchColor = isStretch ? getStretchColor(tp) : undefined;
              return (
                <button
                  key={tp}
                  onClick={() =>
                    updateSlot(pickerSlot.day, pickerSlot.time, tp)
                  }
                  style={{
                    padding: "6px 8px",
                    fontSize: "9px",
                    fontWeight: "500",
                    textAlign: "center",
                    lineHeight: "1.2",
                    background: SCHEDULE_CONFIG.typeColors[tp],
                    border: isStretch ? `1.5px dashed ${stretchColor}` : "none",
                    cursor: "pointer",
                    borderRadius: "3px",
                    color: isStretch ? getDarkenedStretchColor(tp) : "#222",
                  }}
                >
                  {SCHEDULE_CONFIG.typeLabels[tp] || tp}
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
              width: Math.min(100, (core / coreMax) * 100) + "%",
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
              width: Math.min(100, ((core + stretch) / withStretchMax) * 100) + "%",
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
        {CORE_ACTIVITIES.map((type) => (
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
                background: SCHEDULE_CONFIG.typeColors[type],
                borderRadius: "2px",
              }}
            ></div>
            <span>{SCHEDULE_CONFIG.typeLabels[type]}</span>
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
        {WEEK_TEMPLATES[wd.mode]?.note}
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
