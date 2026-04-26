import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(__dirname);

await loadEnvFiles(projectRoot);

const dbPath = join(__dirname, "data", "qadamgraph.db.json");
const port = Number(process.env.PORT ?? 8787);
const allowedOrigin = process.env.CORS_ORIGIN ?? "http://127.0.0.1:5173";
const openAiApiKey = process.env.OPENAI_API_KEY;
const openAiModel = process.env.OPENAI_MODEL ?? "gpt-5.2";
const openAiResponsesUrl = "https://api.openai.com/v1/responses";

const portfolioInstructions = [
  "You are an admissions portfolio coach for school students in Kazakhstan.",
  "Create a concise, honest university application portfolio draft from the student's data.",
  "Follow real admissions portfolio patterns: applicant snapshot, target program fit, curated evidence, project context, personal role, measurable result, skills, and next evidence to collect.",
  "Use registration data, selected goals, diagnostic answers, future career-test results, selected graph path, budget and funding options as context.",
  "Treat diagnostic and career-test results as planning signals, not as proof of ability or a guaranteed profession.",
  "Do not invent awards, grades, schools, certificates, scores, universities, test results or outcomes.",
  "If evidence is missing, write it as a next item to collect instead of pretending it exists.",
  "Return only the final portfolio text."
].join(" ");

const defaultUserData = () => ({
  onboardingCompleted: false,
  selectedGoals: [],
  quizAnswers: {},
  careerTest: null,
  hollandResult: null,
  path: {
    name: "Aruzhan",
    summary: "IT + Engineering",
    interests: ["IT", "Physics"],
    directions: ["AI", "Engineering", "Robotics"],
    skills: ["Python", "Math", "English"],
    project: "Telegram bot / sensor prototype",
    opportunity: "STEM Hackathon",
    recommendedGraphNodeIds: ["you", "python-programmer", "python-basics", "telegram-bot", "aitu"],
    savedAt: new Date().toISOString(),
    nodes: []
  },
  desiredPath: null,
  portfolio: {
    fields: {
      studentName: "Aruzhan",
      grade: "9th grade",
      school: "Rural school in Kazakhstan",
      careerGoal: "AI engineer",
      targetUniversity: "Astana IT University",
      targetProgram: "Computer Science / Artificial Intelligence",
      academicStrengths: "Math, physics, informatics and English",
      did: "Built a simple Telegram bot idea for school announcements",
      participated: "STEM Hackathon for Rural Schools",
      learned: "Python basics, project planning and explaining a problem",
      result: "Created a working draft and received teacher feedback",
      activities: "School coding club, helping classmates with informatics tasks",
      awards: "Participation certificate from the hackathon",
      communityImpact:
        "The bot idea helps students and teachers receive announcements faster with weak internet",
      evidence:
        "Hackathon certificate, screenshots of the bot draft, teacher feedback, project description",
      nextStep: "Improve the prototype and apply to a university engineering program",
      language: "ru"
    },
    output:
      "Applicant snapshot: Aruzhan, 9th grade, Rural school in Kazakhstan. Career goal: AI engineer.\n\nTarget fit: Computer Science / Artificial Intelligence at Astana IT University. Academic strengths: Math, physics, informatics and English.\n\nEvidence highlights: Built a simple Telegram bot idea for school announcements through STEM Hackathon for Rural Schools. Result: Created a working draft and received teacher feedback.\n\nActivities: School coding club, helping classmates with informatics tasks. Awards/certificates: Participation certificate from the hackathon.\n\nProject impact: The bot idea helps students and teachers receive announcements faster with weak internet. Skills learned: Python basics, project planning and explaining a problem.\n\nEvidence to attach: Hackathon certificate, screenshots of the bot draft, teacher feedback, project description. Next step: Improve the prototype and apply to a university engineering program.",
    generated: false,
    updatedAt: new Date().toISOString()
  },
  graphTexts: {},
  graphExpansion: {
    nodes: [],
    edges: [],
    generatedAt: new Date().toISOString()
  },
  savedOpportunities: []
});

async function loadEnvFiles(rootDir) {
  for (const fileName of [".env.local", ".env"]) {
    try {
      const raw = await readFile(join(rootDir, fileName), "utf8");

      raw.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;

        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex === -1) return;

        const key = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");

        if (key && process.env[key] === undefined) {
          process.env[key] = value;
        }
      });
    } catch {
      // Env files are optional in local demos.
    }
  }
}

