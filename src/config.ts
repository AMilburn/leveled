// Your personal week schedule templates
// Edit this file to customize your weekly schedules
// This file is kept in git for your personal setup

// Type definitions
export interface Win {
  id: string;
  content: string;
}

export interface KanbanTask {
  id: string;
  col: number;
  title: string;
  tag: string;
  note: string;
}

export type WeekMode = "normal" | "travel" | "hard";

export type ActivityType = keyof typeof SCHEDULE_CONFIG["typeLabels"];

export interface GoalDefinition {
  key: string;
  label: string;
  goal: number;
  color: string;
}

export interface Week {
  mode: WeekMode;
  slots: Record<string, ActivityType[]>;
  counts?: Record<string, number>;
  reflection?: string;
}

export interface WeekData {
  [key: string]: Week;
}

// Kanban task tags with styling
// Customize these tags to organize your tasks. Each tag has a background color and text color.
export const KANBAN_TAGS = [
  { name: "coding", bg: "#ede7f6", text: "#512da8" },
  { name: "depth", bg: "#e0f2f1", text: "#00695c" },
  { name: "project", bg: "#f3e5f5", text: "#6a1b9a" },
  { name: "interview", bg: "#fff3e0", text: "#e65100" },
  { name: "mindset", bg: "#e3f2fd", text: "#1565c0" },
] as const;

export type KanbanTag = (typeof KANBAN_TAGS)[number]["name"];

