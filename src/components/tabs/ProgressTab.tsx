import { useState } from "react";
import {
  WEEKLY_GOALS,
  CUMULATIVE_GOAL_WEEKS,
  Week,
  WeekData,
  ActivityLog,
} from "../../config";
import {
  STATS,
  ACTIVITY_XP_MAP,
  StatType,
  PlayerStats,
  calculateLevel,
  calculateOverallLevel,
  getMostNeedfulStat,
} from "../../config";

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

export default function ProgressTab({
  weekData,
  setWeekData,
  pWeek,
  setPWeek,
  getOrCreateWeek,
}: {
  weekData: WeekData;
  setWeekData: (updater: (prev: WeekData) => WeekData) => void;
  pWeek: number;
  setPWeek: (week: number) => void;
  getOrCreateWeek: (week: number) => Week;
}) {
  const [saved, setSaved] = useState(false);
  const [loggingActivity, setLoggingActivity] = useState<string | null>(null);
  const [loggingAmount, setLoggingAmount] = useState("1");
  const wd = getOrCreateWeek(pWeek);
  const goals = WEEKLY_GOALS[wd.mode] || WEEKLY_GOALS.normal;

  // Calculate player stats from activity logs
  const calculatePlayerStats = (): PlayerStats => {
    const stats: PlayerStats = {
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

    // Accumulate XP by stat
    const xpByStats: Record<StatType, number> = {
      int: 0,
      wis: 0,
      dex: 0,
      cha: 0,
    };

    allLogs.forEach((log) => {
      const mapping = ACTIVITY_XP_MAP.find((m) => m.activity === log.activity);
      if (mapping) {
        xpByStats[mapping.stat] += log.xpEarned;
      }
    });

    // Calculate levels for each stat
    Object.entries(xpByStats).forEach(([stat, totalXP]) => {
      stats[stat as StatType] = calculateLevel(totalXP);
    });

    return stats;
  };

  const playerStats = calculatePlayerStats();
  const overallLevel = calculateOverallLevel(playerStats);
  const weakestStat = getMostNeedfulStat(playerStats);

  const updateCount = (key: string, delta: number) => {
    setWeekData((prev) => {
      const weekKey = `w${pWeek}`;
      const updatedWeek: Week = {
        ...wd,
        counts: {
          ...(wd.counts || {}),
          [key]: Math.max(0, (wd.counts?.[key] || 0) + delta),
        },
      };
      return { ...prev, [weekKey]: updatedWeek };
    });
  };

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

  const logActivity = (activity: string, amount: number) => {
    const mapping = ACTIVITY_XP_MAP.find((m) => m.activity === activity);
    if (!mapping) return;

    const xpEarned = mapping.baseXP * amount;
    const newLog: ActivityLog = {
      activity: activity as any,
      amount,
      xpEarned,
      timestamp: new Date().toISOString(),
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
  };

  const totalCounts: Record<string, number> = {};
  goals.forEach((d) => (totalCounts[d.key] = 0));
  Object.values(weekData).forEach((w) =>
    goals.forEach((d) => (totalCounts[d.key] += w.counts?.[d.key] || 0)),
  );

  return (
    <div className="panel active" style={{ padding: "1rem" }}>
      <div className="week-nav">
        <button onClick={() => setPWeek(pWeek - 1)}>← prev</button>
        <span className="week-label">{weekLabel(pWeek)}</span>
        <button onClick={() => setPWeek(pWeek + 1)}>next →</button>
      </div>

      {/* Stats Dashboard */}
      <div style={{ marginBottom: "2rem", padding: "1rem", background: "#f9f9f9", borderRadius: "8px" }}>
        <h3 className="sec-title">Senior Engineer Profile</h3>

        {/* Overall Level */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: "600", fontSize: "14px" }}>Overall Level</span>
            <span style={{ fontSize: "18px", fontWeight: "700", color: "#534AB7" }}>Level {overallLevel.level}</span>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ flex: 1, height: "12px", background: "#eee", borderRadius: "6px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  background: "#534AB7",
                  width: Math.min(100, (overallLevel.xp / overallLevel.nextLevelXP) * 100) + "%",
                }}
              />
            </div>
            <span style={{ fontSize: "11px", minWidth: "50px", textAlign: "right" }}>
              {overallLevel.xp} / {overallLevel.nextLevelXP}
            </span>
          </div>
        </div>

        {/* Four Core Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "1.5rem" }}>
          {(["int", "wis", "dex", "cha"] as const).map((stat) => {
            const statDef = STATS[stat];
            const progress = playerStats[stat];
            const progressPct = Math.min(100, (progress.xp / progress.nextLevelXP) * 100);
            const isWeakest = stat === weakestStat;

            return (
              <div
                key={stat}
                style={{
                  padding: "10px",
                  background: "white",
                  border: isWeakest ? "2px solid #ff6b6b" : "1px solid #ddd",
                  borderRadius: "6px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: statDef.color }}>
                      {statDef.name}
                    </div>
                    <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>
                      {statDef.description}
                    </div>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: statDef.color }}>
                    {progress.level}
                  </div>
                </div>
                <div style={{ height: "6px", background: "#eee", borderRadius: "3px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      background: statDef.color,
                      width: progressPct + "%",
                    }}
                  />
                </div>
                <div style={{ fontSize: "9px", color: "#999", marginTop: "4px", textAlign: "right" }}>
                  {progress.xp} / {progress.nextLevelXP}
                </div>
                {isWeakest && (
                  <div style={{ fontSize: "9px", color: "#ff6b6b", marginTop: "4px", fontWeight: "600" }}>
                    ⚠ Needs growth
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Activity Logging */}
        <div style={{ borderTop: "1px solid #ddd", paddingTop: "1rem" }}>
          <h4 style={{ fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>Log Activity</h4>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {ACTIVITY_XP_MAP.map((mapping) => (
              <button
                key={mapping.activity}
                onClick={() => setLoggingActivity(mapping.activity)}
                style={{
                  padding: "6px 10px",
                  fontSize: "11px",
                  background: loggingActivity === mapping.activity ? "#534AB7" : "#e8e8e8",
                  color: loggingActivity === mapping.activity ? "white" : "#333",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                }}
              >
                {mapping.activity}
              </button>
            ))}
          </div>
          {loggingActivity && (
            <div style={{ display: "flex", gap: "8px", marginTop: "10px", alignItems: "center" }}>
              <input
                type="number"
                min="1"
                value={loggingAmount}
                onChange={(e) => setLoggingAmount(e.target.value)}
                style={{
                  width: "60px",
                  padding: "6px",
                  fontSize: "11px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
              <span style={{ fontSize: "11px", color: "#666" }}>
                {ACTIVITY_XP_MAP.find((m) => m.activity === loggingActivity)?.unit}
              </span>
              <button
                onClick={() => logActivity(loggingActivity, parseInt(loggingAmount) || 1)}
                style={{
                  padding: "6px 12px",
                  fontSize: "11px",
                  background: "#534AB7",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Log {loggingAmount} {ACTIVITY_XP_MAP.find((m) => m.activity === loggingActivity)?.unit}
              </button>
              <button
                onClick={() => setLoggingActivity(null)}
                style={{
                  padding: "6px 12px",
                  fontSize: "11px",
                  background: "#f0f0f0",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <h3 className="sec-title">Weekly counts</h3>
        {goals.map((def) => {
          const val = wd.counts?.[def.key] || 0;
          const progress = Math.min(100, (val / def.goal) * 100);
          return (
            <div
              key={def.key}
              className="prog-row"
              style={{ marginBottom: "12px", flexWrap: "wrap" }}
            >
              <span className="prog-label">{def.label}</span>
              <div className="prog-bar-bg" style={{ flex: 1 }}>
                <div
                  className="prog-bar"
                  style={{ width: progress + "%", background: def.color }}
                ></div>
              </div>
              <span className="cnt-val">
                {val} / {def.goal}
              </span>
              <button
                className="cnt-btn"
                onClick={() => updateCount(def.key, -1)}
              >
                −
              </button>
              <button
                className="cnt-btn"
                onClick={() => updateCount(def.key, 1)}
              >
                +
              </button>
            </div>
          );
        })}
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

      <div>
        <h3 className="sec-title">Cumulative totals</h3>
        {goals.map((def) => {
          const total = totalCounts[def.key];
          const cumulativeGoal = def.goal * CUMULATIVE_GOAL_WEEKS;
          const progress = Math.min(100, (total / cumulativeGoal) * 100);
          return (
            <div key={def.key} className="prog-row">
              <span className="prog-label">{def.label}</span>
              <div className="prog-bar-bg" style={{ flex: 1 }}>
                <div
                  className="prog-bar"
                  style={{ width: progress + "%", background: def.color }}
                ></div>
              </div>
              <span className="cnt-val">{total}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
