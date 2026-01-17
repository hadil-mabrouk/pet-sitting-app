"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { TrustBadge } from "@/components/ui/trust-badge"
import { ArrowLeft, Edit2, Camera } from "lucide-react"
import type { User } from "@/app/page"
import { useI18n } from "@/lib/i18n"
import { fetchSitterProfile, updateSitterProfile, fetchSitterReviews } from "@/lib/api"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SitterProfileProps {
  user: User
  onBack: () => void
  onUpdateUser: (updates: Partial<User>) => void
}

export function SitterProfile({ user, onBack, onUpdateUser }: SitterProfileProps) {
  const { t } = useI18n()
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true)
  const [bio, setBio] = useState(user?.bio || "")
  const [services, setServices] = useState<string[]>(user?.servicesOffered || [])
  const [basePrice, setBasePrice] = useState<number | "">((user as any)?.basePrice ?? "")
  const [city, setCity] = useState(user?.city || "")
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSitterProfile()
        setProfile(data)
        setIsAvailable(Boolean((data as any).is_available ?? (data as any).isAvailable))
        setBio((data as any).bio || "")
        setServices((data as any).services || (data as any).services_offered || (data as any).servicesOffered || [])
        setBasePrice((data as any).base_price ?? (data as any).basePrice ?? "")
        setCity((data as any).city || "")
        if (data.id) {
          const rev = await fetchSitterReviews(data.id)
          setReviews(Array.isArray(rev) ? rev : [])
        }
      } catch (err) {
        console.error("Failed to load profile", err)
        setLoadError("Impossible de charger le profil")
      }
    }
    void load()
  }, [])

  const handleAvailabilityChange = (checked: boolean) => {
    setIsAvailable(checked)
    onUpdateUser({ isAvailable: checked })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload: any = {
        bio,
        is_available: isAvailable,
        services,
        base_price: basePrice === "" ? undefined : basePrice,
        city,
      }
      const updated = await updateSitterProfile(payload)
      onUpdateUser({
        isAvailable: (updated as any).is_available ?? (updated as any).isAvailable,
        bio: updated.bio,
        servicesOffered:
          (updated as any).services || (updated as any).services_offered || (updated as any).servicesOffered,
        trustScore: (updated as any).trust_score ?? (updated as any).trustScore ?? user.trustScore,
        reviewCount: (updated as any).review_count ?? (updated as any).reviewCount ?? user.reviewCount,
        city: (updated as any).city ?? city,
      })
    } catch (err) {
      console.error("Failed to save profile", err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={onBack} className="p-2 hover:bg-secondary rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold">Mon profil</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={handleSave} disabled={saving}>
          <Edit2 size={18} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.avatar || "/userAvatar.png"} />
              <AvatarFallback className="text-2xl">{user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-md">
              <Camera size={14} />
            </button>
          </div>

          <h2 className="text-xl font-semibold">{user?.name}</h2>
          <p className="text-muted-foreground mb-3">{user?.email}</p>

          <TrustBadge score={user?.trustScore ?? 0} reviewCount={user?.reviewCount} size="lg" />
          {loadError ? <p className="text-sm text-destructive mt-2">{loadError}</p> : null}
        </div>

        <div className="px-4 space-y-4 pb-8">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Disponibilité</p>
                <p className="text-sm text-muted-foreground">
                  {isAvailable ? "Visible pour les propriétaires" : "Vous ne recevrez pas de nouvelles demandes"}
                </p>
              </div>
              <Switch checked={isAvailable} onCheckedChange={handleAvailabilityChange} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">À propos</h3>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Parlez de votre expérience, ville, disponibilités..."
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-medium mb-3">Services proposés</h3>
              <Input
                value={services.join(", ")}
                onChange={(e) => setServices(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                placeholder="Garde à domicile, Promenade, Taxi..."
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Tarif de base (TND)</Label>
                  <Input
                    type="number"
                    value={basePrice === "" ? "" : basePrice}
                    onChange={(e) => setBasePrice(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Ex: 30"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Ville</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex: Tunis" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{user?.reviewCount || 0}</p>
                <p className="text-xs text-muted-foreground">{t("reviewsCount")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{user?.trustScore?.toFixed(1) || "0.0"}</p>
                <p className="text-xs text-muted-foreground">{t("avgRating")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-accent">{profile?.completed_count ?? "—"}</p>
                <p className="text-xs text-muted-foreground">Terminées</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Avis</h3>
                <span className="text-xs text-muted-foreground">{reviews.length} avis</span>
              </div>
              {reviews.length === 0 && <p className="text-sm text-muted-foreground">Pas encore d'avis.</p>}
              {reviews.map((rev) => (
                <div key={rev.id} className="border border-border rounded-xl p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{rev.reviewer_name || "Client"}</span>
                    <span className="text-xs text-accent font-semibold">{rev.rating ?? rev.score} ★</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{rev.comment || ""}</p>
                  <p className="text-xs text-muted-foreground">
                    {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ""}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
