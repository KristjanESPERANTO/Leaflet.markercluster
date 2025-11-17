/**
 * Animation methods for MarkerClusterGroup.
 * Handles animated zoom transitions and marker/cluster animations.
 */

import { MarkerCluster } from './MarkerCluster.js'

export const animationMethods = {
  _noAnimation: {
    // Non Animated versions of everything
    _animationStart: function () {
      // Do nothing...
    },
    _animationZoomIn: function (previousZoomLevel, newZoomLevel) {
      this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), previousZoomLevel)
      this._topClusterLevel._recursivelyAddChildrenToMap(null, newZoomLevel, this._getExpandedVisibleBounds())

      // We didn't actually animate, but we use this event to mean "clustering animations have finished"
      this.fire('animationend')
    },
    _animationZoomOut: function (previousZoomLevel, newZoomLevel) {
      this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), previousZoomLevel)
      this._topClusterLevel._recursivelyAddChildrenToMap(null, newZoomLevel, this._getExpandedVisibleBounds())

      // We didn't actually animate, but we use this event to mean "clustering animations have finished"
      this.fire('animationend')
    },
    _animationAddLayer: function (layer, newCluster) {
      this._animationAddLayerNonAnimated(layer, newCluster)
    },
  },

  _withAnimation: {
    // Animated versions here
    _animationStart: function () {
      this._map._mapPane.className += ' leaflet-cluster-anim'
      this._inZoomAnimation++
    },

    _animationZoomIn: function (previousZoomLevel, newZoomLevel) {
      const bounds = this._getExpandedVisibleBounds(),
        fg = this._featureGroup,
        minZoom = Math.floor(this._map.getMinZoom())
      let i

      this._ignoreMove = true

      // Add all children of current clusters to map and remove those clusters from map
      this._topClusterLevel._recursively(bounds, previousZoomLevel, minZoom, function (c) {
        let startPos = c._latlng
        const markers = c._markers
        let m

        if (!bounds.contains(startPos)) {
          startPos = null
        }

        if (c._isSingleParent() && previousZoomLevel + 1 === newZoomLevel) { // Immediately add the new child and remove us
          fg.removeLayer(c)
          c._recursivelyAddChildrenToMap(null, newZoomLevel, bounds)
        }
        else {
          // Fade out old cluster
          c.clusterHide()
          c._recursivelyAddChildrenToMap(startPos, newZoomLevel, bounds)
        }

        // Remove markers that are no longer visible (only needed on the previous zoom level
        // where markers were actually visible on the map, not on higher cluster levels)
        if (c._zoom === previousZoomLevel) {
          for (i = markers.length - 1; i >= 0; i--) {
            m = markers[i]
            if (!bounds.contains(m._latlng)) {
              fg.removeLayer(m)
            }
          }
        }
      })

      this._forceLayout()

      // Update cluster opacities recursively through the cluster hierarchy
      this._topClusterLevel._recursivelyBecomeVisible(bounds, newZoomLevel)
      // Update individual marker opacities (markers may exist outside cluster hierarchy)
      fg.eachLayer(function (n) {
        if (!(n instanceof MarkerCluster) && n._icon) {
          n.clusterShow()
        }
      })

      // update the positions of the just added clusters/markers
      this._topClusterLevel._recursively(bounds, previousZoomLevel, newZoomLevel, function (c) {
        c._recursivelyRestoreChildPositions(newZoomLevel)
      })

      this._ignoreMove = false

      // Remove the old clusters and close the zoom animation
      this._enqueue(function () {
        // update the positions of the just added clusters/markers
        this._topClusterLevel._recursively(bounds, previousZoomLevel, minZoom, function (c) {
          fg.removeLayer(c)
          c.clusterShow()
        })

        this._animationEnd()
      })
    },

    _animationZoomOut: function (previousZoomLevel, newZoomLevel) {
      this._animationZoomOutSingle(this._topClusterLevel, previousZoomLevel - 1, newZoomLevel)

      // Need to add markers for those that weren't on the map before but are now
      this._topClusterLevel._recursivelyAddChildrenToMap(null, newZoomLevel, this._getExpandedVisibleBounds())
      // Remove markers that were on the map before but won't be now
      this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), previousZoomLevel, this._getExpandedVisibleBounds())
    },

    _animationAddLayer: function (layer, newCluster) {
      const me = this,
        fg = this._featureGroup

      fg.addLayer(layer)
      if (newCluster !== layer) {
        if (newCluster._childCount > 2) { // Was already a cluster
          newCluster._updateIcon()
          this._forceLayout()
          this._animationStart()

          layer._setPos(this._map.latLngToLayerPoint(newCluster.getLatLng()))
          layer.clusterHide()

          this._enqueue(function () {
            fg.removeLayer(layer)
            layer.clusterShow()

            me._animationEnd()
          })
        }
        else { // Just became a cluster
          this._forceLayout()

          me._animationStart()
          me._animationZoomOutSingle(newCluster, this._map.getMaxZoom(), this._zoom)
        }
      }
    },
  },

  // Private methods for animated versions.
  _animationZoomOutSingle: function (cluster, previousZoomLevel, newZoomLevel) {
    const bounds = this._getExpandedVisibleBounds(),
      minZoom = Math.floor(this._map.getMinZoom())

    // Animate all of the markers in the clusters to move to their cluster center point
    cluster._recursivelyAnimateChildrenInAndAddSelfToMap(bounds, this._currentShownBounds, minZoom, previousZoomLevel + 1, newZoomLevel)

    const me = this

    // Update the opacity (If we immediately set it they won't animate)
    this._forceLayout()
    cluster._recursivelyBecomeVisible(bounds, newZoomLevel)

    // Animation cleanup happens after fixed timeout (300ms via _enqueue) instead of listening
    // to transitionend events. This is simpler and more reliable than tracking all animated
    // elements and their transition states.
    this._enqueue(function () {
      // This cluster stopped being a cluster before the timeout fired
      if (cluster._childCount === 1) {
        const m = cluster._markers[0]
        // If we were in a cluster animation at the time then the opacity and position of our child could be wrong now, so fix it
        this._ignoreMove = true
        m.setLatLng(m.getLatLng())
        this._ignoreMove = false
        if (m.clusterShow) {
          m.clusterShow()
        }
      }
      else {
        cluster._recursively(bounds, newZoomLevel, minZoom, function (c) {
          c._recursivelyRemoveChildrenFromMap(bounds, minZoom, previousZoomLevel + 1)
        })
      }
      me._animationEnd()
    })
  },

  _animationEnd: function () {
    if (this._map) {
      this._map._mapPane.className = this._map._mapPane.className.replace(' leaflet-cluster-anim', '')
    }
    this._inZoomAnimation--
    this.fire('animationend')
  },

  // Force a browser layout of stuff in the map
  // Should apply the current opacity and location to all elements so we can update them again for an animation
  _forceLayout: function () {
    // In my testing this works, infact offsetWidth of any element seems to work.
    // Could loop all this._layers and do this for each _icon if it stops working

    void document.body.offsetWidth
  },
}
