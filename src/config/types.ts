// Day type and array for type safety
export type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

// Week mode types
export type WeekMode = "normal" | "travel" | "hard";

// Base activity types (can be scheduled as core or stretch)
export type BaseActivity =
  | "coding"
  | "depth"
  | "system"
  | "project"
  | "stories"
  | "applications"
  | "review"
  | "networking"
  | "retrieval"
  | "workout";

// Stretch-only activity types
export type StretchActivity = `stretch-${BaseActivity}`;

// All activity types including special markers
export type ActivityType = BaseActivity | StretchActivity | "free" | "blocked";

// Core activity placement (for core or stretch scheduling)
export type ActivityPlacement = {
  activity: BaseActivity;
  days: readonly Day[];
  hours: number;
};

// Week template structure
export type WeekTemplateEntry = {
  template: Record<Day, readonly ActivityType[]>;
  note: string;
};

// All week templates
export type WeekTemplates = Record<WeekMode, WeekTemplateEntry>;

// Application data types
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

export interface GoalDefinition {
  key: string;
  label: string;
  goal: number;
  color: string;
}

// Activity logging for gamification system
export interface ActivityLog {
  activity: BaseActivity;
  amount: number;
  xpEarned: number;
  timestamp: string;
}

export interface Week {
  mode: WeekMode;
  slots: Record<string, ActivityType[]>;
  counts?: Record<string, number>;
  reflection?: string;
  activityLogs?: ActivityLog[];
}

export interface WeekData {
  [key: string]: Week;
}
