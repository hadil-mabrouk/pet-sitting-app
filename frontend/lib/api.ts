import { apiFetch } from "@/lib/api-client"
import type { ServiceRequest, SitterProfile, Pet, Booking, SitterOffer, ServiceType } from "@/lib/types"
import { parseLocation } from "@/lib/location"

function mapOffer(raw: any): SitterOffer {
  return {
    id: String(raw.id),
    requestId: String(raw.request_id ?? raw.requestId ?? ""),
    sitterId: String(raw.sitter_id ?? raw.sitterId ?? ""),
    sitterName: raw.sitter_name || raw.sitterName || "Garde",
    sitterAvatar: raw.sitter_avatar || raw.sitterAvatar,
    sitterTrustScore: Number(raw.sitter_trust_score ?? raw.sitterTrustScore ?? 0),
    sitterReviewCount: Number(raw.sitter_review_count ?? raw.sitterReviewCount ?? 0),
    offeredPrice: Number(raw.offered_price ?? raw.offeredPrice ?? 0),
    message: raw.message,
    distance: Number(raw.distance ?? raw.distance_km ?? 0),
    status: raw.status || "pending",
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  }
}

function mapBooking(raw: any): Booking {
  const loc = parseLocation(raw.location) || { lat: 36.8065, lng: 10.1815, address: "Tunis, Tunisia" }
  return {
    id: String(raw.id),
    requestId: String(raw.request_id ?? raw.requestId ?? ""),
    offerId: String(raw.offer_id ?? raw.offerId ?? ""),
    ownerId: String(raw.owner_id ?? raw.ownerId ?? ""),
    sitterId: String(raw.sitter_id ?? raw.sitterId ?? ""),
    sitterName: raw.sitter_name || raw.sitterName || "Sitter",
    sitterAvatar: raw.sitter_avatar || raw.sitterAvatar,
    petName: raw.pet_name || raw.petName || "Animal",
    petType: raw.pet_type || raw.petType || "pet",
    serviceType: normalizeServiceType(raw.service_type ?? raw.serviceType ?? raw.service_type_id),
    location: {
      lat: loc.lat,
      lng: loc.lng,
      address: loc.address || raw.location || "Localisation inconnue",
    },
    dateStart: raw.date_start || raw.dateStart || "",
    dateEnd: raw.date_end || raw.dateEnd || "",
    price: Number(raw.price ?? raw.agreed_price ?? raw.requested_price ?? 0),
    status: raw.status || "scheduled",
    updates: Array.isArray(raw.updates)
      ? raw.updates.map((u: any) => ({
          id: String(u.id ?? Math.random()),
          createdAt: u.created_at || u.timestamp || new Date().toISOString(),
          type: (u.type as any) || "note",
          content: u.content ?? u.message ?? "",
          photoUrl: u.photo_url ?? u.photoUrl,
        }))
      : [],
  }
}

function normalizeServiceType(value: any): ServiceType {
  if (typeof value === "string") {
    const lower = value.toLowerCase()
    if (lower.includes("walk")) return "walking"
    if (lower.includes("taxi")) return "taxi"
    if (lower.includes("emerg")) return "emergency"
    return "sitting"
  }
  if (typeof value === "number") {
    if (value === 2) return "walking"
    if (value === 3) return "taxi"
    if (value === 4) return "emergency"
    return "sitting"
  }
  return "sitting"
}

function mapRequest(raw: any): ServiceRequest {
  return {
    id: String(raw.id),
    ownerId: String(raw.owner_id ?? ""),
    ownerName: raw.owner_name || raw.ownerName || "",
    ownerAvatar: raw.owner_avatar || raw.ownerAvatar,
    petId: String(raw.pet_id ?? raw.petId ?? ""),
    petName: raw.pet_name || raw.petName || "",
    petType: raw.pet_type || raw.petType || "",
    petImage: raw.pet_image || raw.petImage,
    serviceType: normalizeServiceType(raw.service_type ?? raw.serviceType ?? raw.service_type_id),
    location: parseLocation(raw.location) || { lat: 36.8065, lng: 10.1815, address: raw.location },
    dateStart: raw.date_start || raw.dateStart || "",
    dateEnd: raw.date_end || raw.dateEnd || "",
    offeredPrice: Number(raw.requested_price ?? raw.offeredPrice ?? 0),
    status: raw.status || "open",
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    description: raw.description,
  }
}

export async function fetchOpenRequests(): Promise<ServiceRequest[]> {
  const res = await apiFetch("/requests/open", { method: "GET" })
  const data = await res.json()
  return Array.isArray(data) ? data.map(mapRequest) : []
}

export async function fetchServiceTypes(): Promise<Array<{ id: number; name: string; min_price: number; description?: string }>> {
  const res = await apiFetch("/requests/types", { method: "GET" })
  return await res.json()
}

export async function fetchMyRequests(): Promise<ServiceRequest[]> {
  const res = await apiFetch("/requests/my", { method: "GET" })
  const data = await res.json()
  return Array.isArray(data) ? data.map(mapRequest) : []
}

export async function fetchRequestById(requestId: string | number): Promise<ServiceRequest> {
  const res = await apiFetch(`/requests/${requestId}`, { method: "GET" })
  return mapRequest(await res.json())
}

export async function cancelRequest(requestId: string | number): Promise<ServiceRequest> {
  const res = await apiFetch(`/requests/${requestId}/cancel`, { method: "PUT" })
  return mapRequest(await res.json())
}

