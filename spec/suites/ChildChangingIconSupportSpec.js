import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'

import { DivIcon, LatLngBounds, Map, Marker } from 'leaflet'
import { MarkerClusterGroup } from '../../dist/leaflet.markercluster.js'

describe('support child markers changing icon', function () {
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
  it('child markers end up with the right icon after becoming unclustered', function () {
    const group = new MarkerClusterGroup()
    const marker = new Marker([1.5, 1.5], { icon: new DivIcon({ html: 'Inner1Text' }) })
    const marker2 = new Marker([1.5, 1.5])

    map.addLayer(group)
    group.addLayer(marker)

    assert.strictEqual(marker._icon.parentNode, map._panes.markerPane)
    assert.ok(marker._icon.innerHTML.includes('Inner1Text'))

    group.addLayer(marker2)

    assert.strictEqual(marker._icon, null) // Have been removed from the map

    marker.setIcon(new DivIcon({ html: 'Inner2Text' })) // Change the icon

    group.removeLayer(marker2) // Remove the other marker, so we'll become unclustered

    assert.ok(marker._icon.innerHTML.includes('Inner2Text'))
  })
})
