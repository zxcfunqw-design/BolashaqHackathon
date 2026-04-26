import { fetchApiWithFallback } from "./apiClient";
import type { PortfolioFields, PortfolioGenerationContext, PortfolioLanguage } from "../types";

export type GeneratedPortfolioDraft = {
  text: string;
  source: "openai" | "local";
  createdAt: string;
  model?: string;
  warning?: string;
};

const DEFAULT_OPENAI_MODEL = "gpt-5.2";
const PORTFOLIO_API_PATH = "/api/portfolio";
const PORTFOLIO_API_URL = import.meta.env?.VITE_PORTFOLIO_API_URL;

const languageName: Record<PortfolioLanguage, string> = {
  ru: "Russian",
  kk: "Kazakh",
  en: "English"
};

const apiInstructions = [
  "You are an admissions portfolio coach for school students in Kazakhstan.",
  "Create a concise, honest university application portfolio draft from the student's data.",
  "Follow real admissions portfolio patterns: applicant snapshot, target program fit, curated evidence, project context, personal role, measurable result, skills, and next evidence to collect.",
  "Use registration data, selected goals, diagnostic answers, future career-test results, selected graph path, budget and funding options as context.",
  "Treat diagnostic and career-test results as planning signals, not as proof of ability or a guaranteed profession.",
  "Do not invent awards, grades, schools, certificates, scores, universities, test results or outcomes.",
  "If evidence is missing, write it as a next item to collect instead of pretending it exists.",
  "Use a confident but age-appropriate tone.",
  "Return only the final portfolio text. Markdown headings are allowed."
].join(" ");

export async function generatePortfolioDraft(
  fields: PortfolioFields,
  context?: PortfolioGenerationContext
): Promise<GeneratedPortfolioDraft> {
  try {
    const response = await fetchApiWithFallback(
      PORTFOLIO_API_PATH,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fields, context })
      },
      {
        overrideUrl: PORTFOLIO_API_URL
      }
    );

    if (!response.ok) {
      const details = await readError(response);
      throw new Error(details || `Portfolio API failed with status ${response.status}`);
    }

    const draft = (await response.json()) as GeneratedPortfolioDraft;

    if (!draft.text) {
      throw new Error("Portfolio API response did not include text output.");
    }

    return draft;
  } catch (error) {
    return createLocalDraft(fields, context, formatPortfolioApiWarning(error));
  }
}

export function createOpenAiPortfolioRequest(
  fields: PortfolioFields,
  model = DEFAULT_OPENAI_MODEL,
  context?: PortfolioGenerationContext
) {
  return {
    model,
    store: false,
    instructions: apiInstructions,
    input: buildPrompt(fields, context)
  };
}

export function createOpenAiPortfolioDraft(text: string, model = DEFAULT_OPENAI_MODEL): GeneratedPortfolioDraft {
  return {
    text,
    source: "openai",
    model,
    createdAt: new Date().toISOString()
  };
}

export function extractOpenAiResponseText(data: unknown) {
  return extractResponseText(data);
}

function buildPrompt(fields: PortfolioFields, context?: PortfolioGenerationContext) {
  return [
    `Language: ${languageName[fields.language]}`,
    "",
    "[Registration data]",
    `Registered name: ${context?.account?.name || fields.studentName || "Not provided"}`,
    `Registered grade: ${context?.account?.grade || fields.grade || "Not provided"}`,
    `Registered region/location: ${context?.account?.region || fields.school || "Not provided"}`,
    `Interface language: ${context?.account?.language || "Not provided"}`,
    "",
    "[Diagnostic and future career-test context]",
    `Selected goals: ${formatList(context?.selectedGoals)}`,
    `Current diagnostic answers: ${formatRecord(context?.quizAnswers)}`,
    `Future career test result: ${formatCareerTest(context)}`,
    `Holland RIASEC result: ${formatHollandResult(context)}`,
    "",
    "[Graph and financial path]",
    `Recommended path summary: ${context?.path?.summary || "Not provided"}`,
    `Recommended skills: ${formatList(context?.path?.skills)}`,
    `Recommended project: ${context?.path?.project || "Not provided"}`,
    `Recommended opportunity: ${context?.path?.opportunity || "Not provided"}`,
    `Selected desired path: ${context?.desiredPath?.pathTitles?.join(" -> ") || "Not selected"}`,
    `Selected university endpoint: ${context?.desiredPath?.targetTitle || "Not selected"}`,
    `Estimated path budget KZT: ${context?.desiredPath?.totalCostKzt ?? "Not calculated"}`,
    `Funding options: ${formatList(context?.desiredPath?.fundingOptions)}`,
    "",
    "[Manual portfolio fields]",
    `Student name: ${fields.studentName || "Not provided"}`,
    `Grade: ${fields.grade || "Not provided"}`,
    `School/location: ${fields.school || "Not provided"}`,
    `Career goal: ${fields.careerGoal || "Not provided"}`,
    `Target university: ${fields.targetUniversity || "Not provided"}`,
    `Target program: ${fields.targetProgram || "Not provided"}`,
    `Academic strengths: ${fields.academicStrengths || "Not provided"}`,
    `What the student did: ${fields.did || "Not provided"}`,
    `Where the student participated: ${fields.participated || "Not provided"}`,
    `What the student learned: ${fields.learned || "Not provided"}`,
    `Result: ${fields.result || "Not provided"}`,
    `Activities and leadership: ${fields.activities || "Not provided"}`,
    `Awards/certificates: ${fields.awards || "Not provided"}`,
    `Community impact: ${fields.communityImpact || "Not provided"}`,
    `Evidence/proof available: ${fields.evidence || "Not provided"}`,
    `Next step: ${fields.nextStep || "Not provided"}`,
    "",
    "Write 180-240 words.",
    "Use these sections: Applicant snapshot, Target fit, Evidence highlights, Project story, Skills, Next evidence.",
    "Each achievement should connect to proof, context, role, result or next evidence.",
    "If diagnostic answers conflict with manual fields, prefer the manual fields and use the diagnostic only as a planning signal.",
    "Make it useful for a university application, scholarship portfolio, or admissions interview."
  ].join("\n");
}

