import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { WeekData, KanbanTask, Win } from "./config";

// Initialize Supabase only if credentials are provided
export const supabase: SupabaseClient | null =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
    ? createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      )
    : null;

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

// Cache the session so repeated calls don't hit the network
let cachedUserId: string | null = null;

async function getUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId;
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  cachedUserId = session?.user.id ?? null;
  return cachedUserId;
}

// Clear cache on sign out
if (supabase) {
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") cachedUserId = null;
  });
}

export async function syncWeeks(weekData: WeekData): Promise<void> {
  if (!supabase || !isOnline) return;
  const userId = await getUserId();
  if (!userId) return;
  const weeksToSync = Object.entries(weekData).map(([key, data]) => ({
    week_number: parseInt(key.replace("w", "")),
    week_type: data.mode,
    schedule: data.slots,
    counts: data.counts,
    reflection: data.reflection,
    activity_logs: data.activityLogs || [],
    user_id: userId,
  }));
  if (weeksToSync.length === 0) return;
  const { error } = await supabase.from("weeks").upsert(weeksToSync, { onConflict: "user_id,week_number" });
  if (error) console.error("Sync error (weeks):", error);
}

export async function syncKanban(kanban: KanbanTask[]): Promise<void> {
  if (!supabase || !isOnline) return;
  const userId = await getUserId();
  if (!userId) return;
  if (kanban.length === 0) return;
  const { error } = await supabase.from("kanban_tasks").upsert(
    kanban.map((task) => ({ ...task, user_id: userId })),
    { onConflict: "id" },
  );
  if (error) console.error("Sync error (kanban):", error);
}

export async function syncWins(wins: Win[]): Promise<void> {
  if (!supabase || !isOnline) return;
  const userId = await getUserId();
  if (!userId) return;
  if (wins.length === 0) return;
  const { error } = await supabase.from("wins").upsert(
    wins.map((w) => ({ id: w.id, content: w.content, user_id: userId, created_at: w.created_at || new Date().toISOString() })),
    { onConflict: "id" },
  );
  if (error) console.error("Sync error (wins):", error);
}

// Kept for the handleOnline full re-sync
export async function syncAllData(
  weekData: WeekData,
  kanban: KanbanTask[],
  wins: Win[],
): Promise<boolean> {
  try {
    await Promise.all([syncWeeks(weekData), syncKanban(kanban), syncWins(wins)]);
    return true;
  } catch (error) {
    console.error("Sync error:", error);
    return false;
  }
}

// Delete a single kanban task from Supabase
export async function deleteKanbanTask(id: string): Promise<void> {
  if (!supabase || !isOnline) return;
  await supabase.from("kanban_tasks").delete().eq("id", id);
}

// Delete a single win from Supabase
export async function deleteWin(id: string): Promise<void> {
  if (!supabase || !isOnline) return;
  await supabase.from("wins").delete().eq("id", id);
}

// Load all data from Supabase
export async function loadFromSupabase(): Promise<{
  weekData: WeekData;
  kanban: KanbanTask[];
  wins: Win[];
} | null> {
  if (!supabase) return null;
  if (!isOnline) return null;

  try {
    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return null;

    const userId = session.user.id;

    // Load weeks for current user
    const { data: weeksData, error: weeksError } = await supabase
      .from("weeks")
      .select("*")
      .eq("user_id", userId);
    if (weeksError) throw weeksError;

    // Load kanban tasks for current user
    const { data: kanbanData, error: kanbanError } = await supabase
      .from("kanban_tasks")
      .select("*")
      .eq("user_id", userId);
    if (kanbanError) throw kanbanError;

    // Load wins for current user
    const { data: winsData, error: winsError } = await supabase
      .from("wins")
      .select("id, content, created_at")
      .eq("user_id", userId)
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

    const wins: Win[] = winsData
      ? winsData.map((w) => ({ id: w.id, content: w.content, created_at: w.created_at }))
      : [];

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
