import type { ServiceRequest } from "@/lib/types"

export type LocationParsed = { lat: number; lng: number; address?: string }

export function parseLocation(raw: ServiceRequest["location"]): LocationParsed | null {
  if (!raw) return null
  // Already structured
  if (typeof raw === "object") {
    if (typeof raw.lat === "number" && typeof raw.lng === "number") {
      return { lat: raw.lat, lng: raw.lng, address: raw.address }
    }
  }
  if (typeof raw === "string") {
    // try JSON
    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed.lat === "number" && typeof parsed.lng === "number") {
        return { lat: parsed.lat, lng: parsed.lng, address: parsed.address }
      }
    } catch {
      /* ignore */
    }
    // try "lat,lng" format
    const parts = raw.split(",").map((p) => p.trim())
    if (parts.length >= 2) {
      const lat = Number(parts[0])
      const lng = Number(parts[1])
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        const address = parts.slice(2).join(", ").trim() || undefined
        return { lat, lng, address }
      }
    }
  }
  return null
}
