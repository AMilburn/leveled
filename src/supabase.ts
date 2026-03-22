import { createClient } from "@supabase/supabase-js";
import { WeekData, KanbanTask, Win } from "./config";

// Initialize Supabase
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

export let isOnline = true;

// Track online/offline status
window.addEventListener("online", () => {
  isOnline = true;
  console.log("Back online - syncing...");
});
window.addEventListener("offline", () => {
  isOnline = false;
  console.log("Offline - using localStorage");
});

// Sync all data to Supabase
export async function syncAllData(weekData: WeekData, kanban: KanbanTask[], wins: Win[]): Promise<boolean> {
  if (!supabase) return false;
  if (!isOnline) return false;

  try {
    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return false;

    const userId = session.user.id;

    // Upsert weeks (one row per week)
    const weeksToSync = Object.entries(weekData).map(([key, data]) => {
      const weekNum = parseInt(key.replace("w", ""));
      return {
        week_number: weekNum,
        week_type: data.mode,
        schedule: data.slots,
        counts: data.counts,
        reflection: data.reflection,
        activity_logs: data.activityLogs || [],
        user_id: userId,
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
      const kanbanToSync = kanban.map((task) => ({
        ...task,
        user_id: userId,
      }));
      const { error: kanbanError } = await supabase
        .from("kanban_tasks")
        .upsert(kanbanToSync, { onConflict: "id" });
      if (kanbanError) throw kanbanError;
    }

    // Upsert wins
    if (wins.length > 0) {
      const winsToSync = wins.map((w) => ({
        id: w.id,
        content: w.content,
        user_id: userId,
        created_at: new Date().toISOString(),
      }));
      const { error: winsError } = await supabase
        .from("wins")
        .upsert(winsToSync, { onConflict: "id" });
      if (winsError) throw winsError;
    }

    return true;
  } catch (error) {
    console.error("Sync error:", error);
    return false;
  }
}

// Load all data from Supabase
export async function loadFromSupabase(): Promise<{ weekData: WeekData; kanban: KanbanTask[]; wins: Win[] } | null> {
  if (!supabase) return null;
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
      .select("id, content")
      .order("created_at", { ascending: false });
    if (winsError) throw winsError;

    // Transform back to app format
    const weekData: WeekData = {};
    if (weeksData) {
      weeksData.forEach((week) => {
        weekData[`w${week.week_number}`] = {
          slots: week.schedule,
          mode: week.week_type,
          counts: week.counts || {},
          reflection: week.reflection || "",
          activityLogs: week.activity_logs || [],
        };
      });
    }

    const wins: Win[] = winsData ? winsData.map((w) => ({ id: w.id, content: w.content })) : [];

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

