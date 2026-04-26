import { mockUserPath } from "../data/path";
import { fetchApiWithFallback } from "./apiClient";
import type {
  AppJsonState,
  DesiredPath,
  GeneratedGraphExpansion,
  GraphAiText,
  ImplementationPlan,
  Language,
  LoginInput,
  PersonalizedGraph,
  PortfolioDraft,
  PortfolioFields,
  HollandResult,
  QuizAnswers,
  RegisterInput,
  UserAccount,
  UserAppData,
  UserPath
} from "../types";

const APP_KEY = "qadamgraph:app-json";
const SESSION_KEY = "qadamgraph:session-token";

export const initialPortfolioFields: PortfolioFields = {
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
  communityImpact: "The bot idea helps students and teachers receive announcements faster with weak internet",
  evidence: "Hackathon certificate, screenshots of the bot draft, teacher feedback, project description",
  nextStep: "Improve the prototype and apply to a university engineering program",
  language: "ru"
};

export function createPortfolioOutput(fields: PortfolioFields = initialPortfolioFields) {
  return [
    `Applicant snapshot: ${fields.studentName}, ${fields.grade}, ${fields.school}. Career goal: ${fields.careerGoal}.`,
    `Target fit: ${fields.targetProgram} at ${fields.targetUniversity}. Academic strengths: ${fields.academicStrengths}.`,
    `Evidence highlights: ${fields.did} through ${fields.participated}. Result: ${fields.result}.`,
    `Activities: ${fields.activities}. Awards/certificates: ${fields.awards}.`,
    `Project impact: ${fields.communityImpact}. Skills learned: ${fields.learned}.`,
    `Evidence to attach: ${fields.evidence}. Next step: ${fields.nextStep}.`
  ].join("\n\n");
}

function createDefaultUserData(): UserAppData {
  return {
    onboardingCompleted: false,
    selectedGoals: [],
    quizAnswers: {},
    careerTest: null,
    hollandResult: null,
    path: mockUserPath,
    desiredPath: null,
    portfolio: {
      fields: initialPortfolioFields,
      output: createPortfolioOutput(initialPortfolioFields),
      generated: false,
      updatedAt: new Date().toISOString()
    },
    graphTexts: {},
    actionPlans: {},
    graphExpansion: {
      nodes: [],
      edges: [],
      generatedAt: new Date().toISOString()
    },
    personalizedGraph: {
      nodes: [],
      edges: [],
      generatedAt: new Date().toISOString(),
      basedOn: {
        grade: "",
        region: "",
        language: "kk",
        selectedGoals: [],
        quizAnswers: {}
      }
    },
    savedOpportunities: []
  };
}

function createEmptyState(): AppJsonState {
  return {
    version: 1,
    currentUserId: null,
    users: {}
  };
}

export function loadAppState(): AppJsonState {
  try {
    const raw = localStorage.getItem(APP_KEY);
    return raw ? (JSON.parse(raw) as AppJsonState) : createEmptyState();
  } catch {
    return createEmptyState();
  }
}

export function saveAppState(state: AppJsonState) {
  localStorage.setItem(APP_KEY, JSON.stringify(state));
}

function saveSessionToken(token: string) {
  localStorage.setItem(SESSION_KEY, token);
}

function getSessionToken() {
  return localStorage.getItem(SESSION_KEY);
}

function clearSessionToken() {
  localStorage.removeItem(SESSION_KEY);
}

function cacheCurrentUser(user: UserAccount) {
  const state = loadAppState();

  saveAppState({
    ...state,
    currentUserId: user.id,
    users: {
      ...state.users,
      [user.id]: user
    }
  });
}

export function getCurrentUser(): UserAccount | null {
  const state = loadAppState();

  if (!state.currentUserId) return null;
  return state.users[state.currentUserId] ?? null;
}

export function logoutUser() {
  const token = getSessionToken();
  const state = loadAppState();
  saveAppState({ ...state, currentUserId: null });
  clearSessionToken();

  if (token) {
    void apiRequest("/api/auth/logout", {
      method: "POST",
      token
    }).catch(() => undefined);
  }
}

export async function registerUser(input: RegisterInput): Promise<UserAccount> {
  const backendAuth = await apiRequest<AuthPayload>("/api/auth/register", {
    method: "POST",
    body: input
  });

  if (backendAuth) {
    saveSessionToken(backendAuth.token);
    cacheCurrentUser(backendAuth.user);
    return backendAuth.user;
  }

  const state = loadAppState();
  const normalizedLogin = normalizeLogin(input.login);
  const existing = Object.values(state.users).find((user) => user.login === normalizedLogin);

  if (existing) {
    throw new Error("This login is already registered.");
  }

  const now = new Date().toISOString();
  const user: UserAccount = {
    id: createId(),
    name: input.name.trim(),
    login: normalizedLogin,
    grade: input.grade.trim(),
    region: input.region.trim(),
    language: input.language,
    passwordHash: await hashPassword(input.password),
    createdAt: now,
    updatedAt: now,
    data: createDefaultUserData()
  };

  const nextState: AppJsonState = {
    ...state,
    currentUserId: user.id,
    users: {
      ...state.users,
      [user.id]: user
    }
  };

  saveAppState(nextState);
  return user;
}

