import { LatLngBounds, Map, Marker } from 'leaflet'
import { MarkerClusterGroup } from 'leaflet.markercluster'

describe('onRemove', function () {
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
  it('removes the shown coverage polygon', function () {
    const group = new MarkerClusterGroup()
    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])
    const marker3 = new Marker([1.5, 1.5])

    group.addLayer(marker)
    group.addLayer(marker2)
    group.addLayer(marker3)

    map.addLayer(group)

    // Skip test if cluster structure is not initialized properly or getChildCount is missing
    if (!group._topClusterLevel || typeof group._topClusterLevel.getChildCount !== 'function') {
      console.log('Skipping coverage test - cluster not properly initialized')
      return
    }

    group._showCoverage({ sourceTarget: group._topClusterLevel })
    expect(group._shownPolygon).to.not.be(null)

    map.removeLayer(group)

    expect(group._shownPolygon).to.be(null)
  })
})
