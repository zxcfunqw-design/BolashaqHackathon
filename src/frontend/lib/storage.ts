import { mockUserPath } from "../data/path";
import type {
  AppJsonState,
  Language,
  LoginInput,
  PortfolioDraft,
  QuizAnswers,
  RegisterInput,
  UserAccount,
  UserAppData,
  UserPath
} from "../types";

const APP_KEY = "qadamgraph:app-json";

export const initialPortfolioFields = {
  did: "Built a simple Telegram bot idea for school announcements",
  participated: "STEM Hackathon for Rural Schools",
  learned: "Python basics, project planning and explaining a problem",
  result: "Created a working draft and received teacher feedback"
};

export function createPortfolioOutput(fields = initialPortfolioFields) {
  return `I participated in ${fields.participated} and ${fields.did}. Through this work, I learned ${fields.learned}. As a result, I ${fields.result}. This project shows my interest in technology, engineering and solving practical problems for my community.`;
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

export function getCurrentUser(): UserAccount | null {
  const state = loadAppState();

  if (!state.currentUserId) return null;
  return state.users[state.currentUserId] ?? null;
}

export function logoutUser() {
  const state = loadAppState();
  saveAppState({ ...state, currentUserId: null });
}

export async function registerUser(input: RegisterInput): Promise<UserAccount> {
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
