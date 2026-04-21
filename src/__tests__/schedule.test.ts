import { describe, it, expect } from "vitest";
import { DAYS, WEEK_TEMPLATES } from "../config/schedule";
import { Week, WeekMode } from "../config/types";

// Mirrors the clearWeek logic in ScheduleTab
function buildClearedSlots() {
  return Object.fromEntries(DAYS.map((day) => [day, Array(15).fill("free")]));
}

// Simulates what clearWeek does to a week object
function applyClearWeek(week: Week): Week {
  return { ...week, slots: buildClearedSlots() };
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
});
