// Schedule configuration, templates, and activity types
import {
  Day,
  ActivityType,
  WeekMode,
  WeekTemplates,
  ActivityPlacement,
} from "./types";

export const DAYS: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TIME_SLOTS = {
  morning: 0, // 8am
  latemorning: 2, // 10am
  midday: 4, // 12pm
  afternoon: 5, // 1pm
  lateafternoon: 7, // 3pm
  evening: 12, // 8pm
};

function generateWeekTemplate(
  placements: readonly ActivityPlacement[],
  stretchPlacements?: readonly ActivityPlacement[],
): Record<Day, readonly ActivityType[]> {
  const weekTemplate: Record<Day, ActivityType[]> = {} as Record<
    Day,
    ActivityType[]
  >;

  // Initialize with free time
  DAYS.forEach((day) => {
    weekTemplate[day] = Array(15).fill("free");
  });

  // Activity scheduling preferences (which time of day for each activity)
  const preferences: Record<string, number> = {
    workout: TIME_SLOTS.morning,
    coding: TIME_SLOTS.morning,
    system: TIME_SLOTS.afternoon,
    depth: TIME_SLOTS.afternoon,
    applications: TIME_SLOTS.afternoon,
    stories: TIME_SLOTS.afternoon,
    project: TIME_SLOTS.evening,
    retrieval: TIME_SLOTS.evening,
  };

  // Place core activities
  placements.forEach(({ activity, days: activityDays, hours }) => {
    const startSlot = preferences[activity] || TIME_SLOTS.morning;

    activityDays.forEach((day) => {
      let placed = 0;
      let slot = startSlot;

      while (placed < hours && slot < 15) {
        if (weekTemplate[day][slot] === "free") {
          weekTemplate[day][slot] = activity;
          placed++;
        }
        slot++;
      }
    });
  });

  // Place stretch activities (with "stretch-" prefix)
  if (stretchPlacements) {
    stretchPlacements.forEach(({ activity, days: activityDays, hours }) => {
      const startSlot = preferences[activity] || TIME_SLOTS.morning;

      activityDays.forEach((day) => {
        let placed = 0;
        let slot = startSlot;
        const stretchActivity = `stretch-${activity}` as ActivityType;

        while (placed < hours && slot < 15) {
          if (weekTemplate[day][slot] === "free") {
            weekTemplate[day][slot] = stretchActivity;
            placed++;
          }
          slot++;
        }
      });
    });
  }

  return weekTemplate as Record<Day, readonly ActivityType[]>;
}

export const WEEK_TEMPLATES: WeekTemplates = {
  normal: {
    template: generateWeekTemplate(
      [
        { activity: "coding", days: ["Mon", "Tue", "Wed", "Fri"], hours: 3 },
        { activity: "system", days: ["Mon", "Fri"], hours: 2 },
        { activity: "depth", days: ["Mon", "Wed", "Fri"], hours: 1 },
        { activity: "project", days: ["Thu"], hours: 2 },
        { activity: "applications", days: ["Wed", "Thu"], hours: 1 },
        { activity: "stories", days: ["Wed"], hours: 1 },
        { activity: "workout", days: ["Mon", "Tue", "Sat"], hours: 1 },
        { activity: "retrieval", days: ["Mon", "Thu"], hours: 1 },
      ] as ActivityPlacement[],
      [
        { activity: "project", days: ["Tue", "Sat"], hours: 1 },
        { activity: "depth", days: ["Sun"], hours: 1 },
        { activity: "workout", days: ["Fri"], hours: 1 },
      ] as ActivityPlacement[],
    ),
    note: "The Normal Week: High-Intensity Consolidation. Focus: Forging new neural pathways through Deep Work and Active Synthesis.",
  },
  travel: {
    template: generateWeekTemplate(
      [
        { activity: "coding", days: ["Mon", "Wed"], hours: 2 },
        { activity: "system", days: ["Tue"], hours: 1 },
        { activity: "depth", days: ["Thu"], hours: 2 },
        { activity: "project", days: ["Tue"], hours: 1 },
        { activity: "applications", days: ["Tue", "Wed"], hours: 1 },
        { activity: "workout", days: ["Mon", "Wed", "Sat"], hours: 1 },
        {
          activity: "retrieval",
          days: ["Mon", "Tue", "Wed", "Thu"],
          hours: 1,
        },
      ] as ActivityPlacement[],
      [{ activity: "coding", days: ["Sat"], hours: 1 }] as ActivityPlacement[],
    ),
    note: "The Travel Week: Pattern Maintenance. Focus: Combating the Forgetting Curve through high-frequency, low-friction Retrieval.",
  },
  hard: {
    template: generateWeekTemplate(
      [
        { activity: "coding", days: ["Mon", "Tue", "Wed", "Fri"], hours: 1 },
        { activity: "system", days: ["Mon"], hours: 1 },
        { activity: "project", days: ["Tue"], hours: 1 },
        { activity: "applications", days: ["Fri"], hours: 1 },
        { activity: "workout", days: ["Mon", "Tue", "Fri", "Sat"], hours: 1 },
        {
          activity: "retrieval",
          days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          hours: 1,
        },
      ] as ActivityPlacement[],
      [],
    ),
    note: "The Hard Week: Cognitive Recovery & Defense. Focus: Protecting your Knowledge Baseline and lowering Cortisol levels.",
  },
};

// Calculate core hour breakdown from WEEK_TEMPLATES (excluding stretch)
export function calculateHourBreakdownFromTemplates(): Record<
  WeekMode,
  Record<string, number>
> {
  const breakdown: Record<WeekMode, Record<string, number>> = {
    normal: {},
    travel: {},
    hard: {},
  };

  (Object.keys(WEEK_TEMPLATES) as WeekMode[]).forEach((mode) => {
    const template = WEEK_TEMPLATES[mode].template;
    const activities: Record<string, number> = {};

    // Count occurrences of each CORE activity across all days (exclude stretch variants)
    DAYS.forEach((day) => {
      template[day].forEach((activity) => {
        // Only count non-stretch, non-special activities
        if (
          activity !== "free" &&
          activity !== "blocked" &&
          !activity.startsWith("stretch-")
        ) {
          activities[activity] = (activities[activity] || 0) + 1;
        }
      });
    });

    breakdown[mode] = activities;
  });

  return breakdown;
}

// Calculate stretch hour totals from WEEK_TEMPLATES
export function calculateStretchHoursFromTemplates(): Record<WeekMode, number> {
  const stretchHours: Record<WeekMode, number> = {
    normal: 0,
    travel: 0,
    hard: 0,
  };

  (Object.keys(WEEK_TEMPLATES) as WeekMode[]).forEach((mode) => {
    const template = WEEK_TEMPLATES[mode].template;
    let total = 0;

    // Count occurrences of each STRETCH activity
    DAYS.forEach((day) => {
      template[day].forEach((activity) => {
        if (activity.startsWith("stretch-")) {
          total++;
        }
      });
    });

    stretchHours[mode] = total;
  });

  return stretchHours;
}

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
  "stretch-review": { label: "+ Review", color: "#f5f5f0" },
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
  days: DAYS,
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
