"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrustBadge } from "@/components/ui/trust-badge"
import { MapPin, Star } from "lucide-react"

interface SitterCardProps {
  sitter: {
    id: string
    name: string
    avatar?: string
    trustScore: number
    reviewCount: number
    distance?: number
    bio?: string
    servicesOffered?: string[]
  }
  onClick?: () => void
}

export function SitterCard({ sitter, onClick }: SitterCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-14 w-14">
            <AvatarImage src={sitter.avatar || "/sitterAvatar.png"} alt={sitter.name} />
            <AvatarFallback>{sitter.name[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{sitter.name}</h3>
              <TrustBadge score={sitter.trustScore} size="sm" showLabel={false} />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span>{sitter.trustScore.toFixed(1)}</span>
              </div>
              <span>·</span>
              <span>{sitter.reviewCount} reviews</span>
              {sitter.distance && (
                <>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{sitter.distance.toFixed(1)} km</span>
                  </div>
                </>
              )}
            </div>

            {sitter.bio && <p className="text-sm text-muted-foreground line-clamp-2">{sitter.bio}</p>}

            {sitter.servicesOffered && sitter.servicesOffered.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {sitter.servicesOffered.slice(0, 3).map((service) => (
                  <span
                    key={service}
                    className="text-xs px-2 py-0.5 bg-secondary rounded-full text-secondary-foreground"
                  >
                    {service}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
