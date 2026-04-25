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

export type QuizAnswers = Record<string, string>;

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

export type PortfolioLanguage = "ru" | "kk" | "en";

export type PortfolioFields = {
  studentName: string;
  grade: string;
  school: string;
  careerGoal: string;
  targetUniversity: string;
  targetProgram: string;
  academicStrengths: string;
  did: string;
  participated: string;
  learned: string;
  result: string;
  activities: string;
  awards: string;
  communityImpact: string;
  evidence: string;
  nextStep: string;
  language: PortfolioLanguage;
};

export type PortfolioDraft = {
  fields: PortfolioFields;
  output: string;
  generated: boolean;
  updatedAt: string;
  source?: "openai" | "local";
  model?: string;
  warning?: string;
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

export type UserAppData = {
  onboardingCompleted: boolean;
  selectedGoals: string[];
  quizAnswers: QuizAnswers;
  path: UserPath;
  portfolio: PortfolioDraft;
  savedOpportunities: string[];
};

export type UserAccount = {
  id: string;
  name: string;
  login: string;
  grade: string;
  region: string;
  language: Language;
  passwordHash?: string;
  createdAt: string;
  updatedAt: string;
  data: UserAppData;
};

export type AppJsonState = {
  version: 1;
  currentUserId: string | null;
  users: Record<string, UserAccount>;
};

export type RegisterInput = {
  name: string;
  login: string;
  password: string;
  grade: string;
  region: string;
  language: Language;
};

export type LoginInput = {
  login: string;
  password: string;
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