function extractResponseText(data: unknown) {
  if (typeof data !== "object" || data === null) return "";

  const response = data as {
    output_text?: unknown;
    output?: Array<{
      content?: Array<{
        type?: string;
        text?: unknown;
      }>;
    }>;
  };

  if (typeof response.output_text === "string") return response.output_text.trim();

  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .filter((content) => content.type === "output_text" && typeof content.text === "string")
      .map((content) => content.text as string)
      .join("\n")
      .trim() ?? ""
  );
}

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { error?: { message?: string } };
    return data.error?.message;
  } catch {
    return "";
  }
}

function formatPortfolioApiWarning(error: unknown) {
  const message = error instanceof Error ? error.message : "AI API request failed.";

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return `AI API unavailable because the device is offline. Local draft used instead. ${message}`;
  }

  if (/Failed to fetch|NetworkError|Load failed/i.test(message)) {
    return `AI API unavailable because the portfolio backend or dev proxy is not reachable. In local development, make sure the frontend on http://127.0.0.1:5173 and backend on http://127.0.0.1:8787 are both running. Local draft used instead. ${message}`;
  }

  return `AI API unavailable. Local draft used instead. ${message}`;
}

function createLocalDraft(
  fields: PortfolioFields,
  context: PortfolioGenerationContext | undefined,
  warning: string
): GeneratedPortfolioDraft {
  return {
    text: localTemplates[fields.language](fields, context),
    source: "local",
    createdAt: new Date().toISOString(),
    warning
  };
}

function formatList(values?: string[]) {
  return values?.length ? values.join(", ") : "Not provided";
}

function formatRecord(values?: Record<string, string>) {
  if (!values || Object.keys(values).length === 0) return "Not provided";

  return Object.entries(values)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}

function formatCareerTest(context?: PortfolioGenerationContext) {
  const test = context?.careerTest;
  if (!test) return "Not completed yet; use current diagnostic answers only as a planning signal.";

  return [
    test.resultTitle ? `result: ${test.resultTitle}` : "",
    test.recommendedProfessions?.length ? `professions: ${test.recommendedProfessions.join(", ")}` : "",
    test.strengths?.length ? `strengths: ${test.strengths.join(", ")}` : "",
    test.risks?.length ? `risks: ${test.risks.join(", ")}` : "",
    test.scores ? `scores: ${formatScores(test.scores)}` : "",
    test.answers ? `answers: ${formatRecord(test.answers)}` : ""
  ]
    .filter(Boolean)
    .join("; ");
}

function formatHollandResult(context?: PortfolioGenerationContext) {
  const holland = context?.hollandResult;
  if (!holland) return "Not completed yet.";

  return [
    `code: ${holland.code}`,
    holland.topTypes?.length ? `top types: ${holland.topTypes.join(", ")}` : "",
    holland.scores ? `scores: ${formatScores(holland.scores)}` : "",
    holland.agentPrompt ? `agent prompt: ${holland.agentPrompt}` : ""
  ]
    .filter(Boolean)
    .join("; ");
}

function formatScores(values: Record<string, number>) {
  return Object.entries(values)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
}

function resolveProfile(fields: PortfolioFields, context?: PortfolioGenerationContext) {
  return {
    studentName: fields.studentName || context?.account?.name || "Student",
    grade: fields.grade || context?.account?.grade || "grade not provided",
    school: fields.school || context?.account?.region || "location not provided",
    careerGoal:
      fields.careerGoal ||
      context?.careerTest?.resultTitle ||
      (context?.hollandResult ? `Holland ${context.hollandResult.code}: ${context.hollandResult.topTypes.join(", ")}` : "") ||
      context?.path?.summary ||
      "chosen career direction",
    targetUniversity: fields.targetUniversity || context?.desiredPath?.targetTitle || "",
    targetProgram: fields.targetProgram || context?.path?.summary || "relevant undergraduate program",
    academicStrengths:
      fields.academicStrengths || context?.path?.skills?.join(", ") || "subject interest and independent learning",
    nextStep:
      fields.nextStep ||
      (context?.desiredPath?.pathTitles?.length
        ? `Prepare proof for: ${context.desiredPath.pathTitles.join(" -> ")}`
        : "collect stronger project evidence")
  };
}

