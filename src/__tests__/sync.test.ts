import { describe, it, expect } from "vitest";
import { WEEK_TEMPLATES } from "../config/schedule";
import { Week, WeekData, ActivityLog } from "../config/types";

// ---------------------------------------------------------------------------
// Pure helpers mirroring the logic in supabase.ts and MainApp.tsx
// ---------------------------------------------------------------------------

// Mirrors the syncWeek upsert payload shape
function buildSyncPayload(weekNum: number, userId: string, week: Week) {
  return { week_number: weekNum, user_id: userId, data: week };
}

// Mirrors loadFromSupabase row → WeekData transform
function rowToWeek(row: { week_number: number; data: Week }): [string, Week] {
  return [`w${row.week_number}`, row.data];
}

// Mirrors the dirty-key detection in MainApp's setWeekData wrapper
function findDirtyKey(prev: WeekData, next: WeekData): string | null {
  return Object.keys(next).find((k) => next[k] !== prev[k]) ?? null;
}

// Mirrors getOrCreateWeek in MainApp
function getOrCreateWeek(weekData: WeekData, weekNum: number): Week {
  return (
    weekData[`w${weekNum}`] ?? {
      mode: "normal",
      slots: {},
      counts: {},
      reflection: "",
      activityLogs: [],
    }
  );
}

// Mirrors the skip-sync delete pattern used for kanban and wins
function applySkipSyncDelete<T extends { id: string }>(
  items: T[],
  id: string,
): { next: T[]; skipSync: boolean } {
  return { next: items.filter((t) => t.id !== id), skipSync: true };
}

// ---------------------------------------------------------------------------
// Week data round-trip
// ---------------------------------------------------------------------------

describe("Sync: Week data round-trip through jsonb data column", () => {
  const week: Week = {
    mode: "normal",
    slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
    counts: { coding: 3, depth: 1 },
    reflection: "Good week overall.",
    activityLogs: [
      {
        activity: "coding",
        amount: 2,
        label: "LeetCode Medium",
        points: 200,
        timestamp: "2026-04-28T10:00:00Z",
        note: "Dynamic programming",
      },
    ],
    slotNotes: { "Mon-2": "Focus on BFS", "Wed-5": "System design review" },
  };

  it("should preserve all Week fields in the sync payload", () => {
    const payload = buildSyncPayload(5, "user-123", week);
    expect(payload.week_number).toBe(5);
    expect(payload.user_id).toBe("user-123");
    expect(payload.data).toBe(week); // same reference — no transformation
  });

  it("should recover the full Week from a DB row", () => {
    const row = { week_number: 5, data: week };
    const [key, recovered] = rowToWeek(row);
    expect(key).toBe("w5");
    expect(recovered.mode).toBe("normal");
    expect(recovered.reflection).toBe("Good week overall.");
    expect(recovered.slotNotes?.["Mon-2"]).toBe("Focus on BFS");
    expect(recovered.activityLogs?.[0].note).toBe("Dynamic programming");
  });

  it("should not lose fields added after initial schema (regression)", () => {
    const payload = buildSyncPayload(1, "user-123", week);
    const data = payload.data as Week;
    expect(data.slotNotes).toBeDefined();
    expect(data.activityLogs?.[0].note).toBeDefined();
  });

  it("should preserve counts", () => {
    const payload = buildSyncPayload(1, "user-123", week);
    expect((payload.data as Week).counts).toEqual({ coding: 3, depth: 1 });
  });

  it("should handle a week with no optional fields", () => {
    const minimal: Week = {
      mode: "hard",
      slots: {},
      counts: {},
      reflection: "",
      activityLogs: [],
    };
    const payload = buildSyncPayload(0, "user-123", minimal);
    const [, recovered] = rowToWeek({ week_number: 0, data: payload.data as Week });
    expect(recovered.mode).toBe("hard");
    expect(recovered.slotNotes).toBeUndefined();
  });

  it("should produce the correct week key from week_number", () => {
    const cases: [number, string][] = [[0, "w0"], [5, "w5"], [52, "w52"]];
    cases.forEach(([num, expected]) => {
      const [key] = rowToWeek({ week_number: num, data: {} as Week });
      expect(key).toBe(expected);
    });
  });
});

// ---------------------------------------------------------------------------
// Dirty key detection (MainApp setWeekData wrapper)
// ---------------------------------------------------------------------------

