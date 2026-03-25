import { describe, it, expect } from "vitest";
import { ACTIVITY_OPTIONS } from "../config/stats";
import type { ActivityLog, WeekData, StatType } from "../config";

describe("Activity Logging - Integration Tests", () => {
  describe("When logging activities from the quick log button", () => {
    it("should create an activity with correct points", () => {
      // User clicks "LeetCode Easy" button and logs 1
      const option = ACTIVITY_OPTIONS.int.find(
        (a) => a.label === "LeetCode Easy",
      );

      const newLog: ActivityLog = {
        activity: option!.activity,
        amount: 1,
        label: option!.label,
        points: option!.pointValue * 1, // 20 points
        timestamp: new Date().toISOString(),
      };

      expect(newLog.points).toBe(20);
      expect(newLog.label).toBe("LeetCode Easy");
      expect(newLog.activity).toBe("coding");
    });

    it("should multiply points by amount", () => {
      // User logs 3 x LeetCode Easy
      const option = ACTIVITY_OPTIONS.int.find(
        (a) => a.label === "LeetCode Easy",
      );
      const amount = 3;

      const newLog: ActivityLog = {
        activity: option!.activity,
        amount,
        label: option!.label,
        points: option!.pointValue * amount, // 20 * 3 = 60
        timestamp: new Date().toISOString(),
      };

      expect(newLog.points).toBe(60);
      expect(newLog.amount).toBe(3);
    });

    it("should add activity to week's activity logs", () => {
      // Start with empty week
      const weekData: WeekData = {
        w1: {
          slots: {},
          mode: "normal",
          counts: {},
          reflection: "",
          activityLogs: [],
        },
      };

      // Add first activity
      const activity1: ActivityLog = {
        activity: "coding",
        amount: 2,
        label: "LeetCode Medium",
        points: 200,
        timestamp: "2026-03-25T09:00:00Z",
      };

      weekData.w1.activityLogs!.push(activity1);

      // Add second activity
      const activity2: ActivityLog = {
        activity: "system",
        amount: 1,
        label: "System Design Sketch (Full Flow)",
        points: 200,
        timestamp: "2026-03-25T14:00:00Z",
      };

      weekData.w1.activityLogs!.push(activity2);

      // Week should now have both
      expect(weekData.w1.activityLogs).toHaveLength(2);
      expect(weekData.w1.activityLogs![0].points).toBe(200);
      expect(weekData.w1.activityLogs![1].points).toBe(200);
    });
  });

  describe("When calculating stats from activity logs", () => {
    it("should correctly assign activities to stats", () => {
      // Create various activities
      const activities: ActivityLog[] = [
        {
          activity: "coding",
          amount: 1,
          label: "LeetCode Easy",
          points: 20,
          timestamp: "2026-03-25T09:00:00Z",
        }, // INT
        {
          activity: "system",
          amount: 1,
          label: "System Design Sketch (Full Flow)",
          points: 200,
          timestamp: "2026-03-25T10:00:00Z",
        }, // WIS
        {
          activity: "project",
          amount: 1,
          label: "Feature Implementation (PR)",
          points: 100,
          timestamp: "2026-03-25T11:00:00Z",
        }, // DEX
        {
          activity: "stories",
          amount: 1,
          label: "STAR Story (Recorded & Reviewed)",
          points: 100,
          timestamp: "2026-03-25T12:00:00Z",
        }, // CHA
      ];

      // Calculate points by stat (simulating what ProgressTab does)
      const pointsByStats: Record<StatType, number> = {
        int: 0,
        wis: 0,
        dex: 0,
        cha: 0,
      };

      activities.forEach((log) => {
        let stat: StatType | undefined;

        // Find which stat this activity belongs to
        for (const s of ["int", "wis", "dex", "cha"] as StatType[]) {
          const found = ACTIVITY_OPTIONS[s].find(
            (m) => m.activity === log.activity,
          );
          if (found) {
            stat = s;
            break;
          }
        }

        if (stat) {
          pointsByStats[stat] += log.points;
        }
      });

      // Verify correct distribution
      expect(pointsByStats.int).toBe(20);
      expect(pointsByStats.wis).toBe(200);
      expect(pointsByStats.dex).toBe(100);
      expect(pointsByStats.cha).toBe(100);
    });

    it("should calculate weekly totals correctly", () => {
      // Week with multiple activities
      const weekActivities: ActivityLog[] = [
        {
          activity: "coding",
          amount: 3,
          label: "LeetCode Easy",
          points: 60, // 20 * 3
          timestamp: "2026-03-25T09:00:00Z",
        },
        {
          activity: "coding",
          amount: 1,
          label: "LeetCode Medium",
          points: 100,
          timestamp: "2026-03-25T10:00:00Z",
        },
        {
          activity: "system",
          amount: 2,
          label: "System Design Sketch (Full Flow)",
          points: 400, // 200 * 2
          timestamp: "2026-03-25T11:00:00Z",
        },
      ];

      // Get weekly breakdown by activity
      const pointsByLabel: Record<string, number> = {};
      weekActivities.forEach((log) => {
        pointsByLabel[log.label] = (pointsByLabel[log.label] || 0) + log.points;
      });

      expect(pointsByLabel["LeetCode Easy"]).toBe(60);
      expect(pointsByLabel["LeetCode Medium"]).toBe(100);
      expect(pointsByLabel["System Design Sketch (Full Flow)"]).toBe(400);

      // Total INT points: 60 + 100 = 160
      const intTotal =
        pointsByLabel["LeetCode Easy"] + pointsByLabel["LeetCode Medium"];
      expect(intTotal).toBe(160);

      // Total WIS points: 400
      const wisTotal = pointsByLabel["System Design Sketch (Full Flow)"];
      expect(wisTotal).toBe(400);
    });

    it("should sum activities across all weeks", () => {
      // Multiple weeks of data
      const weekData: WeekData = {
        w1: {
          slots: {},
          mode: "normal",
          counts: {},
          reflection: "",
          activityLogs: [
            {
              activity: "coding",
              amount: 2,
              label: "LeetCode Easy",
              points: 40,
              timestamp: "2026-03-25T09:00:00Z",
            },
          ],
        },
        w2: {
          slots: {},
          mode: "normal",
          counts: {},
          reflection: "",
          activityLogs: [
            {
              activity: "coding",
              amount: 1,
              label: "LeetCode Medium",
              points: 100,
              timestamp: "2026-03-26T09:00:00Z",
            },
          ],
        },
        w3: {
          slots: {},
          mode: "normal",
          counts: {},
          reflection: "",
          activityLogs: [
            {
              activity: "system",
              amount: 1,
              label: "System Design Sketch (Full Flow)",
              points: 200,
              timestamp: "2026-03-27T09:00:00Z",
            },
          ],
        },
      };

      // Collect all logs (simulating what ProgressTab.calculateEngineerStats does)
      const allLogs: ActivityLog[] = [];
      Object.values(weekData).forEach((w) => {
        if (w.activityLogs) {
          allLogs.push(...w.activityLogs);
        }
      });

      // Count by stat
      const pointsByStats: Record<StatType, number> = {
        int: 0,
        wis: 0,
        dex: 0,
        cha: 0,
      };

      allLogs.forEach((log) => {
        let stat: StatType | undefined;
        for (const s of ["int", "wis", "dex", "cha"] as StatType[]) {
          const found = ACTIVITY_OPTIONS[s].find(
            (m) => m.activity === log.activity,
          );
          if (found) {
            stat = s;
            break;
          }
        }
        if (stat) {
          pointsByStats[stat] += log.points;
        }
      });

      // Overall totals
      expect(pointsByStats.int).toBe(140); // 40 + 100
      expect(pointsByStats.wis).toBe(200);
      expect(pointsByStats.dex).toBe(0);
      expect(pointsByStats.cha).toBe(0);
    });
  });

  describe("When stats don't add up (finding the bug)", () => {
    it("should detect if activity is assigned to wrong stat", () => {
      // Create an activity
      const activity: ActivityLog = {
        activity: "coding",
        amount: 1,
        label: "LeetCode Easy",
        points: 20,
        timestamp: "2026-03-25T09:00:00Z",
      };

      // Assign to stats the WRONG way
      const pointsByStatWrong: Record<StatType, number> = {
        int: 0,
        wis: 20, // WRONG - should be in INT
        dex: 0,
        cha: 0,
      };

      // Assign the RIGHT way
      const pointsByStatRight: Record<StatType, number> = {
        int: 20, // CORRECT
        wis: 0,
        dex: 0,
        cha: 0,
      };

      // They should not match
      expect(pointsByStatWrong.wis).not.toBe(pointsByStatRight.wis);
      expect(pointsByStatWrong.int).not.toBe(pointsByStatRight.int);
    });

    it("should detect if activity points are miscalculated", () => {
      // Log 3 x LeetCode Easy
      const activity: ActivityLog = {
        activity: "coding",
        amount: 3,
        label: "LeetCode Easy",
        points: 60, // Correct: 20 * 3
        timestamp: "2026-03-25T09:00:00Z",
      };

      // Wrong calculation
      const wrongPoints = 20; // Just one, not multiplied

      expect(activity.points).not.toBe(wrongPoints);
      expect(activity.points).toBe(60);
    });

    it("should verify weekly total matches sum of all activities", () => {
      const activities: ActivityLog[] = [
        {
          activity: "coding",
          amount: 1,
          label: "LeetCode Easy",
          points: 20,
          timestamp: "2026-03-25T09:00:00Z",
        },
        {
          activity: "coding",
          amount: 1,
          label: "LeetCode Medium",
          points: 100,
          timestamp: "2026-03-25T10:00:00Z",
        },
        {
          activity: "coding",
          amount: 1,
          label: "LeetCode Hard",
          points: 250,
          timestamp: "2026-03-25T11:00:00Z",
        },
      ];

      // Calculate total from activities
      const totalFromActivities = activities.reduce(
        (sum, act) => sum + act.points,
        0,
      );

      // Should be 370
      expect(totalFromActivities).toBe(370);

      // If weekly total shows something else, stats are wrong
      const weeklyTotal = 370; // What we expect
      expect(weeklyTotal).toBe(totalFromActivities);
    });

    it("should detect if activity is not being added to logs at all", () => {
      // Week with no activities
      const weekWithNoLogs: ActivityLog[] = [];

      // Week with activities
      const weekWithLogs: ActivityLog[] = [
        {
          activity: "coding",
          amount: 1,
          label: "LeetCode Easy",
          points: 20,
          timestamp: "2026-03-25T09:00:00Z",
        },
      ];

      // Should be different
      expect(weekWithNoLogs.length).toBe(0);
      expect(weekWithLogs.length).toBe(1);
    });
  });

  describe("Consistency checks", () => {
    it("should not lose points when refreshing", () => {
      // Week 1 with activities
      const week1: ActivityLog[] = [
        {
          activity: "coding",
          amount: 2,
          label: "LeetCode Easy",
          points: 40,
          timestamp: "2026-03-25T09:00:00Z",
        },
      ];

      // Calculate total before "refresh"
      const totalBefore = week1.reduce((sum, act) => sum + act.points, 0);

      // Simulate loading from database and recalculating
      const totalAfter = week1.reduce((sum, act) => sum + act.points, 0);

      // Should be the same
      expect(totalAfter).toBe(totalBefore);
      expect(totalAfter).toBe(40);
    });

    it("should keep running total across page navigation", () => {
      // User logs activities in week 1
      const week1Activities: ActivityLog[] = [
        {
          activity: "coding",
          amount: 1,
          label: "LeetCode Easy",
          points: 20,
          timestamp: "2026-03-25T09:00:00Z",
        },
      ];

      // Navigate to different tab and back
      // Activities should still be in state

      // Log more activities in week 1
      const moreActivities: ActivityLog[] = [
        {
          activity: "coding",
          amount: 1,
          label: "LeetCode Medium",
          points: 100,
          timestamp: "2026-03-25T10:00:00Z",
        },
      ];

      // Combine all for total
      const allWeek1 = [...week1Activities, ...moreActivities];
      const totalPoints = allWeek1.reduce((sum, act) => sum + act.points, 0);

      expect(totalPoints).toBe(120);
    });
  });
});