const localTemplates: Record<
  PortfolioLanguage,
  (fields: PortfolioFields, context?: PortfolioGenerationContext) => string
> = {
  ru: (fields, context) => {
    const profile = resolveProfile(fields, context);

    return [
      "## Профиль кандидата",
      `${profile.studentName}, ${profile.grade}, ${profile.school}. Цель: ${profile.careerGoal}.`,
      "",
      "## Соответствие программе",
      `Целевая программа: ${profile.targetProgram}${
        profile.targetUniversity ? `, ${profile.targetUniversity}` : ""
      }. Академическая база: ${profile.academicStrengths}.`,
      "",
      "## Доказательства",
      `Ключевой опыт: ${fields.did || "учебный проект"} через ${
        fields.participated || "школьную или внешнюю активность"
      }. Роль и результат: ${fields.result || "первый практический результат и обратная связь"}.`,
      `Активности: ${fields.activities || "добавить кружки, конкурсы, волонтерство или лидерские роли"}. Награды: ${
        fields.awards || "приложить подтверждения, если они есть"
      }.`,
      "",
      "## Проект и навыки",
      `Проект помог развить: ${fields.learned || "самообучение, планирование и презентацию результата"}. Влияние: ${
        fields.communityImpact || "описать, кому помог проект и какую проблему решил"
      }.`,
      "",
      "## Следующие доказательства",
      `${fields.evidence || "Собрать фото, ссылку на проект, сертификаты, отзыв учителя и описание личной роли."} Следующий шаг: ${
        profile.nextStep
      }.`
    ].join("\n");
  },
  kk: (fields, context) => {
    const profile = resolveProfile(fields, context);

    return [
      "## Үміткер профилі",
      `${profile.studentName}, ${profile.grade}, ${profile.school}. Мақсаты: ${profile.careerGoal}.`,
      "",
      "## Бағдарламаға сәйкестік",
      `Мақсатты бағдарлама: ${profile.targetProgram}${
        profile.targetUniversity ? `, ${profile.targetUniversity}` : ""
      }. Академиялық негізі: ${profile.academicStrengths}.`,
      "",
      "## Дәлелдер",
      `Негізгі тәжірибе: ${fields.did || "оқу жобасы"} арқылы ${
        fields.participated || "мектептік немесе сыртқы белсенділік"
      }. Рөлі мен нәтижесі: ${fields.result || "алғашқы практикалық нәтиже және кері байланыс"}.`,
      `Белсенділіктер: ${fields.activities || "үйірмелер, волонтерлік, конкурстар немесе лидерлік рөлдер"}. Марапаттар: ${
        fields.awards || "бар болса, дәлелдерін тіркеу керек"
      }.`,
      "",
      "## Жоба және дағдылар",
      `Жұмыс ${fields.learned || "өздігінен оқу, жоспарлау және нәтижені түсіндіру"} дағдыларын дамытты. Әсері: ${
        fields.communityImpact || "жобаның кімге көмектескенін және қандай мәселені шешкенін нақтылау"
      }.`,
      "",
      "## Келесі дәлелдер",
      `${fields.evidence || "Фото, жоба сілтемесі, сертификаттар, мұғалім пікірі және жеке рөлдің қысқаша сипаттамасын жинау."} Келесі қадам: ${
        profile.nextStep
      }.`
    ].join("\n");
  },
  en: (fields, context) => {
    const profile = resolveProfile(fields, context);

    return [
      "## Applicant snapshot",
      `${profile.studentName}, ${profile.grade}, ${profile.school}, is building a path toward ${profile.careerGoal}.`,
      "",
      "## Target fit",
      `Target path: ${profile.targetProgram}${
        profile.targetUniversity ? ` at ${profile.targetUniversity}` : ""
      }. Academic foundation: ${profile.academicStrengths}.`,
      "",
      "## Evidence highlights",
      `Main experience: ${fields.did || "a learning project"} through ${
        fields.participated || "a school or external activity"
      }. Role and result: ${fields.result || "the student created a first practical result and received feedback"}.`,
      `Additional activities: ${fields.activities || "add clubs, volunteering, contests or leadership roles"}. Awards and certificates: ${
        fields.awards || "attach proof if available"
      }.`,
      "",
      "## Project and skills",
      `This work helped develop ${fields.learned || "self-learning, planning and explaining results"}. Community impact: ${
        fields.communityImpact || "describe who benefited from the project and what problem it solved"
      }.`,
      "",
      "## Next evidence",
      `${fields.evidence || "Collect photos, a project link, certificates, teacher feedback and a short description of the personal role."} Next step: ${
        profile.nextStep
      }.`
    ].join("\n");
  }
};
