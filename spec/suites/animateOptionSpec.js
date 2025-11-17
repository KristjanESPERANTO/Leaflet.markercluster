import { LatLngBounds, Map } from 'leaflet'
import { MarkerCluster, MarkerClusterGroup, MarkerClusterNonAnimated } from 'leaflet.markercluster'

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
    expect(group._animationStart).to.equal(withAnimation._animationStart)
    expect(group._animationZoomIn).to.equal(withAnimation._animationZoomIn)
    expect(group._animationZoomOut).to.equal(withAnimation._animationZoomOut)
    expect(group._animationAddLayer).to.equal(withAnimation._animationAddLayer)

    // MarkerCluster spiderfy animated methods
    const cluster = group._topClusterLevel

    withAnimation = MarkerCluster.prototype

    expect(cluster._animationSpiderfy).to.equal(withAnimation._animationSpiderfy)
    expect(cluster._animationUnspiderfy).to.equal(withAnimation._animationUnspiderfy)
  })

  it('hooks non-animated methods version when set to false', function () {
    // Need to add to map so that we have the top cluster level created.
    group = new MarkerClusterGroup({ animate: false }).addTo(map)

    let noAnimation = MarkerClusterGroup.prototype._noAnimation

    // MCG non-animated methods - check they're the same type/name, not reference
    expect(group._animationStart.name || group._animationStart.toString()).to.equal(noAnimation._animationStart.name || noAnimation._animationStart.toString())
    expect(group._animationZoomIn).to.equal(noAnimation._animationZoomIn)
    expect(group._animationZoomOut).to.equal(noAnimation._animationZoomOut)
    expect(group._animationAddLayer).to.equal(noAnimation._animationAddLayer)

    // MarkerCluster spiderfy non-animated methods
    const cluster = group._topClusterLevel

    noAnimation = MarkerClusterNonAnimated.prototype

    expect(cluster._animationSpiderfy).to.equal(noAnimation._animationSpiderfy)
    expect(cluster._animationUnspiderfy).to.equal(noAnimation._animationUnspiderfy)
  })
})
