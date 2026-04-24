import { useState, useEffect, useRef } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../supabase";
import {
  syncAllData,
  syncWeeks,
  syncKanban,
  syncWins,
  loadFromSupabase,
  deleteKanbanTask,
  deleteWin,
} from "../supabase";
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

export default function MainApp({
  session: _session,
}: {
  session: Session | null;
}) {
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("leveled_activeTab") || "schedule",
  );
  const [currentWeek, setCurrentWeek] = useState(() => {
    const saved = localStorage.getItem("leveled_currentWeek");
    return saved ? parseInt(saved) : getCurrentWeek();
  });
  const [pWeek] = useState(getCurrentWeek());
  const [weekData, setWeekData] = useState<WeekData>({});
  const [kanban, setKanban] = useState(KANBAN_TASKS);
  const [wins, setWins] = useState<Win[]>(DEFAULT_WINS);
  const [loading, setLoading] = useState(true);
  const isLoadingRef = useRef(true);
  const weeksSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kanbanSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const winsSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipKanbanSyncRef = useRef(false);
  const skipWinsSyncRef = useRef(false);
  const handleOnlineRef = useRef(() => {});

  // Load data on mount
  useEffect(() => {
    loadData();
    const onOnline = () => handleOnlineRef.current();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  // Persist the active tab across page reloads (UI state only, no DB sync needed)
  useEffect(() => {
    localStorage.setItem("leveled_activeTab", activeTab);
  }, [activeTab]);

  // Persist the selected week across page reloads (UI state only, no DB sync needed)
  useEffect(() => {
    localStorage.setItem("leveled_currentWeek", currentWeek.toString());
  }, [currentWeek]);

  // Keep handleOnlineRef current so the event listener (registered once) always
  // calls syncAllData with the latest state, avoiding a stale closure.
  useEffect(() => {
    handleOnlineRef.current = () => syncAllData(weekData, kanban, wins);
  }, [weekData, kanban, wins]);

  // Persist week data to localStorage immediately, then debounce the Supabase sync.
  // Debouncing prevents a burst of network calls when multiple weeks are updated
  // in quick succession (e.g. getOrCreateWeek firing on first render).
  useEffect(() => {
    if (isLoadingRef.current) return;
    localStorage.setItem("leveled_weeks", JSON.stringify(weekData));
    if (weeksSaveTimerRef.current) clearTimeout(weeksSaveTimerRef.current);
    weeksSaveTimerRef.current = setTimeout(() => syncWeeks(weekData), 300);
    return () => { if (weeksSaveTimerRef.current) clearTimeout(weeksSaveTimerRef.current); };
  }, [weekData]);

  // Persist kanban to localStorage immediately, then debounce the Supabase sync.
  // skipKanbanSyncRef is set to true before a delete so the upsert sync is
  // skipped — the delete is already handled by a direct deleteKanbanTask() call.
  useEffect(() => {
    if (isLoadingRef.current) return;
    localStorage.setItem("leveled_kanban", JSON.stringify(kanban));
    if (kanbanSaveTimerRef.current) clearTimeout(kanbanSaveTimerRef.current);
    if (skipKanbanSyncRef.current) {
      skipKanbanSyncRef.current = false;
      return;
    }
    kanbanSaveTimerRef.current = setTimeout(() => syncKanban(kanban), 300);
    return () => { if (kanbanSaveTimerRef.current) clearTimeout(kanbanSaveTimerRef.current); };
  }, [kanban]);

  // Persist wins to localStorage immediately, then debounce the Supabase sync.
  // skipWinsSyncRef is set to true before a delete so the upsert sync is
  // skipped — the delete is already handled by a direct deleteWin() call.
  useEffect(() => {
    if (isLoadingRef.current) return;
    localStorage.setItem("leveled_wins", JSON.stringify(wins));
    if (winsSaveTimerRef.current) clearTimeout(winsSaveTimerRef.current);
    if (skipWinsSyncRef.current) {
      skipWinsSyncRef.current = false;
      return;
    }
    winsSaveTimerRef.current = setTimeout(() => syncWins(wins), 300);
    return () => { if (winsSaveTimerRef.current) clearTimeout(winsSaveTimerRef.current); };
  }, [wins]);

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
        isLoadingRef.current = false;
        setLoading(false);
        return;
      }
    } catch (e) {
      console.error("Failed to load from Supabase:", e);
    }

    try {
      const w = localStorage.getItem("leveled_weeks");
      if (w) setWeekData(JSON.parse(w));
      const k = localStorage.getItem("leveled_kanban");
      const parsedKanban = k ? JSON.parse(k) : null;
      setKanban(
        parsedKanban && parsedKanban.length > 0 ? parsedKanban : KANBAN_TASKS,
      );
      const wn = localStorage.getItem("leveled_wins");
      const parsedWins = wn ? JSON.parse(wn) : null;
      setWins(parsedWins && parsedWins.length > 0 ? parsedWins : DEFAULT_WINS);
    } catch (e) {
      console.error("loadData error:", e);
    }

    isLoadingRef.current = false;
    setLoading(false);
  }

  function handleDeleteKanban(id: string): void {
    skipKanbanSyncRef.current = true;
    setKanban((prev) => prev.filter((t) => t.id !== id));
    deleteKanbanTask(id);
  }

  function handleDeleteWin(id: string): void {
    skipWinsSyncRef.current = true;
    setWins((prev) => prev.filter((w) => w.id !== id));
    deleteWin(id);
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
          <strong>⚠️ Database not configured</strong> — Data is saved locally
          only. To enable cloud sync and multi-device access, configure Supabase
          in your environment variables.
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
        <KanbanTab
          kanban={kanban}
          setKanban={setKanban}
          onDelete={handleDeleteKanban}
        />
      )}
      {activeTab === "progress" && (
        <ProgressTab
          weekData={weekData}
          setWeekData={setWeekData}
          pWeek={pWeek}
          getOrCreateWeek={getOrCreateWeek}
        />
      )}
      {activeTab === "wins" && (
        <WinsTab wins={wins} setWins={setWins} onDelete={handleDeleteWin} />
      )}
    </div>
  );
}
