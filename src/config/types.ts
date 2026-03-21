// Type definitions for the application

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

export type ActivityType = keyof typeof import("./schedule").SCHEDULE_CONFIG["typeLabels"];

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
