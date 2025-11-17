import { Icon, LatLng, LatLngBounds, Marker } from 'leaflet'

export const MarkerCluster = Marker.extend({
  options: Icon.prototype.options,

  initialize: function (group, zoom, a, b) {
    Marker.prototype.initialize.call(this, a ? (a._cLatLng || a.getLatLng()) : new LatLng(0, 0),
      { icon: this, pane: group.options.clusterPane })

    this._group = group
    this._zoom = zoom

    this._markers = []
    this._childClusters = []
    this._childCount = 0
    this._iconNeedsUpdate = true
    this._boundsNeedUpdate = true

    this._bounds = new LatLngBounds()

    if (a) {
      this._addChild(a)
    }
    if (b) {
      this._addChild(b)
    }
  },

  // Recursively retrieve all child markers of this cluster
  getAllChildMarkers: function (storageArray, ignoreDraggedMarker) {
    storageArray = storageArray || []

    for (let i = this._childClusters.length - 1; i >= 0; i--) {
      this._childClusters[i].getAllChildMarkers(storageArray, ignoreDraggedMarker)
    }

    for (let j = this._markers.length - 1; j >= 0; j--) {
      if (ignoreDraggedMarker && this._markers[j].__dragStart) {
        continue
      }
      storageArray.push(this._markers[j])
    }

    return storageArray
  },

  // Returns the count of how many child markers we have
  getChildCount: function () {
    return this._childCount
  },

  // Add mouseover/mouseout event handlers when added to map
  onAdd: function (map) {
    Marker.prototype.onAdd.call(this, map)
    this._bindIconEvents()
    this._setClusterTitle()
  },

  // Bind DOM events to icon after it's created
  _bindIconEvents: function () {
    if (this._icon && !this._iconEventsBound) {
      const self = this
      this._icon.addEventListener('mouseover', this._onMouseOver = function (e) {
        if (self._group) {
          self._group.fire('mouseover', {
            originalEvent: e,
            sourceTarget: self,
            layer: self,
          })
        }
      })
      this._icon.addEventListener('mouseout', this._onMouseOut = function (e) {
        if (self._group) {
          self._group.fire('mouseout', {
            originalEvent: e,
            sourceTarget: self,
            layer: self,
          })
        }
      })
      this._iconEventsBound = true
    }
  },

  // Remove event handlers when removed from map
  onRemove: function (map) {
    if (this._icon && this._onMouseOver) {
      this._icon.removeEventListener('mouseover', this._onMouseOver)
      this._icon.removeEventListener('mouseout', this._onMouseOut)
      this._onMouseOver = null
      this._onMouseOut = null
      this._iconEventsBound = false
    }

    Marker.prototype.onRemove.call(this, map)
  },

  // Zoom to the minimum of showing all of the child markers, or the extents of this cluster
  zoomToBounds: function (fitBoundsOptions) {
    let childClusters = this._childClusters.slice()
    const map = this._group._map,
      boundsZoom = map.getBoundsZoom(this._bounds)
    let zoom = this._zoom + 1
    const mapZoom = map.getZoom()
    let i

    // calculate how far we need to zoom down to see all of the markers
    while (childClusters.length > 0 && boundsZoom > zoom) {
      zoom++
      let newClusters = []
      for (i = 0; i < childClusters.length; i++) {
        newClusters = newClusters.concat(childClusters[i]._childClusters)
      }
      childClusters = newClusters
    }

    if (boundsZoom > zoom) {
      this._group._map.setView(this._latlng, zoom)
    }
    else if (boundsZoom <= mapZoom) { // If fitBounds wouldn't zoom us down, zoom us down instead
      this._group._map.setView(this._latlng, mapZoom + 1)
    }
    else {
      this._group._map.fitBounds(this._bounds, fitBoundsOptions)
    }
  },

  getBounds: function () {
    const bounds = new LatLngBounds()
    bounds.extend(this._bounds)
    return bounds
  },

  _updateIcon: function () {
    this._iconNeedsUpdate = true
    if (this._icon) {
      this.setIcon(this)
      this._bindIconEvents()
      this._setClusterTitle()
    }
  },

  _setClusterTitle: function () {
    // Set accessibility title if configured
    if (this._group.options.clusterMarkerTitle && this._icon) {
      let title
      if (typeof this._group.options.clusterMarkerTitle === 'function') {
        title = this._group.options.clusterMarkerTitle(this)
      }
      else {
        title = this._group.options.clusterMarkerTitle
      }
      this._icon.title = title
    }
  },

  // Cludge for Icon, we pretend to be an icon for performance
  createIcon: function () {
    if (this._iconNeedsUpdate) {
      this._iconObj = this._group.options.iconCreateFunction(this)
      this._iconNeedsUpdate = false
    }
    return this._iconObj.createIcon()
  },
  createShadow: function () {
    return this._iconObj.createShadow()
  },

  _addChild: function (new1, isNotificationFromChild) {
    this._iconNeedsUpdate = true

    this._boundsNeedUpdate = true
    this._setClusterCenter(new1)

    if (new1 instanceof MarkerCluster) {
      if (!isNotificationFromChild) {
        this._childClusters.push(new1)
        new1.__parent = this
      }
      this._childCount += new1._childCount
    }
    else {
      if (!isNotificationFromChild) {
        this._markers.push(new1)
      }
      this._childCount++
    }

    if (this.__parent) {
      this.__parent._addChild(new1, true)
    }
  },

  /**
   * Makes sure the cluster center is set. If not, uses the child center if it is a cluster, or the marker position.
   * @param child MarkerCluster|Marker that will be used as cluster center if not defined yet.
   * @private
   */
  _setClusterCenter: function (child) {
    if (!this._cLatLng) {
      // when clustering, take position of the first point as the cluster center
      this._cLatLng = child._cLatLng || child._latlng
    }
  },

  /**
   * Assigns impossible bounding values so that the next extend entirely determines the new bounds.
   * This method avoids having to trash the previous LatLngBounds object and to create a new one, which is much slower for this class.
   * As long as the bounds are not extended, most other methods would probably fail, as they would with bounds initialized but not extended.
   * @private
   */
  _resetBounds: function () {
    const bounds = this._bounds

    if (bounds._southWest) {
      bounds._southWest.lat = Infinity
      bounds._southWest.lng = Infinity
    }
    if (bounds._northEast) {
      bounds._northEast.lat = -Infinity
      bounds._northEast.lng = -Infinity
    }
  },

  _recalculateBounds: function () {
    const markers = this._markers
    const childClusters = this._childClusters
    let latSum = 0,
      lngSum = 0
    const totalCount = this._childCount
    let i, child, childLatLng, childCount

    // Case where all markers are removed from the map and we are left with just an empty _topClusterLevel.
    if (totalCount === 0) {
      return
    }

    // Reset rather than creating a new object, for performance.
    this._resetBounds()

    // Child markers.
    for (i = 0; i < markers.length; i++) {
      childLatLng = markers[i]._latlng

      this._bounds.extend(childLatLng)

      latSum += childLatLng.lat
      lngSum += childLatLng.lng
    }

    // Child clusters.
    for (i = 0; i < childClusters.length; i++) {
      child = childClusters[i]

      // Re-compute child bounds and weighted position first if necessary.
      if (child._boundsNeedUpdate) {
        child._recalculateBounds()
      }

      this._bounds.extend(child._bounds)

      childLatLng = child._wLatLng
      childCount = child._childCount

      latSum += childLatLng.lat * childCount
      lngSum += childLatLng.lng * childCount
    }

    this._latlng = this._wLatLng = new LatLng(latSum / totalCount, lngSum / totalCount)

    // Reset dirty flag.
    this._boundsNeedUpdate = false
  },

  // Set our markers position as given and add it to the map
  _addToMap: function (startPos) {
    if (startPos) {
      this._backupLatlng = this._latlng
      this.setLatLng(startPos)
    }
    this._group._featureGroup.addLayer(this)
  },

  _recursivelyAnimateChildrenIn: function (bounds, center, maxZoom) {
    this._recursively(bounds, this._group._map.getMinZoom(), maxZoom - 1,
      function (c) {
        const markers = c._markers
        let i, m
        for (i = markers.length - 1; i >= 0; i--) {
          m = markers[i]

          // Only do it if the icon is still on the map
          if (m._icon) {
            m._setPos(center)
            m.clusterHide()
          }
        }
      },
      function (c) {
        const childClusters = c._childClusters
        let j, cm
        for (j = childClusters.length - 1; j >= 0; j--) {
          cm = childClusters[j]
          if (cm._icon) {
            cm._setPos(center)
            cm.clusterHide()
          }
        }
      },
    )
  },

  _recursivelyAnimateChildrenInAndAddSelfToMap: function (bounds, previousBounds, mapMinZoom, previousZoomLevel, newZoomLevel) {
    this._recursively(bounds, newZoomLevel, mapMinZoom,
      function (c) {
        c._recursivelyAnimateChildrenIn(bounds, c._group._map.latLngToLayerPoint(c.getLatLng()).round(), previousZoomLevel)

        // Animation optimization: Skip animation when zooming a single-parent cluster by one level.
        // For multi-level zooms, we always animate to avoid complexity with depthToAnimateIn interactions.
        // The single-level check ensures _isSingleParent() remains stable throughout the transition.
        if (c._isSingleParent() && previousZoomLevel - 1 === newZoomLevel) {
          c.clusterShow()
          // Remove children immediately as we're replacing them with the parent cluster.
          c._recursivelyRemoveChildrenFromMap(previousBounds, mapMinZoom, previousZoomLevel)
        }
        else {
          c.clusterHide()
        }

        c._addToMap()
      },
    )
  },

  _recursivelyBecomeVisible: function (bounds, zoomLevel) {
    this._recursively(bounds, this._group._map.getMinZoom(), zoomLevel, null, function (c) {
      c.clusterShow()
    })
  },

  _recursivelyAddChildrenToMap: function (startPos, zoomLevel, bounds) {
    this._recursively(bounds, this._group._map.getMinZoom() - 1, zoomLevel,
      function (c) {
        if (zoomLevel === c._zoom) {
          return
        }

        // Add our child markers at startPos (so they can be animated out)
        for (let i = c._markers.length - 1; i >= 0; i--) {
          const nm = c._markers[i]

          if (!bounds.contains(nm._latlng)) {
            continue
          }

          if (startPos) {
            nm._backupLatlng = nm.getLatLng()

            nm.setLatLng(startPos)
            if (nm.clusterHide) {
              nm.clusterHide()
            }
          }

          c._group._featureGroup.addLayer(nm)
        }
      },
      function (c) {
        c._addToMap(startPos)
      },
    )
  },

  _recursivelyRestoreChildPositions: function (zoomLevel) {
    // Fix positions of child markers
    for (let i = this._markers.length - 1; i >= 0; i--) {
      const nm = this._markers[i]
      if (nm._backupLatlng) {
        nm.setLatLng(nm._backupLatlng)
        delete nm._backupLatlng
      }
    }

    if (zoomLevel - 1 === this._zoom) {
      // Reposition child clusters
      for (let j = this._childClusters.length - 1; j >= 0; j--) {
        this._childClusters[j]._restorePosition()
      }
    }
    else {
      for (let k = this._childClusters.length - 1; k >= 0; k--) {
        this._childClusters[k]._recursivelyRestoreChildPositions(zoomLevel)
      }
    }
  },

  _restorePosition: function () {
    if (this._backupLatlng) {
      this.setLatLng(this._backupLatlng)
      delete this._backupLatlng
    }
  },

  // exceptBounds: If set, don't remove any markers/clusters in it
  _recursivelyRemoveChildrenFromMap: function (previousBounds, mapMinZoom, zoomLevel, exceptBounds) {
    let m, i
    this._recursively(previousBounds, mapMinZoom - 1, zoomLevel - 1,
      function (c) {
        // Remove markers at every level
        for (i = c._markers.length - 1; i >= 0; i--) {
          m = c._markers[i]
          if (!exceptBounds || !exceptBounds.contains(m._latlng)) {
            c._group._featureGroup.removeLayer(m)
            if (m.clusterShow) {
              m.clusterShow()
            }
          }
        }
      },
      function (c) {
        // Remove child clusters at just the bottom level
        for (i = c._childClusters.length - 1; i >= 0; i--) {
          m = c._childClusters[i]
          if (!exceptBounds || !exceptBounds.contains(m._latlng)) {
            c._group._featureGroup.removeLayer(m)
            if (m.clusterShow) {
              m.clusterShow()
            }
          }
        }
      },
    )
  },

  // Run the given functions recursively to this and child clusters
  // boundsToApplyTo: a LatLngBounds representing the bounds of what clusters to recurse in to
  // zoomLevelToStart: zoom level to start running functions (inclusive)
  // zoomLevelToStop: zoom level to stop running functions (inclusive)
  // runAtEveryLevel: function that takes an MarkerCluster as an argument that should be applied on every level
  // runAtBottomLevel: function that takes an MarkerCluster as an argument that should be applied at only the bottom level
  _recursively: function (boundsToApplyTo, zoomLevelToStart, zoomLevelToStop, runAtEveryLevel, runAtBottomLevel) {
    const childClusters = this._childClusters,
      zoom = this._zoom
    let i, c

    if (zoomLevelToStart <= zoom) {
      if (runAtEveryLevel) {
        runAtEveryLevel(this)
      }
      if (runAtBottomLevel && zoom === zoomLevelToStop) {
        runAtBottomLevel(this)
      }
    }

    if (zoom < zoomLevelToStart || zoom < zoomLevelToStop) {
      for (i = childClusters.length - 1; i >= 0; i--) {
        c = childClusters[i]
        if (c._boundsNeedUpdate) {
          c._recalculateBounds()
        }
        if (boundsToApplyTo.intersects(c._bounds)) {
          c._recursively(boundsToApplyTo, zoomLevelToStart, zoomLevelToStop, runAtEveryLevel, runAtBottomLevel)
        }
      }
    }
  },

  // Returns true if we are the parent of only one cluster and that cluster is the same as us
  _isSingleParent: function () {
    // Don't need to check this._markers as the rest won't work if there are any
    return this._childClusters.length > 0 && this._childClusters[0]._childCount === this._childCount
  },
})
