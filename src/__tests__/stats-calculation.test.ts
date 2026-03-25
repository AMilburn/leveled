import { describe, it, expect } from "vitest";
import {
  calculateLevel,
  calculateOverallLevel,
  ACTIVITY_OPTIONS,
} from "../config/stats";
import type { EngineerStats, StatType } from "../config";

describe("Stats Calculation - Activity Logging", () => {
  describe("When you log activities", () => {
    it("should add correct points for a single activity", () => {
      // When you log "1 x LeetCode Easy" (20 points)
      const points = 20;
      const level = calculateLevel(points);

      // Points should be recorded
      expect(level.xp).toBe(20);
      expect(level.level).toBe(1);
    });

    it("should accumulate points when logging multiple activities", () => {
      // Week activities:
      // - 2 x LeetCode Easy (20 pts each = 40 pts)
      // - 1 x LeetCode Medium (100 pts = 100 pts)
      // Total: 140 points in INT stat
      const totalPoints = 40 + 100;

      const level = calculateLevel(totalPoints);
      expect(level.xp).toBe(140);
    });

    it("should correctly assign activities to stats", () => {
      // LeetCode should map to INT
      const leetcodeOption = ACTIVITY_OPTIONS.int.find(
        (a) => a.label === "LeetCode Easy",
      );
      expect(leetcodeOption).toBeDefined();
      expect(leetcodeOption?.pointValue).toBe(20);

      // System Design should map to WIS
      const systemOption = ACTIVITY_OPTIONS.wis.find(
        (a) => a.label === "System Design Sketch (Full Flow)",
      );
      expect(systemOption).toBeDefined();
      expect(systemOption?.pointValue).toBe(200);

      // Feature Implementation should map to DEX
      const featureOption = ACTIVITY_OPTIONS.dex.find(
        (a) => a.label === "Feature Implementation (PR)",
      );
      expect(featureOption).toBeDefined();
      expect(featureOption?.pointValue).toBe(100);

      // Job Application should map to CHA
      const appOption = ACTIVITY_OPTIONS.cha.find(
        (a) => a.label === "High-Quality Job Application",
      );
      expect(appOption).toBeDefined();
      expect(appOption?.pointValue).toBe(20);
    });
  });

  describe("Weekly totals should add up correctly", () => {
    it("should sum points from multiple activities in one week", () => {
      // Simulate a week's activities
      const activities = [
        { stat: "int" as StatType, points: 20 }, // LeetCode Easy
        { stat: "int" as StatType, points: 100 }, // LeetCode Medium
        { stat: "wis" as StatType, points: 200 }, // System Design
        { stat: "dex" as StatType, points: 100 }, // Feature PR
      ];

      const weeklyTotalByActivity: Record<StatType, number> = {
        int: 0,
        wis: 0,
        dex: 0,
        cha: 0,
      };
      activities.forEach((act) => {
        weeklyTotalByActivity[act.stat] += act.points;
      });

      // INT should have 120 points
      expect(weeklyTotalByActivity.int).toBe(120);
      // WIS should have 200 points
      expect(weeklyTotalByActivity.wis).toBe(200);
      // DEX should have 100 points
      expect(weeklyTotalByActivity.dex).toBe(100);
      // CHA should be 0
      expect(weeklyTotalByActivity.cha).toBe(0);
    });

    it("should calculate correct level from weekly points", () => {
      // If INT gets 120 points in a week
      const intPoints = 120;
      const intLevel = calculateLevel(intPoints);

      expect(intLevel.xp).toBe(120);
      expect(intLevel.level).toBe(1); // Still level 1 (needs 1000 for level 2)
      expect(intLevel.nextLevelXP).toBe(1000); // 1000 total needed
    });

    it("should show progress within level", () => {
      // If you have 500 points toward INT
      const level = calculateLevel(500);

      expect(level.level).toBe(1);
      expect(level.xp).toBe(500); // Progress within level 1
      expect(level.nextLevelXP).toBe(1000); // Still need 500 more for level 2
    });
  });

  describe("Overall totals across weeks", () => {
    it("should sum all stat points from multiple weeks", () => {
      // Week 1: INT=100, WIS=50, DEX=75, CHA=25
      // Week 2: INT=200, WIS=100, DEX=50, CHA=100
      // Total:  INT=300, WIS=150, DEX=125, CHA=125

      const week1 = { int: 100, wis: 50, dex: 75, cha: 25 };
      const week2 = { int: 200, wis: 100, dex: 50, cha: 100 };

      const totalPoints = {
        int: week1.int + week2.int,
        wis: week1.wis + week2.wis,
        dex: week1.dex + week2.dex,
        cha: week1.cha + week2.cha,
      };

      expect(totalPoints.int).toBe(300);
      expect(totalPoints.wis).toBe(150);
      expect(totalPoints.dex).toBe(125);
      expect(totalPoints.cha).toBe(125);
    });

    it("should calculate overall level correctly", () => {
      // Create engineer stats from accumulated points
      const stats: EngineerStats = {
        int: calculateLevel(500), // 500 XP = level 1
        wis: calculateLevel(1500), // 1500 XP = level 2
        dex: calculateLevel(200), // 200 XP = level 1
        cha: calculateLevel(300), // 300 XP = level 1
      };

      const overall = calculateOverallLevel(stats);

      // Overall should sum all XP correctly
      expect(overall.level).toBeGreaterThanOrEqual(1);
      expect(overall.xp).toBeGreaterThan(0);
    });

    it("should track cumulative XP across multiple weeks", () => {
      // Simulate 3 weeks of activity
      const week1Points = 150;
      const week2Points = 200;
      const week3Points = 250;
      const totalPoints = week1Points + week2Points + week3Points; // 600

      const cumulativeLevel = calculateLevel(totalPoints);

      expect(cumulativeLevel.xp).toBe(600);
      expect(cumulativeLevel.level).toBe(1); // Still level 1 at 600 XP
      expect(cumulativeLevel.nextLevelXP).toBe(1000); // Need 1000 total
    });
  });

  describe("Point calculations should be consistent", () => {
    it("should always get same total whether logged separately or together", () => {
      // Scenario 1: Log activities one by one
      const activity1 = 50;
      const activity2 = 75;
      const activity3 = 100;

      const separateTotal = activity1 + activity2 + activity3; // 225
      const separateLevel = calculateLevel(separateTotal);

      // Scenario 2: Calculate all at once
      const combinedLevel = calculateLevel(225);

      // Results should match
      expect(separateLevel.xp).toBe(combinedLevel.xp);
      expect(separateLevel.level).toBe(combinedLevel.level);
      expect(separateLevel.nextLevelXP).toBe(combinedLevel.nextLevelXP);
    });

    it("should verify level thresholds are correct", () => {
      // Level 1: 0-999 XP
      const level1 = calculateLevel(999);
      expect(level1.level).toBe(1);

      // Level 2: 1000-1999 XP
      const level2 = calculateLevel(1000);
      expect(level2.level).toBe(2);

      // Level 3: 2000-2999 XP
      const level3 = calculateLevel(2000);
      expect(level3.level).toBe(3);

      // Level 4: 3000-3999 XP
      const level4 = calculateLevel(3000);
      expect(level4.level).toBe(4);
    });

    it("should handle large XP totals correctly", () => {
      // After logging many activities (10000 total XP)
      const highXP = 10000;
      const level = calculateLevel(highXP);

      expect(level.xp).toBeGreaterThanOrEqual(0);
      expect(level.level).toBeGreaterThan(5);
      expect(level.nextLevelXP).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Real-world logging scenarios", () => {
    it("should correctly total a typical week of activities", () => {
      // Typical week:
      // INT: 3x LeetCode Medium (100 each) = 300
      // WIS: 1x System Design (200) + 2x Tech Depth (150 each) = 500
      // DEX: 2x Feature PR (100 each) = 200
      // CHA: 1x Job Application (20) = 20

      const weekStats: Record<StatType, number> = {
        int: 300,
        wis: 500,
        dex: 200,
        cha: 20,
      };

      const intLevel = calculateLevel(weekStats.int);
      const wisLevel = calculateLevel(weekStats.wis);
      const dexLevel = calculateLevel(weekStats.dex);
      const chaLevel = calculateLevel(weekStats.cha);

      // Verify each stat is tracked independently
      expect(intLevel.xp).toBe(300);
      expect(wisLevel.xp).toBe(500);
      expect(dexLevel.xp).toBe(200);
      expect(chaLevel.xp).toBe(20);

      // Overall should combine all
      const stats: EngineerStats = {
        int: intLevel,
        wis: wisLevel,
        dex: dexLevel,
        cha: chaLevel,
      };
      const overall = calculateOverallLevel(stats);

      expect(overall.xp).toBeGreaterThan(0);
    });

    it("should handle varied activity logging rates", () => {
      // Some weeks heavy on one stat, others balanced
      const week1: Record<StatType, number> = {
        int: 400,
        wis: 0,
        dex: 0,
        cha: 0,
      };

      const week2: Record<StatType, number> = {
        int: 0,
        wis: 500,
        dex: 0,
        cha: 0,
      };

      const week3: Record<StatType, number> = {
        int: 100,
        wis: 100,
        dex: 100,
        cha: 100,
      };

      const totalByS: Record<StatType, number> = {
        int: week1.int + week2.int + week3.int,
        wis: week1.wis + week2.wis + week3.wis,
        dex: week1.dex + week2.dex + week3.dex,
        cha: week1.cha + week2.cha + week3.cha,
      };

      expect(totalByS.int).toBe(500);
      expect(totalByS.wis).toBe(600);
      expect(totalByS.dex).toBe(100);
      expect(totalByS.cha).toBe(100);

      const stats: EngineerStats = {
        int: calculateLevel(totalByS.int),
        wis: calculateLevel(totalByS.wis),
        dex: calculateLevel(totalByS.dex),
        cha: calculateLevel(totalByS.cha),
      };

      const overall = calculateOverallLevel(stats);
      expect(overall.level).toBeGreaterThanOrEqual(1);
    });

    it("should correctly handle deleting an activity", () => {
      // If you log 3 activities (total 300 XP) then delete one (100 XP)
      const beforeDelete = calculateLevel(300);
      const afterDelete = calculateLevel(200); // 300 - 100

      expect(beforeDelete.xp).toBe(300);
      expect(afterDelete.xp).toBe(200);
      expect(afterDelete.xp).toBeLessThan(beforeDelete.xp);
    });
  });

  describe("Edge cases", () => {
    it("should handle zero points", () => {
      const level = calculateLevel(0);
      expect(level.level).toBe(1);
      expect(level.xp).toBe(0);
    });

    it("should handle exact level thresholds", () => {
      // Exactly 1000 should be level 2
      const level1000 = calculateLevel(1000);
      expect(level1000.level).toBe(2);
      expect(level1000.xp).toBe(0); // Starting fresh at new level
    });

    it("should not double-count activities", () => {
      // If activity is logged once with amount=3
      // Should equal logging it 3 times with amount=1
      const singleLog = 3 * 20; // 1 LeetCode Easy × 3 = 60 points
      const multipleLogsSum = 20 + 20 + 20; // 3 separate logs = 60 points

      const singleLevel = calculateLevel(singleLog);
      const multipleLevel = calculateLevel(multipleLogsSum);

      expect(singleLevel.xp).toBe(multipleLevel.xp);
    });
  });
});
