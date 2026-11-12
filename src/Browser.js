/*
 * Minimal replacement for Leaflet's `Browser` namespace, which was removed in Leaflet 2 (Leaflet#10447).
 * Only the two flags used by MarkerClusterGroup are provided.
 */

const hasNavigator = typeof navigator !== 'undefined'

export const Browser = {
  /**
   * Whether the current user agent is a mobile browser.
   * @returns {boolean} True if the user agent is mobile.
   */
  get mobile() {
    return hasNavigator && /mobi/i.test(navigator.userAgent)
  },
  /**
   * Whether the browser reports touch input support.
   * @returns {boolean} True if touch input is supported.
   */
  get touch() {
    return hasNavigator && navigator.maxTouchPoints > 0
  },
}
