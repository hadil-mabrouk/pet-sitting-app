// lib/api-client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api" // Next proxy rewrites /api/* to your Flask backend

function getToken() {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem("access_token");
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  // Do not send auth only on public auth routes; other /auth routes (e.g. /auth/me) need the token
  const isPublicAuth =
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/register") ||
    path.startsWith("/auth/verify-email") ||
    path.startsWith("/auth/resend-verification");
  if (token && !isPublicAuth) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "omit", // we rely on Bearer token, no cookies
  });

  if (!res.ok) {
    const text = await res.text();
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
    const err: any = new Error(parsed?.message || text || `API error ${res.status}`);
    err.status = res.status;
    err.data = parsed;
    throw err;
  }
  return res;
}
