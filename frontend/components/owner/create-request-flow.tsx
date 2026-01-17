"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Check, MapPin, Calendar, DollarSign, PawPrint, RefreshCcw, Navigation, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ServiceIcon } from "@/components/ui/service-icon"
import { MapView } from "@/components/map/map-view"
import { createServiceRequest, createPet, fetchPets, fetchServiceTypes } from "@/lib/api"
import { useGeolocation } from "@/lib/use-geolocation"
import type { ServiceType } from "@/lib/types"
import type { User } from "@/app/page"

interface CreateRequestFlowProps {
  user: User
  onClose: () => void
  onSubmit: () => void
  onUpdateUser?: (updates: Partial<User>) => void
}

const STEPS = ["Details", "Localisation & Budget", "Confirmation"] as const

type ServiceTypeOption = { id: number; name: string; min_price: number; description?: string }

export function CreateRequestFlow({ user, onClose, onSubmit, onUpdateUser }: CreateRequestFlowProps) {
  const [step, setStep] = useState(0)
  const [pets, setPets] = useState(user?.pets || [])
  const [petsLoading, setPetsLoading] = useState(false)
  const [petsError, setPetsError] = useState<string | null>(null)
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeOption[]>([])
  const [serviceTypeError, setServiceTypeError] = useState<string | null>(null)
  const [selectedPet, setSelectedPet] = useState<string | null>(pets[0]?.id ?? null)
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<number | null>(null)
  const [dateStart, setDateStart] = useState("")
  const [dateEnd, setDateEnd] = useState("")
  const [price, setPrice] = useState([30])
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { coords } = useGeolocation()
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string }>({
    lat: user?.location?.lat ?? coords?.lat ?? 36.8065,
    lng: user?.location?.lng ?? coords?.lng ?? 10.1815,
    address: user?.location?.address ?? "Tunis, Tunisia",
  })

  const [addingPet, setAddingPet] = useState(false)
  const [newPet, setNewPet] = useState({ name: "", species: "dog", breed: "", age: "" })
  const [petError, setPetError] = useState<string | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [manualAddress, setManualAddress] = useState(location.address || "")
  const [city, setCity] = useState(user?.location?.address || "Tunis, Tunisia")
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadPets = async () => {
      setPetsLoading(true)
      setPetsError(null)
      try {
        const data = await fetchPets()
        const normalized =
          data?.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            type: (p.type || p.species || "other") as any,
            breed: p.breed,
            age: p.age,
            image: p.image || p.photo_url,
          })) || []
        setPets(normalized)
        if (!selectedPet && normalized[0]) setSelectedPet(String(normalized[0].id))
      } catch (err) {
        setPetsError("Impossible de charger vos animaux.")
      } finally {
        setPetsLoading(false)
      }
    }
    const loadServiceTypes = async () => {
      try {
        const data = await fetchServiceTypes()
        setServiceTypes(data || [])
      } catch (err) {
        setServiceTypeError("Types de services indisponibles.")
      }
    }
    void loadPets()
    void loadServiceTypes()
  }, [selectedPet])

  useEffect(() => {
    if (coords?.lat && coords?.lng) {
      setLocation((prev) => ({ ...prev, lat: coords.lat, lng: coords.lng }))
    }
  }, [coords])

  const selectedPetData = pets.find((p) => String(p.id) === String(selectedPet))
  const selectedService = useMemo(() => serviceTypes.find((s) => s.id === selectedServiceTypeId) || null, [serviceTypes, selectedServiceTypeId])
  const durationInfo = useMemo(() => {
    if (!dateStart || !dateEnd) return null
    const start = new Date(dateStart)
    const end = new Date(dateEnd)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return null
    const diffMs = end.getTime() - start.getTime()
    const hours = Math.round(diffMs / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    const remHours = hours % 24
    return { hours, days, remHours }
  }, [dateStart, dateEnd])

  const validateStep = (currentStep: number) => {
    const errs: Record<string, string> = {}
    if (currentStep === 0) {
      if (!selectedPet) errs.pet = "Selectionne un animal."
      if (selectedServiceTypeId === null) errs.service = "Choisis un service."
      if (!dateStart) errs.dateStart = "Date de debut requise"
      if (!dateEnd) errs.dateEnd = "Date de fin requise"
      if (dateStart && dateEnd && new Date(dateEnd) < new Date(dateStart)) errs.dateEnd = "La fin doit etre apres le debut"
    }
    if (currentStep === 1) {
      if (!manualAddress && !city) errs.address = "Adresse requise"
      if (selectedService && price[0] < Number(selectedService.min_price)) {
        errs.price = `Minimum ${Number(selectedService.min_price)} TND`
      } else if (price[0] < 10) {
        errs.price = "Montant trop bas"
      }
    }
    return errs
  }

  const canContinue = () => Object.values(validateStep(step)).every((msg) => !msg)

  const handleNext = () => {
    const errs = validateStep(step)
    setFieldErrors((prev) => ({ ...prev, ...errs }))
    if (Object.values(errs).some(Boolean)) return
    if (step < STEPS.length - 1) setStep(step + 1)
    else void handleSubmit()
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
    else onClose()
  }

  const handleSubmit = async () => {
    const errs = { ...validateStep(0), ...validateStep(1) }
    setFieldErrors((prev) => ({ ...prev, ...errs }))
    if (Object.values(errs).some(Boolean)) {
      setRequestError("Corrige les champs en rouge.")
      return
    }
    setSubmitting(true)
    setRequestError(null)
    try {
      await createServiceRequest({
        petId: selectedPet,
        serviceTypeId: selectedServiceTypeId,
        requestedPrice: price[0],
        location: { ...location, address: manualAddress || city || location.address },
      })
      onSubmit()
    } catch (err) {
      setRequestError("Creation impossible. Verifie les champs et reessaie.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={handleBack} className="p-2 hover:bg-secondary rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold">Creer une demande</h1>
          <p className="text-sm text-muted-foreground">
            Etape {step + 1} sur {STEPS.length}
          </p>
        </div>
      </div>

      <div className="flex gap-1 px-4 py-3">
        {STEPS.map((_, i) => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
        ))}
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        <h2 className="text-xl font-semibold">{STEPS[step]}</h2>
        {requestError ? <p className="text-sm text-destructive">{requestError}</p> : null}

        {step === 0 && (
          <div className="space-y-6">
            <div className="space-y-3">
              {petsLoading && <p className="text-sm text-muted-foreground">Chargement des animaux.</p>}
              {petsError && <p className="text-sm text-destructive">{petsError}</p>}
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => setSelectedPet(String(pet.id))}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    selectedPet === String(pet.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={pet.image || `/petAvatar.png?height=56&width=56&query=${pet.type} ${pet.breed}`} />
                    <AvatarFallback>{pet.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">{pet.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(pet.breed || pet.type) ?? ""} - {pet.age ?? "-"} ans
                    </p>
                  </div>
                  {selectedPet === String(pet.id) && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check size={14} className="text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
              {fieldErrors.pet && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.pet}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPetsError(null)
                    void (async () => {
                      try {
                        const data = await fetchPets()
                        const normalized =
                          data?.map((p: any) => ({
                            id: String(p.id),
                            name: p.name,
                            type: (p.type || p.species || "other") as any,
                            breed: p.breed,
                            age: p.age,
                            image: p.image || p.photo_url,
                          })) || []
                        setPets(normalized)
                        if (normalized[0]) setSelectedPet(String(normalized[0].id))
                      } catch (err) {
                        setPetsError("Impossible de rafraichir les animaux.")
                      }
                    })()
                  }}
                >
                  <RefreshCcw size={14} className="mr-1" />
                  Rafraichir mes animaux
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setAddingPet((v) => !v)}>
                  <PawPrint size={16} className="mr-1" />
                  Ajouter
                </Button>
              </div>

              {addingPet && (
                <div className="p-4 border rounded-xl space-y-3 bg-secondary/30">
                  {petError ? <p className="text-sm text-destructive">{petError}</p> : null}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Nom</Label>
                      <Input value={newPet.name} onChange={(e) => setNewPet({ ...newPet, name: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Type</Label>
                      <select
                        className="w-full rounded-md border bg-card p-2 text-sm"
                        value={newPet.species}
                        onChange={(e) => setNewPet({ ...newPet, species: e.target.value })}
                      >
                        <option value="dog">Chien</option>
                        <option value="cat">Chat</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label>Race</Label>
                      <Input value={newPet.breed} onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Age (ans)</Label>
                      <Input type="number" value={newPet.age} onChange={(e) => setNewPet({ ...newPet, age: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={async () => {
                        setPetError(null)
                        if (!newPet.name) {
                          setPetError("Nom requis.")
                          return
                        }
                        try {
                          const created = await createPet({
                            name: newPet.name,
                            species: newPet.species,
                            breed: newPet.breed,
                            age: newPet.age ? Number(newPet.age) : undefined,
                          })
                          const normalized = {
                            id: String(created.id),
                            name: created.name,
                            type: (created.type || created.species || newPet.species || "other") as any,
                            breed: created.breed,
                            age: created.age,
                            image: (created as any).image || (created as any).photo_url,
                          }
                          setPets((prev) => [...prev, normalized])
                          setSelectedPet(String(normalized.id))
                          onUpdateUser?.({ pets: [...pets, normalized] as any })
                          setAddingPet(false)
                          setNewPet({ name: "", species: "dog", breed: "", age: "" })
                        } catch (err) {
                          setPetError("Ajout impossible. Verifie que tu es connecte.")
                        }
                      }}
                      disabled={!newPet.name}
                    >
                      Enregistrer l'animal
                    </Button>
                    <Button variant="ghost" type="button" onClick={() => setAddingPet(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {serviceTypeError ? <p className="text-sm text-destructive">{serviceTypeError}</p> : null}
              {serviceTypes.length === 0 && !serviceTypeError && (
                <p className="text-sm text-muted-foreground">Chargement des services.</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {serviceTypes.map((svc) => {
                  const friendlyLabel =
                    svc.name?.toLowerCase().includes("walk") || svc.name?.toLowerCase().includes("dog")
                      ? "Promenade"
                      : svc.name?.toLowerCase().includes("taxi")
                        ? "Pet Taxi"
                        : svc.name?.toLowerCase().includes("emergency")
                          ? "Urgence"
                          : "Garde a domicile"
                  const typeKey: ServiceType =
                    friendlyLabel === "Promenade"
                      ? "walking"
                      : friendlyLabel === "Pet Taxi"
                        ? "taxi"
                        : friendlyLabel === "Urgence"
                          ? "emergency"
                          : "sitting"
                  const bg =
                    friendlyLabel === "Garde a domicile"
                      ? "bg-[#F5E6D3]"
                      : friendlyLabel === "Promenade"
                        ? "bg-[#D4E7F7]"
                        : friendlyLabel === "Urgence"
                          ? "bg-[#FFD4D4]"
                          : "bg-[#E8D9F5]"
                  const hoverBorder =
                    friendlyLabel === "Garde a domicile"
                      ? "hover:border-[#c67b5c]"
                      : friendlyLabel === "Promenade"
                        ? "hover:border-[#2F6F8F]"
                        : friendlyLabel === "Urgence"
                          ? "hover:border-[#D94141]"
                          : "hover:border-[#8B9F8F]"
                  return (
                    <button
                      key={svc.id}
                      onClick={() => setSelectedServiceTypeId(svc.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left shadow-sm ${bg} ${
                        selectedServiceTypeId === svc.id ? "border-primary scale-[1.01]" : `border-border ${hoverBorder} hover:shadow-md`
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 bg-white/60 shadow-sm">
                        <ServiceIcon type={typeKey} size={32} />
                      </div>
                      <p className="font-semibold text-sm">{friendlyLabel}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tarif min: {Number(svc.min_price)} TND {svc.description ? `- ${svc.description}` : ""}
                      </p>
                    </button>
                  )
                })}
              </div>
              {fieldErrors.service && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.service}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="start">Date et heure de debut</Label>
                <Input
                  id="start"
                  type="datetime-local"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  onBlur={() => setFieldErrors((prev) => ({ ...prev, ...validateStep(0) }))}
                  aria-invalid={!!fieldErrors.dateStart}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-muted-foreground">Selectionne la date et l'heure souhaitees</p>
                {fieldErrors.dateStart && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.dateStart}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end">Date et heure de fin</Label>
                <Input
                  id="end"
                  type="datetime-local"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  onBlur={() => setFieldErrors((prev) => ({ ...prev, ...validateStep(0) }))}
                  aria-invalid={!!fieldErrors.dateEnd}
                  min={dateStart || new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-muted-foreground">Selectionne la date et l'heure souhaitees</p>
                {fieldErrors.dateEnd && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.dateEnd}
                  </p>
                )}
              </div>
              {durationInfo && (
                <div className="text-sm text-muted-foreground">
                  Duree estimee : {durationInfo.days}j {durationInfo.remHours}h ({durationInfo.hours} heures)
                </div>
              )}
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="text-muted-foreground">Suggestions :</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const base = dateStart ? new Date(dateStart) : new Date()
                    const dayStr = base.toISOString().slice(0, 10)
                    setDateStart(`${dayStr}T09:00`)
                    setDateEnd(`${dayStr}T12:00`)
                  }}
                >
                  Matin (09:00-12:00)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const base = dateStart ? new Date(dateStart) : new Date()
                    const dayStr = base.toISOString().slice(0, 10)
                    setDateStart(`${dayStr}T12:00`)
                    setDateEnd(`${dayStr}T17:00`)
                  }}
                >
                  Apres-midi (12:00-17:00)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const base = dateStart ? new Date(dateStart) : new Date()
                    const dayStr = base.toISOString().slice(0, 10)
                    setDateStart(`${dayStr}T18:00`)
                    setDateEnd(`${dayStr}T22:00`)
                  }}
                >
                  Soir (18:00-22:00)
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-primary" />
                <div className="flex-1">
                  <Label>Adresse</Label>
                  <Input
                    value={manualAddress}
                    onChange={(e) => {
                      const val = e.target.value
                      setManualAddress(val)
                      setLocation((prev) => ({ ...prev, address: val || city || prev.address }))
                    }}
                    placeholder="Ex: Rue de Marseille, Tunis"
                  />
                </div>
              </div>
              <div>
                <Label>Ville / Zone (Grand Tunis)</Label>
                <select
                  className="w-full mt-1 rounded-md border bg-card p-2"
                  value={city}
                  onChange={(e) => {
                    const val = e.target.value
                    setCity(val)
                    setLocation((prev) => ({ ...prev, address: manualAddress || val, lat: prev.lat, lng: prev.lng }))
                  }}
                >
                  {["Tunis, Tunisia", "La Marsa", "Carthage", "Le Kram", "Ariana", "Ben Arous", "Manouba", "Ezzahra", "Bardo"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              {fieldErrors.address && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.address}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="inline-flex items-center gap-2"
                onClick={() => {
                  if (coords?.lat && coords?.lng) {
                    setLocation({
                      lat: coords.lat,
                      lng: coords.lng,
                      address: manualAddress || city || location.address,
                    })
                    setManualAddress(manualAddress || city || location.address || "Ma position")
                  }
                }}
              >
                <Navigation size={16} />
                Utiliser ma position
              </Button>

              <div className="text-xs text-muted-foreground">
                Lat: {location.lat.toFixed(4)} - Lng: {location.lng.toFixed(4)}
              </div>
              <div className="rounded-2xl overflow-hidden border border-border h-72">
                <MapView
                  apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                  center={mapCoords || location}
                  markers={
                    mapCoords
                      ? [{ id: "selected", lat: mapCoords.lat, lng: mapCoords.lng, type: "request", label: "Emplacement" }]
                      : []
                  }
                  onSelectLocation={(pos) => {
                    const addrText = manualAddress?.trim()
                      ? manualAddress
                      : `${city || "Tunis"}, (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`
                    setManualAddress(addrText)
                    setMapCoords(pos)
                    setLocation({ ...location, ...pos, address: addrText })
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Adresse actuelle : {manualAddress || city} | Coords : {mapCoords ? `${mapCoords.lat.toFixed(4)}, ${mapCoords.lng.toFixed(4)}` : "-"}
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-4xl font-bold text-primary">
                  <span>{price[0]}</span>
                  <span className="text-lg font-semibold text-muted-foreground">TND</span>
                </div>
                <p className="text-muted-foreground mt-1">Budget propose</p>
                {selectedService ? <p className="text-xs text-muted-foreground">Minimum: {Number(selectedService.min_price)} TND pour ce service</p> : null}
                {durationInfo && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Prix estime: {Math.max(price[0], selectedService ? Number(selectedService.min_price) : 0)} TND - Duree {durationInfo.hours} h
                  </p>
                )}
              </div>

              <div className="px-4">
                <Slider value={price} onValueChange={setPrice} min={10} max={200} step={5} className="mb-4" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>10 TND</span>
                  <span>200 TND</span>
                </div>
              </div>
              {fieldErrors.price && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.price}
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Notes additionnelles (optionnel)</Label>
                <Textarea
                  id="description"
                  placeholder="Instructions pour le gardien..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedPetData?.image || "/placeholder.svg"} />
                  <AvatarFallback>{selectedPetData?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedPetData?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPetData?.breed}</p>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  {selectedService ? (
                    <ServiceIcon
                      type={
                        selectedService.name.toLowerCase().includes("walk")
                          ? "walking"
                          : selectedService.name.toLowerCase().includes("taxi")
                            ? "taxi"
                            : selectedService.name.toLowerCase().includes("emergency")
                              ? "emergency"
                              : "sitting"
                      }
                      className="text-primary"
                    />
                  ) : null}
                </div>
                <div>
                  <p className="font-medium">{selectedService ? selectedService.name : serviceTypeIdToLabel(selectedServiceTypeId)}</p>
                  <p className="text-sm text-muted-foreground">Type de service</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {dateStart ? new Date(dateStart).toLocaleDateString() : "-"} - {dateEnd ? new Date(dateEnd).toLocaleDateString() : "-"}
                  </p>
                  <p className="text-sm text-muted-foreground">Plage de dates</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MapPin size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium">{location.address}</p>
                  <p className="text-sm text-muted-foreground">Localisation</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <DollarSign size={20} className="text-accent" />
                </div>
                <div>
                  <p className="font-medium text-accent">{price[0]} TND</p>
                  <p className="text-sm text-muted-foreground">Ton offre</p>
                </div>
              </div>

              {description && (
                <>
                  <div className="h-px bg-border" />
                  <p className="text-sm text-muted-foreground">{description}</p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <Button onClick={handleNext} className="w-full" size="lg" disabled={!canContinue() || submitting}>
          {step === STEPS.length - 1 ? "Envoyer la demande" : "Continuer"}
        </Button>
      </div>
    </div>
  )
}

function serviceTypeIdToLabel(id: number | null): string {
  if (id === 2) return "Promenade"
  if (id === 3) return "Pet Taxi"
  if (id === 4) return "Urgence"
  if (id === 1) return "Garde a domicile"
  return "Service"
}
