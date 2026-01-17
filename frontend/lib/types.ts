export type ServiceType = "sitting" | "walking" | "taxi" | "emergency"

export type RequestStatus = "open" | "accepted" | "active" | "completed" | "cancelled"

export interface ServiceRequest {
  id: string
  ownerId: string
  ownerName: string
  ownerAvatar?: string
  petId: string
  petName: string
  petType: string
  petImage?: string
  serviceType: ServiceType
  location:
    | {
        lat: number
        lng: number
        address?: string
      }
    | string
  dateStart: string
  dateEnd: string
  offeredPrice: number
  status: RequestStatus
  createdAt: string
  description?: string
}

export interface SitterOffer {
  id: string
  requestId: string
  sitterId: string
  sitterName: string
  sitterAvatar?: string
  sitterTrustScore: number
  sitterReviewCount: number
  offeredPrice: number
  message?: string
  distance: number
  status: "pending" | "accepted" | "rejected"
  createdAt: string
}

export interface Booking {
  id: string
  requestId: string
  offerId: string
  ownerId: string
  sitterId: string
  sitterName: string
  sitterAvatar?: string
  petName: string
  petType: string
  serviceType: ServiceType
  location: { lat: number; lng: number; address: string }
  dateStart: string
  dateEnd: string
  price: number
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  updates: BookingUpdate[]
}

export interface BookingUpdate {
  id: string
  createdAt: string
  type: "feeding" | "walking" | "meds" | "photo" | "note"
  content?: string
  photoUrl?: string
}

export interface Pet {
  id: string | number
  name: string
  species?: string
  type?: string
  breed?: string
  age?: number
  temperament?: string
  medical_notes?: string
  image?: string
}
export interface SitterProfile {
  id: string
  sitterId?: string
  name?: string
  avatar?: string
  trustScore?: number
  reviewCount?: number
  lat?: number
  lng?: number
  city?: string
  isAvailable?: boolean
  servicesOffered?: string[]
  bio?: string
}

export interface Review {
  id: string
  bookingId: string
  reviewerId: string
  reviewerName: string
  reviewerAvatar?: string
  targetId: string
  rating: number
  comment: string
  createdAt: string
}
