/*
 * Extends L.Marker with clusterHide/clusterShow helpers that toggle visibility
 * without permanently mutating the marker's configured opacity option.
 */

import { Marker } from 'leaflet'

Marker.include({
  clusterHide: function () {
    const originalOpacity = this.options.opacity
    this.setOpacity(0)
    this.options.opacity = originalOpacity
    return this
  },

  clusterShow: function () {
    return this.setOpacity(this.options.opacity)
  },
})
