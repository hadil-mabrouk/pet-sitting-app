"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PawPrint, User, Briefcase, ArrowLeft, Loader2 } from "lucide-react"

type UserRole = "owner" | "sitter"
type AuthMode = "login" | "register" | "role-select"

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (name: string, email: string, password: string, role: UserRole) => Promise<void>
}

export function LoginPage({ onLogin, onRegister }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>("login")
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onLogin(email, password)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return
    setIsLoading(true)
    try {
      await onRegister(name, email, password, selectedRole)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setMode("register")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
          <PawPrint className="w-7 h-7 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold text-foreground">PetCare</span>
      </div>

      <Card className="w-full max-w-md">
        {mode === "login" && (
          <>
            <CardHeader className="text-center">
              <CardTitle>Connexion</CardTitle>
              <CardDescription>Connectez-vous pour continuer</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Se connecter
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Pas de compte ?{" "}
                  <button onClick={() => setMode("role-select")} className="text-primary hover:underline font-medium">
                    Créer un compte
                  </button>
                </p>
              </div>

        
            </CardContent>
          </>
        )}

        {mode === "role-select" && (
          <>
            <CardHeader className="text-center">
              <CardTitle>Choisis ton rôle</CardTitle>
              <CardDescription>Propriétaire ou gardien</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                onClick={() => handleRoleSelect("owner")}
                className="w-full p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left flex items-start gap-4"
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
                className="w-full p-4 rounded-xl border-2 border-border hover:border-accent hover:bg-accent/5 transition-all text-left flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                  <Briefcase className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Gardien</h3>
                  <p className="text-sm text-muted-foreground">Gagne en gardant des animaux</p>
                </div>
              </button>

              <div className="pt-4 text-center">
                <button
                  onClick={() => setMode("login")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Déjà un compte ?
                </button>
              </div>
            </CardContent>
          </>
        )}

        {mode === "register" && (
          <>
            <CardHeader>
              <button
                onClick={() => setMode("role-select")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
              >
                <ArrowLeft size={16} />
                Retour
              </button>
              <CardTitle>Créer un compte</CardTitle>
              <CardDescription>
                Inscription en tant que {selectedRole === "owner" ? "propriétaire" : "gardien"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jean Dupont"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Mot de passe</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  S’inscrire
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
