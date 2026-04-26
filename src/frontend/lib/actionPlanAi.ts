import type { ImplementationPlan, Language, QuizAnswers, UserPath } from "../types";
import type { UniversityGraphNode } from "../data/universityGraph";

export type ActionPlanRequest = {
  language: Language;
  selectedGoals: string[];
  quizAnswers: QuizAnswers;
  path: UserPath;
  selectedNode: UniversityGraphNode;
};

export type OpenAiActionPlanRequest = ActionPlanRequest;

const ACTION_PLAN_API_URL = "/api/action-plan";

export async function generateActionPlan(request: ActionPlanRequest): Promise<ImplementationPlan> {
  try {
    const response = await fetch(ACTION_PLAN_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const details = await readError(response);
      throw new Error(details || `Action plan API failed with status ${response.status}`);
    }

    return sanitizeImplementationPlan((await response.json()) as ImplementationPlan, request);
  } catch {
    return createFallbackActionPlan(request);
  }
}

export function createOpenAiActionPlanRequest(request: OpenAiActionPlanRequest, model: string) {
  return {
    model,
    store: false,
    temperature: 0.35,
    max_output_tokens: 1600,
    instructions: [
      "You create concrete implementation plans for rural school students in Kazakhstan.",
      "The selected node is an ACTION node from a career path graph. Do not give general motivational advice.",
      "Write practical execution guidance that a student can follow with a phone, weak internet, school support, and limited budget.",
      "Use the selected goals, quiz answers, path data, and selected action node.",
      "Each step must be specific and must include what to do, who to talk to, expected output, and time estimate.",
      "Do not invent official deadlines, awards, guaranteed results, or paid requirements.",
      "Return only valid JSON with this exact shape:",
      "{\"goal\":\"string\",\"estimatedTime\":\"string\",\"difficulty\":\"easy|medium|hard\",\"steps\":[{\"title\":\"string\",\"whatToDo\":\"string\",\"whoToTalkTo\":\"string\",\"expectedOutput\":\"string\",\"timeEstimate\":\"string\"}],\"checklist\":[\"string\"],\"requiredPeople\":[\"string\"],\"requiredMaterials\":[\"string\"],\"risks\":[\"string\"],\"evidenceForPortfolio\":[\"string\"],\"next7Days\":[\"string\"]}."
    ].join(" "),
    input: JSON.stringify(request)
  };
}

export function createOpenAiImplementationPlan(rawText: string, request: OpenAiActionPlanRequest) {
  const parsed = JSON.parse(stripJsonFence(rawText));
  return sanitizeImplementationPlan(
    {
      goal: parsed.goal,
      estimatedTime: parsed.estimatedTime,
      difficulty: parsed.difficulty,
      steps: Array.isArray(parsed.steps) ? parsed.steps : [],
      checklist: Array.isArray(parsed.checklist) ? parsed.checklist : [],
      requiredPeople: Array.isArray(parsed.requiredPeople) ? parsed.requiredPeople : [],
      requiredMaterials: Array.isArray(parsed.requiredMaterials) ? parsed.requiredMaterials : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      evidenceForPortfolio: Array.isArray(parsed.evidenceForPortfolio)
        ? parsed.evidenceForPortfolio
        : [],
      next7Days: Array.isArray(parsed.next7Days) ? parsed.next7Days : [],
      generatedAt: new Date().toISOString()
    },
    request
  );
}

