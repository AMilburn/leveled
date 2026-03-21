// Goals, progress tracking, and cumulative goal configuration

// Number of weeks for cumulative goal calculation
// Used in ProgressTab to calculate long-term targets (e.g., 5 LeetCode problems/week × 13 weeks = 65 total)
// Customize this based on your planning horizon (e.g., quarterly = 13, half-year = 26, yearly = 52)
export const CUMULATIVE_GOAL_WEEKS = 13;

// Weekly progress goals (vary by week type) - customize these for your own targets
export const WEEKLY_GOALS = {
  normal: [
    { key: "leetcode", label: "LeetCode problems", goal: 5, color: "#534AB7" },
    { key: "system", label: "System Design sessions", goal: 3, color: "#7B4FA0" },
    { key: "depth", label: "Tech depth sessions", goal: 3, color: "#0F6E56" },
    { key: "project", label: "Pet project", goal: 3, color: "#854F0B" },
    { key: "stories", label: "Interview stories written", goal: 2, color: "#993C1D" },
    { key: "apps", label: "Applications sent", goal: 5, color: "#185FA5" },
    { key: "retrieval", label: "Retrieval sessions", goal: 5, color: "#B8860B" },
    { key: "workout", label: "Workouts", goal: 4, color: "#27AE60" },
  ],
  travel: [
    { key: "leetcode", label: "LeetCode problems", goal: 2, color: "#534AB7" },
    { key: "system", label: "System Design sessions", goal: 1, color: "#7B4FA0" },
    { key: "depth", label: "Tech depth sessions", goal: 1, color: "#0F6E56" },
    { key: "project", label: "Pet project", goal: 1, color: "#854F0B" },
    { key: "stories", label: "Interview stories written", goal: 1, color: "#993C1D" },
    { key: "apps", label: "Applications sent", goal: 3, color: "#185FA5" },
    { key: "retrieval", label: "Retrieval sessions", goal: 3, color: "#B8860B" },
    { key: "workout", label: "Workouts", goal: 3, color: "#27AE60" },
  ],
  hard: [
    { key: "leetcode", label: "LeetCode problems", goal: 2, color: "#534AB7" },
    { key: "system", label: "System Design sessions", goal: 1, color: "#7B4FA0" },
    { key: "depth", label: "Tech depth sessions", goal: 1, color: "#0F6E56" },
    { key: "project", label: "Pet project", goal: 1, color: "#854F0B" },
    { key: "stories", label: "Interview stories written", goal: 1, color: "#993C1D" },
    { key: "apps", label: "Applications sent", goal: 1, color: "#185FA5" },
    { key: "retrieval", label: "Retrieval sessions", goal: 3, color: "#B8860B" },
    { key: "workout", label: "Workouts", goal: 3, color: "#27AE60" },
  ],
};

// Core hours progress bar settings
export const PROGRESS_SETTINGS = {
  normal: {
    coreHoursMax: 21,
    cumulativeGoal: 210, // 10 weeks of normal week targets
  },
  travel: {
    coreHoursMax: 11,
    cumulativeGoal: 210,
  },
  hard: {
    coreHoursMax: 12,
    cumulativeGoal: 210,
  },
};

// Weekly hour goals by week type
export const WEEKLY_HOUR_GOALS = {
  normal: {
    totalHours: 21,
    breakdown: {
      coding: 4,
      system: 3,
      depth: 3,
      project: 3,
      stories: 2,
      applications: 2,
      retrieval: 3,
      workout: 4,
    },
  },
  travel: {
    totalHours: 11,
    breakdown: {
      coding: 2,
      system: 1,
      depth: 1,
      project: 1,
      stories: 1,
      applications: 2,
      retrieval: 1,
      workout: 2,
    },
  },
  hard: {
    totalHours: 12,
    breakdown: {
      coding: 2,
      system: 1,
      depth: 1,
      project: 1,
      stories: 1,
      applications: 1,
      retrieval: 2,
      workout: 3,
    },
  },
};
