// Progress tracking configuration for schedule progress bars
import {
  calculateHourBreakdownFromTemplates,
  calculateStretchHoursFromTemplates,
} from "./schedule";

// Hour breakdown by activity - derived from WEEK_TEMPLATES in schedule.ts
const HOUR_BREAKDOWN = calculateHourBreakdownFromTemplates();
const STRETCH_HOURS = calculateStretchHoursFromTemplates();

// Calculate total hours from breakdown
const calculateTotalHours = (breakdown: Record<string, number>): number =>
  Object.values(breakdown).reduce((sum, hours) => sum + hours, 0);

// Core and stretch hours progress bar settings - derived from templates
export const PROGRESS_SETTINGS = {
  normal: {
    coreHoursMax: calculateTotalHours(HOUR_BREAKDOWN.normal),
    stretchMax: STRETCH_HOURS.normal,
    cumulativeGoal: 210,
  },
  travel: {
    coreHoursMax: calculateTotalHours(HOUR_BREAKDOWN.travel),
    stretchMax: STRETCH_HOURS.travel,
    cumulativeGoal: 210,
  },
  hard: {
    coreHoursMax: calculateTotalHours(HOUR_BREAKDOWN.hard),
    stretchMax: STRETCH_HOURS.hard,
    cumulativeGoal: 210,
  },
} as const;

// Weekly hour goals by week type
export const WEEKLY_HOUR_GOALS = {
  normal: {
    totalHours: PROGRESS_SETTINGS.normal.coreHoursMax,
    breakdown: HOUR_BREAKDOWN.normal,
  },
  travel: {
    totalHours: PROGRESS_SETTINGS.travel.coreHoursMax,
    breakdown: HOUR_BREAKDOWN.travel,
  },
  hard: {
    totalHours: PROGRESS_SETTINGS.hard.coreHoursMax,
    breakdown: HOUR_BREAKDOWN.hard,
  },
} as const;
