"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"

function CallbackContent() {
  const params = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const access = params.get("access_token")
    const refresh = params.get("refresh_token")

    if (access && refresh) {
      localStorage.setItem("access_token", access)
      localStorage.setItem("refresh_token", refresh)
      router.replace("/")
    } else {
      router.replace("/login")
    }
  }, [params, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Connexion en cours...</p>
    </div>
  )
}

export default function OAuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p>Connexion en cours...</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}
