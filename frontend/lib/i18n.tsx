import { createContext, useContext, useMemo, useState } from "react"

export type Lang = "fr"

interface I18nContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
  rtl: boolean
}

const translations: Record<string, { fr: string }> = {
  login: { fr: "Se connecter" },
  signup: { fr: "S'inscrire" },
  logout: { fr: "Déconnexion" },
  owner: { fr: "Propriétaire" },
  sitter: { fr: "Gardien" },
  myPets: { fr: "Mes animaux" },
  addPet: { fr: "Ajouter un animal" },
  createRequest: { fr: "Créer une demande" },
  myRequests: { fr: "Mes demandes" },
  offers: { fr: "Offres" },
  bookings: { fr: "Réservations" },
  completeBooking: { fr: "Terminer la réservation" },
  review: { fr: "Évaluer" },
  sendReview: { fr: "Envoyer l'avis" },
  available: { fr: "Disponible" },
  unavailable: { fr: "Indisponible" },
  trust: { fr: "Confiance" },
  avgRating: { fr: "Note moyenne" },
  reviewsCount: { fr: "Nombre d'avis" },
  cancelRequest: { fr: "Annuler la demande" },
  accept: { fr: "Accepter" },
  reject: { fr: "Refuser" },
  nearSitters: { fr: "Gardiens proches" },
  openRequests: { fr: "Demandes ouvertes" },
  myBookings: { fr: "Mes réservations" },
  myOffers: { fr: "Mes offres" },
  requestDetails: { fr: "Détails de la demande" },
  createOffer: { fr: "Créer une offre" },
  price: { fr: "Prix" },
  message: { fr: "Message" },
  submit: { fr: "Envoyer" },
  distanceFilter: { fr: "Filtre distance" },
  useLocation: { fr: "Utiliser ma position" },
  status: { fr: "Statut" },
  pet: { fr: "Animal" },
  serviceType: { fr: "Type de service" },
  date: { fr: "Date" },
  location: { fr: "Localisation" },
  offeredPrice: { fr: "Prix proposé" },
  offersReceived: { fr: "Offres reçues" },
  noData: { fr: "Pas de données" },
  menu: { fr: "Menu" },
  profile: { fr: "Mon profil" },
  settings: { fr: "Paramètres" },
  activeBooking: { fr: "Réservation active" },
  filter: { fr: "Filtrer" },
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr")
  const rtl = false
  const t = useMemo(() => (key: string) => translations[key]?.fr ?? key, [])

  return <I18nContext.Provider value={{ lang, setLang, t, rtl }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}
