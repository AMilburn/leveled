// Gamified progress system - Senior Engineer Profile with Fixed Point Values
import { BaseActivity } from "./types";

export type StatType = "int" | "wis" | "dex" | "cha";

export interface StatDefinition {
  key: StatType;
  name: string;
  fullName: string;
  description: string;
  color: string;
}

export const STATS: Record<StatType, StatDefinition> = {
  int: {
    key: "int",
    name: "INT",
    fullName: "Intelligence",
    description: "Coding & Pattern Recognition",
    color: "#534AB7",
  },
  wis: {
    key: "wis",
    name: "WIS",
    fullName: "Wisdom",
    description: "System Design & Tech Depth",
    color: "#0F6E56",
  },
  dex: {
    key: "dex",
    name: "DEX",
    fullName: "Dexterity",
    description: "Implementation & Tooling",
    color: "#854F0B",
  },
  cha: {
    key: "cha",
    name: "CHA",
    fullName: "Charisma",
    description: "Stories & Communication",
    color: "#185FA5",
  },
};

export interface ActivityOption {
  activity: BaseActivity;
  label: string;
  unit: string; // "session", "hour", "problem", "pr", "story", "application", "chat"
  pointValue: number; // Fixed points per unit (or points per hour for volume-based)
}

// Fixed point values for activities
export const ACTIVITY_OPTIONS: Record<StatType, ActivityOption[]> = {
  int: [
    { activity: "coding", label: "LeetCode Easy", unit: "problem", pointValue: 20 },
    { activity: "coding", label: "LeetCode Medium", unit: "problem", pointValue: 100 },
    { activity: "coding", label: "LeetCode Hard", unit: "problem", pointValue: 250 },
    { activity: "coding", label: "Mock Technical Interview", unit: "session", pointValue: 500 },
  ],
  wis: [
    { activity: "system", label: "System Design Sketch (Full Flow)", unit: "session", pointValue: 200 },
    { activity: "depth", label: "Tech Depth Deep Dive", unit: "hour", pointValue: 150 },
    { activity: "depth", label: "Whiteboard Walkthrough", unit: "session", pointValue: 100 },
    { activity: "depth", label: "Researching Trade-offs", unit: "session", pointValue: 75 },
  ],
  dex: [
    { activity: "project", label: "Feature Implementation (PR)", unit: "pr", pointValue: 100 },
    { activity: "project", label: "Bug Fix/Refactor", unit: "fix", pointValue: 50 },
    { activity: "project", label: "DevOps/CI-CD Setup", unit: "task", pointValue: 150 },
    { activity: "project", label: "Documentation/README", unit: "update", pointValue: 25 },
  ],
  cha: [
    { activity: "stories", label: "High-Quality Job Application", unit: "application", pointValue: 20 },
    { activity: "stories", label: "STAR Story (Recorded & Reviewed)", unit: "story", pointValue: 100 },
    { activity: "networking", label: "Networking Message/Coffee Chat", unit: "chat", pointValue: 50 },
    { activity: "networking", label: "Mock Behavioral Interview", unit: "interview", pointValue: 300 },
  ],
};

// Special activities (optional wellness activities, skipped for now)
export const SPECIAL_ACTIVITIES: ActivityOption[] = [];

// Retrieval (Memory) tracking
export const RETRIEVAL_SESSION_POINTS = 75;

export interface StatProgress {
  xp: number;
  level: number;
  nextLevelXP: number; // XP needed to reach next level
}

export interface EngineerStats {
  int: StatProgress;
  wis: StatProgress;
  dex: StatProgress;
  cha: StatProgress;
}

// Tiered level progression
// Level 1-5: 1,000 XP per level (Junior/Mid)
// Level 6-10: 2,500 XP per level (Senior)
// Level 11+: 5,000 XP per level (Staff/Lead)
const calculateLevelThreshold = (level: number): number => {
  if (level <= 5) {
    return level * 1000;
  } else if (level <= 10) {
    return 5000 + (level - 5) * 2500;
  } else {
    return 5000 + 5 * 2500 + (level - 10) * 5000;
  }
};

