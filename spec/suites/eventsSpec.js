import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'

import { LatLngBounds, Map, Marker, Polygon } from 'leaflet'
import { MarkerCluster, MarkerClusterGroup } from '../../dist/leaflet.markercluster.js'

describe('events', function () {
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
      group.removeLayers(group.getLayers())
      map.removeLayer(group)
    }

    map.remove()
    div.remove()

    div = map = group = null
  })

  /////////////////////////////
  // TESTS
  /////////////////////////////
  it('is fired for a single child marker', function (t) {
    const callback = t.mock.fn()

    group = new MarkerClusterGroup()

    const marker = new Marker([1.5, 1.5])

    group.on('click', callback)
    group.addLayer(marker)
    map.addLayer(group)

    // In Leaflet 1.0.0, event propagation must be explicitly set by 3rd argument.
    marker.fire('click', null, true)

    assert.ok(callback.mock.calls.length > 0)
  })

  it('is fired for a child polygon', function (t) {
    const callback = t.mock.fn()

    group = new MarkerClusterGroup()

    const polygon = new Polygon([[1.5, 1.5], [2.0, 1.5], [2.0, 2.0], [1.5, 2.0]])

    group.on('click', callback)
    group.addLayer(polygon)
    map.addLayer(group)

    polygon.fire('click', null, true)

    assert.ok(callback.mock.calls.length > 0)
  })

  it('is fired for a cluster click', function (t) {
    const callback = t.mock.fn()

    group = new MarkerClusterGroup()

    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])

    group.on('clusterclick', callback)
    group.addLayers([marker, marker2])
    map.addLayer(group)

    const cluster = group.getVisibleParent(marker)
    assert.ok(cluster instanceof MarkerCluster)

    cluster.fire('click', null, true)

    assert.ok(callback.mock.calls.length > 0)
  })

  describe('after being added, removed, re-added from the map', function () {
    it('still fires events for nonpoint data', function (t) {
      const callback = t.mock.fn()

      group = new MarkerClusterGroup()

      const polygon = new Polygon([[1.5, 1.5], [2.0, 1.5], [2.0, 2.0], [1.5, 2.0]])

      group.on('click', callback)
      group.addLayer(polygon)
      map.addLayer(group)
      map.removeLayer(group)
      map.addLayer(group)

      polygon.fire('click', null, true)

      assert.ok(callback.mock.calls.length > 0)
    })

    it('still fires events for point data', function (t) {
      const callback = t.mock.fn()

      group = new MarkerClusterGroup()

      const marker = new Marker([1.5, 1.5])

      group.on('click', callback)
      group.addLayer(marker)
      map.addLayer(group)
      map.removeLayer(group)
      map.addLayer(group)

      marker.fire('click', null, true)

      assert.ok(callback.mock.calls.length > 0)
    })

    it('still fires cluster events', function (t) {
      const callback = t.mock.fn()

      group = new MarkerClusterGroup()

      const marker = new Marker([1.5, 1.5])
      const marker2 = new Marker([1.5, 1.5])

      group.on('clusterclick', callback)
      group.addLayers([marker, marker2])
      map.addLayer(group)

      map.removeLayer(group)
      map.addLayer(group)

      const cluster = group.getVisibleParent(marker)
      assert.ok(cluster instanceof MarkerCluster)

      cluster.fire('click', null, true)

      assert.ok(callback.mock.calls.length > 0)
    })

    it('does not break map events', function (t) {
      const callback = t.mock.fn()

      group = new MarkerClusterGroup()

      map.on('zoomend', callback)
      map.addLayer(group)

      map.removeLayer(group)
      map.addLayer(group)

      map.fire('zoomend')

      assert.ok(callback.mock.calls.length > 0)
    })

    // layeradd
    it('fires layeradd when markers are added while not on the map', function (t) {
      const callback = t.mock.fn()

      group = new MarkerClusterGroup()
      group.on('layeradd', callback)

      const marker = new Marker([1.5, 1.5])
      group.addLayer(marker)

      assert.strictEqual(callback.mock.calls.length, 1)
    })

    it('fires layeradd when vectors are added while not on the map', function (t) {
      const callback = t.mock.fn()

      group = new MarkerClusterGroup()
      group.on('layeradd', callback)

      const polygon = new Polygon([[1.5, 1.5], [2.0, 1.5], [2.0, 2.0], [1.5, 2.0]])
      group.addLayer(polygon)

      assert.strictEqual(callback.mock.calls.length, 1)
    })

    it('fires layeradd when markers are added while on the map', function (t) {
      const callback = t.mock.fn()

      group = new MarkerClusterGroup()
      group.on('layeradd', callback)
      map.addLayer(group)

      const marker = new Marker([1.5, 1.5])
      group.addLayer(marker)

      assert.strictEqual(callback.mock.calls.length, 1)
    })

    it('fires layeradd when vectors are added while on the map', function (t) {
      const callback = t.mock.fn()

      group = new MarkerClusterGroup()
      group.on('layeradd', callback)
      map.addLayer(group)

      const polygon = new Polygon([[1.5, 1.5], [2.0, 1.5], [2.0, 2.0], [1.5, 2.0]])
      group.addLayer(polygon)

      assert.strictEqual(callback.mock.calls.length, 1)
    })

    it('fires layersadd (batch event) when markers are added using addLayers while on the map with chunked loading', function (t) {
      const callback = t.mock.fn()

      group = new MarkerClusterGroup({ chunkedLoading: true })
      group.on('layersadd', callback)
      map.addLayer(group)

      const marker = new Marker([1.5, 1.5])
      group.addLayers([marker])

      assert.strictEqual(callback.mock.calls.length, 1)
      assert.strictEqual(callback.mock.calls[0].arguments[0].layers.length, 1)
    })

    it('fires layersadd (batch event) when vectors are added using addLayers while on the map with chunked loading', function (t) {
      const callback = t.mock.fn()

      group = new MarkerClusterGroup({ chunkedLoading: true })
      group.on('layersadd', callback)
      map.addLayer(group)

      const polygon = new Polygon([[1.5, 1.5], [2.0, 1.5], [2.0, 2.0], [1.5, 2.0]])
      group.addLayers([polygon])

      assert.strictEqual(callback.mock.calls.length, 1)
      assert.strictEqual(callback.mock.calls[0].arguments[0].layers.length, 1)
    })

    // layerremove
    it('fires layerremove when a marker is removed while not on the map', function (t) {
      const callback = t.mock.fn()

      group = new MarkerClusterGroup()
      group.on('layerremove', callback)

      const marker = new Marker([1.5, 1.5])
      group.addLayer(marker)
      group.removeLayer(marker)

      assert.strictEqual(callback.mock.calls.length, 1)
    })

    it('fires layerremove when a vector is removed while not on the map', function (t) {
      const callback = t.mock.fn()

      group = new MarkerClusterGroup()
      group.on('layerremove', callback)

      const polygon = new Polygon([[1.5, 1.5], [2.0, 1.5], [2.0, 2.0], [1.5, 2.0]])
      group.addLayer(polygon)
      group.removeLayer(polygon)

      assert.strictEqual(callback.mock.calls.length, 1)
    })

    it('fires layerremove when a marker is removed while on the map', function (t) {
      const callback = t.mock.fn()

      group = new MarkerClusterGroup()
      group.on('layerremove', callback)
      map.addLayer(group)

      const marker = new Marker([1.5, 1.5])
      group.addLayer(marker)
      group.removeLayer(marker)

      assert.strictEqual(callback.mock.calls.length, 1)
    })

    it('fires layerremove when a vector is removed while on the map', function (t) {
      const callback = t.mock.fn()

      group = new MarkerClusterGroup()
      group.on('layerremove', callback)
      map.addLayer(group)

      const polygon = new Polygon([[1.5, 1.5], [2.0, 1.5], [2.0, 2.0], [1.5, 2.0]])
      group.addLayer(polygon)
      group.removeLayer(polygon)

      assert.strictEqual(callback.mock.calls.length, 1)
    })

    it('fires layerremove when a marker is removed using removeLayers while on the map with chunked loading', function (t) {
      const callback = t.mock.fn()

      group = new MarkerClusterGroup({ chunkedLoading: true })
      group.on('layerremove', callback)
      map.addLayer(group)

      const marker = new Marker([1.5, 1.5])
      group.addLayers([marker])
      group.removeLayers([marker])

      assert.strictEqual(callback.mock.calls.length, 1)
    })

    it('fires layerremove when a vector is removed using removeLayers while on the map with chunked loading', function (t) {
      const callback = t.mock.fn()

      group = new MarkerClusterGroup({ chunkedLoading: true })
      group.on('layerremove', callback)
      map.addLayer(group)

      const polygon = new Polygon([[1.5, 1.5], [2.0, 1.5], [2.0, 2.0], [1.5, 2.0]])
      group.addLayers([polygon])
      group.removeLayers([polygon])

      assert.strictEqual(callback.mock.calls.length, 1)
    })

    it('fires layerremove when a marker is removed using removeLayers while not on the map with chunked loading', function (t) {
      const callback = t.mock.fn()

      group = new MarkerClusterGroup({ chunkedLoading: true })
      group.on('layerremove', callback)

      const marker = new Marker([1.5, 1.5])
      group.addLayers([marker])
      group.removeLayers([marker])

      assert.strictEqual(callback.mock.calls.length, 1)
    })

    it('fires layerremove when a vector is removed using removeLayers while not on the map with chunked loading', function (t) {
      const callback = t.mock.fn()

      group = new MarkerClusterGroup({ chunkedLoading: true })
      group.on('layerremove', callback)

      const polygon = new Polygon([[1.5, 1.5], [2.0, 1.5], [2.0, 2.0], [1.5, 2.0]])
      group.addLayers([polygon])
      group.removeLayers([polygon])

      assert.strictEqual(callback.mock.calls.length, 1)
    })
  })

  /*
  //No normal events can be fired by a clustered marker, so probably don't need this.
  it('is fired for a clustered child marker', function(t) {
    let callback = t.mock.fn();

    group = new MarkerClusterGroup();

    let marker = new Marker([1.5, 1.5]);
    let marker2 = new Marker([1.5, 1.5]);

    group.on('click', callback);
    group.addLayers([marker, marker2]);
    map.addLayer(group);

    marker.fire('click');

    assert.ok(callback.mock.calls.length > 0);
  });
  */
})
