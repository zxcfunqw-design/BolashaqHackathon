import universities from "../data/universities.json";
import type { GraphAiText, Language, QuizAnswers, UserPath } from "../types";
import type { UniversityGraphNode } from "../data/universityGraph";

export type GraphTextRequest = {
  language: Language;
  selectedGoals: string[];
  quizAnswers: QuizAnswers;
  path: UserPath;
  selectedNode: UniversityGraphNode;
};

export type OpenAiGraphTextRequest = GraphTextRequest & {
  universities: typeof universities;
};

const GRAPH_TEXT_API_URL = import.meta.env.DEV
  ? "http://127.0.0.1:8787/api/graph-text"
  : "/api/graph-text";

export async function generateGraphText(request: GraphTextRequest): Promise<GraphAiText> {
  try {
    const response = await fetch(GRAPH_TEXT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...request,
        universities
      } satisfies OpenAiGraphTextRequest)
    });

    if (!response.ok) {
      const details = await readError(response);
      throw new Error(details || `Graph text API failed with status ${response.status}`);
    }

    const graphText = (await response.json()) as GraphAiText;
    if (!graphText.studentFit) throw new Error("Graph text API response is empty.");

    return graphText;
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI API unavailable.";
    return createFallbackGraphText(request, message);
  }
}

export function createOpenAiGraphTextRequest(request: OpenAiGraphTextRequest, model: string) {
  return {
    model,
    store: false,
    temperature: 0.4,
    max_output_tokens: 900,
    instructions: [
      "You create concise, practical graph-node explanations for rural school students in Kazakhstan.",
      "Use selected goals, quiz answers, path data, selected graph node, and university JSON.",
      "Adapt the text to the student. Keep it simple, realistic, mobile-readable, and supportive.",
      "Do not invent admission guarantees, scores, grants, or deadlines.",
      "Return only valid JSON with this shape:",
      "{\"nodeTitle\":\"string\",\"studentFit\":\"string\",\"whyThisPath\":[\"string\"],\"nextSteps\":[\"string\"],\"universityNotes\":[\"string\"],\"riskNote\":\"string\"}."
    ].join(" "),
    input: JSON.stringify(request)
  };
}

export function createOpenAiGraphTextDraft(rawText: string): GraphAiText {
  const parsed = JSON.parse(stripJsonFence(rawText));

  return {
    nodeTitle: String(parsed.nodeTitle ?? "Path node"),
    studentFit: String(parsed.studentFit ?? ""),
    whyThisPath: ensureStringArray(parsed.whyThisPath),
    nextSteps: ensureStringArray(parsed.nextSteps),
    universityNotes: ensureStringArray(parsed.universityNotes),
    riskNote: String(parsed.riskNote ?? "Проверь актуальные требования на официальных сайтах."),
    generatedAt: new Date().toISOString()
  };
}

function createFallbackGraphText(request: GraphTextRequest, warning: string): GraphAiText {
  const interests = request.path.interests.join(", ");
  const skills = request.path.skills.join(", ");
  const languageHint = request.language === "kk" ? "Қазақша" : "Русский";

  return {
    nodeTitle: request.selectedNode.title,
    studentFit: `${request.selectedNode.title} подходит к твоему профилю: interests ${interests}, базовые skills ${skills}. AI сейчас недоступен, поэтому использован локальный fallback. ${warning}`,
    whyThisPath: [
      `Твой выбранный путь: ${request.path.summary}.`,
      `Цели: ${request.selectedGoals.length ? request.selectedGoals.join(", ") : "career direction"}.`,
      `Язык интерфейса: ${languageHint}.`
    ],
    nextSteps: [
      "Выбери один мини-проект, который можно сделать с телефона.",
      "Собери 3 доказательства: задача, результат, чему научился.",
      "Сравни вуз по профильным предметам и формату подготовки."
    ],
    universityNotes: request.selectedNode.sourceUrl
      ? [`Проверь актуальные требования на странице: ${request.selectedNode.sourceUrl}`]
      : ["Для точного выбора вузов открой соседние university-вершины на графе."],
    riskNote: "Проверь дедлайны, профильные предметы и гранты на официальных сайтах перед подачей.",
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

function stripJsonFence(text: string) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function ensureStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean).slice(0, 5);
}
