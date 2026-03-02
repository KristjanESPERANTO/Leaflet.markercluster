import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import sinon from 'sinon'

import { LatLngBounds, LayerGroup, Map, Marker } from 'leaflet'
import { MarkerClusterGroup } from '../../dist/leaflet.markercluster.js'

describe('removeLayers', function () {
  /////////////////////////////
  // SETUP FOR EACH TEST
  /////////////////////////////
  let div, map, group, clock

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
    div = map = group = clock = null
  })

  /////////////////////////////
  // TESTS
  /////////////////////////////
  it('removes all the layer given to it', function () {
    group = new MarkerClusterGroup()

    const markers = [
      new Marker([1.5, 1.5]),
      new Marker([1.5, 1.5]),
      new Marker([1.5, 1.5]),
    ]

    map.addLayer(group)

    group.addLayers(markers)

    group.removeLayers(markers)

    assert.ok(!(group.hasLayer(markers[0])))
    assert.ok(!(group.hasLayer(markers[1])))
    assert.ok(!(group.hasLayer(markers[2])))

    assert.strictEqual(group.getLayers().length, 0)
  })

  it('removes all the layer given to it even though they move', function () {
    group = new MarkerClusterGroup()

    const markers = [
      new Marker([10, 10]),
      new Marker([20, 20]),
      new Marker([30, 30]),
    ]
    const len = markers.length
    map.addLayer(group)

    group.addLayers(markers)

    markers.forEach(function (marker) {
      marker.setLatLng([1.5, 1.5])
      group.removeLayer(marker)
      assert.strictEqual(group.getLayers().length, len - 1)
      group.addLayer(marker)
      assert.strictEqual(group.getLayers().length, len)
    })

    assert.strictEqual(group.getLayers().length, len)
  })

  it('removes all the layer given to it even if the group is not on the map', function () {
    group = new MarkerClusterGroup()

    const markers = [
      new Marker([1.5, 1.5]),
      new Marker([1.5, 1.5]),
      new Marker([1.5, 1.5]),
    ]

    map.addLayer(group)
    group.addLayers(markers)
    map.removeLayer(group)
    group.removeLayers(markers)
    map.addLayer(group)

    assert.ok(!(group.hasLayer(markers[0])))
    assert.ok(!(group.hasLayer(markers[1])))
    assert.ok(!(group.hasLayer(markers[2])))

    assert.strictEqual(group.getLayers().length, 0)
  })

  it('doesnt break if we are spiderfied', function () {
    group = new MarkerClusterGroup()

    const markers = [
      new Marker([1.5, 1.5]),
      new Marker([1.5, 1.5]),
      new Marker([1.5, 1.5]),
    ]

    map.addLayer(group)

    group.addLayers(markers)

    markers[0].__parent.spiderfy()

    // We must wait for the spiderfy animation to timeout
    clock.tick(200)

    group.removeLayers(markers)

    assert.ok(!(group.hasLayer(markers[0])))
    assert.ok(!(group.hasLayer(markers[1])))
    assert.ok(!(group.hasLayer(markers[2])))

    assert.strictEqual(group.getLayers().length, 0)

    group.on('spiderfied', function () {
      assert.strictEqual(group._spiderfied, null)
    })
  })

  it('handles nested Layer Groups', function () {
    group = new MarkerClusterGroup()

    const marker1 = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])
    const marker3 = new Marker([1.5, 1.5])

    map.addLayer(group)

    group.addLayers([marker1, marker2, marker3])

    assert.ok(group.hasLayer(marker1))
    assert.ok(group.hasLayer(marker2))
    assert.ok(group.hasLayer(marker3))

    group.removeLayers([
      marker1,
      new LayerGroup([
        marker2, new LayerGroup([
          marker3,
        ]),
      ]),
    ])

    assert.ok(!(group.hasLayer(marker1)))
    assert.ok(!(group.hasLayer(marker2)))
    assert.ok(!(group.hasLayer(marker3)))

    assert.strictEqual(group.getLayers().length, 0)
  })

  it('chunked loading zoom out', function () {
    // See #743 for more details
    const markers = []

    group = new MarkerClusterGroup({
      chunkedLoading: true, chunkProgress: function () {
        // Before this provoked an "undefined" exception
        map.zoomOut()
        group.removeLayers(markers)
      },
    })

    for (let i = 1; i < 1000; i++) {
      markers.push(new Marker([1.0 + (0.0001 * i), 1.0 + (0.0001 * i)]))
    }

    map.addLayer(group)

    group.addLayers(markers)
  })
})
