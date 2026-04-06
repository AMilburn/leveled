import { describe, it, expect, vi, beforeEach } from "vitest";
import { KanbanTask } from "../config/types";

// ---------------------------------------------------------------------------
// Helpers: kanban state operations extracted from KanbanTab
// ---------------------------------------------------------------------------

function addTask(
  kanban: KanbanTask[],
  title: string,
  tag: string,
  id: string,
): KanbanTask[] {
  if (!title.trim()) return kanban;
  return [...kanban, { id, col: 0, title, tag, note: "" }];
}

function moveTask(
  kanban: KanbanTask[],
  id: string,
  direction: number,
): KanbanTask[] {
  return kanban.map((t) =>
    t.id === id
      ? { ...t, col: Math.max(0, Math.min(3, t.col + direction)) }
      : t,
  );
}

function saveEdit(
  kanban: KanbanTask[],
  id: string,
  title: string,
  note: string,
): KanbanTask[] {
  return kanban.map((t) => (t.id === id ? { ...t, title, note } : t));
}

function deleteTask(kanban: KanbanTask[], id: string): KanbanTask[] {
  return kanban.filter((t) => t.id !== id);
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const TASK_A: KanbanTask = {
  id: "aaa",
  col: 0,
  title: "Write tests",
  tag: "coding",
  note: "",
};

const TASK_B: KanbanTask = {
  id: "bbb",
  col: 1,
  title: "Ship feature",
  tag: "project",
  note: "Needs review",
};

// ---------------------------------------------------------------------------
// Tests: localStorage-only (pure state logic)
// ---------------------------------------------------------------------------

describe("Kanban — localStorage mode (pure state logic)", () => {
  describe("addTask", () => {
    it("adds a task to an empty board in col 0", () => {
      const result = addTask([], "New task", "coding", "id-1");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "id-1",
        col: 0,
        title: "New task",
        tag: "coding",
        note: "",
      });
    });

    it("appends to existing tasks without mutating them", () => {
      const original = [TASK_A];
      const result = addTask(original, "Another task", "project", "id-2");
      expect(result).toHaveLength(2);
      expect(original).toHaveLength(1); // original unchanged
    });

    it("ignores empty or whitespace-only titles", () => {
      expect(addTask([TASK_A], "", "coding", "id-x")).toHaveLength(1);
      expect(addTask([TASK_A], "   ", "coding", "id-x")).toHaveLength(1);
    });
  });

  describe("moveTask", () => {
    it("moves a task forward one column", () => {
      const result = moveTask([TASK_A], "aaa", 1);
      expect(result[0].col).toBe(1);
    });

    it("moves a task backward one column", () => {
      const result = moveTask([TASK_B], "bbb", -1);
      expect(result[0].col).toBe(0);
    });

    it("clamps at col 0 (cannot go below backlog)", () => {
      const result = moveTask([TASK_A], "aaa", -1); // already at 0
      expect(result[0].col).toBe(0);
    });

    it("clamps at col 3 (cannot go past done)", () => {
      const atDone: KanbanTask = { ...TASK_A, col: 3 };
      const result = moveTask([atDone], "aaa", 1);
      expect(result[0].col).toBe(3);
    });

    it("only moves the targeted task, leaving others untouched", () => {
      const result = moveTask([TASK_A, TASK_B], "aaa", 1);
      expect(result.find((t) => t.id === "aaa")!.col).toBe(1);
      expect(result.find((t) => t.id === "bbb")!.col).toBe(1); // TASK_B unchanged
    });

    it("can move through all four columns sequentially", () => {
      let board = [TASK_A]; // starts at col 0
      board = moveTask(board, "aaa", 1); // → 1
      board = moveTask(board, "aaa", 1); // → 2
      board = moveTask(board, "aaa", 1); // → 3
      expect(board[0].col).toBe(3);
      board = moveTask(board, "aaa", -1); // → 2
      expect(board[0].col).toBe(2);
    });
  });

  describe("saveEdit", () => {
    it("updates title and note for the matching task", () => {
      const result = saveEdit([TASK_A], "aaa", "Updated title", "Some note");
      expect(result[0].title).toBe("Updated title");
      expect(result[0].note).toBe("Some note");
    });

    it("does not modify other tasks", () => {
      const result = saveEdit([TASK_A, TASK_B], "aaa", "Changed", "note");
      expect(result.find((t) => t.id === "bbb")!.title).toBe(TASK_B.title);
    });

    it("clears a note when saved with empty string", () => {
      const result = saveEdit([TASK_B], "bbb", TASK_B.title, "");
      expect(result[0].note).toBe("");
    });

    it("does not mutate the original array", () => {
      const original = [TASK_A];
      saveEdit(original, "aaa", "New", "note");
      expect(original[0].title).toBe("Write tests");
    });
  });

  describe("deleteTask", () => {
    it("removes the task with the given id", () => {
      const result = deleteTask([TASK_A, TASK_B], "aaa");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("bbb");
    });

    it("returns an empty array when the only task is deleted", () => {
      expect(deleteTask([TASK_A], "aaa")).toHaveLength(0);
    });

    it("is a no-op for a non-existent id", () => {
      const result = deleteTask([TASK_A, TASK_B], "does-not-exist");
      expect(result).toHaveLength(2);
    });

    it("does not mutate the original array", () => {
      const original = [TASK_A, TASK_B];
      deleteTask(original, "aaa");
      expect(original).toHaveLength(2);
    });
  });
});