export const WEEK_TEMPLATES = {
  normal: {
    Mon: [
      "workout", // 8am
      "coding", // 9am
      "coding", // 10am
      "system", // 11am
      "system", // 12pm
      "depth", // 1pm
      "depth", // 2pm
      "project", // 3pm
      "project", // 4pm
      "blocked", // 5pm
      "blocked", // 6pm
      "blocked", // 7pm
      "retrieval", // 8pm
      "stretch-coding", // 9pm
      "free", // 10pm
    ],
    Tue: [
      "workout", // 8am
      "coding", // 9am
      "coding", // 10am
      "depth", // 11am
      "free", // 12pm
      "stories", // 1pm
      "applications", // 2pm
      "blocked", // 3pm
      "stretch-system", // 4pm
      "stretch-project", // 5pm
      "blocked", // 6pm
      "blocked", // 7pm
      "blocked", // 8pm
      "blocked", // 9pm
      "free", // 10pm
    ],
    Wed: [
      "workout", // 8am
      "system", // 9am
      "free", // 10am
      "free", // 11am
      "blocked", // 12pm
      "free", // 1pm
      "coding", // 2pm
      "stories", // 3pm
      "applications", // 4pm
      "blocked", // 5pm
      "blocked", // 6pm
      "blocked", // 7pm
      "retrieval", // 8pm
      "stretch-project", // 9pm
      "free", // 10pm
    ],
    Thu: [
      "free", // 8am
      "free", // 9am
      "free", // 10am
      "free", // 11am
      "free", // 12pm
      "free", // 1pm
      "free", // 2pm
      "free", // 3pm
      "free", // 4pm
      "blocked", // 5pm
      "blocked", // 6pm
      "blocked", // 7pm
      "project", // 8pm
      "project", // 9pm
      "free", // 10pm
    ],
    Fri: [
      "workout", // 8am
      "retrieval", // 9am — week consolidation first
      "coding", // 10am — apply retrieval immediately
      "system", // 11am
      "depth", // 12pm
      "stories", // 1pm
      "applications", // 2pm
      "project", // 3pm
      "stretch-coding", // 4pm
      "blocked", // 5pm
      "blocked", // 6pm
      "blocked", // 7pm
      "retrieval", // 8pm — end of week consolidation
      "free", // 9pm
      "free", // 10pm
    ],
    Sat: [
      "free", // 8am
      "free", // 9am
      "free", // 10am
      "free", // 11am
      "free", // 12pm
      "free", // 1pm
      "free", // 2pm
      "free", // 3pm
      "free", // 4pm
      "blocked", // 5pm
      "blocked", // 6pm
      "blocked", // 7pm
      "retrieval", // 8pm — weekly consolidation
      "stretch-coding", // 9pm
      "free", // 10pm
    ],
    Sun: [
      "free", // 8am
      "free", // 9am
      "free", // 10am
      "free", // 11am
      "free", // 12pm
      "free", // 1pm
      "free", // 2pm
      "free", // 3pm
      "free", // 4pm
      "blocked", // 5pm
      "blocked", // 6pm
      "blocked", // 7pm
      "free", // 8pm
      "free", // 9pm
      "free", // 10pm
    ],
  },
  travel: {
    Mon: [
      "workout", // 8am
      "coding", // 9am
      "coding", // 10am
      "free", // 11am
      "free", // 12pm
      "free", // 1pm
      "free", // 2pm
      "free", // 3pm
      "free", // 4pm
      "free", // 5pm
      "free", // 6pm
      "free", // 7pm
      "retrieval", // 8pm
      "free", // 9pm
      "free", // 10pm
    ],
    Tue: [
      "workout", // 8am
      "free", // 9am
      "depth", // 10am
      "coding", // 11am
      "free", // 12pm
      "free", // 1pm
      "free", // 2pm
      "free", // 3pm
      "free", // 4pm
      "free", // 5pm
      "free", // 6pm
      "free", // 7pm
      "free", // 8pm
      "free", // 9pm
      "free", // 10pm
    ],
    Wed: [
      "workout", // 8am
      "system", // 9am
      "free", // 10am
      "free", // 11am
      "free", // 12pm
      "free", // 1pm
      "stories", // 2pm
      "free", // 3pm
      "free", // 4pm
      "free", // 5pm
      "free", // 6pm
      "free", // 7pm
      "retrieval", // 8pm
      "free", // 9pm
      "free", // 10pm
    ],
    Thu: [
      "free", // 8am
      "free", // 9am
      "free", // 10am
      "free", // 11am
      "free", // 12pm
      "free", // 1pm
      "free", // 2pm
      "free", // 3pm
      "free", // 4pm
      "free", // 5pm
      "free", // 6pm
      "free", // 7pm
      "project", // 8pm
      "free", // 9pm
      "free", // 10pm
    ],
    Fri: [
      "workout", // 8am
      "retrieval", // 9am — week consolidation first
      "coding", // 10am
      "depth", // 11am
      "free", // 12pm
      "free", // 1pm
      "free", // 2pm
      "free", // 3pm
      "free", // 4pm
      "free", // 5pm
      "free", // 6pm
      "free", // 7pm
      "retrieval", // 8pm — end of week consolidation
      "free", // 9pm
      "free", // 10pm
    ],
    Sat: [
      "free", // 8am
      "free", // 9am
      "free", // 10am
      "free", // 11am
      "free", // 12pm
      "free", // 1pm
      "free", // 2pm
      "free", // 3pm
      "free", // 4pm
      "free", // 5pm
      "free", // 6pm
      "free", // 7pm
      "retrieval", // 8pm
      "free", // 9pm
      "free", // 10pm
    ],
    Sun: [
      "free", // 8am
      "free", // 9am
      "free", // 10am
      "free", // 11am
      "free", // 12pm
      "free", // 1pm
      "free", // 2pm
      "free", // 3pm
      "free", // 4pm
      "free", // 5pm
      "free", // 6pm
      "free", // 7pm
      "free", // 8pm
      "free", // 9pm
      "free", // 10pm
    ],
  },
  hard: {
    Mon: [
      "workout", // 8am
      "coding", // 9am
      "depth", // 10am
      "free", // 11am
      "free", // 12pm
      "free", // 1pm
      "free", // 2pm
      "free", // 3pm
      "free", // 4pm
      "blocked", // 5pm
      "blocked", // 6pm
      "blocked", // 7pm
      "retrieval", // 8pm
      "free", // 9pm
      "free", // 10pm
    ],
    Tue: [
      "workout", // 8am
      "free", // 9am
      "coding", // 10am
      "free", // 11am
      "free", // 12pm
      "free", // 1pm
      "free", // 2pm
      "blocked", // 3pm
      "free", // 4pm
      "blocked", // 5pm
      "blocked", // 6pm
      "blocked", // 7pm
      "review", // 8pm
      "blocked", // 9pm
      "free", // 10pm
    ],
    Wed: [
      "workout", // 8am
      "depth", // 9am
      "free", // 10am
      "free", // 11am
      "blocked", // 12pm
      "free", // 1pm
      "project", // 2pm
      "free", // 3pm
      "free", // 4pm
      "blocked", // 5pm
      "blocked", // 6pm
      "blocked", // 7pm
      "retrieval", // 8pm
      "free", // 9pm
      "free", // 10pm
    ],
    Thu: [
      "free", // 8am
      "free", // 9am
      "free", // 10am
      "free", // 11am
      "free", // 12pm
      "free", // 1pm
      "free", // 2pm
      "free", // 3pm
      "free", // 4pm
      "blocked", // 5pm
      "blocked", // 6pm
      "blocked", // 7pm
      "project", // 8pm
      "free", // 9pm
      "free", // 10pm
    ],
    Fri: [
      "workout", // 8am
      "retrieval", // 9am — week consolidation first
      "coding", // 10am
      "stories", // 11am
      "free", // 12pm
      "free", // 1pm
      "free", // 2pm
      "free", // 3pm
      "free", // 4pm
      "blocked", // 5pm
      "blocked", // 6pm
      "blocked", // 7pm
      "retrieval", // 8pm — end of week consolidation
      "free", // 9pm
      "free", // 10pm
    ],
    Sat: [
      "free", // 8am
      "free", // 9am
      "free", // 10am
      "free", // 11am
      "free", // 12pm
      "free", // 1pm
      "free", // 2pm
      "free", // 3pm
      "free", // 4pm
      "blocked", // 5pm
      "blocked", // 6pm
      "blocked", // 7pm
      "retrieval", // 8pm
      "free", // 9pm
      "free", // 10pm
    ],
    Sun: [
      "free", // 8am
      "free", // 9am
      "free", // 10am
      "free", // 11am
      "free", // 12pm
      "free", // 1pm
      "free", // 2pm
      "free", // 3pm
      "free", // 4pm
      "blocked", // 5pm
      "blocked", // 6pm
      "blocked", // 7pm
      "free", // 8pm
      "free", // 9pm
      "free", // 10pm
    ],
  },
};

