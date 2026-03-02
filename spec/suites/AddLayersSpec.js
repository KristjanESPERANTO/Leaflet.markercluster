import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import sinon from 'sinon'

import { LatLngBounds, LayerGroup, Map, Marker } from 'leaflet'
import { MarkerClusterGroup } from '../../dist/leaflet.markercluster.js'

describe('addLayers adding multiple markers', function () {
  /////////////////////////////
  // SETUP FOR EACH TEST
  /////////////////////////////
  let div, map, group

  beforeEach(function () {
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

    div = map = group = null
  })

  /////////////////////////////
  // TESTS
  /////////////////////////////
  it('creates a cluster when 2 overlapping markers are added before the group is added to the map', function () {
    group = new MarkerClusterGroup()

    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])

    group.addLayers([marker, marker2])
    map.addLayer(group)

    assert.strictEqual(marker._icon, undefined)
    assert.strictEqual(marker2._icon, undefined)

    assert.strictEqual(map._panes.markerPane.childNodes.length, 1)
  })

  it('creates a cluster when 2 overlapping markers are added after the group is added to the map', function () {
    group = new MarkerClusterGroup()

    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])

    map.addLayer(group)
    group.addLayers([marker, marker2])

    assert.strictEqual(marker._icon, undefined)
    assert.strictEqual(marker2._icon, undefined)

    assert.strictEqual(map._panes.markerPane.childNodes.length, 1)
  })

  it('creates a cluster and marker when 2 overlapping markers and one non-overlapping are added before the group is added to the map', function () {
    group = new MarkerClusterGroup()

    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])
    const marker3 = new Marker([3.0, 1.5])

    group.addLayers([marker, marker2, marker3])
    map.addLayer(group)

    assert.strictEqual(marker._icon, undefined)
    assert.strictEqual(marker2._icon, undefined)
    assert.strictEqual(marker3._icon.parentNode, map._panes.markerPane)

    assert.strictEqual(map._panes.markerPane.childNodes.length, 2)
  })

  it('creates a cluster and marker when 2 overlapping markers and one non-overlapping are added after the group is added to the map', function () {
    group = new MarkerClusterGroup()

    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])
    const marker3 = new Marker([3.0, 1.5])

    map.addLayer(group)
    group.addLayers([marker, marker2, marker3])

    assert.strictEqual(marker._icon, undefined)
    assert.strictEqual(marker2._icon, undefined)
    assert.strictEqual(marker3._icon.parentNode, map._panes.markerPane)

    assert.strictEqual(map._panes.markerPane.childNodes.length, 2)
  })

  it('handles nested Layer Groups', function () {
    group = new MarkerClusterGroup()

    const marker1 = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])
    const marker3 = new Marker([3.0, 1.5])
    const layerGroup = new LayerGroup([marker1, new LayerGroup([marker2])])

    map.addLayer(group)
    group.addLayers([layerGroup, marker3])

    assert.strictEqual(marker1._icon, undefined)
    assert.strictEqual(marker2._icon, undefined)
    assert.strictEqual(marker3._icon.parentNode, map._panes.markerPane)

    assert.strictEqual(map._panes.markerPane.childNodes.length, 2)
  })

  it('unspiderfies before adding new Marker(s)', function () {
    const clock = sinon.useFakeTimers()

    group = new MarkerClusterGroup()

    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])
    const marker3 = new Marker([1.5, 1.5])

    group.addLayers([marker, marker2])
    map.addLayer(group)

    assert.strictEqual(marker._icon, undefined)
    assert.strictEqual(marker2._icon, undefined)

    group.zoomToShowLayer(marker)
    // Run the the animation
    clock.tick(1000)

    assert.notStrictEqual(marker._icon, undefined)
    assert.notStrictEqual(marker._icon, null)
    assert.notStrictEqual(marker2._icon, undefined)
    assert.notStrictEqual(marker2._icon, null)

    group.addLayers([marker3])
    // Run the the animation
    clock.tick(1000)

    assert.strictEqual(marker._icon, null)
    assert.strictEqual(marker2._icon, null)
    assert.strictEqual(marker3._icon, undefined)
    assert.notStrictEqual(marker3.__parent._icon, undefined)
    assert.notStrictEqual(marker3.__parent._icon, null)
    assert.strictEqual(marker3.__parent._icon.innerText.trim(), '3')
    clock.restore()
  })
})
