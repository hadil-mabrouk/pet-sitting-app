"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { resendVerificationApi, verifyEmailApi } from "@/lib/auth"

function VerifyEmailContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    const e = params.get("email")
    if (e) setEmail(e)
  }, [params])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    const trimmed = code.trim()
    if (trimmed.length !== 6 || /\D/.test(trimmed)) {
      setError("Le code doit contenir exactement 6 chiffres.")
      return
    }
    try {
      await verifyEmailApi(email, trimmed)
      setMessage("Email vérifié ! Vous pouvez vous connecter.")
      setTimeout(() => router.push("/"), 800)
    } catch (err: any) {
      setError(err?.message || "Vérification impossible")
    }
  }

  const handleResend = async () => {
    setError(null)
    setMessage(null)
    try {
      await resendVerificationApi(email)
      setMessage("Code renvoyé.")
      setCooldown(60)
    } catch (err: any) {
      setError(err?.message || "Envoi impossible")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vérifie ton email</h1>
          <p className="text-sm text-muted-foreground">
            Saisis le code à 6 chiffres envoyé à ton adresse. Tu peux aussi renvoyer un code.
          </p>
        </div>
        {message && <p className="text-sm text-foreground">{message}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <form className="space-y-3" onSubmit={handleVerify}>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Code</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Vérifier
          </Button>
        </form>
        <Button variant="outline" disabled={!email || cooldown > 0} onClick={handleResend} className="w-full">
          {cooldown > 0 ? `Renvoyer (${cooldown}s)` : "Renvoyer le code"}
        </Button>
        <Button variant="ghost" onClick={() => router.push("/")} className="w-full">
          Retour à l'accueil
        </Button>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <p>Chargement...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