export const MODE_NOTES = {
  normal:
    "Normal week: core blocks committed, stretch blocks (dotted) are optional upgrades.",
  travel:
    "Travel week: stripped to essentials only. No stretch blocks. Focus on coding and one depth topic.",
  hard: "Hard week: all stretch blocks removed. Core commitments only. Protect workout and one coding session — momentum matters.",
};

// Weekly progress goals (vary by week type) - customize these for your own targets
// Number of weeks for cumulative goal calculation
// Used in ProgressTab to calculate long-term targets (e.g., 5 LeetCode problems/week × 13 weeks = 65 total)
// Customize this based on your planning horizon (e.g., quarterly = 13, half-year = 26, yearly = 52)
export const CUMULATIVE_GOAL_WEEKS = 13;

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

// Default kanban tasks
export const KANBAN_TASKS = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    col: 0,
    title: "LeetCode 75: Arrays/Strings",
    tag: "coding",
    note: "Start here. 9 problems.",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    col: 0,
    title: "LeetCode 75: Two Pointers",
    tag: "coding",
    note: "4 problems.",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    col: 0,
    title: "LeetCode 75: Sliding Window",
    tag: "coding",
    note: "4 problems.",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    col: 0,
    title: "Live coding (recorded)",
    tag: "coding",
    note: "Narrate out loud. Even to yourself.",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    col: 0,
    title: "Tech depth: Frontend perf",
    tag: "depth",
    note: "CWV, bundle opt, rendering",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    col: 0,
    title: "Tech depth: DB optimization",
    tag: "depth",
    note: "Indexing, N+1, query planning",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    col: 0,
    title: "Tech depth: Security (OWASP)",
    tag: "depth",
    note: "Auth patterns, XSS/CSRF",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    col: 0,
    title: "Tech depth: Architecture tradeoffs",
    tag: "depth",
    note: "CAP theorem, micro vs mono",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    col: 0,
    title: "Story mining (5 projects)",
    tag: "interview",
    note: "Scale, decisions, tradeoffs, results",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    col: 0,
    title: "STAR bank (10 questions)",
    tag: "interview",
    note: "Leadership, conflict, failure, scale",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    col: 0,
    title: "Levelled pet project",
    tag: "project",
    note: "Working MVP deployed and usable",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440012",
    col: 0,
    title: "Epub pet project",
    tag: "project",
    note: "Deploy MVP with PDFs readable, save place",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440013",
    col: 0,
    title: "Langchain course",
    tag: "depth",
    note: "",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440014",
    col: 0,
    title: "Freeze protocol (write on card)",
    tag: "mindset",
    note: '"Brute force first, narrate always"',
  },
];

