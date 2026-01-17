import { cn } from "@/lib/utils"
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react"

interface TrustBadgeProps {
  score?: number
  reviewCount?: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

export function TrustBadge({ score, reviewCount, size = "md", showLabel = true }: TrustBadgeProps) {
  const numericScore = Number.isFinite(score) ? (score as number) : 0
  const level = numericScore >= 4.5 ? "high" : numericScore >= 3.5 ? "medium" : "low"

  const config = {
    high: { icon: ShieldCheck, label: "Trusted", color: "text-accent bg-accent/10" },
    medium: { icon: Shield, label: "Verified", color: "text-primary bg-primary/10" },
    low: { icon: ShieldAlert, label: "New", color: "text-muted-foreground bg-muted" },
  }

  const { icon: Icon, label, color } = config[level]

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-1",
    md: "text-sm px-2 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  }

  const iconSizes = { sm: 12, md: 14, lg: 18 }

  return (
    <div className={cn("inline-flex items-center rounded-full font-medium", color, sizeClasses[size])}>
      <Icon size={iconSizes[size]} />
      {showLabel && <span>{label}</span>}
      <span className="font-semibold">{numericScore.toFixed(1)}</span>
      {reviewCount !== undefined && <span className="text-muted-foreground">({reviewCount})</span>}
    </div>
  )
}
