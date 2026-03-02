import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'

import { LatLngBounds, Map, Marker } from 'leaflet'
import { MarkerClusterGroup } from '../../dist/leaflet.markercluster.js'

describe('non-integer min/max zoom', function () {
  /////////////////////////////
  // SETUP FOR EACH TEST
  /////////////////////////////
  let map, div

  beforeEach(function () {
    div = document.createElement('div')
    div.style.width = '200px'
    div.style.height = '200px'
    document.body.appendChild(div)

    map = new Map(div, { minZoom: 0.5, maxZoom: 18.5, trackResize: false })

    map.fitBounds(new LatLngBounds([
      [1, 1],
      [2, 2],
    ]))
  })

  afterEach(function () {
    map.remove()
    document.body.removeChild(div)
  })

  /////////////////////////////
  // TESTS
  /////////////////////////////
  it('dont break adding and removing markers', function () {
    const group = new MarkerClusterGroup()
    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])
    const marker3 = new Marker([1.5, 1.5])

    group.addLayer(marker)
    group.addLayer(marker2)
    map.addLayer(group)

    group.addLayer(marker3)

    assert.strictEqual(marker._icon, undefined)
    assert.strictEqual(marker2._icon, undefined)
    assert.strictEqual(marker3._icon, undefined)

    assert.strictEqual(map._panes.markerPane.childNodes.length, 1)

    group.removeLayer(marker2)
  })
})
