import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "data", "qadamgraph.db.json");
const port = Number(process.env.PORT ?? 8787);
const allowedOrigin = process.env.CORS_ORIGIN ?? "http://127.0.0.1:5173";

const defaultUserData = () => ({
  onboardingCompleted: false,
  selectedGoals: [],
  quizAnswers: {},
  path: {
    name: "Aruzhan",
    summary: "IT + Engineering",
    interests: ["IT", "Physics"],
    directions: ["AI", "Engineering", "Robotics"],
    skills: ["Python", "Math", "English"],
    project: "Telegram bot / sensor prototype",
    opportunity: "STEM Hackathon",
    savedAt: new Date().toISOString(),
    nodes: []
  },
  portfolio: {
    fields: {
      did: "Built a simple Telegram bot idea for school announcements",
      participated: "STEM Hackathon for Rural Schools",
      learned: "Python basics, project planning and explaining a problem",
      result: "Created a working draft and received teacher feedback"
    },
    output:
      "I participated in STEM Hackathon for Rural Schools and built a simple Telegram bot idea for school announcements. Through this work, I learned Python basics, project planning and explaining a problem. As a result, I created a working draft and received teacher feedback. This project shows my interest in technology, engineering and solving practical problems for my community.",
    generated: false,
    updatedAt: new Date().toISOString()
  },
  savedOpportunities: []
});

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
