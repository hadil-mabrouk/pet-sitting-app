"use client"

import { useEffect, useMemo, useState } from "react"
import { MapView } from "@/components/map/map-view"
import { BottomSheet } from "@/components/map/bottom-sheet"
import { RequestCard } from "@/components/cards/request-card"
import { OfferCard } from "@/components/cards/offer-card"
import { CreateRequestFlow } from "@/components/owner/create-request-flow"
import { PetsPage } from "@/components/owner/pets-page"
import { ActiveBooking } from "@/components/owner/active-booking"
import { ReviewForm } from "@/components/review/review-form"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  fetchSitters,
  fetchMyRequests,
  fetchOffersByRequest,
  acceptOffer,
  rejectOffer,
  fetchBookings,
  completeBooking,
  sendReview,
} from "@/lib/api"
import { useGeolocation } from "@/lib/use-geolocation"
import { Plus, Bell, Menu, X, ArrowLeft } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import type { ServiceRequest, SitterOffer, SitterProfile } from "@/lib/types"
import type { User } from "@/app/page"
import { StatusChip } from "@/components/ui/status-chip"

type OwnerView =
  | "home"
  | "create-request"
  | "view-offers"
  | "active-booking"
  | "pets"
  | "requests-list"
  | "bookings-list"
  | "review"

interface OwnerHomeProps {
  user: User
  onLogout: () => void
  onUpdateUser: (updates: Partial<User>) => void
}