function sanitizeImplementationPlan(
  plan: ImplementationPlan,
  request: Pick<ActionPlanRequest, "selectedNode">
): ImplementationPlan {
  return {
    goal: String(plan.goal || `Complete ${request.selectedNode.title}`).slice(0, 160),
    estimatedTime: String(plan.estimatedTime || "1-2 weeks").slice(0, 60),
    difficulty: normalizeDifficulty(plan.difficulty),
    steps: (plan.steps ?? []).slice(0, 7).map((step, index) => ({
      title: String(step.title || `Step ${index + 1}`).slice(0, 80),
      whatToDo: String(step.whatToDo || "Define the task and write the first draft.").slice(0, 300),
      whoToTalkTo: String(step.whoToTalkTo || "Teacher, classmate, or mentor.").slice(0, 160),
      expectedOutput: String(step.expectedOutput || "A visible artifact for the portfolio.").slice(0, 180),
      timeEstimate: String(step.timeEstimate || "30-60 minutes").slice(0, 60)
    })),
    checklist: ensureStringArray(plan.checklist, 10),
    requiredPeople: ensureStringArray(plan.requiredPeople, 8),
    requiredMaterials: ensureStringArray(plan.requiredMaterials, 8),
    risks: ensureStringArray(plan.risks, 8),
    evidenceForPortfolio: ensureStringArray(plan.evidenceForPortfolio, 8),
    next7Days: ensureStringArray(plan.next7Days, 7),
    generatedAt: plan.generatedAt || new Date().toISOString()
  };
}

function createFallbackActionPlan(request: ActionPlanRequest): ImplementationPlan {
  const actionTitle = request.selectedNode.title;

  return {
    goal: `Complete a first practical version of "${actionTitle}" and collect proof for portfolio.`,
    estimatedTime: "7 days for first version",
    difficulty: "medium",
    steps: [
      {
        title: "Define the problem",
        whatToDo: "Write one sentence about the school, village, or student problem this action solves.",
        whoToTalkTo: "Class teacher, informatics teacher, or 2 classmates.",
        expectedOutput: "Problem statement and target user.",
        timeEstimate: "30 minutes"
      },
      {
        title: "Plan the smallest version",
        whatToDo: "Choose the smallest version that can be shown on a phone: sketch, bot flow, form, poster, or prototype.",
        whoToTalkTo: "One teammate or mentor.",
        expectedOutput: "Simple 3-5 item task list.",
        timeEstimate: "45 minutes"
      },
      {
        title: "Make the first artifact",
        whatToDo: "Create the first visible artifact: screenshot, demo text, prototype page, data table, or pitch draft.",
        whoToTalkTo: "A classmate who can test it.",
        expectedOutput: "First demo artifact.",
        timeEstimate: "2-3 hours"
      },
      {
        title: "Collect feedback",
        whatToDo: "Show the artifact to 2-3 people and write down what was unclear or useful.",
        whoToTalkTo: "Teacher, classmates, or family member.",
        expectedOutput: "Feedback notes and one improvement decision.",
        timeEstimate: "40 minutes"
      },
      {
        title: "Prepare portfolio proof",
        whatToDo: "Save screenshots, write your role, result, and what you learned.",
        whoToTalkTo: "Teacher for short validation.",
        expectedOutput: "Portfolio paragraph plus 2-3 evidence files.",
        timeEstimate: "60 minutes"
      }
    ],
    checklist: [
      "Problem written in one sentence",
      "Target user named",
      "Smallest demo version chosen",
      "First artifact created",
      "Feedback collected",
      "Screenshots saved",
      "Portfolio paragraph drafted"
    ],
    requiredPeople: ["Teacher mentor", "1-2 classmates for feedback", "Optional teammate"],
    requiredMaterials: ["Phone", "Notebook or notes app", "Internet when available", "Screenshots/photos"],
    risks: [
      "Scope becomes too large",
      "Weak internet slows research",
      "No feedback before submission",
      "Evidence is not saved"
    ],
    evidenceForPortfolio: [
      "Screenshot or photo of first artifact",
      "Short problem statement",
      "Your personal role",
      "Feedback notes",
      "Before/after improvement"
    ],
    next7Days: [
      "Day 1: define problem and user",
      "Day 2: choose smallest demo version",
      "Day 3-4: create first artifact",
      "Day 5: collect feedback",
      "Day 6: improve one thing",
      "Day 7: write portfolio proof"
    ],
    generatedAt: new Date().toISOString()
  };
}

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { error?: { message?: string } };
    return data.error?.message;
  } catch {
    return "";
  }
}

function normalizeDifficulty(value: unknown): ImplementationPlan["difficulty"] {
  if (value === "easy" || value === "medium" || value === "hard") return value;
  return "medium";
}

function ensureStringArray(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean).slice(0, limit);
}

function stripJsonFence(text: string) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}
