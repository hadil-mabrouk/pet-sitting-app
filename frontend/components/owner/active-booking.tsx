"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatusChip } from "@/components/ui/status-chip"
import { ServiceIcon, getServiceLabel } from "@/components/ui/service-icon"
import { MapView } from "@/components/map/map-view"
import type { Booking, BookingUpdate } from "@/lib/types"
import { createBookingUpdate, fetchBookingUpdates, uploadBookingUpdatePhoto } from "@/lib/api"
import { ArrowLeft, Phone, MessageCircle, MapPin, Calendar, Star, Upload } from "lucide-react"
import { format } from "date-fns"

interface ActiveBookingProps {
  booking: Booking
  onBack: () => void
  onComplete?: () => void
  isSitter?: boolean
}

export function ActiveBooking({ booking, onBack, onComplete, isSitter = false }: ActiveBookingProps) {
  const [updates, setUpdates] = useState<BookingUpdate[]>(booking.updates || [])
  const [loadingUpdates, setLoadingUpdates] = useState(false)
  const [updatePayload, setUpdatePayload] = useState<{ type: BookingUpdate["type"]; content: string; photoUrl: string }>({
    type: "note",
    content: "",
    photoUrl: "",
  })
  const [savingUpdate, setSavingUpdate] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  const safeFormat = (value: string | undefined, fmt: string) => {
    if (!value) return "--"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return "--"
    return format(d, fmt)
  }

  const loc = (booking as any).location || {}
  const lat = typeof loc.lat === "number" ? loc.lat : 36.8065
  const lng = typeof loc.lng === "number" ? loc.lng : 10.1815
  const address =
    loc.address ||
    (typeof loc === "string" ? loc : `Lat ${lat.toFixed(3)}, Lng ${lng.toFixed(3)}`) ||
    "Localisation inconnue"
  const sitterInitial = booking.sitterName ? booking.sitterName[0] : "?"
  const petName = booking.petName || "Animal"
  const sitterName = booking.sitterName || "Sitter"
  const price = booking.price ?? (booking as any).agreedPrice ?? 0
  const serviceLabel = getServiceLabel(booking.serviceType)
  const durationLabel = `${safeFormat(booking.dateStart, "dd/MM/yyyy")} - ${safeFormat(booking.dateEnd, "dd/MM/yyyy")}`
  const canAddUpdate = isSitter && ["active", "in-progress"].includes((booking.status || "").toLowerCase())

  const loadUpdates = async () => {
    setLoadingUpdates(true)
    try {
      const fresh = await fetchBookingUpdates(booking.id)
      setUpdates(fresh)
    } catch (e) {
      console.error("Failed to load updates", e)
    } finally {
      setLoadingUpdates(false)
    }
  }

  useEffect(() => {
    void loadUpdates()
  }, [booking.id])

  const handleFileChange = async (file?: File) => {
    if (!file) return
    setUploading(true)
    setUploadError(null)
    setUploadSuccess(null)
    try {
      const result = await uploadBookingUpdatePhoto(booking.id, file)
      if (result?.url) {
        setUpdatePayload((prev) => ({ ...prev, photoUrl: result.url }))
        setUploadSuccess("Photo ajoutée")
      } else {
        setUploadError("Échec de l'upload")
      }
    } catch (e) {
      console.error(e)
      setUploadError("Échec de l'upload")
    } finally {
      setUploading(false)
    }
  }

  const handleAddUpdate = async () => {
    setSavingUpdate(true)
    try {
      await createBookingUpdate(booking.id, {
        type: updatePayload.type,
        content: updatePayload.content,
        photoUrl: updatePayload.photoUrl,
      })
      await loadUpdates()
      setUpdatePayload({ type: "note", content: "", photoUrl: "" })
    } catch (e) {
      console.error("Failed to add update", e)
    } finally {
      setSavingUpdate(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={onBack} className="p-2 hover:bg-secondary rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold">Réservation active</h1>
          <StatusChip status={booking.status} size="sm" />
        </div>
      </div>

      <div className="h-56 relative rounded-b-2xl overflow-hidden shadow-inner">
        <MapView
          markers={[
            {
              id: booking.sitterId,
              lat,
              lng,
              type: "sitter",
              label: booking.sitterName,
            },
          ]}
        />
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-background">
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14">
                <AvatarImage src={booking.sitterAvatar || "/sitterAvatar.png"} />
                <AvatarFallback>{sitterInitial}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{sitterName}</p>
                <p className="text-sm text-muted-foreground">S'occupe de {petName}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-full bg-transparent">
                  <Phone size={18} />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full bg-transparent">
                  <MessageCircle size={18} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <ServiceIcon type={booking.serviceType} className="text-primary" />
              </div>
              <div>
                <p className="font-medium">{serviceLabel}</p>
                <p className="text-sm text-muted-foreground">Service</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium">{durationLabel}</p>
                <p className="text-sm text-muted-foreground">Durée</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Star size={20} className="text-accent" />
              </div>
              <div>
                <p className="font-medium">{price} TND</p>
                <p className="text-sm text-muted-foreground">Tarif convenu</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MapPin size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium">{address}</p>
                <p className="text-sm text-muted-foreground">Localisation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h3 className="font-semibold mb-3">Mises à jour</h3>
          {loadingUpdates && <p className="text-sm text-muted-foreground">Chargement...</p>}
          <div className="space-y-4">
            {updates.map((update, index) => (
              <div key={update.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  {index < updates.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    {safeFormat(update.createdAt, "dd/MM/yyyy HH:mm")}
                  </p>
                  <p className="text-xs font-semibold text-foreground uppercase">{update.type}</p>
                  <p className="text-sm">{update.content || "—"}</p>
                  {update.photoUrl && (
                    <img
                      src={update.photoUrl}
                      alt="Mise à jour"
                      className="mt-2 rounded-lg w-full max-w-xs object-cover"
                    />
                  )}
                </div>
              </div>
            ))}
            {updates.length === 0 && !loadingUpdates && (
              <p className="text-sm text-muted-foreground">Pas encore de mises à jour.</p>
            )}
          </div>
        </div>

        {canAddUpdate && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="font-semibold">Ajouter une mise à jour</p>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Type</label>
                <select
                  className="w-full rounded-md border border-border bg-background p-2 text-sm"
                  value={updatePayload.type}
                  onChange={(e) => setUpdatePayload((prev) => ({ ...prev, type: e.target.value as BookingUpdate["type"] }))}
                >
                  <option value="note">Note</option>
                  <option value="feeding">Repas</option>
                  <option value="walking">Promenade</option>
                  <option value="meds">Médicaments</option>
                  <option value="photo">Photo</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Contenu</label>
                <textarea
                  className="w-full rounded-md border border-border bg-background p-2 text-sm"
                  value={updatePayload.content}
                  onChange={(e) => setUpdatePayload((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Ex: Repas pris à 19h, balade de 20 minutes..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Photo</label>
                <div className="space-y-2">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-card text-sm cursor-pointer hover:bg-secondary">
                    <Upload size={16} />
                    <span>{uploading ? "Upload en cours..." : "Choisir un fichier"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files?.[0])}
                      disabled={uploading}
                    />
                  </label>
                  <input
                    className="w-full rounded-md border border-border bg-background p-2 text-sm"
                    value={updatePayload.photoUrl}
                    onChange={(e) => setUpdatePayload((prev) => ({ ...prev, photoUrl: e.target.value }))}
                    placeholder="Ou collez une URL https://..."
                  />
                  {uploadSuccess && <p className="text-xs text-success">{uploadSuccess}</p>}
                  {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
                </div>
              </div>
              <Button className="w-full" onClick={handleAddUpdate} disabled={savingUpdate}>
                {savingUpdate ? "Envoi..." : "Publier"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {["in-progress", "active"].includes((booking.status || "").toLowerCase()) && (
        <div className="p-4 border-t border-border">
          {onComplete ? (
            <Button className="w-full" variant="outline" onClick={() => onComplete()}>
              <Star size={18} className="mr-2" />
              Terminer et noter
            </Button>
          ) : (
            <Button className="w-full bg-transparent" variant="outline">
              <Star size={18} className="mr-2" />
              Laisser un avis après la fin
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