export function OwnerHome({ user, onLogout, onUpdateUser }: OwnerHomeProps) {
  const { t } = useI18n()
  const [currentView, setCurrentView] = useState<OwnerView>("home")
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [sitters, setSitters] = useState<SitterProfile[]>([])
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [offers, setOffers] = useState<SitterOffer[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const { coords } = useGeolocation()

  const loadData = async () => {
    try {
      const data = await fetchSitters()
      setSitters(data)
    } catch (err) {
      console.error("Failed to load sitters", err)
      setSitters([])
    }
    try {
      const data = await fetchMyRequests()
      setRequests(data)
    } catch (err) {
      console.error("Failed to load requests", err)
      setRequests([])
    }
    try {
      const data = await fetchBookings()
      setBookings(data as any)
    } catch (err) {
      console.error("Failed to load bookings", err)
      setBookings([])
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const userRequests = useMemo(() => {
    return requests.filter((r) => {
      const isOpen = (r.status || "").toLowerCase() === "open"
      const hasBooking = bookings.some((b) => String(b.requestId) === String(r.id))
      return isOpen && !hasBooking
    })
  }, [requests, bookings])
  const markers = sitters
    .map((s) => {
      const lat = (s as any).lat ?? (s as any).location?.lat
      const lng = (s as any).lng ?? (s as any).location?.lng
      if (!lat || !lng) return null
      return { id: s.id, lat, lng, type: "sitter" as const, label: s.name || "Sitter" }
    })
    .filter(Boolean) as { id: string; lat: number; lng: number; type: "sitter"; label: string }[]

  const handleRequestClick = (request: ServiceRequest) => {
    setSelectedRequest(request)
    setCurrentView("view-offers")
    fetchOffersByRequest(request.id)
      .then(setOffers)
      .catch(() => setOffers([]))
  }

  const handleAcceptOffer = async (offer: SitterOffer) => {
    try {
      await acceptOffer(offer.id)
      const updatedBookings = await fetchBookings()
      setBookings(updatedBookings as any)
      await loadData()
      setCurrentView(updatedBookings && updatedBookings.length > 0 ? "active-booking" : "home")
    } catch (err) {
      console.error(err)
      setCurrentView("home")
    } finally {
      setSelectedRequest(null)
    }
  }

  const handleRejectOffer = async (offer: SitterOffer) => {
    await rejectOffer(offer.id).catch((err) => console.error(err))
    setOffers((prev) => prev.filter((o) => o.id !== offer.id))
  }

  const goToBookings = () => {
    setCurrentView("bookings-list")
  }

  if (currentView === "create-request") {
    return (
      <CreateRequestFlow
        user={user}
        onClose={() => setCurrentView("home")}
        onSubmit={async () => {
          await loadData()
          setCurrentView("home")
        }}
        onUpdateUser={onUpdateUser}
      />
    )
  }

  if (currentView === "pets") {
    return (
      <PetsPage
        onBack={() => setCurrentView("home")}
        onUpdated={(updated) => onUpdateUser?.({ pets: updated as any })}
      />
    )
  }

  if (currentView === "requests-list") {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center gap-4 p-4 border-b border-border">
          <button onClick={() => setCurrentView("home")} className="p-2 hover:bg-secondary rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold">{t("myRequests")}</h1>
            <p className="text-sm text-muted-foreground">{requests.length} demandes</p>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {requests.map((req) => (
            <RequestCard key={req.id} request={req} onClick={() => handleRequestClick(req)} />
          ))}
          {requests.length === 0 && <p className="text-sm text-muted-foreground text-center">Aucune demande.</p>}
        </div>
      </div>
    )
  }

  if (currentView === "bookings-list") {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center gap-4 p-4 border-b border-border">
          <button onClick={() => setCurrentView("home")} className="p-2 hover:bg-secondary rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold">{t("bookings")}</h1>
            <p className="text-sm text-muted-foreground">{bookings.length} réservations</p>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="p-4 rounded-xl border bg-card shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-semibold">{b.petName || "Animal"}</p>
                  <p className="text-sm text-muted-foreground">{b.sitterName}</p>
                </div>
                <StatusChip status={b.status} size="sm" />
              </div>
              <p className="text-sm text-muted-foreground">
                {b.location?.address || (typeof b.location === "string" ? b.location : "Localisation inconnue")}
              </p>
              <p className="text-sm text-muted-foreground">
                {b.dateStart ? new Date(b.dateStart).toLocaleDateString() : ""} →{" "}
                {b.dateEnd ? new Date(b.dateEnd).toLocaleDateString() : ""}
              </p>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedBooking(b)
                    setCurrentView("active-booking")
                  }}
                >
                  Détails
                </Button>
                {b.status && (b.status === "in-progress" || b.status.toLowerCase() === "active") && (
                  <Button
                    size="sm"
                    onClick={async () => {
                      await completeBooking(b.id)
                      const updated = await fetchBookings()
                      setBookings(updated as any)
                    }}
                  >
                    Terminer
                  </Button>
                )}
                {b.status && b.status.toLowerCase() === "completed" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedBooking(b)
                      setCurrentView("review")
                    }}
                  >
                    Noter le gardien
                  </Button>
                )}
              </div>
            </div>
          ))}
          {bookings.length === 0 && <p className="text-sm text-muted-foreground text-center">Aucune réservation.</p>}
        </div>
      </div>
    )
  }

  if (currentView === "review" && selectedBooking) {
    return (
      <ReviewForm
        targetName={selectedBooking.sitterName || "Sitter"}
        targetAvatar={selectedBooking.sitterAvatar}
        petName={selectedBooking.petName || "Animal"}
        onSubmit={async (rating, comment) => {
          await sendReview(selectedBooking.id, { rating, comment })
          setCurrentView("home")
          const updated = await fetchBookings()
          setBookings(updated as any)
          setSelectedBooking(null)
        }}
        onBack={() => setCurrentView("home")}
      />
    )
  }

  if (currentView === "active-booking" && (selectedBooking || bookings[0])) {
    const bookingToShow = selectedBooking || bookings[0]
    return (
      <ActiveBooking
        booking={bookingToShow}
        onBack={() => {
          setSelectedBooking(null)
          setCurrentView("home")
        }}
        onComplete={async () => {
          await completeBooking(bookingToShow.id)
          const updated = await fetchBookings()
          setBookings(updated as any)
          setSelectedBooking(bookingToShow)
          setCurrentView("review")
        }}
      />
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

        <div className="bg-card px-4 py-2 rounded-full shadow-md">
          <span className="text-sm font-medium">Grand Tunis</span>
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
                  <AvatarImage src={user?.avatar || "/userAvatar.png"} />
                  <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">Propriétaire</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <button
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-secondary"
                onClick={() => {
                  setShowMenu(false)
                  setCurrentView("pets")
                }}
              >
                {t("myPets")}
              </button>
              <button
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-secondary"
                onClick={() => {
                  setShowMenu(false)
                  setCurrentView("requests-list")
                }}
              >
                {t("myRequests")}
              </button>
              <button
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-secondary"
                onClick={() => goToBookings()}
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
        radiusKm={5}
      />

      <Button
        onClick={() => setCurrentView("create-request")}
        className="fixed w-14 h-14 rounded-full shadow-xl bg-accent hover:bg-accent/90 border border-accent/40 z-50"
        style={{ bottom: "6rem", right: "1.25rem" }}
        size="icon"
        aria-label={t("createRequest")}
      >
        <Plus size={24} />
      </Button>

      <BottomSheet defaultSnap={1}>
        {currentView === "view-offers" && selectedRequest ? (
          <div>
            <button
              onClick={() => {
                setCurrentView("home")
                setSelectedRequest(null)
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground mb-4"
            >
              <ArrowLeft size={16} />
              Retour aux demandes
            </button>

            <h2 className="text-lg font-semibold mb-1">
              {t("offers")} · {selectedRequest.petName}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">{offers.length} gardiens intéressés</p>

            <div className="space-y-3">
              {offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  locationLabel={
                    typeof selectedRequest.location === "string"
                      ? selectedRequest.location
                      : selectedRequest.location?.address
                  }
                  onAccept={() => handleAcceptOffer(offer)}
                  onReject={() => handleRejectOffer(offer)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div>
            {bookings.length > 0 && bookings[0].status === "in-progress" && (
              <button
                onClick={() => setCurrentView("active-booking")}
                className="w-full mb-4 p-4 bg-accent/10 rounded-xl flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-accent-foreground text-sm font-bold">!</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{t("activeBooking")}</p>
                  <p className="text-sm text-muted-foreground">
                    {bookings[0].sitterName} s'occupe de {bookings[0].petName}
                  </p>
                </div>
                <ArrowLeft size={20} className="rotate-180 text-muted-foreground" />
              </button>
            )}

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t("nearSitters")}</h2>
              <span className="text-sm text-muted-foreground">{sitters.length} disponibles</span>
            </div>

            {userRequests.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Tes demandes en cours</h3>
                <div className="space-y-3">
                  {userRequests.slice(0, 2).map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onClick={() => handleRequestClick(request)}
                      compact
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {sitters.map((sitter, i) => (
                <div key={sitter.id} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={sitter.avatar || "/sitterAvatar.png"} />
                    <AvatarFallback>{sitter.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{sitter.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(sitter.trustScore || 0).toFixed?.(1)} ★ · {sitter.reviewCount || 0} avis
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{(1 + i * 0.5).toFixed(1)} km</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
