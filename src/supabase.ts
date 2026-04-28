import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { WeekData, KanbanTask, Win, Week } from "./config";

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

window.addEventListener("online", () => { isOnline = true; });
window.addEventListener("offline", () => { isOnline = false; });

// Cache the session so repeated calls don't hit the network
let cachedUserId: string | null = null;

async function getUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId;
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  cachedUserId = session?.user.id ?? null;
  return cachedUserId;
}

if (supabase) {
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") cachedUserId = null;
  });
}

// Upsert a single week. The full Week object is stored as a jsonb blob so
// adding new fields to the type never requires a sync-layer change.
export async function syncWeek(weekNum: number, week: Week): Promise<void> {
  if (!supabase || !isOnline) return;
  const userId = await getUserId();
  if (!userId) return;
  const { error } = await supabase.from("weeks").upsert(
    { week_number: weekNum, user_id: userId, data: week },
    { onConflict: "user_id,week_number" },
  );
  if (error) console.error("Sync error (week):", error);
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

export async function syncAllData(
  weekData: WeekData,
  kanban: KanbanTask[],
  wins: Win[],
): Promise<boolean> {
  try {
    await Promise.all([
      ...Object.entries(weekData).map(([key, week]) =>
        syncWeek(parseInt(key.replace("w", "")), week),
      ),
      syncKanban(kanban),
      syncWins(wins),
    ]);
    return true;
  } catch (error) {
    console.error("Sync error:", error);
    return false;
  }
}

export async function deleteKanbanTask(id: string): Promise<void> {
  if (!supabase || !isOnline) return;
  await supabase.from("kanban_tasks").delete().eq("id", id);
}

export async function deleteWin(id: string): Promise<void> {
  if (!supabase || !isOnline) return;
  await supabase.from("wins").delete().eq("id", id);
}

export async function loadFromSupabase(): Promise<{
  weekData: WeekData;
  kanban: KanbanTask[];
  wins: Win[];
} | null> {
  if (!supabase || !isOnline) return null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const userId = session.user.id;

    const [weeksResult, kanbanResult, winsResult] = await Promise.all([
      supabase.from("weeks").select("week_number, data").eq("user_id", userId),
      supabase.from("kanban_tasks").select("*").eq("user_id", userId),
      supabase.from("wins").select("id, content, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);

    if (weeksResult.error) throw weeksResult.error;
    if (kanbanResult.error) throw kanbanResult.error;
    if (winsResult.error) throw winsResult.error;

    const weekData: WeekData = {};
    weeksResult.data?.forEach((row) => {
      weekData[`w${row.week_number}`] = row.data as Week;
    });

    const wins: Win[] = winsResult.data?.map((w) => ({
      id: w.id,
      content: w.content,
      created_at: w.created_at,
    })) ?? [];

    return { weekData, kanban: kanbanResult.data ?? [], wins };
  } catch (error) {
    console.error("Load error:", error);
    return null;
  }
}
