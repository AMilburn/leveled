import { createClient } from "@supabase/supabase-js";

const isDev = import.meta.env.DEV;

// Only initialize Supabase in production
export const supabase = !isDev
  ? createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    )
  : null;

export let isOnline = true;

// Track online/offline status
if (!isDev) {
  window.addEventListener("online", () => {
    isOnline = true;
    console.log("Back online - syncing...");
    // widgets.js will handle syncing when it detects online status
  });
  window.addEventListener("offline", () => {
    isOnline = false;
    console.log("Offline - using localStorage");
  });
}

// Sync all data to Supabase
export async function syncAllData(weekData, kanban, wins) {
  if (!supabase || isDev) return false; // Skip in dev
  if (!isOnline) return false;

  try {
    // Upsert weeks (one row per week)
    const weeksToSync = Object.entries(weekData).map(([key, data]) => {
      const weekNum = parseInt(key.replace("w", ""));
      return {
        week_number: weekNum,
        week_type: data.mode,
        schedule: data.slots,
        counts: data.counts,
        reflection: data.reflection,
      };
    });

    if (weeksToSync.length > 0) {
      const { error: weeksError } = await supabase
        .from("weeks")
        .upsert(weeksToSync, { onConflict: "week_number" });
      if (weeksError) throw weeksError;
    }

    // Upsert kanban tasks
    if (kanban.length > 0) {
      const { error: kanbanError } = await supabase
        .from("kanban_tasks")
        .upsert(kanban, { onConflict: "id" });
      if (kanbanError) throw kanbanError;
    }

    // Upsert wins
    if (wins.length > 0) {
      const winsToSync = wins.map((w) => ({
        content: w,
        created_at: new Date().toISOString(),
      }));
      const { error: winsError } = await supabase
        .from("wins")
        .insert(winsToSync);
      if (winsError) throw winsError;
    }

    return true;
  } catch (error) {
    console.error("Sync error:", error);
    return false;
  }
}

// Load all data from Supabase
export async function loadFromSupabase() {
  if (!supabase || isDev) return null; // Skip in dev
  if (!isOnline) return null;

  try {
    // Load weeks
    const { data: weeksData, error: weeksError } = await supabase
      .from("weeks")
      .select("*");
    if (weeksError) throw weeksError;

    // Load kanban tasks
    const { data: kanbanData, error: kanbanError } = await supabase
      .from("kanban_tasks")
      .select("*");
    if (kanbanError) throw kanbanError;

    // Load wins
    const { data: winsData, error: winsError } = await supabase
      .from("wins")
      .select("content")
      .order("created_at", { ascending: false });
    if (winsError) throw winsError;

    // Transform back to app format
    const weekData = {};
    if (weeksData) {
      weeksData.forEach((week) => {
        weekData[`w${week.week_number}`] = {
          slots: week.schedule,
          mode: week.week_type,
          counts: week.counts || {},
          reflection: week.reflection || "",
        };
      });
    }

    const wins = winsData ? winsData.map((w) => w.content) : [];

    return {
      weekData,
      kanban: kanbanData || [],
      wins,
    };
  } catch (error) {
    console.error("Load error:", error);
    return null;
  }
}
