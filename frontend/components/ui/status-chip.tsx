import { cn } from "@/lib/utils"
import type { RequestStatus } from "@/lib/types"

interface StatusChipProps {
  status: RequestStatus | "scheduled" | "in-progress"
  size?: "sm" | "md"
}

export function StatusChip({ status, size = "md" }: StatusChipProps) {
  const labels: Record<string, string> = {
    open: "Ouvert",
    accepted: "Acceptée",
    active: "Active",
    "in-progress": "En cours",
    scheduled: "Planifiée",
    completed: "Terminée",
    cancelled: "Annulée",
  }

  const config: Record<string, { label: string; className: string }> = {
    open: { label: labels.open, className: "bg-accent/10 text-accent" },
    accepted: { label: labels.accepted, className: "bg-primary/10 text-primary" },
    active: { label: labels.active, className: "bg-chart-2/20 text-chart-2" },
    "in-progress": { label: labels["in-progress"], className: "bg-chart-2/20 text-chart-2" },
    scheduled: { label: labels.scheduled, className: "bg-primary/10 text-primary" },
    completed: { label: labels.completed, className: "bg-accent/10 text-accent" },
    cancelled: { label: labels.cancelled, className: "bg-destructive/10 text-destructive" },
  }

  const { label, className } = config[status] || config.open

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1",
        className,
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full mr-1.5",
          status === "open"
            ? "bg-accent"
            : status === "active" || status === "in-progress"
              ? "bg-chart-2"
              : "bg-current",
        )}
      />
      {label}
    </span>
  )
}
