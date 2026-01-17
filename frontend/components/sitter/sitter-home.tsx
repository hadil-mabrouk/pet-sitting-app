"use client"

import { useEffect, useMemo, useState } from "react"
import { MapView } from "@/components/map/map-view"
import { BottomSheet } from "@/components/map/bottom-sheet"
import { RequestCard } from "@/components/cards/request-card"
import { RequestDetails } from "@/components/sitter/request-details"
import { SitterProfile } from "@/components/sitter/sitter-profile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusChip } from "@/components/ui/status-chip"
import { Button } from "@/components/ui/button"
import { fetchBookingById, fetchBookings, fetchOpenRequests } from "@/lib/api"
import { parseLocation } from "@/lib/location"
import { haversineKm } from "@/lib/geo"
import { useGeolocation } from "@/lib/use-geolocation"
import { useI18n } from "@/lib/i18n"
import { getServiceLabel } from "@/components/ui/service-icon"
import { Bell, Menu, X, User, Filter, Home, Footprints, Car, AlertTriangle, ArrowLeft } from "lucide-react"
import type { Booking, ServiceRequest, ServiceType } from "@/lib/types"
import type { User as UserType } from "@/app/page"
import { ActiveBooking } from "@/components/owner/active-booking"

type SitterView = "home" | "request-details" | "profile" | "bookings"

interface SitterHomeProps {
  user: UserType
  onLogout: () => void
  onUpdateUser: (updates: Partial<UserType>) => void
}