export async function loginUser(input: LoginInput): Promise<UserAccount> {
  const backendAuth = await apiRequest<AuthPayload>("/api/auth/login", {
    method: "POST",
    body: input
  });

  if (backendAuth) {
    saveSessionToken(backendAuth.token);
    cacheCurrentUser(backendAuth.user);
    return backendAuth.user;
  }

  const state = loadAppState();
  const normalizedLogin = normalizeLogin(input.login);
  const user = Object.values(state.users).find((account) => account.login === normalizedLogin);

  if (!user || user.passwordHash !== (await hashPassword(input.password))) {
    throw new Error("Invalid login or password.");
  }

  saveAppState({ ...state, currentUserId: user.id });
  return user;
}

export function updateCurrentUser(updater: (user: UserAccount) => UserAccount) {
  const state = loadAppState();

  if (!state.currentUserId) return null;
  const current = state.users[state.currentUserId];
  if (!current) return null;

  const updated = {
    ...updater(current),
    updatedAt: new Date().toISOString()
  };

  saveAppState({
    ...state,
    users: {
      ...state.users,
      [updated.id]: updated
    }
  });

  void syncUserToBackend(updated).catch(() => undefined);
  return updated;
}

export function updateUserLanguage(language: Language) {
  return updateCurrentUser((user) => ({ ...user, language }));
}

export function updateSelectedGoals(selectedGoals: string[]) {
  return updateCurrentUser((user) => ({
    ...user,
    data: {
      ...user.data,
      selectedGoals
    }
  }));
}

export function updateQuizAnswers(quizAnswers: QuizAnswers) {
  return updateCurrentUser((user) => ({
    ...user,
    data: {
      ...user.data,
      quizAnswers
    }
  }));
}

export function updateHollandResult(hollandResult: HollandResult | null) {
  return updateCurrentUser((user) => ({
    ...user,
    data: {
      ...user.data,
      hollandResult
    }
  }));
}

export function updateUserPath(path: UserPath, onboardingCompleted = false) {
  return updateCurrentUser((user) => ({
    ...user,
    data: {
      ...user.data,
      onboardingCompleted,
      path
    }
  }));
}

export function updatePortfolio(portfolio: PortfolioDraft) {
  return updateCurrentUser((user) => ({
    ...user,
    data: {
      ...user.data,
      portfolio
    }
  }));
}

export function updateDesiredPath(desiredPath: DesiredPath | null) {
  return updateCurrentUser((user) => ({
    ...user,
    data: {
      ...user.data,
      desiredPath
    }
  }));
}

export function updateSavedOpportunities(savedOpportunities: string[]) {
  return updateCurrentUser((user) => ({
    ...user,
    data: {
      ...user.data,
      savedOpportunities
    }
  }));
}

export function updateGraphText(nodeId: string, graphText: GraphAiText) {
  return updateCurrentUser((user) => ({
    ...user,
    data: {
      ...user.data,
      graphTexts: {
        ...(user.data.graphTexts ?? {}),
        [nodeId]: graphText
      }
    }
  }));
}

export function updateActionPlan(nodeId: string, actionPlan: ImplementationPlan) {
  return updateCurrentUser((user) => ({
    ...user,
    data: {
      ...user.data,
      actionPlans: {
        ...(user.data.actionPlans ?? {}),
        [nodeId]: actionPlan
      }
    }
  }));
}

export function updateGraphExpansion(graphExpansion: GeneratedGraphExpansion) {
  return updateCurrentUser((user) => ({
    ...user,
    data: {
      ...user.data,
      graphExpansion
    }
  }));
}

export function updatePersonalizedGraph(personalizedGraph: PersonalizedGraph) {
  return updateCurrentUser((user) => ({
    ...user,
    data: {
      ...user.data,
      personalizedGraph
    }
  }));
}

export function loadUserPath(): UserPath {
  return getCurrentUser()?.data.path ?? mockUserPath;
}

export function saveUserPath(path: UserPath) {
  updateUserPath(path);
}

export function refreshSavedPath() {
  const currentUser = getCurrentUser();
  const nextPath = createRecommendedPath(currentUser);

  updateUserPath(nextPath, true);
  return nextPath;
}