export async function createServiceRequest(payload: {
  petId: number | string
  serviceTypeId: number | string
  requestedPrice: number
  location: { lat: number; lng: number; address?: string }
}) {
  const body = {
    pet_id: payload.petId,
    service_type_id: payload.serviceTypeId,
    requested_price: payload.requestedPrice,
    location: JSON.stringify(payload.location),
  }
  const res = await apiFetch("/requests", {
    method: "POST",
    body: JSON.stringify(body),
  })
  return mapRequest(await res.json())
}

export async function fetchSitters(): Promise<SitterProfile[]> {
  const res = await apiFetch("/sitters", { method: "GET" })
  const data = await res.json()
  return Array.isArray(data)
    ? data.map((s) => ({
        id: String(s.id),
        sitterId: String(s.sitter_id ?? s.sitterId ?? s.id),
        name: s.name || s.full_name || "Sitter",
        avatar: s.avatar,
        trustScore: s.trust_score ?? s.trustScore,
        reviewCount: s.review_count ?? s.reviewCount,
        city: s.city,
        isAvailable: s.is_available ?? s.isAvailable,
        lat: s.lat,
        lng: s.lng,
        servicesOffered: s.services_offered ?? s.servicesOffered,
        bio: s.bio,
      }))
    : []
}

export async function fetchSitterProfile(): Promise<SitterProfile> {
  const res = await apiFetch("/sitters/me", { method: "GET" })
  return await res.json()
}

export async function fetchSitterReviews(sitterId: string | number): Promise<any[]> {
  const res = await apiFetch(`/sitters/${sitterId}/reviews`, { method: "GET" })
  return await res.json()
}

export async function updateSitterProfile(payload: Partial<SitterProfile>): Promise<SitterProfile> {
  const res = await apiFetch("/sitters/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  })
  return await res.json()
}

export async function fetchPets(): Promise<Pet[]> {
  const res = await apiFetch("/pets/", { method: "GET" })
  return await res.json()
}

export async function createPet(payload: Partial<Pet>): Promise<Pet> {
  const res = await apiFetch("/pets/", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      species: (payload as any).species || (payload as any).type || payload.type,
      breed: payload.breed,
      age: payload.age,
      temperament: (payload as any).temperament,
      medical_notes: (payload as any).medical_notes,
    }),
  })
  return await res.json()
}

export async function updatePet(petId: string | number, payload: Partial<Pet>): Promise<Pet> {
  const res = await apiFetch(`/pets/${petId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
  return await res.json()
}

export async function deletePet(petId: string | number): Promise<void> {
  await apiFetch(`/pets/${petId}`, { method: "DELETE" })
}

export async function fetchOffersByRequest(requestId: string | number): Promise<SitterOffer[]> {
  const res = await apiFetch(`/requests/${requestId}/offers`, { method: "GET" })
  const data = await res.json()
  return Array.isArray(data) ? data.map(mapOffer) : []
}

export async function createOffer(requestId: string | number, payload: { price: number; message?: string }) {
  const res = await apiFetch(`/requests/${requestId}/offers`, {
    method: "POST",
    body: JSON.stringify({ offered_price: payload.price, message: payload.message }),
  })
  return await res.json()
}

export async function acceptOffer(offerId: string | number) {
  const res = await apiFetch(`/offers/${offerId}/accept`, { method: "PUT" })
  return await res.json()
}

export async function rejectOffer(offerId: string | number) {
  const res = await apiFetch(`/offers/${offerId}/reject`, { method: "PUT" })
  return await res.json()
}

export async function fetchBookings(): Promise<Booking[]> {
  const res = await apiFetch("/bookings/my", { method: "GET" })
  const data = await res.json()
  return Array.isArray(data) ? data.map(mapBooking) : []
}

export async function fetchBookingById(id: string | number): Promise<Booking> {
  const res = await apiFetch(`/bookings/${id}`, { method: "GET" })
  return mapBooking(await res.json())
}

export async function completeBooking(id: string | number): Promise<Booking> {
  const res = await apiFetch(`/bookings/${id}/complete`, { method: "PUT" })
  return mapBooking(await res.json())
}

export async function fetchBookingUpdates(bookingId: string | number) {
  const res = await apiFetch(`/bookings/${bookingId}/updates`, { method: "GET" })
  const data = await res.json()
  return Array.isArray(data)
    ? data.map((u: any) => ({
        id: String(u.id ?? Math.random()),
        createdAt: u.created_at || u.timestamp || new Date().toISOString(),
        type: (u.type as any) || "note",
        content: u.content ?? "",
        photoUrl: u.photo_url ?? u.photoUrl,
      }))
    : []
}

export async function createBookingUpdate(
  bookingId: string | number,
  payload: { type: string; content?: string; photoUrl?: string },
) {
  const body = {
    type: payload.type,
    content: payload.content,
    photo_url: payload.photoUrl,
  }
  const res = await apiFetch(`/bookings/${bookingId}/updates`, {
    method: "POST",
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function uploadBookingUpdatePhoto(bookingId: string | number, file: File) {
  const form = new FormData()
  form.append("file", file)
  const res = await apiFetch(`/bookings/${bookingId}/updates/photo`, {
    method: "POST",
    body: form as any,
  })
  return res.json()
}

export async function sendReview(
  bookingId: string | number,
  payload: { rating: number; comment?: string },
): Promise<any> {
  const res = await apiFetch(`/bookings/${bookingId}/review`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return await res.json()
}
