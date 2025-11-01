import L from 'leaflet'

describe('onAdd', function () {
  /////////////////////////////
  // SETUP FOR EACH TEST
  /////////////////////////////
  let map, div

  beforeEach(function () {
    div = document.createElement('div')
    div.style.width = '200px'
    div.style.height = '200px'
    document.body.appendChild(div)

    map = new L.Map(div, { trackResize: false })

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
  it('throws an error if maxZoom is not specified', function () {
    const group = new L.MarkerClusterGroup()
    const marker = new L.Marker([1.5, 1.5])

    group.addLayer(marker)

    let ex = null
    try {
      map.addLayer(group)
    }
    catch (e) {
      ex = e
    }

    expect(ex).to.not.be(null)
  })

  it('successfully handles removing and re-adding a layer while not on the map', function () {
    map.options.maxZoom = 18
    const group = new L.MarkerClusterGroup()
    const marker = new L.Marker([1.5, 1.5])

    map.addLayer(group)
    group.addLayer(marker)

    map.removeLayer(group)
    group.removeLayer(marker)
    group.addLayer(marker)

    map.addLayer(group)

    expect(map.hasLayer(group)).to.be(true)
    expect(group.hasLayer(marker)).to.be(true)
  })
})
