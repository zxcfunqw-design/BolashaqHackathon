import hollandJson from "../../../holland.json";
import type { HollandResult, HollandScores, HollandTestData, HollandType } from "../types";

export const hollandTest = hollandJson as HollandTestData;

export const hollandTypes: HollandType[] = [
  "Realistic",
  "Investigative",
  "Artistic",
  "Social",
  "Enterprising",
  "Conventional"
];

export const hollandTypeLabels: Record<HollandType, string> = {
  Realistic: "Realistic",
  Investigative: "Investigative",
  Artistic: "Artistic",
  Social: "Social",
  Enterprising: "Enterprising",
  Conventional: "Conventional"
};

export const hollandTypeDescriptions: Record<HollandType, string> = {
  Realistic: "любит практические задачи, инструменты, технику и работу с реальными объектами",
  Investigative: "любит анализ, исследования, логику, эксперименты и сложные вопросы",
  Artistic: "любит создавать, выражать идеи, работать с текстом, дизайном и образами",
  Social: "любит помогать, объяснять, обучать и работать с людьми",
  Enterprising: "любит вести за собой, убеждать, запускать проекты и принимать решения",
  Conventional: "любит структуру, порядок, данные, правила и точность"
};

export function calculateHollandResult(answers: Record<number, number>): HollandResult {
  const scores = createEmptyScores();

  hollandTest.questions.forEach((question) => {
    scores[question.type] += answers[question.id] ?? 0;
  });

  const topTypes = [...hollandTypes]
    .sort((left, right) => scores[right] - scores[left])
    .slice(0, 3);
  const code = topTypes.map((type) => type[0]).join("");

  return {
    answers: Object.fromEntries(
      Object.entries(answers).map(([questionId, score]) => [questionId, score])
    ),
    scores,
    topTypes,
    code,
    agentPrompt: createAgentPrompt(topTypes, scores),
    completedAt: new Date().toISOString()
  };
}

function createEmptyScores(): HollandScores {
  return {
    Realistic: 0,
    Investigative: 0,
    Artistic: 0,
    Social: 0,
    Enterprising: 0,
    Conventional: 0
  };
}

function createAgentPrompt(topTypes: HollandType[], scores: HollandScores) {
  const profile = topTypes
    .map((type) => `${hollandTypeLabels[type]} (${scores[type]}): ${hollandTypeDescriptions[type]}`)
    .join("; ");

  return [
    `RIASEC profile: ${topTypes.map((type) => type[0]).join("")}.`,
    `Dominant traits: ${profile}.`,
    "Personalize guidance by recommending learning formats, projects, mentors and portfolio evidence that match these traits.",
    "Do not treat the Holland result as a diagnosis; use it as a lightweight preference signal."
  ].join(" ");
}
