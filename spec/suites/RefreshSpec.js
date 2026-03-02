import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import sinon from 'sinon'

/* eslint-disable no-unused-vars */
import { DivIcon, LatLngBounds, LayerGroup, Map, Marker } from 'leaflet'
import { MarkerCluster, MarkerClusterGroup } from '../../dist/leaflet.markercluster.js'

describe('refreshClusters', function () {
  /////////////////////////////
  // SETUP FOR EACH TEST
  /////////////////////////////
  let clock, div, map, group

  beforeEach(function () {
    clock = sinon.useFakeTimers()

    div = document.createElement('div')
    div.style.width = '200px'
    div.style.height = '200px'
    document.body.appendChild(div)

    map = new Map(div, { maxZoom: 18, trackResize: false })

    // Corresponds to zoom level 8 for the above div dimensions.
    map.fitBounds(new LatLngBounds([
      [1, 1],
      [2, 2],
    ]))
  })

  afterEach(function () {
    if (group instanceof MarkerClusterGroup) {
      group.clearLayers()
      map.removeLayer(group)
    }

    map.remove()
    div.remove()
    clock.restore()

    clock = div = map = group = null
  })

  function getClusterAtZoom(marker, zoom) {
    let parent = marker.__parent

    while (parent && parent._zoom !== zoom) {
      parent = parent.__parent
    }

    return parent
  }

  function setMapView() {
    // Now look at the markers to force cluster icons drawing.
    // Corresponds to zoom level 8 for the above div dimensions.
    map.fitBounds(new LatLngBounds([
      [1, 1],
      [2, 2],
    ]))
  }

  /////////////////////////////
  // TESTS
  /////////////////////////////
  it('flags all non-visible parent clusters of a given marker', function () {
    group = new MarkerClusterGroup().addTo(map)

    const marker1 = new Marker([1.5, 1.5]).addTo(group),
      marker2 = new Marker([1.5, 1.5]).addTo(group) // Needed to force a cluster.

    setMapView()

    const marker1cluster10 = getClusterAtZoom(marker1, 10),
      marker1cluster2 = getClusterAtZoom(marker1, 2),
      marker1cluster5 = getClusterAtZoom(marker1, 5)

    // First go to some zoom levels so that Leaflet initializes clusters icons.
    assert.ok(marker1cluster10._iconNeedsUpdate)
    map.setZoom(10, { animate: false })
    assert.ok(!(marker1cluster10._iconNeedsUpdate))

    assert.ok(marker1cluster2._iconNeedsUpdate)
    map.setZoom(2, { animate: false })
    assert.ok(!(marker1cluster2._iconNeedsUpdate))

    // Finish on an intermediate zoom level.
    assert.ok(marker1cluster5._iconNeedsUpdate)
    map.setZoom(5, { animate: false })
    assert.ok(!(marker1cluster5._iconNeedsUpdate))

    // Run any animation.
    clock.tick(1000)

    // Then request clusters refresh.
    // No need to actually modify the marker.
    group.refreshClusters(marker1)

    // Now check that non-visible clusters are flagged as "dirty".
    assert.ok(marker1cluster10._iconNeedsUpdate)
    assert.ok(marker1cluster2._iconNeedsUpdate)

    // Also check that visible clusters are "un-flagged" since they should be re-drawn.
    assert.ok(!(marker1cluster5._iconNeedsUpdate))
  })

  it('re-draws visible clusters', function () {
    group = new MarkerClusterGroup({
      iconCreateFunction: function (cluster) {
        const markers = cluster.getAllChildMarkers()

        for (const i in markers) {
          if (markers[i].changed) {
            return new DivIcon({
              className: 'changed',
            })
          }
        }
        return new DivIcon({
          className: 'original',
        })
      },
    }).addTo(map)

    const marker1 = new Marker([1.5, 1.5]).addTo(group),
      marker2 = new Marker([1.5, 1.5]).addTo(group) // Needed to force a cluster.

    setMapView()

    const marker1cluster9 = getClusterAtZoom(marker1, 9)

    // First go to some zoom levels so that Leaflet initializes clusters icons.
    assert.ok(marker1cluster9._iconNeedsUpdate)
    map.setZoom(9, { animate: false })
    assert.ok(!(marker1cluster9._iconNeedsUpdate))

    assert.ok(marker1cluster9._icon.className.includes('original'))
    assert.ok(!marker1cluster9._icon.className.includes('changed'))

    // Run any animation.
    clock.tick(1000)

    // Alter the marker.
    marker1.changed = true

    // Then request clusters refresh.
    group.refreshClusters(marker1)

    // Now check that visible clusters icon is re-drawn.
    assert.ok(marker1cluster9._icon.className.includes('changed'))
    assert.ok(!marker1cluster9._icon.className.includes('original'))
  })

  // Shared code for the 2 below tests
  function iconCreateFunction(cluster) {
    const markers = cluster.getAllChildMarkers()

    for (const i in markers) {
      if (markers[i].changed) {
        return new DivIcon({
          className: 'changed',
        })
      }
    }
    return new DivIcon({
      className: 'original',
    })
  }

  it('re-draws markers in singleMarkerMode', function () {
    group = new MarkerClusterGroup({
      singleMarkerMode: true,
      iconCreateFunction: iconCreateFunction,
    }).addTo(map)

    const marker1 = new Marker([1.5, 1.5]).addTo(group)

    setMapView()

    assert.ok(marker1._icon.className.includes('original'))

    // Alter the marker.
    marker1.changed = true

    // Then request clusters refresh.
    group.refreshClusters(marker1)

    assert.ok(marker1._icon.className.includes('changed'))
    assert.ok(!marker1._icon.className.includes('original'))
  })

  it('does not modify markers that do not belong to the current group (in singleMarkerMode)', function () {
    group = new MarkerClusterGroup({
      singleMarkerMode: true,
      iconCreateFunction: iconCreateFunction,
    }).addTo(map)

    const marker1 = new Marker([1.5, 1.5]).addTo(group)

    const marker2 = new Marker([1.5, 1.5])
    marker2.setIcon(iconCreateFunction({
      getAllChildMarkers: function () {
        return marker2
      },
    }))
    marker2.addTo(map)

    setMapView()

    assert.ok(marker1._icon.className.includes('original'))
    assert.ok(marker2._icon.className.includes('original'))

    // Alter the markers.
    marker1.changed = true
    marker2.changed = true

    // Then request clusters refresh.
    group.refreshClusters([marker1, marker2])

    assert.ok(marker1._icon.className.includes('changed'))
    assert.ok(!marker1._icon.className.includes('original'))

    assert.ok(marker2._icon.className.includes('original'))
    assert.ok(!marker2._icon.className.includes('changed'))
  })

  // Shared code for below tests.
  const marker1 = new Marker([1.5, 1.5]),
    marker2 = new Marker([1.5, 1.5]), // Needed to force a cluster.
    marker3 = new Marker([1.1, 1.1]),
    marker4 = new Marker([1.1, 1.1]), // Needed to force a cluster.
    marker5 = new Marker([1.9, 1.9]),
    marker6 = new Marker([1.9, 1.9]) // Needed to force a cluster.
  let marker1cluster8,
    marker1cluster3,
    marker1cluster5,
    marker3cluster8,
    marker3cluster3,
    marker3cluster5,
    marker5cluster8,
    marker5cluster3,
    marker5cluster5

  function init3clusterBranches() {
    group = new MarkerClusterGroup({
      maxClusterRadius: 2, // Make sure we keep distinct clusters.
    }).addTo(map)

    // Populate Marker Cluster Group.
    marker1.addTo(group)
    marker2.addTo(group)
    marker3.addTo(group)
    marker4.addTo(group)
    marker5.addTo(group)
    marker6.addTo(group)

    setMapView()

    marker1cluster8 = getClusterAtZoom(marker1, 8)
    marker1cluster3 = getClusterAtZoom(marker1, 3)
    marker1cluster5 = getClusterAtZoom(marker1, 5)
    marker3cluster8 = getClusterAtZoom(marker3, 8)
    marker3cluster3 = getClusterAtZoom(marker3, 3)
    marker3cluster5 = getClusterAtZoom(marker3, 5)
    marker5cluster8 = getClusterAtZoom(marker5, 8)
    marker5cluster3 = getClusterAtZoom(marker5, 3)
    marker5cluster5 = getClusterAtZoom(marker5, 5)

    // Make sure we have 3 distinct clusters up to zoom level Z (let's choose Z = 3)
    assert.strictEqual(marker1cluster3._childCount, 2)
    assert.strictEqual(marker3cluster3._childCount, 2)
    assert.strictEqual(marker5cluster3._childCount, 2)

    // First go to some zoom levels so that Leaflet initializes clusters icons.
    assert.ok(!(marker1cluster8._iconNeedsUpdate))
    assert.ok(!(marker3cluster8._iconNeedsUpdate))
    assert.ok(!(marker5cluster8._iconNeedsUpdate))

    assert.ok(marker1cluster3._iconNeedsUpdate)
    assert.ok(marker3cluster3._iconNeedsUpdate)
    assert.ok(marker5cluster3._iconNeedsUpdate)
    map.setZoom(3, { animate: false })
    assert.ok(!(marker1cluster3._iconNeedsUpdate))
    assert.ok(!(marker3cluster3._iconNeedsUpdate))
    assert.ok(!(marker5cluster3._iconNeedsUpdate))

    // Finish on an intermediate zoom level.
    assert.ok(marker1cluster5._iconNeedsUpdate)
    assert.ok(marker3cluster5._iconNeedsUpdate)
    assert.ok(marker5cluster5._iconNeedsUpdate)
    map.setZoom(5, { animate: false })
    assert.ok(!(marker1cluster5._iconNeedsUpdate))
    assert.ok(!(marker3cluster5._iconNeedsUpdate))
    assert.ok(!(marker5cluster5._iconNeedsUpdate))

    // Run any animation.
    clock.tick(1000)

    // Ready to refresh clusters with method of choice and assess result.
  }

  it('does not flag clusters of other markers', function () {
    init3clusterBranches()

    // Then request clusters refresh.
    // No need to actually modify the marker.
    group.refreshClusters(marker1)

    // Now check that non-visible clusters are flagged as "dirty".
    assert.ok(marker1cluster8._iconNeedsUpdate)
    assert.ok(marker1cluster3._iconNeedsUpdate)

    // Finally check that non-involved clusters are not "dirty".
    assert.ok(!(marker3cluster8._iconNeedsUpdate))
    assert.ok(!(marker3cluster3._iconNeedsUpdate))

    assert.ok(!(marker5cluster8._iconNeedsUpdate))
    assert.ok(!(marker5cluster3._iconNeedsUpdate))
  })

  it('processes itself when no argument is passed', function () {
    init3clusterBranches()

    // Then request clusters refresh.
    // No need to actually modify the marker.
    group.refreshClusters()

    // Now check that non-visible clusters are flagged as "dirty".
    assert.ok(marker1cluster8._iconNeedsUpdate)
    assert.ok(marker1cluster3._iconNeedsUpdate)

    assert.ok(marker3cluster8._iconNeedsUpdate)
    assert.ok(marker3cluster3._iconNeedsUpdate)

    assert.ok(marker5cluster8._iconNeedsUpdate)
    assert.ok(marker5cluster3._iconNeedsUpdate)
  })

  it('accepts an array of markers', function () {
    init3clusterBranches()

    // Then request clusters refresh.
    // No need to actually modify the markers.
    group.refreshClusters([marker1, marker5])
    // Clusters of marker3 and 4 shall not be flagged.

    // Now check that non-visible clusters are flagged as "dirty".
    assert.ok(marker1cluster8._iconNeedsUpdate)
    assert.ok(marker1cluster3._iconNeedsUpdate)

    assert.ok(marker5cluster8._iconNeedsUpdate)
    assert.ok(marker5cluster3._iconNeedsUpdate)

    // Clusters of marker3 and 4 shall not be flagged.
    assert.ok(!(marker3cluster8._iconNeedsUpdate))
    assert.ok(!(marker3cluster3._iconNeedsUpdate))
  })

  it('accepts a mapping of markers', function () {
    init3clusterBranches()

    // Then request clusters refresh.
    // No need to actually modify the markers.
    group.refreshClusters({
      id1: marker1,
      id2: marker5,
    }) // Clusters of marker3 and 4 shall not be flagged.

    // Now check that non-visible clusters are flagged as "dirty".
    assert.ok(marker1cluster8._iconNeedsUpdate)
    assert.ok(marker1cluster3._iconNeedsUpdate)

    assert.ok(marker5cluster8._iconNeedsUpdate)
    assert.ok(marker5cluster3._iconNeedsUpdate)

    // Clusters of marker3 and 4 shall not be flagged.
    assert.ok(!(marker3cluster8._iconNeedsUpdate))
    assert.ok(!(marker3cluster3._iconNeedsUpdate))
  })

  it('accepts an LayerGroup', function () {
    init3clusterBranches()

    // Then request clusters refresh.
    // No need to actually modify the markers.
    const layerGroup = new LayerGroup([marker1, marker5])
    group.refreshClusters(layerGroup)
    // Clusters of marker3 and 4 shall not be flagged.

    // Now check that non-visible clusters are flagged as "dirty".
    assert.ok(marker1cluster8._iconNeedsUpdate)
    assert.ok(marker1cluster3._iconNeedsUpdate)

    assert.ok(marker5cluster8._iconNeedsUpdate)
    assert.ok(marker5cluster3._iconNeedsUpdate)

    // Clusters of marker3 and 4 shall not be flagged.
    assert.ok(!(marker3cluster8._iconNeedsUpdate))
    assert.ok(!(marker3cluster3._iconNeedsUpdate))
  })

  it('accepts an MarkerCluster', function () {
    init3clusterBranches()

    // Then request clusters refresh.
    // No need to actually modify the markers.
    group.refreshClusters(marker1cluster8)
    // Clusters of marker3, 4, 5 and 6 shall not be flagged.

    // Now check that non-visible clusters are flagged as "dirty".
    assert.ok(marker1cluster8._iconNeedsUpdate)
    assert.ok(marker1cluster3._iconNeedsUpdate)

    // Clusters of marker3 and 4 shall not be flagged.
    assert.ok(!(marker3cluster8._iconNeedsUpdate))
    assert.ok(!(marker3cluster3._iconNeedsUpdate))

    assert.ok(!(marker5cluster8._iconNeedsUpdate))
    assert.ok(!(marker5cluster3._iconNeedsUpdate))
  })
})
