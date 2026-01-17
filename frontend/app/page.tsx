"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LandingPage } from "@/components/landing/landing-page"
import { OwnerHome } from "@/components/owner/owner-home"
import { SitterHome } from "@/components/sitter/sitter-home"
import { PawPrint, Loader2 } from "lucide-react"
import { loginApi, registerApi, meApi } from "@/lib/auth"

export type UserRole = "owner" | "sitter"

export interface Pet {
  id: string
  name: string
  type: "dog" | "cat" | "bird" | "rabbit" | "other"
  breed?: string
  age?: number
  image?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  phone?: string
  location?: { lat: number; lng: number; address: string }
  pets?: Pet[]
  trustScore?: number
  reviewCount?: number
  bio?: string
  servicesOffered?: string[]
  isAvailable?: boolean
  city?: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadMe = async () => {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("access_token") : null
      if (!token) {
        setIsLoading(false)
        return
      }
      try {
        const me = await meApi()
        setUser({
          id: String(me.id),
          name: me.name || me.full_name || "",
          email: me.email || "",
          role: (me.role || "owner").toLowerCase() === "sitter" ? "sitter" : "owner",
          avatar: me.avatar,
          trustScore: me.trust_score ?? me.avg_rating,
          reviewCount: me.review_count,
          location:
            typeof me.location === "string"
              ? { lat: 36.8065, lng: 10.1815, address: me.location }
              : me.location,
        })
      } catch (err) {
        console.error("meApi failed", err)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    loadMe()
  }, [])

  const login = async (email: string, password: string) => {
    setAuthError(null)
    try {
      await loginApi(email, password)
      const me = await meApi()
      setUser({
        id: String(me.id),
        name: me.name || me.full_name || "",
        email: me.email || "",
        role: (me.role || "owner").toLowerCase() === "sitter" ? "sitter" : "owner",
        avatar: me.avatar,
        trustScore: me.trust_score ?? me.avg_rating,
        reviewCount: me.review_count,
        location:
          typeof me.location === "string"
            ? { lat: 36.8065, lng: 10.1815, address: me.location }
            : me.location,
      })
    } catch (err: any) {
      console.error("login failed", err)
      setAuthError(err?.message || "Login failed")
      setUser(null)
    }
  }

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setAuthError(null)
    try {
      await registerApi({ name, email, password, role })
      setAuthError("Vérifie ton email pour activer ton compte.")
      router.push(`/verify-email?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      console.error("register failed", err)
      setAuthError(err?.message || "Register failed")
      setUser(null)
    }
  }

  const logout = () => setUser(null)

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <PawPrint className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">PetCare</span>
        </div>
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <LandingPage onLogin={login} onRegister={register} authError={authError ?? undefined} />
  }

  if (user.role === "sitter") {
    return <SitterHome user={user} onLogout={logout} onUpdateUser={updateUser} />
  }

  return <OwnerHome user={user} onLogout={logout} onUpdateUser={updateUser} />
}
