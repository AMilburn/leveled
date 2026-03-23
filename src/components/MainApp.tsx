import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../supabase";
import { syncAllData, loadFromSupabase } from "../supabase";
import {
  WEEK_TEMPLATES,
  KANBAN_TASKS,
  DEFAULT_WINS,
  WeekData,
  Win,
  Week,
} from "../config";
import ScheduleTab from "./tabs/ScheduleTab";
import KanbanTab from "./tabs/KanbanTab";
import ProgressTab from "./tabs/ProgressTab";
import WinsTab from "./tabs/WinsTab";

function getCurrentWeek(): number {
  const baseDate = new Date(2026, 2, 15);
  const today = new Date();

  const baseMon = new Date(baseDate);
  const baseDay = baseDate.getDay() || 7;
  baseMon.setDate(baseDate.getDate() - (baseDay - 1));

  const todayMon = new Date(today);
  const todayDay = today.getDay() || 7;
  todayMon.setDate(today.getDate() - (todayDay - 1));

  const timeDiff = todayMon.getTime() - baseMon.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  return Math.floor(daysDiff / 7);
}

export default function MainApp({ session: _session }: { session: Session | null }) {
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("jsd2_activeTab") || "schedule",
  );
  const [currentWeek, setCurrentWeek] = useState(() => {
    const saved = localStorage.getItem("jsd2_currentWeek");
    return saved ? parseInt(saved) : getCurrentWeek();
  });
  const [pWeek] = useState(getCurrentWeek());
  const [weekData, setWeekData] = useState<WeekData>({});
  const [kanban, setKanban] = useState(KANBAN_TASKS);
  const [wins, setWins] = useState<Win[]>(DEFAULT_WINS);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem("jsd2_activeTab", activeTab);
  }, [activeTab]);

  // Save current week to localStorage
  useEffect(() => {
    localStorage.setItem("jsd2_currentWeek", currentWeek.toString());
  }, [currentWeek]);

  // Auto-save when data changes
  useEffect(() => {
    if (!loading) {
      saveData();
    }
  }, [weekData, kanban, wins, loading]);

  async function loadData(): Promise<void> {
    try {
      const supabaseData = await loadFromSupabase();
      if (supabaseData && Object.keys(supabaseData.weekData).length > 0) {
        setWeekData(supabaseData.weekData);
        setKanban(
          supabaseData.kanban && supabaseData.kanban.length > 0
            ? supabaseData.kanban
            : KANBAN_TASKS,
        );
        setWins(
          supabaseData.wins && supabaseData.wins.length > 0
            ? supabaseData.wins
            : DEFAULT_WINS,
        );
        setLoading(false);
        return;
      }
    } catch (e) {
      console.error("Failed to load from Supabase:", e);
    }

    try {
      const w = localStorage.getItem("jsd2_weeks");
      if (w) setWeekData(JSON.parse(w));
      const k = localStorage.getItem("jsd2_kanban");
      const parsedKanban = k ? JSON.parse(k) : null;
      setKanban(
        parsedKanban && parsedKanban.length > 0 ? parsedKanban : KANBAN_TASKS,
      );
      const wn = localStorage.getItem("jsd2_wins");
      const parsedWins = wn ? JSON.parse(wn) : null;
      setWins(parsedWins && parsedWins.length > 0 ? parsedWins : DEFAULT_WINS);
    } catch (e) {
      console.error("loadData error:", e);
    }

    setLoading(false);
  }

  async function saveData(): Promise<void> {
    try {
      localStorage.setItem("jsd2_weeks", JSON.stringify(weekData));
      localStorage.setItem("jsd2_kanban", JSON.stringify(kanban));
      localStorage.setItem("jsd2_wins", JSON.stringify(wins));
      await syncAllData(weekData, kanban, wins);
    } catch (e) {}
  }

  function handleOnline(): void {
    syncAllData(weekData, kanban, wins);
  }

  function getOrCreateWeek(weekNum: number): Week {
    if (!weekData[`w${weekNum}`]) {
      setWeekData((prev) => ({
        ...prev,
        [`w${weekNum}`]: {
          slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
          mode: "normal",
          counts: {},
          reflection: "",
          activityLogs: [],
        },
      }));
    }
    return (
      weekData[`w${weekNum}`] || {
        mode: "normal",
        slots: {},
        counts: {},
        reflection: "",
        activityLogs: [],
      }
    );
  }

  async function handleLogout(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut();
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
    );
  }

  const tabButtons = [
    { id: "schedule", label: "Schedule" },
    { id: "kanban", label: "Kanban" },
    { id: "progress", label: "Stats" },
    { id: "wins", label: "Wins" },
  ];

  return (
    <div className="app">
      {!supabase && (
        <div
          style={{
            backgroundColor: "#fef3c7",
            border: "1px solid #fbbf24",
            borderRadius: "6px",
            padding: "12px 16px",
            marginBottom: "1.5rem",
            fontSize: "14px",
            color: "#92400e",
          }}
        >
          <strong>⚠️ Database not configured</strong> — Data is saved locally only. To enable cloud sync and multi-device access, configure Supabase in your environment variables.
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "1rem",
          borderBottom: "1px solid var(--color-border)",
          marginBottom: "1.5rem",
          gap: "2rem",
        }}
      >
        {/* Left: App Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: "fit-content",
          }}
        >
          <div style={{ fontSize: "24px" }} className="nav-emoji">
            📈
          </div>
          <h1
            style={{
              fontSize: "18px",
              fontWeight: "700",
              margin: "0",
              color: "var(--color-text)",
            }}
            className="nav-title"
          >
            Leveled
          </h1>
        </div>

        {/* Center: Tabs */}
        <div className="tabs" style={{ flex: 1, justifyContent: "center" }}>
          {tabButtons.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Logout (only show if Supabase is configured) */}
        {supabase && (
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-secondary)",
              fontWeight: "500",
              minWidth: "fit-content",
            }}
          >
            Log out
          </button>
        )}
      </div>

      {activeTab === "schedule" && (
        <ScheduleTab
          setWeekData={setWeekData}
          currentWeek={currentWeek}
          setCurrentWeek={setCurrentWeek}
          getOrCreateWeek={getOrCreateWeek}
        />
      )}
      {activeTab === "kanban" && (
        <KanbanTab kanban={kanban} setKanban={setKanban} />
      )}
      {activeTab === "progress" && (
        <ProgressTab
          weekData={weekData}
          setWeekData={setWeekData}
          pWeek={pWeek}
          getOrCreateWeek={getOrCreateWeek}
        />
      )}
      {activeTab === "wins" && <WinsTab wins={wins} setWins={setWins} />}
    </div>
  );
}