async function loadDb() {
  try {
    const raw = await readFile(dbPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return { version: 1, users: {}, sessions: {} };
  }
}

async function saveDb(db) {
  await mkdir(dirname(dbPath), { recursive: true });
  await writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`);
}

function normalizeLogin(login) {
  return String(login ?? "").trim().toLowerCase();
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const digest = pbkdf2Sync(String(password), salt, 120000, 32, "sha256").toString("hex");
  return `${salt}:${digest}`;
}

function verifyPassword(password, stored) {
  const [salt, digest] = String(stored ?? "").split(":");
  if (!salt || !digest) return false;

  const candidate = hashPassword(password, salt).split(":")[1];
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(digest, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

function publicUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function createSession(db, userId) {
  const token = randomBytes(32).toString("hex");
  const now = new Date().toISOString();
  const session = {
    id: randomBytes(12).toString("hex"),
    userId,
    tokenHash: hash(token),
    createdAt: now,
    lastSeenAt: now
  };

  db.sessions[session.id] = session;
  return { token, session };
}

async function getRequestBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function getAuthedUser(req, db) {
  const authorization = req.headers.authorization ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return null;

  const tokenHash = hash(token);
  const session = Object.values(db.sessions).find((item) => item.tokenHash === tokenHash);
  if (!session) return null;

  session.lastSeenAt = new Date().toISOString();
  const user = db.users[session.userId];
  return user ? { user, session } : null;
}

function send(res, status, payload) {
  res.writeHead(status, {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
    Vary: "Origin"
  });
  res.end(JSON.stringify(payload));
}

function sendError(res, status, message) {
  send(res, status, { error: message });
}

function buildPortfolioPrompt(fields = {}, context = {}) {
  return [
    `Language: ${fields.language === "kk" ? "Kazakh" : fields.language === "en" ? "English" : "Russian"}`,
    "",
    "[Registration data]",
    `Registered name: ${context.account?.name || fields.studentName || "Not provided"}`,
    `Registered grade: ${context.account?.grade || fields.grade || "Not provided"}`,
    `Registered region/location: ${context.account?.region || fields.school || "Not provided"}`,
    `Interface language: ${context.account?.language || "Not provided"}`,
    "",
    "[Diagnostic and future career-test context]",
    `Selected goals: ${formatList(context.selectedGoals)}`,
    `Current diagnostic answers: ${formatRecord(context.quizAnswers)}`,
    `Future career test result: ${formatCareerTest(context)}`,
    `Holland RIASEC result: ${formatHollandResult(context)}`,
    "",
    "[Graph and financial path]",
    `Recommended path summary: ${context.path?.summary || "Not provided"}`,
    `Recommended skills: ${formatList(context.path?.skills)}`,
    `Recommended project: ${context.path?.project || "Not provided"}`,
    `Recommended opportunity: ${context.path?.opportunity || "Not provided"}`,
    `Selected desired path: ${context.desiredPath?.pathTitles?.join(" -> ") || "Not selected"}`,
    `Selected university endpoint: ${context.desiredPath?.targetTitle || "Not selected"}`,
    `Estimated path budget KZT: ${context.desiredPath?.totalCostKzt ?? "Not calculated"}`,
    `Funding options: ${formatList(context.desiredPath?.fundingOptions)}`,
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
    "If diagnostic answers conflict with manual fields, prefer the manual fields and use the diagnostic only as a planning signal."
  ].join("\n");
}

function formatList(values) {
  return Array.isArray(values) && values.length ? values.join(", ") : "Not provided";
}

function formatRecord(values) {
  if (!values || typeof values !== "object" || Object.keys(values).length === 0) {
    return "Not provided";
  }

  return Object.entries(values)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}

function formatCareerTest(context = {}) {
  const test = context.careerTest;
  if (!test) return "Not completed yet; use current diagnostic answers only as a planning signal.";

  return [
    test.resultTitle ? `result: ${test.resultTitle}` : "",
    Array.isArray(test.recommendedProfessions) && test.recommendedProfessions.length
      ? `professions: ${test.recommendedProfessions.join(", ")}`
      : "",
    Array.isArray(test.strengths) && test.strengths.length ? `strengths: ${test.strengths.join(", ")}` : "",
    Array.isArray(test.risks) && test.risks.length ? `risks: ${test.risks.join(", ")}` : "",
    test.scores ? `scores: ${formatScores(test.scores)}` : "",
    test.answers ? `answers: ${formatRecord(test.answers)}` : ""
  ]
    .filter(Boolean)
    .join("; ");
}

function formatHollandResult(context = {}) {
  const holland = context.hollandResult;
  if (!holland) return "Not completed yet.";

  return [
    holland.code ? `code: ${holland.code}` : "",
    Array.isArray(holland.topTypes) && holland.topTypes.length ? `top types: ${holland.topTypes.join(", ")}` : "",
    holland.scores ? `scores: ${formatScores(holland.scores)}` : "",
    holland.agentPrompt ? `agent prompt: ${holland.agentPrompt}` : ""
  ]
    .filter(Boolean)
    .join("; ");
}

function formatScores(values) {
  if (!values || typeof values !== "object") return "Not provided";

  return Object.entries(values)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
}

function buildGraphTextRequest(body = {}) {
  return {
    model: openAiModel,
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
    input: JSON.stringify(body)
  };
}

function buildGraphExpandRequest(body = {}) {
  return {
    model: openAiModel,
    store: false,
    temperature: 0.45,
    max_output_tokens: 1400,
    instructions: [
      "You expand a career-path graph for rural school students in Kazakhstan.",
      "Use the selected graph node, student's selected goals, quiz answers, current path, existing graph, and university JSON.",
      "Suggest 3-5 new graph nodes and 3-6 edges.",
      "Allowed node types: direction(layer 2), skill(layer 3), action(layer 4), opportunity(layer 5).",
      "Opportunities may be universities, hackathons, contests, grants, clubs, mini-projects, or portfolio milestones.",
      "Prefer Kazakhstan-relevant universities and opportunities. If not sure about a deadline, do not invent it.",
      "Every id must start with ai- and use kebab-case.",
      "Use x coordinates by layer: layer2 around 250, layer3 around 492, layer4 around 742, layer5 around 986. Use y between 40 and 640.",
      "Return only valid JSON: {\"nodes\":[{\"id\":\"string\",\"type\":\"skill\",\"layer\":3,\"title\":\"string\",\"subtitle\":\"string\",\"costKzt\":0,\"costNote\":\"string\",\"fundingOptions\":[\"string\"],\"x\":492,\"y\":120,\"details\":[\"string\"],\"sourceUrl\":\"string\",\"sourceLabel\":\"string\"}],\"edges\":[{\"id\":\"string\",\"from\":\"existing-or-new-id\",\"to\":\"new-id\",\"label\":\"string\",\"tone\":\"primary\"}]}."
    ].join(" "),
    input: JSON.stringify(body)
  };
}

function createGraphTextDraft(rawText) {
  const parsed = JSON.parse(stripJsonFence(rawText));

  return {
    nodeTitle: String(parsed.nodeTitle ?? "Path node"),
    studentFit: String(parsed.studentFit ?? ""),
    whyThisPath: ensureStringArray(parsed.whyThisPath),
    nextSteps: ensureStringArray(parsed.nextSteps),
    universityNotes: ensureStringArray(parsed.universityNotes),
    riskNote: String(
      parsed.riskNote ?? "Check current requirements on official university and opportunity pages."
    ),
    generatedAt: new Date().toISOString()
  };
}

function createGraphExpansionDraft(rawText) {
  const parsed = JSON.parse(stripJsonFence(rawText));

  return {
    nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
    edges: Array.isArray(parsed.edges) ? parsed.edges : [],
    generatedAt: new Date().toISOString()
  };
}

function stripJsonFence(text) {
  return String(text)
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function ensureStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean).slice(0, 5);
}

function extractOpenAiText(data) {
  if (typeof data?.output_text === "string") return data.output_text.trim();

  return (
    data?.output
      ?.flatMap((item) => item.content ?? [])
      .filter((content) => content.type === "output_text" && typeof content.text === "string")
      .map((content) => content.text)
      .join("\n")
      .trim() ?? ""
  );
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    send(res, 204, {});
    return;
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      send(res, 200, { ok: true });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/portfolio") {
      if (!openAiApiKey) {
        sendError(res, 500, "OpenAI key is not configured");
        return;
      }

      const body = await getRequestBody(req);
      const fields = body.fields;
      const context = body.context ?? {};

      if (!fields) {
        sendError(res, 400, "Portfolio fields are missing");
        return;
      }

      const openAiResponse = await fetch(openAiResponsesUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify({
          model: openAiModel,
          store: false,
          instructions: portfolioInstructions,
          input: buildPortfolioPrompt(fields, context)
        })
      });

      const payload = await openAiResponse.json().catch(() => ({}));

      if (!openAiResponse.ok) {
        sendError(
          res,
          openAiResponse.status,
          payload?.error?.message ?? `OpenAI request failed with status ${openAiResponse.status}`
        );
        return;
      }

      const text = extractOpenAiText(payload);

      if (!text) {
        sendError(res, 502, "OpenAI response did not include text output");
        return;
      }

      send(res, 200, {
        text,
        source: "openai",
        model: openAiModel,
        createdAt: new Date().toISOString()
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/graph-text") {
      if (!openAiApiKey) {
        sendError(res, 500, "OpenAI key is not configured");
        return;
      }

      const body = await getRequestBody(req);

      if (!body.selectedNode || !body.path || !body.universities) {
        sendError(res, 400, "Graph context is missing");
        return;
      }

      const openAiResponse = await fetch(openAiResponsesUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify(buildGraphTextRequest(body))
      });

      const payload = await openAiResponse.json().catch(() => ({}));

      if (!openAiResponse.ok) {
        sendError(
          res,
          openAiResponse.status,
          payload?.error?.message ?? `OpenAI request failed with status ${openAiResponse.status}`
        );
        return;
      }

      const text = extractOpenAiText(payload);

      if (!text) {
        sendError(res, 502, "OpenAI response did not include text output");
        return;
      }

      send(res, 200, createGraphTextDraft(text));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/graph-expand") {
      if (!openAiApiKey) {
        sendError(res, 500, "OpenAI key is not configured");
        return;
      }

      const body = await getRequestBody(req);

      if (!body.selectedNode || !body.path || !body.existingNodes || !body.existingEdges) {
        sendError(res, 400, "Graph expansion context is missing");
        return;
      }

      const openAiResponse = await fetch(openAiResponsesUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify(buildGraphExpandRequest(body))
      });

      const payload = await openAiResponse.json().catch(() => ({}));

      if (!openAiResponse.ok) {
        sendError(
          res,
          openAiResponse.status,
          payload?.error?.message ?? `OpenAI request failed with status ${openAiResponse.status}`
        );
        return;
      }

      const text = extractOpenAiText(payload);

      if (!text) {
        sendError(res, 502, "OpenAI response did not include text output");
        return;
      }

      send(res, 200, createGraphExpansionDraft(text));
      return;
    }

    const db = await loadDb();

    if (req.method === "POST" && url.pathname === "/api/auth/register") {
      const body = await getRequestBody(req);
      const login = normalizeLogin(body.login);

      if (!login || String(body.password ?? "").length < 4) {
        sendError(res, 400, "Login and password are required");
        return;
      }

      const existing = Object.values(db.users).find((user) => user.login === login);
      if (existing) {
        sendError(res, 409, "This login is already registered");
        return;
      }

      const now = new Date().toISOString();
      const user = {
        id: randomBytes(12).toString("hex"),
        name: String(body.name ?? "").trim(),
        login,
        grade: String(body.grade ?? "").trim(),
        region: String(body.region ?? "").trim(),
        language: body.language === "ru" ? "ru" : "kk",
        passwordHash: hashPassword(body.password),
        createdAt: now,
        updatedAt: now,
        data: defaultUserData()
      };

      db.users[user.id] = user;
      const { token } = createSession(db, user.id);
      await saveDb(db);

      send(res, 201, { token, user: publicUser(user) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/login") {
      const body = await getRequestBody(req);
      const login = normalizeLogin(body.login);
      const user = Object.values(db.users).find((account) => account.login === login);

      if (!user || !verifyPassword(body.password, user.passwordHash)) {
        sendError(res, 401, "Invalid login or password");
        return;
      }

      const { token } = createSession(db, user.id);
      await saveDb(db);

      send(res, 200, { token, user: publicUser(user) });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/me") {
      const authed = await getAuthedUser(req, db);
      if (!authed) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      await saveDb(db);
      send(res, 200, { user: publicUser(authed.user) });
      return;
    }

    if (req.method === "PATCH" && url.pathname === "/api/me/profile") {
      const authed = await getAuthedUser(req, db);
      if (!authed) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      const body = await getRequestBody(req);
      const user = authed.user;
      user.name = typeof body.name === "string" ? body.name.trim() : user.name;
      user.grade = typeof body.grade === "string" ? body.grade.trim() : user.grade;
      user.region = typeof body.region === "string" ? body.region.trim() : user.region;
      user.language = body.language === "ru" || body.language === "kk" ? body.language : user.language;
      user.updatedAt = new Date().toISOString();
      await saveDb(db);

      send(res, 200, { user: publicUser(user) });
      return;
    }

    if (req.method === "PATCH" && url.pathname === "/api/me/data") {
      const authed = await getAuthedUser(req, db);
      if (!authed) {
        sendError(res, 401, "Unauthorized");
        return;
      }

      const body = await getRequestBody(req);
      authed.user.data = {
        ...authed.user.data,
        ...body.data
      };
      authed.user.updatedAt = new Date().toISOString();
      await saveDb(db);

      send(res, 200, { user: publicUser(authed.user) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/logout") {
      const authorization = req.headers.authorization ?? "";
      const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
      const tokenHash = hash(token);
      for (const [id, session] of Object.entries(db.sessions)) {
        if (session.tokenHash === tokenHash) delete db.sessions[id];
      }
      await saveDb(db);
      send(res, 200, { ok: true });
      return;
    }

    sendError(res, 404, "Not found");
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Server error");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`QadamGraph backend listening on http://127.0.0.1:${port}`);
});
