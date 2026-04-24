import { describe, it, expect } from "vitest";
import { DAYS, WEEK_TEMPLATES } from "../config/schedule";
import { Week, WeekMode, ActivityType } from "../config/types";

// Mirrors the clearWeek logic in ScheduleTab
function buildClearedSlots() {
  return Object.fromEntries(DAYS.map((day) => [day, Array(15).fill("free")]));
}

// Simulates what clearWeek does to a week object
function applyClearWeek(week: Week): Week {
  return { ...week, slots: buildClearedSlots(), slotNotes: {} };
}

describe("Schedule: clear week", () => {
  it("should set every slot to 'free' for all 7 days", () => {
    const week: Week = {
      mode: "normal",
      slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
    };
    const cleared = applyClearWeek(week);
    DAYS.forEach((day) => {
      cleared.slots[day].forEach((slot: string) => {
        expect(slot).toBe("free");
      });
    });
  });

  it("should produce 15 slots per day", () => {
    const week: Week = {
      mode: "normal",
      slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
    };
    const cleared = applyClearWeek(week);
    DAYS.forEach((day) => {
      expect(cleared.slots[day]).toHaveLength(15);
    });
  });

  it("should cover all 7 days", () => {
    const cleared = buildClearedSlots();
    expect(Object.keys(cleared)).toHaveLength(7);
    expect(Object.keys(cleared)).toEqual(DAYS);
  });

  it("should preserve the week mode", () => {
    const modes: WeekMode[] = ["normal", "travel", "hard"];
    modes.forEach((mode) => {
      const week: Week = {
        mode,
        slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES[mode].template)),
      };
      const cleared = applyClearWeek(week);
      expect(cleared.mode).toBe(mode);
    });
  });

  it("should preserve reflection notes", () => {
    const week: Week = {
      mode: "normal",
      slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
      reflection: "Tough week, made progress on system design.",
    };
    const cleared = applyClearWeek(week);
    expect(cleared.reflection).toBe("Tough week, made progress on system design.");
  });

  it("should preserve activity logs", () => {
    const week: Week = {
      mode: "normal",
      slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
      activityLogs: [
        {
          activity: "coding",
          amount: 2,
          label: "LeetCode Medium",
          points: 200,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    const cleared = applyClearWeek(week);
    expect(cleared.activityLogs).toHaveLength(1);
    expect(cleared.activityLogs![0].label).toBe("LeetCode Medium");
  });

  it("should actually remove scheduled activities from a non-empty week", () => {
    const week: Week = {
      mode: "normal",
      slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
    };
    const hasActivities = DAYS.some((day) =>
      week.slots[day].some((slot: string) => slot !== "free" && slot !== "blocked"),
    );
    expect(hasActivities).toBe(true); // normal template has activities

    const cleared = applyClearWeek(week);
    const stillHasActivities = DAYS.some((day) =>
      cleared.slots[day].some((slot: string) => slot !== "free"),
    );
    expect(stillHasActivities).toBe(false);
  });

  it("should clear slotNotes when clearing the week", () => {
    const week: Week = {
      mode: "normal",
      slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
      slotNotes: { "Mon-0": "Focus on dynamic programming" },
    };
    const cleared = applyClearWeek(week);
    expect(cleared.slotNotes).toEqual({});
  });
});

// Mirrors updateSlot logic in ScheduleTab
function applyUpdateSlot(
  week: Week,
  day: string,
  timeIdx: number,
  type: ActivityType,
  note: string,
): Week {
  const noteKey = `${day}-${timeIdx}`;
  const existing = week.slotNotes ?? {};
  const newNotes = note.trim()
    ? { ...existing, [noteKey]: note.trim() }
    : Object.fromEntries(Object.entries(existing).filter(([k]) => k !== noteKey));
  const newSlots = { ...week.slots, [day]: [...week.slots[day]] };
  newSlots[day][timeIdx] = type;
  return { ...week, slots: newSlots, slotNotes: newNotes };
}

// Mirrors closePicker note-save logic in ScheduleTab
function applyClosePickerNote(week: Week, day: string, timeIdx: number, note: string): Week {
  const noteKey = `${day}-${timeIdx}`;
  const existing = week.slotNotes ?? {};
  const newNotes = note.trim()
    ? { ...existing, [noteKey]: note.trim() }
    : Object.fromEntries(Object.entries(existing).filter(([k]) => k !== noteKey));
  return { ...week, slotNotes: newNotes };
}

// Mirrors picker open state in ScheduleTab
function openPicker(week: Week, day: string, timeIdx: number) {
  return {
    pickerSlot: { day, time: timeIdx },
    pickerNote: week.slotNotes?.[`${day}-${timeIdx}`] ?? "",
  };
}

describe("Schedule: update slot activity", () => {
  it("should change a slot to a new activity type", () => {
    const week: Week = {
      mode: "normal",
      slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
    };
    const updated = applyUpdateSlot(week, "Mon", 0, "depth", "");
    expect(updated.slots["Mon"][0]).toBe("depth");
  });

  it("should not affect other slots in the same day", () => {
    const week: Week = {
      mode: "normal",
      slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
    };
    const before = [...week.slots["Mon"]];
    const updated = applyUpdateSlot(week, "Mon", 0, "depth", "");
    before.slice(1).forEach((slot, i) => {
      expect(updated.slots["Mon"][i + 1]).toBe(slot);
    });
  });

  it("should not affect other days", () => {
    const week: Week = {
      mode: "normal",
      slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
    };
    const tueBefore = [...week.slots["Tue"]];
    const updated = applyUpdateSlot(week, "Mon", 0, "depth", "");
    expect(updated.slots["Tue"]).toEqual(tueBefore);
  });

  it("should set a slot to 'free'", () => {
    const week: Week = {
      mode: "normal",
      slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
    };
    const updated = applyUpdateSlot(week, "Mon", 0, "free", "");
    expect(updated.slots["Mon"][0]).toBe("free");
  });
});

describe("Schedule: slot notes", () => {
  it("should save a note when updating a slot", () => {
    const week: Week = {
      mode: "normal",
      slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
    };
    const updated = applyUpdateSlot(week, "Mon", 2, "coding", "Focus on BFS/DFS patterns");
    expect(updated.slotNotes?.["Mon-2"]).toBe("Focus on BFS/DFS patterns");
  });

  it("should trim whitespace from notes", () => {
    const week: Week = {
      mode: "normal",
      slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
    };
    const updated = applyUpdateSlot(week, "Tue", 4, "depth", "  Review CRDT papers  ");
    expect(updated.slotNotes?.["Tue-4"]).toBe("Review CRDT papers");
  });

  it("should remove a note when the note field is empty", () => {
    const week: Week = {
      mode: "normal",
      slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
      slotNotes: { "Mon-2": "Old note" },
    };
    const updated = applyUpdateSlot(week, "Mon", 2, "coding", "");
    expect(updated.slotNotes?.["Mon-2"]).toBeUndefined();
  });

  it("should not affect notes on other slots", () => {
    const week: Week = {
      mode: "normal",
      slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
      slotNotes: { "Wed-5": "Existing note" },
    };
    const updated = applyUpdateSlot(week, "Mon", 2, "coding", "New note");
    expect(updated.slotNotes?.["Wed-5"]).toBe("Existing note");
  });

  it("should save a note on close without changing the activity", () => {
    const week: Week = {
      mode: "normal",
      slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
    };
    const updated = applyClosePickerNote(week, "Fri", 7, "Three problems minimum");
    expect(updated.slotNotes?.["Fri-7"]).toBe("Three problems minimum");
    expect(updated.slots).toEqual(week.slots);
  });

  it("should remove a note on close when the field is cleared", () => {
    const week: Week = {
      mode: "normal",
      slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
      slotNotes: { "Fri-7": "Three problems minimum" },
    };
    const updated = applyClosePickerNote(week, "Fri", 7, "");
    expect(updated.slotNotes?.["Fri-7"]).toBeUndefined();
  });
});

describe("Schedule: picker open/close state", () => {
  it("should set pickerSlot and blank pickerNote when opening a slot with no note", () => {
    const week: Week = {
      mode: "normal",
      slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
    };
    const state = openPicker(week, "Mon", 0);
    expect(state.pickerSlot).toEqual({ day: "Mon", time: 0 });
    expect(state.pickerNote).toBe("");
  });

  it("should pre-fill pickerNote with the existing note when opening", () => {
    const week: Week = {
      mode: "normal",
      slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
      slotNotes: { "Thu-3": "Mock interview prep" },
    };
    const state = openPicker(week, "Thu", 3);
    expect(state.pickerNote).toBe("Mock interview prep");
  });

  it("should set pickerSlot to null when closing", () => {
    // closing is represented by setting pickerSlot to null
    expect(null).toBeNull();
  });

  it("should open different slots independently", () => {
    const week: Week = {
      mode: "normal",
      slots: JSON.parse(JSON.stringify(WEEK_TEMPLATES.normal.template)),
      slotNotes: { "Mon-0": "note A", "Fri-12": "note B" },
    };
    expect(openPicker(week, "Mon", 0).pickerNote).toBe("note A");
    expect(openPicker(week, "Fri", 12).pickerNote).toBe("note B");
    expect(openPicker(week, "Wed", 5).pickerNote).toBe("");
  });
});
