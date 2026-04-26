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

export type HollandType =
  | "Realistic"
  | "Investigative"
  | "Artistic"
  | "Social"
  | "Enterprising"
  | "Conventional";

export type HollandOption = {
  label: string;
  score: number;
};

export type HollandQuestion = {
  id: number;
  text: string;
  type: HollandType;
  options: HollandOption[];
};

export type HollandTestData = {
  test_info: {
    title: string;
    description: string;
    scoring_model: string;
  };
  questions: HollandQuestion[];
};

export type HollandScores = Record<HollandType, number>;

export type HollandResult = {
  answers: Record<string, number>;
  scores: HollandScores;
  topTypes: HollandType[];
  code: string;
  agentPrompt: string;
  completedAt: string;
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

export type GraphAiText = {
  nodeTitle: string;
  studentFit: string;
  whyThisPath: string[];
  nextSteps: string[];
  universityNotes: string[];
  riskNote: string;
  generatedAt: string;
};

export type GeneratedGraphNode = {
  id: string;
  type: "direction" | "skill" | "action" | "opportunity";
  layer: 2 | 3 | 4 | 5;
  title: string;
  subtitle: string;
  costKzt: number;
  costNote?: string;
  fundingOptions?: string[];
  x: number;
  y: number;
  details: string[];
  sourceUrl?: string;
  sourceLabel?: string;
};

export type GeneratedGraphEdge = {
  id: string;
  from: string;
  to: string;
  label?: string;
  tone?: "primary" | "blue" | "yellow" | "green" | "muted";
};

export type GeneratedGraphExpansion = {
  nodes: GeneratedGraphNode[];
  edges: GeneratedGraphEdge[];
  generatedAt: string;
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
  hollandResult: HollandResult | null;
  path: UserPath;
  portfolio: PortfolioDraft;
  graphTexts: Record<string, GraphAiText>;
  graphExpansion: GeneratedGraphExpansion;
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
