import { useState } from "react";
import { Win } from "../../config";
import { generateUUID } from "../../utils.ts";

function getWeekStart(dateStr: string): Date {
  const date = new Date(dateStr);
  const day = date.getDay() || 7; // Mon=1..Sun=7
  const monday = new Date(date);
  monday.setDate(date.getDate() - (day - 1));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatWeekLabel(monday: Date): string {
  const end = new Date(monday);
  end.setDate(monday.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startStr = monday.toLocaleDateString("en-US", opts);
  const endStr = end.toLocaleDateString("en-US", { ...opts, year: "numeric" });
  return `${startStr} – ${endStr}`;
}

function isCurrentWeek(monday: Date): boolean {
  const now = new Date();
  const thisMonday = getWeekStart(now.toISOString());
  return monday.toDateString() === thisMonday.toDateString();
}

function todayLocalISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function WinsTab({
  wins,
  setWins,
  onDelete,
}: {
  wins: Win[];
  setWins: (wins: Win[]) => void;
  onDelete: (id: string) => void;
}) {
  const [newWin, setNewWin] = useState("");
  const [winDate, setWinDate] = useState(todayLocalISO);

  const addWin = () => {
    if (!newWin.trim()) return;
    // Use noon local time so timezone shifts don't move it to the wrong day
    const created_at = new Date(`${winDate}T12:00:00`).toISOString();
    setWins([...wins, { id: generateUUID(), content: newWin, created_at }]);
    setNewWin("");
    setWinDate(todayLocalISO());
  };

  const deleteWin = (id: string) => {
    onDelete(id);
  };

  // Group wins by calendar week (Mon start)
  const grouped: Record<string, Win[]> = {};
  for (const win of wins) {
    const dateStr = win.created_at || new Date().toISOString();
    const monday = getWeekStart(dateStr).toISOString().split("T")[0];
    if (!grouped[monday]) grouped[monday] = [];
    grouped[monday].push(win);
  }
  const sortedWeeks = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="panel active" style={{ padding: "1rem" }}>
      {/* Input */}
      <div style={{ marginBottom: "1.5rem" }}>
        <p className="tip" style={{ marginBottom: "0.75rem" }}>
          Log every win. Solved a problem, shipped code — all of it.
        </p>
        <div className="add-win">
          <input
            type="text"
            placeholder="e.g. Solved sliding window without hints"
            value={newWin}
            onChange={(e) => setNewWin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addWin()}
            autoComplete="off"
          />
          <input
            type="date"
            value={winDate}
            onChange={(e) => setWinDate(e.target.value)}
            style={{
              fontSize: "12px",
              padding: "5px 8px",
              border: "1px solid var(--color-border, #ddd)",
              borderRadius: "4px",
              background: "var(--color-bg, white)",
              color: "var(--color-text, #333)",
              cursor: "pointer",
            }}
          />
          <button
            onClick={addWin}
            style={{
              padding: "5px 13px",
              background: "#534AB7",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Summary bar */}
      {wins.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "1.25rem",
            padding: "8px 12px",
            background: "var(--color-bg-secondary, #f5f5f5)",
            borderRadius: "6px",
            fontSize: "12px",
            color: "var(--color-text-secondary, #888)",
          }}
        >
          <span>
            <strong style={{ color: "#534AB7", fontSize: "16px" }}>{wins.length}</strong>{" "}
            total wins
          </span>
          <span>·</span>
          <span>
            <strong style={{ color: "var(--color-text, #333)" }}>{sortedWeeks.length}</strong>{" "}
            {sortedWeeks.length === 1 ? "week" : "weeks"}
          </span>
        </div>
      )}

      {/* Timeline */}
      {wins.length === 0 ? (
        <p style={{ fontSize: "12px", color: "#666" }}>
          No wins yet — add your first one above.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {sortedWeeks.map((mondayKey) => {
            const monday = new Date(mondayKey + "T00:00:00");
            const current = isCurrentWeek(monday);
            const weekWins = grouped[mondayKey];

            return (
              <div key={mondayKey}>
                {/* Week header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "3px",
                      height: "16px",
                      borderRadius: "2px",
                      background: current ? "#534AB7" : "#ccc",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: current
                        ? "#534AB7"
                        : "var(--color-text-secondary, #888)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {formatWeekLabel(monday)}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      background: current ? "#534AB7" : "var(--color-bg-secondary, #eee)",
                      color: current ? "white" : "var(--color-text-secondary, #888)",
                      borderRadius: "10px",
                      padding: "1px 7px",
                      fontWeight: "600",
                    }}
                  >
                    {weekWins.length}
                  </span>
                  {current && (
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#534AB7",
                        fontWeight: "500",
                      }}
                    >
                      this week
                    </span>
                  )}
                </div>

                {/* Wins for this week */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    paddingLeft: "11px",
                  }}
                >
                  {[...weekWins].reverse().map((win) => (
                    <span
                      key={win.id}
                      className="win-chip"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {win.content}
                      <button
                        onClick={() => deleteWin(win.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#999",
                          cursor: "pointer",
                          fontSize: "10px",
                          padding: "0 2px",
                          lineHeight: "1",
                        }}
                        title="Delete win"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
