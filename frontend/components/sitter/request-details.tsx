"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ServiceIcon, getServiceLabel } from "@/components/ui/service-icon"
import { MapView } from "@/components/map/map-view"
import { createOffer } from "@/lib/api"
import type { ServiceRequest } from "@/lib/types"
import { ArrowLeft, MapPin, Calendar, DollarSign, MessageCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"

interface RequestDetailsProps {
  request: ServiceRequest
  onBack: () => void
  onAccept: () => void
}

export function RequestDetails({ request, onBack, onAccept }: RequestDetailsProps) {
  const [showCounterOffer, setShowCounterOffer] = useState(false)
  const [counterPrice, setCounterPrice] = useState(request.offeredPrice.toString())
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const loc = (request as any).location || {}
  const lat = typeof loc.lat === "number" ? loc.lat : 36.8065
  const lng = typeof loc.lng === "number" ? loc.lng : 10.1815
  const address = loc.address || "Localisation inconnue"
  const petInitial = request.petName ? request.petName[0] : "?"
  const ownerInitial = request.ownerName ? request.ownerName[0] : "?"
  const startDate = request.dateStart ? new Date(request.dateStart) : null
  const endDate = request.dateEnd ? new Date(request.dateEnd) : null
  const startLabel = startDate && !Number.isNaN(startDate.getTime()) ? format(startDate, "MMM d, h:mm a") : "Date inconnue"
  const endLabel = endDate && !Number.isNaN(endDate.getTime()) ? format(endDate, "MMM d, h:mm a") : "Date inconnue"

  const handleSubmitOffer = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const priceNum = Number.parseFloat(counterPrice)
      const errs: Record<string, string> = {}
      if (Number.isNaN(priceNum)) errs.price = "Montant invalide"
      else if (priceNum < request.offeredPrice) errs.price = "Pas en dessous du prix demandé"
      setFieldErrors(errs)
      if (Object.values(errs).some(Boolean)) {
        setSubmitting(false)
        return
      }
      await createOffer(request.id, { price: Number.parseFloat(counterPrice), message })
      onAccept()
    } catch (err: any) {
      console.error("Failed to send offer", err)
      const msg =
        typeof err?.message === "string"
          ? err.message
          : "Impossible d'envoyer la contre-offre. Vérifie le prix ou réessaie."
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAccept = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await createOffer(request.id, { price: request.offeredPrice, message: "" })
      onAccept()
    } catch (err: any) {
      console.error("Failed to submit offer", err)
      const msg =
        typeof err?.message === "string"
          ? err.message
          : "Impossible d'envoyer l'offre. Tu as peut-être déjà proposé."
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={onBack} className="p-2 hover:bg-secondary rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold">Détail de la demande</h1>
          <p className="text-sm text-muted-foreground">{getServiceLabel(request.serviceType)}</p>
        </div>
      </div>

      <div className="h-48 relative">
        <MapView
          center={{ lat, lng }}
          markers={[
            {
              id: request.id,
              lat,
              lng,
              type: "request",
              label: request.petName,
            },
          ]}
        />
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={request.petImage || "/happy-dog-playing.jpeg"} alt={request.petName} />
                <AvatarFallback>{petInitial}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{request.petName}</h2>
                <p className="text-muted-foreground capitalize">{request.petType}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={request.ownerAvatar || "/userAvatar.png"} />
                    <AvatarFallback>{ownerInitial}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{request.ownerName}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-2xl font-bold text-accent">
                  <DollarSign size={24} />
                  <span>{request.offeredPrice}</span>
                </div>
                <p className="text-xs text-muted-foreground">TND proposé</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <ServiceIcon type={request.serviceType} className="text-primary" />
              </div>
              <div>
                <p className="font-medium">{getServiceLabel(request.serviceType)}</p>
                <p className="text-sm text-muted-foreground">Type de service</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {startLabel} - {endLabel}
                </p>
                <p className="text-sm text-muted-foreground">Date & Heure</p>
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

        {request.description && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Notes complémentaires</h3>
              <p className="text-sm text-muted-foreground">{request.description}</p>
            </CardContent>
          </Card>
        )}

        {showCounterOffer && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium">Contre-offre</h3>

              <div className="space-y-2">
                <Label htmlFor="price">Prix (TND)</Label>
                <Input
                  id="price"
                  type="number"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  min={10}
                  onBlur={() => {
                    const val = Number.parseFloat(counterPrice)
                    setFieldErrors((prev) => ({
                      ...prev,
                      price: Number.isNaN(val)
                        ? "Montant invalide"
                        : val < request.offeredPrice
                          ? "Pas en dessous du prix demandé"
                          : "",
                    }))
                  }}
                  aria-invalid={!!fieldErrors.price}
                />
                {fieldErrors.price && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.price}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (optionnel)</Label>
                <Textarea
                  id="message"
                  placeholder="Présente-toi au propriétaire..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="p-4 border-t border-border space-y-2">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {!showCounterOffer ? (
          <>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={onBack} disabled={submitting}>
                Refuser
              </Button>
              <Button
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={handleAccept}
                disabled={submitting}
              >
                Accepter ({request.offeredPrice} TND)
              </Button>
            </div>
            <Button variant="ghost" className="w-full" onClick={() => setShowCounterOffer(true)} disabled={submitting}>
              <MessageCircle size={18} className="mr-2" />
              Faire une contre-offre
            </Button>
          </>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => setShowCounterOffer(false)}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleSubmitOffer}
              disabled={submitting}
            >
              Envoyer
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
