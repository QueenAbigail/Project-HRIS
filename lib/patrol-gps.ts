export const MAX_PATROL_GPS_ACCURACY_METERS = 100

export function calculateGpsDistanceMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const earthRadiusMeters = 6_371_000
  const latitudeDelta = ((latitudeB - latitudeA) * Math.PI) / 180
  const longitudeDelta = ((longitudeB - longitudeA) * Math.PI) / 180
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos((latitudeA * Math.PI) / 180)
      * Math.cos((latitudeB * Math.PI) / 180)
      * Math.sin(longitudeDelta / 2) ** 2

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function validatePatrolGps(input: {
  patrolLatitude: number | null | undefined
  patrolLongitude: number | null | undefined
  accuracyMeters: number | null | undefined
  checkpointLatitude: number
  checkpointLongitude: number
  checkpointRadiusMeters: number
}) {
  const hasCoordinates = Number.isFinite(input.patrolLatitude) && Number.isFinite(input.patrolLongitude)
  const hasAccuracy = Number.isFinite(input.accuracyMeters)
  const distanceMeters = hasCoordinates
    ? calculateGpsDistanceMeters(
        input.patrolLatitude as number,
        input.patrolLongitude as number,
        input.checkpointLatitude,
        input.checkpointLongitude,
      )
    : null

  return {
    gpsValidated: Boolean(
      hasCoordinates
      && hasAccuracy
      && (input.accuracyMeters as number) <= MAX_PATROL_GPS_ACCURACY_METERS
      && distanceMeters !== null
      && distanceMeters <= input.checkpointRadiusMeters,
    ),
    distanceMeters,
  }
}

export function isValidCoordinate(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= -90
    && value <= 90
}

export function isValidLongitude(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= -180
    && value <= 180
}

export function isValidAccuracy(value: unknown): value is number {
  return isValidCoordinate(value) && value >= 0
}
