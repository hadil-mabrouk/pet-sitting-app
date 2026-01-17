export type LatLng = { lat: number; lng: number }

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371
  const dLat = deg2rad(b.lat - a.lat)
  const dLng = deg2rad(b.lng - a.lng)
  const lat1 = deg2rad(a.lat)
  const lat2 = deg2rad(b.lat)

  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)

  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
  return R * c
}

function deg2rad(d: number) {
  return (d * Math.PI) / 180
}
