"use client"

import { useState } from "react"
import { AuthModal } from "@/components/auth/auth-modal"
import { Button } from "@/components/ui/button"
import posts from "@/content/blog/posts.json"
import { PawPrint, MapPin, Shield, ChevronRight, Star } from "lucide-react"

type UserRole = "owner" | "sitter"

interface LandingPageProps {
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  authError?: string
}

const steps = [
  { title: "Créer une demande", desc: "Choisissez le service, l'adresse et le budget." },
  { title: "Recevoir des offres", desc: "Les gardiens proches répondent, contre-offres incluses." },
  { title: "Accepter et réserver", desc: "Une réservation est créée automatiquement." },
  { title: "Suivi et avis", desc: "Mises à jour puis avis qui renforcent la confiance." },
]

export function LandingPage({ onLogin, onRegister, authError }: LandingPageProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [filters, setFilters] = useState<{ distance: boolean; available: boolean }>({ distance: true, available: true })

  const openLogin = () => {
    setAuthMode("login")
    setShowAuthModal(true)
  }

  const openRegister = () => {
    setAuthMode("register")
    setShowAuthModal(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-md">
                <PawPrint className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="leading-tight">
                <div className="text-lg font-semibold">PetCare</div>
                <div className="text-xs text-muted-foreground">Taking care of your pet</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="hidden sm:inline-flex" onClick={openLogin}>
                Connexion
              </Button>
              <Button onClick={openRegister}>Créer un compte</Button>
            </div>
          </div>
        </div>
      </header>

      <section className="pt-28 pb-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm text-sm text-primary">
              <MapPin className="w-4 h-4" />
              Grand Tunis
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Trouvez le gardien parfait pour votre compagnon
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Des gardiens vérifiés, passionnés et disponibles près de chez vous. Réservez en quelques clics, profitez
              l'esprit tranquille.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button size="lg" className="rounded-2xl bg-primary hover:bg-primary/90" onClick={openRegister}>
                Trouver un pet-sitter <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-2xl border-primary text-primary bg-white" onClick={openRegister}>
                Devenir pet-sitter
              </Button>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground justify-center lg:justify-start">
              <div className="flex -space-x-2">
                <img src="/happy-person-1.jpeg" alt="" className="w-9 h-9 rounded-full border-2 border-white shadow" />
                <img src="/happy-person-2.jpeg" alt="" className="w-9 h-9 rounded-full border-2 border-white shadow" />
                <img src="/happy-person-3.jpeg" alt="" className="w-9 h-9 rounded-full border-2 border-white shadow" />
              </div>
              <span>500+ propriétaires satisfaits</span>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="font-semibold">4.9</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-[32px] overflow-hidden bg-[#f5e6d3] shadow-xl border border-border">
              <img src="/dog-fez.png" alt="" className="w-full h-full object-contain" />
            </div>
            <div className="absolute -bottom-5 left-5 glass rounded-2xl p-4 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">Sitters vérifiés</p>
                  <p className="text-sm text-muted-foreground">Local & vérifié</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Nos Services</h2>
            <p className="text-lg text-muted-foreground">Des solutions adaptées à tous vos besoins</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ServiceCard
              variant="garde"
              title="Garde à domicile"
              description="Sitter chez vous pour prendre soin de votre compagnon dans son environnement familier."
              features={["✓ Visite quotidienne", "✓ Photos et updates", "✓ Soins personnalisés"]}
              priceLabel="25 TND"
              priceUnit="/jour"
              badge="Populaire"
            />
            <ServiceCard
              variant="promenade"
              title="Promenade"
              description="Balade quotidienne pour l'exercice et le bien-être."
              features={["✓ 30-60 minutes", "✓ Parcours sécurisés", "✓ Socialisation"]}
              priceLabel="15 TND"
              priceUnit="/balade"
              />
            <ServiceCard
              variant="urgence"
              title="Urgence"
              description="Assistance rapide pour les situations imprévues."
              features={["✓ Réponse immédiate", "✓ Service prioritaire", "✓ Gardiens disponibles"]}
              priceLabel="40 TND"
              priceUnit="/intervention"
              badge="24/7"
              
              pulse
            />
            <ServiceCard
              variant="taxi"
              title="Pet Taxi"
              description="Transport sécurisé pour vétérinaire ou toilettage."
              features={["✓ Véhicule adapté", "✓ Chauffeur expérimenté", "✓ Porte-à-porte"]}
              priceLabel="20 TND"
              priceUnit="/trajet"
              
            />
          </div>
        </div>
      </section>


      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white/60">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold">Gardiens proches de chez vous</h2>
            <p className="text-muted-foreground">
              Carte, sitters vérifiés, notes et distance. Filtrez par proximité dans le Grand Tunis.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <button
                onClick={() => setFilters((f) => ({ ...f, distance: !f.distance }))}
                className={`px-3 py-1 rounded-full transition ${
                  filters.distance ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                Filtre distance
              </button>
              <button
                onClick={() => setFilters((f) => ({ ...f, available: !f.available }))}
                className={`px-3 py-1 rounded-full transition ${
                  filters.available ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
                }`}
              >
                Sitters disponibles
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Filtres actifs : {filters.distance ? "distance" : ""} {filters.available ? "• disponibilités" : ""}
            </p>
          </div>
          <div className="h-80 rounded-3xl overflow-hidden shadow-lg border border-border relative">
            <img src="/map-of-tunis-tunisia-streets.png" alt="Tunis map" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent pointer-events-none" />
            <button className="absolute top-3 right-3 bg-white/90 rounded-full px-3 py-1 text-sm shadow">Filtrer</button>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold">Profil animal</h2>
            <p className="text-muted-foreground">Carte d'identité complète pour que le gardien sache tout avant la mission.</p>
            <div className="flex flex-wrap gap-2">
              {["Amical", "Actif", "Aime les enfants", "Intérieur"].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-3xl p-4 shadow-md border border-border">
            <div className="flex gap-4">
              <img src="/sam.jpg" alt="" className="w-28 h-28 rounded-2xl object-cover" />
              <div>
                <h3 className="text-xl font-semibold">Sam</h3>
                <p className="text-sm text-muted-foreground">Husky • 3y 1m</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div className="glass rounded-xl p-2">
                    <p className="font-semibold">Poids</p>
                    <p className="text-muted-foreground">5.5 kg</p>
                  </div>
                  <div className="glass rounded-xl p-2">
                    <p className="font-semibold">Hauteur</p>
                    <p className="text-muted-foreground">42 cm</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Dressé en laisse", "Ok chats", "Actif"].map((t) => (
                <span key={t} className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Comment ça marche ?</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {steps.map((step, idx) => (
              <div key={step.title} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mb-3">
                  {idx + 1}
                </div>
                <p className="font-semibold">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Blog</h2>
            <a href="/blog" className="text-primary text-sm underline">
              Voir tout
            </a>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {posts.slice(0, 3).map((post) => (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition space-y-2"
              >
                {post.image && (
                  <div className="h-40 w-full overflow-hidden rounded-xl bg-muted">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString()}</p>
                <p className="text-lg font-semibold">{post.title}</p>
                <p className="text-sm text-muted-foreground">{post.excerpt}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onLogin={onLogin}
        onRegister={(name, email, password) => onRegister(name, email, password, "owner")}
        authError={authError}
      />
    </div>
  )
}

function ServiceCard({
  variant,
  title,
  description,
  features,
  priceLabel,
  priceUnit,
  badge,
  pulse,
}: {
  variant: "garde" | "promenade" | "urgence" | "taxi"
  title: string
  description: string
  features: string[]
  priceLabel: string
  priceUnit: string
  badge?: string
  pulse?: boolean
}) {
  const borderMap = {
    garde: "#d4c5a9",
    promenade: "#a8cde8",
    urgence: "#ffb3b3",
    taxi: "#d1b8e8",
  }
  const bgMap = {
    garde: "from-[#f5e6d3]",
    promenade: "from-[#d4e7f7]",
    urgence: "from-[#ffd4d4]",
    taxi: "from-[#e8d9f5]",
  }
  return (
    <div
      className={`relative rounded-2xl p-5 bg-gradient-to-br ${bgMap[variant]} to-white border-t-4 shadow-sm hover:-translate-y-2 hover:shadow-lg transition`}
      style={{ borderColor: borderMap[variant] }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(198,123,92,0.1)_0%,transparent_70%)] pointer-events-none" />
      <div className="w-16 h-16 flex items-center justify-center bg-white/60 rounded-xl shadow-sm mb-3 text-primary font-bold text-lg">
        {title.charAt(0)}
      </div>
      {badge && (
        <span
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
            pulse ? "bg-destructive text-white animate-pulse uppercase" : "bg-gradient-to-r from-[#ffd700] to-[#ffa500] text-[#2c2c2c]"
          }`}
        >
          {badge}
        </span>
      )}
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
        {features.map((f) => (
          <span key={f}>{f}</span>
        ))}
      </div>
      <div className="flex items-center justify-between border-t pt-3">
        <div className="text-primary font-bold text-lg">
          {priceLabel} <span className="text-sm font-normal text-muted-foreground">{priceUnit}</span>
        </div>
        <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
          Réserver →
        </Button>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5 shadow-sm hover:shadow-md transition">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold text-primary">{value}</div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
