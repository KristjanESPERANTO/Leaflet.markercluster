/*
 * Minimal replacement for Leaflet's `Browser` namespace, which was removed in Leaflet 2 (Leaflet#10447).
 * Only the two flags used by MarkerClusterGroup are provided.
 */

const hasNavigator = typeof navigator !== 'undefined'

export const Browser = {
  get mobile() {
    return hasNavigator && /mobi/i.test(navigator.userAgent)
  },
  get touch() {
    return hasNavigator && navigator.maxTouchPoints > 0
  },
}
