import { mockUserPath } from "../data/path";
import type {
  AppJsonState,
  GeneratedGraphExpansion,
  Language,
  LoginInput,
  PortfolioDraft,
  GraphAiText,
  PortfolioFields,
  QuizAnswers,
  RegisterInput,
  UserAccount,
  UserAppData,
  UserPath
} from "../types";

const APP_KEY = "qadamgraph:app-json";
const SESSION_KEY = "qadamgraph:session-token";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8787";

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
    path: mockUserPath,
    portfolio: {
      fields: initialPortfolioFields,
      output: createPortfolioOutput(initialPortfolioFields),
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
    throw new Error("Бұл login бұрын тіркелген / Этот login уже зарегистрирован");
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
    throw new Error("Login немесе құпиясөз қате / Неверный login или пароль");
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

export function updateGraphExpansion(graphExpansion: GeneratedGraphExpansion) {
  return updateCurrentUser((user) => ({
    ...user,
    data: {
      ...user.data,
      graphExpansion
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
  const nextPath = {
    ...mockUserPath,
    savedAt: new Date().toISOString()
  };

  updateUserPath(nextPath, true);
  return nextPath;
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
    const response = await fetch(`${API_BASE_URL}${path}`, {
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
