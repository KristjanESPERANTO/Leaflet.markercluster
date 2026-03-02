import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import sinon from 'sinon'

import { LatLngBounds, Map, Marker } from 'leaflet'
import { MarkerClusterGroup } from '../../dist/leaflet.markercluster.js'

describe('addLayer adding multiple markers', function () {
  /////////////////////////////
  // SETUP FOR EACH TEST
  /////////////////////////////
  let map, div, clock

  beforeEach(function () {
    clock = sinon.useFakeTimers()

    div = document.createElement('div')
    div.style.width = '200px'
    div.style.height = '200px'
    document.body.appendChild(div)

    map = new Map(div, { maxZoom: 18, trackResize: false })

    map.fitBounds(new LatLngBounds([
      [1, 1],
      [2, 2],
    ]))
  })

  afterEach(function () {
    map.remove()
    document.body.removeChild(div)

    clock.restore()
    map = div = clock = null
  })

  /////////////////////////////
  // TESTS
  /////////////////////////////
  it('creates a cluster when 2 overlapping markers are added before the group is added to the map', function () {
    const group = new MarkerClusterGroup()
    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])

    group.addLayer(marker)
    group.addLayer(marker2)
    map.addLayer(group)

    assert.strictEqual(marker._icon, undefined)
    assert.strictEqual(marker2._icon, undefined)

    assert.strictEqual(map._panes.markerPane.childNodes.length, 1)
  })
  it('creates a cluster when 2 overlapping markers are added after the group is added to the map', function () {
    const group = new MarkerClusterGroup()
    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])

    map.addLayer(group)
    group.addLayer(marker)
    group.addLayer(marker2)

    assert.strictEqual(marker._icon, null) // Null as was added and then removed
    assert.strictEqual(marker2._icon, undefined)

    assert.strictEqual(map._panes.markerPane.childNodes.length, 1)
  })
  it('creates a cluster with an animation when 2 overlapping markers are added after the group is added to the map', function () {
    const group = new MarkerClusterGroup({ animateAddingMarkers: true })
    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])

    map.addLayer(group)
    group.addLayer(marker)
    group.addLayer(marker2)

    assert.strictEqual(marker._icon.parentNode, map._panes.markerPane)
    assert.strictEqual(marker2._icon.parentNode, map._panes.markerPane)

    assert.strictEqual(map._panes.markerPane.childNodes.length, 3)

    // Run the the animation
    clock.tick(1000)

    // Then markers should be removed from map
    assert.strictEqual(marker._icon, null)
    assert.strictEqual(marker2._icon, null)

    assert.strictEqual(map._panes.markerPane.childNodes.length, 1)
  })

  it('creates a cluster and marker when 2 overlapping markers and one non-overlapping are added before the group is added to the map', function () {
    const group = new MarkerClusterGroup()
    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])
    const marker3 = new Marker([3.0, 1.5])

    group.addLayer(marker)
    group.addLayer(marker2)
    group.addLayer(marker3)
    map.addLayer(group)

    assert.strictEqual(marker._icon, undefined)
    assert.strictEqual(marker2._icon, undefined)
    assert.strictEqual(marker3._icon.parentNode, map._panes.markerPane)

    assert.strictEqual(map._panes.markerPane.childNodes.length, 2)
  })
  it('creates a cluster and marker when 2 overlapping markers and one non-overlapping are added after the group is added to the map', function () {
    const group = new MarkerClusterGroup()
    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])
    const marker3 = new Marker([3.0, 1.5])

    map.addLayer(group)
    group.addLayer(marker)
    group.addLayer(marker2)
    group.addLayer(marker3)

    assert.strictEqual(marker._icon, null) // Null as was added and then removed
    assert.strictEqual(marker2._icon, undefined)
    assert.strictEqual(marker3._icon.parentNode, map._panes.markerPane)

    assert.strictEqual(map._panes.markerPane.childNodes.length, 2)
  })

  it('unspiderfies before adding a new Marker', function () {
    const group = new MarkerClusterGroup()

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

    group.addLayer(marker3)
    // Run the the animation
    clock.tick(1000)

    assert.strictEqual(marker._icon, null)
    assert.strictEqual(marker2._icon, null)
    assert.strictEqual(marker3._icon, undefined)
    assert.notStrictEqual(marker3.__parent._icon, undefined)
    assert.notStrictEqual(marker3.__parent._icon, null)
    assert.strictEqual(marker3.__parent._icon.innerText.trim(), '3')
  })
})
