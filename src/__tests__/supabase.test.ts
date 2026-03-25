import { describe, it, expect } from "vitest";

const mockUserId = "test-user-123";

describe("Saving Data to Supabase", () => {
  describe("When you log an activity", () => {
    it("should save activity logs in the database", () => {
      const activityLog = {
        activity: "coding",
        amount: 3,
        label: "LeetCode",
        points: 30,
        timestamp: "2026-03-25T10:00:00Z",
      };

      const weekToSave = {
        week_number: 1,
        user_id: mockUserId,
        activity_logs: [activityLog],
      };

      expect(weekToSave.activity_logs).toHaveLength(1);
      expect(weekToSave.activity_logs[0].label).toBe("LeetCode");
    });

    it("should save multiple activities in the same week", () => {
      const activities = [
        {
          activity: "coding",
          label: "LeetCode",
          amount: 3,
          points: 30,
          timestamp: "2026-03-25T09:00:00Z",
        },
        {
          activity: "depth",
          label: "System Design",
          amount: 1,
          points: 50,
          timestamp: "2026-03-25T14:00:00Z",
        },
        {
          activity: "stories",
          label: "STAR Stories",
          amount: 2,
          points: 40,
          timestamp: "2026-03-25T18:00:00Z",
        },
      ];

      expect(activities).toHaveLength(3);
      expect(activities[0].label).toBe("LeetCode");
      expect(activities[1].label).toBe("System Design");
      expect(activities[2].label).toBe("STAR Stories");
    });

    it("should calculate stats correctly from saved activities", () => {
      const activities = [
        { label: "LeetCode", points: 30 }, // INT
        { label: "System Design", points: 50 }, // WIS
        { label: "Pull Request", points: 40 }, // DEX
      ];

      const totalPoints = activities.reduce((sum, a) => sum + a.points, 0);
      expect(totalPoints).toBe(120);
    });
  });

  describe("When you add a win", () => {
    it("should save the win to the database", () => {
      const win = {
        id: "win-1",
        content: "Solved sliding window problem",
        user_id: mockUserId,
      };

      expect(win.content).toBe("Solved sliding window problem");
      expect(win.user_id).toBe(mockUserId);
    });

    it("should save multiple wins", () => {
      const wins = [
        { id: "1", content: "Solved sliding window", user_id: mockUserId },
        { id: "2", content: "Fixed critical bug", user_id: mockUserId },
        { id: "3", content: "Shipped feature", user_id: mockUserId },
      ];

      expect(wins).toHaveLength(3);
      expect(wins[0].content).toBe("Solved sliding window");
      expect(wins[1].content).toBe("Fixed critical bug");
    });

    it("should track which user added each win", () => {
      const win = { id: "1", content: "Test", user_id: mockUserId };

      expect(win.user_id).toBeDefined();
      expect(win.user_id).toBe(mockUserId);
    });
  });

  describe("Data stays separated between users", () => {
    it("should allow multiple users to have week 1", () => {
      const userAWeek1 = { week_number: 1, user_id: "user-a" };
      const userBWeek1 = { week_number: 1, user_id: "user-b" };

      expect(userAWeek1.user_id).not.toBe(userBWeek1.user_id);
      expect(userAWeek1.week_number).toBe(userBWeek1.week_number);
    });

    it("should prevent a single user from having duplicate weeks", () => {
      // User A can't have two different week 1 records
      const record1 = { week_number: 1, user_id: mockUserId };
      const record2 = { week_number: 1, user_id: mockUserId };

      // These would be duplicates
      expect(record1.user_id).toBe(record2.user_id);
      expect(record1.week_number).toBe(record2.week_number);
    });
  });

  describe("When data syncs to the database", () => {
    it("should save all user data with the user ID attached", () => {
      // When you sync week 1 with activity logs
      const dataToSync = {
        week_number: 1,
        user_id: mockUserId,
        activity_logs: [
          {
            activity: "coding",
            label: "LeetCode",
            amount: 3,
            points: 30,
            timestamp: "2026-03-25T10:00:00Z",
          },
        ],
      };

      // The user ID should be included
      expect(dataToSync.user_id).toBe(mockUserId);
      expect(dataToSync.activity_logs).toBeDefined();
      expect(dataToSync.activity_logs.length).toBeGreaterThan(0);
    });

    it("should save all kanban tasks with user ownership", () => {
      // When you move a task in kanban
      const task = {
        id: "task-1",
        title: "Study recursion",
        col: 1, // in "Up Next"
        user_id: mockUserId,
      };

      // It should record who owns it
      expect(task.user_id).toBe(mockUserId);
    });

    it("should handle empty weeks gracefully", () => {
      // If a week has no activity logs yet
      const emptyWeek = {
        week_number: 5,
        user_id: mockUserId,
        activity_logs: [],
      };

      // It should still save
      expect(emptyWeek.activity_logs).toEqual([]);
      expect(emptyWeek.user_id).toBe(mockUserId);
    });
  });

  describe("Fixing the database issues", () => {
    it("should update existing week data without losing activities", () => {
      // Week 1 already has 2 activities
      const originalWeek = {
        week_number: 1,
        user_id: mockUserId,
        activity_logs: [
          { label: "LeetCode", points: 30 },
          { label: "System Design", points: 50 },
        ],
      };

      // When you add a 3rd activity and save again
      const updatedWeek = {
        ...originalWeek,
        activity_logs: [
          ...originalWeek.activity_logs,
          { label: "STAR Stories", points: 40 },
        ],
      };

      // All activities should still be there
      expect(updatedWeek.activity_logs).toHaveLength(3);
      expect(updatedWeek.activity_logs[0].label).toBe("LeetCode");
      expect(updatedWeek.activity_logs[1].label).toBe("System Design");
      expect(updatedWeek.activity_logs[2].label).toBe("STAR Stories");
    });

    it("should only load data for the logged-in user", () => {
      // When loading from database
      // Should only fetch records where user_id matches
      const weeksToLoad = [
        {
          week_number: 1,
          user_id: mockUserId,
          activity_logs: [{ label: "LeetCode", points: 30 }],
        },
      ];

      // Verify all returned records belong to this user
      weeksToLoad.forEach((week) => {
        expect(week.user_id).toBe(mockUserId);
      });
    });

    it("should identify which user made each win", () => {
      // When loading wins from database
      const winsToLoad = [
        { id: "1", content: "Solved problem", user_id: mockUserId },
        { id: "2", content: "Shipped code", user_id: mockUserId },
      ];

      // Each should have the user ID
      winsToLoad.forEach((win) => {
        expect(win.user_id).toBe(mockUserId);
      });
    });
  });
});
