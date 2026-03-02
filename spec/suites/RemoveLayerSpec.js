import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import sinon from 'sinon'

import { LatLngBounds, LayerGroup, Map, Marker } from 'leaflet'
import { MarkerClusterGroup } from '../../dist/leaflet.markercluster.js'

describe('removeLayer', function () {
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
  it('removes a layer that was added to it', function () {
    group = new MarkerClusterGroup()

    const marker = new Marker([1.5, 1.5])

    map.addLayer(group)

    group.addLayer(marker)

    assert.strictEqual(marker._icon.parentNode, map._panes.markerPane)

    group.removeLayer(marker)

    assert.strictEqual(marker._icon, null)
  })

  it('doesnt remove a layer not added to it', function () {
    group = new MarkerClusterGroup()

    const marker = new Marker([1.5, 1.5])

    map.addLayer(group)

    map.addLayer(marker)

    assert.strictEqual(marker._icon.parentNode, map._panes.markerPane)

    group.removeLayer(marker)

    assert.strictEqual(marker._icon.parentNode, map._panes.markerPane)
  })

  it('removes a layer that was added to it (before being on the map) that is shown in a cluster', function () {
    group = new MarkerClusterGroup()

    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])

    group.addLayers([marker, marker2])
    map.addLayer(group)

    group.removeLayer(marker)

    assert.strictEqual(marker._icon, undefined)
    assert.strictEqual(marker2._icon.parentNode, map._panes.markerPane)
  })

  it('removes a layer that was added to it (after being on the map) that is shown in a cluster', function () {
    group = new MarkerClusterGroup()

    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])

    map.addLayer(group)
    group.addLayer(marker)
    group.addLayer(marker2)

    group.removeLayer(marker)

    assert.strictEqual(marker._icon, null)
    assert.strictEqual(marker2._icon.parentNode, map._panes.markerPane)
  })

  it('removes a layer that was added to it (before being on the map) that is individually', function () {
    group = new MarkerClusterGroup()

    const marker = new Marker([1, 1.5])
    const marker2 = new Marker([3, 1.5])

    map.addLayer(group)
    group.addLayer(marker)
    group.addLayer(marker2)

    assert.strictEqual(marker._icon.parentNode, map._panes.markerPane)
    assert.strictEqual(marker2._icon.parentNode, map._panes.markerPane)

    group.removeLayer(marker)

    assert.strictEqual(marker._icon, null)
    assert.strictEqual(marker2._icon.parentNode, map._panes.markerPane)
  })

  it('removes a layer (with animation) that was added to it (after being on the map) that is shown in a cluster', function () {
    group = new MarkerClusterGroup({ animateAddingMarkers: true })

    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])

    map.addLayer(group)
    group.addLayer(marker)
    group.addLayer(marker2)

    // Run the the animation
    clock.tick(1000)

    assert.strictEqual(marker._icon, null)
    assert.strictEqual(marker2._icon, null)

    group.removeLayer(marker)

    // Run the the animation
    clock.tick(1000)

    assert.strictEqual(marker._icon, null)
    assert.strictEqual(marker2._icon.parentNode, map._panes.markerPane)
  })

  it('removes the layers that are in the given LayerGroup', function () {
    group = new MarkerClusterGroup()

    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])

    map.addLayer(group)
    group.addLayers([marker, marker2])

    const layer = new LayerGroup()
    layer.addLayer(marker2)
    group.removeLayer(layer)

    assert.notStrictEqual(marker._icon, undefined)
    assert.strictEqual(marker2._icon, undefined)
  })

  it('removes the layers that are in the given LayerGroup when not on the map', function () {
    group = new MarkerClusterGroup()

    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])

    group.addLayers([marker, marker2])

    const layer = new LayerGroup()
    layer.addLayer(marker2)
    group.removeLayer(layer)

    assert.ok(group.hasLayer(marker))
    assert.ok(!(group.hasLayer(marker2)))
  })

  it('passes control to removeLayers when marker is a Layer Group', function () {
    group = new MarkerClusterGroup()

    const marker1 = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])

    group.addLayers([marker1, marker2])

    const layer = new LayerGroup()
    layer.addLayer(marker2)
    group.removeLayer(new LayerGroup([layer]))

    assert.ok(group.hasLayer(marker1))
    assert.ok(!(group.hasLayer(marker2)))
  })
})
