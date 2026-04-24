// Kanban configuration and default tasks
import { CORE_ACTIVITIES, SCHEDULE_CONFIG } from "./schedule";
import { KanbanTask } from "./types";

// Generate kanban tags dynamically from core activities
export const KANBAN_TAGS = CORE_ACTIVITIES.map((activity) => ({
  name: activity,
  label: SCHEDULE_CONFIG.typeLabels[activity],
  bg: SCHEDULE_CONFIG.typeColors[activity],
  text: "#333",
}));

// Default kanban tasks - Customize these to match your development focus
export const KANBAN_TASKS: KanbanTask[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    col: 0,
    title: "Craft technical story",
    tag: "interview",
    note: "Scale achieved, trade-offs considered, results",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    col: 0,
    title: "LeetCode 75: Binary Tree/DFS",
    tag: "coding",
    note: "Tree traversal patterns and optimization",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    col: 0,
    title: "Review system design: URL shortener",
    tag: "depth",
    note: "Database design, caching, consistency trade-offs",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    col: 0,
    title: "Update GitHub README for portfolio project",
    tag: "project",
    note: "Clear documentation, architecture, results",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440012",
    col: 0,
    title: "Practice STAR stories for behavioral questions",
    tag: "interview",
    note: "Leadership, conflict, failure, learning moments",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440013",
    col: 0,
    title: "Complete Langchain Essentials course",
    tag: "depth",
    note: "LLM patterns and integration techniques",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440014",
    col: 0,
    title: "Research target companies",
    tag: "interview",
    note: "Culture, tech stack, growth opportunities",
  },
];

// Default wins (empty initially, user fills these in)
export const DEFAULT_WINS = [];
