import { mockUserPath } from "../data/path";
import type { UserPath } from "../types";

const PATH_KEY = "qadamgraph:user-path";

export function loadUserPath(): UserPath {
  try {
    const raw = localStorage.getItem(PATH_KEY);
    return raw ? (JSON.parse(raw) as UserPath) : mockUserPath;
  } catch {
    return mockUserPath;
  }
}

export function saveUserPath(path: UserPath) {
  localStorage.setItem(PATH_KEY, JSON.stringify(path));
}

export function refreshSavedPath() {
  const nextPath = {
    ...mockUserPath,
    savedAt: new Date().toISOString()
  };

  saveUserPath(nextPath);
  return nextPath;
}
