import type { PortfolioFields, PortfolioLanguage } from "../types";

export type GeneratedPortfolioDraft = {
  text: string;
  source: "openai" | "local";
  createdAt: string;
  model?: string;
  warning?: string;
};

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_OPENAI_MODEL = "gpt-5.2";
const PORTFOLIO_API_URL = "/api/portfolio";

const languageName: Record<PortfolioLanguage, string> = {
  ru: "Russian",
  kk: "Kazakh",
  en: "English"
};

const apiInstructions = [
  "You are an admissions portfolio coach for school students in Kazakhstan.",
  "Create a concise, honest university application portfolio draft from the student's data.",
  "Follow real admissions portfolio patterns: applicant snapshot, target program fit, curated evidence, project context, personal role, measurable result, skills, and next evidence to collect.",
  "Do not invent awards, grades, schools, certificates, scores, or universities.",
  "If evidence is missing, write it as a next item to collect instead of pretending it exists.",
  "Use a confident but age-appropriate tone.",
  "Return only the final portfolio text. Markdown headings are allowed."
].join(" ");

export async function generatePortfolioDraft(fields: PortfolioFields): Promise<GeneratedPortfolioDraft> {
  try {
    const response = await fetch(PORTFOLIO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fields })
    });

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
    const message = error instanceof Error ? error.message : "AI API request failed.";
    return createLocalDraft(fields, `AI API unavailable. Local draft used instead. ${message}`);
  }
}

export function createOpenAiPortfolioRequest(fields: PortfolioFields, model = DEFAULT_OPENAI_MODEL) {
  return {
    model,
    store: false,
    instructions: apiInstructions,
    input: buildPrompt(fields)
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

function buildPrompt(fields: PortfolioFields) {
  return [
    `Language: ${languageName[fields.language]}`,
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
    "Each achievement should connect to proof, context, role, or result.",
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

function createLocalDraft(fields: PortfolioFields, warning: string): GeneratedPortfolioDraft {
  return {
    text: localTemplates[fields.language](fields),
    source: "local",
    createdAt: new Date().toISOString(),
    warning
  };
}

const localTemplates: Record<PortfolioLanguage, (fields: PortfolioFields) => string> = {
  ru: (fields) =>
    [
      `## Профиль кандидата`,
      `${fields.studentName || "Ученик"}${fields.grade ? `, ${fields.grade}` : ""}${
        fields.school ? `, ${fields.school}` : ""
      } стремится развиваться в направлении "${fields.careerGoal || "выбранная профессия"}".`,
      "",
      `## Соответствие программе`,
      `Целевая траектория: ${fields.targetProgram || fields.careerGoal || "подходящая программа"}${
        fields.targetUniversity ? ` в ${fields.targetUniversity}` : ""
      }. Академическая база: ${fields.academicStrengths || "предметные интересы и самостоятельное обучение"}.`,
      "",
      `## Доказательства`,
      `Ключевой опыт: ${fields.did || "учебный проект"} в рамках ${
        fields.participated || "школьной или внешней активности"
      }. Роль и результат: ${fields.result || "получен первый практический результат и обратная связь"}.`,
      "",
      `Дополнительные активности: ${fields.activities || "нужно добавить кружки, волонтерство, конкурсы или лидерские роли"}. Награды и сертификаты: ${fields.awards || "нужно приложить подтверждения, если они есть"}.`,
      "",
      `## Проект и навыки`,
      `Работа помогла развить ${fields.learned || "самостоятельное обучение, планирование и презентацию результата"}. Влияние на сообщество: ${fields.communityImpact || "пока нужно описать, кому помог проект и какую проблему решил"}.`,
      "",
      `## Следующие доказательства`,
      `${fields.evidence || "Собрать фото, ссылку на проект, сертификаты, отзыв учителя и короткое описание личной роли."} Следующий шаг: ${fields.nextStep || "улучшить проект и подготовить его к подаче в портфолио"}.`
    ].join("\n"),
  kk: (fields) =>
    [
      `## Үміткер профилі`,
      `${fields.studentName || "Оқушы"}${fields.grade ? `, ${fields.grade}` : ""}${
        fields.school ? `, ${fields.school}` : ""
      } "${fields.careerGoal || "таңдалған мамандық"}" бағыты бойынша дамуға ұмтылады.`,
      "",
      `## Бағдарламаға сәйкестік`,
      `Мақсатты бағыт: ${fields.targetProgram || fields.careerGoal || "сәйкес бағдарлама"}${
        fields.targetUniversity ? `, ${fields.targetUniversity}` : ""
      }. Академиялық негізі: ${fields.academicStrengths || "пәндік қызығушылықтар және өздігінен оқу"}.`,
      "",
      `## Дәлелдер`,
      `Негізгі тәжірибе: ${fields.did || "оқу жобасы"} және ${
        fields.participated || "мектептік немесе сыртқы белсенділік"
      }. Рөлі мен нәтижесі: ${fields.result || "алғашқы практикалық нәтиже мен кері байланыс алды"}.`,
      "",
      `Қосымша белсенділіктер: ${fields.activities || "үйірмелер, волонтерлік, конкурстар немесе лидерлік рөлдерді қосу керек"}. Марапаттар мен сертификаттар: ${fields.awards || "бар болса, дәлелдерін тіркеу керек"}.`,
      "",
      `## Жоба және дағдылар`,
      `Бұл жұмыс ${fields.learned || "өздігінен оқу, жоспарлау және нәтижені түсіндіру"} дағдыларын дамытты. Қоғамға әсері: ${fields.communityImpact || "жобаның кімге көмектескенін және қандай мәселені шешкенін нақтылау керек"}.`,
      "",
      `## Келесі дәлелдер`,
      `${fields.evidence || "Фото, жоба сілтемесі, сертификаттар, мұғалім пікірі және жеке рөлдің қысқаша сипаттамасын жинау."} Келесі қадам: ${fields.nextStep || "жобаны жақсартып, портфолиоға дайындау"}.`
    ].join("\n"),
  en: (fields) =>
    [
      `## Applicant snapshot`,
      `${fields.studentName || "The student"}${fields.grade ? `, ${fields.grade}` : ""}${
        fields.school ? `, ${fields.school}` : ""
      }, is building a path toward ${fields.careerGoal || "the chosen career direction"}.`,
      "",
      `## Target fit`,
      `Target path: ${fields.targetProgram || fields.careerGoal || "a relevant program"}${
        fields.targetUniversity ? ` at ${fields.targetUniversity}` : ""
      }. Academic foundation: ${fields.academicStrengths || "subject interest and independent learning"}.`,
      "",
      `## Evidence highlights`,
      `Main experience: ${fields.did || "a learning project"} through ${
        fields.participated || "a school or external activity"
      }. Role and result: ${fields.result || "the student created a first practical result and received feedback"}.`,
      "",
      `Additional activities: ${fields.activities || "add clubs, volunteering, contests or leadership roles"}. Awards and certificates: ${fields.awards || "attach proof if available"}.`,
      "",
      `## Project and skills`,
      `This work helped develop ${fields.learned || "self-learning, planning and explaining results"}. Community impact: ${fields.communityImpact || "describe who benefited from the project and what problem it solved"}.`,
      "",
      `## Next evidence`,
      `${fields.evidence || "Collect photos, a project link, certificates, teacher feedback and a short description of the personal role."} Next step: ${fields.nextStep || "improve the project and prepare it for portfolio submission"}.`
    ].join("\n")
};
