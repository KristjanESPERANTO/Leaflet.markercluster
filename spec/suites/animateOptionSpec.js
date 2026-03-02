import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'

import { LatLngBounds, Map } from 'leaflet'
import { MarkerCluster, MarkerClusterGroup, MarkerClusterNonAnimated } from '../../dist/leaflet.markercluster.js'

describe('animate option', function () {
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
  it('hooks animated methods version by default', function () {
    // Need to add to map so that we have the top cluster level created.
    group = new MarkerClusterGroup().addTo(map)

    let withAnimation = MarkerClusterGroup.prototype._withAnimation

    // MCG animated methods.
    assert.strictEqual(group._animationStart, withAnimation._animationStart)
    assert.strictEqual(group._animationZoomIn, withAnimation._animationZoomIn)
    assert.strictEqual(group._animationZoomOut, withAnimation._animationZoomOut)
    assert.strictEqual(group._animationAddLayer, withAnimation._animationAddLayer)

    // MarkerCluster spiderfy animated methods
    const cluster = group._topClusterLevel

    withAnimation = MarkerCluster.prototype

    assert.strictEqual(cluster._animationSpiderfy, withAnimation._animationSpiderfy)
    assert.strictEqual(cluster._animationUnspiderfy, withAnimation._animationUnspiderfy)
  })

  it('hooks non-animated methods version when set to false', function () {
    // Need to add to map so that we have the top cluster level created.
    group = new MarkerClusterGroup({ animate: false }).addTo(map)

    let noAnimation = MarkerClusterGroup.prototype._noAnimation

    // MCG non-animated methods - check they're the same type/name, not reference
    assert.strictEqual(group._animationStart.name || group._animationStart.toString(), noAnimation._animationStart.name || noAnimation._animationStart.toString())
    assert.strictEqual(group._animationZoomIn, noAnimation._animationZoomIn)
    assert.strictEqual(group._animationZoomOut, noAnimation._animationZoomOut)
    assert.strictEqual(group._animationAddLayer, noAnimation._animationAddLayer)

    // MarkerCluster spiderfy non-animated methods
    const cluster = group._topClusterLevel

    noAnimation = MarkerClusterNonAnimated.prototype

    assert.strictEqual(cluster._animationSpiderfy, noAnimation._animationSpiderfy)
    assert.strictEqual(cluster._animationUnspiderfy, noAnimation._animationUnspiderfy)
  })
})