// Default wins (empty initially, user fills these in)
export const DEFAULT_WINS = [];

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

// Core activity types (non-stretch)
export const CORE_ACTIVITIES = [
  "coding",
  "depth",
  "system",
  "project",
  "stories",
  "networking",
  "retrieval",
  "workout",
  "applications",
  "review",
] as const;

// All activity types including stretch variants
export const ALL_ACTIVITIES = [
  "coding",
  "depth",
  "system",
  "project",
  "stories",
  "networking",
  "retrieval",
  "workout",
  "applications",
  "review",
  "free",
  "stretch-coding",
  "stretch-depth",
  "stretch-system",
  "stretch-project",
  "stretch-stories",
  "stretch-networking",
  "stretch-retrieval",
  "blocked",
] as const;

// Activity type to CSS color code mapping (for core activities)
export const ACTIVITY_COLOR_CODES: Record<(typeof CORE_ACTIVITIES)[number], string> = {
  coding: "pu",
  depth: "te",
  system: "pu",
  project: "am",
  stories: "co",
  networking: "bl",
  retrieval: "am",
  workout: "gr",
  applications: "bl",
  review: "gy",
} as const;

// Schedule configuration
export const SCHEDULE_CONFIG = {
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  times: [
    "8am",
    "9am",
    "10am",
    "11am",
    "12pm",
    "1pm",
    "2pm",
    "3pm",
    "4pm",
    "5pm",
    "6pm",
    "7pm",
    "8pm",
    "9pm",
    "10pm",
  ],
  typeLabels: {
    free: "",
    blocked: "–",
    workout: "Workout",
    coding: "Coding",
    depth: "Tech depth",
    system: "System Design",
    project: "Pet project",
    stories: "Interview prep",
    applications: "Applications",
    review: "Light review",
    networking: "Networking",
    retrieval: "Retrieval",
    "stretch-coding": "+ Coding",
    "stretch-depth": "+ Depth",
    "stretch-system": "+ System Design",
    "stretch-project": "+ Project",
    "stretch-stories": "+ Stories",
    "stretch-workout": "+ Workout",
    "stretch-applications": "+ Applications",
    "stretch-networking": "+ Networking",
    "stretch-retrieval": "+ Retrieval",
  } as const,
  typeColors: {
    free: "#f5f5f5",
    blocked: "#e8e8e8",
    workout: "#d4f1d4",
    coding: "#e8e0f5",
    depth: "#d0f0ed",
    system: "#e8d9f5",
    project: "#f5e8d0",
    stories: "#f0d9d0",
    applications: "#d9e8f5",
    review: "#f1efe8",
    networking: "#e0e8f5",
    retrieval: "#f0e8d9",
    "stretch-coding": "#fff",
    "stretch-depth": "#fff",
    "stretch-system": "#fff",
    "stretch-project": "#fff",
    "stretch-stories": "#fff",
    "stretch-workout": "#fff",
    "stretch-applications": "#fff",
    "stretch-networking": "#fff",
    "stretch-retrieval": "#fff",
  } as const,
} as const;
