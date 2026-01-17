import { Home, Footprints, Car, AlertTriangle } from "lucide-react"
import type { ServiceType } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ServiceIconProps {
  type: ServiceType | string
  size?: number
  className?: string
}

export function ServiceIcon({ type, size = 20, className }: ServiceIconProps) {
  const icons: Record<ServiceType, any> = {
    sitting: Home,
    walking: Footprints,
    taxi: Car,
    emergency: AlertTriangle,
  }

  const iconKey: ServiceType = (["sitting", "walking", "taxi", "emergency"] as const).includes(type as ServiceType)
    ? (type as ServiceType)
    : "sitting"
  const Icon = icons[iconKey] || Home
  return <Icon size={size} className={cn(className)} />
}

export function getServiceLabel(type: ServiceType, _lang: string = "fr"): string {
  const labels: Record<ServiceType, string> = {
    sitting: "Garde à domicile",
    walking: "Promenade",
    taxi: "Taxi animaux",
    emergency: "Urgence",
  }
  return labels[type] ?? "Service"
}
