import { useState } from "react";
import LogActivityModal from "../LogActivityModal";
import { Week, WeekData, ActivityLog } from "../../config";
import {
  STATS,
  ACTIVITY_OPTIONS,
  SPECIAL_ACTIVITIES,
  StatType,
  EngineerStats,
  calculateLevel,
  calculateOverallLevel,
  getMostNeedfulStat,
  getEngineerTier,
} from "../../config";

export default function ProgressTab({
  weekData,
  setWeekData,
  pWeek,
  getOrCreateWeek,
}: {
  weekData: WeekData;
  setWeekData: (updater: (prev: WeekData) => WeekData) => void;
  pWeek: number;
  getOrCreateWeek: (week: number) => Week;
}) {
  const [saved, setSaved] = useState(false);
  const [loggingActivity, setLoggingActivity] = useState<string | null>(null);
  const [loggingAmount, setLoggingAmount] = useState("1");
  const [loggingNote, setLoggingNote] = useState("");
  const wd = getOrCreateWeek(pWeek);

  // Calculate player stats from activity logs
  const calculateEngineerStats = (): EngineerStats => {
    const stats: EngineerStats = {
      int: { xp: 0, level: 1, nextLevelXP: 100 },
      wis: { xp: 0, level: 1, nextLevelXP: 100 },
      dex: { xp: 0, level: 1, nextLevelXP: 100 },
      cha: { xp: 0, level: 1, nextLevelXP: 100 },
    };

    const allLogs: ActivityLog[] = [];
    Object.values(weekData).forEach((w) => {
      if (w.activityLogs) {
        allLogs.push(...w.activityLogs);
      }
    });

    // Accumulate points by stat
    const pointsByStats: Record<StatType, number> = {
      int: 0,
      wis: 0,
      dex: 0,
      cha: 0,
    };

    allLogs.forEach((log) => {
      // Find which stat this activity belongs to by searching ACTIVITY_OPTIONS
      let stat: StatType | undefined;
      for (const s of ["int", "wis", "dex", "cha"] as StatType[]) {
        const found = ACTIVITY_OPTIONS[s].find(
          (m) => m.activity === log.activity,
        );
        if (found) {
          stat = s;
          break;
        }
      }
      if (!stat) {
        // Check special activities (e.g., workout) - default to int
        const special = SPECIAL_ACTIVITIES.find((m: any) => m.activity === log.activity);
        stat = special ? "int" : undefined;
      }
      if (stat) {
        pointsByStats[stat] += log.points;
      }
    });

    // Calculate levels for each stat from points
    Object.entries(pointsByStats).forEach(([stat, totalPoints]) => {
      stats[stat as StatType] = calculateLevel(totalPoints);
    });

    return stats;
  };

  const engineerStats = calculateEngineerStats();
  const overallLevel = calculateOverallLevel(engineerStats);
  const weakestStat = getMostNeedfulStat(engineerStats);

  const updateReflection = (text: string) => {
    setWeekData((prev) => ({
      ...prev,
      [`w${pWeek}`]: { ...wd, reflection: text },
    }));
  };

  const saveReflection = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const logActivity = (label: string, amount: number, note: string) => {
    // Find activity option by label
    let mapping: any = null;
    for (const s of ["int", "wis", "dex", "cha"] as StatType[]) {
      const found = ACTIVITY_OPTIONS[s].find((m) => m.label === label);
      if (found) {
        mapping = found;
        break;
      }
    }
    if (!mapping) {
      mapping = SPECIAL_ACTIVITIES.find((m) => m.label === label);
    }
    if (!mapping) return;

    const points = mapping.pointValue * amount;
    const newLog: ActivityLog = {
      activity: mapping.activity,
      amount,
      label,
      points,
      timestamp: new Date().toISOString(),
      ...(note.trim() && { note: note.trim() }),
    };

    setWeekData((prev) => {
      const weekKey = `w${pWeek}`;
      return {
        ...prev,
        [weekKey]: {
          ...wd,
          activityLogs: [...(wd.activityLogs || []), newLog],
        },
      };
    });

    setLoggingActivity(null);
    setLoggingAmount("1");
    setLoggingNote("");
  };

  const deleteActivityLog = (index: number) => {
    setWeekData((prev) => {
      const weekKey = `w${pWeek}`;
      return {
        ...prev,
        [weekKey]: {
          ...wd,
          activityLogs: (wd.activityLogs || []).filter((_, i) => i !== index),
        },
      };
    });
  };

  const getWeeklyPointsByActivity = (): Record<string, number> => {
    const pointsByLabel: Record<string, number> = {};
    (wd.activityLogs || []).forEach((log) => {
      pointsByLabel[log.label] =
        (pointsByLabel[log.label] || 0) + log.points;
    });
    return pointsByLabel;
  };

  const closeModal = () => {
    setLoggingActivity(null);
    setLoggingAmount("1");
    setLoggingNote("");
  };

  return (
    <div className="panel active" style={{ padding: "1rem" }}>

      {loggingActivity && (
        <LogActivityModal
          activityLabel={loggingActivity}
          amount={loggingAmount}
          note={loggingNote}
          onAmountChange={setLoggingAmount}
          onNoteChange={setLoggingNote}
          onConfirm={() => logActivity(loggingActivity, parseInt(loggingAmount) || 1, loggingNote)}
          onCancel={closeModal}
        />
      )}
      {/* Engineer Tier Subtitle */}
      <div
        style={{
          fontSize: "18px",
          color: "#222",
          fontWeight: "600",
          marginBottom: "2rem",
        }}
      >
        {getEngineerTier(overallLevel.level)} • Level {overallLevel.level}
      </div>

      {/* Stats Dashboard */}
      <div style={{ marginBottom: "2rem" }}>
        {/* Overall Level Card */}
        <div
          style={{
            padding: "1rem",
            background: "#f9f9f9",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div>
              <div
                style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}
              >
                Overall Level
              </div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#534AB7",
                }}
              >
                {overallLevel.level}
              </div>
            </div>
            <div
              style={{ textAlign: "right", fontSize: "11px", color: "#999" }}
            >
              avg {overallLevel.avg.toFixed(2)}
            </div>
          </div>
          <div
            style={{
              height: "8px",
              background: "#ddd",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "#534AB7",
                width:
                  Math.min(
                    100,
                    (overallLevel.xp / overallLevel.nextLevelXP) * 100,
                  ) + "%",
              }}
            />
          </div>
        </div>

        {/* Four Core Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
            marginBottom: "1.5rem",
          }}
        >
          {(["int", "wis", "dex", "cha"] as const).map((stat) => {
            const statDef = STATS[stat];
            const progress = engineerStats[stat];
            const progressPct = Math.min(
              100,
              (progress.xp / progress.nextLevelXP) * 100,
            );
            const isWeakest = stat === weakestStat;

            return (
              <div
                key={stat}
                style={{
                  padding: "12px",
                  background: "white",
                  border: isWeakest ? "2px solid #ff6b6b" : "1px solid #ddd",
                  borderRadius: "6px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "8px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: statDef.color,
                        textTransform: "uppercase",
                      }}
                    >
                      {statDef.name}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#222",
                        marginTop: "2px",
                      }}
                    >
                      {statDef.fullName}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: statDef.color,
                    }}
                  >
                    {progress.level}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#666",
                    marginBottom: "6px",
                    lineHeight: "1.3",
                  }}
                >
                  {statDef.description}
                </div>
                <div
                  style={{
                    height: "6px",
                    background: "#eee",
                    borderRadius: "3px",
                    overflow: "hidden",
                    marginBottom: "4px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      background: statDef.color,
                      width: progressPct + "%",
                    }}
                  />
                </div>
                <div
                  style={{ fontSize: "9px", color: "#999", textAlign: "right" }}
                >
                  {progress.xp} / {progress.nextLevelXP} XP
                </div>
                {isWeakest && (
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#ff6b6b",
                      marginTop: "6px",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    ⚠ Weakest stat
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Weekly XP Breakdown */}
        {(wd.activityLogs || []).length > 0 && (
          <div
            style={{
              padding: "1rem",
              background: "#f9f9f9",
              borderRadius: "8px",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                marginBottom: "10px",
              }}
            >
              Weekly XP Breakdown
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "10px",
              }}
            >
              {Object.entries(getWeeklyPointsByActivity())
                .sort((a, b) => b[1] - a[1])
                .map(([label, points]) => {
                  // Find stat for this label
                  let stat: StatType | undefined;
                  for (const s of ["int", "wis", "dex", "cha"] as StatType[]) {
                    const found = ACTIVITY_OPTIONS[s].find(
                      (m: any) => m.label === label,
                    );
                    if (found) {
                      stat = s;
                      break;
                    }
                  }
                  if (!stat) {
                    const found = SPECIAL_ACTIVITIES.find(
                      (m: any) => m.label === label,
                    );
                    stat = found ? "int" : undefined;
                  }
                  const statDef = stat ? STATS[stat] : null;
                  return (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px",
                        background: "white",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                      }}
                    >
                      <div style={{ fontSize: "11px", fontWeight: "500" }}>
                        <div>{label}</div>
                        <div
                          style={{
                            fontSize: "9px",
                            color: "#999",
                            marginTop: "2px",
                          }}
                        >
                          {statDef?.name}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: statDef?.color || "#333",
                        }}
                      >
                        +{points}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Activity Log History */}
        <div
          style={{
            padding: "1rem",
            background: "#f9f9f9",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "600",
              marginBottom: "10px",
            }}
          >
            Activity Log{" "}
            {(wd.activityLogs || []).length > 0 &&
              `(${(wd.activityLogs || []).length})`}
          </div>

          {(wd.activityLogs || []).length === 0 ? (
            <div style={{ fontSize: "11px", color: "#999", padding: "8px 0" }}>
              No activities logged yet for this week
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {[...(wd.activityLogs || [])].reverse().map((log, idx) => {
                const originalIdx = (wd.activityLogs || []).length - 1 - idx;
                // Find mapping and stat
                let mapping:
                  | ((typeof ACTIVITY_OPTIONS)[StatType][number] & {
                      stat?: StatType;
                    })
                  | undefined;
                let stat: StatType | undefined;
                for (const s of ["int", "wis", "dex", "cha"] as StatType[]) {
                  const found = ACTIVITY_OPTIONS[s].find(
                    (m) => m.activity === log.activity,
                  );
                  if (found) {
                    mapping = found;
                    stat = s;
                    break;
                  }
                }
                if (!mapping) {
                  mapping = SPECIAL_ACTIVITIES.find(
                    (m) => m.activity === log.activity,
                  );
                  stat = mapping ? "int" : undefined;
                }
                const statDef = stat ? STATS[stat] : null;
                const logTime = new Date(log.timestamp);
                const timeStr = logTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={originalIdx}
                    style={{
                      padding: "8px",
                      background: "white",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "11px",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "500" }}>
                        {log.label}{" "}
                        <span style={{ color: "#999" }}>×{log.amount}</span>
                      </div>
                      <div
                        style={{
                          fontSize: "9px",
                          color: "#999",
                          marginTop: "2px",
                        }}
                      >
                        {statDef?.name} • +{log.points} pts • {timeStr}
                      {log.note && (
                        <div style={{ color: "#888", marginTop: "2px", fontStyle: "italic" }}>
                          {log.note}
                        </div>
                      )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteActivityLog(originalIdx)}
                      style={{
                        padding: "4px 8px",
                        fontSize: "10px",
                        background: "#ffebee",
                        color: "#c62828",
                        border: "1px solid #ffcdd2",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontWeight: "500",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity Logging Input - Show all activities organized by stat */}
        <div
          style={{
            padding: "1rem",
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "600",
              marginBottom: "12px",
            }}
          >
            Quick Log
          </div>

          {/* Show all activities organized by stat */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            {(["int", "wis", "dex", "cha"] as StatType[]).map((stat) => (
              <div key={stat}>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "600",
                    color: STATS[stat].color,
                    textTransform: "uppercase",
                    marginBottom: "6px",
                    paddingLeft: "2px",
                  }}
                >
                  {STATS[stat].fullName}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    flexWrap: "wrap",
                  }}
                >
                  {ACTIVITY_OPTIONS[stat].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setLoggingActivity(opt.label)}
                      style={{
                        padding: "6px 10px",
                        fontSize: "11px",
                        background:
                          loggingActivity === opt.label
                            ? STATS[stat].color
                            : "#f5f5f5",
                        color:
                          loggingActivity === opt.label ? "white" : "#333",
                        border:
                          loggingActivity === opt.label
                            ? `1px solid ${STATS[stat].color}`
                            : "1px solid #ddd",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "500",
                        whiteSpace: "nowrap",
                        transition: "all 0.15s",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Special activities section */}
            {SPECIAL_ACTIVITIES.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "600",
                    color: "#666",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                    paddingLeft: "2px",
                  }}
                >
                  Wellness
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    flexWrap: "wrap",
                  }}
                >
                  {SPECIAL_ACTIVITIES.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setLoggingActivity(opt.label)}
                      style={{
                        padding: "6px 10px",
                        fontSize: "11px",
                        background:
                          loggingActivity === opt.label
                            ? "#27AE60"
                            : "#f5f5f5",
                        color:
                          loggingActivity === opt.label ? "white" : "#333",
                        border:
                          loggingActivity === opt.label
                            ? "1px solid #27AE60"
                            : "1px solid #ddd",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "500",
                        whiteSpace: "nowrap",
                        transition: "all 0.15s",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <h3 className="sec-title">Reflection</h3>
        <textarea
          className="note-area"
          value={wd.reflection || ""}
          onChange={(e) => updateReflection(e.target.value)}
          placeholder="What went well? What felt hard?"
        />
        <button className="save-btn" onClick={saveReflection}>
          Save
        </button>
        {saved && (
          <span
            style={{ marginLeft: "1rem", fontSize: "12px", color: "#0F6E56" }}
          >
            Saved!
          </span>
        )}
      </div>
    </div>
  );
}
