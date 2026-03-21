// Schedule configuration, templates, and activity types

export const WEEK_TEMPLATES = {
  normal: {
    Mon: [
      "workout", // 8am
      "coding", // 9am
      "coding", // 10am
      "depth", // 11am
      "free", // 12pm
      "system", // 1pm
      "project", // 2pm
      "project", // 3pm
      "applications", // 4pm
      "free", // 5pm
      "free", // 6pm
      "free", // 7pm
      "retrieval", // 8pm
      "stretch-coding", // 9pm
      "free", // 10pm
    ],
    Tue: [
      "workout", // 8am
      "system", // 9am
      "system", // 10am
      "free", // 11am
      "free", // 12pm
      "stories", // 1pm
      "coding", // 2pm
      "depth", // 3pm
      "applications", // 4pm
      "free", // 5pm
      "free", // 6pm
      "free", // 7pm
      "stretch-project", // 8pm
      "stretch-system", // 9pm
      "free", // 10pm
    ],
    Wed: [
      "workout", // 8am
      "project", // 9am
      "project", // 10am
      "coding", // 11am
      "free", // 12pm
      "networking", // 1pm
      "depth", // 2pm
      "stories", // 3pm
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
      "system", // 8pm
      "project", // 9pm
      "free", // 10pm
    ],
    Fri: [
      "workout", // 8am
      "retrieval", // 9am
      "coding", // 10am
      "depth", // 11am
      "stories", // 12pm
      "applications", // 1pm
      "project", // 2pm
      "free", // 3pm
      "free", // 4pm
      "free", // 5pm
      "free", // 6pm
      "free", // 7pm
      "retrieval", // 8pm
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
      "coding", // 2pm
      "stretch-coding", // 3pm
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
  travel: {
    Mon: [
      "workout", // 8am
      "coding", // 9am
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
    Tue: [
      "free", // 8am
      "free", // 9am
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
    Wed: [
      "workout", // 8am
      "depth", // 9am
      "free", // 10am
      "free", // 11am
      "free", // 12pm
      "free", // 1pm
      "project", // 2pm
      "free", // 3pm
      "free", // 4pm
      "free", // 5pm
      "free", // 6pm
      "free", // 7pm
      "free", // 8pm
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
      "free", // 8pm
      "free", // 9pm
      "free", // 10pm
    ],
    Fri: [
      "workout", // 8am
      "coding", // 9am
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
      "free", // 8pm
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
      "coding", // 10am
      "depth", // 11am
      "free", // 12pm
      "system", // 1pm
      "project", // 2pm
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
      "system", // 9am
      "coding", // 10am
      "free", // 11am
      "free", // 12pm
      "stories", // 1pm
      "free", // 2pm
      "free", // 3pm
      "free", // 4pm
      "free", // 5pm
      "free", // 6pm
      "free", // 7pm
      "review", // 8pm
      "free", // 9pm
      "free", // 10pm
    ],
    Wed: [
      "workout", // 8am
      "project", // 9am
      "project", // 10am
      "depth", // 11am
      "free", // 12pm
      "coding", // 1pm
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
      "system", // 8pm
      "free", // 9pm
      "free", // 10pm
    ],
    Fri: [
      "workout", // 8am
      "retrieval", // 9am
      "coding", // 10am
      "stories", // 11am
      "free", // 12pm
      "project", // 1pm
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
      "free", // 8pm
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
};

export const MODE_NOTES = {
  normal:
    "Normal week: core blocks committed, stretch blocks (dotted) are optional upgrades.",
  travel:
    "Travel week: stripped to essentials only. No stretch blocks. Focus on coding and one depth topic.",
  hard: "Hard week: all stretch blocks removed. Core commitments only. Protect workout and one coding session — momentum matters.",
};

// Single source of truth for all activity metadata (label + color)
const ACTIVITY_METADATA = {
  coding: { label: "Coding", color: "#dcdaf5" },
  depth: { label: "Tech depth", color: "#d0f0ed" },
  system: { label: "System Design", color: "#f0d9f0" },
  project: { label: "Pet project", color: "#ffead4" },
  stories: { label: "Interview prep", color: "#f0d9d0" },
  applications: { label: "Applications", color: "#d9e8f5" },
  review: { label: "Light review", color: "#efe8e0" },
  networking: { label: "Networking", color: "#e0e8f5" },
  retrieval: { label: "Retrieval", color: "#e8d4b0" },
  workout: { label: "Workout", color: "#d4f1d4" },
  "stretch-coding": { label: "+ Coding", color: "#f0eef8" },
  "stretch-depth": { label: "+ Depth", color: "#e8f5f3" },
  "stretch-system": { label: "+ System Design", color: "#f8e8f8" },
  "stretch-project": { label: "+ Project", color: "#fff5e8" },
  "stretch-stories": { label: "+ Stories", color: "#f8e8e0" },
  "stretch-workout": { label: "+ Workout", color: "#e8f5e8" },
  "stretch-applications": { label: "+ Applications", color: "#e8eff8" },
  "stretch-networking": { label: "+ Networking", color: "#e8eff8" },
  "stretch-retrieval": { label: "+ Retrieval", color: "#f0e8d8" },
  free: { label: "", color: "#f5f5f5" },
  blocked: { label: "–", color: "#e8e8e8" },
} as const;

// Core activity types (non-stretch, non-special) - derived from metadata
export const CORE_ACTIVITIES = Object.keys(ACTIVITY_METADATA).filter(
  (key) => !key.startsWith("stretch-") && key !== "free" && key !== "blocked",
) as readonly (keyof typeof ACTIVITY_METADATA)[];

// All activity types - derived from metadata
export const ALL_ACTIVITIES = Object.keys(
  ACTIVITY_METADATA,
) as readonly (keyof typeof ACTIVITY_METADATA)[];

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
  typeLabels: Object.fromEntries(
    Object.entries(ACTIVITY_METADATA).map(([k, v]) => [k, v.label]),
  ) as Record<keyof typeof ACTIVITY_METADATA, string>,
  typeColors: Object.fromEntries(
    Object.entries(ACTIVITY_METADATA).map(([k, v]) => [k, v.color]),
  ) as Record<keyof typeof ACTIVITY_METADATA, string>,
} as const;
