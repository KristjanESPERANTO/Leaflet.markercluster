import L from 'leaflet'

describe('clearLayer', function () {
  /////////////////////////////
  // SETUP FOR EACH TEST
  /////////////////////////////
  let map, div

  beforeEach(function () {
    div = document.createElement('div')
    div.style.width = '200px'
    div.style.height = '200px'
    document.body.appendChild(div)

    map = new L.Map(div, { maxZoom: 18, trackResize: false })

    map.fitBounds(new L.LatLngBounds([
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
  it('clears everything before adding to map', function () {
    const group = new L.MarkerClusterGroup()
    const polygon = new L.Polygon([[1.5, 1.5], [2.0, 1.5], [2.0, 2.0], [1.5, 2.0]])
    const marker = new L.Marker([1.5, 1.5])

    group.addLayers([polygon, marker])
    group.clearLayers()

    expect(group.hasLayer(polygon)).to.be(false)
    expect(group.hasLayer(marker)).to.be(false)
  })

  it('hits polygons and markers after adding to map', function () {
    const group = new L.MarkerClusterGroup()
    const polygon = new L.Polygon([[1.5, 1.5], [2.0, 1.5], [2.0, 2.0], [1.5, 2.0]])
    const marker = new L.Marker([1.5, 1.5])

    group.addLayers([polygon, marker])
    map.addLayer(group)
    group.clearLayers()

    expect(group.hasLayer(polygon)).to.be(false)
    expect(group.hasLayer(marker)).to.be(false)
  })
})