// ---------------------------------------------------------------------------
// Tests: Supabase sync
// Mock @supabase/supabase-js so the real syncAllData logic runs against
// a controlled client — no network calls, no real credentials needed.
// ---------------------------------------------------------------------------

// Build a chainable query builder mock
function makeQueryBuilder(resolvedValue: unknown) {
  const builder: Record<string, unknown> = {};
  builder.select = vi.fn().mockReturnValue(builder);
  builder.eq = vi.fn().mockReturnValue(builder);
  builder.order = vi.fn().mockReturnValue(builder);
  builder.upsert = vi.fn().mockResolvedValue({ error: null });
  builder.delete = vi.fn().mockReturnValue(builder);
  builder.in = vi.fn().mockResolvedValue({ error: null });
  // Default resolution for awaiting the builder directly (select...eq)
  builder.then = (resolve: (v: unknown) => void) =>
    Promise.resolve(resolvedValue).then(resolve);
  return builder;
}

// Shared mocks — reassigned per test in beforeEach
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockFrom: (...args: any[]) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockGetSession: (...args: any[]) => any;

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    get auth() {
      return {
        getSession: mockGetSession,
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      };
    },
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

describe("Kanban — Supabase sync", () => {
  beforeEach(async () => {
    vi.resetModules();

    mockGetSession = vi.fn().mockResolvedValue({
      data: { session: { user: { id: "user-123" } } },
    });

    // Default: DB returns no existing rows (nothing to delete)
    mockFrom = vi
      .fn()
      .mockReturnValue(makeQueryBuilder({ data: [], error: null }));
  });

  it("upserts kanban tasks to Supabase on sync", async () => {
    const upsertMock = vi.fn().mockResolvedValue({ error: null });
    mockFrom = vi.fn().mockReturnValue({
      ...makeQueryBuilder({ data: [], error: null }),
      upsert: upsertMock,
    });

    const { syncKanban } = await import("../supabase");
    await syncKanban([TASK_A, TASK_B]);

    expect(upsertMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "aaa", user_id: "user-123" }),
        expect.objectContaining({ id: "bbb", user_id: "user-123" }),
      ]),
      { onConflict: "id" },
    );
  });

  it("skips sync when there is no active session", async () => {
    mockGetSession = vi.fn().mockResolvedValue({ data: { session: null } });

    const { syncKanban } = await import("../supabase");
    await syncKanban([TASK_A]);

    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("persists col value when syncing a moved task", async () => {
    const upsertMock = vi.fn().mockResolvedValue({ error: null });
    mockFrom = vi.fn().mockReturnValue({
      ...makeQueryBuilder({ data: [], error: null }),
      upsert: upsertMock,
    });

    const { syncKanban } = await import("../supabase");
    const movedTask: KanbanTask = { ...TASK_A, col: 3 };
    await syncKanban([movedTask]);

    expect(upsertMock).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: "aaa", col: 3 })]),
      { onConflict: "id" },
    );
  });

  it("persists edited title and note when syncing", async () => {
    const upsertMock = vi.fn().mockResolvedValue({ error: null });
    mockFrom = vi.fn().mockReturnValue({
      ...makeQueryBuilder({ data: [], error: null }),
      upsert: upsertMock,
    });

    const { syncKanban } = await import("../supabase");
    const edited: KanbanTask = {
      ...TASK_A,
      title: "Edited title",
      note: "Edited note",
    };
    await syncKanban([edited]);

    expect(upsertMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ title: "Edited title", note: "Edited note" }),
      ]),
      { onConflict: "id" },
    );
  });
});
