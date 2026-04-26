const LOCAL_API_ORIGIN = "http://127.0.0.1:8787";

type ApiFallbackOptions = {
  overrideUrl?: string;
};

export async function fetchApiWithFallback(
  path: string,
  init?: RequestInit,
  options: ApiFallbackOptions = {}
) {
  const candidates = getApiCandidates(path, options.overrideUrl);
  let lastError: unknown = null;

  for (const url of candidates) {
    try {
      return await fetch(url, init);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("API request failed.");
}

function getApiCandidates(path: string, overrideUrl?: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const candidates = [
    overrideUrl,
    import.meta.env.VITE_API_URL ? `${trimTrailingSlash(import.meta.env.VITE_API_URL)}${normalizedPath}` : "",
    normalizedPath,
    `${LOCAL_API_ORIGIN}${normalizedPath}`
  ].filter(Boolean) as string[];

  return Array.from(new Set(candidates));
}

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}
