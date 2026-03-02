import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import sinon from 'sinon'

import { CircleMarker, LatLngBounds, Map } from 'leaflet'
import { MarkerClusterGroup } from '../../dist/leaflet.markercluster.js'

describe('support for CircleMarker elements', function () {
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

  /////////////////////////////
  // TESTS
  /////////////////////////////
  it('appears when added to the group before the group is added to the map', function () {
    group = new MarkerClusterGroup()

    const marker = new CircleMarker([1.5, 1.5])

    group.addLayer(marker)
    map.addLayer(group)

    // Leaflet 1.0.0 now uses an intermediate Renderer.
    // marker > _path > _rootGroup (g) > _container (svg) > pane (div)
    assert.notStrictEqual(marker._path.parentNode.parentNode, undefined)
    assert.strictEqual(marker._path.parentNode.parentNode.parentNode, map.getPane('overlayPane'))

    clock.tick(1000)
  })

  it('appears when added to the group after the group is added to the map', function () {
    group = new MarkerClusterGroup()

    const marker = new CircleMarker([1.5, 1.5])

    group.addLayer(marker)
    map.addLayer(group)

    assert.notStrictEqual(marker._path.parentNode.parentNode, undefined)
    assert.strictEqual(marker._path.parentNode.parentNode.parentNode, map.getPane('overlayPane'))

    clock.tick(1000)
  })

  it('appears animated when added to the group after the group is added to the map', function () {
    group = new MarkerClusterGroup({ animateAddingMarkers: true })

    const marker = new CircleMarker([1.5, 1.5])
    const marker2 = new CircleMarker([1.5, 1.5])

    map.addLayer(group)
    group.addLayer(marker)
    group.addLayer(marker2)

    assert.strictEqual(marker._path.parentNode.parentNode.parentNode, map.getPane('overlayPane'))
    assert.strictEqual(marker2._path.parentNode.parentNode.parentNode, map.getPane('overlayPane'))

    clock.tick(1000)

    assert.strictEqual(marker._path.parentNode, null)
    assert.strictEqual(marker2._path.parentNode, null)
  })

  it('creates a cluster when 2 overlapping markers are added before the group is added to the map', function () {
    group = new MarkerClusterGroup()

    const marker = new CircleMarker([1.5, 1.5])
    const marker2 = new CircleMarker([1.5, 1.5])

    group.addLayers([marker, marker2])
    map.addLayer(group)

    assert.strictEqual(marker._path, undefined)
    assert.strictEqual(marker2._path, undefined)

    assert.strictEqual(map._panes.markerPane.childNodes.length, 1)

    clock.tick(1000)
  })

  it('creates a cluster when 2 overlapping markers are added after the group is added to the map', function () {
    group = new MarkerClusterGroup()

    const marker = new CircleMarker([1.5, 1.5])
    const marker2 = new CircleMarker([1.5, 1.5])

    map.addLayer(group)
    group.addLayer(marker)
    group.addLayer(marker2)

    assert.strictEqual(marker._path.parentNode, null) // Removed then re-added, so null
    assert.strictEqual(marker2._path, undefined)

    assert.strictEqual(map._panes.markerPane.childNodes.length, 1)

    clock.tick(1000)
  })

  it('disappears when removed from the group', function () {
    group = new MarkerClusterGroup()

    const marker = new CircleMarker([1.5, 1.5])

    group.addLayer(marker)
    map.addLayer(group)

    assert.notStrictEqual(marker._path.parentNode, undefined)
    assert.strictEqual(marker._path.parentNode.parentNode.parentNode, map.getPane('overlayPane'))

    group.removeLayer(marker)

    assert.strictEqual(marker._path.parentNode, null)

    clock.tick(1000)
  })
})
