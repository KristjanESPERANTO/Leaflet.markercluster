import { LatLngBounds, Map, Marker, Polygon } from 'leaflet'
import { MarkerClusterGroup } from 'leaflet.markercluster'

describe('eachLayer', function () {
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

    const layers = []
    group.eachLayer(function (l) {
      layers.push(l)
    })

    expect(layers.length).to.equal(2)
    expect(layers).to.contain(marker)
    expect(layers).to.contain(polygon)
  })

  it('hits polygons and markers after adding to map', function () {
    const group = new MarkerClusterGroup()
    const polygon = new Polygon([[1.5, 1.5], [2.0, 1.5], [2.0, 2.0], [1.5, 2.0]])
    const marker = new Marker([1.5, 1.5])

    group.addLayers([polygon, marker])
    map.addLayer(group)

    const layers = []
    group.eachLayer(function (l) {
      layers.push(l)
    })

    expect(layers.length).to.equal(2)
    expect(layers).to.contain(marker)
    expect(layers).to.contain(polygon)
  })
})
