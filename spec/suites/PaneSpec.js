import { LatLngBounds, Map, Marker } from 'leaflet'
import { MarkerClusterGroup } from 'leaflet.markercluster'

describe('Map pane selection', function () {
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

    // Create map pane
    map.createPane('testPane')

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

    div = map = group = null
  })

  /////////////////////////////
  // TESTS
  /////////////////////////////
  it('recognizes and applies option', function () {
    group = new MarkerClusterGroup({ clusterPane: 'testPane' })

    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])

    group.addLayers([marker, marker2])
    map.addLayer(group)

    expect(map._panes.testPane.childNodes.length).to.equal(1)
  })

  it('defaults to default marker pane', function () {
    group = new MarkerClusterGroup()

    const marker = new Marker([1.5, 1.5])
    const marker2 = new Marker([1.5, 1.5])

    group.addLayers([marker, marker2])
    map.addLayer(group)

    expect(map._panes[Marker.prototype.options.pane].childNodes.length).to.equal(1)
  })
})
