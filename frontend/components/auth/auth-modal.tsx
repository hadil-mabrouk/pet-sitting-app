"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PawPrint, User, Briefcase, ArrowLeft, Loader2, X, CheckCircle2, AlertCircle } from "lucide-react"

type UserRole = "owner" | "sitter"
type AuthMode = "login" | "register" | "role-select"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode: "login" | "register"
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  authError?: string
}

const validateEmail = (value: string) => {
  if (!value) return "Email requis"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email invalide"
  return ""
}
const validatePassword = (value: string) => {
  if (!value) return "Mot de passe requis"
  if (value.length < 6) return "6 caracteres minimum"
  return ""
}
const validateName = (value: string) => {
  if (!value.trim()) return "Nom requis"
  return ""
}

export function AuthModal({ isOpen, onClose, initialMode, onLogin, onRegister, authError }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode === "register" ? "role-select" : "login")
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode === "register" ? "role-select" : "login")
      setSelectedRole(null)
      setEmail("")
      setPassword("")
      setName("")
      setErrors({})
    }
  }, [isOpen, initialMode])

  const loginValid = useMemo(() => !validateEmail(email) && !validatePassword(password), [email, password])
  const registerValid = useMemo(
    () => !validateName(name) && !validateEmail(email) && !validatePassword(password) && !!selectedRole,
    [name, email, password, selectedRole],
  )

  const baseGoogleLoginUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "/api"}/auth/google/login`
  const googleLoginUrl = selectedRole ? `${baseGoogleLoginUrl}?role=${selectedRole}` : baseGoogleLoginUrl

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors: Record<string, string> = {
      email: validateEmail(email),
      password: validatePassword(password),
    }
    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) return
    setIsLoading(true)
    try {
      await onLogin(email, password)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors: Record<string, string> = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
    }
    if (!selectedRole) nextErrors.role = "Choisis un rôle"
    setErrors(nextErrors)
    if (nextErrors.name || nextErrors.email || nextErrors.password || nextErrors.role) return
    setIsLoading(true)
    try {
      await onRegister(name, email, password, selectedRole as UserRole)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setMode("register")
    setErrors((prev) => ({ ...prev, role: "" }))
  }

  const ValidIcon = ({ field }: { field: string }) =>
    !errors[field] && !!(field === "role" ? selectedRole : field === "name" ? name : field === "email" ? email : password) ? (
      <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
    ) : null

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-border"
        style={{
          backgroundImage: "url(/dog-chchiya.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="pt-8 pb-4 px-6 text-center border-b border-border bg-white/75 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <PawPrint className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">PetCare</span>
          </div>
        </div>

        <div className="p-6 bg-white/75 backdrop-blur-sm max-h-[80vh] overflow-y-auto">
          {mode === "login" && (
            <>
              <div className="text-center mb-6 p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-border shadow-sm">
                <h2 className="text-2xl font-bold text-foreground">Bienvenue</h2>
                <p className="text-muted-foreground mt-1">Connecte-toi pour continuer</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email">Email</Label>
                    <ValidIcon field="email" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="FoulenElFoulani@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setErrors((prev) => ({ ...prev, email: validateEmail(email) }))}
                    aria-invalid={!!errors.email}
                    required
                    className="h-12"
                  />
                  {errors.email && (
                    <p className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                    <ValidIcon field="password" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setErrors((prev) => ({ ...prev, password: validatePassword(password) }))}
                    aria-invalid={!!errors.password}
                    required
                    className="h-12"
                  />
                  {errors.password && (
                    <p className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password}
                    </p>
                  )}
                </div>
                {authError ? <p className="text-sm text-destructive">{authError}</p> : null}
                <Button type="submit" className="w-full h-12 text-base" disabled={isLoading || !loginValid}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Se connecter
                </Button>
              </form>

              <div className="mt-4 flex items-center">
                <div className="flex-1 h-px bg-border" />
                <span className="px-3 text-xs text-muted-foreground uppercase tracking-wide">ou</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <a href={googleLoginUrl} className="block mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-base bg-white border-primary text-primary hover:bg-primary/10"
                >
                  Continuer avec Google
                </Button>
              </a>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Pas de compte ?{" "}
                  <button onClick={() => setMode("role-select")} className="text-primary hover:underline font-medium">
                    Créer un compte
                  </button>
                </p>
              </div>
            </>
          )}

          {mode === "role-select" && (
            <>
              <div className="text-center mb-6 p-4 rounded-xl bg-white/90 backdrop-blur-md border border-border shadow-sm">
                <h2 className="text-2xl font-bold text-foreground">Choisis ton rôle</h2>
                <p className="text-muted-foreground mt-1">Propriétaire ou gardien</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => handleRoleSelect("owner")}
                  className="w-full p-4 rounded-xl border-2 border-border bg-white/75 backdrop-blur-sm hover:border-primary hover:bg-primary/5 transition-all text-left flex items-start gap-4 shadow-md"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Propriétaire</h3>
                    <p className="text-sm text-muted-foreground">Trouve un gardien de confiance</p>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect("sitter")}
                  className="w-full p-4 rounded-xl border-2 border-border bg-white/90 backdrop-blur-md hover:border-accent hover:bg-accent/5 transition-all text-left flex items-start gap-4 shadow-md"
                >
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <Briefcase className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Gardien</h3>
                    <p className="text-sm text-muted-foreground">Gagne en gardant des animaux</p>
                  </div>
                </button>
              </div>

              <div className="mt-6 text-center">
                <button onClick={() => setMode("login")} className="text-sm text-muted-foreground hover:text-foreground">
                  Déjà un compte ? Connexion
                </button>
              </div>
            </>
          )}

          {mode === "register" && (
            <>
              <button
                onClick={() => setMode("role-select")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft size={16} />
                Retour
              </button>
              <div className="text-center mb-6 p-4 rounded-xl bg-white/90 backdrop-blur-md border border-border shadow-sm">
                <h2 className="text-2xl font-bold text-foreground">Créer un compte</h2>
                <p className="text-muted-foreground mt-1">
                  Inscription en tant que {selectedRole === "owner" ? "propriétaire" : "gardien"}
                </p>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="name">Nom complet</Label>
                    <ValidIcon field="name" />
                  </div>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Foulen El Foulani"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setErrors((prev) => ({ ...prev, name: validateName(name) }))}
                    aria-invalid={!!errors.name}
                    required
                    className="h-12"
                  />
                  {errors.name && (
                    <p className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reg-email">Email</Label>
                    <ValidIcon field="email" />
                  </div>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="FoulenElFoulani@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setErrors((prev) => ({ ...prev, email: validateEmail(email) }))}
                    aria-invalid={!!errors.email}
                    required
                    className="h-12"
                  />
                  {errors.email && (
                    <p className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reg-password">Mot de passe</Label>
                    <ValidIcon field="password" />
                  </div>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setErrors((prev) => ({ ...prev, password: validatePassword(password) }))}
                    aria-invalid={!!errors.password}
                    required
                    className="h-12"
                  />
                  {errors.password && (
                    <p className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password}
                    </p>
                  )}
                </div>
                {errors.role && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="w-3 h-3" />
                    {errors.role}
                  </p>
                )}
                {authError ? <p className="text-sm text-destructive">{authError}</p> : null}
                <Button type="submit" className="w-full h-12 text-base" disabled={isLoading || !registerValid}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  S'inscrire
                </Button>

                <div className="mt-4 flex items-center">
                  <div className="flex-1 h-px bg-border" />
                  <span className="px-3 text-xs text-muted-foreground uppercase tracking-wide">ou</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <a href={googleLoginUrl} className="block mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base bg-white border-primary text-primary hover:bg-primary/10"
                  >
                    Continuer avec Google
                  </Button>
                </a>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
