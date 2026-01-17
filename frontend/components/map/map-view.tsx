"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import { cn } from "@/lib/utils"

export interface MapMarker {
  id: string
  lat: number
  lng: number
  type: "request" | "sitter" | "user"
  label?: string
}

interface MapViewProps {
  apiKey?: string
  center?: { lat: number; lng: number }
  markers?: MapMarker[]
  onMarkerClick?: (id: string) => void
  onSelectLocation?: (coords: { lat: number; lng: number }) => void
  className?: string
  showRadius?: boolean
  radiusKm?: number
}

export function MapView({
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  center = { lat: 36.8065, lng: 10.1815 },
  markers = [],
  onMarkerClick,
  onSelectLocation,
  className,
  showRadius = false,
  radiusKm = 5,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const markerInstances = useRef<google.maps.Marker[]>([])
  const circleInstance = useRef<google.maps.Circle | null>(null)
  const clickListener = useRef<google.maps.MapsEventListener | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loader = useMemo(
    () =>
      new Loader({
        apiKey,
        version: "weekly",
        libraries: ["places"],
      }),
    [apiKey],
  )

  useEffect(() => {
    let isMounted = true
    if (!apiKey) {
      console.warn("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY")
      setError("Clé Google Maps absente")
      return
    }

    loader
      .importLibrary("maps")
      .then(() => {
        if (!isMounted || !mapRef.current) return
        setError(null)

        if (!mapInstance.current) {
          mapInstance.current = new google.maps.Map(mapRef.current, {
            center,
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          })
        } else {
          mapInstance.current.setCenter(center)
        }

        if (clickListener.current) {
          clickListener.current.remove()
          clickListener.current = null
        }
        if (onSelectLocation && mapInstance.current) {
          clickListener.current = mapInstance.current.addListener("click", (ev: google.maps.MapMouseEvent) => {
            if (ev.latLng) {
              onSelectLocation({ lat: ev.latLng.lat(), lng: ev.latLng.lng() })
            }
          })
        }

        markerInstances.current.forEach((m) => m.setMap(null))
        markerInstances.current = []

        markers.forEach((m) => {
          const marker = new google.maps.Marker({
            position: { lat: m.lat, lng: m.lng },
            map: mapInstance.current!,
            label: m.type === "request" ? "R" : m.type === "sitter" ? "S" : "U",
          })
          if (m.label) {
            const info = new google.maps.InfoWindow({ content: m.label })
            marker.addListener("click", () => {
              info.open({ map: mapInstance.current, anchor: marker })
              onMarkerClick?.(m.id)
            })
          } else {
            marker.addListener("click", () => onMarkerClick?.(m.id))
          }
          markerInstances.current.push(marker)
        })

        if (showRadius) {
          if (circleInstance.current) {
            circleInstance.current.setMap(null)
          }
          circleInstance.current = new google.maps.Circle({
            map: mapInstance.current,
            center,
            radius: radiusKm * 1000,
            fillColor: "#c65a3a",
            fillOpacity: 0.05,
            strokeColor: "#c65a3a",
            strokeOpacity: 0.3,
            strokeWeight: 1,
          })
        } else if (circleInstance.current) {
          circleInstance.current.setMap(null)
          circleInstance.current = null
        }
      })
      .catch((err) => {
        console.error("Failed to load Google Maps", err)
        setError("Impossible de charger la carte")
      })

    return () => {
      isMounted = false
      markerInstances.current.forEach((m) => m.setMap(null))
      markerInstances.current = []
      if (circleInstance.current) {
        circleInstance.current.setMap(null)
        circleInstance.current = null
      }
      if (clickListener.current) {
        clickListener.current.remove()
        clickListener.current = null
      }
    }
  }, [apiKey, center, markers, onMarkerClick, onSelectLocation, showRadius, radiusKm, loader])

  if (error) {
    return (
      <div
        className={cn(
          "relative w-full h-full bg-secondary/50 text-muted-foreground flex items-center justify-center text-sm",
          className,
        )}
      >
        {error}
      </div>
    )
  }

  return <div ref={mapRef} className={cn("relative w-full h-full", className)} />
}
