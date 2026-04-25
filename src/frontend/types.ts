import type { LucideIcon } from "lucide-react";

export type Language = "kk" | "ru";

export type MainTab = "home" | "path" | "plan" | "opportunities" | "portfolio";

export type GoalOption = {
  id: string;
  title: string;
  subtitle: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
};

export type PathNodeData = {
  id: string;
  title: string;
  description: string;
  tone: "start" | "interest" | "direction" | "skill" | "project" | "opportunity" | "portfolio";
};

export type UserPath = {
  name: string;
  summary: string;
  interests: string[];
  directions: string[];
  skills: string[];
  project: string;
  opportunity: string;
  nodes: PathNodeData[];
  savedAt: string;
};

export type Opportunity = {
  id: string;
  title: string;
  type: string;
  format: "online" | "offline" | "hybrid";
  grades: string;
  language: string;
  internet: "low" | "medium" | "high";
  deadline: string;
};

export type PlanSection = {
  title: string;
  focus: string;
  items: Array<{ id: string; text: string; done: boolean }>;
};

export type NavItem = {
  id: MainTab;
  label: string;
  icon: LucideIcon;
};
