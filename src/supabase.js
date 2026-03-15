import { createClient } from "@supabase/supabase-js";

const isDev = import.meta.env.DEV;

// Only initialize Supabase in production
export const supabase = !isDev
  ? createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    )
  : null;

export async function syncToSupabase(weekData, kanban, wins) {
  if (!supabase) return; // Skip in dev

  try {
    // TODO: Implement sync logic when Supabase integration is ready
    console.log("Syncing to Supabase...", { weekData, kanban, wins });
  } catch (error) {
    console.error("Sync error:", error);
  }
}

export async function loadFromSupabase() {
  if (!supabase) return null; // Skip in dev

  try {
    // TODO: Implement load logic when Supabase integration is ready
    return null;
  } catch (error) {
    console.error("Load error:", error);
    return null;
  }
}
