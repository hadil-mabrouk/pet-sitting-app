"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { fetchPets, createPet, updatePet } from "@/lib/api"
import type { Pet } from "@/lib/types"
import { PawPrint, AlertCircle, CheckCircle2 } from "lucide-react"

interface PetsPageProps {
  onBack: () => void
  onUpdated?: (pets: Pet[]) => void
}

export function PetsPage({ onBack, onUpdated }: PetsPageProps) {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Pet> & { weight?: string; height?: string; behaviors?: string }>({
    name: "",
    species: "dog",
    breed: "",
    age: undefined,
    temperament: "",
    medical_notes: "",
    weight: "",
    height: "",
    behaviors: "",
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const ValidIcon = ({ field }: { field: string }) =>
    !fieldErrors[field] && (form as any)[field]
      ? <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
      : null

  const loadPets = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPets()
      setPets(data || [])
      onUpdated?.(data || [])
    } catch (err) {
      console.error(err)
      setError("Impossible de charger vos animaux.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPets()
  }, [])

  const startEdit = (pet?: Pet) => {
    if (pet) {
      setEditingId(String(pet.id))
      setForm({
        ...pet,
        weight: extractValue(pet.medical_notes, "Poids"),
        height: extractValue(pet.medical_notes, "Taille"),
        behaviors: pet.temperament || "",
      })
    } else {
      setEditingId("new")
      setForm({ name: "", species: "dog", breed: "", age: undefined, weight: "", height: "", behaviors: "", temperament: "", medical_notes: "" })
    }
  }

  const extractValue = (text: string | undefined, label: string) => {
    if (!text) return ""
    const match = text.split("\n").find((line) => line.toLowerCase().startsWith(label.toLowerCase()))
    if (!match) return ""
    return match.split(":").slice(1).join(":").trim()
  }

  const buildMedicalNotes = () => {
    const parts = []
    if (form.weight) parts.push(`Poids: ${form.weight}`)
    if (form.height) parts.push(`Taille: ${form.height}`)
    if (form.medical_notes) parts.push(form.medical_notes)
    return parts.join("\n")
  }

  const savePet = async () => {
    const errs: Record<string, string> = {}
    if (!form.name) errs.name = "Nom requis"
    if (!form.species) errs.species = "Type requis"
    setFieldErrors(errs)
    if (Object.values(errs).some(Boolean)) {
      setError("Corrige les champs en rouge.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      if (editingId && editingId !== "new") {
        const updated = await updatePet(editingId, {
          name: form.name,
          species: (form as any).species,
          breed: form.breed,
          age: form.age ? Number(form.age) : undefined,
          temperament: form.behaviors || form.temperament,
          medical_notes: buildMedicalNotes(),
        })
        const list = pets.map((p) => (String(p.id) === String(updated.id) ? updated : p))
        setPets(list)
        onUpdated?.(list)
      } else {
        const created = await createPet({
          name: form.name,
          species: (form as any).species,
          breed: form.breed,
          age: form.age ? Number(form.age) : undefined,
          temperament: form.behaviors,
          medical_notes: buildMedicalNotes(),
        })
        const list = [...pets, created]
        setPets(list)
        onUpdated?.(list)
      }
      setEditingId(null)
      setForm({ name: "", species: "dog", breed: "", age: undefined, weight: "", height: "", behaviors: "", temperament: "", medical_notes: "" })
    } catch (err) {
      console.error(err)
      setError("Sauvegarde impossible.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={onBack} className="p-2 hover:bg-secondary rounded-lg">
          ←
        </button>
        <div className="flex-1">
          <h1 className="font-semibold">Mes animaux</h1>
          <p className="text-sm text-muted-foreground">Gérer les profils de vos compagnons.</p>
        </div>
        <Button size="sm" onClick={() => startEdit()}>
          Ajouter un animal
        </Button>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto">
        {loading && <p className="text-sm text-muted-foreground">Chargement...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {pets.map((pet) => (
          <Card key={pet.id}>
            <CardContent className="p-4 flex gap-3 items-center">
              <Avatar className="h-14 w-14">
                <AvatarImage src={pet.image || "/petAvatar.png"} />
                <AvatarFallback>{pet.name?.[0] ?? <PawPrint />}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{pet.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(pet.breed || pet.species || pet.type) ?? ""} · {pet.age ?? "-"} ans
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => startEdit(pet)}>
                    Modifier
                  </Button>
                </div>
                {pet.temperament && <p className="text-sm text-muted-foreground mt-1">Comportement: {pet.temperament}</p>}
                {pet.medical_notes && <p className="text-sm text-muted-foreground">Notes: {pet.medical_notes}</p>}
              </div>
            </CardContent>
          </Card>
        ))}

        {pets.length === 0 && !loading && <p className="text-sm text-muted-foreground">Aucun animal enregistré.</p>}

        {editingId !== null && (
          <Card className="border-primary/50">
            <CardContent className="p-4 space-y-3">
              <h2 className="font-semibold">{editingId === "new" ? "Nouvel animal" : "Modifier l'animal"}</h2>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Nom</Label>
                    <ValidIcon field="name" />
                  </div>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    onBlur={() => setFieldErrors((prev) => ({ ...prev, name: form.name ? "" : "Nom requis" }))}
                    aria-invalid={!!fieldErrors.name}
                  />
                  {fieldErrors.name && (
                    <p className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Type</Label>
                    <ValidIcon field="species" />
                  </div>
                  <select
                    className="w-full rounded-md border bg-card p-2 text-sm"
                    value={(form as any).species || "dog"}
                    onChange={(e) => setForm({ ...form, species: e.target.value })}
                    onBlur={() =>
                      setFieldErrors((prev) => ({ ...prev, species: (form as any).species ? "" : "Type requis" }))
                    }
                    aria-invalid={!!fieldErrors.species}
                  >
                    <option value="dog">Chien</option>
                    <option value="cat">Chat</option>
                    <option value="other">Autre</option>
                  </select>
                  {fieldErrors.species && (
                    <p className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.species}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Race</Label>
                  <Input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
                </div>
                <div>
                  <Label>Âge</Label>
                  <Input
                    type="number"
                    value={form.age as any}
                    onChange={(e) => setForm({ ...form, age: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label>Poids</Label>
                  <Input value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
                </div>
                <div>
                  <Label>Taille</Label>
                  <Input value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Comportement</Label>
                <Textarea
                  value={form.behaviors}
                  onChange={(e) => setForm({ ...form, behaviors: e.target.value })}
                  placeholder="Amical, actif, ok chats..."
                />
              </div>
              <div className="space-y-1">
                <Label>Notes médicales / besoins</Label>
                <Textarea
                  value={form.medical_notes}
                  onChange={(e) => setForm({ ...form, medical_notes: e.target.value })}
                  placeholder="Allergies, médicaments, etc."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={savePet} disabled={loading}>
                  Enregistrer
                </Button>
                <Button variant="ghost" onClick={() => setEditingId(null)} disabled={loading}>
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
