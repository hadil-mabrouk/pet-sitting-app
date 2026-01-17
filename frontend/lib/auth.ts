import { apiFetch } from "@/lib/api-client"

export async function loginApi(email: string, password: string) {
  try {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!data.access_token) {
      throw new Error("Login successful but no access_token returned by the backend.")
    }
    if (typeof localStorage !== "undefined") {
      if (data.access_token) localStorage.setItem("access_token", data.access_token)
      if (data.role) localStorage.setItem("role", data.role)
    }
    return data
  } catch (err: any) {
    throw err
  }
}

export async function registerApi(payload: { name: string; email: string; password: string; role: string; city?: string }) {
  const roleUpper = (payload.role || "").toUpperCase()
  await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      full_name: payload.name,
      email: payload.email,
      password: payload.password,
      role: roleUpper,
      city: payload.city || "Tunis",
    }),
  })
  // Do not auto-login; user must verify email first
  return { message: "verification_sent" }
}

export async function meApi() {
  const res = await apiFetch("/auth/me", { method: "GET" })
  return res.json()
}

export async function verifyEmailApi(email: string, code: string) {
  const res = await apiFetch("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  })
  return res.json()
}

export async function resendVerificationApi(email: string) {
  const res = await apiFetch("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
  return res.json()
}