export const LEVEL_THRESHOLDS = Array.from({ length: 50 }, (_, i) =>
  calculateLevelThreshold(i + 1),
);

// Calculate stat progression from total XP
export function calculateLevel(totalXP: number): StatProgress {
  let level = 1;
  let accumulatedXP = 0;

  // Find the highest threshold exceeded
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      level = i + 2; // LEVEL_THRESHOLDS[0]=1000 XP to reach level 2, so i+2 gives correct level
      accumulatedXP = LEVEL_THRESHOLDS[i];
    } else {
      break;
    }
  }

  // Get the next level's threshold
  const nextThreshold =
    level - 1 < LEVEL_THRESHOLDS.length
      ? LEVEL_THRESHOLDS[level - 1]
      : LEVEL_THRESHOLDS[level - 2] + 5000;
  const xpInCurrentLevel = totalXP - accumulatedXP;
  const xpNeededForNextLevel = nextThreshold - accumulatedXP;

  return {
    xp: xpInCurrentLevel,
    level,
    nextLevelXP: Math.max(0, xpNeededForNextLevel),
  };
}

// Calculate overall level from cumulative XP across all stats
export function calculateOverallLevel(stats: EngineerStats): StatProgress {
  function getTotalXP(stat: StatProgress): number {
    let total = 0;
    for (let i = 0; i < stat.level - 1; i++) {
      total += LEVEL_THRESHOLDS[i];
    }
    total += stat.xp;
    return total;
  }

  const totalXP =
    getTotalXP(stats.int) +
    getTotalXP(stats.wis) +
    getTotalXP(stats.dex) +
    getTotalXP(stats.cha);

  return calculateLevel(totalXP);
}

// Identify which stat needs the most growth (lowest level, then lowest XP)
export function getMostNeedfulStat(stats: EngineerStats): StatType {
  const statEntries: [StatType, { level: number; xp: number }][] = [
    ["int", { level: stats.int.level, xp: stats.int.xp }],
    ["wis", { level: stats.wis.level, xp: stats.wis.xp }],
    ["dex", { level: stats.dex.level, xp: stats.dex.xp }],
    ["cha", { level: stats.cha.level, xp: stats.cha.xp }],
  ];

  const minLevel = Math.min(...statEntries.map(([_, v]) => v.level));
  const lowestStats = statEntries.filter(([_, v]) => v.level === minLevel);
  const minXP = Math.min(...lowestStats.map(([_, v]) => v.xp));
  const candidates = lowestStats.filter(([_, v]) => v.xp === minXP);

  return candidates[0][0];
}

// Get engineer tier based on overall level
export function getEngineerTier(level: number): string {
  if (level <= 3) {
    return "Junior Engineer";
  } else if (level <= 5) {
    return "Mid Engineer";
  } else if (level <= 10) {
    return "Senior Engineer";
  } else {
    return "Staff Engineer";
  }
}

// Calculate retrieval streak from activity logs
export function calculateRetrievalStreak(logs: any[]): { current: number; longest: number } {
  if (logs.length === 0) return { current: 0, longest: 0 };

  // Get unique dates from retrieval logs
  const retrievalDates = logs
    .filter((log) => log.activity === "retrieval")
    .map((log) => {
      const date = new Date(log.timestamp);
      return date.toISOString().split("T")[0]; // YYYY-MM-DD
    })
    .filter((date, idx, arr) => arr.indexOf(date) === idx) // unique dates
    .sort();

  if (retrievalDates.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let current = 1;

  for (let i = 1; i < retrievalDates.length; i++) {
    const prev = new Date(retrievalDates[i - 1]);
    const curr = new Date(retrievalDates[i]);
    const daysDiff = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  // Check if today is in the list (for current streak)
  const today = new Date().toISOString().split("T")[0];
  const currentStreak =
    retrievalDates[retrievalDates.length - 1] === today ? current : 0;

  return { current: currentStreak, longest };
}