function createRecommendedPath(user: UserAccount | null): UserPath {
  const answers = user?.data.quizAnswers ?? {};
  const selectedGoals = user?.data.selectedGoals ?? [];
  const interest = answers.interests ?? "";
  const experience = answers.experience ?? "";
  const goal = answers.goal ?? "";
  const access = answers.access ?? "";
  const name = user?.name || mockUserPath.name;
  const grade = user?.grade || "9th grade";
  const region = user?.region || "Kazakhstan";

  const wantsGrant = goal === "Apply for a grant" || selectedGoals.includes("grants");
  const wantsContest = goal === "Win a contest" || experience === "Olympiad";
  const limitedAccess = access === "Phone only" || access === "Weak internet";

  const profile =
    interest === "Robotics" || interest === "Physics"
      ? {
          summary: "Robotics + Engineering",
          interests: [interest || "Robotics", "Physics"],
          directions: ["Robotics", "Automation", "Engineering"],
          skills: ["Physics", "IoT basics", "CAD"],
          project: "Sensor prototype / demo day",
          opportunity: wantsGrant ? "Nazarbayev University grant route" : "Satbayev engineering path",
          recommendedGraphNodeIds: wantsGrant
            ? ["you", "robotics-engineer", "robotics-iot", "robotics-sensor", "nu"]
            : ["you", "robotics-engineer", "robotics-iot", "robotics-sensor", "satbayev"]
        }
      : interest === "Business" || selectedGoals.includes("portfolio")
        ? {
            summary: "Software + Product",
            interests: [interest || "IT", "Business"],
            directions: ["Software Engineering", "Product", "Information Systems"],
            skills: ["Web basics", "Backend/API", "Product thinking"],
            project: "Local event registration app",
            opportunity: "KBTU industry track",
            recommendedGraphNodeIds: ["you", "software-engineer", "software-product", "software-hackathon", "kbtu"]
          }
        : {
            summary: wantsContest ? "AI + Olympiad track" : "AI + Engineering",
            interests: [interest || "IT", "Math"],
            directions: ["AI", "Data Science", "Computer Science"],
            skills: wantsContest ? ["Math", "Python", "English"] : ["Python", "Math", "English"],
            project: wantsContest ? "Olympiad preparation portfolio" : "Telegram bot / data dashboard",
          opportunity: wantsGrant ? "Nazarbayev University grant route" : "Astana IT University",
          recommendedGraphNodeIds: wantsGrant
            ? ["you", "ai-engineer", "algorithms", "ai-olympiad", "nu"]
            : ["you", "python-programmer", "python-basics", "telegram-bot", "aitu"]
        };

  return {
    ...mockUserPath,
    name,
    summary: profile.summary,
    interests: profile.interests,
    directions: profile.directions,
    skills: profile.skills,
    project: profile.project,
    opportunity: profile.opportunity,
    recommendedGraphNodeIds: profile.recommendedGraphNodeIds,
    savedAt: new Date().toISOString(),
    nodes: [
      {
        id: "now",
        title: "Current profile",
        description: `${grade}, ${region}, ${limitedAccess ? "low-internet path" : "stable access path"}`,
        tone: "start"
      },
      {
        id: "interests",
        title: `Interests: ${profile.interests.join(", ")}`,
        description: "Based on the diagnostic answers and selected goals.",
        tone: "interest"
      },
      {
        id: "directions",
        title: `Directions: ${profile.directions.join(", ")}`,
        description: "The graph opens the strongest route first, but alternatives stay available.",
        tone: "direction"
      },
      {
        id: "skills",
        title: `Skills: ${profile.skills.join(", ")}`,
        description: "These are the first skills that should become portfolio evidence.",
        tone: "skill"
      },
      {
        id: "project",
        title: `Project: ${profile.project}`,
        description: "A project vertex can turn into proof for admissions and scholarships.",
        tone: "project"
      },
      {
        id: "opportunity",
        title: `Target: ${profile.opportunity}`,
        description: "The endpoint can be compared by cost, funding options and fit.",
        tone: "opportunity"
      },
      {
        id: "portfolio",
        title: "Portfolio",
        description: "AI can package the selected path, evidence and results into an application draft.",
        tone: "portfolio"
      }
    ]
  };
}

function normalizeLogin(login: string) {
  return login.trim().toLowerCase();
}

function createId() {
  if ("randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function hashPassword(password: string) {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function refreshCurrentUserFromBackend() {
  const token = getSessionToken();
  if (!token) return getCurrentUser();

  const response = await apiRequest<{ user: UserAccount }>("/api/me", {
    method: "GET",
    token
  });

  if (!response) return getCurrentUser();

  cacheCurrentUser(response.user);
  return response.user;
}

type AuthPayload = {
  token: string;
  user: UserAccount;
};

type ApiRequestOptions = {
  method: "GET" | "POST" | "PATCH";
  body?: unknown;
  token?: string;
};

async function syncUserToBackend(user: UserAccount) {
  const token = getSessionToken();
  if (!token) return;

  await apiRequest("/api/me/profile", {
    method: "PATCH",
    token,
    body: {
      name: user.name,
      grade: user.grade,
      region: user.region,
      language: user.language
    }
  });

  await apiRequest("/api/me/data", {
    method: "PATCH",
    token,
    body: {
      data: user.data
    }
  });
}

async function apiRequest<T>(path: string, options: ApiRequestOptions): Promise<T | null> {
  const headers: HeadersInit = {
    "Content-Type": "application/json"
  };
  const token = options.token ?? getSessionToken();

  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetchApiWithFallback(path, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) clearSessionToken();
      throw new Error(payload.error ?? "Backend request failed");
    }

    return payload as T;
  } catch (error) {
    if (error instanceof TypeError) return null;
    throw error;
  }
}
