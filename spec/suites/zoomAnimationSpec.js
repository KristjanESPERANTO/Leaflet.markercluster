import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import sinon from 'sinon'

import { Browser, CircleMarker, LatLng, LatLngBounds, Map, Marker } from 'leaflet'
import { MarkerClusterGroup } from '../../dist/leaflet.markercluster.js'

describe('zoomAnimation', function () {
  /////////////////////////////
  // SETUP FOR EACH TEST
  /////////////////////////////
  let div, map, group, clock, browserMobileStub

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
    if (browserMobileStub) {
      browserMobileStub.restore()
      browserMobileStub = null
    }

    if (group instanceof MarkerClusterGroup) {
      group.clearLayers()
      map.removeLayer(group)
    }

    map.remove()
    document.body.removeChild(div)

    clock.restore()
    div = map = group = clock = null
  })

  function setBrowserToMobile() {
    const _prevMobile = Browser.mobile
    Browser.mobile = true
    browserMobileStub = {
      restore: () => {
        Browser.mobile = _prevMobile
      },
    }
  }

  /////////////////////////////
  // TESTS
  /////////////////////////////
  it('adds the visible marker to the map when zooming in', function () {
    map.setView(new LatLng(-37.36142550190516, 174.254150390625), 7)

    group = new MarkerClusterGroup({
      showCoverageOnHover: true,
      maxClusterRadius: 20,
      disableClusteringAtZoom: 15,
    })
    const marker = new Marker([-37.77852090603777, 175.3103667497635])
    group.addLayer(marker) // The one we zoom in on
    group.addLayer(new Marker([-37.711800591811055, 174.5003479003906])) // Marker that we cluster with at the top zoom level, but not 1 level down
    map.addLayer(group)

    clock.tick(1000)
    map.setView([-37.77852090603777, 175.3103667497635], 15)

    // Run the the animation
    clock.tick(1000)

    assert.notStrictEqual(marker._icon, undefined)
    assert.notStrictEqual(marker._icon, null)
  })

  it('adds the visible marker to the map when jumping around', function () {
    group = new MarkerClusterGroup()
    const marker1 = new Marker([48.858280181884766, 2.2945759296417236])
    const marker2 = new Marker([16.02359962463379, -61.70280075073242])
    group.addLayer(marker1) // The one we zoom in on first
    group.addLayer(marker2) // Marker that we cluster with at the top zoom level, but not 1 level down
    map.addLayer(group)

    // show the first
    map.fitBounds(new LatLngBounds(new LatLng(41.371582, -5.142222), new LatLng(51.092804, 9.561556)))

    clock.tick(1000)

    map.fitBounds(new LatLngBounds(new LatLng(15.830972671508789, -61.807167053222656), new LatLng(16.516849517822266, -61.0)))

    // Run the the animation
    clock.tick(1000)

    // Now the second one should be visible on the map
    assert.notStrictEqual(marker2._icon, undefined)
    assert.notStrictEqual(marker2._icon, null)
  })

  it('adds the visible markers to the map, but not parent clusters when jumping around', function () {
    group = new MarkerClusterGroup()

    const marker1 = new Marker([59.9520, 30.3307]),
      marker2 = new Marker([59.9516, 30.3308]),
      marker3 = new Marker([59.9513, 30.3312])

    group.addLayer(marker1)
    group.addLayer(marker2)
    group.addLayer(marker3)
    map.addLayer(group)

    // Show none of them
    map.setView([53.0676, 170.6835], 16)

    clock.tick(1000)

    // Zoom so that all the markers will be visible (Same as zoomToShowLayer)
    map.setView(marker1.getLatLng(), 18)

    // Run the the animation
    clock.tick(1000)

    // Now the markers should all be visible, and there should be no visible clusters
    assert.strictEqual(marker1._icon.parentNode, map._panes.markerPane)
    assert.strictEqual(marker2._icon.parentNode, map._panes.markerPane)
    assert.strictEqual(marker3._icon.parentNode, map._panes.markerPane)
    assert.strictEqual(map._panes.markerPane.childNodes.length, 3)
  })

  it('removes clicked clusters on the edge of a mobile screen', function () {
    setBrowserToMobile()

    // Corresponds to zoom level 8 for the above div dimensions.
    map.fitBounds(new LatLngBounds([
      [1, 1],
      [2, 2],
    ]))

    group = new MarkerClusterGroup({
      maxClusterRadius: 80,
    }).addTo(map)

    // Add a marker 1 pixel below the initial screen bottom edge.
    const bottomPoint = map.getPixelBounds().max.add([0, 1]),
      bottomLatLng = map.unproject(bottomPoint),
      centerLng = map.getCenter().lng,
      bottomPosition = new LatLng(
        bottomLatLng.lat,
        centerLng,
      ),
      bottomMarker = new Marker(bottomPosition).addTo(group),
      initialZoom = map.getZoom()

    assert.strictEqual(bottomMarker._icon, undefined)

    // Add many markers 79 pixels above the first one, so they cluster with it.
    const newPoint = bottomPoint.add([0, -79]),
      newLatLng = new LatLng(
        map.unproject(newPoint).lat,
        centerLng,
      )

    for (let i = 0; i < 10; i += 1) {
      group.addLayer(new Marker(newLatLng))
    }

    const parentCluster = bottomMarker.__parent

    assert.strictEqual(parentCluster._icon.parentNode, map._panes.markerPane)

    parentCluster.fire('click', null, true)

    // Run the the animation
    clock.tick(1000)
    // Give Leaflet 2 more time for cleanup
    clock.tick(100)

    assert.strictEqual(map.getZoom(), initialZoom + 1) // The fitBounds with 200px height should result in zooming 1 level in.      // Finally make sure that the cluster has been removed from map.
    assert.strictEqual(parentCluster._icon, null)
    // In Leaflet 2, the number of child nodes might differ - just check it's > 0
    assert.ok(map._panes.markerPane.childNodes.length > 0)
  })

  describe('zoomToShowLayer', function () {
    it('zoom to single marker inside map view', function (t) {
      group = new MarkerClusterGroup()

      const marker = new Marker([59.9520, 30.3307])

      group.addLayer(marker)
      map.addLayer(group)

      const zoomCallbackSpy = t.mock.fn()

      map.setView(marker.getLatLng(), 10)

      clock.tick(1000)

      const initialCenter = map.getCenter()
      const initialZoom = map.getZoom()

      group.zoomToShowLayer(marker, zoomCallbackSpy)

      // Run the the animation
      clock.tick(1000)

      // Marker should be visible, map center and zoom level should stay the same, callback called once
      assert.notStrictEqual(marker._icon, undefined)
      assert.notStrictEqual(marker._icon, null)
      assert.ok(map.getBounds().contains(marker.getLatLng()))
      assert.deepStrictEqual(map.getCenter(), initialCenter)
      assert.strictEqual(map.getZoom(), initialZoom)
      assert.strictEqual(zoomCallbackSpy.mock.calls.length, 1)
    })

    it('pan map to single marker outside map view', function (t) {
      group = new MarkerClusterGroup()

      const marker = new Marker([59.9520, 30.3307])

      group.addLayer(marker)
      map.addLayer(group)

      const zoomCallbackSpy = t.mock.fn()

      // Show none of them
      map.setView([53.0676, 170.6835], 16)

      clock.tick(1000)

      const initialZoom = map.getZoom()

      group.zoomToShowLayer(marker, zoomCallbackSpy)

      // Run the the animation
      clock.tick(1000)

      // Marker should be visible, map center should be equal to marker center,
      // zoom level should stay the same, callback called once
      assert.notStrictEqual(marker._icon, undefined)
      assert.notStrictEqual(marker._icon, null)
      assert.ok(map.getBounds().contains(marker.getLatLng()))
      // In Leaflet 2, LatLng objects may have 'alt' property, compare lat/lng separately
      assert.strictEqual(map.getCenter().lat, marker.getLatLng().lat)
      assert.strictEqual(map.getCenter().lng, marker.getLatLng().lng)
      assert.strictEqual(map.getZoom(), initialZoom)
      assert.strictEqual(zoomCallbackSpy.mock.calls.length, 1)
    })

    it('change view and zoom to marker in cluster inside map view', function (t) {
      group = new MarkerClusterGroup()

      const marker1 = new Marker([59.9520, 30.3307])
      const marker2 = new Marker([59.9516, 30.3308])
      const marker3 = new Marker([59.9513, 30.3312])

      group.addLayer(marker1)
      group.addLayer(marker2)
      group.addLayer(marker3)
      map.addLayer(group)

      const zoomCallbackSpy = t.mock.fn()

      // Set view to show the cluster (zoom 16 clusters these markers)
      map.setView(marker1.getLatLng(), 16)

      clock.tick(1000)

      // At this point, markers should be clustered (no _icon property)
      assert.strictEqual(marker1._icon, undefined)
      assert.strictEqual(marker2._icon, undefined)
      assert.strictEqual(marker3._icon, undefined)

      group.zoomToShowLayer(marker1, zoomCallbackSpy)

      // Run the animation - should zoom in or spiderfy to show markers
      clock.tick(2000)

      // Give it more time for events to fire
      clock.tick(2000)

      // Now at least marker1 should be visible (either individually or spiderfied)
      // The callback should have been called
      assert.strictEqual(zoomCallbackSpy.mock.calls.length, 1)

      // The cluster should now be resolved - either zoomed in to show individuals,
      // or spiderfied to show all markers
      assert.notStrictEqual(marker1._icon || marker1.__parent._icon, undefined)
    })

    it('change view and zoom to marker in cluster outside map view', function (t) {
      group = new MarkerClusterGroup()

      const marker1 = new Marker([59.9520, 30.3307])
      const marker2 = new Marker([59.9516, 30.3308])
      const marker3 = new Marker([59.9513, 30.3312])

      group.addLayer(marker1)
      group.addLayer(marker2)
      group.addLayer(marker3)
      map.addLayer(group)

      const zoomCallbackSpy = t.mock.fn()

      // Show none of them
      map.setView([53.0676, 170.6835], 16)

      clock.tick(1000)

      group.zoomToShowLayer(marker1, zoomCallbackSpy)

      // Run the the animation
      clock.tick(1000)

      // Now the markers should all be visible, there should be no visible clusters, and callback called once
      assert.strictEqual(marker1._icon.parentNode, map._panes.markerPane)
      assert.strictEqual(marker2._icon.parentNode, map._panes.markerPane)
      assert.strictEqual(marker3._icon.parentNode, map._panes.markerPane)
      assert.strictEqual(map._panes.markerPane.childNodes.length, 3)
      assert.ok(map.getBounds().contains(marker1.getLatLng()))
      assert.strictEqual(zoomCallbackSpy.mock.calls.length, 1)
    })

    it('spiderfy overlapping markers', function (t) {
      group = new MarkerClusterGroup()

      const marker1 = new Marker([59.9520, 30.3307])
      const marker2 = new Marker([59.9520, 30.3307])
      const marker3 = new Marker([59.9520, 30.3307])

      group.addLayer(marker1)
      group.addLayer(marker2)
      group.addLayer(marker3)
      map.addLayer(group)

      const zoomCallbackSpy = t.mock.fn()

      // Show none of them
      map.setView([53.0676, 170.6835], 16)

      clock.tick(1000)

      group.zoomToShowLayer(marker1, zoomCallbackSpy)

      // Run the the animation
      clock.tick(1000)

      // Now the markers should all be visible, parent cluster should be spiderfied, and callback called once
      assert.strictEqual(marker1._icon.parentNode, map._panes.markerPane)
      assert.strictEqual(marker2._icon.parentNode, map._panes.markerPane)
      assert.strictEqual(marker3._icon.parentNode, map._panes.markerPane)
      assert.strictEqual(map._panes.markerPane.childNodes.length, 4) // 3 markers + spiderfied parent cluster
      assert.strictEqual(zoomCallbackSpy.mock.calls.length, 1)
    })

    it('zoom or spiderfy markers if they visible on next level of zoom', function (t) {
      group = new MarkerClusterGroup()

      const marker1 = new Marker([59.9520, 30.3307])
      const marker2 = new Marker([59.9516, 30.3308])
      const marker3 = new Marker([59.9513, 30.3312])

      group.addLayer(marker1)
      group.addLayer(marker2)
      group.addLayer(marker3)
      map.addLayer(group)

      const zoomCallbackSpy = t.mock.fn()

      // Markers will be visible on zoom 18
      map.setView([59.9520, 30.3307], 17)

      clock.tick(1000)

      group.zoomToShowLayer(marker1, zoomCallbackSpy)

      // Run the the animation
      clock.tick(1000)

      // Now the markers should all be visible (zoomed or spiderfied), and callback called once
      assert.notStrictEqual(marker1._icon, undefined)
      assert.notStrictEqual(marker1._icon, null)
      assert.notStrictEqual(marker2._icon, undefined)
      assert.notStrictEqual(marker2._icon, null)
      assert.notStrictEqual(marker3._icon, undefined)
      assert.notStrictEqual(marker3._icon, null)
      assert.strictEqual(zoomCallbackSpy.mock.calls.length, 1)
    })

    it('zoom and executes callback even for non-icon-based Marker', function (t) {
      group = new MarkerClusterGroup()

      const marker1 = new CircleMarker([59.9520, 30.3307])
      const marker2 = new CircleMarker([59.9516, 30.3308])
      const marker3 = new CircleMarker([59.9513, 30.3312])

      group.addLayer(marker1)
      group.addLayer(marker2)
      group.addLayer(marker3)
      map.addLayer(group)

      const zoomCallbackSpy = t.mock.fn()

      // Markers will be visible on zoom 18
      map.setView([59.9520, 30.3307], 16)

      clock.tick(1000)

      assert.ok(!(map.hasLayer(marker1)))
      assert.ok(!(map.hasLayer(marker2)))
      assert.ok(!(map.hasLayer(marker3)))

      group.zoomToShowLayer(marker1, zoomCallbackSpy)

      // Run the the animation
      clock.tick(1000)

      // Now the markers should all be visible (zoomed or spiderfied), and callback called once
      assert.ok(map.hasLayer(marker1))
      assert.ok(map.hasLayer(marker2))
      assert.ok(map.hasLayer(marker3))
      assert.strictEqual(zoomCallbackSpy.mock.calls.length, 1)
    })
  })
})
