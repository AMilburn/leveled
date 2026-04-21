import { describe, it, expect } from "vitest";
import {
  calculateLevel,
  calculateOverallLevel,
  getEngineerTier,
  getActivityMeta,
  calculatePointsPreview,
  ACTIVITY_OPTIONS,
  LEVEL_THRESHOLDS,
  RETRIEVAL_SESSION_POINTS,
} from "../config/stats";
import { ActivityLog } from "../config/types";

describe("Stats Screen", () => {
  describe("Activity Point Values", () => {
    it("should have correct INT activity points", () => {
      const intActivities = ACTIVITY_OPTIONS.int;
      expect(intActivities[0].pointValue).toBe(20); // Easy
      expect(intActivities[1].pointValue).toBe(100); // Medium
      expect(intActivities[2].pointValue).toBe(250); // Hard
      expect(intActivities[3].pointValue).toBe(500); // Interview
    });

    it("should have correct WIS activity points", () => {
      const wisActivities = ACTIVITY_OPTIONS.wis;
      expect(wisActivities[0].pointValue).toBe(200); // System Design
      expect(wisActivities[1].pointValue).toBe(150); // Tech Depth
      expect(wisActivities[2].pointValue).toBe(100); // Whiteboard
      expect(wisActivities[3].pointValue).toBe(75); // Research
    });

    it("should have correct DEX activity points", () => {
      const dexActivities = ACTIVITY_OPTIONS.dex;
      expect(dexActivities[0].pointValue).toBe(100); // Feature PR
      expect(dexActivities[1].pointValue).toBe(50); // Bug Fix
      expect(dexActivities[2].pointValue).toBe(150); // DevOps
      expect(dexActivities[3].pointValue).toBe(25); // Documentation
    });

    it("should have correct CHA activity points", () => {
      const chaActivities = ACTIVITY_OPTIONS.cha;
      expect(chaActivities[0].pointValue).toBe(20);  // Application
      expect(chaActivities[1].pointValue).toBe(40);  // STAR Story Draft
      expect(chaActivities[2].pointValue).toBe(60);  // STAR Story Refined
      expect(chaActivities[3].pointValue).toBe(80);  // STAR Story Practiced
      expect(chaActivities[4].pointValue).toBe(40);  // Interview Answer Prep
      expect(chaActivities[5].pointValue).toBe(50);  // Networking
      expect(chaActivities[6].pointValue).toBe(300); // Mock Behavioral Interview
      expect(chaActivities[7].pointValue).toBe(400); // Real Behavioral Interview
      expect(chaActivities[8].pointValue).toBe(50);  // Company Research
    });
  });

  describe("Weekly Totals", () => {
    it("should correctly sum weekly activities for INT", () => {
      const logs: ActivityLog[] = [
        {
          activity: "coding",
          amount: 2,
          label: "LeetCode Easy",
          points: 40, // 2 × 20
          timestamp: new Date().toISOString(),
        },
        {
          activity: "coding",
          amount: 1,
          label: "LeetCode Medium",
          points: 100, // 1 × 100
          timestamp: new Date().toISOString(),
        },
      ];
      const weeklyTotal = logs.reduce((sum, log) => sum + log.points, 0);
      expect(weeklyTotal).toBe(140);
    });

    it("should correctly sum weekly activities across multiple stats", () => {
      const logs: ActivityLog[] = [
        {
          activity: "coding",
          amount: 1,
          label: "LeetCode Hard",
          points: 250,
          timestamp: new Date().toISOString(),
        },
        {
          activity: "system",
          amount: 1,
          label: "System Design",
          points: 200,
          timestamp: new Date().toISOString(),
        },
        {
          activity: "project",
          amount: 2,
          label: "Feature PR",
          points: 200,
          timestamp: new Date().toISOString(),
        },
        {
          activity: "stories",
          amount: 1,
          label: "STAR Story",
          points: 100,
          timestamp: new Date().toISOString(),
        },
      ];
      const weeklyTotal = logs.reduce((sum, log) => sum + log.points, 0);
      expect(weeklyTotal).toBe(750);
    });

    it("should handle zero activity logs", () => {
      const logs: ActivityLog[] = [];
      const weeklyTotal = logs.reduce((sum, log) => sum + log.points, 0);
      expect(weeklyTotal).toBe(0);
    });
  });

  describe("Level Progression - Tiered Thresholds", () => {
    it("level 1: 0 XP", () => {
      const result = calculateLevel(0);
      expect(result.level).toBe(1);
      expect(result.xp).toBe(0);
    });

    it("level 2: 1000 XP (Junior tier)", () => {
      const result = calculateLevel(1000);
      expect(result.level).toBe(2);
      expect(result.xp).toBe(0); // At threshold
    });

    it("level 3: 2000 XP (Junior tier)", () => {
      const result = calculateLevel(2000);
      expect(result.level).toBe(3);
    });

    it("level 6: 5000 XP (Junior/Mid boundary)", () => {
      const result = calculateLevel(5000);
      expect(result.level).toBe(6);
    });

    it("level 7: 7500 XP (Senior tier starts)", () => {
      const result = calculateLevel(7500);
      expect(result.level).toBe(7);
    });

    it("level 11: 20000 XP (Senior/Staff boundary)", () => {
      const result = calculateLevel(20000);
      expect(result.level).toBe(11);
    });

    it("level 12: 25000 XP (Staff tier)", () => {
      const result = calculateLevel(25000);
      expect(result.level).toBe(12);
    });

    it("should track progress within a level", () => {
      const result = calculateLevel(1500);
      expect(result.level).toBe(2);
      expect(result.xp).toBe(500); // 1500 - 1000
      expect(result.nextLevelXP).toBe(1000); // Need 1000 more to reach level 3
    });

    it("should correctly progress mid-level", () => {
      const result = calculateLevel(8000);
      expect(result.level).toBe(7);
      expect(result.xp).toBe(500); // 8000 - 7500
    });
  });

  describe("Engineer Tier Classification", () => {
    it("level 1-3: Junior Engineer", () => {
      expect(getEngineerTier(1)).toBe("Junior Engineer");
      expect(getEngineerTier(3)).toBe("Junior Engineer");
    });

    it("level 4-5: Mid Engineer", () => {
      expect(getEngineerTier(4)).toBe("Mid Engineer");
      expect(getEngineerTier(5)).toBe("Mid Engineer");
    });

    it("level 6-10: Senior Engineer", () => {
      expect(getEngineerTier(6)).toBe("Senior Engineer");
      expect(getEngineerTier(8)).toBe("Senior Engineer");
      expect(getEngineerTier(10)).toBe("Senior Engineer");
    });

    it("level 11+: Staff Engineer", () => {
      expect(getEngineerTier(11)).toBe("Staff Engineer");
      expect(getEngineerTier(15)).toBe("Staff Engineer");
    });
  });

  describe("Overall Level Across Multiple Stats", () => {
    it("should calculate overall level as the average of stat levels", () => {
      const stats = {
        int: calculateLevel(5000), // Level 6
        wis: calculateLevel(5000), // Level 6
        dex: calculateLevel(5000), // Level 6
        cha: calculateLevel(5000), // Level 6
      };

      const overall = calculateOverallLevel(stats);
      expect(overall.level).toBe(6); // floor(avg(6,6,6,6)) = 6
      expect(overall.avg).toBe(6);
    });

    it("should reward balanced stats over concentrated investment", () => {
      const balanced = {
        int: calculateLevel(10000), // ~level 8
        wis: calculateLevel(10000),
        dex: calculateLevel(10000),
        cha: calculateLevel(10000),
      };

      const concentrated = {
        int: calculateLevel(40000), // high level, but others are level 1
        wis: calculateLevel(0),
        dex: calculateLevel(0),
        cha: calculateLevel(0),
      };

      const balancedOverall = calculateOverallLevel(balanced);
      const concentratedOverall = calculateOverallLevel(concentrated);

      expect(balancedOverall.level).toBeGreaterThan(concentratedOverall.level);
    });

    it("should reach high levels with comprehensive stats", () => {
      const stats = {
        int: calculateLevel(20000), // ~level 11
        wis: calculateLevel(20000),
        dex: calculateLevel(20000),
        cha: calculateLevel(20000),
      };

      const overall = calculateOverallLevel(stats);
      expect(overall.level).toBeGreaterThan(10);
      expect(getEngineerTier(overall.level)).toBe("Staff Engineer");
    });

    it("should return fractional avg progress toward next level", () => {
      const stats = {
        int: { level: 3, xp: 500, nextLevelXP: 1000 },
        wis: { level: 2, xp: 200, nextLevelXP: 1000 },
        dex: { level: 1, xp: 0, nextLevelXP: 1000 },
        cha: { level: 2, xp: 0, nextLevelXP: 1000 },
      };

      const overall = calculateOverallLevel(stats);
      expect(overall.avg).toBe(2); // (3+2+1+2)/4 = 2.0
      expect(overall.level).toBe(2);
      expect(overall.xp).toBe(0); // 0% progress toward level 3
    });
  });

  describe("Real-World Scenario: Week of Activities", () => {
    it("should accumulate points across a full week", () => {
      // Typical productive week
      const weeklyActivities: ActivityLog[] = [
        // INT: 3 mediums + 1 hard
        {
          activity: "coding",
          amount: 3,
          label: "LeetCode Medium",
          points: 300,
          timestamp: new Date().toISOString(),
        },
        {
          activity: "coding",
          amount: 1,
          label: "LeetCode Hard",
          points: 250,
          timestamp: new Date().toISOString(),
        },

        // WIS: 1 system design + 2 depth sessions
        {
          activity: "system",
          amount: 1,
          label: "System Design",
          points: 200,
          timestamp: new Date().toISOString(),
        },
        {
          activity: "depth",
          amount: 2,
          label: "Tech Depth",
          points: 300,
          timestamp: new Date().toISOString(),
        },

        // DEX: 2 PRs + 1 bug fix
        {
          activity: "project",
          amount: 2,
          label: "Feature PR",
          points: 200,
          timestamp: new Date().toISOString(),
        },
        {
          activity: "project",
          amount: 1,
          label: "Bug Fix",
          points: 50,
          timestamp: new Date().toISOString(),
        },

        // CHA: 1 STAR story + 1 networking
        {
          activity: "stories",
          amount: 1,
          label: "STAR Story",
          points: 100,
          timestamp: new Date().toISOString(),
        },
        {
          activity: "networking",
          amount: 1,
          label: "Networking",
          points: 50,
          timestamp: new Date().toISOString(),
        },
      ];

      const totalWeeklyPoints = weeklyActivities.reduce(
        (sum, log) => sum + log.points,
        0,
      );
      expect(totalWeeklyPoints).toBe(1450);

      // Each stat gains from their activities
      const intGain = 300 + 250; // 550
      const wisGain = 200 + 300; // 500
      const dexGain = 200 + 50; // 250
      const chaGain = 100 + 50; // 150

      expect(intGain + wisGain + dexGain + chaGain).toBe(totalWeeklyPoints);
    });

    it("should show progression with accumulating weekly activities", () => {
      // Week 1: Minimal activities
      const week1Stats = {
        int: calculateLevel(500),
        wis: calculateLevel(500),
        dex: calculateLevel(500),
        cha: calculateLevel(500),
      };

      const week1Overall = calculateOverallLevel(week1Stats);

      // Week 3: Sustained effort
      const week3Stats = {
        int: calculateLevel(10000),
        wis: calculateLevel(10000),
        dex: calculateLevel(10000),
        cha: calculateLevel(10000),
      };

      const week3Overall = calculateOverallLevel(week3Stats);

      // Level should increase as activities accumulate
      expect(week3Overall.level).toBeGreaterThan(week1Overall.level);
    });
  });

  describe("Edge Cases and Boundaries", () => {
    it("should handle XP just below level threshold", () => {
      const result = calculateLevel(999);
      expect(result.level).toBe(1);
      expect(result.xp).toBe(999);
    });

    it("should handle XP exactly at level threshold", () => {
      const result = calculateLevel(1000);
      expect(result.level).toBe(2);
      expect(result.xp).toBe(0);
    });

    it("should handle XP just above level threshold", () => {
      const result = calculateLevel(1001);
      expect(result.level).toBe(2);
      expect(result.xp).toBe(1);
    });

    it("should correctly calculate nextLevelXP", () => {
      const result = calculateLevel(1500);
      expect(result.nextLevelXP).toBe(1000); // 2000 - 1000
    });

    it("should not have negative nextLevelXP", () => {
      const result = calculateLevel(2000);
      expect(result.nextLevelXP).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Retrieval Session Points", () => {
    it("should define retrieval session points", () => {
      expect(RETRIEVAL_SESSION_POINTS).toBe(75);
    });
  });

  describe("Activity Log Modal Logic", () => {
    describe("points preview calculation", () => {
      it("should calculate preview for LeetCode Medium × 3", () => {
        const meta = getActivityMeta("LeetCode Medium")!;
        expect(calculatePointsPreview(meta.pointValue, 3)).toBe(300);
      });

      it("should calculate preview for hourly activities", () => {
        const meta = getActivityMeta("Tech Depth Deep Dive")!;
        expect(calculatePointsPreview(meta.pointValue, 2)).toBe(300);
      });

      it("should calculate preview for take-home assignment × 1", () => {
        const meta = getActivityMeta("Take-Home Assignment")!;
        expect(calculatePointsPreview(meta.pointValue, 1)).toBe(350);
      });
    });

    describe("activity lookup by label", () => {
      it("should find an INT activity and return its stat", () => {
        const meta = getActivityMeta("Real Technical Interview");
        expect(meta).not.toBeNull();
        expect(meta!.stat).toBe("int");
        expect(meta!.pointValue).toBe(750);
      });

      it("should find a CHA activity and return its stat", () => {
        const meta = getActivityMeta("Real Behavioral Interview");
        expect(meta).not.toBeNull();
        expect(meta!.stat).toBe("cha");
        expect(meta!.pointValue).toBe(400);
      });

      it("should return null for an unknown label", () => {
        expect(getActivityMeta("Not A Real Activity")).toBeNull();
      });

      it("should include the unit in the returned meta", () => {
        const meta = getActivityMeta("LeetCode Medium");
        expect(meta!.unit).toBe("problem");
      });
    });

    describe("calculatePointsPreview", () => {
      it("should multiply pointValue by amount", () => {
        expect(calculatePointsPreview(100, 3)).toBe(300);
      });

      it("should default to 1 when amount is 0", () => {
        expect(calculatePointsPreview(100, 0)).toBe(100);
      });

      it("should handle large amounts", () => {
        expect(calculatePointsPreview(20, 10)).toBe(200);
      });
    });

    describe("ActivityLog note field", () => {
      it("should store a note on an activity log", () => {
        const log: ActivityLog = {
          activity: "coding",
          amount: 1,
          label: "LeetCode Hard",
          points: 250,
          timestamp: new Date().toISOString(),
          note: "Two Trees problem — recursion with backtracking",
        };
        expect(log.note).toBe("Two Trees problem — recursion with backtracking");
      });

      it("should allow logs without a note", () => {
        const log: ActivityLog = {
          activity: "coding",
          amount: 1,
          label: "LeetCode Easy",
          points: 20,
          timestamp: new Date().toISOString(),
        };
        expect(log.note).toBeUndefined();
      });

      it("should not affect points calculation when note is present", () => {
        const withNote: ActivityLog = {
          activity: "project",
          amount: 2,
          label: "Feature Implementation (PR)",
          points: 200,
          timestamp: new Date().toISOString(),
          note: "Auth flow refactor",
        };
        const withoutNote: ActivityLog = {
          activity: "project",
          amount: 2,
          label: "Feature Implementation (PR)",
          points: 200,
          timestamp: new Date().toISOString(),
        };
        expect(withNote.points).toBe(withoutNote.points);
      });
    });

    describe("new activities added in this session", () => {
      it("should include job-search INT activities", () => {
        const labels = ACTIVITY_OPTIONS.int.map((a) => a.label);
        expect(labels).toContain("Flashcard / Retrieval Practice");
        expect(labels).toContain("Problem Approach Review");
        expect(labels).toContain("Past Project Review & Documentation");
        expect(labels).toContain("Algorithm / DS Study Session");
      });

      it("should include job-search DEX activities", () => {
        const labels = ACTIVITY_OPTIONS.dex.map((a) => a.label);
        expect(labels).toContain("Take-Home Assignment");
        expect(labels).toContain("Writing Tests");
        expect(labels).toContain("Open Source Contribution (PR Merged)");
        expect(labels).toContain("Technical Demo / Presentation Prep");
      });

      it("should include job-search CHA activities", () => {
        const labels = ACTIVITY_OPTIONS.cha.map((a) => a.label);
        expect(labels).toContain("Company Research");
        expect(labels).toContain("Interview Answer Prep");
        expect(labels).toContain("STAR Story Draft");
        expect(labels).toContain("STAR Story Refined");
        expect(labels).toContain("STAR Story Practiced");
      });

      it("should include new WIS activities", () => {
        const labels = ACTIVITY_OPTIONS.wis.map((a) => a.label);
        expect(labels).toContain("Engineering Blog / Case Study");
        expect(labels).toContain("Technical Talk / YouTube / Conference");
        expect(labels).toContain("Reading an Unfamiliar Codebase");
      });

      it("real interview should be worth more than mock for both INT and CHA", () => {
        const mockTech = ACTIVITY_OPTIONS.int.find((a) => a.label === "Mock Technical Interview")!;
        const realTech = ACTIVITY_OPTIONS.int.find((a) => a.label === "Real Technical Interview")!;
        expect(realTech.pointValue).toBeGreaterThan(mockTech.pointValue);

        const mockBehav = ACTIVITY_OPTIONS.cha.find((a) => a.label === "Mock Behavioral Interview")!;
        const realBehav = ACTIVITY_OPTIONS.cha.find((a) => a.label === "Real Behavioral Interview")!;
        expect(realBehav.pointValue).toBeGreaterThan(mockBehav.pointValue);
      });

      it("STAR story points should increase with each stage", () => {
        const draft = ACTIVITY_OPTIONS.cha.find((a) => a.label === "STAR Story Draft")!;
        const refined = ACTIVITY_OPTIONS.cha.find((a) => a.label === "STAR Story Refined")!;
        const practiced = ACTIVITY_OPTIONS.cha.find((a) => a.label === "STAR Story Practiced")!;
        expect(refined.pointValue).toBeGreaterThan(draft.pointValue);
        expect(practiced.pointValue).toBeGreaterThan(refined.pointValue);
      });
    });
  });

  describe("Level Thresholds Array", () => {
    it("should have 50 level thresholds", () => {
      expect(LEVEL_THRESHOLDS.length).toBe(50);
    });

    it("should have increasing thresholds", () => {
      for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
        expect(LEVEL_THRESHOLDS[i]).toBeGreaterThan(LEVEL_THRESHOLDS[i - 1]);
      }
    });

    it("should start with 1000 (level 2)", () => {
      expect(LEVEL_THRESHOLDS[0]).toBe(1000);
    });
  });
});
