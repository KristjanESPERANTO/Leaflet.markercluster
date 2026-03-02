import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'

import { LatLngBounds, Map, Marker, Polygon } from 'leaflet'
import { MarkerClusterGroup } from '../../dist/leaflet.markercluster.js'

describe('getLayers', function () {
  /////////////////////////////
  // SETUP FOR EACH TEST
  /////////////////////////////
  let map, div

  beforeEach(function () {
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

    map = div = null
  })

  /////////////////////////////
  // TESTS
  /////////////////////////////
  it('hits polygons and markers before adding to map', function () {
    const group = new MarkerClusterGroup()
    const polygon = new Polygon([[1.5, 1.5], [2.0, 1.5], [2.0, 2.0], [1.5, 2.0]])
    const marker = new Marker([1.5, 1.5])

    group.addLayers([polygon, marker])

    const layers = group.getLayers()

    assert.strictEqual(layers.length, 2)
    assert.ok(layers.includes(marker))
    assert.ok(layers.includes(polygon))
  })

  it('hits polygons and markers after adding to map', function () {
    const group = new MarkerClusterGroup()
    const polygon = new Polygon([[1.5, 1.5], [2.0, 1.5], [2.0, 2.0], [1.5, 2.0]])
    const marker = new Marker([1.5, 1.5])

    group.addLayers([polygon, marker])
    map.addLayer(group)

    const layers = group.getLayers()

    assert.strictEqual(layers.length, 2)
    assert.ok(layers.includes(marker))
    assert.ok(layers.includes(polygon))
  })

  it('skips markers and polygons removed while not on the map', function () {
    const group = new MarkerClusterGroup()
    const polygon = new Polygon([[1.5, 1.5], [2.0, 1.5], [2.0, 2.0], [1.5, 2.0]])
    const marker = new Marker([1.5, 1.5])

    group.addLayers([polygon, marker])

    map.addLayer(group)
    map.removeLayer(group)

    group.removeLayers([polygon, marker])

    const layers = group.getLayers()

    assert.strictEqual(layers.length, 0)
  })
})
