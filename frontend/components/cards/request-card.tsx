"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusChip } from "@/components/ui/status-chip"
import { ServiceIcon, getServiceLabel } from "@/components/ui/service-icon"
import { useI18n } from "@/lib/i18n"
import type { ServiceRequest } from "@/lib/types"
import { MapPin, Calendar, DollarSign } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface RequestCardProps {
  request: ServiceRequest
  onClick?: () => void
  compact?: boolean
}

export function RequestCard({ request, onClick, compact = false }: RequestCardProps) {
  const { lang } = useI18n()
  const petName = request.petName || (request as any)?.pet?.name || "Animal"
  const rawType = request.petType || (request as any)?.pet?.type || (request as any)?.pet?.species
  const petType = rawType ? ` - ${rawType}` : ""
  const address = typeof request.location === "string" ? request.location : request.location?.address || "Localisation inconnue"

  return (
    <Card className={`cursor-pointer hover:shadow-md transition-shadow ${compact ? "p-2" : ""}`} onClick={onClick}>
      <CardContent className={compact ? "p-2" : "p-4"}>
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className={compact ? "h-12 w-12" : "h-16 w-16"}>
              <AvatarImage src={request.petImage || "/petAvatar.png"} alt={petName} />
              <AvatarFallback>{petName[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-card rounded-full flex items-center justify-center shadow-sm">
              <ServiceIcon type={request.serviceType} size={14} className="text-primary" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">
                {petName}
                {petType}
              </h3>
              <StatusChip status={request.status} size="sm" />
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {getServiceLabel(request.serviceType, lang)} • {petName}
              {request.petType ? ` (${request.petType})` : ""}
            </p>

            {!compact && (
              <>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <MapPin size={14} />
                  <span className="truncate">{address}</span>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <Calendar size={14} />
                  <span>{request.dateStart ? new Date(request.dateStart).toLocaleDateString() : ""}</span>
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 font-semibold text-accent">
                <DollarSign size={16} />
                <span>{request.offeredPrice} TND</span>
              </div>

              <span className="text-xs text-muted-foreground">
                {request.createdAt ? formatDistanceToNow(new Date(request.createdAt), { addSuffix: true }) : ""}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