describe("Sync: dirty key detection", () => {
  const base: Week = {
    mode: "normal",
    slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
    counts: {},
    reflection: "",
    activityLogs: [],
  };

  it("should detect a newly added week key", () => {
    const prev: WeekData = {};
    const next: WeekData = { w5: base };
    expect(findDirtyKey(prev, next)).toBe("w5");
  });

  it("should detect a mutated week key", () => {
    const prev: WeekData = { w5: base };
    const updated = { ...base, reflection: "Changed" };
    const next: WeekData = { w5: updated };
    expect(findDirtyKey(prev, next)).toBe("w5");
  });

  it("should return null when nothing changed", () => {
    const prev: WeekData = { w5: base };
    const next: WeekData = { w5: base }; // same reference
    expect(findDirtyKey(prev, next)).toBeNull();
  });

  it("should identify the correct key when multiple weeks exist", () => {
    const prev: WeekData = { w3: base, w5: base, w6: base };
    const updated = { ...base, reflection: "Updated" };
    const next: WeekData = { w3: base, w5: updated, w6: base };
    expect(findDirtyKey(prev, next)).toBe("w5");
  });

  it("should detect a change to slotNotes specifically", () => {
    const prev: WeekData = { w2: base };
    const next: WeekData = { w2: { ...base, slotNotes: { "Mon-0": "Focus" } } };
    expect(findDirtyKey(prev, next)).toBe("w2");
  });
});

// ---------------------------------------------------------------------------
// getOrCreateWeek logic
// ---------------------------------------------------------------------------

describe("Sync: getOrCreateWeek", () => {
  it("should return an existing week unchanged", () => {
    const week: Week = {
      mode: "travel",
      slots: {},
      counts: { coding: 1 },
      reflection: "Travelled this week",
      activityLogs: [],
    };
    const weekData: WeekData = { w4: week };
    expect(getOrCreateWeek(weekData, 4)).toBe(week);
  });

  it("should return a default week when the key is missing", () => {
    const result = getOrCreateWeek({}, 7);
    expect(result.mode).toBe("normal");
    expect(result.counts).toEqual({});
    expect(result.reflection).toBe("");
    expect(result.activityLogs).toEqual([]);
  });

  it("should not confuse adjacent week numbers", () => {
    const week5: Week = { mode: "hard", slots: {}, counts: {}, reflection: "w5", activityLogs: [] };
    const weekData: WeekData = { w5: week5 };
    expect(getOrCreateWeek(weekData, 5).reflection).toBe("w5");
    expect(getOrCreateWeek(weekData, 6).reflection).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Skip-sync delete pattern
// ---------------------------------------------------------------------------

describe("Sync: skip-sync flag on delete", () => {
  it("should remove the item and set skipSync true", () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const { next, skipSync } = applySkipSyncDelete(items, "b");
    expect(next).toHaveLength(2);
    expect(next.find((t) => t.id === "b")).toBeUndefined();
    expect(skipSync).toBe(true);
  });

  it("should not affect other items", () => {
    const items = [{ id: "a" }, { id: "b" }];
    const { next } = applySkipSyncDelete(items, "a");
    expect(next[0].id).toBe("b");
  });

  it("should handle deleting a non-existent id gracefully", () => {
    const items = [{ id: "a" }];
    const { next, skipSync } = applySkipSyncDelete(items, "z");
    expect(next).toHaveLength(1);
    expect(skipSync).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Activity log note field (regression — was lost before slotNotes fix)
// ---------------------------------------------------------------------------

describe("Sync: activity log note field round-trip", () => {
  it("should preserve the note field on an activity log", () => {
    const log: ActivityLog = {
      activity: "coding",
      amount: 1,
      label: "LeetCode Hard",
      points: 150,
      timestamp: "2026-04-28T09:00:00Z",
      note: "Struggled with graph traversal",
    };
    const week: Week = { mode: "normal", slots: {}, counts: {}, reflection: "", activityLogs: [log] };
    const payload = buildSyncPayload(3, "user-1", week);
    const [, recovered] = rowToWeek({ week_number: 3, data: payload.data as Week });
    expect(recovered.activityLogs?.[0].note).toBe("Struggled with graph traversal");
  });

  it("should handle logs without a note", () => {
    const log: ActivityLog = {
      activity: "depth",
      amount: 1,
      label: "System Design Read",
      points: 50,
      timestamp: "2026-04-28T09:00:00Z",
    };
    const week: Week = { mode: "normal", slots: {}, counts: {}, reflection: "", activityLogs: [log] };
    const payload = buildSyncPayload(3, "user-1", week);
    const [, recovered] = rowToWeek({ week_number: 3, data: payload.data as Week });
    expect(recovered.activityLogs?.[0].note).toBeUndefined();
  });
});
