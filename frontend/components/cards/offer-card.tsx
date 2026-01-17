
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { TrustBadge } from "@/components/ui/trust-badge"
import type { SitterOffer } from "@/lib/types"
import { MapPin, DollarSign, MessageCircle } from "lucide-react"

interface OfferCardProps {
  offer: SitterOffer
  onAccept?: () => void
  onReject?: () => void
  locationLabel?: string
}

export function OfferCard({ offer, onAccept, onReject, locationLabel }: OfferCardProps) {
  const sitterName = offer.sitterName || "Garde"
  const sitterInitial = sitterName ? sitterName[0] : "?"
  const distanceLabel =
    typeof offer.distance === "number" && Number.isFinite(offer.distance) ? `${offer.distance.toFixed(1)} km` : null
  const priceLabel =
    typeof offer.offeredPrice === "number" && Number.isFinite(offer.offeredPrice)
      ? `${offer.offeredPrice} TND`
      : "-"
  const locationText = locationLabel || distanceLabel || "Localisation inconnue"

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Sitter Avatar */}
          <Avatar className="h-14 w-14">
            <AvatarImage src={offer.sitterAvatar || "/sitterAvatar.png"} alt={sitterName} />
            <AvatarFallback>{sitterInitial}</AvatarFallback>
          </Avatar>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{sitterName}</h3>
              <TrustBadge score={offer.sitterTrustScore} reviewCount={offer.sitterReviewCount} size="sm" />
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{locationText}</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-accent">
                <DollarSign size={14} />
                <span>{priceLabel}</span>
              </div>
            </div>

            {offer.message && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground bg-secondary rounded-lg p-2 mb-3">
                <MessageCircle size={14} className="mt-0.5 flex-shrink-0" />
                <p className="line-clamp-2">{offer.message}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={onReject}>
                Decline
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={onAccept}
              >
                Accept
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