export function SitterHome({ user, onLogout, onUpdateUser }: SitterHomeProps) {
  const { t } = useI18n()
  const [currentView, setCurrentView] = useState<SitterView>("home")
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<{
    serviceTypes: ServiceType[]
    maxDistance: number
    minPrice: number
    maxPrice: number
    city: string
  }>({
    serviceTypes: [],
    maxDistance: 15,
    minPrice: 0,
    maxPrice: 1000,
    city: "",
  })
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const { coords, loading: geoLoading } = useGeolocation()

  const loadRequests = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const [open, myBookings] = await Promise.all([fetchOpenRequests(), fetchBookings()])
      setBookings(myBookings || [])
      const activeRequestIds = new Set((myBookings || []).map((b: any) => String(b.requestId || b.request_id)))
      const filtered = (open || []).filter((r) => {
        const isOpen = (r.status || "").toLowerCase() === "open"
        return isOpen && !activeRequestIds.has(String(r.id))
      })
      setRequests(filtered)
    } catch (err) {
      console.error("Failed to load open requests", err)
      setFetchError(t("errorLoading") || "Erreur de chargement")
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRequests()
  }, [])

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (filters.serviceTypes.length > 0 && !filters.serviceTypes.includes(r.serviceType)) return false
      if (r.offeredPrice < filters.minPrice) return false
      if (r.offeredPrice > filters.maxPrice) return false
      if (filters.city) {
        const addr =
          typeof r.location === "string" ? r.location.toLowerCase() : r.location?.address?.toLowerCase() || ""
        if (!addr.includes(filters.city.toLowerCase())) return false
      }
      if (coords && filters.maxDistance > 0) {
        const parsed = parseLocation(r.location)
        if (parsed) {
          const dist = haversineKm(coords, { lat: parsed.lat, lng: parsed.lng })
          if (dist > filters.maxDistance) return false
        }
      }
      return true
    })
  }, [requests, filters, coords])

  const markers = filteredRequests
    .map((r) => {
      const loc = parseLocation(r.location)
      if (!loc) return null
      return { id: r.id, lat: loc.lat, lng: loc.lng, type: "request" as const, label: r.petName }
    })
    .filter(Boolean) as { id: string; lat: number; lng: number; type: "request"; label: string }[]

  const handleRequestClick = (request: ServiceRequest) => {
    setSelectedRequest(request)
    setCurrentView("request-details")
  }

  const toggleServiceFilter = (type: ServiceType) => {
    setFilters((prev) => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(type)
        ? prev.serviceTypes.filter((t) => t !== type)
        : [...prev.serviceTypes, type],
    }))
  }

  if (currentView === "request-details" && selectedRequest) {
    return (
      <RequestDetails
        request={selectedRequest}
        onBack={() => {
          setCurrentView("home")
          setSelectedRequest(null)
        }}
        onAccept={() => {
          setCurrentView("home")
          setSelectedRequest(null)
          void loadRequests()
        }}
      />
    )
  }

  if (currentView === "profile") {
    return <SitterProfile user={user} onBack={() => setCurrentView("home")} onUpdateUser={onUpdateUser} />
  }

  if (currentView === "bookings") {
    if (selectedBooking) {
      return <ActiveBooking booking={selectedBooking} onBack={() => setSelectedBooking(null)} isSitter />
    }

    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center gap-4 p-4 border-b border-border">
          <button onClick={() => setCurrentView("home")} className="p-2 hover:bg-secondary rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold">{t("bookings")}</h1>
            <p className="text-sm text-muted-foreground">
              {bookings.length} {t("available") ?? "disponibles"}
            </p>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {bookingLoading && <p className="text-sm text-muted-foreground">Chargement du détail...</p>}
          {bookings.map((b) => {
            const addr = typeof b.location === "string" ? b.location : b.location?.address || t("unknownLocation") || ""
            return (
              <button
                key={b.id}
                className="w-full text-left p-4 rounded-xl border bg-card shadow-sm hover:shadow-md transition"
                onClick={async () => {
                  setBookingLoading(true)
                  try {
                    const full = await fetchBookingById(b.id)
                    setSelectedBooking(full)
                  } catch (e) {
                    console.error("Failed to load booking", e)
                  } finally {
                    setBookingLoading(false)
                  }
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold">{b.petName || "Animal"}</div>
                  <StatusChip status={b.status} size="sm" />
                </div>
                <div className="text-sm text-muted-foreground">
                  {getServiceLabel(b.serviceType)} · {addr}
                </div>
                <div className="text-sm text-muted-foreground">
                  {b.dateStart ? new Date(b.dateStart).toLocaleDateString() : ""}{" "}
                  {b.dateEnd ? new Date(b.dateEnd).toLocaleDateString() : ""}
                </div>
                <div className="text-sm font-semibold mt-1">{b.price ?? (b as any).agreedPrice ?? 0} TND</div>
              </button>
            )
          })}
          {bookings.length === 0 && <p className="text-sm text-muted-foreground text-center">{t("noData")}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between">
        <button
          onClick={() => setShowMenu(true)}
          className="w-10 h-10 bg-card rounded-full shadow-md flex items-center justify-center"
        >
          <Menu size={20} />
        </button>

        <div className="bg-card px-4 py-2 rounded-full shadow-md flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${user?.isAvailable ? "bg-accent" : "bg-muted-foreground"}`} />
          <span className="text-sm font-medium">{user?.isAvailable ? t("available") : t("unavailable")}</span>
        </div>

        <button className="w-10 h-10 bg-card rounded-full shadow-md flex items-center justify-center relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
        </button>
      </div>

      {showMenu && (
        <div className="absolute inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMenu(false)} />
          <div className="relative w-72 bg-card h-full shadow-xl">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">{t("menu")}</span>
                <button onClick={() => setShowMenu(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user?.avatar || "/sitterAvatar.png"} />
                  <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-accent">
                    {t("trust")}: {user?.trustScore?.toFixed?.(1) ?? "0.0"} · {t("reviewsCount")}:{" "}
                    {user?.reviewCount ?? 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  setCurrentView("profile")
                  setShowMenu(false)
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-secondary flex items-center gap-3"
              >
                <User size={20} />
                Mon profil
              </button>
              <button
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-secondary"
                onClick={() => {
                  void loadRequests()
                  setCurrentView("bookings")
                  setShowMenu(false)
                }}
              >
                {t("bookings")}
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-secondary">{t("settings")}</button>
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-secondary text-destructive"
              >
                {t("logout")}
              </button>
            </div>
          </div>
        </div>
      )}

      <MapView
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        center={coords || { lat: 36.8065, lng: 10.1815 }}
        markers={markers}
        showRadius={!!coords}
        radiusKm={filters.maxDistance}
        onMarkerClick={(id) => {
          const request = filteredRequests.find((r) => r.id === id)
          if (request) handleRequestClick(request)
        }}
      />

      <Button
        onClick={() => setShowFilters(!showFilters)}
        variant="outline"
        className="absolute top-20 right-4 z-30 bg-card shadow-md"
        size="icon"
      >
        <Filter size={18} />
      </Button>

      {showFilters && (
        <div className="absolute top-32 right-4 z-30 w-72 bg-card rounded-xl shadow-lg p-4 space-y-3">
          <h3 className="font-semibold mb-3">Filtres</h3>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">{t("serviceType")}</p>
            <div className="flex flex-wrap gap-2">
              {[
                { type: "sitting" as ServiceType, icon: Home, label: "Garde maison" },
                { type: "walking" as ServiceType, icon: Footprints, label: "Promenade" },
                { type: "taxi" as ServiceType, icon: Car, label: "Taxi" },
                { type: "emergency" as ServiceType, icon: AlertTriangle, label: "Urgence" },
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => toggleServiceFilter(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    filters.serviceTypes.includes(type)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("city") ?? "Ville"}</p>
              <input
                className="w-full rounded-md border bg-card p-2 text-sm"
                value={filters.city}
                onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Ex: Tunis, La Marsa"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Min TND</p>
                <input
                  type="number"
                  className="w-full rounded-md border bg-card p-2 text-sm"
                  value={filters.minPrice}
                  onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: Number(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Max TND</p>
                <input
                  type="number"
                  className="w-full rounded-md border bg-card p-2 text-sm"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) || prev.maxPrice }))
                  }
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("distance") ?? "Distance (km)"}</p>
              <input
                type="number"
                className="w-full rounded-md border bg-card p-2 text-sm"
                value={filters.maxDistance}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, maxDistance: Number(e.target.value) || prev.maxDistance }))
                }
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() =>
                setFilters({ serviceTypes: [], maxDistance: 15, minPrice: 0, maxPrice: 1000, city: "" })
              }
            >
              Effacer
            </Button>
          </div>
        </div>
      )}

      <BottomSheet defaultSnap={1}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t("openRequests")}</h2>
          <span className="text-sm text-muted-foreground">
            {loading ? t("loading") : `${filteredRequests.length} disponibles`}
            {geoLoading ? " ..." : ""}
          </span>
        </div>

        {fetchError && (
          <div className="mb-3 text-sm text-destructive bg-destructive/10 rounded-md p-3">
            {fetchError}
            <Button variant="link" size="sm" className="ml-2 px-0" onClick={() => void loadRequests()}>
              {t("retry") ?? "Réessayer"}
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <RequestCard key={request.id} request={request} onClick={() => handleRequestClick(request)} />
          ))}

          {filteredRequests.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t("noData")}</p>
              <div className="flex justify-center gap-3 mt-2">
                <Button variant="outline" size="sm" onClick={() => void loadRequests()}>
                  {t("refresh") ?? "Actualiser"}
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setFilters({ serviceTypes: [], maxDistance: 15, minPrice: 0, maxPrice: 1000, city: "" })}
                >
                  {t("reset") ?? "Réinitialiser"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  )
}
